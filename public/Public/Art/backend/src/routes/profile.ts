import express from 'express';
import { ProfileService } from '../services/profile.service';
import { AchievementsService } from '../services/achievements.service';
import { VerificationService } from '../services/verification.service';
import { TradingStatsService } from '../services/trading-stats.service';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * GET /api/profile/:userId
 * Get user profile by ID
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await ProfileService.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/profile/username/:username
 * Get user profile by username
 */
router.get('/username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await ProfileService.getProfileByUsername(username);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    logger.error('Error in GET /api/profile/username/:username:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/profile
 * Update user profile
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const updates = req.body;

    const success = await ProfileService.updateProfile(userId, updates);
    if (!success) {
      return res.status(400).json({ error: 'Failed to update profile' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Error in PUT /api/profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/profile/avatar
 * Update user avatar
 */
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = await ProfileService.updateAvatar(
      userId,
      req.file.buffer,
      req.file.originalname
    );

    if (!avatarUrl) {
      return res.status(500).json({ error: 'Failed to upload avatar' });
    }

    res.json({ success: true, avatar_url: avatarUrl });
  } catch (error) {
    logger.error('Error in POST /api/profile/avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

/**
 * POST /api/profile/banner
 * Update user banner
 */
router.post('/banner', authenticateToken, upload.single('banner'), async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bannerUrl = await ProfileService.updateBanner(
      userId,
      req.file.buffer,
      req.file.originalname
    );

    if (!bannerUrl) {
      return res.status(500).json({ error: 'Failed to upload banner' });
    }

    res.json({ success: true, banner_url: bannerUrl });
  } catch (error) {
    logger.error('Error in POST /api/profile/banner:', error);
    res.status(500).json({ error: 'Failed to upload banner' });
  }
});

/**
 * PUT /api/profile/social-links
 * Update social links
 */
router.put('/social-links', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const links = req.body;

    const success = await ProfileService.updateSocialLinks(userId, links);
    if (!success) {
      return res.status(400).json({ error: 'Failed to update social links' });
    }

    res.json({ success: true, message: 'Social links updated successfully' });
  } catch (error) {
    logger.error('Error in PUT /api/profile/social-links:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

/**
 * GET /api/profile/:userId/portfolio-stats
 * Get portfolio statistics
 */
router.get('/:userId/portfolio-stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await ProfileService.getPortfolioStats(userId);
    if (!stats) {
      return res.status(404).json({ error: 'Failed to fetch portfolio stats' });
    }

    res.json(stats);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/portfolio-stats:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio stats' });
  }
});

/**
 * GET /api/profile/:userId/portfolio-history
 * Get portfolio value history
 */
router.get('/:userId/portfolio-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const history = await ProfileService.getPortfolioHistory(userId, days);
    res.json(history);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/portfolio-history:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio history' });
  }
});

/**
 * GET /api/profile/:userId/achievements
 * Get user achievements
 */
router.get('/:userId/achievements', async (req, res) => {
  try {
    const { userId } = req.params;

    const achievements = await AchievementsService.getUserAchievements(userId);
    res.json(achievements);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

/**
 * GET /api/profile/:userId/achievement-progress
 * Get achievement progress
 */
router.get('/:userId/achievement-progress', async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await AchievementsService.getAchievementProgress(userId);
    res.json(progress);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/achievement-progress:', error);
    res.status(500).json({ error: 'Failed to fetch achievement progress' });
  }
});

/**
 * GET /api/profile/:userId/achievement-stats
 * Get achievement statistics
 */
router.get('/:userId/achievement-stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await AchievementsService.getUserAchievementStats(userId);
    res.json(stats);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/achievement-stats:', error);
    res.status(500).json({ error: 'Failed to fetch achievement stats' });
  }
});

/**
 * POST /api/profile/check-achievements
 * Check and unlock eligible achievements
 */
