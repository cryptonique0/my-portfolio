import { Router, Request, Response } from 'express';
import { requireAppJWT } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * Track analytics event
 * POST /api/analytics/events
 */
router.post('/events', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { eventName, eventData, sessionId, userId } = req.body;

    if (!eventName) {
      return res.status(400).json({ error: 'Event name required' });
    }

    // Store event in database
    const { data, error } = await supabaseAdmin.from('analytics_events').insert({
      event_name: eventName,
      event_data: eventData || {},
      session_id: sessionId,
      user_id: userId,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Analytics event tracking error:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get conversion funnel data
 * GET /api/analytics/funnel
 */
router.get('/funnel', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Mock funnel data - replace with actual DB query
    const funnelData = [
      { step: 'Browse', users: 5000, conversionRate: 100 },
      { step: 'View', users: 3500, conversionRate: 70 },
      { step: 'Offer', users: 1200, conversionRate: 34 },
      { step: 'Purchase', users: 420, conversionRate: 35 },
      { step: 'Repeat', users: 168, conversionRate: 40 }
    ];

    res.json({ success: true, data: funnelData });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get user flow data
 * GET /api/analytics/user-flow
 */
router.get('/user-flow', requireAppJWT, async (req: Request, res: Response) => {
  try {
    // Mock user flow data
    const userFlowData = [
      { source: 'Homepage', destination: 'Marketplace', count: 1200, bounceRate: 0.15 },
      { source: 'Marketplace', destination: 'NFT Detail', count: 850, bounceRate: 0.22 },
      { source: 'NFT Detail', destination: 'Make Offer', count: 320, bounceRate: 0.38 },
      { source: 'Make Offer', destination: 'Purchase', count: 240, bounceRate: 0.25 },
      { source: 'Marketplace', destination: 'Create NFT', count: 180, bounceRate: 0.45 },
      { source: 'Create NFT', destination: 'List NFT', count: 140, bounceRate: 0.22 }
    ];

    res.json({ success: true, data: userFlowData });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get user behavior analytics
 * GET /api/analytics/user-behavior
 */
router.get('/user-behavior', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { timeframe = 'week' } = req.query;

    // Mock user behavior data
    const behaviorData = [
      {
        userId: 'user_1',
        avgSessionDuration: 45,
        sessionsCount: 5,
        lastActive: Date.now(),
        deviceType: 'Desktop'
      },
      {
        userId: 'user_2',
        avgSessionDuration: 32,
        sessionsCount: 3,
        lastActive: Date.now() - 86400000,
        deviceType: 'Mobile'
      },
      {
        userId: 'user_3',
        avgSessionDuration: 58,
        sessionsCount: 8,
        lastActive: Date.now(),
        deviceType: 'Desktop'
      }
    ];

    res.json({ success: true, data: behaviorData });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get heatmap data
 * GET /api/analytics/heatmap
 */
router.get('/heatmap', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { page } = req.query;

    // Mock heatmap data
    const heatmapData = [
      { x: 150, y: 200, value: 45, element: 'Make Offer Button' },
      { x: 350, y: 150, value: 38, element: 'NFT Image' },
      { x: 500, y: 300, value: 52, element: 'Price Display' },
      { x: 200, y: 400, value: 28, element: 'Creator Info' },
      { x: 600, y: 200, value: 41, element: 'Share Button' }
    ];

    res.json({ success: true, data: heatmapData });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get specific event analytics
 * GET /api/analytics/events/:eventName
 */
router.get('/events/:eventName', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { eventName } = req.params;
    const { startDate, endDate } = req.query;

    // Mock event analytics
    const eventAnalytics = {
      eventName,
      totalCount: 1245,
      uniqueUsers: 892,
      conversionRate: 35.2,
      topProperties: {
        deviceType: { Desktop: 0.65, Mobile: 0.35 },
        source: { Direct: 0.45, Organic: 0.4, Referral: 0.15 }
      }
    };

    res.json({ success: true, data: eventAnalytics });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get dashboard summary
 * GET /api/analytics/summary
 */
router.get('/summary', requireAppJWT, async (req: Request, res: Response) => {
  try {
    // Mock dashboard summary
    const summary = {
      totalUsers: 12450,
      activeUsers: 4231,
      nftsCreated: 5234,
      totalOffers: 8921,
      completedTransactions: 1234,
      totalVolume: 125430,
      avgSessionDuration: 45,
      userRetention: 65,
      conversionRate: 8.5
    };

    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get retention cohorts
 * GET /api/analytics/retention
 */
router.get('/retention', requireAppJWT, async (req: Request, res: Response) => {
  try {
    // Mock retention cohorts
    const cohorts = [
      { cohort: 'Jan 1', day0: 100, day1: 85, day7: 65, day30: 45, day90: 28 },
      { cohort: 'Jan 2', day0: 120, day1: 102, day7: 78, day30: 52, day90: null },
      { cohort: 'Jan 3', day0: 95, day1: 81, day7: 62, day30: null, day90: null },
      { cohort: 'Jan 4', day0: 110, day1: 93, day7: 71, day30: null, day90: null },
      { cohort: 'Jan 5', day0: 105, day1: 89, day7: 68, day30: null, day90: null }
    ];

    res.json({ success: true, data: cohorts });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
