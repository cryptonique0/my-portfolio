# Chess Learning Platform - Advanced Features

This document describes the advanced smart contract features for learning and coaching in the chess platform.

## 🎓 Smart Contracts Overview

### 1. ChessAcademy.sol

A comprehensive learning management system on-chain that tracks player progress, achievements, and skill development.

**Key Features:**
- **Skill Tracking**: 6 skill categories (Opening, Middlegame, Endgame, Tactics, Strategy, Calculation)
- **Achievement System**: NFT badges for milestones
- **Learning Paths**: Structured courses with multiple lessons
- **Game Analysis**: AI-powered analysis storing weaknesses/strengths on-chain
- **Streak System**: Daily activity tracking with rewards

**Main Functions:**
```solidity
createAchievement(name, description, badgeURI, requirements...)
createLearningPath(title, description, lessonIds, difficulty...)
createLesson(title, contentURI, category, difficulty, skillPoints)
completeLesson(lessonId) - Student completes a lesson, earns skill points
submitGameAnalysis(gameId, player, skillChanges, weaknesses, strengths, accuracy)
getPlayerStats(player) - Returns games analyzed, lessons completed, streaks
getAllSkillLevels(player) - Returns 0-1000 rating per skill category
```

**Skill Categories:**
0. Opening - Opening theory and preparation
1. Middlegame - Middlegame strategy
2. Endgame - Endgame technique
3. Tactics - Tactical pattern recognition
4. Strategy - Positional understanding
5. Calculate - Calculation ability

### 2. ChessCoach.sol

Marketplace for certified chess coaches to offer paid lessons with escrow protection.

**Key Features:**
- **Coach Registration**: Coaches register with bio, specialties, hourly rates
- **Certification System**: Admin-verified coaches with credentials
- **Session Booking**: Students book 1-on-1 or group sessions
- **Escrow Payments**: Funds held until session completion
- **Rating System**: 5-star ratings with reviews
- **Dispute Resolution**: Admin-mediated conflict resolution
- **Cancellation Policy**: Tiered refunds based on notice time

**Main Functions:**
```solidity
registerAsCoach(name, bio, hourlyRate, specialtyIndices)
addCertification(coachAddress, name, issuer, credentialURI)
bookSession(coachAddress, sessionType, scheduledTime, duration) payable
completeSession(sessionId, contentURI) - Coach marks session complete
rateCoach(sessionId, rating, feedback) - Student rates after completion
releasePayment(sessionId) - Release escrow after grace period
cancelSession(sessionId) - Cancel with refund policy
raiseDispute(sessionId) - Initiate dispute resolution
```

**Session Types:**
0. OneOnOne - Private 1-on-1 coaching
1. Group - Group lessons
2. Analysis - Game analysis session
3. Opening - Opening preparation
4. Endgame - Endgame training

**Cancellation Policy:**
- Coach cancels: Full refund
- Student cancels >24h before: Full refund
- Student cancels 2-24h before: 50% refund
- Student cancels <2h before: No refund

### 3. ChessPuzzles.sol

On-chain chess puzzle platform with ELO-based ratings and rewards.

**Key Features:**
- **ELO Rating System**: Players and puzzles both have ratings
- **Theme-based Training**: 10 different puzzle themes
- **Reward Pools**: Solve puzzles to earn ETH rewards
- **Daily Challenges**: Community puzzles with shared prize pools
- **Streak Tracking**: Consecutive solving streaks
- **Difficulty Levels**: 5 difficulty tiers
- **Performance Bonuses**: Faster solving = higher rewards

**Main Functions:**
```solidity
createPuzzle(fen, solution, theme, difficulty, estimatedRating) payable
attemptPuzzle(puzzleId, moveSequence, timeSpent)
createDailyChallenge(puzzleId) payable - Admin creates daily puzzle
completeDailyChallenge(moveSequence) - Solve to earn share of prize
getPlayerStats(player) - Returns attempts, solved, streaks, rating
hasSolvedPuzzle(player, puzzleId)
getThemeRating(player, theme) - Rating per theme
```

**Puzzle Themes:**
0. Checkmate - Checkmate in N moves
1. Tactics - Tactical combinations
2. Endgame - Endgame positions
3. Opening - Opening traps
4. Middlegame - Middlegame tactics
5. Trapped - Trapped pieces
6. Fork - Knight/Queen forks
7. Pin - Pins
8. Skewer - Skewers
9. Discovery - Discovered attacks

**Difficulty Levels:**
0. Beginner (1000-1300)
1. Intermediate (1300-1600)
2. Advanced (1600-1900)
3. Expert (1900-2200)
4. Master (2200+)

## 🚀 Deployment

Deploy all contracts:
```bash
npm run compile
npx hardhat run scripts/deployAdvanced.js --network baseSepolia
```

Update contract addresses in `app/contracts/addresses.ts`:
```typescript
export const CHESS_ACADEMY_ADDRESS = '0x...';
export const CHESS_COACH_ADDRESS = '0x...';
export const CHESS_PUZZLES_ADDRESS = '0x...';
```

