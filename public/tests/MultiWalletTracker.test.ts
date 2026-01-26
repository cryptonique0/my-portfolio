import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiWalletTracker } from "../typechain-types";

describe("MultiWalletTracker", function () {
  let tracker: MultiWalletTracker;
  let owner: any;
  let user1: any;
  let user2: any;
  let wallet1: any;
  let wallet2: any;
  let wallet3: any;

  beforeEach(async function () {
    [owner, user1, user2, wallet1, wallet2, wallet3] = await ethers.getSigners();

    const TrackerFactory = await ethers.getContractFactory("MultiWalletTracker");
    tracker = await TrackerFactory.deploy();
    await tracker.waitForDeployment();
  });

  describe("Profile Management", function () {
    it("Should create a wallet profile", async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Main Wallet");

      const profile = await tracker.getProfile(wallet1.address);
      expect(profile.name).to.equal("Main Wallet");
      expect(profile.address).to.equal(wallet1.address);
    });

    it("Should update existing profile", async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Old Name");
      await tracker.connect(user1).createProfile(wallet1.address, "New Name");

      const profile = await tracker.getProfile(wallet1.address);
      expect(profile.name).to.equal("New Name");
    });

    it("Should emit ProfileCreated event", async function () {
      await expect(
        tracker.connect(user1).createProfile(wallet1.address, "Test Wallet")
      ).to.emit(tracker, "ProfileCreated");
    });

    it("Should track activity status", async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Active");
      const profile = await tracker.getProfile(wallet1.address);
      expect(profile.isActive).to.be.true;
    });
  });

  describe("Watchlist Management", function () {
    beforeEach(async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Wallet 1");
      await tracker.connect(user1).createProfile(wallet2.address, "Wallet 2");
      await tracker.connect(user1).createProfile(wallet3.address, "Wallet 3");
    });

    it("Should add wallet to watchlist", async function () {
      await tracker.connect(user1).addToWatchlist(wallet1.address);

      const watchlist = await tracker.getWatchlist(user1.address);
      expect(watchlist).to.include(wallet1.address);
    });

    it("Should remove wallet from watchlist", async function () {
      await tracker.connect(user1).addToWatchlist(wallet1.address);
      await tracker.connect(user1).removeFromWatchlist(wallet1.address);

      const watchlist = await tracker.getWatchlist(user1.address);
      expect(watchlist).to.not.include(wallet1.address);
    });

    it("Should emit AddedToWatchlist event", async function () {
      await expect(
        tracker.connect(user1).addToWatchlist(wallet1.address)
      ).to.emit(tracker, "AddedToWatchlist");
    });

    it("Should enforce watchlist size limit (50)", async function () {
      const signers = await ethers.getSigners();

      // Create 50 profiles
      for (let i = 0; i < 50; i++) {
        const walletAddr = signers[i % signers.length].address;
        await tracker.connect(user1).createProfile(walletAddr, `Wallet ${i}`);
        await tracker.connect(user1).addToWatchlist(walletAddr);
      }

      // Try to add 51st wallet
      const newSigner = signers[0];
      await tracker.connect(user1).createProfile(newSigner.address, "Extra");

      await expect(
        tracker.connect(user1).addToWatchlist(newSigner.address)
      ).to.be.revertedWith("Watchlist full");
    });

    it("Should prevent duplicate watchlist entries", async function () {
      await tracker.connect(user1).addToWatchlist(wallet1.address);

      await expect(
        tracker.connect(user1).addToWatchlist(wallet1.address)
      ).to.be.revertedWith("Already in watchlist");
    });

    it("Should get watchlist for user", async function () {
      await tracker.connect(user1).addToWatchlist(wallet1.address);
      await tracker.connect(user1).addToWatchlist(wallet2.address);

      const watchlist = await tracker.getWatchlist(user1.address);
      expect(watchlist).to.have.lengthOf(2);
      expect(watchlist).to.include(wallet1.address);
      expect(watchlist).to.include(wallet2.address);
    });

    it("Should isolate watchlists per user", async function () {
      await tracker.connect(user1).addToWatchlist(wallet1.address);
      await tracker.connect(user2).addToWatchlist(wallet2.address);

      const watchlist1 = await tracker.getWatchlist(user1.address);
      const watchlist2 = await tracker.getWatchlist(user2.address);

      expect(watchlist1).to.include(wallet1.address);
      expect(watchlist1).to.not.include(wallet2.address);
      expect(watchlist2).to.include(wallet2.address);
      expect(watchlist2).to.not.include(wallet1.address);
    });
  });

  describe("Campaign Tracking", function () {
    beforeEach(async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Wallet 1");
    });

    it("Should track campaign data", async function () {
      const campaignData = {
        campaignId: ethers.id("campaign1"),
        token: "0x0000000000000000000000000000000000000000",
        allocated: ethers.parseEther("1000"),
        claimed: ethers.parseEther("500"),
        chainId: 1n
      };

      await tracker
        .connect(user1)
        .trackCampaignData(wallet1.address, campaignData);

      const campaigns = await tracker.getWalletCampaigns(wallet1.address);
      expect(campaigns).to.have.lengthOf.greaterThan(0);
    });

    it("Should record claim events", async function () {
      const campaignId = ethers.id("campaign1");

      await tracker.connect(user1).recordClaim(
        wallet1.address,
        campaignId,
        ethers.parseEther("100"),
        1n
      );

      const campaigns = await tracker.getWalletCampaigns(wallet1.address);
      expect(campaigns.length).to.be.greaterThan(0);
    });

    it("Should emit CampaignDataTracked event", async function () {
      const campaignData = {
        campaignId: ethers.id("campaign1"),
        token: "0x0000000000000000000000000000000000000000",
        allocated: ethers.parseEther("1000"),
        claimed: ethers.parseEther("500"),
        chainId: 1n
      };

      await expect(
        tracker
          .connect(user1)
          .trackCampaignData(wallet1.address, campaignData)
      ).to.emit(tracker, "CampaignDataTracked");
    });

    it("Should track multiple campaigns per wallet", async function () {
      const campaign1 = {
        campaignId: ethers.id("campaign1"),
        token: "0x0000000000000000000000000000000000000001",
        allocated: ethers.parseEther("1000"),
        claimed: ethers.parseEther("500"),
        chainId: 1n
      };

      const campaign2 = {
        campaignId: ethers.id("campaign2"),
        token: "0x0000000000000000000000000000000000000002",
        allocated: ethers.parseEther("2000"),
        claimed: ethers.parseEther("1000"),
        chainId: 2n
      };

      await tracker
        .connect(user1)
        .trackCampaignData(wallet1.address, campaign1);
      await tracker
        .connect(user1)
        .trackCampaignData(wallet1.address, campaign2);

      const campaigns = await tracker.getWalletCampaigns(wallet1.address);
      expect(campaigns.length).to.equal(2);
    });
  });

  describe("Portfolio Management", function () {
    beforeEach(async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Wallet 1");

      const campaignData = {
        campaignId: ethers.id("campaign1"),
        token: "0x0000000000000000000000000000000000000000",
        allocated: ethers.parseEther("1000"),
        claimed: ethers.parseEther("500"),
        chainId: 1n
      };

      await tracker
        .connect(user1)
        .trackCampaignData(wallet1.address, campaignData);
    });

    it("Should get portfolio", async function () {
      const portfolio = await tracker.getPortfolio(wallet1.address);
      expect(portfolio.totalAllocated).to.be.greaterThan(0);
    });

    it("Should create snapshot", async function () {
      await tracker.connect(user1).createSnapshot(wallet1.address);

      const snapshots = await tracker.getPortfolioHistory(wallet1.address);
      expect(snapshots.length).to.be.greaterThan(0);
    });

    it("Should emit SnapshotCreated event", async function () {
      await expect(
        tracker.connect(user1).createSnapshot(wallet1.address)
      ).to.emit(tracker, "SnapshotCreated");
    });

    it("Should track portfolio changes over time", async function () {
      await tracker.connect(user1).createSnapshot(wallet1.address);

      // Add more campaign data
      const newCampaign = {
        campaignId: ethers.id("campaign2"),
        token: "0x0000000000000000000000000000000000000001",
        allocated: ethers.parseEther("500"),
        claimed: ethers.parseEther("250"),
        chainId: 1n
      };

      await tracker
        .connect(user1)
        .trackCampaignData(wallet1.address, newCampaign);

      await tracker.connect(user1).createSnapshot(wallet1.address);

      const snapshots = await tracker.getPortfolioHistory(wallet1.address);
      expect(snapshots.length).to.equal(2);
    });
  });

  describe("Batch Operations", function () {
    beforeEach(async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Wallet 1");
      await tracker.connect(user1).createProfile(wallet2.address, "Wallet 2");
      await tracker.connect(user1).createProfile(wallet3.address, "Wallet 3");
    });

    it("Should batch get metrics", async function () {
      const wallets = [wallet1.address, wallet2.address, wallet3.address];

      const metrics = await tracker.batchGetMetrics(wallets);
      expect(metrics).to.have.lengthOf(3);
    });

    it("Should handle errors in batch operations", async function () {
      const wallets = [
        wallet1.address,
        ethers.ZeroAddress,
        wallet3.address
      ];

      const metrics = await tracker.batchGetMetrics(wallets);
      expect(metrics.length).to.be.greaterThan(0);
    });

    it("Should get metrics for multiple wallets", async function () {
      const wallets = [wallet1.address, wallet2.address];

      const metrics = await tracker.batchGetMetrics(wallets);
      expect(metrics).to.have.lengthOf(2);
      expect(metrics[0].address).to.equal(wallet1.address);
      expect(metrics[1].address).to.equal(wallet2.address);
    });
  });

  describe("Wallet Comparison", function () {
    beforeEach(async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Wallet 1");
      await tracker.connect(user1).createProfile(wallet2.address, "Wallet 2");

      // Add campaign data to wallet 1
      const campaign1 = {
        campaignId: ethers.id("campaign1"),
        token: "0x0000000000000000000000000000000000000001",
        allocated: ethers.parseEther("1000"),
        claimed: ethers.parseEther("500"),
        chainId: 1n
      };

      // Add different campaign data to wallet 2
      const campaign2 = {
        campaignId: ethers.id("campaign2"),
        token: "0x0000000000000000000000000000000000000002",
        allocated: ethers.parseEther("2000"),
        claimed: ethers.parseEther("1200"),
        chainId: 1n
      };

      await tracker
        .connect(user1)
        .trackCampaignData(wallet1.address, campaign1);
      await tracker
        .connect(user1)
        .trackCampaignData(wallet2.address, campaign2);
    });

    it("Should compare two wallets", async function () {
      const comparison = await tracker.compareWallets(
        wallet1.address,
        wallet2.address
      );
      expect(comparison).to.not.be.null;
    });

    it("Should calculate allocation difference", async function () {
      const comparison = await tracker.compareWallets(
        wallet1.address,
        wallet2.address
      );
      expect(comparison.wallet1Allocated).to.equal(
        ethers.parseEther("1000")
      );
      expect(comparison.wallet2Allocated).to.equal(
        ethers.parseEther("2000")
      );
    });

    it("Should identify wallet with higher allocation", async function () {
      const comparison = await tracker.compareWallets(
        wallet1.address,
        wallet2.address
      );
      expect(comparison.wallet2Allocated).to.be.greaterThan(
        comparison.wallet1Allocated
      );
    });

    it("Should emit ProfileUpdated event", async function () {
      await expect(
        tracker
          .connect(user1)
          .createProfile(wallet1.address, "Updated Name")
      ).to.emit(tracker, "ProfileUpdated");
    });
  });

  describe("Access Control", function () {
    it("Should validate wallet address", async function () {
      await expect(
        tracker.connect(user1).createProfile(ethers.ZeroAddress, "Invalid")
      ).to.be.revertedWith("Invalid wallet");
    });

    it("Should prevent operations on non-existent profiles", async function () {
      await expect(
        tracker.connect(user1).getProfile(wallet1.address)
      ).to.be.revertedWith("Profile does not exist");
    });

    it("Should allow any user to create profiles", async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "User1 Profile");
      await tracker.connect(user2).createProfile(wallet1.address, "User2 Profile");

      const profile1 = await tracker.getProfile(wallet1.address);
      expect(profile1).to.exist;
    });
  });

  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Wallet 1");
      await tracker.connect(user1).addToWatchlist(wallet1.address);
    });

    it("Should efficiently handle profile creation", async function () {
      const tx = await tracker
        .connect(user1)
        .createProfile(wallet2.address, "Wallet 2");
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lessThan(500000);
    });

    it("Should efficiently handle watchlist operations", async function () {
      const tx = await tracker.connect(user1).addToWatchlist(wallet2.address);
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lessThan(200000);
    });

    it("Should efficiently handle batch operations", async function () {
      const wallets = [wallet1.address];
      const tx = await tracker.batchGetMetrics(wallets);
      expect(tx).to.exist;
    });
  });

  describe("Event Tracking", function () {
    it("Should track all profile events", async function () {
      const createTx = await tracker
        .connect(user1)
        .createProfile(wallet1.address, "Test");
      await createTx.wait();

      const updateTx = await tracker
        .connect(user1)
        .createProfile(wallet1.address, "Updated");
      await updateTx.wait();

      expect(createTx).to.emit(tracker, "ProfileCreated");
      expect(updateTx).to.emit(tracker, "ProfileUpdated");
    });

    it("Should track watchlist events", async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Test");

      const addTx = await tracker
        .connect(user1)
        .addToWatchlist(wallet1.address);
      const removeTx = await tracker
        .connect(user1)
        .removeFromWatchlist(wallet1.address);

      expect(addTx).to.emit(tracker, "AddedToWatchlist");
      expect(removeTx).to.emit(tracker, "RemovedFromWatchlist");
    });

    it("Should track campaign events", async function () {
      await tracker.connect(user1).createProfile(wallet1.address, "Test");

      const campaignData = {
        campaignId: ethers.id("campaign1"),
        token: "0x0000000000000000000000000000000000000000",
        allocated: ethers.parseEther("1000"),
        claimed: ethers.parseEther("500"),
        chainId: 1n
      };

      const tx = await tracker
        .connect(user1)
        .trackCampaignData(wallet1.address, campaignData);

      expect(tx).to.emit(tracker, "CampaignDataTracked");
    });
  });
});
