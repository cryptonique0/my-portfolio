import { expect } from "chai";
import { ethers } from "hardhat";
import { AirdropManager, AirdropToken, WhitelistManager } from "../typechain-types";

describe("AirdropManager", function () {
  let airdropManager: AirdropManager;
  let airdropToken: AirdropToken;
  let whitelistManager: WhitelistManager;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy AirdropToken
    const AirdropToken = await ethers.getContractFactory("AirdropToken");
    airdropToken = await AirdropToken.deploy();
    await airdropToken.waitForDeployment();

    // Deploy AirdropManager
    const AirdropManager = await ethers.getContractFactory("AirdropManager");
    airdropManager = await AirdropManager.deploy();
    await airdropManager.waitForDeployment();

    // Deploy WhitelistManager
    const WhitelistManager = await ethers.getContractFactory("WhitelistManager");
    whitelistManager = await WhitelistManager.deploy();
    await whitelistManager.waitForDeployment();

    // Transfer tokens to manager
    const transferAmount = ethers.parseUnits("1000000", 6);
    await airdropToken.transfer(await airdropManager.getAddress(), transferAmount);
  });

  describe("Airdrop Creation", function () {
    it("Should create a new airdrop", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime + 86400; // 1 day later

      const tx = await airdropManager.createAirdrop(
        await airdropToken.getAddress(),
        ethers.parseUnits("100000", 6),
        startTime,
        endTime
      );

      await expect(tx).to.emit(airdropManager, "AirdropCreated");
    });

    it("Should not allow non-owner to create airdrop", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 86400;

      await expect(
        airdropManager.connect(addr1).createAirdrop(
          await airdropToken.getAddress(),
          ethers.parseUnits("100000", 6),
          startTime,
          endTime
        )
      ).to.be.revertedWithCustomError(airdropManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Allocation", function () {
    let airdropId: number;

    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 86400;

      const tx = await airdropManager.createAirdrop(
        await airdropToken.getAddress(),
        ethers.parseUnits("100000", 6),
        startTime,
        endTime
      );

      const receipt = await tx.wait();
      airdropId = 1;
    });

    it("Should set allocation for recipient", async function () {
      const amount = ethers.parseUnits("1000", 6);

      await airdropManager.setAllocation(airdropId, addr1.address, amount);

      const allocation = await airdropManager.getAllocation(airdropId, addr1.address);
      expect(allocation).to.equal(amount);
    });

    it("Should batch set allocations", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [
        ethers.parseUnits("1000", 6),
        ethers.parseUnits("2000", 6),
      ];

      await airdropManager.batchSetAllocations(airdropId, recipients, amounts);

      const allocation1 = await airdropManager.getAllocation(airdropId, addr1.address);
      const allocation2 = await airdropManager.getAllocation(airdropId, addr2.address);

      expect(allocation1).to.equal(amounts[0]);
      expect(allocation2).to.equal(amounts[1]);
    });
  });

  describe("Claiming", function () {
    let airdropId: number;

    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 10; // Start immediately
      const endTime = startTime + 86400;

      const tx = await airdropManager.createAirdrop(
        await airdropToken.getAddress(),
        ethers.parseUnits("100000", 6),
        startTime,
        endTime
      );

      airdropId = 1;

      // Set allocation
      const amount = ethers.parseUnits("5000", 6);
      await airdropManager.setAllocation(airdropId, addr1.address, amount);

      // Wait for airdrop to start
      await ethers.provider.send("hardhat_mine", ["0x64"]); // Mine some blocks
    });

    it("Should allow claiming tokens", async function () {
      const initialBalance = await airdropToken.balanceOf(addr1.address);

      await airdropManager.connect(addr1).claimTokens(airdropId);

      const finalBalance = await airdropToken.balanceOf(addr1.address);
      const amount = ethers.parseUnits("5000", 6);

      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should prevent double claiming", async function () {
      await airdropManager.connect(addr1).claimTokens(airdropId);

      await expect(
        airdropManager.connect(addr1).claimTokens(airdropId)
      ).to.be.revertedWithoutReason();
    });

    it("Should prevent claiming if not whitelisted", async function () {
      await expect(
        airdropManager.connect(addr2).claimTokens(airdropId)
      ).to.be.revertedWithoutReason();
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause and unpause claiming", async function () {
      await airdropManager.pause();
      expect(await airdropManager.paused()).to.be.true;

      await airdropManager.unpause();
      expect(await airdropManager.paused()).to.be.false;
    });
  });
});
