/**
 * Advanced Analytics API Routes
 * Endpoints for dashboard metrics, charts, and data export
 */

import { Router, Request, Response } from 'express';
import { AdvancedAnalyticsService } from '../services/advanced-analytics.service';
import { CSVExporter } from '../utils/csv-export';
import { logger } from '../utils/logger';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * @swagger
 * /api/advanced-analytics/dashboard:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get dashboard overview metrics
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVolume:
 *                   type: number
 *                 totalTransactions:
 *                   type: number
 *                 totalNFTsSold:
 *                   type: number
 *                 averagePrice:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const metrics = await AdvancedAnalyticsService.getDashboardMetrics(date as string);

    if (!metrics) {
      return res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

/**
 * @swagger
 * /api/advanced-analytics/market:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get market overview metrics
 *     responses:
 *       200:
 *         description: Market metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 volume24h:
 *                   type: number
 *                 transactions24h:
 *                   type: number
 *                 listedNFTs:
 *                   type: number
 *                 totalCollections:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get('/market', async (req: Request, res: Response) => {
  try {
    const metrics = await AdvancedAnalyticsService.getMarketMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching market metrics:', error);
    res.status(500).json({ error: 'Failed to fetch market metrics' });
  }
});

/**
 * @swagger
 * /api/advanced-analytics/volume:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get volume metrics for charts
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: weekly
 *     responses:
 *       200:
 *         description: Volume metrics
 */
router.get('/volume', async (req: Request, res: Response) => {
  try {
    const { timeRange = 'daily' } = req.query;
    const metrics = await AdvancedAnalyticsService.getVolumeMetrics(
      timeRange as 'hourly' | 'daily' | 'weekly'
    );

    res.json({
      timeRange,
      data: metrics,
      count: metrics.length,
    });
  } catch (error) {
    logger.error('Error fetching volume metrics:', error);
    res.status(500).json({ error: 'Failed to fetch volume metrics' });
  }
});

/**
 * GET /api/analytics/trending
 * Get trending collections and creators
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { period = 'daily' } = req.query;
    const trending = await AdvancedAnalyticsService.getTrendingMetrics(
      period as 'daily' | 'weekly' | 'monthly'
    );

    res.json({
      period,
      data: trending,
      count: trending.length,
    });
  } catch (error) {
    logger.error('Error fetching trending metrics:', error);
    res.status(500).json({ error: 'Failed to fetch trending metrics' });
  }
});

/**
 * GET /api/analytics/user/:userId
 * Get user activity metrics
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const activity = await AdvancedAnalyticsService.getUserActivity(userId);

    if (!activity) {
      return res.status(404).json({ error: 'User activity not found' });
    }

    res.json(activity);
  } catch (error) {
    logger.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

/**
 * GET /api/analytics/charts/:chartType
 * Get chart data with caching
 */
router.get('/charts/:chartType', async (req: Request, res: Response) => {
  try {
    const { chartType } = req.params;
    const { timeRange = 'weekly' } = req.query;

    const validCharts = ['volume', 'transactions', 'users', 'collections'];
    if (!validCharts.includes(chartType)) {
      return res.status(400).json({ error: 'Invalid chart type' });
    }

    const chartData = await AdvancedAnalyticsService.getChartData(
      chartType as any,
      timeRange as any
    );

    if (!chartData) {
      return res.status(500).json({ error: 'Failed to generate chart data' });
    }

    res.json(chartData);
  } catch (error) {
    logger.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

/**
 * GET /api/analytics/leaderboard/:type
 * Get leaderboard data
 */
router.get('/leaderboard/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { period = 'all-time', limit = '10' } = req.query;

    const validTypes = ['volume', 'creators', 'collectors', 'trending'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    const leaderboard = await AdvancedAnalyticsService.getLeaderboard(
      type as any,
      period as any,
      Number(limit)
    );

    res.json({
      type,
      period,
      data: leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/analytics/searches/popular
 * Get popular search queries
 */
router.get('/searches/popular', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const searches = await AdvancedAnalyticsService.getPopularSearches(Number(limit));

    res.json({
      data: searches,
      count: searches.length,
    });
  } catch (error) {
    logger.error('Error fetching popular searches:', error);
    res.status(500).json({ error: 'Failed to fetch popular searches' });
  }
});

/**
 * POST /api/analytics/track
 * Track analytics event
 */
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { eventType, userId, metadata } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'Event type required' });
    }

    await AdvancedAnalyticsService.trackEvent(eventType, userId, metadata);

    res.json({ success: true, message: 'Event tracked' });
  } catch (error) {
    logger.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

/**
 * GET /api/analytics/export/transactions
 * Export transactions as CSV
 */
router.get('/export/transactions', async (req: Request, res: Response) => {
  try {
    const { limit = '1000', offset = '0', startDate, endDate } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate as string);
    }
    if (endDate) {
      query = query.lte('created_at', endDate as string);
    }

    const { data, error } = await query.range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    const csv = CSVExporter.exportTransactionData(data || []);
    const filename = CSVExporter.generateFilename('transactions');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting transactions:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

/**
 * GET /api/analytics/export/nfts
 * Export NFTs as CSV
 */
router.get('/export/nfts', async (req: Request, res: Response) => {
  try {
    const { limit = '1000', offset = '0' } = req.query;

    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    const csv = CSVExporter.exportNFTData(data || []);
    const filename = CSVExporter.generateFilename('nfts');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting NFTs:', error);
    res.status(500).json({ error: 'Failed to export NFTs' });
  }
});

/**
 * GET /api/analytics/export/users
 * Export users as CSV
 */
router.get('/export/users', async (req: Request, res: Response) => {
  try {
    const { limit = '1000', offset = '0' } = req.query;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    const csv = CSVExporter.exportUserData(data || []);
    const filename = CSVExporter.generateFilename('users');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting users:', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
});

/**
 * GET /api/analytics/export/collections
 * Export collections as CSV
 */
router.get('/export/collections', async (req: Request, res: Response) => {
  try {
    const { limit = '1000', offset = '0' } = req.query;

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    const csv = CSVExporter.exportCollectionData(data || []);
    const filename = CSVExporter.generateFilename('collections');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting collections:', error);
    res.status(500).json({ error: 'Failed to export collections' });
  }
});

/**
 * GET /api/analytics/export/leaderboard/:type
 * Export leaderboard as CSV
 */
router.get('/export/leaderboard/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { period = 'all-time' } = req.query;

    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('leaderboard_type', type)
      .eq('period', period)
      .order('rank', { ascending: true });

    if (error) throw error;

    const csv = CSVExporter.exportLeaderboardData(data || []);
    const filename = CSVExporter.generateFilename(`leaderboard_${type}`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting leaderboard:', error);
    res.status(500).json({ error: 'Failed to export leaderboard' });
  }
});

/**
 * GET /api/analytics/export/roi
 * Export ROI tracking data as CSV
 */
router.get('/export/roi', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    let query = supabase.from('roi_tracking').select('*');

    if (userId) {
      query = query.eq('user_id', userId as string);
    }

    const { data, error } = await query.order('roi_percent', { ascending: false });

    if (error) throw error;

    const csv = CSVExporter.exportROIData(data || []);
    const filename = CSVExporter.generateFilename('roi_tracking');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting ROI data:', error);
    res.status(500).json({ error: 'Failed to export ROI data' });
  }
});

/**
 * GET /api/analytics/export/metrics
 * Export dashboard metrics as CSV
 */
router.get('/export/metrics', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('dashboard_metrics')
      .select('*')
      .order('metric_date', { ascending: false });

    if (startDate) {
      query = query.gte('metric_date', startDate as string);
    }
    if (endDate) {
      query = query.lte('metric_date', endDate as string);
    }

    const { data, error } = await query;

    if (error) throw error;

    const csv = CSVExporter.exportDashboardMetrics(data || []);
    const filename = CSVExporter.generateFilename('dashboard_metrics');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting metrics:', error);
    res.status(500).json({ error: 'Failed to export metrics' });
  }
});

export default router;
