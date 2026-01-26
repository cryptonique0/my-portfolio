# AirStack V2 - Developer Quick Reference

## 📋 Contract Reference Guide

### AirdropToken (ERC20)

```solidity
// View Functions
balanceOf(address account) -> uint256
totalSupply() -> uint256
allowance(address owner, address spender) -> uint256
decimals() -> uint8 // Returns 6

// Write Functions  
transfer(address to, uint256 amount) -> bool
approve(address spender, uint256 amount) -> bool
transferFrom(address from, address to, uint256 amount) -> bool
mint(address to, uint256 amount) // onlyOwner
burn(uint256 amount)

// Metadata
name() -> string
symbol() -> string
getTokenURI() -> string
setTokenURI(string newURI) // onlyOwner
```

### AirdropManager

```solidity
// Create & Manage
createAirdrop(
  address token,
  uint256 totalAmount,
  uint256 startTime,
  uint256 endTime
) -> uint256 airdropId

setAllocation(
  uint256 airdropId,
  address recipient,
  uint256 amount
)

batchSetAllocations(
  uint256 airdropId,
  address[] recipients,
  uint256[] amounts
)

// Query
getAirdrop(uint256 airdropId) -> Airdrop
getAllocation(uint256 airdropId, address user) -> uint256
hasClaimed(uint256 airdropId, address user) -> ClaimInfo
isAirdropActive(uint256 airdropId) -> bool

// User Actions
claimTokens(uint256 airdropId)

// Admin
pause() / unpause()
deactivateAirdrop(uint256 airdropId)
activateAirdrop(uint256 airdropId)
recoverTokens(address token, uint256 amount)
```

### ETHAirdropManager (NEW)

```solidity
// Create & Manage
createETHAirdrop(
  uint256 startTime,
  uint256 endTime
) payable -> uint256

setETHAllocation(
  uint256 airdropId,
  address recipient,
  uint256 amount
)

batchSetETHAllocations(
  uint256 airdropId,
  address[] recipients,
  uint256[] amounts
)

depositETH(uint256 airdropId) payable

// Query
getETHAirdrop(uint256 airdropId) -> ETHAirdrop
getETHAllocation(uint256 airdropId, address user) -> uint256
hasETHClaimed(uint256 airdropId, address user) -> ClaimInfo
isETHAirdropActive(uint256 airdropId) -> bool

// User Actions
claimETH(uint256 airdropId)

// Admin
deactivateETHAirdrop(uint256 airdropId)
recoverETH(uint256 amount)
```

### WhitelistManager

```solidity
// Query
isWhitelisted(address user) -> bool
getWhitelistInfo(address user) -> WhitelistEntry
getTotalWhitelisted() -> uint256
isWhitelistActive() -> bool
getUserTier(address user) -> uint256
getUserMaxAllocation(address user) -> uint256
getTierMetadata(uint256 tier) -> TierMetadata

// Admin
addToWhitelist(address user, uint256 tier)
batchAddToWhitelist(address[] users, uint256 tier)
removeFromWhitelist(address user)
batchRemoveFromWhitelist(address[] users)
updateUserTier(address user, uint256 newTier)
setTierMetadata(uint256 tier, string name, uint256 maxAllocation)
toggleWhitelistStatus()
```

### VestingSchedule

```solidity
// Create & Manage
createVestingSchedule(
  address token,
  address beneficiary,
  uint256 totalAmount,
  uint256 startTime,
  uint256 cliffTime,
  uint256 endTime
) -> uint256 scheduleId

updateVestingSchedule(uint256 scheduleId, uint256 newEndTime)

// Query
getVestingSchedule(uint256 scheduleId) -> Schedule
getClaimedAmount(uint256 scheduleId) -> ScheduleClaim
calculateVested(uint256 scheduleId) -> uint256
getClaimableAmount(uint256 scheduleId) -> uint256

// User Actions
claimVestedTokens(uint256 scheduleId)

// Admin
deactivateSchedule(uint256 scheduleId)
```

### Governance

```solidity
// Create & Vote
createProposal(
  string title,
  string description,
  uint256 duration
) -> uint256

vote(uint256 proposalId, bool position)

// Query
getProposal(uint256 proposalId) -> Proposal
hasVoted(uint256 proposalId, address voter) -> bool
getVote(uint256 proposalId, address voter) -> Vote
getGovernanceBalance(address holder) -> uint256
isProposalActive(uint256 proposalId) -> bool
getProposalStatus(uint256 proposalId) -> string

// Admin
allocateGovernanceTokens(address holder, uint256 amount)
batchAllocateGovernanceTokens(address[] holders, uint256[] amounts)
executeProposal(uint256 proposalId)
toggleGovernanceStatus()
```

