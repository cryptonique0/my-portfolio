# BitArt Market - Deployed Contract Addresses

## 🎯 Testnet Deployment (Stacks)

**Deployment Address**: `ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J`

### Contract Addresses

1. **NFT Contract**: `ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.colorful-lime-guan`
   - Status: ✅ Deployed
   - Functions: mint-nft, transfer-nft, get-nft-metadata

2. **Marketplace Contract**: `ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.partial-harlequin-tahr`
   - Status: ✅ Deployed
   - Functions: list-nft, buy-nft, cancel-listing

3. **Auction Contract**: `ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.better-copper-lemming`
   - Status: ✅ Deployed
   - Functions: create-auction, place-bid, end-auction

### Verify on Explorer

- **Auction Contract**: https://explorer.stacks.co/txid/ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.better-copper-lemming?chain=testnet

### Next Steps

1. ✅ Deploy **NFT contract** (`bitart-nft`)
2. ✅ Deploy **Marketplace contract** (`bitart-marketplace`)
3. 🔄 Share both contract addresses here
4. 🚀 I'll update all configs and you're ready to launch!

### Configuration Status

- ✅ `frontend/src/config/contracts.ts` - Created
- ✅ `backend/src/config/contracts.ts` - Created  
- ✅ `frontend/.env.example` - Updated
- ⏳ Waiting for NFT and Marketplace contract addresses

### Usage in Code

```typescript
// Frontend
import { STACKS_CONTRACTS } from '@/config/contracts';
console.log(STACKS_CONTRACTS.auction); // ST1VJD...better-copper-lemming

// Backend
import { STACKS_CONTRACTS } from './config/contracts';
console.log(STACKS_CONTRACTS.auction);
```
