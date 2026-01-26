import { expect } from "chai";
import { ethers } from "hardhat";

describe("KYCAMLCompliance", function () {
  it("sets and reads approvals", async function () {
    const [owner, user] = await ethers.getSigners();
    const KYC = await ethers.getContractFactory("KYCAMLCompliance");
    const kyc = await KYC.deploy();
    await kyc.waitForDeployment();

    expect(await kyc.isApproved(user.address)).to.equal(false);
    await (await kyc.setApproved(user.address, true)).wait();
    expect(await kyc.isApproved(user.address)).to.equal(true);

    await (await kyc.batchApprove([user.address], false)).wait();
    expect(await kyc.isApproved(user.address)).to.equal(false);
  });
});
