const { expect } = require("chai");

describe("SimplePayments", function () {
  it("should set deployer as owner and accept payments", async function () {
    const [owner, payer] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SimplePayments");
    const contract = await Factory.connect(owner).deploy();
    await contract.deployed();

    // owner should be the deployer
    expect(await contract.owner()).to.equal(owner.address);

    // send 0.01 ether from payer
    const sendTx = await payer.sendTransaction({
      to: contract.address,
      value: ethers.utils.parseEther("0.01"),
    });
    await sendTx.wait();

    // balance should reflect the payment
    const bal = await ethers.provider.getBalance(contract.address);
    expect(bal).to.equal(ethers.utils.parseEther("0.01"));

    // owner withdraws
    const before = await ethers.provider.getBalance(owner.address);
    const withdrawTx = await contract.connect(owner).withdraw(owner.address, ethers.utils.parseEther("0.005"));
    await withdrawTx.wait();

    const balAfter = await ethers.provider.getBalance(contract.address);
    expect(balAfter).to.equal(ethers.utils.parseEther("0.005"));
  });
});
