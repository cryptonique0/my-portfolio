# Quick Start: Using New Leaderboard Features

## For Users

### 1. Boost Your Reputation Instantly (15% Multiplier)
```
1. Go to your profile
2. Click "Stake Tokens" 
3. Lock your tokens for 30 days
4. Get 15% reputation boost immediately
5. Stake expires after 30 days
```
**Cost:** Your tokens (locked 30 days)  
**Reward:** +15% reputation boost

### 2. Build an Activity Streak
```
1. Create your profile (1-month streak starts)
2. Update your profile at least once every 30 days
3. Each new month = +5 reputation bonus
4. 5-month streak = +25 bonus
5. 12-month streak = +60 bonus
```
**Cost:** Just 5 minutes per month  
**Reward:** Passive +5 points/month

### 3. Get Your Credentials Verified
```
1. Add 3-5 credentials (education, work, certs)
2. Each unverified = +5 points
3. Get 2+ independent verifiers
4. Verified credential = +20 total points
5. 5 verified credentials = +100 points
```
**Cost:** Proof documents, find verifiers  
**Reward:** +5 to +20 points per credential

### 4. Unlock Achievements
```
1. Complete platform milestones
2. Each achievement = +10 points
3. Achievements are free/automatic
4. 3 achievements = +30 points
```
**Cost:** None (automatic)  
**Reward:** +10 points per achievement

## For Verifiers

### Build Verifier Reputation
```
1. Verify 5+ credentials from real users
2. Build success rate (>75% = credible)
3. Your verifications get +20% weight
4. Unlock ability to flag fraudulent creds
5. Help community, boost your own reputation
```

### Flag & Report Fraud
```
1. Verify 3+ credentials (build reputation)
2. See suspicious credential? Click "Flag"
3. Admins review your report
4. If fraud confirmed: credential slashed
5. Get community trust score
```

## For Admins

### Manage Fraudulent Credentials
```
// Clear a flagged credential (legitimate)
contract.clearFlaggedCredential(userAddress, credentialIndex)

// Slash a credential (fraudulent)
contract.slashCredential(userAddress, credentialIndex)

// Check verifier reputation
contract.getVerifierReputation(verifierAddress)
```

---

## Leaderboard Positions

### Example Rankings (After Features)

| Position | Handle | Rep Score | Method |
|----------|--------|-----------|--------|
| #1 | elite_dev | 285 | All features max'd |
| #5 | verified_pm | 240 | 5 verified creds + stake |
| #10 | streak_master | 210 | 8-month streak + creds |
| #50 | casual_user | 120 | Base + 2 credentials |
| #100 | new_profile | 60 | Base + 1 credential |

---

## Reputation Scoring Quick Reference

| Component | Points | How to Get |
|-----------|--------|-----------|
| Base Profile | 10 | Create profile |
| Verified Profile | 25 | Admin approval |
| Credential | 5 | Add credential |
| Verified Credential | +15 | Get 2+ verifications |
| Achievement | 10 | Unlock achievement |
| Monthly Activity | 3 | Update profile monthly |
| Staking Bonus | 15% | Lock tokens 30 days |
| Streak Bonus | 5/month | Active 30 days consecutively |

**Maximum Potential:** 250+ points (competitive top 10)

---

## Gas Optimization Tips

### Cheaper Operations
- `updateProfile()` - Minimal gas, updates streak
- `verifyCredential()` - Simple state update
- All view functions - Free (no gas)

### Monitor Costs
- `addCredential()` - Medium gas (array push)
- `flagCredential()` - Medium gas
- `createStake()` - Medium gas

---

## Common Questions

**Q: Can I unstake before 30 days?**  
A: Yes, but you lose the 15% reputation boost.

**Q: What if my streak breaks?**  
A: If you go 35+ days without updating, streak resets to 1.

**Q: How do I become a verifier?**  
A: Just verify credentials! After 3 verifications, you can flag frauds.

**Q: What if my credential gets slashed?**  
A: It's permanently removed from reputation calculation. Admin can clear if you appeal.

**Q: Can I have multiple stakes?**  
A: No, one active stake per user. Release old stake to create new one.

**Q: How is the leaderboard updated?**  
A: Every time reputation changes (verify, stake, flag, etc.)

---

## Roadmap to Top 10

### Month 1: Build Foundation
- [ ] Create profile (10 pts)
- [ ] Add 4 credentials (20 pts)
- [ ] Get 2 verified (30 pts)
- [ ] Create stake (15% boost ≈ 8 pts)
- **Total: ~68 points**

### Month 2: Multiply Effects
- [ ] Maintain activity streak (+5 pts)
- [ ] Unlock 2 achievements (20 pts)
- [ ] Add 2 more credentials (10 pts)
- [ ] Stake still active (+8 pts)
- **Total: ~111 points**

### Month 3-6: Reach Top 10
- [ ] Build 3-4 month streak (+15-20 pts)
- [ ] Verify profile (+25 pts)
- [ ] Get 5+ total verified credentials (+45 pts)
- [ ] Unlock 3-4 achievements (+30 pts)
- [ ] Renew stake at expiry (maintain +15%)
- **Total: 180-250+ points (TOP 10)**

---

## Technical Details

### State Variables Initialized
```solidity
userStakes[msg.sender]      // Your stake record
userStreaks[msg.sender]     // Your streak tracker
verifierReputation[address] // Verifier stats
leaderboard[]               // Top 100 cache
```

### Key Events to Monitor
```solidity
StakeCreated(user, amount, boostMultiplier, expiresAt)
StreakAchieved(user, streakCount, bonusPoints)
CredentialVerified(user, index, verifier, timestamp)
CredentialFlagged(user, index, flagger, reason)
CredentialSlashed(user, index)
ReputationScoreUpdated(user, oldScore, newScore)
```

---

**Start your leaderboard climb today!**  
Created: January 6, 2026
