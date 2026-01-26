/**
 * User API Routes
 * Endpoints for user profile and management
 */

import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { FollowService } from '../services/follow.service';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/users/:userId
 * Get user profile by ID
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * GET /api/users/wallet/:walletAddress
 * Get user by wallet address
 */
router.get('/wallet/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const user = await UserService.getUserByWallet(walletAddress);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user by wallet:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * GET /api/users/search
 * Search users
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = '10' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const users = await UserService.searchUsers(String(q), Number(limit));
    res.json(users);
  } catch (error) {
    logger.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

/**
 * POST /api/users/profile
 * Create or update user profile
 */
router.post('/profile', async (req: Request, res: Response) => {
  try {
    const { walletAddress, username, email, bio, avatarUrl } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await UserService.upsertUser(walletAddress, {
      username,
      email,
      bio,
      avatar_url: avatarUrl,
    });

    if (!user) {
      return res.status(500).json({ error: 'Failed to create/update user' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error upserting user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

/**
 * PUT /api/users/:userId
 * Update user profile
 */
router.put('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { username, email, bio, avatarUrl } = req.body;

    const user = await UserService.updateUser(userId, {
      username,
      email,
      bio,
      avatar_url: avatarUrl,
    });

    if (!user) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * GET /api/users/:userId/followers
 * Get user's followers
 */
router.get('/:userId/followers', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const followers = await FollowService.getFollowers(
      userId,
      Number(limit),
      Number(offset)
    );

    const count = await FollowService.getFollowerCount(userId);

    res.json({ followers, count });
  } catch (error) {
    logger.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

/**
 * GET /api/users/:userId/following
 * Get users that user is following
 */
router.get('/:userId/following', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const following = await FollowService.getFollowing(
      userId,
      Number(limit),
      Number(offset)
    );

    const count = await FollowService.getFollowingCount(userId);

    res.json({ following, count });
  } catch (error) {
    logger.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

/**
 * POST /api/users/:userId/follow
 * Follow a user
 */
router.post('/:userId/follow', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({ error: 'Follower ID required' });
    }

    const follow = await FollowService.followUser(followerId, userId);

    if (!follow) {
      return res.status(500).json({ error: 'Failed to follow user' });
    }

    // Send notification
    const follower = await UserService.getUserById(followerId);
    if (follower) {
      await NotificationService.notifyFollow(userId, follower.username || 'User');
    }

    res.json(follow);
  } catch (error) {
    logger.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

/**
 * DELETE /api/users/:userId/follow/:followerId
 * Unfollow a user
 */
router.delete('/:userId/follow/:followerId', async (req: Request, res: Response) => {
  try {
    const { userId, followerId } = req.params;

    const success = await FollowService.unfollowUser(followerId, userId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to unfollow user' });
    }

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    logger.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

/**
 * GET /api/users/trending
 * Get trending creators
 */
router.get('/trending/creators', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const creators = await UserService.getTrendingCreators(Number(limit));
    res.json(creators);
  } catch (error) {
    logger.error('Error fetching trending creators:', error);
    res.status(500).json({ error: 'Failed to fetch trending creators' });
  }
});

export default router;
