import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("FairLaunchMechanism", function () {
  it("collects deposits and distributes pro-rata", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("AirdropToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const now = await time.latest();
    const start = Number(now) + 10;
    const end = start + 60;

    const Fair = await ethers.getContractFactory("FairLaunchMechanism");
    const fair = await Fair.deploy(await token.getAddress(), start, end);
    await fair.waitForDeployment();

    // Fund sale token pool
    await (await token.transfer(owner.address, ethers.parseUnits("10000", 6))).wait();
    await (await token.approve(await fair.getAddress(), ethers.parseUnits("10000", 6))).wait();
    await (await fair.supplyTokenPool(ethers.parseUnits("10000", 6))).wait();

    await time.increaseTo(start + 1);

    // Deposits
    await user1.sendTransaction({ to: await fair.getAddress(), value: ethers.parseEther("1") });
    await user2.sendTransaction({ to: await fair.getAddress(), value: ethers.parseEther("3") });

    await time.increaseTo(end + 1);
    await (await fair.finalize()).wait();

    const bal1Before = await token.balanceOf(user1.address);
    await (await fair.connect(user1).claim()).wait();
    const bal1After = await token.balanceOf(user1.address);
    expect(bal1After).to.be.gt(bal1Before);

    const bal2Before = await token.balanceOf(user2.address);
    await (await fair.connect(user2).claim()).wait();
    const bal2After = await token.balanceOf(user2.address);
    expect(bal2After).to.be.gt(bal2Before);
  });
});
