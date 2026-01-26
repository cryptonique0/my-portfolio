import { expect } from "chai";
import { ethers } from "hardhat";

describe("MultiTokenAirdropManager", function () {
  it("enforces compliance gating and allows claim", async function () {
    const [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("AirdropToken");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const tokenAddr = await token.getAddress();

    const RBAC = await ethers.getContractFactory("RoleBasedAccessControl");
    const rbac = await RBAC.deploy();
    await rbac.waitForDeployment();

    const KYC = await ethers.getContractFactory("KYCAMLCompliance");
    const kyc = await KYC.deploy();
    await kyc.waitForDeployment();

    const Manager = await ethers.getContractFactory("MultiTokenAirdropManager");
    const mgr = await Manager.deploy();
    await mgr.waitForDeployment();

    // Wire RBAC/KYC and create airdrop
    await (await mgr.setAccessControl(await rbac.getAddress())).wait();
    await (await mgr.setCompliance(await kyc.getAddress(), true)).wait();

    // Grant owner permission to create/manage
    const CREATE = ethers.toUtf8Bytes("canCreateAirdrop");
    const MANAGE = ethers.toUtf8Bytes("canManageUsers");
    await (await rbac.grantRole(ethers.keccak256(CREATE), owner.address)).wait();
    await (await rbac.grantRole(ethers.keccak256(MANAGE), owner.address)).wait();

    const now = Math.floor(Date.now() / 1000);
    const idTx = await mgr.createTokenAirdrop(tokenAddr, ethers.parseUnits("100", 6), BigInt(now + 10), BigInt(now + 100));
    const receipt = await idTx.wait();
    // Event carries id, but we can assume first id = 1
    const id = 1;

    // Fund manager with tokens and allocate to user
    await (await token.transfer(await mgr.getAddress(), ethers.parseUnits("100", 6))).wait();
    await (await mgr.batchAllocate(id, [user.address], [ethers.parseUnits("50", 6)])).wait();

    // User not approved yet -> claim fails after window opens
    await ethers.provider.send("evm_increaseTime", [15]);
    await ethers.provider.send("evm_mine", []);
    await expect(mgr.connect(user).claimTokens(id)).to.be.revertedWith("Not compliant");

    // Approve user and claim succeeds
    await (await kyc.setApproved(user.address, true)).wait();
    await (await mgr.connect(user).claimTokens(id)).wait();
    const bal = await token.balanceOf(user.address);
    expect(bal).to.equal(ethers.parseUnits("50", 6));
  });
});
