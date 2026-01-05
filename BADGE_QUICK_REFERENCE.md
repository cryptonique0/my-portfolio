# Badge System Quick Reference

**Quick access guide for developers implementing badge features.**

## 1-Minute Setup

```typescript
import { useBadges } from '@/hooks/useBadges';
import { BadgeGrid, BadgeShowcase } from '@/components/BadgeDisplay';

function MyComponent() {
  const { userBadges, fetchUserBadges } = useBadges();
  
  useEffect(() => {
    fetchUserBadges();
  }, []);

  return <BadgeShowcase badges={userBadges} />;
}
```

## Common Tasks

### Display User Badges
```typescript
<BadgeShowcase badges={userBadges} maxDisplay={6} size="medium" />
```

### Show Badge Gallery
```typescript
<BadgeGrid badges={userBadges} size="large" showLocked={true} />
```

### Mint Badge (Admin)
```typescript
const { mintBadge } = useBadges();
const success = await mintBadge('0x123...', badgeId, 1);
```

### Check Badge Ownership
```typescript
const { hasBadge } = useBadges();
if (hasBadge(badgeId)) {
  // User has badge
}
```

### Get User's Badge Count
```typescript
const { getBadgeCount } = useBadges();
const count = getBadgeCount();
```

### Get Unlockable Badges
```typescript
const { unlockBadgeByReputation } = useBadges();
const badges = await unlockBadgeByReputation(5000); // Get badges unlockable at 5000 rep
```

## Badge IDs

| ID | Name | Requirement |
|----|------|------------|
| 0 | Verified Professional | 0 |
| 1 | Rising Star | 1,000 |
| 2 | Expert Developer | 5,000 |
| 3 | Hall of Fame | 10,000 |
| 4 | Verified Credential | 100 |
| 5 | Community Champion | 2,000 |
| 6 | Thought Leader | 7,000 |
| 7 | Profile Pioneer | 500 |
| 8 | Reputation Milestone | 8,000 |

## API Endpoints

### Fetch Badges
```
GET /api/badges/all
GET /api/badges/user/0x123...
```

### Mint Badge
```
POST /api/badges/mint
{
  "recipient": "0x123...",
  "badgeId": 2,
  "amount": 1
}
```

### Batch Mint
```
POST /api/badges/batch-mint
{
  "recipients": ["0x123...", "0x456..."],
  "badgeIds": [1, 2],
  "amounts": [1, 1]
}
```

## Component Props

### BadgeShowcase
```typescript
<BadgeShowcase
  badges={Badge[]}          // Required
  maxDisplay={number}       // Optional, default 5
  size="small"|"medium"|"large"
  onClick={(badge) => {}}   // Optional click handler
/>
```

### BadgeGrid
```typescript
<BadgeGrid
  badges={Badge[]}          // Required
  size="small"|"medium"|"large"
  showLocked={boolean}      // Show locked badges
  onBadgeClick={(badge) => {}}
/>
```

### BadgeCard
```typescript
<BadgeCard
  badge={Badge}             // Required
  owned={boolean}           // Optional
  onClick={() => {}}        // Optional
/>
```

## Smart Contract Functions

### Admin Functions
```solidity
// Create badge
createBadge(id, name, description, requiredRep, maxSupply, imageURI)

// Mint badge
mintBadge(to, badgeId, amount, data)

// Batch mint
mintBadgesBatch(recipients[], badgeIds[], amounts[])

// Set requirement
setRequiredReputation(badgeId, newReputation)
```

### Query Functions
```solidity
// Get metadata
getBadgeMetadata(badgeId) → BadgeMetadata

// User badges
getUserBadges(user) → uint256[]

// Check ownership
hasBadge(user, badgeId) → bool

// Get supply
getBadgeSupply(badgeId) → (current, max)

// Get reputation
getUserReputation(user) → uint256
```

## Hooks Reference

