import { Router, Request, Response } from 'express';
import * as followsService from '../services/follows';

const router = Router();

/**
 * POST /api/follows
 * Follow a creator
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { follower, following } = req.body;

    if (!follower || !following) {
      return res.status(400).json({ error: 'Follower and following addresses are required' });
    }

    const result = await followsService.followCreator(follower, following);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed to follow creator' });
  }
});

/**
 * DELETE /api/follows/:follower/:following
 * Unfollow a creator
 */
router.delete('/:follower/:following', async (req: Request, res: Response) => {
  try {
    const { follower, following } = req.params;

    const result = await followsService.unfollowCreator(follower, following);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed to unfollow creator' });
  }
});

/**
 * GET /api/follows/:follower/:following
 * Check if user is following a creator
 */
router.get('/:follower/:following', async (req: Request, res: Response) => {
  try {
    const { follower, following } = req.params;

    const isFollowing = await followsService.isFollowing(follower, following);
    res.json({ isFollowing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

/**
 * GET /api/follows/:address/followers
 * Get followers of a creator
 */
router.get('/:address/followers', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;

    const followers = await followsService.getFollowers(address, limit, page);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

/**
 * GET /api/follows/:address/following
 * Get creators that a user is following
 */
router.get('/:address/following', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;

    const following = await followsService.getFollowing(address, limit, page);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get following' });
  }
});

/**
 * GET /api/follows/:address/stats
 * Get follower statistics for a creator
 */
router.get('/:address/stats', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const stats = await followsService.getCreatorStats(address);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get creator stats' });
  }
});

/**
 * GET /api/follows/:address/count
 * Get follower count for a creator
 */
router.get('/:address/count', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const count = await followsService.getFollowerCount(address);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get follower count' });
  }
});

/**
 * GET /api/follows/top-creators
 * Get top creators by follower count
 */
router.get('/top-creators', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const creators = await followsService.getTopCreators(limit);
    res.json(creators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get top creators' });
  }
});

/**
 * GET /api/follows/:address/notifications
 * Get follow notifications for a creator
 */
router.get('/:address/notifications', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const notifications = await followsService.getFollowNotifications(address, limit);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

/**
 * GET /api/follows/:address1/:address2/mutual
 * Get mutual follows between two creators
 */
router.get('/:address1/:address2/mutual', async (req: Request, res: Response) => {
  try {
    const { address1, address2 } = req.params;

    const mutual = await followsService.getMutualFollows(address1, address2);
    res.json(mutual);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get mutual follows' });
  }
});

export default router;
