# Daily Leaderboard & Reward System

## Overview
A competitive daily ranking system for the puzzle feature where players earn points by solving puzzles and the top 10 players each day share a 0.1 ETH prize pool.

## Key Features

### 1. Daily Scoring System
- Players earn points based on:
  - **Puzzle Difficulty**: Higher rated puzzles = more points (base score = puzzle rating / 10)
  - **Time Bonus**: Faster solutions earn bonus points
    - < 30 seconds: +100 points
    - < 60 seconds: +75 points
    - < 120 seconds: +50 points
    - < 300 seconds: +25 points
  - Points accumulate throughout the day

### 2. Leaderboard Tracking
- Real-time daily rankings
- Top 100 players tracked
- Automatic ranking based on total score
- Displays: rank, player address, score, puzzles solved, average time

### 3. Reward Distribution
Daily prize pool of 0.1 ETH distributed to top 10 players:
- 🥇 1st place: 30% (0.03 ETH)
- 🥈 2nd place: 20% (0.02 ETH)
- 🥉 3rd place: 15% (0.015 ETH)
- 4th place: 10% (0.01 ETH)
- 5th place: 8% (0.008 ETH)
- 6th place: 6% (0.006 ETH)
- 7th place: 4% (0.004 ETH)
- 8th place: 3% (0.003 ETH)
- 9th place: 2% (0.002 ETH)
- 10th place: 2% (0.002 ETH)

### 4. Smart Contract Functions

#### New Functions Added
- `updateDailyScore()` - Automatically called when puzzle is solved
- `addPlayerToLeaderboard()` - Updates player's ranking position
- `getDailyRankings()` - Returns top players for a specific day
- `getPlayerDailyScore()` - Gets a player's score for a specific day
- `fundLeaderboardPrizePool()` - Admin function to fund the prize pool
- `distributeDailyRewards()` - Distributes rewards at end of day
- `getToday()` - Returns current day number
- `getLeaderboardPrizePool()` - Returns current prize pool balance

#### Events
- `DailyScoreUpdated` - Emitted when player scores points
- `DailyRewardsDistributed` - Emitted when rewards are paid out
- `LeaderboardPrizePoolFunded` - Emitted when prize pool is funded

## Frontend Integration

### Updated Components
1. **PuzzleTraining.tsx**
   - Daily leaderboard display (collapsible)
   - Real-time player score tracking
   - Prize pool display
   - Reward distribution table
   - Top 3 players highlighted with medals

2. **PuzzleTraining.module.css**
   - Leaderboard styling
   - Ranking table design
   - Prize pool display
   - Medal indicators for top 3

### Hook Updates (useAdvancedContracts.ts)
- Added leaderboard data fetching
- Added ranking update functions
- Added prize pool queries

## How It Works

### For Players
1. Solve puzzles throughout the day
2. Earn points based on difficulty and speed
3. Watch your rank on the leaderboard
4. Top 10 at end of day receive ETH rewards automatically

### For Admins
1. Fund the prize pool using `fundLeaderboardPrizePool()`
2. At end of day, call `distributeDailyRewards(dayNumber)`
3. Rewards are automatically distributed to top 10 players

## Deployment

### Deploy New Contract
```bash
npx hardhat run scripts/deployAdvanced.js --network base
```

### Initial Setup
The deployment script automatically:
- Deploys the updated ChessPuzzles contract
- Funds the prize pool with 0.5 ETH (5 days worth)
- Creates sample puzzles

### Update Frontend
Update the contract address in `app/contracts/addresses.ts` with the new ChessPuzzles address.

## Security Features
- Rewards only distributed once per day
- Automatic day tracking prevents double-claiming
- Prize pool balance checked before distribution
- Only admin can trigger reward distribution
- Player must actually solve puzzles to earn points

## Future Enhancements
1. Automatic daily reward distribution (via Chainlink Automation)
2. Weekly/Monthly leaderboards
3. NFT badges for top performers
4. Streak bonuses for consecutive days
5. Team competitions
6. Difficulty multipliers

## Gas Optimization Notes
- Rankings stored in array (max 100 players)
- Sorted insertion to maintain order
- Daily reset through new day number
- Batch operations where possible

## Testing Checklist
- [ ] Deploy contract to testnet
- [ ] Fund prize pool
- [ ] Solve multiple puzzles
- [ ] Verify score updates
- [ ] Check leaderboard display
- [ ] Test reward distribution
- [ ] Verify prize pool deduction
- [ ] Test with multiple users

## Contract Changes Summary
- Added `DailyScore` struct
- Added `DailyLeaderboard` struct with mappings
- Added daily scoring logic to `handlePuzzleSolved()`
- Added 7 new public functions
- Added 3 new events
- Added `DAILY_PRIZE_POOL` constant (0.1 ETH)
- Added `rewardDistribution` array for payout percentages