### MerkleTree

```solidity
// Create & Manage
createMerkleAirdrop(
  bytes32 merkleRoot,
  address token,
  uint256 totalAmount,
  uint256 startTime,
  uint256 endTime
) -> uint256

updateMerkleRoot(uint256 airdropId, bytes32 newRoot)

// Query
getMerkleAirdrop(uint256 airdropId) -> MerkleAirdrop
hasMerkleClaimed(uint256 airdropId, address claimant) -> bool
getMerkleClaimAmount(uint256 airdropId, address claimant) -> uint256
verifyMerkleProof(
  uint256 airdropId,
  address claimant,
  uint256 amount,
  bytes32[] proof
) -> bool

// User Actions
claimMerkleTokens(
  uint256 airdropId,
  uint256 amount,
  bytes32[] proof
)

// Admin
deactivateMerkleAirdrop(uint256 airdropId)
pauseClaiming() / unpauseClaiming()
```

### AirdropAggregator (NEW)

```solidity
// Register
registerAirdrop(uint256 airdropId, address airdropContract)

// Query
getAirdropReference(uint256 airdropId) -> AirdropReference

// User Actions
aggregatedClaim(uint256[] airdropIds)
```

### Analytics (NEW)

```solidity
// Record Events
recordClaim(
  uint256 airdropId,
  address participant,
  uint256 amount
)

// Query Metrics
getAirdropMetrics(uint256 airdropId) -> AirdropMetrics
getDailyStats(uint256 airdropId, uint256 day) -> DailyStats
getParticipantStats(uint256 airdropId, address participant) -> ParticipantStats
getCurrentDay() -> uint256
getDayFromTimestamp(uint256 timestamp) -> uint256
getClaimRate(uint256 airdropId, uint256 totalEligible) -> uint256
getTotalClaimedAmount(uint256 airdropId) -> uint256
getTotalClaimers(uint256 airdropId) -> uint256
getAverageClaimAmount(uint256 airdropId) -> uint256
```

## 🔧 Common Operations

### Deploy All Contracts

```bash
npm run deploy:base-testnet
# Or
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### Create Token Airdrop

```typescript
import { ethers } from "hardhat";

const [deployer] = await ethers.getSigners();
const manager = await ethers.getContractAt("AirdropManager", managerAddress);

const startTime = Math.floor(Date.now() / 1000) + 3600;
const endTime = startTime + 86400;

const tx = await manager.createAirdrop(
  tokenAddress,
  ethers.parseUnits("100000", 6),  // 100k tokens
  startTime,
  endTime
);

const receipt = await tx.wait();
console.log("Airdrop created:", receipt.transactionHash);
```

### Set Allocations

```typescript
// Single allocation
await manager.setAllocation(
  airdropId,
  "0x742d35Cc6634C0532925a3b844Bc9e7595f42e2f",
  ethers.parseUnits("1000", 6)
);

// Batch allocations
const recipients = [
  "0x742d35Cc6634C0532925a3b844Bc9e7595f42e2f",
  "0x8ba1f109551bd432803012645ac136ddd64dba72",
  "0xa0ee7a142d267c1f36714e4a8f75612e633128a8"
];

const amounts = [
  ethers.parseUnits("1000", 6),
  ethers.parseUnits("2000", 6),
  ethers.parseUnits("3000", 6)
];

await manager.batchSetAllocations(airdropId, recipients, amounts);
```

### Handle Claiming

```typescript
// User claims tokens
const claimTx = await manager.connect(userSigner).claimTokens(airdropId);
await claimTx.wait();

// Check if already claimed
const claimed = await manager.hasClaimed(airdropId, userAddress);
console.log("Already claimed:", claimed.claimed);
console.log("Amount claimed:", ethers.formatUnits(claimed.amount, 6));
```

### Multi-Campaign Claiming

```typescript
const aggregator = await ethers.getContractAt(
  "AirdropAggregator",
  aggregatorAddress
);

// Register airdrops
await aggregator.registerAirdrop(1, managerAddress);
await aggregator.registerAirdrop(2, manager2Address);
await aggregator.registerAirdrop(3, manager3Address);

// User claims from all 3 in one transaction
const tx = await aggregator
  .connect(userSigner)
  .aggregatedClaim([1, 2, 3]);
await tx.wait();
```

### ETH Airdrop

```typescript
const ethManager = await ethers.getContractAt(
  "ETHAirdropManager",
  ethAirdropAddress
);

