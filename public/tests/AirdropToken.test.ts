import { expect } from "chai";
import { ethers } from "hardhat";
import { AirdropToken } from "../typechain-types";

describe("AirdropToken", function () {
  let airdropToken: AirdropToken;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const AirdropToken = await ethers.getContractFactory("AirdropToken");
    airdropToken = await AirdropToken.deploy();
    await airdropToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await airdropToken.name()).to.equal("AirStack Token");
      expect(await airdropToken.symbol()).to.equal("AIRST");
    });

    it("Should have 6 decimals", async function () {
      expect(await airdropToken.decimals()).to.equal(6);
    });

    it("Should mint initial supply to owner", async function () {
      const totalSupply = await airdropToken.totalSupply();
      const expectedSupply = ethers.parseUnits("1000000000", 6); // 1 billion

      expect(totalSupply).to.equal(expectedSupply);
    });

    it("Should assign initial balance to owner", async function () {
      const ownerBalance = await airdropToken.balanceOf(owner.address);
      const expectedBalance = ethers.parseUnits("1000000000", 6);

      expect(ownerBalance).to.equal(expectedBalance);
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseUnits("50", 6);

      await airdropToken.transfer(addr1.address, transferAmount);

      const addr1Balance = await airdropToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("Should fail transfer if insufficient balance", async function () {
      const transferAmount = ethers.parseUnits("1000000001", 6); // More than available

      await expect(
        airdropToken.transfer(addr1.address, transferAmount)
      ).to.be.revertedWithoutReason();
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);

      await airdropToken.mint(addr1.address, mintAmount);

      const balance = await airdropToken.balanceOf(addr1.address);
      expect(balance).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);

      await expect(
        airdropToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWithCustomError(airdropToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    it("Should burn tokens", async function () {
      const burnAmount = ethers.parseUnits("100", 6);
      const initialBalance = await airdropToken.balanceOf(owner.address);

      await airdropToken.burn(burnAmount);

      const finalBalance = await airdropToken.balanceOf(owner.address);
      expect(initialBalance - finalBalance).to.equal(burnAmount);
    });
  });

  describe("Token URI", function () {
    it("Should return default token URI", async function () {
      const uri = await airdropToken.getTokenURI();
      expect(uri).to.equal("https://airstack.io/token-metadata.json");
    });

    it("Should allow owner to set token URI", async function () {
      const newURI = "https://example.com/token-metadata.json";

      await airdropToken.setTokenURI(newURI);

      const uri = await airdropToken.getTokenURI();
      expect(uri).to.equal(newURI);
    });
  });
});
