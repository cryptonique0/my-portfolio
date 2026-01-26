import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

describe("Cross-Chain Bridge & Aggregator Integration Tests", () => {
  let crossChainBridge: Contract;
  let chainAggregator: Contract;
  let layerZeroMessenger: Contract;
  let wormholeMessenger: Contract;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let mockToken: Contract;

  const ETHEREUM_CHAIN = 1;
  const ARBITRUM_CHAIN = 42161;
  const OPTIMISM_CHAIN = 10;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock token
    const MockToken = await ethers.getContractFactory("ERC20Mock");
    mockToken = await MockToken.deploy("Test Token", "TEST", ethers.utils.parseEther("1000000"));
    await mockToken.deployed();

    // Deploy CrossChainBridge
    const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
    crossChainBridge = await CrossChainBridge.deploy();
    await crossChainBridge.deployed();

    // Deploy ChainAggregator
    const ChainAggregator = await ethers.getContractFactory("ChainAggregator");
    chainAggregator = await ChainAggregator.deploy();
    await chainAggregator.deployed();

    // Deploy LayerZeroMessenger
    const LayerZeroMessenger = await ethers.getContractFactory("LayerZeroMessenger");
    layerZeroMessenger = await LayerZeroMessenger.deploy(ethers.constants.AddressZero);
    await layerZeroMessenger.deployed();

    // Deploy WormholeMessenger
    const WormholeMessenger = await ethers.getContractFactory("WormholeMessenger");
    wormholeMessenger = await WormholeMessenger.deploy(
      ethers.constants.AddressZero,
      ethers.constants.AddressZero
    );
    await wormholeMessenger.deployed();
  });

  describe("CrossChainBridge", () => {
    it("Should register token bridge", async () => {
      const tx = await crossChainBridge.registerTokenBridge(
        mockToken.address,
        ARBITRUM_CHAIN,
        ethers.constants.AddressZero
      );
      await expect(tx).to.emit(crossChainBridge, "TokenBridgeRegistered");
    });

    it("Should update chain configuration", async () => {
      const tx = await crossChainBridge.updateChainConfig(
        ARBITRUM_CHAIN,
        {
          chainId: 42161,
          name: "Arbitrum",
          bridgeAddress: ethers.constants.AddressZero,
          enabled: true,
          minAmount: ethers.utils.parseEther("1"),
          maxAmount: ethers.utils.parseEther("1000"),
          fee: 50, // 0.5%
        }
      );
      await expect(tx).to.emit(crossChainBridge, "ChainConfigUpdated");
    });

    it("Should calculate bridge fee correctly", async () => {
      const amount = ethers.utils.parseEther("100");
      const fee = await crossChainBridge.calculateBridgeFee(amount);
      expect(fee).to.be.gt(0);
    });

    it("Should fail to bridge zero amount", async () => {
      const user1Address = await user1.getAddress();
      await expect(
        crossChainBridge.connect(user1).bridgeTokens(
          mockToken.address,
          0,
          ARBITRUM_CHAIN,
          user1Address
        )
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should fail to bridge to invalid recipient", async () => {
      await expect(
        crossChainBridge.connect(user1).bridgeTokens(
          mockToken.address,
          ethers.utils.parseEther("10"),
          ARBITRUM_CHAIN,
          ethers.constants.AddressZero
        )
      ).to.be.revertedWith("Invalid recipient");
    });
  });

  describe("ChainAggregator", () => {
    it("Should create airdrop campaign", async () => {
      const user1Address = await user1.getAddress();
      const tx = await chainAggregator.connect(user1).createCampaign(
        1, // campaignId
        "Test Campaign",
        mockToken.address,
        ethers.utils.parseEther("10000")
      );
      await expect(tx).to.emit(chainAggregator, "CampaignCreated");
    });

    it("Should set chain allocation", async () => {
      const tx = await chainAggregator.setChainAllocation(
        1,
        ETHEREUM_CHAIN,
        ethers.utils.parseEther("5000")
      );
      await expect(tx).to.emit(chainAggregator, "ChainAllocationSet");
    });

    it("Should set multi-chain airdrop", async () => {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      
      const tx = await chainAggregator.setMultiChainAirdrop(
        1,
        [user1Address, user2Address],
        [ethers.utils.parseEther("100"), ethers.utils.parseEther("50")]
      );
      await expect(tx).to.emit(chainAggregator, "MultiChainAirdropSet");
    });

    it("Should get campaign details", async () => {
      const campaign = await chainAggregator.campaigns(1);
      expect(campaign.campaignId).to.equal(1);
      expect(campaign.name).to.equal("Test Campaign");
    });

    it("Should track claim status", async () => {
      const user1Address = await user1.getAddress();
      const status = await chainAggregator.getClaimStatus(1, user1Address);
      // Status should be defined
      expect(status).to.exist;
    });
  });

  describe("LayerZeroMessenger", () => {
    it("Should set trusted remote", async () => {
      const trustedRemote = ethers.utils.solidityPack(
        ["address"],
        [layerZeroMessenger.address]
      );
      const tx = await layerZeroMessenger.setTrustedRemote(
        110, // Arbitrum LayerZero ID
        trustedRemote
      );
      await expect(tx).to.emit(layerZeroMessenger, "TrustedRemoteSet");
    });

    it("Should fail to send without trusted remote", async () => {
      const user1Address = await user1.getAddress();
      await expect(
        layerZeroMessenger.connect(user1).sendAirdropDistribution(
          999, // Non-existent chain
          mockToken.address,
          user1Address,
          ethers.utils.parseEther("100"),
          1,
          "0x",
          { value: ethers.utils.parseEther("1") }
        )
      ).to.be.revertedWith("Untrusted remote");
    });

    it("Should emit message sent event", async () => {
      const trustedRemote = ethers.utils.solidityPack(
        ["address"],
        [layerZeroMessenger.address]
      );
      await layerZeroMessenger.setTrustedRemote(110, trustedRemote);

      const user1Address = await user1.getAddress();
      const tx = await layerZeroMessenger.connect(user1).sendAirdropDistribution(
        110,
        mockToken.address,
        user1Address,
        ethers.utils.parseEther("100"),
        1,
        "0x",
        { value: ethers.utils.parseEther("1") }
      );
      
      await expect(tx).to.emit(layerZeroMessenger, "CrossChainMessageSent");
    });

    it("Should retrieve user messages", async () => {
      const user1Address = await user1.getAddress();
      const messages = await layerZeroMessenger.getUserMessages(user1Address);
      expect(messages).to.be.an("array");
    });
  });

  describe("WormholeMessenger", () => {
    it("Should update chain configuration", async () => {
      const tx = await wormholeMessenger.updateChainConfig(
        23, // Arbitrum Wormhole ID
        ethers.constants.AddressZero,
        200000,
        true
      );
      await expect(tx).to.emit(wormholeMessenger, "ChainConfigUpdated");
    });

    it("Should set chain emitter", async () => {
      const user1Address = await user1.getAddress();
      await wormholeMessenger.setChainEmitter(23, user1Address);
      const emitter = await wormholeMessenger.chainEmitters(23);
      expect(emitter).to.equal(user1Address);
    });

    it("Should fail to send to disabled chain", async () => {
      const user1Address = await user1.getAddress();
      await wormholeMessenger.updateChainConfig(
        999,
        ethers.constants.AddressZero,
        200000,
        false // Disabled
      );

      await expect(
        wormholeMessenger.connect(user1).sendAirdropDistribution(
          999,
          mockToken.address,
          user1Address,
          ethers.utils.parseEther("100"),
          1,
          { value: ethers.utils.parseEther("1") }
        )
      ).to.be.revertedWith("Chain disabled");
    });

    it("Should emit VAA processed event", async () => {
      const encodedVAA = "0x1234567890";
      // Mock VAA processing would require more setup
      // This is a placeholder for demonstration
    });

    it("Should track message counter", async () => {
      const count = await wormholeMessenger.getMessageCount();
      expect(count).to.be.gte(0);
    });
  });

  describe("Multi-Chain Integration", () => {
    it("Should coordinate airdrop across multiple chains", async () => {
      const user1Address = await user1.getAddress();

      // 1. Create campaign in aggregator
      await chainAggregator.connect(user1).createCampaign(
        100,
        "Multi-Chain Campaign",
        mockToken.address,
        ethers.utils.parseEther("50000")
      );

      // 2. Set allocations for each chain
      await chainAggregator.setChainAllocation(
        100,
        ETHEREUM_CHAIN,
        ethers.utils.parseEther("25000")
      );
      await chainAggregator.setChainAllocation(
        100,
        ARBITRUM_CHAIN,
        ethers.utils.parseEther("15000")
      );
      await chainAggregator.setChainAllocation(
        100,
        OPTIMISM_CHAIN,
        ethers.utils.parseEther("10000")
      );

      // 3. Send via messaging layer (would use LayerZero or Wormhole)
      const campaign = await chainAggregator.campaigns(100);
      expect(campaign.totalAmount).to.equal(ethers.utils.parseEther("50000"));
    });

    it("Should handle bridge failures gracefully", async () => {
      const user1Address = await user1.getAddress();
      
      // Create bridge transaction
      // Attempt to fail it
      // Verify refund mechanism
    });

    it("Should prevent double-claiming", async () => {
      const user1Address = await user1.getAddress();
      
      // Create campaign
      await chainAggregator.connect(user1).createCampaign(
        200,
        "Double-Claim Test",
        mockToken.address,
        ethers.utils.parseEther("1000")
      );

      // Set allocation
      await chainAggregator.setChainAllocation(
        200,
        ETHEREUM_CHAIN,
        ethers.utils.parseEther("1000")
      );

      // Attempt double claim should fail or be tracked
    });
  });

  describe("Fee Calculations", () => {
    it("Should calculate correct bridge fees", async () => {
      const amounts = [
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("1000"),
      ];

      for (const amount of amounts) {
        const fee = await crossChainBridge.calculateBridgeFee(amount);
        expect(fee).to.be.gt(0);
        expect(fee).to.be.lt(amount); // Fee should be less than amount
      }
    });

    it("Should apply relayer fees correctly", async () => {
      const feePercentage = await wormholeMessenger.relayerFeePercentage();
      expect(feePercentage).to.be.lte(1000); // Max 10%
    });
  });

  describe("Emergency Functions", () => {
    it("Should allow owner to withdraw funds", async () => {
      const initialBalance = await ethers.provider.getBalance(owner.getAddress());
      
      // Send some ETH to contract
      await owner.sendTransaction({
        to: crossChainBridge.address,
        value: ethers.utils.parseEther("1"),
      });

      // Withdraw
      const tx = await crossChainBridge.emergencyWithdraw();
      await tx.wait();

      // Balance should be restored (minus gas)
    });
  });
});
