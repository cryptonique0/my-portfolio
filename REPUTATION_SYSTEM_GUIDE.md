# Reputation Scoring System Documentation

## Overview

The OnChainResume contract now includes a **deterministic reputation scoring system** that calculates user reputation based on verifiable on-chain data. The system is fully transparent, deterministic, and provides detailed breakdowns of score composition.

## Key Features

✅ **Deterministic Calculation** - Score is calculated from on-chain data, not stored state  
✅ **Transparent Scoring** - All scoring rules are public constants  
✅ **Detailed Breakdown** - View function shows complete score composition  
✅ **Activity Tracking** - Rewards profile engagement over time  
✅ **Verified Credentials** - Bonus points for credentials with 2+ verifications  
✅ **Achievement System** - Points for unlocking achievements  

---

## Scoring Formula

### Total Reputation Score

```
Total Score = Base + Verified Profile + Credentials + Achievements + Activity
```

### Component Breakdown

| Component | Base Points | Condition |
|-----------|-------------|-----------|
| **Base Score** | 10 | Profile exists |
| **Verified Profile** | 25 | Profile verified by admin |
| **Unverified Credential** | 5 each | Any credential added |
| **Verified Credential** | 15 bonus | Credential with 2+ verifications |
| **Achievement** | 10 each | Any achievement unlocked |
| **Activity** | 3 per month | Profile update engagement |

---

## Smart Contract Integration

### Constants

All scoring constants are publicly accessible:

```solidity
uint256 public constant SCORE_BASE = 10;
uint256 public constant SCORE_VERIFIED_PROFILE = 25;
uint256 public constant SCORE_VERIFIED_CREDENTIAL = 15;
uint256 public constant SCORE_UNVERIFIED_CREDENTIAL = 5;
uint256 public constant SCORE_ACHIEVEMENT_BASE = 10;
uint256 public constant SCORE_PROFILE_UPDATE = 3;
```

### View Functions

#### `getReputation(address user)`

Returns the current reputation score for a user.

```solidity
function getReputation(address user) external view returns (uint256)
```

**Example:**
```javascript
const reputation = await contract.getReputation(userAddress);
console.log(`User reputation: ${reputation}`);
```

#### `getReputationBreakdown(address user)`

Returns detailed breakdown of reputation components.

```solidity
struct ReputationBreakdown {
    uint256 baseScore;                  // Base score (10)
    uint256 verifiedProfileBonus;       // Verified profile bonus (0 or 25)
    uint256 credentialScore;            // Score from all credentials (5 each)
    uint256 verifiedCredentialBonus;    // Bonus for verified credentials (15 each)
    uint256 achievementScore;           // Score from achievements (10 each)
    uint256 activityScore;              // Score from profile updates (3 per month)
    uint256 totalScore;                 // Total calculated reputation
    uint256 credentialCount;            // Total credentials
    uint256 verifiedCredentialCount;    // Verified credentials
    uint256 achievementCount;           // Total achievements
}
```

**Example:**
```javascript
const breakdown = await contract.getReputationBreakdown(userAddress);
console.log('Base Score:', breakdown.baseScore);
console.log('Verified Profile Bonus:', breakdown.verifiedProfileBonus);
console.log('Credential Score:', breakdown.credentialScore);
console.log('Verified Credential Bonus:', breakdown.verifiedCredentialBonus);
console.log('Achievement Score:', breakdown.achievementScore);
console.log('Activity Score:', breakdown.activityScore);
console.log('Total Score:', breakdown.totalScore);
```

---

## Examples

### Example 1: New User

```
Actions:
- Create profile

Score Breakdown:
- Base Score: 10
- Total: 10
```

### Example 2: User with Credentials

```
Actions:
- Create profile
- Add 3 credentials
- Get 2 credentials verified (2+ verifications each)

Score Breakdown:
- Base Score: 10
- Unverified Credentials: 3 × 5 = 15
- Verified Credential Bonus: 2 × 15 = 30
- Total: 55
```

### Example 3: Active Power User

```
Actions:
- Create profile
- Profile verified by admin
- Add 5 credentials (3 verified)
- Unlock 2 achievements
- Active for 6 months (regular updates)

Score Breakdown:
- Base Score: 10
- Verified Profile Bonus: 25
- Unverified Credentials: 5 × 5 = 25
- Verified Credential Bonus: 3 × 15 = 45
- Achievements: 2 × 10 = 20
- Activity: 6 × 3 = 18
- Total: 143
```

