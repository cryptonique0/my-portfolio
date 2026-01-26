# AirStack V2 Deployment Guide - Base Blockchain

## Overview

This guide covers deploying AirStack smart contracts to the Base blockchain (Ethereum L2).

## Networks

### Base Mainnet
- **Network ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
- **Native Currency**: ETH

### Base Sepolia (Testnet)
- **Network ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Native Currency**: ETH (testnet)
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Prerequisites

1. **Node.js**: v18 or higher
2. **npm or yarn**: Package manager
3. **Hardhat**: Smart contract development environment
4. **Private Key**: For deployment account (keep secure!)
5. **ETH Balance**: For gas fees

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/web3joker/airstack.git
cd AirStack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Private Key (keep this secret!)
PRIVATE_KEY=your_private_key_hex_here

# RPC URLs (optional - defaults provided)
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Block Explorer API Key (for contract verification)
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional: Gas reporter
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
```

## Compilation

Compile smart contracts:

```bash
npm run compile
```

This generates:
- Compiled ABI files in `./artifacts/contracts/`
- TypeChain types in `./typechain-types/`

## Testing

Run the test suite:

```bash
npm test
```

Run specific test file:

```bash
npx hardhat test tests/AirdropManager.test.ts
```

Run with gas report:

```bash
REPORT_GAS=true npm test
```

## Deployment

### Deploy to Base Testnet (Recommended First)

```bash
npm run deploy:base-testnet
```

This will:
1. Deploy all 9 smart contracts
2. Transfer initial token supply to AirdropManager
3. Display deployment addresses

**Example Output:**
```
Deploying AirStack Airdrop System to Base Chain...
Deploying with account: 0x...

Deploying AirdropToken...
AirdropToken deployed to: 0x1234...

Deploying AirdropManager...
AirdropManager deployed to: 0x5678...

...

=== DEPLOYMENT SUMMARY ===
{
  "network": "base",
  "timestamp": "2024-01-09T...",
  "deployer": "0x...",
  "contracts": {
    "AirdropToken": "0x...",
    "AirdropManager": "0x...",
    ...
  }
}

Deployment complete!
```

### Deploy to Base Mainnet

⚠️ **IMPORTANT**: This will use real ETH for gas fees!

```bash
npm run deploy:base-mainnet
```

## Contract Verification

After deployment, verify contracts on BaseScan for transparency and user confidence:

```bash
npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:

```bash
npx hardhat verify --network base 0x1234... "AirdropToken"
```

## Post-Deployment Setup

### 1. Update Environment Variables

Create `.env.local` with deployed contract addresses:

```env
VITE_AIRDROP_MANAGER_ADDRESS=0x...
VITE_AIRDROP_TOKEN_ADDRESS=0x...
VITE_GOVERNANCE_ADDRESS=0x...
VITE_VESTING_ADDRESS=0x...
VITE_WHITELIST_ADDRESS=0x...
VITE_MERKLE_TREE_ADDRESS=0x...
VITE_ETH_AIRDROP_ADDRESS=0x...
VITE_AGGREGATOR_ADDRESS=0x...
VITE_ANALYTICS_ADDRESS=0x...
```

### 2. Initialize Airdrops

```typescript
// Create a token airdrop
const tx = await airdropManager.createAirdrop(
  tokenAddress,
  ethers.parseUnits("1000000", 6),  // 1M tokens
  Math.floor(Date.now() / 1000) + 3600,  // 1 hour from now
  Math.floor(Date.now() / 1000) + 86400  // 1 day from now
);

// Create ETH airdrop
const ethTx = await ethAirdropManager.createETHAirdrop(
  Math.floor(Date.now() / 1000) + 3600,
  Math.floor(Date.now() / 1000) + 86400,
  { value: ethers.parseEther("100") }  // 100 ETH
);
```

### 3. Set Allocations

