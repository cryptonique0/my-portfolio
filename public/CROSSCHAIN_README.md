# Cross-Chain Features Documentation

## Overview

AirStack's cross-chain infrastructure enables seamless airdrop distribution across multiple blockchains (Ethereum, Arbitrum, Optimism, Polygon, Avalanche, and Base) using industry-standard protocols: LayerZero and Wormhole.

**Key Features:**
- 🌉 **Bridge Support** - Distribute tokens across chains with fee optimization
- 🗂️ **Chain Aggregator** - Single contract managing multi-chain campaigns
- 🔗 **Cross-Chain Messaging** - LayerZero and Wormhole integration for reliable delivery
- 📦 **TypeScript SDK** - Type-safe client for all operations
- 🧪 **Integration Tests** - Comprehensive test suite for multi-chain scenarios

---

## Architecture

### System Components

#### 1. **CrossChainBridge** (`contracts/CrossChainBridge.sol`)
Handles individual token bridges with fee collection and transaction tracking.

**Responsibilities:**
- Initiate bridge transactions across chains
- Manage token registrations per chain
- Calculate and collect bridge fees
- Track transaction status and enable recovery
- Support emergency withdrawals

**Key Methods:**
```solidity
bridgeTokens(
  address token,
  uint256 amount,
  uint16 destChain,
  address recipient
) → uint256 bridgeId
```
Initiates a token bridge to another chain.

```solidity
completeBridge(uint256 bridgeId) → bool
```
Completes a bridge transaction (called by relayer/oracle).

```solidity
failBridge(uint256 bridgeId) → bool
```
Fails a bridge and refunds the sender.

```solidity
registerTokenBridge(
  address token,
  uint16 destChain,
  address bridgeAddress
)
```
Registers a token for bridging to a specific chain.

**Fee Structure:**
- Default: 0.1% - 0.3% per chain
- Configurable per chain via `updateChainConfig()`
- Collected to fee recipient address
- Transparent calculation via `calculateBridgeFee()`

#### 2. **ChainAggregator** (`contracts/ChainAggregator.sol`)
Single contract managing multi-chain airdrop campaigns with flexible claiming.

**Responsibilities:**
- Create and manage multi-chain campaigns
- Set per-chain allocations
- Track multi-recipient airdrops
- Support both per-chain and aggregated claiming
- Recover unclaimed tokens after campaign finalization

**Key Methods:**
```solidity
createCampaign(
  uint256 campaignId,
  string memory name,
  address token,
  uint256 totalAmount
)
```
Creates a new multi-chain airdrop campaign.

```solidity
setChainAllocation(
  uint256 campaignId,
  uint16 chainId,
  uint256 amount
)
```
Allocates tokens for a specific chain within a campaign.

```solidity
setMultiChainAirdrop(
  uint256 campaignId,
  address[] memory recipients,
  uint256[] memory amounts
)
```
Assigns recipients and amounts across all chains in a campaign.

```solidity
claimAirdrop(uint256 campaignId, uint16 chainId) → bool
```
Claims airdrop for a single chain.

```solidity
claimMultiChainAirdrop(
  uint256 campaignId,
  uint16[] memory chains
) → uint256 totalAmount
```
Claims airdrop across multiple chains in one transaction.

```solidity
finalizeCampaign(uint256 campaignId)
```
Finalizes campaign and returns unclaimed tokens to creator.

#### 3. **LayerZeroMessenger** (`contracts/LayerZeroMessenger.sol`)
Cross-chain messaging using LayerZero protocol (omnichain standard).

**Responsibilities:**
- Send airdrop distribution messages via LayerZero
- Send allocation updates to remote chains
- Receive and process cross-chain messages
- Manage trusted remotes and message nonces
- Track message delivery status

**Key Methods:**
```solidity
sendAirdropDistribution(
  uint16 dstChainId,
  address token,
  address recipient,
  uint256 amount,
  uint256 campaignId,
  bytes memory adapterParams
) → uint256 messageId
```
Sends airdrop distribution to another chain via LayerZero.

```solidity
sendAllocationUpdate(
  uint16 dstChainId,
  uint256 campaignId,
  address[] memory recipients,
  uint256[] memory amounts,
  bytes memory adapterParams
)
```
Sends allocation updates to remote chain.

```solidity
lzReceive(
  uint16 srcChainId,
  bytes calldata srcAddress,
  uint64 nonce,
  bytes calldata payload
)
```
Receives and processes cross-chain messages (called by LayerZero endpoint).

