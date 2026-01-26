# 🏆 Gamification System Guide

## Overview

The BitArt Market platform now includes a comprehensive gamification system with achievement tracking, XP progression, daily rewards, and lucky draws. This guide covers all features, implementation details, and API endpoints.

## Features

### 1. 📊 XP & Leveling System
- **10-Level Progression**: From "Novice" (Level 1) to "Ascendant" (Level 10)
- **Dynamic XP Requirements**: XP requirements increase with each level
- **Color-Coded Levels**: Each level has a unique color for visual distinction
- **Progress Tracking**: Real-time level progress with percentage display

**Level Structure:**
| Level | Title | Min XP | Max XP | Color |
|-------|-------|--------|--------|-------|
| 1 | Novice | 0 | 100 | Gray |
| 2 | Apprentice | 100 | 250 | Blue |
| 3 | Craftsman | 250 | 500 | Purple |
| 4 | Master | 500 | 1000 | Pink |
| 5 | Legend | 1000 | 2000 | Amber |
| 6 | Mythic | 2000 | 4000 | Red |
| 7 | Eternal | 4000 | 8000 | Violet |
| 8 | Celestial | 8000 | 20000 | Cyan |
| 9 | Transcendent | 20000 | 50000 | Green |
| 10 | Ascendant | 50000 | 100000 | Gold |

### 2. 🏅 Achievement System
**Rarity Tiers:**
- Common (Gray) - Basic achievements
- Uncommon (Blue) - Standard challenges
- Rare (Purple) - Advanced goals
- Epic (Pink) - Challenging milestones
- Legendary (Gold) - Ultimate achievements

**Achievement Categories:**
- **Creator**: Minting NFTs (First Creation, Prolific Creator, Master Creator)
- **Collector**: Purchasing NFTs (Collector, Avid Collector, Museum Owner)
- **Trader**: Trading & bidding (Trader, Veteran Trader, Auctioneer)
- **Social**: Community engagement (Social Butterfly, Popular Creator)
- **Milestone**: Level-based rewards (Milestone Master, Legendary Status)
- **Special**: Time-based rewards (Consistent Creator, Dedicated)

### 3. 🎁 Daily Rewards
- **Base XP**: 50 XP per day
- **Streak Bonus**: 10 XP per consecutive day
- **Max Streak**: 365 days
- **Reset Time**: Midnight UTC
- **Auto-Claiming**: Users must claim within 24 hours

**Example Rewards:**
- Day 1: 50 XP
- Day 7 (streak): 50 + (7 × 10) = 120 XP
- Day 30 (streak): 50 + (30 × 10) = 350 XP

### 4. 🎰 Lucky Draws
**Daily Spin** (Once per 24 hours):

| Prize | Probability | XP Value | Rarity |
|-------|-------------|----------|--------|
| 100 XP | 30% | 100 | Common |
| 250 XP | 25% | 250 | Uncommon |
| 500 XP | 15% | 500 | Rare |
| 1000 XP | 8% | 1000 | Epic |
| Rare Badge | 10% | - | Rare |
| Epic Badge | 7% | - | Epic |
| 10% NFT Discount | 4% | - | Rare |
| Feature Boost | 1% | - | Legendary |

## Backend Implementation

### API Endpoints

#### XP Endpoints
```bash
# Get user level & progress
GET /api/gamification/xp/user/:userId

# Get all level configs
GET /api/gamification/xp/levels

# Get XP transaction history
GET /api/gamification/xp/history/:userId?limit=20

# Award XP to user
POST /api/gamification/xp/award
Body: { userId, amount, reason, relatedId? }

# Get leaderboard
GET /api/gamification/xp/leaderboard?limit=10
```

#### Achievement Endpoints
```bash
# Get all achievements
GET /api/gamification/achievements

# Get user achievements
GET /api/gamification/achievements/user/:userId

# Unlock achievement
POST /api/gamification/achievements/unlock
Body: { userId, achievementId }

# Update progress
POST /api/gamification/achievements/progress
Body: { userId, achievementId, progress }

# Get achievement details
GET /api/gamification/achievements/:achievementId
```

#### Daily Rewards
```bash
# Get daily reward for user
GET /api/gamification/rewards/daily/:userId

# Claim daily reward
POST /api/gamification/rewards/daily/claim
Body: { userId }

# Get reward history
GET /api/gamification/rewards/daily/history/:userId?days=30
```

#### Lucky Draw
```bash
# Get available prizes
GET /api/gamification/rewards/lucky-draw/prizes

# Spin the wheel (create entry)
POST /api/gamification/rewards/lucky-draw/spin
Body: { userId }

# Claim prize
POST /api/gamification/rewards/lucky-draw/claim
Body: { userId, drawId }

# Check if user can draw
GET /api/gamification/rewards/lucky-draw/can-draw/:userId

# Get draw history
GET /api/gamification/rewards/lucky-draw/history/:userId?limit=10
```

### Services

**xpService.ts**
- `awardXP()` - Award XP and handle level-ups
- `getUserLevel()` - Get user's level info
- `getLevelConfig()` - Get config for specific level
- `getAllLevelConfigs()` - Get all level configurations
- `getLevelProgress()` - Get progress percentage
- `getXPHistory()` - Get user's XP transactions
- `getLeaderboard()` - Get top players

**achievementService.ts**
- `getAllAchievements()` - Get all achievements
- `getUserAchievements()` - Get user's achievements
- `unlockAchievement()` - Unlock achievement
- `updateProgress()` - Update achievement progress
- `getAchievementDetails()` - Get single achievement
- `getUnlockedCount()` - Count unlocked achievements