```typescript
// Single allocation
await airdropManager.setAllocation(
  airdropId,
  userAddress,
  ethers.parseUnits("1000", 6)
);

// Batch allocations
await airdropManager.batchSetAllocations(
  airdropId,
  [address1, address2, address3],
  [
    ethers.parseUnits("1000", 6),
    ethers.parseUnits("2000", 6),
    ethers.parseUnits("3000", 6)
  ]
);
```

### 4. Configure Whitelist

```typescript
// Add to whitelist
await whitelistManager.addToWhitelist(userAddress, 0);  // Bronze tier

// Batch add
await whitelistManager.batchAddToWhitelist(
  [address1, address2],
  1  // Silver tier
);

// Set tier metadata
await whitelistManager.setTierMetadata(
  0,
  "Bronze",
  ethers.parseUnits("100", 6)
);
```

## Gas Costs

Approximate gas costs on Base (very low compared to Ethereum):

| Operation | Gas | Cost (ETH) | Cost (USD) |
|-----------|-----|-----------|-----------|
| Deploy Token | 800K | ~0.0008 | ~$3 |
| Deploy Manager | 600K | ~0.0006 | ~$2 |
| Create Airdrop | 80K | ~0.00008 | ~$0.30 |
| Set Allocation | 50K | ~0.00005 | ~$0.20 |
| Batch (100) | 200K | ~0.0002 | ~$0.60 |
| Claim Token | 60K | ~0.00006 | ~$0.25 |
| Claim ETH | 45K | ~0.000045 | ~$0.15 |

*Note: Prices vary based on gas price and ETH price*

## Troubleshooting

### Issue: "Insufficient balance"

**Solution**: Ensure deployment account has enough ETH for gas fees

```bash
# Check balance
cast balance 0x... --rpc-url https://sepolia.base.org
```

### Issue: "Invalid RPC URL"

**Solution**: Verify RPC URL is correct and responsive

```bash
# Test RPC
curl -X POST https://sepolia.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Issue: "Nonce too high"

**Solution**: Reset nonce or wait for pending transactions to complete

```bash
# Reset nonce in hardhat.config.ts
accounts: {
  mnemonic: MNEMONIC,
  initialIndex: 0,
  count: 20,
  path: "m/44'/60'/0'/0"
}
```

### Issue: Contract already deployed at address

**Solution**: This is normal for retried deployments. Use existing address or deploy to new account

## Monitoring

### View Transactions on BaseScan

https://sepolia.basescan.org/address/0x...

### Monitor Gas Prices

```bash
cast gas-price --rpc-url https://sepolia.base.org
```

### Check Contract State

```bash
# Get balance of airdrop token
cast call <TOKEN_ADDRESS> "balanceOf(address)" <WALLET_ADDRESS> \
  --rpc-url https://sepolia.base.org
```

## Upgrading

For contract upgrades, consider using UUPS proxy pattern or deploy new contracts and migrate state.

## Security Checklist

✅ Private key never committed to repository
✅ Use .env for sensitive data
✅ Testnet deployment before mainnet
✅ Contract verification on BaseScan
✅ Whitelist review before launch
✅ Test claiming flow end-to-end
✅ Emergency pause mechanism configured
✅ Owner/admin keys securely stored
✅ Multi-sig wallet for mainnet (recommended)

## Support

- **Base Docs**: https://docs.base.org
- **Hardhat Docs**: https://hardhat.org
- **OpenZeppelin**: https://docs.openzeppelin.com
- **Issues**: GitHub Issues

## Additional Resources

- [Base RPC Documentation](https://docs.base.org/guides/getting-started/run-a-base-node)
- [Hardhat Deployment Guide](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-ethers)
- [Contract Verification](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan)

3. Deploy contracts:
```bash
npm run deploy:testnet
```

Or manually:
```bash
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

## Deployment to Mainnet

⚠️ **Warning**: Deploying to mainnet requires real STX tokens and is irreversible.

1. Set environment variables:
```bash
export STACKS_PRIVATE_KEY="your_private_key_here"
export NETWORK="mainnet"
```

2. Generate deployment plan:
```bash
clarinet deployments generate --mainnet
```

3. Review the deployment plan carefully

4. Deploy contracts:
```bash
npm run deploy:mainnet
```

