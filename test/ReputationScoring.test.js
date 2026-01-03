const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("OnChainResume - Reputation Scoring System", function () {
  let onChainResume;
  let owner, user1, user2, verifier1, verifier2;

  // Reputation constants (matching contract)
  const SCORE_BASE = 10;
  const SCORE_VERIFIED_PROFILE = 25;
  const SCORE_VERIFIED_CREDENTIAL = 15;
  const SCORE_UNVERIFIED_CREDENTIAL = 5;
  const SCORE_ACHIEVEMENT_BASE = 10;
  const SCORE_PROFILE_UPDATE = 3;

  beforeEach(async function () {
    [owner, user1, user2, verifier1, verifier2] = await ethers.getSigners();

    const OnChainResume = await ethers.getContractFactory("OnChainResume");
    onChainResume = await OnChainResume.deploy();
    await onChainResume.waitForDeployment();
  });

  describe("Base Score", function () {
    it("Should return 0 reputation for non-existent profile", async function () {
      const reputation = await onChainResume.getReputation(user1.address);
      expect(reputation).to.equal(0);
    });

    it("Should return base score (10) for newly created profile", async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      
      const reputation = await onChainResume.getReputation(user1.address);
      expect(reputation).to.equal(SCORE_BASE);
    });

    it("Should show base score in breakdown", async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      
      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.baseScore).to.equal(SCORE_BASE);
      expect(breakdown.totalScore).to.equal(SCORE_BASE);
    });
  });

  describe("Verified Profile Bonus", function () {
    beforeEach(async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
    });

    it("Should add 25 points when profile is verified", async function () {
      await onChainResume.verifyProfile(user1.address);
      
      const reputation = await onChainResume.getReputation(user1.address);
      expect(reputation).to.equal(SCORE_BASE + SCORE_VERIFIED_PROFILE);
    });

    it("Should show verified profile bonus in breakdown", async function () {
      await onChainResume.verifyProfile(user1.address);
      
      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.verifiedProfileBonus).to.equal(SCORE_VERIFIED_PROFILE);
      expect(breakdown.totalScore).to.equal(SCORE_BASE + SCORE_VERIFIED_PROFILE);
    });

    it("Should not add bonus for unverified profile", async function () {
      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.verifiedProfileBonus).to.equal(0);
    });
  });

  describe("Credential Scoring", function () {
    beforeEach(async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
    });

    it("Should add 5 points per unverified credential", async function () {
      // Add 3 credentials
      await onChainResume.connect(user1).addCredential(
        0, // EDUCATION
        "Bachelor's Degree",
        "University ABC",
        Math.floor(Date.now() / 1000) - 1000,
        0,
        "QmProof1"
      );
      await onChainResume.connect(user1).addCredential(
        1, // WORK
        "Software Engineer",
        "Company XYZ",
        Math.floor(Date.now() / 1000) - 2000,
        0,
        "QmProof2"
      );
      await onChainResume.connect(user1).addCredential(
        2, // CERTIFICATION
        "AWS Certified",
        "Amazon",
        Math.floor(Date.now() / 1000) - 3000,
        0,
        "QmProof3"
      );

      const reputation = await onChainResume.getReputation(user1.address);
      const expectedScore = SCORE_BASE + (3 * SCORE_UNVERIFIED_CREDENTIAL);
      expect(reputation).to.equal(expectedScore);
    });

    it("Should add 15 bonus points per verified credential", async function () {
      // Add credential
      await onChainResume.connect(user1).addCredential(
        0,
        "Bachelor's Degree",
        "University ABC",
        Math.floor(Date.now() / 1000) - 1000,
        0,
        "QmProof1"
      );

      // Verify with 2 verifiers (makes it verified)
      await onChainResume.connect(verifier1).verifyCredential(user1.address, 0);
      await onChainResume.connect(verifier2).verifyCredential(user1.address, 0);

      const reputation = await onChainResume.getReputation(user1.address);
      const expectedScore = SCORE_BASE + SCORE_UNVERIFIED_CREDENTIAL + SCORE_VERIFIED_CREDENTIAL;
      expect(reputation).to.equal(expectedScore);
    });

    it("Should calculate mixed verified and unverified credentials correctly", async function () {
      // Add 3 credentials
      for (let i = 0; i < 3; i++) {
        await onChainResume.connect(user1).addCredential(
          i % 4,
          `Credential ${i}`,
          `Issuer ${i}`,
          Math.floor(Date.now() / 1000) - 1000,
          0,
          `QmProof${i}`
        );
      }

      // Verify only first two credentials
      await onChainResume.connect(verifier1).verifyCredential(user1.address, 0);
      await onChainResume.connect(verifier2).verifyCredential(user1.address, 0);
      await onChainResume.connect(verifier1).verifyCredential(user1.address, 1);
      await onChainResume.connect(verifier2).verifyCredential(user1.address, 1);

      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.credentialCount).to.equal(3);
      expect(breakdown.verifiedCredentialCount).to.equal(2);
      expect(breakdown.credentialScore).to.equal(3 * SCORE_UNVERIFIED_CREDENTIAL);
      expect(breakdown.verifiedCredentialBonus).to.equal(2 * SCORE_VERIFIED_CREDENTIAL);

      const expectedTotal = SCORE_BASE + 
                           (3 * SCORE_UNVERIFIED_CREDENTIAL) + 
                           (2 * SCORE_VERIFIED_CREDENTIAL);
      expect(breakdown.totalScore).to.equal(expectedTotal);
    });
  });

  describe("Achievement Scoring", function () {
    beforeEach(async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
    });

    it("Should add 10 points per achievement", async function () {
      await onChainResume.connect(user1).unlockAchievement(
        "First Profile",
        "Created first profile on platform"
      );

      const reputation = await onChainResume.getReputation(user1.address);
      expect(reputation).to.equal(SCORE_BASE + SCORE_ACHIEVEMENT_BASE);
    });

    it("Should calculate multiple achievements correctly", async function () {
      // Add 5 achievements
      for (let i = 0; i < 5; i++) {
        await onChainResume.connect(user1).unlockAchievement(
          `Achievement ${i}`,
          `Description ${i}`
        );
      }

      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.achievementCount).to.equal(5);
      expect(breakdown.achievementScore).to.equal(5 * SCORE_ACHIEVEMENT_BASE);
      
      const expectedTotal = SCORE_BASE + (5 * SCORE_ACHIEVEMENT_BASE);
      expect(breakdown.totalScore).to.equal(expectedTotal);
    });
  });

  describe("Activity Scoring", function () {
    beforeEach(async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
    });

    it("Should add 3 points per month of activity", async function () {
      // Advance time by 3 months (90 days)
      await time.increase(90 * 24 * 60 * 60);
      
      // Update profile to trigger activity tracking
      await onChainResume.connect(user1).updateProfile("QmHashUpdated");

      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      
      // Should be approximately 3 months * 3 points = 9 points
      // (Using 30-day months = 2,592,000 seconds)
      expect(breakdown.activityScore).to.be.gte(9);
      expect(breakdown.activityScore).to.be.lte(12); // Allow some margin
    });

    it("Should not add activity score without profile updates", async function () {
      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.activityScore).to.equal(0);
    });

    it("Should accumulate activity score over multiple updates", async function () {
      // First update after 1 month
      await time.increase(30 * 24 * 60 * 60);
      await onChainResume.connect(user1).updateProfile("QmHash2");
      
      // Second update after another month
      await time.increase(30 * 24 * 60 * 60);
      await onChainResume.connect(user1).updateProfile("QmHash3");

      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.activityScore).to.be.gte(6); // At least 2 months
    });
  });

  describe("Complete Reputation Calculation", function () {
    it("Should calculate comprehensive reputation score correctly", async function () {
      // Create profile
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      
      // Verify profile
      await onChainResume.verifyProfile(user1.address);
      
      // Add 3 credentials
      for (let i = 0; i < 3; i++) {
        await onChainResume.connect(user1).addCredential(
          i % 4,
          `Credential ${i}`,
          `Issuer ${i}`,
          Math.floor(Date.now() / 1000) - 1000,
          0,
          `QmProof${i}`
        );
      }
      
      // Verify 2 credentials
      await onChainResume.connect(verifier1).verifyCredential(user1.address, 0);
      await onChainResume.connect(verifier2).verifyCredential(user1.address, 0);
      await onChainResume.connect(verifier1).verifyCredential(user1.address, 1);
      await onChainResume.connect(verifier2).verifyCredential(user1.address, 1);
      
      // Add 2 achievements
      await onChainResume.connect(user1).unlockAchievement("First", "First achievement");
      await onChainResume.connect(user1).unlockAchievement("Second", "Second achievement");
      
      // Update profile after 2 months
      await time.increase(60 * 24 * 60 * 60);
      await onChainResume.connect(user1).updateProfile("QmHashUpdated");

      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      
      // Verify all components
      expect(breakdown.baseScore).to.equal(SCORE_BASE);
      expect(breakdown.verifiedProfileBonus).to.equal(SCORE_VERIFIED_PROFILE);
      expect(breakdown.credentialScore).to.equal(3 * SCORE_UNVERIFIED_CREDENTIAL);
      expect(breakdown.verifiedCredentialBonus).to.equal(2 * SCORE_VERIFIED_CREDENTIAL);
      expect(breakdown.achievementScore).to.equal(2 * SCORE_ACHIEVEMENT_BASE);
      expect(breakdown.activityScore).to.be.gte(6); // ~2 months activity
      
      // Calculate expected total
      const expectedMin = SCORE_BASE + 
                         SCORE_VERIFIED_PROFILE + 
                         (3 * SCORE_UNVERIFIED_CREDENTIAL) +
                         (2 * SCORE_VERIFIED_CREDENTIAL) +
                         (2 * SCORE_ACHIEVEMENT_BASE) +
                         6; // minimum activity score

      expect(breakdown.totalScore).to.be.gte(expectedMin);
      
      // Verify getReputation returns same value
      const reputation = await onChainResume.getReputation(user1.address);
      expect(reputation).to.equal(breakdown.totalScore);
    });
  });

  describe("Deterministic Calculation", function () {
    it("Should return consistent scores on multiple calls", async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      await onChainResume.connect(user1).addCredential(
        0, "Degree", "University", Math.floor(Date.now() / 1000), 0, "QmProof"
      );

      const rep1 = await onChainResume.getReputation(user1.address);
      const rep2 = await onChainResume.getReputation(user1.address);
      const rep3 = await onChainResume.getReputation(user1.address);

      expect(rep1).to.equal(rep2);
      expect(rep2).to.equal(rep3);
    });

    it("Should calculate same score for different users with same data", async function () {
      // User 1 setup
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      await onChainResume.connect(user1).addCredential(
        0, "Degree", "University", Math.floor(Date.now() / 1000), 0, "QmProof1"
      );
      await onChainResume.connect(user1).unlockAchievement("First", "Description");

      // User 2 setup (same actions)
      await onChainResume.connect(user2).createProfile("user2", "QmHash2");
      await onChainResume.connect(user2).addCredential(
        0, "Degree", "University", Math.floor(Date.now() / 1000), 0, "QmProof2"
      );
      await onChainResume.connect(user2).unlockAchievement("First", "Description");

      const rep1 = await onChainResume.getReputation(user1.address);
      const rep2 = await onChainResume.getReputation(user2.address);

      expect(rep1).to.equal(rep2);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero breakdown for non-existent profile", async function () {
      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      
      expect(breakdown.baseScore).to.equal(0);
      expect(breakdown.verifiedProfileBonus).to.equal(0);
      expect(breakdown.credentialScore).to.equal(0);
      expect(breakdown.verifiedCredentialBonus).to.equal(0);
      expect(breakdown.achievementScore).to.equal(0);
      expect(breakdown.activityScore).to.equal(0);
      expect(breakdown.totalScore).to.equal(0);
    });

    it("Should handle profile with no credentials or achievements", async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      
      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.credentialCount).to.equal(0);
      expect(breakdown.verifiedCredentialCount).to.equal(0);
      expect(breakdown.achievementCount).to.equal(0);
      expect(breakdown.totalScore).to.equal(SCORE_BASE);
    });

    it("Should handle many credentials efficiently", async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      
      // Add 20 credentials
      for (let i = 0; i < 20; i++) {
        await onChainResume.connect(user1).addCredential(
          i % 4,
          `Credential ${i}`,
          `Issuer ${i}`,
          Math.floor(Date.now() / 1000) - 1000,
          0,
          `QmProof${i}`
        );
      }

      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      expect(breakdown.credentialCount).to.equal(20);
      expect(breakdown.credentialScore).to.equal(20 * SCORE_UNVERIFIED_CREDENTIAL);
      
      const expectedTotal = SCORE_BASE + (20 * SCORE_UNVERIFIED_CREDENTIAL);
      expect(breakdown.totalScore).to.equal(expectedTotal);
    });

    it("Should handle very old profiles with large time differences", async function () {
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      
      // Advance time by 2 years (24 months)
      await time.increase(730 * 24 * 60 * 60);
      await onChainResume.connect(user1).updateProfile("QmHashUpdated");

      const breakdown = await onChainResume.getReputationBreakdown(user1.address);
      
      // Should have ~24 months * 3 = 72 points activity
      expect(breakdown.activityScore).to.be.gte(72);
      expect(breakdown.totalScore).to.be.gte(SCORE_BASE + 72);
    });
  });

  describe("Reputation Constants", function () {
    it("Should expose all scoring constants publicly", async function () {
      expect(await onChainResume.SCORE_BASE()).to.equal(SCORE_BASE);
      expect(await onChainResume.SCORE_VERIFIED_PROFILE()).to.equal(SCORE_VERIFIED_PROFILE);
      expect(await onChainResume.SCORE_VERIFIED_CREDENTIAL()).to.equal(SCORE_VERIFIED_CREDENTIAL);
      expect(await onChainResume.SCORE_UNVERIFIED_CREDENTIAL()).to.equal(SCORE_UNVERIFIED_CREDENTIAL);
      expect(await onChainResume.SCORE_ACHIEVEMENT_BASE()).to.equal(SCORE_ACHIEVEMENT_BASE);
      expect(await onChainResume.SCORE_PROFILE_UPDATE()).to.equal(SCORE_PROFILE_UPDATE);
    });
  });

  describe("Integration with Existing Functions", function () {
    it("Should work correctly with getTopProfiles sorting", async function () {
      // Create 3 users with different reputations
      await onChainResume.connect(user1).createProfile("user1", "QmHash1");
      
      await onChainResume.connect(user2).createProfile("user2", "QmHash2");
      await onChainResume.connect(user2).addCredential(
        0, "Degree", "Uni", Math.floor(Date.now() / 1000), 0, "QmProof"
      );
      
      await onChainResume.connect(owner).createProfile("owner", "QmHash3");
      await onChainResume.verifyProfile(owner.address);

      const topProfiles = await onChainResume.getTopProfiles(3);
      
      // Owner should be first (verified), user2 second (credential), user1 last (base only)
      const rep1 = await onChainResume.getReputation(topProfiles[0]);
      const rep2 = await onChainResume.getReputation(topProfiles[1]);
      const rep3 = await onChainResume.getReputation(topProfiles[2]);
      
      expect(rep1).to.be.gte(rep2);
      expect(rep2).to.be.gte(rep3);
    });
  });
});
