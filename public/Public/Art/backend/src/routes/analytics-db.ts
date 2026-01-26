/**
 * Analytics API Routes
 * Endpoints for platform analytics and statistics
 */

import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/analytics/track
 * Track analytics event
 */
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { eventType, userId, nftId, metadata } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'Event type required' });
    }

    const event = await AnalyticsService.trackEvent(eventType, userId, nftId, metadata);

    res.json(event);
  } catch (error) {
    logger.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

/**
 * GET /api/analytics/stats
 * Get platform statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await AnalyticsService.getPlatformStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/analytics/nft/:nftId
 * Get NFT analytics
 */
router.get('/nft/:nftId', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;

    const analytics = await AnalyticsService.getNFTAnalytics(nftId);
    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching NFT analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/analytics/user/:userId
 * Get user activity
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50' } = req.query;

    const activity = await AnalyticsService.getUserActivity(userId, Number(limit));
    res.json(activity);
  } catch (error) {
    logger.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

/**
 * GET /api/analytics/trending
 * Get trending events
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { hours = '24', limit = '10' } = req.query;

    const trending = await AnalyticsService.getTrendingEvents(
      Number(hours),
      Number(limit)
    );
    res.json(trending);
  } catch (error) {
    logger.error('Error fetching trending events:', error);
    res.status(500).json({ error: 'Failed to fetch trending events' });
  }
});

/**
 * GET /api/analytics/searches
 * Get popular searches
 */
router.get('/searches', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const searches = await AnalyticsService.getPopularSearches(Number(limit));
    res.json(searches);
  } catch (error) {
    logger.error('Error fetching popular searches:', error);
    res.status(500).json({ error: 'Failed to fetch searches' });
  }
});

export default router;
