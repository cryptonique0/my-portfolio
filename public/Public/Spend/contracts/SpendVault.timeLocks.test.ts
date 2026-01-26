/**
 * SpendVault.timeLocks.test.ts
 * 
 * Comprehensive test suite for time-locked withdrawals feature
 * Tests queuing, execution, cancellation, and freezing of large withdrawals
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { type Contract, type Signer } from 'ethers';

describe('SpendVault - Time-Locked Withdrawals', () => {
  let vault: Contract;
  let token: Contract;
  let guardianToken: Contract;
  let owner: Signer;
  let guardian1: Signer;
  let guardian2: Signer;
  let guardian3: Signer;
  let recipient: Signer;
  let nonGuardian: Signer;

  const DOMAIN_SEPARATOR = 'SpendVault';
  const VERSION = '1.0.0';
  const TIME_LOCK_DELAY = 2 * 24 * 60 * 60; // 2 days
  const LARGE_TX_THRESHOLD = ethers.parseEther('1000');

  /**
   * Helper: Sign a withdrawal
   */
  async function signWithdrawal(
    signer: Signer,
    token: string,
    amount: bigint,
    recipient: string,
    nonce: number,
    reason: string = 'test withdrawal',
    category: string = 'operations'
  ) {
    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reason));
    const categoryHash = ethers.keccak256(ethers.toUtf8Bytes(category));

    const domain = {
      name: DOMAIN_SEPARATOR,
      version: VERSION,
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await vault.getAddress()
    };

    const types = {
      Withdrawal: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'recipient', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'reasonHash', type: 'bytes32' },
        { name: 'category', type: 'bytes32' },
        { name: 'createdAt', type: 'uint256' }
      ]
    };

    const value = {
      token,
      amount,
      recipient,
      nonce,
      reasonHash,
      category: categoryHash,
      createdAt: Math.floor(Date.now() / 1000)
    };

    return await signer.signTypedData(domain, types, value);
  }

  before(async () => {
    [owner, guardian1, guardian2, guardian3, recipient, nonGuardian] = await ethers.getSigners();

    // Deploy GuardianSBT
    const GuardianSBT = await ethers.getContractFactory('GuardianSBT');
    guardianToken = await GuardianSBT.deploy();
    await guardianToken.waitForDeployment();

    // Mint guardian tokens
    for (const guardian of [guardian1, guardian2, guardian3]) {
      const tx = await guardianToken.mint(await guardian.getAddress());
      await tx.wait();
    }

    // Deploy ERC20 token
    const ERC20Mock = await ethers.getContractFactory('ERC20Mock');
    token = await ERC20Mock.deploy('Test Token', 'TEST', ethers.parseEther('10000'));
    await token.waitForDeployment();

    // Deploy SpendVault
    const SpendVault = await ethers.getContractFactory('SpendVault');
    vault = await SpendVault.deploy(
      await owner.getAddress(),
      await guardianToken.getAddress()
    );
    await vault.waitForDeployment();

    // Fund vault
    const tx = await token.transfer(await vault.getAddress(), ethers.parseEther('5000'));
    await tx.wait();

    // Set quorum
    const setQuorumTx = await vault.setQuorum(2);
    await setQuorumTx.wait();

    // Set time-lock delay
    const setDelayTx = await vault.setTimeLockDelay(TIME_LOCK_DELAY);
    await setDelayTx.wait();

    // Set large tx threshold
    const setThresholdTx = await vault.setLargeTxThreshold(LARGE_TX_THRESHOLD);
    await setThresholdTx.wait();
  });

  describe('Withdrawal Queuing', () => {
    it('should queue a large withdrawal and set ready time', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('1');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      const blockTime = await ethers.provider.getBlock('latest');
      const expectedReadyTime = blockTime!.timestamp + TIME_LOCK_DELAY;

      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );

      const receipt = await queueTx.wait();
      expect(queueTx).to.emit(vault, 'WithdrawalQueued');

      // Verify queued withdrawal
      const queued = await vault.getQueuedWithdrawal(0);
      expect(queued.token).to.equal(tokenAddr);
      expect(queued.amount).to.equal(withdrawAmount);
      expect(queued.recipient).to.equal(recipientAddr);
      expect(queued.readyAt).to.approximately(expectedReadyTime, 2);
      expect(queued.isFrozen).to.be.false;
      expect(queued.isExecuted).to.be.false;
      expect(queued.isCancelled).to.be.false;
    });

    it('should execute small withdrawals immediately without queuing', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = ethers.parseEther('100'); // Below threshold

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      const balanceBefore = await token.balanceOf(recipientAddr);

      await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Small withdrawal',
        'operations',
        [sig1, sig2]
      );

      const balanceAfter = await token.balanceOf(recipientAddr);
      expect(balanceAfter - balanceBefore).to.equal(withdrawAmount);
    });

    it('should reject queuing without sufficient signatures', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('1');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);

      await expect(
        vault.queueWithdrawal(
          tokenAddr,
          withdrawAmount,
          recipientAddr,
          'Large withdrawal',
          'operations',
          [sig1] // Only 1 signature, need 2
        )
      ).to.be.revertedWith('Quorum not met');
    });
  });

  describe('Withdrawal Execution', () => {
    it('should execute queued withdrawal after time-lock expires', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('2');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 1; // Assuming this is the second withdrawal (0-indexed)

      // Verify can't execute before time-lock
      await expect(
        vault.executeQueuedWithdrawal(withdrawalId)
      ).to.be.revertedWith('Time-lock not expired');

      // Advance time by TIME_LOCK_DELAY
      await ethers.provider.send('evm_increaseTime', [TIME_LOCK_DELAY + 1]);
      await ethers.provider.send('evm_mine', []);

      // Now execute should work
      const balanceBefore = await token.balanceOf(recipientAddr);
      const executeTx = await vault.executeQueuedWithdrawal(withdrawalId);
      await executeTx.wait();

      const balanceAfter = await token.balanceOf(recipientAddr);
      expect(balanceAfter - balanceBefore).to.equal(withdrawAmount);

      // Verify marked as executed
      const queued = await vault.getQueuedWithdrawal(withdrawalId);
      expect(queued.isExecuted).to.be.true;
    });

    it('should prevent double execution of same withdrawal', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('3');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 2;

      // Advance time
      await ethers.provider.send('evm_increaseTime', [TIME_LOCK_DELAY + 1]);
      await ethers.provider.send('evm_mine', []);

      // Execute once
      const executeTx = await vault.executeQueuedWithdrawal(withdrawalId);
      await executeTx.wait();

      // Try to execute again
      await expect(
        vault.executeQueuedWithdrawal(withdrawalId)
      ).to.be.revertedWith('Already executed');
    });
  });

  describe('Withdrawal Cancellation', () => {
    it('should allow owner to cancel queued withdrawal', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('4');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 3;

      // Owner cancels
      const cancelTx = await vault.cancelQueuedWithdrawal(withdrawalId);
      expect(cancelTx).to.emit(vault, 'WithdrawalCancelled');

      // Verify cancelled
      const queued = await vault.getQueuedWithdrawal(withdrawalId);
      expect(queued.isCancelled).to.be.true;

      // Advance time and try to execute
      await ethers.provider.send('evm_increaseTime', [TIME_LOCK_DELAY + 1]);
      await ethers.provider.send('evm_mine', []);

      await expect(
        vault.executeQueuedWithdrawal(withdrawalId)
      ).to.be.revertedWith('Withdrawal was cancelled');
    });

    it('should allow guardian (signer) to cancel queued withdrawal', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('5');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 4;

      // Guardian1 cancels
      const cancelTx = await vault.connect(guardian1).cancelQueuedWithdrawal(withdrawalId);
      expect(cancelTx).to.emit(vault, 'WithdrawalCancelled');

      // Verify cancelled
      const queued = await vault.getQueuedWithdrawal(withdrawalId);
      expect(queued.isCancelled).to.be.true;
    });

    it('should prevent non-signer from cancelling', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('6');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 5;

      // Non-signer (guardian3) cannot cancel
      await expect(
        vault.connect(guardian3).cancelQueuedWithdrawal(withdrawalId)
      ).to.be.revertedWith('Only owner or signers can cancel');
    });
  });

  describe('Withdrawal Freezing', () => {
    it('should allow guardian to freeze queued withdrawal', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('7');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 6;

      // Guardian3 freezes (even though not a signer)
      const freezeTx = await vault.connect(guardian3).freezeQueuedWithdrawal(withdrawalId);
      expect(freezeTx).to.emit(vault, 'WithdrawalFrozen');

      // Verify frozen
      const queued = await vault.getQueuedWithdrawal(withdrawalId);
      expect(queued.isFrozen).to.be.true;
      expect(queued.freezeCount).to.equal(1);

      // Advance time and try to execute
      await ethers.provider.send('evm_increaseTime', [TIME_LOCK_DELAY + 1]);
      await ethers.provider.send('evm_mine', []);

      await expect(
        vault.executeQueuedWithdrawal(withdrawalId)
      ).to.be.revertedWith('Withdrawal is frozen');
    });

    it('should prevent non-guardians from freezing', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('8');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 7;

      // Non-guardian cannot freeze
      await expect(
        vault.connect(nonGuardian).freezeQueuedWithdrawal(withdrawalId)
      ).to.be.revertedWith('Only guardians can freeze');
    });

    it('should allow guardian to unfreeze their own freeze', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('9');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 8;

      // Freeze
      const freezeTx = await vault.connect(guardian3).freezeQueuedWithdrawal(withdrawalId);
      await freezeTx.wait();

      // Unfreeze
      const unfreezeTx = await vault.connect(guardian3).unfreezeQueuedWithdrawal(withdrawalId);
      expect(unfreezeTx).to.emit(vault, 'WithdrawalUnfrozen');

      // Verify unfrozen
      const queued = await vault.getQueuedWithdrawal(withdrawalId);
      expect(queued.freezeCount).to.equal(0);
    });

    it('should handle multiple freezes by different guardians', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('10');

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, tokenAddr, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, tokenAddr, withdrawAmount, recipientAddr, nonce);

      // Queue withdrawal
      const queueTx = await vault.queueWithdrawal(
        tokenAddr,
        withdrawAmount,
        recipientAddr,
        'Large withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 9;

      // Guardian1 freezes
      const freeze1Tx = await vault.connect(guardian1).freezeQueuedWithdrawal(withdrawalId);
      await freeze1Tx.wait();

      // Guardian3 freezes (different guardian)
      const freeze2Tx = await vault.connect(guardian3).freezeQueuedWithdrawal(withdrawalId);
      await freeze2Tx.wait();

      // Verify both have frozen
      let queued = await vault.getQueuedWithdrawal(withdrawalId);
      expect(queued.freezeCount).to.equal(2);
      expect(queued.isFrozen).to.be.true;

      // Guardian1 unfreezes
      const unfreeze1Tx = await vault.connect(guardian1).unfreezeQueuedWithdrawal(withdrawalId);
      await unfreeze1Tx.wait();

      // Should still be frozen because guardian3 has it frozen
      queued = await vault.getQueuedWithdrawal(withdrawalId);
      expect(queued.freezeCount).to.equal(1);
      expect(queued.isFrozen).to.be.true;

      // Guardian3 unfreezes
      const unfreeze2Tx = await vault.connect(guardian3).unfreezeQueuedWithdrawal(withdrawalId);
      await unfreeze2Tx.wait();

      // Now it should be unfrozen
      queued = await vault.getQueuedWithdrawal(withdrawalId);
      expect(queued.freezeCount).to.equal(0);
      expect(queued.isFrozen).to.be.false;
    });
  });

  describe('Configuration', () => {
    it('should allow owner to update time-lock delay', async () => {
      const newDelay = 7 * 24 * 60 * 60; // 7 days
      const tx = await vault.setTimeLockDelay(newDelay);
      expect(tx).to.emit(vault, 'TimeLockDelayUpdated');

      const delay = await vault.timeLockDelay();
      expect(delay).to.equal(newDelay);
    });

    it('should allow owner to update large tx threshold', async () => {
      const newThreshold = ethers.parseEther('2000');
      const tx = await vault.setLargeTxThreshold(newThreshold);
      expect(tx).to.emit(vault, 'LargeTxThresholdUpdated');

      const threshold = await vault.largeTxThreshold();
      expect(threshold).to.equal(newThreshold);
    });

    it('should allow owner to set per-token thresholds', async () => {
      const tokenAddr = await token.getAddress();
      const perTokenThreshold = ethers.parseEther('500');

      const tx = await vault.setTokenThreshold(tokenAddr, perTokenThreshold);
      expect(tx).to.emit(vault, 'LargeTxThresholdUpdated');

      const threshold = await vault.tokenTxThresholds(tokenAddr);
      expect(threshold).to.equal(perTokenThreshold);
    });
  });

  describe('Edge Cases', () => {
    it('should reject queueing with zero amount', async () => {
      const tokenAddr = await token.getAddress();
      const recipientAddr = await recipient.getAddress();

      await expect(
        vault.queueWithdrawal(
          tokenAddr,
          0,
          recipientAddr,
          'Zero amount',
          'operations',
          []
        )
      ).to.be.revertedWith('Amount must be greater than 0');
    });

    it('should reject queueing to zero address', async () => {
      const tokenAddr = await token.getAddress();
      const withdrawAmount = LARGE_TX_THRESHOLD + ethers.parseEther('1');

      await expect(
        vault.queueWithdrawal(
          tokenAddr,
          withdrawAmount,
          ethers.ZeroAddress,
          'Zero recipient',
          'operations',
          []
        )
      ).to.be.revertedWith('Invalid recipient');
    });

    it('should handle ETH transfers for queued withdrawals', async () => {
      // Fund vault with ETH
      const fundTx = await owner.sendTransaction({
        to: await vault.getAddress(),
        value: ethers.parseEther('100')
      });
      await fundTx.wait();

      const recipientAddr = await recipient.getAddress();
      const withdrawAmount = ethers.parseEther('50');

      // Set ETH threshold to allow large ETH withdrawals
      await vault.setTokenThreshold(ethers.ZeroAddress, ethers.parseEther('10'));

      const nonce = await vault.nonce();
      const sig1 = await signWithdrawal(guardian1, ethers.ZeroAddress, withdrawAmount, recipientAddr, nonce);
      const sig2 = await signWithdrawal(guardian2, ethers.ZeroAddress, withdrawAmount, recipientAddr, nonce);

      // Queue ETH withdrawal
      const queueTx = await vault.queueWithdrawal(
        ethers.ZeroAddress,
        withdrawAmount,
        recipientAddr,
        'ETH withdrawal',
        'operations',
        [sig1, sig2]
      );
      await queueTx.wait();

      const withdrawalId = 10;

      // Advance time
      await ethers.provider.send('evm_increaseTime', [TIME_LOCK_DELAY + 1]);
      await ethers.provider.send('evm_mine', []);

      // Execute
      const balanceBefore = await ethers.provider.getBalance(recipientAddr);
      const executeTx = await vault.executeQueuedWithdrawal(withdrawalId);
      await executeTx.wait();
      const balanceAfter = await ethers.provider.getBalance(recipientAddr);

      expect(balanceAfter - balanceBefore).to.be.approximately(withdrawAmount, ethers.parseEther('0.01'));
    });
  });
});