### Example 4: Two-Year Veteran

```
Actions:
- Create profile
- Profile verified
- Add 10 credentials (8 verified)
- Unlock 5 achievements
- Active for 24 months

Score Breakdown:
- Base Score: 10
- Verified Profile Bonus: 25
- Unverified Credentials: 10 × 5 = 50
- Verified Credential Bonus: 8 × 15 = 120
- Achievements: 5 × 10 = 50
- Activity: 24 × 3 = 72
- Total: 327
```

---

## Activity Scoring Details

Activity score rewards long-term engagement:

- **Calculation**: `(updatedAt - createdAt) / 2,592,000 * 3`
- **Month Definition**: 30 days = 2,592,000 seconds
- **Points**: 3 points per month
- **Trigger**: Updating profile with `updateProfile()`

### Activity Timeline

| Time Active | Months | Activity Score |
|-------------|--------|----------------|
| 1 month | 1 | 3 |
| 3 months | 3 | 9 |
| 6 months | 6 | 18 |
| 1 year | 12 | 36 |
| 2 years | 24 | 72 |

---

## Frontend Integration

### Display User Reputation

```typescript
import { useContractRead } from 'wagmi';

function UserReputation({ address }: { address: string }) {
  const { data: reputation } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReputation',
    args: [address],
  });

  return <div>Reputation Score: {reputation?.toString()}</div>;
}
```

### Display Reputation Breakdown

```typescript
function ReputationBreakdown({ address }: { address: string }) {
  const { data: breakdown } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReputationBreakdown',
    args: [address],
  });

  if (!breakdown) return null;

  return (
    <div className="reputation-breakdown">
      <h3>Reputation Breakdown</h3>
      <div className="score-item">
        <span>Base Score</span>
        <span>{breakdown.baseScore.toString()}</span>
      </div>
      {breakdown.verifiedProfileBonus > 0 && (
        <div className="score-item">
          <span>✓ Verified Profile</span>
          <span>+{breakdown.verifiedProfileBonus.toString()}</span>
        </div>
      )}
      <div className="score-item">
        <span>Credentials ({breakdown.credentialCount.toString()})</span>
        <span>+{breakdown.credentialScore.toString()}</span>
      </div>
      {breakdown.verifiedCredentialBonus > 0 && (
        <div className="score-item">
          <span>✓ Verified Credentials ({breakdown.verifiedCredentialCount.toString()})</span>
          <span>+{breakdown.verifiedCredentialBonus.toString()}</span>
        </div>
      )}
      {breakdown.achievementScore > 0 && (
        <div className="score-item">
          <span>Achievements ({breakdown.achievementCount.toString()})</span>
          <span>+{breakdown.achievementScore.toString()}</span>
        </div>
      )}
      {breakdown.activityScore > 0 && (
        <div className="score-item">
          <span>Activity Bonus</span>
          <span>+{breakdown.activityScore.toString()}</span>
        </div>
      )}
      <div className="score-total">
        <span>Total Reputation</span>
        <span>{breakdown.totalScore.toString()}</span>
      </div>
    </div>
  );
}
```

### Reputation Badge Component

```typescript
function ReputationBadge({ address }: { address: string }) {
  const { data: reputation } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReputation',
    args: [address],
  });

  const rep = Number(reputation || 0);
  
  // Tier system
  let tier = 'Newcomer';
  let color = 'gray';
  
  if (rep >= 200) {
    tier = 'Legend';
    color = 'purple';
  } else if (rep >= 150) {
    tier = 'Expert';
    color = 'gold';
  } else if (rep >= 100) {
    tier = 'Advanced';
    color = 'blue';
  } else if (rep >= 50) {
    tier = 'Intermediate';
    color = 'green';
  }

  return (
    <div className={`reputation-badge ${color}`}>
      <span className="tier">{tier}</span>
      <span className="score">{rep}</span>
    </div>
  );
}
```

---

## Testing

### Running Tests

```bash
npx hardhat test test/ReputationScoring.test.js
```

### Test Coverage

✅ **23 tests covering:**
- Base score calculation
- Verified profile bonus
- Credential scoring (verified & unverified)
- Achievement scoring
- Activity scoring
- Complete reputation calculation
- Deterministic behavior
- Edge cases
- Integration with existing functions

### Test Results