router.post('/check-achievements', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const newAchievements = await AchievementsService.checkAndUnlockAchievements(userId);
    res.json({
      success: true,
      new_achievements: newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    logger.error('Error in POST /api/profile/check-achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

/**
 * GET /api/profile/:userId/trading-stats
 * Get trading statistics
 */
router.get('/:userId/trading-stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const period = (req.query.period as any) || 'all_time';

    const stats = await TradingStatsService.getTradingStats(userId, period);
    if (!stats) {
      return res.status(404).json({ error: 'Failed to fetch trading stats' });
    }

    res.json(stats);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/trading-stats:', error);
    res.status(500).json({ error: 'Failed to fetch trading stats' });
  }
});

/**
 * GET /api/profile/:userId/trading-activity
 * Get trading activity chart data
 */
router.get('/:userId/trading-activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const activity = await TradingStatsService.getTradingActivity(userId, days);
    res.json(activity);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/trading-activity:', error);
    res.status(500).json({ error: 'Failed to fetch trading activity' });
  }
});

/**
 * GET /api/profile/:userId/top-trades
 * Get top trades
 */
router.get('/:userId/top-trades', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const trades = await TradingStatsService.getTopTrades(userId, limit);
    res.json(trades);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/top-trades:', error);
    res.status(500).json({ error: 'Failed to fetch top trades' });
  }
});

/**
 * GET /api/profile/:userId/trading-streak
 * Get trading streak
 */
router.get('/:userId/trading-streak', async (req, res) => {
  try {
    const { userId } = req.params;

    const streak = await TradingStatsService.getTradingStreak(userId);
    res.json(streak);
  } catch (error) {
    logger.error('Error in GET /api/profile/:userId/trading-streak:', error);
    res.status(500).json({ error: 'Failed to fetch trading streak' });
  }
});

/**
 * POST /api/profile/verification/request
 * Submit verification request
 */
router.post('/verification/request', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { request_type, social_proof, portfolio_links, reason } = req.body;

    if (!request_type || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const request = await VerificationService.submitVerificationRequest(userId, request_type, {
      social_proof: social_proof || [],
      portfolio_links: portfolio_links || [],
      reason,
    });

    if (!request) {
      return res.status(400).json({ error: 'Failed to submit verification request' });
    }

    res.json({ success: true, request });
  } catch (error) {
    logger.error('Error in POST /api/profile/verification/request:', error);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
});

/**
 * GET /api/profile/verification/eligibility/:type
 * Check verification eligibility
 */
router.get('/verification/eligibility/:type', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const requestType = req.params.type as any;

    const eligibility = await VerificationService.checkVerificationEligibility(userId, requestType);
    res.json(eligibility);
  } catch (error) {
    logger.error('Error in GET /api/profile/verification/eligibility/:type:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

/**
 * GET /api/profile/verification/requests
 * Get user's verification requests
 */
router.get('/verification/requests', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const requests = await VerificationService.getUserVerificationRequests(userId);
    res.json(requests);
  } catch (error) {
    logger.error('Error in GET /api/profile/verification/requests:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
});

/**
 * GET /api/profile/search
 * Search profiles
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const profiles = await ProfileService.searchProfiles(query, limit);
    res.json(profiles);
  } catch (error) {
    logger.error('Error in GET /api/profile/search:', error);
    res.status(500).json({ error: 'Failed to search profiles' });
  }
});

/**
 * GET /api/profile/top
 * Get top profiles
 */
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const profiles = await ProfileService.getTopProfiles(limit);
    res.json(profiles);
  } catch (error) {
    logger.error('Error in GET /api/profile/top:', error);
    res.status(500).json({ error: 'Failed to fetch top profiles' });
  }
});

/**
 * GET /api/profile/verified
 * Get verified profiles
 */
router.get('/verified', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const profiles = await ProfileService.getVerifiedProfiles(limit);
    res.json(profiles);
  } catch (error) {
    logger.error('Error in GET /api/profile/verified:', error);
    res.status(500).json({ error: 'Failed to fetch verified profiles' });
  }
});

export default router;
