# Cross-Chain Quick Start Guide

Get up and running with AirStack's cross-chain features in 5 minutes.

---

## 1. Installation

```bash
# Clone or navigate to your project
cd /path/to/AirStack

# Install dependencies
npm install ethers @openzeppelin/contracts
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

---

## 2. Setup Environment

Create `.env` file:
```bash
# RPC Providers
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY

# Deployment
PRIVATE_KEY=0x...

# Contract Addresses (after deployment)
BRIDGE_ADDRESS=0x...
AGGREGATOR_ADDRESS=0x...
LZ_MESSENGER_ADDRESS=0x...
WH_MESSENGER_ADDRESS=0x...

# Token to distribute
TOKEN_ADDRESS=0x...
```

---

## 3. Deploy Contracts

```bash
# Deploy to Ethereum
npx hardhat run scripts/deploy-crosschain.ts --network ethereum

# Deploy to Arbitrum
npx hardhat run scripts/deploy-crosschain.ts --network arbitrum

# Deploy to Optimism
npx hardhat run scripts/deploy-crosschain.ts --network optimism
```

**Output Example**:
```
✓ CrossChainBridge deployed to: 0x1234...
✓ ChainAggregator deployed to: 0x5678...
✓ LayerZeroMessenger deployed to: 0x9abc...
✓ WormholeMessenger deployed to: 0xdef0...
```

---

## 4. Initialize SDK

```typescript
import { CrossChainSDK, ChainAggregatorClient } from './sdk/CrossChainSDK';
import { ethers } from 'ethers';

// Setup provider and signer
const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Import contract ABIs (generate from compilation)
import BridgeABI from './artifacts/contracts/CrossChainBridge.sol/CrossChainBridge.json';

// Create SDK
const sdk = new CrossChainSDK();

// Initialize aggregator client
const aggregator = new ChainAggregatorClient(
  process.env.AGGREGATOR_ADDRESS,
  BridgeABI.abi,
  signer
);

sdk.setAggregator(aggregator);
```

---

## 5. Create Multi-Chain Campaign

```typescript
import { ChainId } from './sdk/CrossChainSDK';

// Create campaign
const campaignTx = await sdk.getAggregator().createCampaign(
  1, // campaignId
  'Multi-Chain Token Drop',
  process.env.TOKEN_ADDRESS,
  ethers.utils.parseEther('100000') // 100k tokens total
);

console.log('Campaign created:', campaignTx);

// Set per-chain allocations
await sdk.getAggregator().setChainAllocation(
  1,
  ChainId.ETHEREUM,
  ethers.utils.parseEther('40000') // 40% to Ethereum
);

await sdk.getAggregator().setChainAllocation(
  1,
  ChainId.ARBITRUM,
  ethers.utils.parseEther('35000') // 35% to Arbitrum
);

await sdk.getAggregator().setChainAllocation(
  1,
  ChainId.OPTIMISM,
  ethers.utils.parseEther('25000') // 25% to Optimism
);
```

---

## 6. Set Recipients

```typescript
// List of recipients
const recipients = [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
  '0x3333333333333333333333333333333333333333'
];

// Amounts for each recipient (same across all chains)
const amounts = [
  ethers.utils.parseEther('100'),
  ethers.utils.parseEther('200'),
  ethers.utils.parseEther('150')
];

// Set airdrop
const tx = await sdk.getAggregator().setMultiChainAirdrop(
  1, // campaignId
  recipients,
  amounts
);

console.log('Recipients set:', tx);
```

---

## 7. Send Cross-Chain Messages

### Via LayerZero

```typescript
import LayerZeroMessengerABI from './artifacts/contracts/LayerZeroMessenger.sol/LayerZeroMessenger.json';
import { LayerZeroMessengerClient } from './sdk/CrossChainSDK';

const lzMessenger = new LayerZeroMessengerClient(
  process.env.LZ_MESSENGER_ADDRESS,
  LayerZeroMessengerABI.abi,
  signer
);

sdk.setLayerZeroMessenger(lzMessenger);

// Send airdrop distribution to Arbitrum
const adapterParams = ethers.utils.defaultAbiCoder.encode(
  ['uint16', 'uint256'],
  [1, 200000] // version 1, 200k gas
);

const txHash = await lzMessenger.sendAirdropDistribution(
  110, // Arbitrum LayerZero ID
  process.env.TOKEN_ADDRESS,
  '0x1111111111111111111111111111111111111111', // recipient
  ethers.utils.parseEther('100'),
  1, // campaignId
  adapterParams,
  ethers.utils.parseUnits('1', 'gwei')
);

console.log('Distribution sent via LayerZero:', txHash);
```

### Via Wormhole

```typescript
import WormholeMessengerABI from './artifacts/contracts/WormholeMessenger.sol/WormholeMessenger.json';
import { WormholeMessengerClient } from './sdk/CrossChainSDK';

const whMessenger = new WormholeMessengerClient(
  process.env.WH_MESSENGER_ADDRESS,
  WormholeMessengerABI.abi,
  signer
);

sdk.setWormholeMessenger(whMessenger);

// Send airdrop distribution to Arbitrum
const txHash = await whMessenger.sendAirdropDistribution(
  23, // Arbitrum Wormhole ID
  process.env.TOKEN_ADDRESS,
  '0x1111111111111111111111111111111111111111',
  ethers.utils.parseEther('100'),
  1 // campaignId
);

console.log('Distribution sent via Wormhole:', txHash);
```

---

## 8. Users Can Claim

Users can claim their airdrops on any supported chain:

```typescript
// Claim on single chain
const claimTx = await aggregator.claimAirdrop(
  1, // campaignId
  ChainId.ETHEREUM
);