// Create ETH airdrop with 100 ETH
const tx = await ethManager.createETHAirdrop(
  startTime,
  endTime,
  { value: ethers.parseEther("100") }
);

// Set allocations
await ethManager.setETHAllocation(
  ethAirdropId,
  userAddress,
  ethers.parseEther("5")
);

// User claims ETH
await ethManager.connect(userSigner).claimETH(ethAirdropId);
```

### Vesting with Cliff

```typescript
const vesting = await ethers.getContractAt(
  "VestingSchedule",
  vestingAddress
);

const now = Math.floor(Date.now() / 1000);

// Create 4-year vesting with 1-year cliff
await vesting.createVestingSchedule(
  tokenAddress,
  beneficiaryAddress,
  ethers.parseUnits("10000", 6),  // 10k tokens
  now + 86400,                    // Start: 1 day
  now + 365 * 86400,             // Cliff: 1 year
  now + 4 * 365 * 86400          // End: 4 years
);

// Check vested amount
const vested = await vesting.calculateVested(scheduleId);
console.log("Vested:", ethers.formatUnits(vested, 6));

// Check claimable
const claimable = await vesting.getClaimableAmount(scheduleId);
console.log("Claimable:", ethers.formatUnits(claimable, 6));

// Claim vested tokens
await vesting.connect(beneficiary).claimVestedTokens(scheduleId);
```

### Merkle Tree Airdrop

```typescript
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers";

// Create merkle tree
const leaves = recipients.map(r => 
  keccak256(ethers.solidityPacked(["address", "uint256"], [r, amount]))
);
const tree = new MerkleTree(leaves, keccak256, { sort: true });
const root = tree.getHexRoot();

// Create airdrop
const merkle = await ethers.getContractAt("MerkleTree", merkleAddress);
await merkle.createMerkleAirdrop(
  root,
  tokenAddress,
  ethers.parseUnits("100000", 6),
  startTime,
  endTime
);

// User claims with proof
const leaf = keccak256(ethers.solidityPacked(
  ["address", "uint256"],
  [userAddress, claimAmount]
));
const proof = tree.getHexProof(leaf);

await merkle
  .connect(user)
  .claimMerkleTokens(airdropId, claimAmount, proof);
```

## 🧪 Testing Examples

```bash
# Run all tests
npm test

# Run specific test
npx hardhat test tests/AirdropManager.test.ts

# Run with gas report
REPORT_GAS=true npm test

# Run single test
npx hardhat test tests/AirdropManager.test.ts --grep "should create a new airdrop"
```

## 📊 Contract Interaction Patterns

### Event Listening

```typescript
// Listen for claims
manager.on("TokensClaimed", (airdropId, recipient, amount, event) => {
  console.log(`User ${recipient} claimed ${amount} from airdrop ${airdropId}`);
});
```

### Error Handling

```typescript
try {
  const tx = await manager.claimTokens(airdropId);
  await tx.wait();
} catch (error) {
  if (error.message.includes("Already claimed")) {
    console.log("User has already claimed");
  } else if (error.message.includes("Airdrop not active")) {
    console.log("Airdrop not currently active");
  } else {
    console.error("Claim failed:", error);
  }
}
```

### Gas Estimation

```typescript
// Estimate gas for a transaction
const gasEstimate = await manager.estimateGas.setAllocation(
  airdropId,
  userAddress,
  amount
);

console.log("Estimated gas:", gasEstimate.toString());

// Get current gas price
const gasPrice = await ethers.provider.getGasPrice();
console.log("Gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");

// Estimate total cost
const totalCost = gasEstimate * gasPrice;
console.log("Estimated cost:", ethers.formatEther(totalCost), "ETH");
```

## 🔗 Useful Links

- **Hardhat**: https://hardhat.org
- **Ethers.js**: https://docs.ethers.org
- **OpenZeppelin**: https://docs.openzeppelin.com
- **Solidity**: https://docs.soliditylang.org
- **Base RPC**: https://mainnet.base.org
- **BaseScan**: https://basescan.org

## 💡 Pro Tips

1. Always test on Base Sepolia before mainnet deployment
2. Use batch operations for multiple recipients (gas efficient)
3. Implement merkle trees for large airdrops (70% gas savings)
4. Set reasonable vesting durations (typically 1-4 years)
5. Use tiered whitelists for different user categories
6. Monitor analytics for campaign performance
7. Always verify contracts on BaseScan after deployment
8. Keep private keys in .env, never commit them

---

For more help, check:
- README.md - Full project documentation
- DEPLOYMENT.md - Detailed deployment guide
- FRONTEND_MIGRATION.md - Frontend integration guide
- MIGRATION_SUMMARY.md - Complete migration overview
