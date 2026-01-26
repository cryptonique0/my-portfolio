import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("StakingRewards", function () {
  it("accrues and pays rewards", async function () {
    const [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("AirdropToken");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const tokenAddr = await token.getAddress();

    const rate = ethers.parseUnits("1", 18); // 1e18 per second per token
    const Staking = await ethers.getContractFactory("StakingRewards");
    const staking = await Staking.deploy(tokenAddr, tokenAddr, rate);
    await staking.waitForDeployment();

    // Fund user with tokens and approve staking
    await (await token.transfer(user.address, ethers.parseUnits("1000", 6))).wait();
    const userToken = token.connect(user);
    await (await userToken.approve(await staking.getAddress(), ethers.parseUnits("1000", 6))).wait();

    await (await staking.connect(user).stake(ethers.parseUnits("100", 6))).wait();
    await time.increase(10);

    const pending = await staking.pendingRewards(user.address);
    expect(pending).to.be.gt(0n);

    const balBefore = await token.balanceOf(user.address);
    await (await staking.connect(user).claim()).wait();
    const balAfter = await token.balanceOf(user.address);
    expect(balAfter).to.be.gt(balBefore);
  });
});