**rewardsService.ts**
- `getDailyReward()` - Get or create daily reward
- `claimDailyReward()` - Claim daily reward
- `getDailyRewardHistory()` - Get reward history
- `getCurrentStreak()` - Get current streak
- `drawPrize()` - Random prize selection
- `createLuckyDrawEntry()` - Create draw entry
- `claimLuckyDrawPrize()` - Claim drawn prize
- `getLuckyDrawHistory()` - Get draw history
- `getPrizeConfigs()` - Get all prizes
- `canUserDraw()` - Check if user can draw

## Frontend Components

### AchievementBadge.tsx
```tsx
<AchievementBadge
  icon="✨"
  title="First Creation"
  description="Mint your first NFT"
  rarity="common"
  unlocked={true}
/>
```

**Props:**
- `icon`: String emoji
- `title`: Achievement name
- `description`: Achievement description
- `rarity`: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
- `unlocked`: Boolean
- `progress`: Number (for locked achievements)
- `requirement`: Number (for locked achievements)
- `onClick`: Callback

### LevelBar.tsx
```tsx
<LevelBar
  currentLevel={5}
  totalXP={2500}
  xpInCurrentLevel={500}
  xpForNextLevel={1000}
  levelTitle="Legend"
  levelColor="#F59E0B"
/>
```

### DailyRewardClaim.tsx
```tsx
<DailyRewardClaim
  userId="user123"
  onClaimed={(xp, streak) => console.log(`Claimed ${xp} XP, streak: ${streak}`)}
/>
```

### LuckyDrawWheel.tsx
```tsx
<LuckyDrawWheel
  userId="user123"
  onWheelSpin={(prize) => console.log('Won:', prize)}
  onPrizeClaimed={(value) => console.log('Claimed:', value)}
/>
```

### GamificationDashboard.tsx
```tsx
import GamificationDashboard from './pages/GamificationDashboard';

<GamificationDashboard userId="user123" />
```

**Features:**
- Overview tab with level progress, daily rewards, lucky draw
- Achievements tab with unlocked/locked badges
- Leaderboard tab with top 10 players
- XP activity log
- Real-time notifications

## Integration Examples

### Award XP After NFT Mint
```typescript
await xpService.awardXP(userId, 100, 'mint', nftId);
await achievementService.updateProgress(userId, 'first_nft', 1);
```

### Award XP After Purchase
```typescript
await xpService.awardXP(userId, 50, 'purchase', nftId);
await achievementService.updateProgress(userId, 'first_purchase', purchases);
```

### Award XP After Creator Follow
```typescript
await xpService.awardXP(userId, 25, 'follow', creatorId);
```

## UI/UX Features

### Dark Mode Support
All components fully support dark mode with Tailwind CSS dark variants.

### Responsive Design
- Mobile-optimized layouts
- Adaptive grid systems
- Touch-friendly controls

### Animations
- Smooth level-up transitions
- Spinning wheel animations
- Achievement unlock celebrations
- Progress bar animations
- Staggered list animations

### Notifications
- XP earned notifications
- Achievement unlocked banners
- Streak maintained alerts
- Prize won popups

## Database Schema (When Moving to Production)

```sql
-- Users XP and Levels
CREATE TABLE user_levels (
  user_id VARCHAR PRIMARY KEY,
  current_level INT,
  total_xp INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- User Achievements
CREATE TABLE user_achievements (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  achievement_id VARCHAR,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- XP Transactions
CREATE TABLE xp_transactions (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  amount INT,
  reason VARCHAR,
  related_id VARCHAR,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Daily Rewards
CREATE TABLE daily_rewards (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  date DATE,
  xp_amount INT,
  claimed BOOLEAN,
  streak INT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Lucky Draws
CREATE TABLE lucky_draws (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  prize_type VARCHAR,
  prize_value INT,
  claimed BOOLEAN,
  drawn_at TIMESTAMP,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Accessing the Dashboard

**Development:**
```bash
npm run dev
# Navigate to: http://localhost:5173/gamification
```

**Production:**
```
https://bitart-market.com/gamification
```

## Future Enhancements

- [ ] Seasonal events with bonus XP
- [ ] Weekly challenges
- [ ] Community competitions
- [ ] NFT badge rewards
- [ ] Marketplace badges for creators
- [ ] Referral bonus system
- [ ] Tier-based benefits (discounts, features)
- [ ] Leaderboard filters by timeframe
- [ ] Achievement trading
- [ ] Cosmetic rewards (animations, themes)

## Performance Considerations

Currently using in-memory storage for demonstration. For production:

1. **Move to Database**: Store in Supabase/PostgreSQL
2. **Caching**: Redis for leaderboard updates
3. **Batch Updates**: Queue XP awards for efficiency
4. **Background Jobs**: Process daily streaks at scheduled time
5. **Indexes**: Add indexes on user_id, timestamp fields
6. **Pagination**: Implement for large result sets

## Troubleshooting

**Daily Reward Not Appearing:**
- Check system time (reset at midnight UTC)
- Verify user exists in system
- Check for claimed status

**XP Not Awarding:**
- Verify userId format matches
- Check service initialization
- Confirm reason parameter is valid

**Lucky Draw Spinning Twice:**
- Implement backend rate limiting
- Add loading state to prevent double-click
- Check 24-hour cooldown enforcement

## Support

For issues or feature requests, create an issue on the BitArt Market GitHub repository.
