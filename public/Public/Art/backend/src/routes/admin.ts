/**
 * Admin Routes
 * Protected endpoints for admin operations (requires admin role)
 */

import { Router, Request, Response } from 'express';
import { requireAppJWT, requireRole } from '../middleware/auth';
import { AdminService } from '../services/admin.service';
import { logger } from '../utils/logger';

const router = Router();

// Protect all admin routes with requireAppJWT and requireRole(['admin'])
router.use(requireAppJWT, requireRole(['admin']));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get admin dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 bannedUsers:
 *                   type: number
 *                 suspendedUsers:
 *                   type: number
 *                 moderationCases:
 *                   type: number
 *                 totalAdminActions:
 *                   type: number
 *               example:
 *                 totalUsers: 1250
 *                 bannedUsers: 15
 *                 suspendedUsers: 8
 *                 moderationCases: 23
 *                 totalAdminActions: 156
 *       401:
 *         description: Unauthorized (not admin)
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await AdminService.getAdminStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users with status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;
    const users = await AdminService.getAllUsers(Number(limit), Number(offset));
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:userId/status
 * Get user ban/suspension status
 */
router.get('/users/:userId/status', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const [bans, suspensions] = await Promise.all([
      AdminService.getUserBans(userId),
      AdminService.getUserSuspensions(userId),
    ]);
    res.json({ bans, suspensions, banned: bans.length > 0, suspended: suspensions.length > 0 });
  } catch (error) {
    logger.error('Error fetching user status:', error);
    res.status(500).json({ error: 'Failed to fetch user status' });
  }
});

/**
 * POST /api/admin/users/:userId/ban
 * Ban a user permanently
 */
router.post('/users/:userId/ban', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user?.id;

    if (!reason) {
      return res.status(400).json({ error: 'Reason required' });
    }

    const ban = await AdminService.banUser(userId, adminId, reason);
    res.status(201).json(ban);
  } catch (error) {
    logger.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

/**
 * POST /api/admin/users/:userId/suspend
 * Suspend a user temporarily
 */
router.post('/users/:userId/suspend', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason, durationDays } = req.body;
    const adminId = (req as any).user?.id;

    if (!reason || !durationDays) {
      return res.status(400).json({ error: 'Reason and duration required' });
    }

    const suspension = await AdminService.suspendUser(userId, adminId, reason, durationDays);
    res.status(201).json(suspension);
  } catch (error) {
    logger.error('Error suspending user:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

/**
 * POST /api/admin/users/:userId/unban
 * Unban a user
 */
router.post('/users/:userId/unban', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = (req as any).user?.id;

    const success = await AdminService.unbanUser(userId, adminId);
    if (!success) {
      return res.status(500).json({ error: 'Failed to unban user' });
    }
    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    logger.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

/**
 * GET /api/admin/moderation
 * Get pending moderation cases
 */
router.get('/moderation', async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;
    const cases = await AdminService.getPendingModerationCases(Number(limit));
    res.json(cases);
  } catch (error) {
    logger.error('Error fetching moderation cases:', error);
    res.status(500).json({ error: 'Failed to fetch moderation cases' });
  }
});

/**
 * POST /api/admin/moderation/:nftId
 * Moderate an NFT
 */
router.post('/moderation/:nftId', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const { reason, description, actionTaken } = req.body;
    const adminId = (req as any).user?.id;

    if (!reason) {
      return res.status(400).json({ error: 'Reason required' });
    }

    const modCase = await AdminService.moderateNFT(nftId, reason, description, adminId, actionTaken);
    res.status(201).json(modCase);
  } catch (error) {
    logger.error('Error moderating NFT:', error);
    res.status(500).json({ error: 'Failed to moderate NFT' });
  }
});

/**
 * PUT /api/admin/moderation/:caseId
 * Resolve a moderation case
 */
router.put('/moderation/:caseId', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const { status, actionTaken } = req.body;
    const adminId = (req as any).user?.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const resolved = await AdminService.resolveModerationCase(caseId, status, adminId, actionTaken);
    res.json(resolved);
  } catch (error) {
    logger.error('Error resolving moderation case:', error);
    res.status(500).json({ error: 'Failed to resolve case' });
  }
});

/**
 * GET /api/admin/transactions
 * Get transaction summary
 */
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { hours = '24' } = req.query;
    const summary = await AdminService.getTransactionSummary(Number(hours));
    res.json(summary);
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/admin/settings
 * Get system settings
 */
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await AdminService.getSettings();
    res.json(settings);
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/admin/settings/:key
 * Update a system setting
 */
router.put('/settings/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const adminId = (req as any).user?.id;

    if (!value) {
      return res.status(400).json({ error: 'Value required' });
    }

    const success = await AdminService.updateSetting(key, value, adminId);
    if (!success) {
      return res.status(500).json({ error: 'Failed to update setting' });
    }
    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    logger.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

/**
 * GET /api/admin/actions
 * Get admin action history
 */
router.get('/actions', async (req: Request, res: Response) => {
  try {
    const { limit = '100' } = req.query;
    const actions = await AdminService.getAdminActionHistory(Number(limit));
    res.json(actions);
  } catch (error) {
    logger.error('Error fetching action history:', error);
    res.status(500).json({ error: 'Failed to fetch action history' });
  }
});

export default router;