**LayerZero Chain IDs:**
| Chain | LayerZero ID |
|-------|-------------|
| Ethereum | 101 |
| Arbitrum | 110 |
| Optimism | 111 |
| Polygon | 109 |
| Avalanche | 106 |
| Base | 184 |

#### 4. **WormholeMessenger** (`contracts/WormholeMessenger.sol`)
Cross-chain messaging using Wormhole protocol (VAA-based verification).

**Responsibilities:**
- Send airdrop distribution via Wormhole
- Use Wormhole Relayer for automatic delivery
- Process and verify Verified Action Approvals (VAAs)
- Manage chain configurations with gas limits
- Track message verification status

**Key Methods:**
```solidity
sendAirdropDistribution(
  uint16 dstChainId,
  address token,
  address recipient,
  uint256 amount,
  uint256 campaignId
) → uint64 vaaSequence
```
Sends airdrop via Wormhole with guardian attestation.

```solidity
sendAllocationUpdate(
  uint16 dstChainId,
  uint256 campaignId,
  address[] memory recipients,
  uint256[] memory amounts
) → uint64 sequence
```
Sends allocation updates via Wormhole Relayer.

```solidity
processVAA(
  bytes calldata encodedVAA,
  uint16 srcChainId
)
```
Processes verified VAA from Wormhole Guardian set.

**Wormhole Chain IDs:**
| Chain | Wormhole ID |
|-------|-------------|
| Ethereum | 2 |
| Arbitrum | 23 |
| Optimism | 24 |
| Polygon | 5 |
| Avalanche | 6 |
| Base | 30 |

**Message Types:**
```typescript
enum MessageType {
  AIRDROP_DISTRIBUTION = 0,
  ALLOCATION_UPDATE = 1,
  CLAIM_NOTIFICATION = 2,
  BRIDGE_STATUS = 3,
  RECOVERY_REQUEST = 4
}
```

---

## SDK Usage

### Installation

```bash
npm install ethers @openzeppelin/contracts
```

### Basic Setup

```typescript
import { CrossChainSDK, CrossChainBridgeClient, ChainAggregatorClient } from './sdk/CrossChainSDK';
import { ethers } from 'ethers';

// Connect to provider
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Create SDK
const sdk = new CrossChainSDK();
```

### Bridge Operations

```typescript
// Initialize bridge client for Ethereum
const bridgeAbi = [...]; // Import from contract build
const bridgeClient = new CrossChainBridgeClient(
  BRIDGE_ADDRESS,
  bridgeAbi,
  signer,
  ChainId.ETHEREUM
);

// Bridge tokens to Arbitrum
const txHash = await bridgeClient.bridgeTokens(
  TOKEN_ADDRESS,
  ethers.utils.parseEther('1000'),
  ChainId.ARBITRUM,
  RECIPIENT_ADDRESS
);

// Get bridge status
const status = await bridgeClient.getBridgeStatus(bridgeId);

// Get user bridge history
const bridges = await bridgeClient.getUserBridges(userAddress);
```

### Campaign Management

```typescript
// Initialize aggregator client
const aggregatorClient = new ChainAggregatorClient(
  AGGREGATOR_ADDRESS,
  aggregatorAbi,
  signer
);

// Create multi-chain campaign
const createTx = await aggregatorClient.createCampaign(
  1, // campaignId
  'Multi-Chain Token Distribution',
  TOKEN_ADDRESS,
  ethers.utils.parseEther('100000')
);

// Set per-chain allocations
await aggregatorClient.setChainAllocation(
  1,
  ChainId.ETHEREUM,
  ethers.utils.parseEther('40000')
);
await aggregatorClient.setChainAllocation(
  1,
  ChainId.ARBITRUM,
  ethers.utils.parseEther('35000')
);
await aggregatorClient.setChainAllocation(
  1,
  ChainId.OPTIMISM,
  ethers.utils.parseEther('25000')
);

// Set recipients for campaign
const recipients = [addr1, addr2, addr3];
const amounts = [
  ethers.utils.parseEther('100'),
  ethers.utils.parseEther('200'),
  ethers.utils.parseEther('150')
];

await aggregatorClient.setMultiChainAirdrop(1, recipients, amounts);
```

### LayerZero Messaging

