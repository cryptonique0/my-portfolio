import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PriceDiscovery", function () {
  it("records observations and computes TWAP", async function () {
    const Price = await ethers.getContractFactory("PriceDiscovery");
    const window = 60; // seconds
    const price = await Price.deploy(window);
    await price.waitForDeployment();

    await (await price.recordObservation(ethers.parseUnits("10", 18))).wait();
    await time.increase(20);
    await (await price.recordObservation(ethers.parseUnits("20", 18))).wait();
    await time.increase(20);
    await (await price.recordObservation(ethers.parseUnits("30", 18))).wait();

    const twap = await price.getTwap();
    // TWAP should be between 10 and 30, closer to recent observations
    expect(twap).to.be.gt(ethers.parseUnits("10", 18));
    expect(twap).to.be.lt(ethers.parseUnits("30", 18));
  });
});