## Post-Deployment Setup

After deploying, you need to set up the airdrop:

1. Set your contract address:
```bash
export CONTRACT_ADDRESS="your_deployed_contract_address"
```

2. Edit `scripts/airdrop-setup.ts` to add recipient addresses and amounts

3. Run the setup script:
```bash
npx ts-node scripts/airdrop-setup.ts
```

## Airdrop Campaign Steps

### 1. Create Airdrop Campaign

```clarity
(contract-call? .airdrop-manager create-airdrop 
  .airdrop-token 
  u1000000000000  ;; Total amount
  u1              ;; Start block
  u100000         ;; End block
)
```

### 2. Add Addresses to Whitelist

Single address:
```clarity
(contract-call? .whitelist-manager add-to-whitelist 
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM 
  u1  ;; Tier
)
```

Batch add:
```clarity
(contract-call? .whitelist-manager batch-add-to-whitelist 
  (list 'ST1... 'ST2... 'ST3...)
  u1  ;; Tier
)
```

### 3. Set Token Allocations

Single allocation:
```clarity
(contract-call? .airdrop-manager set-allocation 
  u1                                          ;; Airdrop ID
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM  ;; Recipient
  u5000000                                    ;; Amount
)
```

Batch allocations:
```clarity
(contract-call? .airdrop-manager batch-set-allocations 
  u1                           ;; Airdrop ID
  (list 'ST1... 'ST2... 'ST3...)  ;; Recipients
  (list u5000000 u10000000 u15000000)  ;; Amounts
)
```

### 4. Users Claim Tokens

Users can claim their allocated tokens:
```clarity
(contract-call? .airdrop-manager claim-tokens u1)  ;; Airdrop ID
```

## Admin Functions

### Pause/Unpause Contract

```clarity
;; Pause (emergency stop)
(contract-call? .airdrop-manager pause-contract)

;; Unpause
(contract-call? .airdrop-manager unpause-contract)
```

### Activate/Deactivate Airdrop

```clarity
;; Deactivate specific airdrop
(contract-call? .airdrop-manager deactivate-airdrop u1)

;; Reactivate
(contract-call? .airdrop-manager activate-airdrop u1)
```

### Manage Whitelist

```clarity
;; Remove from whitelist
(contract-call? .whitelist-manager remove-from-whitelist 'ST1...)

;; Deactivate entire whitelist
(contract-call? .whitelist-manager deactivate-whitelist)
```

## Monitoring

### Check Airdrop Status

```clarity
(contract-call? .airdrop-manager get-airdrop u1)
(contract-call? .airdrop-manager is-airdrop-active u1)
```

### Check User Claims

```clarity
(contract-call? .airdrop-manager has-claimed u1 'ST1...)
(contract-call? .airdrop-manager get-allocation u1 'ST1...)
```

### Check Whitelist Status

```clarity
(contract-call? .whitelist-manager is-whitelisted 'ST1...)
(contract-call? .whitelist-manager get-whitelist-info 'ST1...)
(contract-call? .whitelist-manager get-total-whitelisted)
```

## Troubleshooting

### Contract Deployment Fails

- Ensure you have enough STX for transaction fees
- Check that contract names are unique
- Verify Clarity syntax with `clarinet check`

### Claim Transactions Fail

- Verify user is whitelisted
- Check if allocation is set
- Ensure airdrop is active and within block range
- Confirm contract is not paused

### Whitelist Issues

- Only contract owner can manage whitelist
- Check if whitelist is active
- Verify tier assignments are correct

## Security Best Practices

1. **Test Thoroughly**: Always test on testnet before mainnet
2. **Audit Contracts**: Have contracts audited by professionals
3. **Monitor Activity**: Set up alerts for unusual activity
4. **Emergency Controls**: Know how to pause contracts if needed
5. **Key Management**: Securely store private keys
6. **Access Control**: Verify owner-only functions are protected

## Support

For issues or questions:
- Review contract code in `/contracts` directory
- Check test files in `/tests` for usage examples
- Open an issue on GitHub
