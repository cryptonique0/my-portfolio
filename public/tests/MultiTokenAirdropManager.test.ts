import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiTokenAirdropManager } from "../typechain-types";
import { parseUnits } from "ethers/lib/utils";

describe("MultiTokenAirdropManager", function () {
    let multiTokenManager: MultiTokenAirdropManager;
    let mockToken1: any;
    let mockToken2: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy MultiTokenAirdropManager
        const MultiTokenManagerFactory = await ethers.getContractFactory(
            "MultiTokenAirdropManager"
        );
        multiTokenManager = await MultiTokenManagerFactory.deploy();
        await multiTokenManager.deployed();

        // Deploy mock tokens
        const ERC20Factory = await ethers.getContractFactory("ERC20Mock");
        mockToken1 = await ERC20Factory.deploy("Token 1", "TOK1", parseUnits("1000000", 18));
        mockToken2 = await ERC20Factory.deploy("Token 2", "TOK2", parseUnits("1000000", 18));
        await mockToken1.deployed();
        await mockToken2.deployed();

        // Transfer tokens to manager contract
        await mockToken1.transfer(multiTokenManager.address, parseUnits("100000", 18));
        await mockToken2.transfer(multiTokenManager.address, parseUnits("100000", 18));
    });

    describe("Token Airdrop Creation", function () {
        it("Should create token airdrop without whitelist requirement", async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            const tx = await multiTokenManager.createTokenAirdrop(
                mockToken1.address,
                "Token 1",
                18,
                parseUnits("1000", 18),
                startTime,
                endTime
            );

            await expect(tx)
                .to.emit(multiTokenManager, "TokenAirdropCreated")
                .withArgs(0, mockToken1.address, "Token 1", parseUnits("1000", 18), startTime);

            const airdrop = await multiTokenManager.getAirdropDetails(0);
            expect(airdrop.tokenName).to.equal("Token 1");
            expect(airdrop.tokenDecimals).to.equal(18);
        });

        it("Should support whitelisting tokens", async () => {
            await multiTokenManager.toggleWhitelistRequirement(true);
            
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            // Should fail without whitelist
            await expect(
                multiTokenManager.createTokenAirdrop(
                    mockToken1.address,
                    "Token 1",
                    18,
                    parseUnits("1000", 18),
                    startTime,
                    endTime
                )
            ).to.be.revertedWith("Token not whitelisted");

            // Whitelist token and try again
            await multiTokenManager.whitelistToken(mockToken1.address);
            expect(await multiTokenManager.isTokenWhitelisted(mockToken1.address)).to.be.true;

            await multiTokenManager.createTokenAirdrop(
                mockToken1.address,
                "Token 1",
                18,
                parseUnits("1000", 18),
                startTime,
                endTime
            );

            const airdrop = await multiTokenManager.getAirdropDetails(0);
            expect(airdrop.tokenContract).to.equal(mockToken1.address);
        });

        it("Should remove token from whitelist", async () => {
            await multiTokenManager.whitelistToken(mockToken1.address);
            expect(await multiTokenManager.isTokenWhitelisted(mockToken1.address)).to.be.true;

            await multiTokenManager.removeTokenFromWhitelist(mockToken1.address);
            expect(await multiTokenManager.isTokenWhitelisted(mockToken1.address)).to.be.false;
        });

        it("Should reject invalid parameters", async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await expect(
                multiTokenManager.createTokenAirdrop(
                    ethers.constants.AddressZero,
                    "Test",
                    18,
                    parseUnits("1000", 18),
                    startTime,
                    endTime
                )
            ).to.be.revertedWith("Invalid token contract");
        });
    });

    describe("Multi-Token Allocation", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await multiTokenManager.createTokenAirdrop(
                mockToken1.address,
                "Token 1",
                18,
                parseUnits("10000", 18),
                startTime,
                endTime
            );

            await multiTokenManager.createTokenAirdrop(
                mockToken2.address,
                "Token 2",
                18,
                parseUnits("10000", 18),
                startTime,
                endTime
            );
        });

        it("Should allocate different tokens to users", async () => {
            const recipients = [addr1.address, addr2.address];
            const amounts = [parseUnits("100", 18), parseUnits("200", 18)];

            // Token 1 allocation
            await multiTokenManager.batchAllocateTokens(0, recipients, amounts);

            const allocation1 = await multiTokenManager.getTokenAllocation(0, addr1.address);
            expect(allocation1.amount).to.equal(parseUnits("100", 18));

            // Token 2 allocation
            await multiTokenManager.batchAllocateTokens(1, recipients, amounts);

            const allocation2 = await multiTokenManager.getTokenAllocation(1, addr1.address);
            expect(allocation2.amount).to.equal(parseUnits("100", 18));
        });

        it("Should allow allocation updates", async () => {
            await multiTokenManager.batchAllocateTokens(
                0,
                [addr1.address],
                [parseUnits("100", 18)]
            );

            // Update allocation
            await multiTokenManager.updateAllocation(
                0,
                addr1.address,
                parseUnits("150", 18)
            );

            const updated = await multiTokenManager.getTokenAllocation(0, addr1.address);
            expect(updated.amount).to.equal(parseUnits("150", 18));
        });

        it("Should reject allocation update for already-claimed user", async () => {
            await multiTokenManager.batchAllocateTokens(
                0,
                [addr1.address],
                [parseUnits("100", 18)]
            );

            await multiTokenManager.connect(addr1).claimTokens(0);

            await expect(
                multiTokenManager.updateAllocation(0, addr1.address, parseUnits("200", 18))
            ).to.be.revertedWith("User already claimed");
        });
    });

    describe("Multi-Token Claiming", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000) - 10;
            const endTime = startTime + 30 * 24 * 60 * 60;

            await multiTokenManager.createTokenAirdrop(
                mockToken1.address,
                "Token 1",
                18,
                parseUnits("10000", 18),
                startTime,
                endTime
            );

            await multiTokenManager.createTokenAirdrop(
                mockToken2.address,
                "Token 2",
                18,
                parseUnits("10000", 18),
                startTime,
                endTime
            );

            // Allocate both tokens to addr1
            await multiTokenManager.batchAllocateTokens(
                0,
                [addr1.address],
                [parseUnits("100", 18)]
            );

            await multiTokenManager.batchAllocateTokens(
                1,
                [addr1.address],
                [parseUnits("200", 18)]
            );
        });

        it("Should claim different tokens separately", async () => {
            const initialBalance1 = await mockToken1.balanceOf(addr1.address);
            const initialBalance2 = await mockToken2.balanceOf(addr1.address);

            // Claim Token 1
            await multiTokenManager.connect(addr1).claimTokens(0);
            let balance1 = await mockToken1.balanceOf(addr1.address);
            expect(balance1).to.equal(initialBalance1.add(parseUnits("100", 18)));

            // Claim Token 2
            await multiTokenManager.connect(addr1).claimTokens(1);
            let balance2 = await mockToken2.balanceOf(addr1.address);
            expect(balance2).to.equal(initialBalance2.add(parseUnits("200", 18)));
        });

        it("Should prevent double claiming", async () => {
            await multiTokenManager.connect(addr1).claimTokens(0);

            await expect(
                multiTokenManager.connect(addr1).claimTokens(0)
            ).to.be.revertedWith("Already claimed");
        });

        it("Should track claim rates per token", async () => {
            await multiTokenManager.connect(addr1).claimTokens(0);

            const claimRate = await multiTokenManager.getClaimRate(0);
            expect(claimRate).to.equal(1); // 100 out of 10000 = 1%
        });
    });

    describe("Admin Functions", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await multiTokenManager.createTokenAirdrop(
                mockToken1.address,
                "Token 1",
                18,
                parseUnits("1000", 18),
                startTime,
                endTime
            );
        });

        it("Should pause/unpause claims", async () => {
            await multiTokenManager.pause();
            await multiTokenManager.unpause();
        });

        it("Should deactivate airdrop", async () => {
            await multiTokenManager.deactivateAirdrop(0);
            const airdrop = await multiTokenManager.getAirdropDetails(0);
            expect(airdrop.active).to.equal(false);
        });

        it("Should recover tokens", async () => {
            const initialBalance = await mockToken1.balanceOf(owner.address);

            await multiTokenManager.recoverTokens(
                mockToken1.address,
                parseUnits("1000", 18)
            );

            const finalBalance = await mockToken1.balanceOf(owner.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should only allow owner to call admin functions", async () => {
            await expect(
                multiTokenManager.connect(addr1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                multiTokenManager.connect(addr1).deactivateAirdrop(0)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Whitelist Management", function () {
        it("Should toggle whitelist requirement", async () => {
            expect(await multiTokenManager.requireTokenWhitelist()).to.be.false;

            await expect(
                multiTokenManager.toggleWhitelistRequirement(true)
            ).to.emit(multiTokenManager, "WhitelistRequirementToggled");

            expect(await multiTokenManager.requireTokenWhitelist()).to.be.true;
        });

        it("Should track whitelisted tokens", async () => {
            await multiTokenManager.whitelistToken(mockToken1.address);
            expect(await multiTokenManager.isTokenWhitelisted(mockToken1.address)).to.be
                .true;

            await multiTokenManager.whitelistToken(mockToken2.address);
            expect(await multiTokenManager.isTokenWhitelisted(mockToken2.address)).to.be
                .true;
        });
    });
});