// Or claim across multiple chains
const multiTx = await aggregator.claimMultiChainAirdrop(
  1,
  [ChainId.ETHEREUM, ChainId.ARBITRUM, ChainId.OPTIMISM]
);
```

---

## 9. Monitor Distribution

```typescript
// Get campaign details
const campaign = await aggregator.getCampaign(1);
console.log('Campaign:', campaign);
console.log('Total amount:', ethers.utils.formatEther(campaign.totalAmount));

// Check user claim status
const status = await aggregator.getClaimStatus(1, userAddress);
console.log('Claim status:', status);

// Get message history
const messages = await lzMessenger.getUserMessages(userAddress);
console.log('Sent messages:', messages.length);
```

---

## 10. Common Tasks

### Calculate Fees

```typescript
import { CrossChainBridgeClient, ChainId } from './sdk/CrossChainSDK';

const bridgeClient = new CrossChainBridgeClient(
  process.env.BRIDGE_ADDRESS,
  BridgeABI.abi,
  signer,
  ChainId.ETHEREUM
);

const amount = ethers.utils.parseEther('1000');
const fee = await bridgeClient.calculateBridgeFee(amount);
console.log('Bridge fee:', ethers.utils.formatEther(fee));

// Estimate LayerZero fee
const adapterParams = ethers.utils.defaultAbiCoder.encode(
  ['uint16', 'uint256'],
  [1, 200000]
);
const { nativeFee, zroFee } = await lzMessenger.estimateLayerZeroFee(110, adapterParams);
console.log('LayerZero fee:', ethers.utils.formatEther(nativeFee));
```

### Track Transactions

```typescript
// Wait for transaction confirmation
const receipt = await provider.waitForTransaction(txHash, 1, 60000);
console.log('Confirmed:', receipt.blockNumber);

// Get receipt details
console.log('Gas used:', receipt.gasUsed.toString());
console.log('Status:', receipt.status === 1 ? 'Success' : 'Failed');
```

### Handle Errors

```typescript
try {
  await aggregator.claimAirdrop(1, ChainId.ETHEREUM);
} catch (error) {
  if (error.message.includes('Already claimed')) {
    console.log('User already claimed');
  } else if (error.message.includes('Insufficient balance')) {
    console.log('Campaign has no remaining tokens');
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## Chain IDs Reference

### Native Chain IDs
- Ethereum: `1`
- Arbitrum: `42161`
- Optimism: `10`
- Polygon: `137`
- Avalanche: `43114`
- Base: `8453`

### LayerZero IDs
- Ethereum: `101`
- Arbitrum: `110`
- Optimism: `111`
- Polygon: `109`
- Avalanche: `106`
- Base: `184`

### Wormhole IDs
- Ethereum: `2`
- Arbitrum: `23`
- Optimism: `24`
- Polygon: `5`
- Avalanche: `6`
- Base: `30`

---

## Testing

```bash
# Run all tests
npx hardhat test tests/CrossChain.integration.test.ts

# Run specific test
npx hardhat test tests/CrossChain.integration.test.ts --grep "Campaign"

# With gas report
REPORT_GAS=true npx hardhat test
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Untrusted remote" | Set trusted remote with `setTrustedRemote()` |
| "Insufficient gas fee" | Estimate fee with `estimateLayerZeroFee()` |
| "Chain disabled" | Enable chain in WormholeMessenger config |
| "Already claimed" | User already claimed on that chain |

---

## Next Steps

1. ✅ Deploy contracts (5 mins)
2. ✅ Create campaign (2 mins)
3. ✅ Set recipients (2 mins)
4. ✅ Send distributions (2 mins)
5. ✅ Monitor claims (ongoing)

**Total Time: ~15 minutes to launch a multi-chain airdrop!**

---

## Full Example Script

```typescript
import { ethers } from 'ethers';
import { CrossChainSDK, ChainAggregatorClient, ChainId } from './sdk/CrossChainSDK';

async function runMultiChainAirdrop() {
  // Setup
  const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Initialize
  const sdk = new CrossChainSDK();
  const aggregator = new ChainAggregatorClient(
    process.env.AGGREGATOR_ADDRESS,
    ABI,
    signer
  );
  sdk.setAggregator(aggregator);
  
  // Create campaign
  await aggregator.createCampaign(
    1,
    'Multi-Chain Airdrop',
    process.env.TOKEN_ADDRESS,
    ethers.utils.parseEther('100000')
  );
  
  // Set allocations
  await aggregator.setChainAllocation(1, ChainId.ETHEREUM, ethers.utils.parseEther('40000'));
  await aggregator.setChainAllocation(1, ChainId.ARBITRUM, ethers.utils.parseEther('35000'));
  await aggregator.setChainAllocation(1, ChainId.OPTIMISM, ethers.utils.parseEther('25000'));
  
  // Set recipients
  await aggregator.setMultiChainAirdrop(
    1,
    ['0x1111...', '0x2222...', '0x3333...'],
    [ethers.utils.parseEther('100'), ethers.utils.parseEther('200'), ethers.utils.parseEther('150')]
  );
  
  console.log('✅ Campaign setup complete!');
  console.log('Users can now claim their multi-chain airdrops.');
}

runMultiChainAirdrop().catch(console.error);
```

---

## Resources

- **Full Documentation**: See `CROSSCHAIN_README.md`
- **API Reference**: Check contract source files
- **Test Examples**: See `tests/CrossChain.integration.test.ts`
- **SDK Source**: See `sdk/CrossChainSDK.ts`

---

**Ready to launch? Start with Step 1!** 🚀
