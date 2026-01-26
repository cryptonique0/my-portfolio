import { Router, Request, Response } from 'express';
import * as activityService from '../services/activity';

const router = Router();

/**
 * GET /api/activity/feed
 * Get global activity feed
 */
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const type = req.query.type ? (req.query.type as string).split(',') as any[] : undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const creatorAddress = req.query.creatorAddress as string | undefined;
    const nftId = req.query.nftId as string | undefined;

    const feed = await activityService.getActivityFeed({
      type,
      creatorAddress,
      nftId,
      limit,
      page
    });

    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activity feed' });
  }
});

/**
 * GET /api/activity/creator/:address
 * Get activity for a specific creator
 */
router.get('/creator/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const activity = await activityService.getCreatorActivity(address, limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get creator activity' });
  }
});

/**
 * GET /api/activity/nft/:nftId/:contractAddress
 * Get activity for a specific NFT
 */
router.get('/nft/:nftId/:contractAddress', async (req: Request, res: Response) => {
  try {
    const { nftId, contractAddress } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const activity = await activityService.getNFTActivity(nftId, contractAddress, limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get NFT activity' });
  }
});

/**
 * GET /api/activity/sales
 * Get recent sales activity
 */
router.get('/sales', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const sales = await activityService.getRecentSales(limit);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recent sales' });
  }
});

/**
 * GET /api/activity/mints
 * Get recent mints activity
 */
router.get('/mints', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const mints = await activityService.getRecentMints(limit);
    res.json(mints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recent mints' });
  }
});

/**
 * GET /api/activity/trending
 * Get trending NFTs by activity
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const trending = await activityService.getTrendingByActivity(limit);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trending' });
  }
});

/**
 * GET /api/activity/stats
 * Get activity statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await activityService.getActivityStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activity stats' });
  }
});

/**
 * POST /api/activity/track
 * Track a new activity event
 */
router.post('/track', async (req: Request, res: Response) => {
  try {
    const event = req.body;

    if (!event.type || !event.actor) {
      return res.status(400).json({ error: 'Activity type and actor are required' });
    }

    const eventId = await activityService.trackActivity(event);
    res.status(201).json({ eventId });
  } catch (error) {
    res.status(400).json({ error: 'Failed to track activity' });
  }
});

export default router;