```typescript
// Initialize LayerZero messenger
const lzClient = new LayerZeroMessengerClient(
  LZ_MESSENGER_ADDRESS,
  lzMessengerAbi,
  signer
);

// Send airdrop distribution
const adapterParams = ethers.utils.defaultAbiCoder.encode(
  ['uint16', 'uint256'],
  [1, 200000] // version, gasLimit
);

const txHash = await lzClient.sendAirdropDistribution(
  110, // Arbitrum LayerZero ID
  TOKEN_ADDRESS,
  RECIPIENT_ADDRESS,
  ethers.utils.parseEther('100'),
  1, // campaignId
  adapterParams,
  ethers.utils.parseUnits('1', 'gwei') // gasPrice
);

// Estimate fees
const fees = await lzClient.estimateLayerZeroFee(110, adapterParams);
console.log('Native fee:', ethers.utils.formatEther(fees.nativeFee));
console.log('ZRO fee:', ethers.utils.formatEther(fees.zroFee));
```

### Wormhole Messaging

```typescript
// Initialize Wormhole messenger
const whClient = new WormholeMessengerClient(
  WH_MESSENGER_ADDRESS,
  whMessengerAbi,
  signer
);

// Send airdrop via Wormhole
const txHash = await whClient.sendAirdropDistribution(
  23, // Arbitrum Wormhole ID
  TOKEN_ADDRESS,
  RECIPIENT_ADDRESS,
  ethers.utils.parseEther('100'),
  1 // campaignId
);

// Send allocation update via Wormhole Relayer
const updateTx = await whClient.sendAllocationUpdate(
  23,
  1,
  recipients,
  amounts
);

// Process VAA when received
await whClient.processVAA(encodedVAA, 23);
```

### Unified SDK Interface

```typescript
// Create unified SDK for managing all operations
const sdk = new CrossChainSDK();

// Add bridge clients for each chain
sdk.addBridge(ChainId.ETHEREUM, ethereumBridgeClient);
sdk.addBridge(ChainId.ARBITRUM, arbitrumBridgeClient);

// Set messaging clients
sdk.setAggregator(aggregatorClient);
sdk.setLayerZeroMessenger(lzClient);
sdk.setWormholeMessenger(whClient);

// Execute multi-chain distribution
const campaigns = [
  {
    campaignId: 1,
    name: 'Multi-Chain Campaign',
    token: TOKEN_ADDRESS,
    totalAmount: ethers.utils.parseEther('100000'),
    chainAllocations: new Map([
      [ChainId.ETHEREUM, ethers.utils.parseEther('40000')],
      [ChainId.ARBITRUM, ethers.utils.parseEther('35000')],
      [ChainId.OPTIMISM, ethers.utils.parseEther('25000')]
    ]),
    creator: deployerAddress,
    createdAt: Math.floor(Date.now() / 1000)
  }
];

const results = await sdk.executeMultiChainDistribution(campaigns);
```

---

## Deployment Guide

### Prerequisites
```bash
npm install --save-dev hardhat ethers @openzeppelin/contracts
```

### Configuration

**hardhat.config.ts:**
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

export default config;
```

### Deployment Script

**scripts/deploy-crosschain.ts:**
```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy CrossChainBridge
  console.log("Deploying CrossChainBridge...");
  const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
  const bridge = await CrossChainBridge.deploy();
  await bridge.deployed();
  console.log(`CrossChainBridge deployed to: ${bridge.address}`);

  // Deploy ChainAggregator
  console.log("Deploying ChainAggregator...");
  const ChainAggregator = await ethers.getContractFactory("ChainAggregator");
  const aggregator = await ChainAggregator.deploy();
  await aggregator.deployed();
  console.log(`ChainAggregator deployed to: ${aggregator.address}`);

  // Deploy LayerZeroMessenger (requires actual LayerZero endpoint)
  console.log("Deploying LayerZeroMessenger...");
  const LayerZeroMessenger = await ethers.getContractFactory("LayerZeroMessenger");
  const lzMessenger = await LayerZeroMessenger.deploy(LZ_ENDPOINT_ADDRESS);
  await lzMessenger.deployed();
  console.log(`LayerZeroMessenger deployed to: ${lzMessenger.address}`);

  // Deploy WormholeMessenger (requires actual Wormhole addresses)
  console.log("Deploying WormholeMessenger...");
  const WormholeMessenger = await ethers.getContractFactory("WormholeMessenger");
  const whMessenger = await WormholeMessenger.deploy(WH_CORE_ADDRESS, WH_RELAYER_ADDRESS);
  await whMessenger.deployed();
  console.log(`WormholeMessenger deployed to: ${whMessenger.address}`);

  // Save deployment addresses
  const deployment = {
    bridge: bridge.address,
    aggregator: aggregator.address,
    layerZeroMessenger: lzMessenger.address,
    wormholeMessenger: whMessenger.address
  };

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Run Deployment

```bash
npx hardhat run scripts/deploy-crosschain.ts --network ethereum
npx hardhat run scripts/deploy-crosschain.ts --network arbitrum
npx hardhat run scripts/deploy-crosschain.ts --network optimism
```