### useBadges()
```typescript
const {
  badges,                      // All badges
  userBadges,                  // User's badges
  isLoading,                   // Loading state
  error,                       // Error message
  fetchAllBadges,              // Load all
  fetchUserBadges,             // Load user badges
  mintBadge,                   // Mint single
  batchMintBadges,             // Batch mint
  burnBadge,                   // Burn badge
  getBadgeById,                // Get by ID
  hasBadge,                    // Check ownership
  getBadgeCount,               // Get count
  unlockBadgeByReputation,     // Get unlockable
} = useBadges();
```

### useBadgeAPI()
```typescript
const {
  isLoading,
  error,
  createBadge,                 // Create new badge
  updateBadge,                 // Update metadata
  deactivateBadge,             // Deactivate badge
} = useBadgeAPI();
```

## Common Patterns

### Award Badge on Action
```typescript
async function handleCredentialVerified(user, badgeId) {
  const { mintBadge } = useBadges();
  const success = await mintBadge(user, badgeId, 1);
  if (success) {
    showNotification('Badge earned! 🎉');
  }
}
```

### Display Progress to Unlock
```typescript
function BadgeProgress() {
  const { badges, unlockBadgeByReputation } = useBadges();
  const userRep = 5500; // Get from contract
  
  const unlocked = await unlockBadgeByReputation(userRep);
  const locked = badges.filter(b => !unlocked.includes(b));
  
  return (
    <>
      <BadgeGrid badges={unlocked} />
      <p>Next badge at {locked[0].requiredReputation} reputation</p>
    </>
  );
}
```

### Handle Minting Errors
```typescript
const { mintBadge, error } = useBadges();

try {
  const success = await mintBadge(address, badgeId, 1);
  if (!success) {
    console.error('Mint failed:', error);
  }
} catch (e) {
  console.error('Minting error:', e);
}
```

## Contract Addresses

```
Base Mainnet:
  AchievementBadges: [DEPLOY_ADDRESS]
  OnChainResume: [EXISTING_ADDRESS]

Base Sepolia:
  AchievementBadges: [TESTNET_ADDRESS]
  OnChainResume: [TESTNET_ADDRESS]
```

See [CONTRACT_ADDRESS.md](CONTRACT_ADDRESS.md) for latest.

## Environment Variables

```env
# Required
NEXT_PUBLIC_ACHIEVEMENT_BADGES_ADDRESS=0x...
NEXT_PUBLIC_ONCHAIN_RESUME_ADDRESS=0x...

# Optional
BADGE_METADATA_URI=ipfs://
BADGE_MAX_SUPPLY=1000
```

## Testing Commands

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Deploy to testnet
npx hardhat run scripts/deploy-badges.js --network base-sepolia

# Verify contract
npx hardhat verify --network base-mainnet BADGE_ADDRESS
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Badge not appearing | Check network matches, wait for indexing |
| Mint fails | Verify reputation requirement, check wallet |
| Images not loading | Verify IPFS hashes, check gateway |
| High gas cost | Use batch minting, optimize contract |

## Files to Know

| File | Purpose |
|------|---------|
| [AchievementBadges.sol](contracts/AchievementBadges.sol) | Smart contract |
| [useBadges.ts](src/hooks/useBadges.ts) | React hook |
| [BadgeDisplay.tsx](src/components/BadgeDisplay.tsx) | UI components |
| [ProfileWithBadges.tsx](src/components/ProfileWithBadges.tsx) | Integration |
| [BADGE_SYSTEM.md](BADGE_SYSTEM.md) | Full documentation |
| [deploy-badges.js](scripts/deploy-badges.js) | Deployment |

## Quick Links

- [Smart Contract API](BADGE_SYSTEM.md#smart-contract-architecture)
- [Component Library](BADGE_SYSTEM.md#badgedisplay-component)
- [Hook Reference](BADGE_SYSTEM.md#usedbadges-hook)
- [Deployment Guide](PHASE_3_CHECKLIST.md#task-1-deploy-achievementbadgessol)
- [Testing Guide](BADGE_SYSTEM.md#testing)

## Support

- Documentation: [BADGE_SYSTEM.md](BADGE_SYSTEM.md)
- Issues: Create GitHub issue
- Help: Check [FAQ](BADGE_SYSTEM.md#troubleshooting)

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Ready for Production