## 💻 Frontend Integration

### Components

1. **LearningDashboard** (`app/components/LearningDashboard.tsx`)
   - Displays player stats and skill levels
   - Shows learning paths and achievements
   - Progress tracking visualization

2. **CoachMarketplace** (`app/components/CoachMarketplace.tsx`)
   - Browse certified coaches
   - Filter by specialty, rating, price
   - Book coaching sessions
   - Session booking modal with escrow

3. **PuzzleTraining** (`app/components/PuzzleTraining.tsx`)
   - Solve chess puzzles
   - Track rating and progress
   - Daily challenges
   - Earn rewards for solving

### Hooks

`useChessAcademy()` - Academy contract interactions
`useChessCoach()` - Coach marketplace interactions
`useChessPuzzles()` - Puzzle platform interactions

## 📊 Use Cases

### For Students

1. **Learn & Progress**
   - Complete lessons to earn skill points
   - Track progress across 6 skill categories
   - Unlock achievements and NFT badges
   - Build daily learning streaks

2. **Get Coached**
   - Browse certified coaches
   - Book sessions with escrow protection
   - Receive personalized training
   - Rate and review coaches

3. **Train with Puzzles**
   - Solve rated puzzles to improve
   - Compete in daily challenges
   - Earn rewards for solving
   - Track theme-specific ratings

### For Coaches

1. **Register & Certify**
   - Create coach profile
   - Add credentials and certifications
   - Set hourly rates and specialties

2. **Offer Sessions**
   - Schedule coaching sessions
   - Receive payments via escrow
   - Build reputation through ratings
   - Create lesson content

### For Platform

1. **Content Management**
   - Create achievements and badges
   - Design learning paths
   - Curate puzzle collections
   - Host daily challenges

2. **Quality Control**
   - Certify coaches
   - Moderate disputes
   - Manage prize pools
   - Track platform metrics

## 🎯 Key Innovations

1. **On-Chain Skill Tracking**: Permanent, verifiable record of player progress
2. **Escrow-Protected Coaching**: Safe payments with dispute resolution
3. **Dynamic Puzzle Ratings**: ELO system adjusts puzzle difficulty based on solve rates
4. **Achievement NFTs**: Permanent badges for milestones
5. **Reward Mechanisms**: Earn cryptocurrency for learning
6. **Streak Incentives**: Daily engagement rewards
7. **Theme-Based Learning**: Targeted skill development
8. **Community Challenges**: Competitive learning environment

## 🔐 Security Features

- **Access Control**: Admin and coach-only functions
- **Escrow System**: Safe payment holding
- **Grace Periods**: 24h to dispute before payment release
- **Rating Validation**: Prevents manipulation
- **Reentrancy Protection**: Safe ETH transfers
- **Input Validation**: Sanitized user inputs

## 📈 Future Enhancements

1. **AI Integration**: Automated game analysis via Gemini
2. **Tournament System**: On-chain tournaments with prizes
3. **Social Features**: Friend challenges, leaderboards
4. **Video Lessons**: IPFS-hosted video content
5. **Subscription Model**: Monthly access to premium content
6. **Coach Earnings Dashboard**: Analytics for coaches
7. **Student Analytics**: Detailed progress tracking
8. **Mobile App**: React Native integration
9. **Live Sessions**: Video call integration
10. **Community Voting**: DAO-based content curation

## 🎮 Integration with Existing Chess Game

The academy can analyze completed games from the main Chess.sol contract:

```solidity
// After game ends in Chess.sol
chessAcademy.submitGameAnalysis(
    gameId,
    playerAddress,
    [10, -5, 15, 20, 0, 5], // Skill changes
    ["Missed tactical opportunity on move 12"],
    ["Strong endgame technique"],
    85 // Accuracy score
);
```

## 💡 Example Workflows

### Student Journey
1. Complete "Beginner Fundamentals" learning path
2. Earn "First Steps" achievement
3. Book session with GM Sarah Chen
4. Solve daily puzzle challenge
5. Increase Opening rating to 800
6. Unlock "Tactical Master" achievement

### Coach Journey
1. Register with credentials
2. Get certified by admin
3. List specialties and rate
4. Receive booking from student
5. Complete session, upload notes
6. Receive payment after grace period
7. Build 4.8★ rating from reviews

## 📝 Notes

- All URIs use IPFS for decentralized content storage
- Ratings use integers (500 = 5 stars) for precision
- Skill levels capped at 1000 per category
- ELO K-factor = 32 for moderate rating changes
- Platform fee = 10% of coaching sessions
- Daily challenges reset at midnight UTC

## 🛠️ Testing

Run contract tests:
```bash
npx hardhat test
```

Test specific contract:
```bash
npx hardhat test test/ChessAcademy.test.js
npx hardhat test test/ChessCoach.test.js
npx hardhat test test/ChessPuzzles.test.js
```

## 📞 Support

For issues or questions about the learning platform features, please check the contract comments or create an issue in the repository.