---

## Testing

### Run Tests

```bash
# Run all cross-chain tests
npx hardhat test tests/CrossChain.integration.test.ts

# Run specific test suite
npx hardhat test tests/CrossChain.integration.test.ts --grep "Bridge"

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### Test Coverage

The integration test suite covers:
- ✅ Bridge registration and token management
- ✅ Campaign creation and allocation
- ✅ Multi-chain airdrop distribution
- ✅ LayerZero message sending and receiving
- ✅ Wormhole VAA processing
- ✅ Fee calculations
- ✅ Emergency functions
- ✅ Double-claim prevention
- ✅ Bridge failure recovery

---

## Fee Structure & Economics

### Bridge Fees
- **Base Fee**: 0.1% - 0.3% per chain (configurable)
- **Calculation**: `fee = (amount * feePercentage) / 10000`
- **Example**: Bridging 1000 tokens with 0.2% fee = 2 tokens fee

### Messaging Fees

**LayerZero:**
- Variable based on destination chain and gas requirements
- Estimated via `estimateFees()` API
- Paid in native chain token (ETH, MATIC, etc.)

**Wormhole:**
- Guardian set fees: ~$1-5 per message (varies by network)
- Relayer fees: Configurable percentage (default 0.5%)
- Paid upfront in native token

### Fee Recovery
All fees are collected to the `feeRecipient` address configured during deployment and can be withdrawn via governance.

---

## Security Considerations

### Smart Contract Security
- ✅ **ReentrancyGuard** on all external functions
- ✅ **Pausable** mechanism for emergency stops
- ✅ **Ownable** access control for admin functions
- ✅ **SafeERC20** for token transfers
- ✅ **Input validation** on all critical functions

### Message Verification
- **LayerZero**: Uses Guardian set signatures (same as Wormhole)
- **Wormhole**: VAA verification with Guardian quorum (13 of 19 guardians)
- **Dual-layer security**: Contract-level + Protocol-level verification

### Best Practices
1. Always verify trusted remotes on all chains
2. Implement rate limits on message processing
3. Monitor for unusual activity patterns
4. Keep private keys secure with hardware wallets
5. Test all interactions on testnets first

---

## Troubleshooting

### Common Issues

**"Untrusted remote" Error**
- **Cause**: Trusted remote not set for destination chain
- **Solution**: Call `setTrustedRemote()` with correct chain ID and address

**"Insufficient gas fee" Error**
- **Cause**: Not enough ETH sent for cross-chain message
- **Solution**: Estimate fees with `estimateLayerZeroFee()` or increase transaction value

**"VAA already processed" Error**
- **Cause**: VAA decoded multiple times
- **Solution**: Track processed VAAs; each VAA should only be processed once

**Bridge Transaction Stuck**
- **Cause**: Relayer not completing bridge
- **Solution**: Call `failBridge()` to refund and try again

### Getting Help

- **Documentation**: See contracts/ directory for source code comments
- **SDK Examples**: Check integration test file for usage patterns
- **Chain-Specific Issues**: Verify RPC endpoints and correct chain IDs

---

## Gas Optimization Tips

1. **Batch Operations**: Combine multiple allocations into single transaction
2. **Use Multi-Chain Claims**: `claimMultiChainAirdrop()` cheaper than separate claims
3. **Set Proper Gas Limits**: Don't overpay; estimate accurately
4. **Monitor Network Conditions**: Time transactions during low gas periods
5. **Reuse Variables**: Cache contract addresses and ABIs

---

## Roadmap

**Phase 1** (Complete)
- ✅ Bridge contracts (Ethereum, Arbitrum, Optimism)
- ✅ Chain aggregator
- ✅ LayerZero messenger
- ✅ Wormhole messenger
- ✅ TypeScript SDK

**Phase 2** (Planned)
- 🔄 Optimism Bedrock integration
- 🔄 Advanced fee optimization
- 🔄 Multi-sig governance on fees
- 🔄 Frontend UI for cross-chain operations

**Phase 3** (Future)
- 📋 Additional chain support (zkSync, StarkNet, Solana)
- 📋 Cross-chain swap integration
- 📋 Unified liquidity pools

---

## Support & Contact

For questions or issues:
- 📧 Email: support@airstackprotocol.com
- 💬 Discord: [Join Community](https://discord.gg/airstackprotocol)
- 🐦 Twitter: [@AirStackProto](https://twitter.com/airstackproto)

---

**Last Updated**: 2024
**Version**: 1.0.0
