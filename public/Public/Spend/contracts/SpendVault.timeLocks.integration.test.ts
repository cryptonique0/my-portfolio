import { expect } from 'chai';
import { ethers } from 'hardhat';
import { type Signer, type Contract, type ContractTransactionResponse } from 'ethers';

describe('SpendVault Time-Locks Integration Tests', () => {
  let vault: Contract;
  let guardianSBT: Contract;
  let token: Contract;
  let owner: Signer;
  let guardian1: Signer;
  let guardian2: Signer;
  let guardian3: Signer;
  let recipient: Signer;

  const LARGE_TX_THRESHOLD = ethers.parseEther('1000');
  const TIME_LOCK_DELAY = 2 * 24 * 60 * 60; // 2 days in seconds

  before(async () => {
    [owner, guardian1, guardian2, guardian3, recipient] = await ethers.getSigners();

    // Deploy GuardianSBT
    const GuardianSBT = await ethers.getContractFactory('GuardianSBT');
    guardianSBT = await GuardianSBT.deploy(await owner.getAddress());
    await guardianSBT.waitForDeployment();

    // Deploy mock ERC20
    const ERC20 = await ethers.getContractFactory('MockERC20');
    token = await ERC20.deploy('Test Token', 'TEST');
    await token.waitForDeployment();

    // Deploy SpendVault
    const SpendVault = await ethers.getContractFactory('SpendVault');
    vault = await SpendVault.deploy(
      await owner.getAddress(),
      await guardianSBT.getAddress(),
      2, // quorum = 2
      ethers.parseEther('10000'), // velocity limit
      TIME_LOCK_DELAY
    );
    await vault.waitForDeployment();

    // Setup guardians
    const guardianAddrs = [
      await guardian1.getAddress(),
      await guardian2.getAddress(),
      await guardian3.getAddress()
    ];

    for (const addr of guardianAddrs) {
      await guardianSBT.connect(owner).mint(addr, 'Guardian Test');
    }

    // Fund vault
    await owner.sendTransaction({
      to: await vault.getAddress(),
      value: ethers.parseEther('5000')
    });

    await token.mint(await vault.getAddress(), ethers.parseEther('5000'));
  });

  describe('Complete Time-Lock Withdrawal Flow', () => {
    it('should complete end-to-end workflow: queue → freeze → investigate → unfreeze → execute', async () => {
      const vaultAddress = await vault.getAddress();
      const guardianSBTAddress = await guardianSBT.getAddress();
      const tokenAddress = await token.getAddress();
      const recipientAddress = await recipient.getAddress();

      // Step 1: Create withdrawal signatures
      const withdrawalData = {
        token: tokenAddress,
        amount: ethers.parseEther('2000'),
        recipient: recipientAddress,
        reason: 'Large treasury withdrawal for auditing',
        category: 'operational'
      };

      // Sign with guardian1 and guardian2
      const sig1 = await createEIP712Signature(guardian1, vaultAddress, withdrawalData);
      const sig2 = await createEIP712Signature(guardian2, vaultAddress, withdrawalData);

      // Step 2: Queue the withdrawal
      const ownerVault = vault.connect(owner);
      const queueTx = await ownerVault.queueWithdrawal(
        withdrawalData.token,
        withdrawalData.amount,
        withdrawalData.recipient,
        withdrawalData.reason,
        withdrawalData.category,
        [sig1, sig2]
      );

      const queueReceipt = await queueTx.wait();
      expect(queueReceipt?.status).to.equal(1);

      // Verify withdrawal was queued
      const withdrawal1 = await vault.getQueuedWithdrawal(0);
      expect(withdrawal1.isFrozen).to.be.false;
      expect(withdrawal1.isExecuted).to.be.false;
      expect(withdrawal1.isCancelled).to.be.false;

      // Step 3: Guardian detects unusual activity and freezes
      const guardian1Vault = vault.connect(guardian1);
      const freezeTx = await guardian1Vault.freezeQueuedWithdrawal(0);
      const freezeReceipt = await freezeTx.wait();
      expect(freezeReceipt?.status).to.equal(1);

      // Verify frozen
      let frozen = await vault.getQueuedWithdrawal(0);
      expect(frozen.isFrozen).to.be.true;
      expect(frozen.freezeCount).to.equal(1);

      // Step 4: Guardian2 also freezes after seeing unusual pattern
      const guardian2Vault = vault.connect(guardian2);
      await guardian2Vault.freezeQueuedWithdrawal(0);

      frozen = await vault.getQueuedWithdrawal(0);
      expect(frozen.freezeCount).to.equal(2);

      // Step 5: Wait for investigation period (simulation)
      const investigationDelay = 3 * 60 * 60; // 3 hours
      await ethers.provider.send('evm_increaseTime', [investigationDelay]);
      await ethers.provider.send('evm_mine', []);

      // Step 6: Guardians investigate and decide it's legitimate
      // Guardian1 unfreezes
      await guardian1Vault.unfreezeQueuedWithdrawal(0);
      frozen = await vault.getQueuedWithdrawal(0);
      expect(frozen.isFrozen).to.be.true; // Still frozen (guardian2 hasn't unfrozen)

      // Guardian2 unfreezes
      await guardian2Vault.unfreezeQueuedWithdrawal(0);
      frozen = await vault.getQueuedWithdrawal(0);
      expect(frozen.isFrozen).to.be.false;
      expect(frozen.freezeCount).to.equal(0);

      // Step 7: Wait for full time-lock to expire
      await ethers.provider.send('evm_increaseTime', [TIME_LOCK_DELAY + 1]);
      await ethers.provider.send('evm_mine', []);

      // Step 8: Execute the withdrawal (now permissionless!)
      const executeTx = await ownerVault.executeQueuedWithdrawal(0);
      const executeReceipt = await executeTx.wait();
      expect(executeReceipt?.status).to.equal(1);

      // Verify executed
      const executed = await vault.getQueuedWithdrawal(0);
      expect(executed.isExecuted).to.be.true;
      expect(await token.balanceOf(recipientAddress)).to.equal(
        ethers.parseEther('2000')
      );
    });

    it('should allow owner to cancel anytime, bypassing freeze votes', async () => {
      const vaultAddress = await vault.getAddress();
      const tokenAddress = await token.getAddress();
      const recipientAddress = await recipient.getAddress();

      // Queue a withdrawal
      const sig1 = await createEIP712Signature(guardian1, vaultAddress, {
        token: tokenAddress,
        amount: ethers.parseEther('1500'),
        recipient: recipientAddress,
        reason: 'Test cancel',
        category: 'operational'
      });

      const ownerVault = vault.connect(owner);
      await ownerVault.queueWithdrawal(
        tokenAddress,
        ethers.parseEther('1500'),
        recipientAddress,
        'Test cancel',
        'operational',
        [sig1]
      );

      // Guardian freezes it
      const guardianVault = vault.connect(guardian1);
      await guardianVault.freezeQueuedWithdrawal(1);

      let w = await vault.getQueuedWithdrawal(1);
      expect(w.isFrozen).to.be.true;

      // Owner cancels despite freeze
      await ownerVault.cancelQueuedWithdrawal(1);

      w = await vault.getQueuedWithdrawal(1);
      expect(w.isCancelled).to.be.true;

      // Even after time expires, can't execute (cancelled)
      await ethers.provider.send('evm_increaseTime', [TIME_LOCK_DELAY + 1]);
      await ethers.provider.send('evm_mine', []);

      await expect(ownerVault.executeQueuedWithdrawal(1)).to.be.revertedWith(
        'Withdrawal cancelled'
      );
    });

    it('should handle configuration updates for new withdrawals', async () => {
      // Update threshold to 500 ether
      const ownerVault = vault.connect(owner);
      await ownerVault.setLargeTxThreshold(ethers.parseEther('500'));

      // Queue a withdrawal that's now above new threshold
      const tokenAddress = await token.getAddress();
      const recipientAddress = await recipient.getAddress();
      const vaultAddress = await vault.getAddress();

      const sig1 = await createEIP712Signature(guardian1, vaultAddress, {
        token: tokenAddress,
        amount: ethers.parseEther('750'),
        recipient: recipientAddress,
        reason: 'Above new threshold',
        category: 'operational'
      });

      await ownerVault.queueWithdrawal(
        tokenAddress,
        ethers.parseEther('750'),
        recipientAddress,
        'Above new threshold',
        'operational',
        [sig1]
      );

      // Verify queued with new delay
      const w = await vault.getQueuedWithdrawal(2);
      expect(w.readyAt - w.queuedAt).to.equal(TIME_LOCK_DELAY);
    });

    it('should handle ETH and token withdrawals symmetrically', async () => {
      const vaultAddress = await vault.getAddress();
      const ownerVault = vault.connect(owner);
      const recipientAddress = await recipient.getAddress();

      // Queue ETH withdrawal
      const ethSig = await createEIP712Signature(guardian1, vaultAddress, {
        token: ethers.ZeroAddress,
        amount: ethers.parseEther('1200'),
        recipient: recipientAddress,
        reason: 'ETH withdrawal test',
        category: 'operational'
      });

      await ownerVault.queueWithdrawal(
        ethers.ZeroAddress,
        ethers.parseEther('1200'),
        recipientAddress,
        'ETH withdrawal test',
        'operational',
        [ethSig]
      );

      // Queue token withdrawal
      const tokenAddress = await token.getAddress();
      const tokenSig = await createEIP712Signature(guardian2, vaultAddress, {
        token: tokenAddress,
        amount: ethers.parseEther('1800'),
        recipient: recipientAddress,
        reason: 'Token withdrawal test',
        category: 'operational'
      });

      await ownerVault.queueWithdrawal(
        tokenAddress,
        ethers.parseEther('1800'),
        recipientAddress,
        'Token withdrawal test',
        'operational',
        [tokenSig]
      );

      // Both should have same delay
      const ethW = await vault.getQueuedWithdrawal(3);
      const tokenW = await vault.getQueuedWithdrawal(4);
      expect(ethW.readyAt - ethW.queuedAt).to.equal(TIME_LOCK_DELAY);
      expect(tokenW.readyAt - tokenW.queuedAt).to.equal(TIME_LOCK_DELAY);

      // Advance time and execute both
      await ethers.provider.send('evm_increaseTime', [TIME_LOCK_DELAY + 1]);
      await ethers.provider.send('evm_mine', []);

      const recipientBalanceBefore = await ethers.provider.getBalance(recipientAddress);
      const tokenBalanceBefore = await token.balanceOf(recipientAddress);

      await ownerVault.executeQueuedWithdrawal(3);
      await ownerVault.executeQueuedWithdrawal(4);

      expect(await ethers.provider.getBalance(recipientAddress)).to.equal(
        recipientBalanceBefore + ethers.parseEther('1200')
      );
      expect(await token.balanceOf(recipientAddress)).to.equal(
        tokenBalanceBefore + ethers.parseEther('1800')
      );
    });
  });

  /**
   * Helper to create EIP-712 signature
   */
  async function createEIP712Signature(
    signer: Signer,
    vaultAddress: string,
    data: {
      token: string;
      amount: bigint;
      recipient: string;
      reason: string;
      category: string;
    }
  ): Promise<string> {
    const domain = {
      name: 'SpendVault',
      version: '1',
      chainId: 84532,
      verifyingContract: vaultAddress
    };

    const types = {
      Withdrawal: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'recipient', type: 'address' },
        { name: 'reason', type: 'string' },
        { name: 'category', type: 'string' }
      ]
    };

    const value = {
      token: data.token,
      amount: data.amount,
      recipient: data.recipient,
      reason: data.reason,
      category: data.category
    };

    return await signer.signTypedData(domain, types, value);
  }
});
