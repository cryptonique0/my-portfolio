import { expect } from "chai";
import { ethers } from "hardhat";
import { ETHAirdropManager } from "../typechain-types";

describe("ETHAirdropManager", function () {
  let ethAirdropManager: ETHAirdropManager;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ETHAirdropManager = await ethers.getContractFactory("ETHAirdropManager");
    ethAirdropManager = await ETHAirdropManager.deploy();
    await ethAirdropManager.waitForDeployment();
  });

  describe("ETH Airdrop Creation", function () {
    it("Should create ETH airdrop with deposit", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 86400;
      const depositAmount = ethers.parseEther("10");

      const tx = await ethAirdropManager.createETHAirdrop(
        startTime,
        endTime,
        { value: depositAmount }
      );

      await expect(tx).to.emit(ethAirdropManager, "ETHAirdropCreated");
    });

    it("Should fail if no ETH deposited", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 86400;

      await expect(
        ethAirdropManager.createETHAirdrop(startTime, endTime)
      ).to.be.revertedWithoutReason();
    });
  });

  describe("ETH Allocation", function () {
    let airdropId: number;

    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 86400;
      const depositAmount = ethers.parseEther("10");

      await ethAirdropManager.createETHAirdrop(startTime, endTime, {
        value: depositAmount,
      });

      airdropId = 1;
    });

    it("Should set ETH allocation", async function () {
      const amount = ethers.parseEther("1");

      await ethAirdropManager.setETHAllocation(airdropId, addr1.address, amount);

      const allocation = await ethAirdropManager.getETHAllocation(airdropId, addr1.address);
      expect(allocation).to.equal(amount);
    });

    it("Should batch set ETH allocations", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.parseEther("1"), ethers.parseEther("2")];

      await ethAirdropManager.batchSetETHAllocations(airdropId, recipients, amounts);

      const allocation1 = await ethAirdropManager.getETHAllocation(airdropId, addr1.address);
      const allocation2 = await ethAirdropManager.getETHAllocation(airdropId, addr2.address);

      expect(allocation1).to.equal(amounts[0]);
      expect(allocation2).to.equal(amounts[1]);
    });
  });

  describe("ETH Claiming", function () {
    let airdropId: number;

    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 10;
      const endTime = startTime + 86400;
      const depositAmount = ethers.parseEther("10");

      await ethAirdropManager.createETHAirdrop(startTime, endTime, {
        value: depositAmount,
      });

      airdropId = 1;

      const amount = ethers.parseEther("5");
      await ethAirdropManager.setETHAllocation(airdropId, addr1.address, amount);

      // Wait for airdrop to start
      await ethers.provider.send("hardhat_mine", ["0x64"]);
    });

    it("Should allow claiming ETH", async function () {
      const initialBalance = await ethers.provider.getBalance(addr1.address);

      await ethAirdropManager.connect(addr1).claimETH(airdropId);

      const finalBalance = await ethers.provider.getBalance(addr1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should prevent double claiming", async function () {
      await ethAirdropManager.connect(addr1).claimETH(airdropId);

      await expect(
        ethAirdropManager.connect(addr1).claimETH(airdropId)
      ).to.be.revertedWithoutReason();
    });
  });
});
