import { expect } from 'chai';
import { ethers } from 'hardhat';
import { type Signer, type Contract } from 'ethers';

describe('SpendVault Emergency Freeze Mechanism', () => {
  let vault: Contract;
  let guardianSBT: Contract;
  let token: Contract;
  let owner: Signer;
  let guardian1: Signer;
  let guardian2: Signer;
  let guardian3: Signer;
  let guardian4: Signer;
  let recipient: Signer;

  const QUORUM = 2;

  before(async () => {
    [owner, guardian1, guardian2, guardian3, guardian4, recipient] = await ethers.getSigners();

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
      await guardianSBT.getAddress(),
      QUORUM,
      'Test Vault',
      ['test']
    );
    await vault.waitForDeployment();

    // Setup guardians (4 total)
    const guardianAddrs = [
      await guardian1.getAddress(),
      await guardian2.getAddress(),
      await guardian3.getAddress(),
      await guardian4.getAddress()
    ];

    for (const addr of guardianAddrs) {
      await guardianSBT.connect(owner).mint(addr, 'Guardian Test');
    }

    // Fund vault
    await owner.sendTransaction({
      to: await vault.getAddress(),
      value: ethers.parseEther('1000')
    });

    await token.mint(await vault.getAddress(), ethers.parseEther('1000'));
  });

  describe('Emergency Freeze Voting', () => {
    it('should allow a guardian to vote for emergency freeze', async () => {
      const vaultAddr = vault.getAddress();
      const g1 = guardian1.getAddress();

      const tx = await vault.connect(guardian1).voteEmergencyFreeze();
      const receipt = await tx.wait();

      expect(receipt?.status).to.equal(1);

      // Check that vote was recorded
      const status = await vault.getEmergencyFreezeStatus();
      expect(status.freezeVotes).to.equal(1n);
      expect(status.frozen).to.be.false; // Not yet frozen (threshold is 2)
    });

    it('should emit EmergencyFreezeVoteCast event', async () => {
      const tx = await vault.connect(guardian2).voteEmergencyFreeze();

      expect(tx).to.emit(vault, 'EmergencyFreezeVoteCast');
    });

    it('should freeze vault when threshold is reached', async () => {
      // Guardian3 casts the deciding vote (threshold = 2, this is 3rd vote)
      const tx = await vault.connect(guardian3).voteEmergencyFreeze();
      const receipt = await tx.wait();

      expect(receipt?.status).to.equal(1);

      // Check vault is frozen
      const status = await vault.getEmergencyFreezeStatus();
      expect(status.freezeVotes).to.equal(3n);
      expect(status.frozen).to.be.true;
    });

    it('should emit VaultEmergencyFrozen event when frozen', async () => {
      // Reset for clean test (we need a new vault state)
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const vault2 = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        QUORUM,
        'Test Vault 2',
        ['test']
      );
      await vault2.waitForDeployment();

      const tx = await vault2.connect(guardian1).voteEmergencyFreeze();
      const tx2 = await vault2.connect(guardian2).voteEmergencyFreeze();

      expect(tx2).to.emit(vault2, 'VaultEmergencyFrozen');
    });

    it('should prevent duplicate freeze votes from same guardian', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const vault3 = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        QUORUM,
        'Test Vault 3',
        ['test']
      );
      await vault3.waitForDeployment();

      // Guardian1 votes
      await vault3.connect(guardian1).voteEmergencyFreeze();

      // Guardian1 tries to vote again
      await expect(
        vault3.connect(guardian1).voteEmergencyFreeze()
      ).to.be.revertedWith('Guardian already voted to freeze');
    });

    it('should prevent non-guardians from voting to freeze', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const vault4 = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        QUORUM,
        'Test Vault 4',
        ['test']
      );
      await vault4.waitForDeployment();

      // Recipient is not a guardian
      await expect(
        vault4.connect(recipient).voteEmergencyFreeze()
      ).to.be.revertedWith('Only guardians can freeze vault');
    });

    it('should prevent freeze voting when vault already frozen', async () => {
      // This should fail since vault is already frozen from earlier test
      await expect(
        vault.connect(guardian4).voteEmergencyFreeze()
      ).to.be.revertedWith('Vault already frozen');
    });
  });

  describe('Blocking Operations While Frozen', () => {
    let frozenVault: Contract;

    before(async () => {
      // Create a fresh vault and freeze it
      const SpendVault = await ethers.getContractFactory('SpendVault');
      frozenVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'Frozen Test Vault',
        ['test']
      );
      await frozenVault.waitForDeployment();

      // Fund it
      await owner.sendTransaction({
        to: await frozenVault.getAddress(),
        value: ethers.parseEther('1000')
      });

      // Freeze it
      await frozenVault.connect(guardian1).voteEmergencyFreeze();
      await frozenVault.connect(guardian2).voteEmergencyFreeze();

      const status = await frozenVault.getEmergencyFreezeStatus();
      expect(status.frozen).to.be.true;
    });

    it('should prevent withdrawals when vault is frozen', async () => {
      const sig = await createEIP712Signature(
        guardian1,
        await frozenVault.getAddress(),
        {
          token: ethers.ZeroAddress,
          amount: ethers.parseEther('10'),
          recipient: await recipient.getAddress(),
          reason: 'Test withdrawal',
          category: 'operational',
          createdAt: Math.floor(Date.now() / 1000)
        }
      );

      await expect(
        frozenVault.connect(owner).withdraw(
          ethers.ZeroAddress,
          ethers.parseEther('10'),
          await recipient.getAddress(),
          'Test withdrawal',
          'operational',
          Math.floor(Date.now() / 1000),
          [sig]
        )
      ).to.be.revertedWith('Vault is emergency frozen');
    });

    it('should prevent queueWithdrawal when vault is frozen', async () => {
      const sig = await createEIP712Signature(
        guardian1,
        await frozenVault.getAddress(),
        {
          token: ethers.ZeroAddress,
          amount: ethers.parseEther('2000'),
          recipient: await recipient.getAddress(),
          reason: 'Large withdrawal',
          category: 'operational',
          createdAt: Math.floor(Date.now() / 1000)
        }
      );

      await expect(
        frozenVault.connect(owner).queueWithdrawal(
          ethers.ZeroAddress,
          ethers.parseEther('2000'),
          await recipient.getAddress(),
          'Large withdrawal',
          'operational',
          [sig]
        )
      ).to.be.revertedWith('Vault is emergency frozen');
    });
  });

  describe('Emergency Unfreeze Voting', () => {
    let unfreezeVault: Contract;

    before(async () => {
      // Create and freeze a vault
      const SpendVault = await ethers.getContractFactory('SpendVault');
      unfreezeVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'Unfreeze Test Vault',
        ['test']
      );
      await unfreezeVault.waitForDeployment();

      // Freeze it
      await unfreezeVault.connect(guardian1).voteEmergencyFreeze();
      await unfreezeVault.connect(guardian2).voteEmergencyFreeze();

      const status = await unfreezeVault.getEmergencyFreezeStatus();
      expect(status.frozen).to.be.true;
    });

    it('should allow a guardian to vote to unfreeze', async () => {
      const tx = await unfreezeVault.connect(guardian1).voteEmergencyUnfreeze();
      const receipt = await tx.wait();

      expect(receipt?.status).to.equal(1);

      const status = await unfreezeVault.getEmergencyFreezeStatus();
      expect(status.unfreezeVotes).to.equal(1n);
      expect(status.frozen).to.be.true; // Still frozen (need 2 to unfreeze)
    });

    it('should unfreeze vault when unfreeze threshold reached', async () => {
      const tx = await unfreezeVault.connect(guardian2).voteEmergencyUnfreeze();
      const receipt = await tx.wait();

      expect(receipt?.status).to.equal(1);

      const status = await unfreezeVault.getEmergencyFreezeStatus();
      expect(status.frozen).to.be.false;
      expect(status.freezeVotes).to.equal(0n); // Votes cleared
      expect(status.unfreezeVotes).to.equal(0n);
    });

    it('should emit VaultEmergencyUnfrozen event', async () => {
      // Create new vault to test event
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const testVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'Event Test Vault',
        ['test']
      );
      await testVault.waitForDeployment();

      // Freeze it
      await testVault.connect(guardian1).voteEmergencyFreeze();
      await testVault.connect(guardian2).voteEmergencyFreeze();

      // Unfreeze it
      await testVault.connect(guardian1).voteEmergencyUnfreeze();
      const tx = await testVault.connect(guardian2).voteEmergencyUnfreeze();

      expect(tx).to.emit(testVault, 'VaultEmergencyUnfrozen');
    });

    it('should prevent duplicate unfreeze votes', async () => {
      // Create and freeze a fresh vault
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const dupVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'Dup Unfreeze Test',
        ['test']
      );
      await dupVault.waitForDeployment();

      await dupVault.connect(guardian1).voteEmergencyFreeze();
      await dupVault.connect(guardian2).voteEmergencyFreeze();

      // Guardian1 votes to unfreeze
      await dupVault.connect(guardian1).voteEmergencyUnfreeze();

      // Guardian1 tries to vote again
      await expect(
        dupVault.connect(guardian1).voteEmergencyUnfreeze()
      ).to.be.revertedWith('Guardian already voted to unfreeze');
    });
  });

  describe('Vote Switching', () => {
    it('should allow guardian to switch from freeze vote to unfreeze vote', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const switchVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'Switch Vote Vault',
        ['test']
      );
      await switchVault.waitForDeployment();

      // Guardian1 votes to freeze
      await switchVault.connect(guardian1).voteEmergencyFreeze();
      let status = await switchVault.getEmergencyFreezeStatus();
      expect(status.freezeVotes).to.equal(1n);

      // Guardian1 changes mind and votes to unfreeze (revokes freeze vote)
      await switchVault.connect(guardian1).voteEmergencyUnfreeze();
      status = await switchVault.getEmergencyFreezeStatus();
      expect(status.freezeVotes).to.equal(0n); // Revoked

      // Guardian2 votes to freeze to complete freeze
      await switchVault.connect(guardian2).voteEmergencyFreeze();
      status = await switchVault.getEmergencyFreezeStatus();
      expect(status.frozen).to.be.true;
    });

    it('should allow revoking freeze vote before vault is frozen', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const revokeVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'Revoke Vault',
        ['test']
      );
      await revokeVault.waitForDeployment();

      // Guardian1 votes to freeze
      await revokeVault.connect(guardian1).voteEmergencyFreeze();
      let status = await revokeVault.getEmergencyFreezeStatus();
      expect(status.freezeVotes).to.equal(1n);

      // Guardian1 revokes their vote
      await revokeVault.connect(guardian1).voteEmergencyUnfreeze();
      status = await revokeVault.getEmergencyFreezeStatus();
      expect(status.freezeVotes).to.equal(0n);
      expect(status.frozen).to.be.false;
    });
  });

  describe('Threshold Configuration', () => {
    it('should allow owner to update emergency freeze threshold', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const thresholdVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        4,
        'Threshold Vault',
        ['test']
      );
      await thresholdVault.waitForDeployment();

      // Default threshold should be 50% + 1 = 3
      let status = await thresholdVault.getEmergencyFreezeStatus();
      expect(status.threshold).to.equal(3n);

      // Owner updates to 2
      await thresholdVault.connect(owner).setEmergencyFreezeThreshold(2);
      status = await thresholdVault.getEmergencyFreezeStatus();
      expect(status.threshold).to.equal(2n);
    });

    it('should emit EmergencyFreezeThresholdUpdated event', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const eventVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        4,
        'Event Vault',
        ['test']
      );
      await eventVault.waitForDeployment();

      const tx = await eventVault.connect(owner).setEmergencyFreezeThreshold(2);
      expect(tx).to.emit(eventVault, 'EmergencyFreezeThresholdUpdated');
    });

    it('should prevent non-owner from updating threshold', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const noOwnerVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'No Owner Vault',
        ['test']
      );
      await noOwnerVault.waitForDeployment();

      await expect(
        noOwnerVault.connect(guardian1).setEmergencyFreezeThreshold(1)
      ).to.be.revertedWithCustomError(noOwnerVault, 'OwnableUnauthorizedAccount');
    });

    it('should prevent threshold greater than quorum', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const limitVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        3,
        'Limit Vault',
        ['test']
      );
      await limitVault.waitForDeployment();

      await expect(
        limitVault.connect(owner).setEmergencyFreezeThreshold(5)
      ).to.be.revertedWith('Threshold cannot exceed quorum');
    });
  });

  describe('Vote Tracking', () => {
    it('should return list of guardians who voted to freeze', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const trackVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'Track Vault',
        ['test']
      );
      await trackVault.waitForDeployment();

      const g1Addr = await guardian1.getAddress();
      const g2Addr = await guardian2.getAddress();

      await trackVault.connect(guardian1).voteEmergencyFreeze();
      await trackVault.connect(guardian2).voteEmergencyFreeze();

      const freezeVoters = await trackVault.getFreezeVoters();
      expect(freezeVoters).to.include(g1Addr);
      expect(freezeVoters).to.include(g2Addr);
      expect(freezeVoters.length).to.equal(2);
    });

    it('should return list of guardians who voted to unfreeze', async () => {
      const SpendVault = await ethers.getContractFactory('SpendVault');
      const unfreezeTrackVault = await SpendVault.deploy(
        await guardianSBT.getAddress(),
        2,
        'Unfreeze Track Vault',
        ['test']
      );
      await unfreezeTrackVault.waitForDeployment();

      // Freeze it
      const g1Addr = await guardian1.getAddress();
      const g3Addr = await guardian3.getAddress();
      await unfreezeTrackVault.connect(guardian1).voteEmergencyFreeze();
      await unfreezeTrackVault.connect(guardian2).voteEmergencyFreeze();

      // Vote to unfreeze
      await unfreezeTrackVault.connect(guardian1).voteEmergencyUnfreeze();
      await unfreezeTrackVault.connect(guardian3).voteEmergencyUnfreeze();

      const unfreezeVoters = await unfreezeTrackVault.getUnfreezeVoters();
      expect(unfreezeVoters).to.include(g1Addr);
      expect(unfreezeVoters).to.include(g3Addr);
      expect(unfreezeVoters.length).to.equal(2);
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
      createdAt: number;
    }
  ): Promise<string> {
    const domain = {
      name: 'SpendGuard',
      version: '1',
      chainId: 31337, // hardhat default
      verifyingContract: vaultAddress
    };

    const types = {
      Withdrawal: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'recipient', type: 'address' },
        { name: 'reason', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'createdAt', type: 'uint256' }
      ]
    };

    const value = {
      token: data.token,
      amount: data.amount,
      recipient: data.recipient,
      reason: data.reason,
      category: data.category,
      createdAt: data.createdAt
    };

    return await signer.signTypedData(domain, types, value);
  }
});
