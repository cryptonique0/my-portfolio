import { expect } from "chai";
import { ethers } from "hardhat";
import { VestingSchedule, AirdropToken } from "../typechain-types";

describe("VestingSchedule", function () {
  let vestingSchedule: VestingSchedule;
  let airdropToken: AirdropToken;
  let owner: any;
  let beneficiary: any;

  beforeEach(async function () {
    [owner, beneficiary] = await ethers.getSigners();

    // Deploy token
    const AirdropToken = await ethers.getContractFactory("AirdropToken");
    airdropToken = await AirdropToken.deploy();
    await airdropToken.waitForDeployment();

    // Deploy vesting schedule
    const VestingSchedule = await ethers.getContractFactory("VestingSchedule");
    vestingSchedule = await VestingSchedule.deploy();
    await vestingSchedule.waitForDeployment();

    // Transfer tokens to vesting contract
    const transferAmount = ethers.parseUnits("100000", 6);
    await airdropToken.transfer(await vestingSchedule.getAddress(), transferAmount);
  });

  describe("Schedule Creation", function () {
    it("Should create vesting schedule", async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600;
      const cliffTime = now + 86400;
      const endTime = now + 2592000; // 30 days

      const tx = await vestingSchedule.createVestingSchedule(
        await airdropToken.getAddress(),
        beneficiary.address,
        ethers.parseUnits("10000", 6),
        startTime,
        cliffTime,
        endTime
      );

      await expect(tx).to.emit(vestingSchedule, "VestingScheduleCreated");

      const schedule = await vestingSchedule.getVestingSchedule(1);
      expect(schedule.beneficiary).to.equal(beneficiary.address);
      expect(schedule.totalAmount).to.equal(ethers.parseUnits("10000", 6));
    });
  });

  describe("Vesting Calculation", function () {
    let scheduleId: number;
    let startTime: number;
    let cliffTime: number;
    let endTime: number;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      startTime = now + 100;
      cliffTime = now + 1000;
      endTime = now + 10000;

      await vestingSchedule.createVestingSchedule(
        await airdropToken.getAddress(),
        beneficiary.address,
        ethers.parseUnits("10000", 6),
        startTime,
        cliffTime,
        endTime
      );

      scheduleId = 1;
    });

    it("Should show 0 vested before cliff", async function () {
      const vested = await vestingSchedule.calculateVested(scheduleId);
      expect(vested).to.equal(0);
    });

    it("Should show full amount after end time", async function () {
      // Mine blocks to reach end time
      await ethers.provider.send("hardhat_mine", ["0x3e8"]); // Mine many blocks
      await ethers.provider.send("hardhat_mine", ["0x3e8"]);

      const vested = await vestingSchedule.calculateVested(scheduleId);
      expect(vested).to.equal(ethers.parseUnits("10000", 6));
    });
  });

  describe("Token Claiming", function () {
    let scheduleId: number;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 10;
      const cliffTime = now + 50;
      const endTime = now + 100;

      await vestingSchedule.createVestingSchedule(
        await airdropToken.getAddress(),
        beneficiary.address,
        ethers.parseUnits("10000", 6),
        startTime,
        cliffTime,
        endTime
      );

      scheduleId = 1;

      // Mine blocks to pass cliff
      await ethers.provider.send("hardhat_mine", ["0x64"]);
    });

    it("Should allow beneficiary to claim vested tokens", async function () {
      const initialBalance = await airdropToken.balanceOf(beneficiary.address);

      await vestingSchedule.connect(beneficiary).claimVestedTokens(scheduleId);

      const finalBalance = await airdropToken.balanceOf(beneficiary.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should not allow non-beneficiary to claim", async function () {
      await expect(
        vestingSchedule.claimVestedTokens(scheduleId)
      ).to.be.revertedWithoutReason();
    });
  });
});
