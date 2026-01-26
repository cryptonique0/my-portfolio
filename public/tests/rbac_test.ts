import { expect } from "chai";
import { ethers } from "hardhat";

describe("RoleBasedAccessControl", function () {
  it("grants and revokes roles", async function () {
    const [owner, user] = await ethers.getSigners();
    const RBAC = await ethers.getContractFactory("RoleBasedAccessControl");
    const rbac = await RBAC.deploy();
    await rbac.waitForDeployment();

    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));

    expect(await rbac.hasRoleFor(owner.address, ADMIN_ROLE)).to.equal(true);
    expect(await rbac.hasRoleFor(user.address, OPERATOR_ROLE)).to.equal(false);

    await (await rbac.grantRole(OPERATOR_ROLE, user.address)).wait();
    expect(await rbac.hasRoleFor(user.address, OPERATOR_ROLE)).to.equal(true);

    await (await rbac.revokeRole(OPERATOR_ROLE, user.address)).wait();
    expect(await rbac.hasRoleFor(user.address, OPERATOR_ROLE)).to.equal(false);
  });
});