```
OnChainResume - Reputation Scoring System
  Base Score
    ✓ Should return 0 reputation for non-existent profile
    ✓ Should return base score (10) for newly created profile
    ✓ Should show base score in breakdown
  Verified Profile Bonus
    ✓ Should add 25 points when profile is verified
    ✓ Should show verified profile bonus in breakdown
    ✓ Should not add bonus for unverified profile
  Credential Scoring
    ✓ Should add 5 points per unverified credential
    ✓ Should add 15 bonus points per verified credential
    ✓ Should calculate mixed verified and unverified credentials correctly
  Achievement Scoring
    ✓ Should add 10 points per achievement
    ✓ Should calculate multiple achievements correctly
  Activity Scoring
    ✓ Should add 3 points per month of activity
    ✓ Should not add activity score without profile updates
    ✓ Should accumulate activity score over multiple updates
  Complete Reputation Calculation
    ✓ Should calculate comprehensive reputation score correctly
  Deterministic Calculation
    ✓ Should return consistent scores on multiple calls
    ✓ Should calculate same score for different users with same data
  Edge Cases
    ✓ Should handle zero breakdown for non-existent profile
    ✓ Should handle profile with no credentials or achievements
    ✓ Should handle many credentials efficiently
    ✓ Should handle very old profiles with large time differences
  Reputation Constants
    ✓ Should expose all scoring constants publicly
  Integration with Existing Functions
    ✓ Should work correctly with getTopProfiles sorting

23 passing (8s)
```

---

## Gas Optimization

The reputation calculation is:
- **View function** - No gas cost when called externally
- **O(n) complexity** where n = credential count
- **Optimized** - Uses cached profile fields where possible
- **Efficient** - Single pass through credentials array

---

## Security Considerations

✅ **No Manipulation** - Score calculated from verified on-chain data  
✅ **No Storage** - Reputation computed on-the-fly, can't be directly modified  
✅ **Deterministic** - Same inputs always produce same outputs  
✅ **Transparent** - All scoring rules are public constants  
✅ **Auditable** - Complete test coverage validates calculation logic  

---

## Future Enhancements

### Potential Extensions

1. **Dynamic Weights** - Allow admin to adjust scoring weights
2. **Category Bonuses** - Different points for credential categories
3. **Decay System** - Reduce points for expired credentials
4. **Tier System** - Define reputation tiers (Bronze, Silver, Gold, etc.)
5. **Leaderboard** - Optimized ranking system for top users
6. **NFT Badges** - Mint reputation tier badges as NFTs
7. **Reputation Staking** - Lock reputation for governance voting power

---

## Migration Guide

### Updating Existing Contracts

If you're migrating from the old reputation system:

1. **Old System**: Reputation was stored in `profiles[user].reputationScore`
2. **New System**: Reputation is calculated via `getReputation(user)`

**No migration needed!** The system uses existing on-chain data:
- Profile creation/update timestamps
- Credential verification status
- Achievement count

### Frontend Updates

Replace:
```javascript
// Old
const reputation = profile.reputationScore;
```

With:
```javascript
// New
const reputation = await contract.getReputation(userAddress);
```

---

## API Reference

### Read Functions

```solidity
// Get reputation score
function getReputation(address user) external view returns (uint256);

// Get detailed breakdown
function getReputationBreakdown(address user) external view returns (ReputationBreakdown memory);

// Scoring constants
uint256 public constant SCORE_BASE = 10;
uint256 public constant SCORE_VERIFIED_PROFILE = 25;
uint256 public constant SCORE_VERIFIED_CREDENTIAL = 15;
uint256 public constant SCORE_UNVERIFIED_CREDENTIAL = 5;
uint256 public constant SCORE_ACHIEVEMENT_BASE = 10;
uint256 public constant SCORE_PROFILE_UPDATE = 3;
```

---

## Support & Questions

For questions or issues with the reputation system:
- Review test suite: `test/ReputationScoring.test.js`
- Check contract: `contracts/OnChainResume.sol`
- Examine scoring constants and `_calculateReputation()` internal function

---

## Summary

The deterministic reputation scoring system provides:

1. **Transparency** - All rules are public and auditable
2. **Fairness** - Same actions = same rewards
3. **Incentives** - Rewards profile completion and engagement
4. **Flexibility** - Easy to extend with new scoring rules
5. **Efficiency** - Gas-optimized view functions
6. **Security** - Cannot be manipulated, only earned

**Result**: A robust, fair, and transparent reputation system that encourages quality profiles and community engagement.
