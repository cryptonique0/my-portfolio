# Deploy OnChainResume Contract on Remix

## Step 1: Open Remix
Go to https://remix.ethereum.org

## Step 2: Create New File
Create a file named `OnChainResume.sol` and paste the contract code from:
`/home/web3joker/New PJ/contracts/OnChainResume.sol`

## Step 3: Compile
1. Go to "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.19`
3. Click "Compile OnChainResume.sol"

## Step 4: Deploy on Base Mainnet
1. Go to "Deploy & Run Transactions" tab
2. **Environment**: Select "Injected Provider - MetaMask"
3. **Network**: Switch MetaMask to Base Mainnet
   - Network Name: Base Mainnet
   - RPC URL: https://mainnet.base.org
   - Chain ID: 8453
   - Currency Symbol: ETH
   - Block Explorer: https://basescan.org

4. **Contract**: Select "OnChainResume"
5. Click "Deploy"
6. Confirm transaction in MetaMask

## Step 5: Copy Contract Address
After deployment, copy the contract address from Remix console

## Step 6: Update .env.local
Add the contract address to your `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_deployed_contract_address>
NEXT_PUBLIC_NETWORK=base
NEXT_PUBLIC_CHAIN_ID=8453
```

## Step 7: Update src/lib/contract.ts
Replace this line:
```typescript
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
```

With:
```typescript
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'YOUR_CONTRACT_ADDRESS_HERE';
```

## Verify on BaseScan (Optional)
1. Go to https://basescan.org
2. Find your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Paste the contract code and verify

---

## Base Mainnet Network Details

**Add to MetaMask:**
- Network Name: `Base Mainnet`
- RPC URL: `https://mainnet.base.org`
- Chain ID: `8453`
- Currency Symbol: `ETH`
- Block Explorer URL: `https://basescan.org`

**Need ETH on Base?**
- Bridge from Ethereum: https://bridge.base.org
- Or use an exchange that supports Base deposits

---

## Contract Functions Available After Deployment

### User Functions:
- `createProfile(string handle, string ipfsHash)`
- `updateProfile(string ipfsHash)`
- `addCredential(string type, string issuer, uint256 issuedDate, uint256 expiryDate, string proofUrl)`
- `unlockAchievement(string title, string description)`

### View Functions:
- `getProfile(address user)`
- `getCredentials(address user)`
- `getAchievements(address user)`
- `getReputation(address user)`
- `getUserByHandle(string handle)`
- `getTopProfiles(uint256 limit)`
