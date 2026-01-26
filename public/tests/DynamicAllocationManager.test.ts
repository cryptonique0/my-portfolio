import { expect } from "chai";
import { ethers } from "hardhat";
import { DynamicAllocationManager } from "../typechain-types";
import { parseUnits } from "ethers/lib/utils";

describe("DynamicAllocationManager", function () {
    let dynamicManager: DynamicAllocationManager;
    let mockToken: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy DynamicAllocationManager
        const DynamicManagerFactory = await ethers.getContractFactory("DynamicAllocationManager");
        dynamicManager = await DynamicManagerFactory.deploy();
        await dynamicManager.deployed();

        // Deploy mock token
        const ERC20Factory = await ethers.getContractFactory("ERC20Mock");
        mockToken = await ERC20Factory.deploy("Test Token", "TEST", parseUnits("1000000", 18));
        await mockToken.deployed();

        // Transfer tokens to manager
        await mockToken.transfer(dynamicManager.address, parseUnits("100000", 18));
    });

    describe("Dynamic Airdrop Creation", function () {
        it("Should create time-based dynamic airdrop", async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            const tx = await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18), // Base allocation
                parseUnits("10000", 18),
                0, // TIME_BASED
                startTime,
                endTime
            );

            await expect(tx)
                .to.emit(dynamicManager, "DynamicAirdropCreated")
                .withArgs(
                    0,
                    mockToken.address,
                    0,
                    parseUnits("100", 18),
                    startTime
                );

            const airdrop = await dynamicManager.getAirdropDetails(0);
            expect(airdrop.baseAllocation).to.equal(parseUnits("100", 18));
        });

        it("Should create price-based dynamic airdrop", async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18),
                parseUnits("10000", 18),
                1, // PRICE_BASED
                startTime,
                endTime
            );

            const airdrop = await dynamicManager.getAirdropDetails(0);
            expect(airdrop.adjustmentType).to.equal(1);
        });

        it("Should reject invalid parameters", async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await expect(
                dynamicManager.createDynamicAirdrop(
                    ethers.constants.AddressZero,
                    parseUnits("100", 18),
                    parseUnits("10000", 18),
                    0,
                    startTime,
                    endTime
                )
            ).to.be.revertedWith("Invalid token");

            await expect(
                dynamicManager.createDynamicAirdrop(
                    mockToken.address,
                    0,
                    parseUnits("10000", 18),
                    0,
                    startTime,
                    endTime
                )
            ).to.be.revertedWith("Invalid base allocation");
        });
    });

    describe("Adjustment Rules", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18),
                parseUnits("10000", 18),
                0, // TIME_BASED
                startTime,
                endTime
            );
        });

        it("Should set adjustment rules", async () => {
            const thresholdTime = Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60;

            const tx = await dynamicManager.setAdjustmentRule(
                0,
                0, // TIME_BASED
                thresholdTime,
                80, // Min 0.8x
                120, // Max 1.2x
                ethers.constants.AddressZero,
                ethers.constants.AddressZero
            );

            await expect(tx)
                .to.emit(dynamicManager, "AdjustmentRuleSet")
                .withArgs(0, 0, 80, 120);

            const rule = await dynamicManager.getAdjustmentRule(0);
            expect(rule.minMultiplier).to.equal(80);
            expect(rule.maxMultiplier).to.equal(120);
        });

        it("Should reject invalid multipliers", async () => {
            await expect(
                dynamicManager.setAdjustmentRule(
                    0,
                    0,
                    0,
                    150, // Max > Min, should fail
                    120,
                    ethers.constants.AddressZero,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Invalid multipliers");

            await expect(
                dynamicManager.setAdjustmentRule(
                    0,
                    0,
                    0,
                    0, // Min must be > 0
                    120,
                    ethers.constants.AddressZero,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Min multiplier must be > 0");
        });
    });

    describe("Dynamic Allocation with Adjustments", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000) - 10;
            const endTime = startTime + 30 * 24 * 60 * 60;

            await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18),
                parseUnits("10000", 18),
                0, // TIME_BASED
                startTime,
                endTime
            );

            const thresholdTime = Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60;

            await dynamicManager.setAdjustmentRule(
                0,
                0,
                thresholdTime,
                80, // Min 0.8x
                120, // Max 1.2x
                ethers.constants.AddressZero,
                ethers.constants.AddressZero
            );
        });

        it("Should allocate with time-based adjustments", async () => {
            const recipients = [addr1.address, addr2.address];
            const baseAmounts = [parseUnits("100", 18), parseUnits("100", 18)];

            await dynamicManager.batchAllocateAndAdjust(0, recipients, baseAmounts);

            const allocation = await dynamicManager.getUserAllocation(0, addr1.address);
            expect(allocation.baseAmount).to.equal(parseUnits("100", 18));
            expect(allocation.currentAmount).to.be.gt(0);
            expect(allocation.adjustmentPercentage).to.be.gt(0);
        });

        it("Should allow re-adjusting allocations", async () => {
            const recipients = [addr1.address];
            const baseAmounts = [parseUnits("100", 18)];

            await dynamicManager.batchAllocateAndAdjust(0, recipients, baseAmounts);

            const initialAllocation = await dynamicManager.getUserAllocation(0, addr1.address);

            // Update allocation (in case conditions changed)
            await dynamicManager.updateAllocationForUser(0, addr1.address);

            const updatedAllocation = await dynamicManager.getUserAllocation(0, addr1.address);
            expect(updatedAllocation.adjustmentPercentage).to.be.gt(0);
        });

        it("Should reject updates for claimed users", async () => {
            const recipients = [addr1.address];
            const baseAmounts = [parseUnits("100", 18)];

            await dynamicManager.batchAllocateAndAdjust(0, recipients, baseAmounts);
            await dynamicManager.connect(addr1).claimTokens(0);

            await expect(
                dynamicManager.updateAllocationForUser(0, addr1.address)
            ).to.be.revertedWith("Already claimed");
        });
    });

    describe("Dynamic Token Claiming", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000) - 10;
            const endTime = startTime + 30 * 24 * 60 * 60;

            await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18),
                parseUnits("10000", 18),
                0, // TIME_BASED
                startTime,
                endTime
            );

            const thresholdTime = Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60;

            await dynamicManager.setAdjustmentRule(
                0,
                0,
                thresholdTime,
                80,
                120,
                ethers.constants.AddressZero,
                ethers.constants.AddressZero
            );

            const recipients = [addr1.address];
            const baseAmounts = [parseUnits("100", 18)];

            await dynamicManager.batchAllocateAndAdjust(0, recipients, baseAmounts);
        });

        it("Should claim dynamically adjusted tokens", async () => {
            const initialBalance = await mockToken.balanceOf(addr1.address);

            await dynamicManager.connect(addr1).claimTokens(0);

            const finalBalance = await mockToken.balanceOf(addr1.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should prevent double claiming", async () => {
            await dynamicManager.connect(addr1).claimTokens(0);

            await expect(
                dynamicManager.connect(addr1).claimTokens(0)
            ).to.be.revertedWith("Already claimed");
        });

        it("Should prevent claiming before airdrop starts", async () => {
            const futureStartTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
            const futureEndTime = futureStartTime + 30 * 24 * 60 * 60;

            await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18),
                parseUnits("10000", 18),
                0,
                futureStartTime,
                futureEndTime
            );

            const recipients = [addr1.address];
            const baseAmounts = [parseUnits("100", 18)];

            await dynamicManager.batchAllocateAndAdjust(1, recipients, baseAmounts);

            await expect(
                dynamicManager.connect(addr1).claimTokens(1)
            ).to.be.revertedWith("Airdrop not started");
        });

        it("Should prevent claiming after airdrop ends", async () => {
            const pastStartTime = Math.floor(Date.now() / 1000) - 40 * 24 * 60 * 60;
            const pastEndTime = Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60;

            await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18),
                parseUnits("10000", 18),
                0,
                pastStartTime,
                pastEndTime
            );

            const recipients = [addr1.address];
            const baseAmounts = [parseUnits("100", 18)];

            await dynamicManager.batchAllocateAndAdjust(1, recipients, baseAmounts);

            await expect(
                dynamicManager.connect(addr1).claimTokens(1)
            ).to.be.revertedWith("Airdrop ended");
        });
    });

    describe("Admin Functions", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18),
                parseUnits("10000", 18),
                0,
                startTime,
                endTime
            );
        });

        it("Should pause/unpause claims", async () => {
            await dynamicManager.pause();
            await dynamicManager.unpause();
        });

        it("Should deactivate airdrop", async () => {
            await dynamicManager.deactivateAirdrop(0);
            const airdrop = await dynamicManager.getAirdropDetails(0);
            expect(airdrop.active).to.equal(false);
        });

        it("Should recover tokens", async () => {
            const initialBalance = await mockToken.balanceOf(owner.address);

            await dynamicManager.recoverTokens(mockToken.address, parseUnits("1000", 18));

            const finalBalance = await mockToken.balanceOf(owner.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should only allow owner to call admin functions", async () => {
            await expect(
                dynamicManager.connect(addr1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                dynamicManager.connect(addr1).deactivateAirdrop(0)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Claim Rate Calculation", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000) - 10;
            const endTime = startTime + 30 * 24 * 60 * 60;

            await dynamicManager.createDynamicAirdrop(
                mockToken.address,
                parseUnits("100", 18),
                parseUnits("10000", 18),
                0,
                startTime,
                endTime
            );

            const thresholdTime = Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60;

            await dynamicManager.setAdjustmentRule(
                0,
                0,
                thresholdTime,
                80,
                120,
                ethers.constants.AddressZero,
                ethers.constants.AddressZero
            );

            const recipients = [addr1.address, addr2.address];
            const baseAmounts = [parseUnits("100", 18), parseUnits("100", 18)];

            await dynamicManager.batchAllocateAndAdjust(0, recipients, baseAmounts);
        });

        it("Should track claim rate", async () => {
            let claimRate = await dynamicManager.getClaimRate(0);
            expect(claimRate).to.equal(0);

            await dynamicManager.connect(addr1).claimTokens(0);

            claimRate = await dynamicManager.getClaimRate(0);
            expect(claimRate).to.be.gt(0);
        });
    });
});
