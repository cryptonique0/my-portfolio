import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTAirdropManager, ERC721Mock, ERC1155Mock } from "../typechain-types";

describe("NFTAirdropManager", function () {
    let nftManager: NFTAirdropManager;
    let erc721Mock: any;
    let erc1155Mock: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy NFTAirdropManager
        const NFTAirdropManagerFactory = await ethers.getContractFactory("NFTAirdropManager");
        nftManager = await NFTAirdropManagerFactory.deploy();
        await nftManager.deployed();

        // Deploy mock ERC721
        const ERC721Factory = await ethers.getContractFactory("ERC721");
        erc721Mock = await ERC721Factory.deploy("Test NFT", "TNFT");
        await erc721Mock.deployed();

        // Mint some NFTs
        for (let i = 0; i < 5; i++) {
            await erc721Mock.mint(nftManager.address, i);
        }
    });

    describe("NFT Airdrop Creation", function () {
        it("Should create ERC721 airdrop", async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60; // 30 days

            const tx = await nftManager.createNFTAirdrop(
                erc721Mock.address,
                0, // ERC721
                "ERC721 Airdrop",
                "Distributing NFTs",
                5,
                startTime,
                endTime
            );

            await expect(tx)
                .to.emit(nftManager, "NFTAirdropCreated")
                .withArgs(0, erc721Mock.address, 0, 5, startTime);

            const airdrop = await nftManager.getAirdropDetails(0);
            expect(airdrop.totalNFTs).to.equal(5);
            expect(airdrop.name).to.equal("ERC721 Airdrop");
        });

        it("Should reject invalid airdrop parameters", async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await expect(
                nftManager.createNFTAirdrop(
                    ethers.constants.AddressZero,
                    0,
                    "Test",
                    "Test",
                    5,
                    startTime,
                    endTime
                )
            ).to.be.revertedWith("Invalid NFT contract");

            await expect(
                nftManager.createNFTAirdrop(
                    erc721Mock.address,
                    0,
                    "Test",
                    "Test",
                    5,
                    endTime,
                    startTime
                )
            ).to.be.revertedWith("Invalid time range");
        });
    });

    describe("NFT Allocation", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await nftManager.createNFTAirdrop(
                erc721Mock.address,
                0, // ERC721
                "ERC721 Airdrop",
                "Distributing NFTs",
                5,
                startTime,
                endTime
            );
        });

        it("Should allocate NFTs to recipients", async () => {
            const recipients = [addr1.address, addr2.address];
            const tokenIds = [0, 1];
            const quantities = [1, 1];

            await expect(
                nftManager.batchAllocateNFTs(0, recipients, tokenIds, quantities)
            )
                .to.emit(nftManager, "NFTAllocated")
                .withArgs(0, addr1.address, 0, 1);

            const allocations = await nftManager.getUserNFTAllocations(0, addr1.address);
            expect(allocations.length).to.equal(1);
            expect(allocations[0].tokenId).to.equal(0);
        });

        it("Should reject batch allocation with mismatched arrays", async () => {
            await expect(
                nftManager.batchAllocateNFTs(
                    0,
                    [addr1.address],
                    [0, 1], // Mismatched length
                    [1, 1]
                )
            ).to.be.revertedWith("Array length mismatch");
        });

        it("Should reject allocation to zero address", async () => {
            await expect(
                nftManager.batchAllocateNFTs(
                    0,
                    [ethers.constants.AddressZero],
                    [0],
                    [1]
                )
            ).to.be.revertedWith("Invalid recipient");
        });
    });

    describe("NFT Claiming", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await nftManager.createNFTAirdrop(
                erc721Mock.address,
                0, // ERC721
                "ERC721 Airdrop",
                "Distributing NFTs",
                5,
                startTime,
                endTime
            );

            const recipients = [addr1.address, addr2.address];
            const tokenIds = [0, 1];
            const quantities = [1, 1];

            await nftManager.batchAllocateNFTs(0, recipients, tokenIds, quantities);
        });

        it("Should claim allocated NFTs", async () => {
            await expect(nftManager.connect(addr1).claimNFTs(0))
                .to.emit(nftManager, "NFTClaimed")
                .withArgs(0, addr1.address, 0, 1);

            const owner = await erc721Mock.ownerOf(0);
            expect(owner).to.equal(addr1.address);
        });

        it("Should prevent double claiming", async () => {
            await nftManager.connect(addr1).claimNFTs(0);

            await expect(
                nftManager.connect(addr1).claimNFTs(0)
            ).to.be.revertedWith("Already claimed");
        });

        it("Should prevent claiming before airdrop starts", async () => {
            const futureStartTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
            const futureEndTime = futureStartTime + 30 * 24 * 60 * 60;

            await nftManager.createNFTAirdrop(
                erc721Mock.address,
                0,
                "Future Airdrop",
                "Test",
                5,
                futureStartTime,
                futureEndTime
            );

            const recipients = [addr1.address];
            const tokenIds = [2];
            const quantities = [1];

            await nftManager.batchAllocateNFTs(1, recipients, tokenIds, quantities);

            await expect(
                nftManager.connect(addr1).claimNFTs(1)
            ).to.be.revertedWith("Airdrop not started");
        });
    });

    describe("Metadata Management", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await nftManager.createNFTAirdrop(
                erc721Mock.address,
                0,
                "ERC721 Airdrop",
                "Distributing NFTs",
                5,
                startTime,
                endTime
            );
        });

        it("Should set NFT metadata", async () => {
            const tokenIds = [0, 1];
            const names = ["NFT #1", "NFT #2"];
            const imageURIs = ["ipfs://hash1", "ipfs://hash2"];
            const rarities = ["rare", "epic"];

            await expect(
                nftManager.setNFTMetadata(0, tokenIds, names, imageURIs, rarities)
            )
                .to.emit(nftManager, "MetadataSet")
                .withArgs(0, 0, "NFT #1", "rare");

            const metadata = await nftManager.getNFTMetadata(0, 0);
            expect(metadata.name).to.equal("NFT #1");
            expect(metadata.rarity).to.equal("rare");
        });

        it("Should reject mismatched metadata arrays", async () => {
            await expect(
                nftManager.setNFTMetadata(
                    0,
                    [0],
                    ["NFT #1", "NFT #2"], // Mismatched
                    ["ipfs://hash1"],
                    ["rare"]
                )
            ).to.be.revertedWith("Array length mismatch");
        });
    });

    describe("Admin Functions", function () {
        beforeEach(async () => {
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + 30 * 24 * 60 * 60;

            await nftManager.createNFTAirdrop(
                erc721Mock.address,
                0,
                "ERC721 Airdrop",
                "Distributing NFTs",
                5,
                startTime,
                endTime
            );
        });

        it("Should pause/unpause claims", async () => {
            await nftManager.pause();
            const airdrop = await nftManager.getAirdropDetails(0);
            expect(airdrop.active).to.equal(true); // Active, but paused at contract level

            await nftManager.unpause();
        });

        it("Should deactivate airdrop", async () => {
            await nftManager.deactivateAirdrop(0);
            const airdrop = await nftManager.getAirdropDetails(0);
            expect(airdrop.active).to.equal(false);
        });

        it("Should recover NFTs", async () => {
            const initialBalance = await erc721Mock.balanceOf(owner.address);
            
            // NFT 4 is in the contract, recover it
            await nftManager.recoverNFT(erc721Mock.address, 0, 4, 1);
            
            const finalBalance = await erc721Mock.balanceOf(owner.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should only allow owner to call admin functions", async () => {
            await expect(
                nftManager.connect(addr1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                nftManager.connect(addr1).deactivateAirdrop(0)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
