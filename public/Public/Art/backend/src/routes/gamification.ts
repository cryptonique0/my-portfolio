import { Router, Request, Response } from 'express';
import { xpService } from '../services/xpService';
import { achievementService } from '../services/achievementService';
import { rewardsService } from '../services/rewardsService';

const router = Router();

// XP Routes
router.get('/xp/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userLevel = await xpService.getUserLevel(userId);
    const progress = await xpService.getLevelProgress(userId);
    const levelConfig = xpService.getLevelConfig(userLevel.currentLevel);

    res.json({
      level: userLevel.currentLevel,
      totalXP: userLevel.totalXP,
      xpInCurrentLevel: userLevel.xpInCurrentLevel,
      xpForNextLevel: userLevel.xpForNextLevel,
      progressPercentage: progress,
      levelTitle: levelConfig.title,
      levelColor: levelConfig.color
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user level' });
  }
});

router.get('/xp/levels', (req: Request, res: Response) => {
  try {
    const levels = xpService.getAllLevelConfigs();
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch level configs' });
  }
});

router.get('/xp/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await xpService.getXPHistory(userId, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch XP history' });
  }
});

router.post('/xp/award', async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason, relatedId } = req.body;
    const result = await xpService.awardXP(userId, amount, reason, relatedId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

router.get('/xp/leaderboard', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = xpService.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Achievement Routes
router.get('/achievements', (req: Request, res: Response) => {
  try {
    const achievements = achievementService.getAllAchievements();
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

router.get('/achievements/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const achievements = await achievementService.getUserAchievements(userId);
    const unlocked = achievements.filter(a => a.unlockedAt);
<<<<<<< HEAD
=======
    const inProgress = achievements.filter(a => !a.unlockedAt);
>>>>>>> 2caf294 (Initial commit with API documentation and features)

    res.json({
      total: achievementService.getAllAchievements().length,
      unlockedCount: unlocked.length,
<<<<<<< HEAD
      unlockedAchievements: unlocked
=======
      inProgressCount: inProgress.length,
      unlockedAchievements: unlocked,
      inProgressAchievements: inProgress
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

<<<<<<< HEAD
=======
router.post('/achievements/unlock', async (req: Request, res: Response) => {
  try {
    const { userId, achievementId } = req.body;
    const result = await achievementService.unlockAchievement(userId, achievementId);
    if (result) {
      res.json({ success: true, achievement: result });
    } else {
      res.status(400).json({ error: 'Achievement not found or already unlocked' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlock achievement' });
  }
});

router.post('/achievements/progress', async (req: Request, res: Response) => {
  try {
    const { userId, achievementId, progress } = req.body;
    const result = await achievementService.updateProgress(userId, achievementId, progress);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update achievement progress' });
  }
});

router.get('/achievements/:achievementId', (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;
    const achievement = achievementService.getAchievementDetails(achievementId);
    if (achievement) {
      res.json(achievement);
    } else {
      res.status(404).json({ error: 'Achievement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievement' });
  }
});

>>>>>>> 2caf294 (Initial commit with API documentation and features)
// Daily Rewards Routes
router.get('/rewards/daily/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const reward = await rewardsService.getDailyReward(userId);
    const canClaim = !reward.claimed;
<<<<<<< HEAD

    res.json({
      ...reward,
      canClaim
=======
    const streak = await rewardsService.getCurrentStreak(userId);

    res.json({
      ...reward,
      canClaim,
      streak
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily reward' });
  }
});

router.post('/rewards/daily/claim', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const result = await rewardsService.claimDailyReward(userId);
    if (result) {
      res.json({ success: true, reward: result });
    } else {
      res.status(400).json({ error: 'Reward already claimed or not available' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim daily reward' });
  }
});

<<<<<<< HEAD
// Lucky Draw Routes
router.get('/rewards/lucky-draw/prizes', (req: Request, res: Response) => {
  try {
    res.json([]);
=======
router.get('/rewards/daily/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const history = await rewardsService.getDailyRewardHistory(userId, days);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reward history' });
  }
});

// Lucky Draw Routes
router.get('/rewards/lucky-draw/prizes', (req: Request, res: Response) => {
  try {
    const prizes = rewardsService.getPrizeConfigs();
    res.json(prizes);
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prize configs' });
  }
});

router.post('/rewards/lucky-draw/spin', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
<<<<<<< HEAD
=======

    // Check if user can draw
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    const canDraw = await rewardsService.canUserDraw(userId);
    if (!canDraw) {
      return res.status(400).json({ error: 'You can only draw once per day' });
    }

    const entry = await rewardsService.createLuckyDrawEntry(userId);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lucky draw entry' });
  }
});

router.post('/rewards/lucky-draw/claim', async (req: Request, res: Response) => {
  try {
    const { userId, drawId } = req.body;
    const result = await rewardsService.claimLuckyDrawPrize(userId, drawId);
    if (result) {
      res.json({ success: true, prize: result });
    } else {
      res.status(400).json({ error: 'Prize not found or already claimed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim prize' });
  }
});

<<<<<<< HEAD
=======
router.get('/rewards/lucky-draw/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await rewardsService.getLuckyDrawHistory(userId, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch draw history' });
  }
});

>>>>>>> 2caf294 (Initial commit with API documentation and features)
router.get('/rewards/lucky-draw/can-draw/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const canDraw = await rewardsService.canUserDraw(userId);
    res.json({ canDraw });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check draw eligibility' });
  }
});

export default router;
