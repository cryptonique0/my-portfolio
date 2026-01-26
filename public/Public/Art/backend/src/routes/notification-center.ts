/**
 * Notification Center Routes
 * API endpoints for notification management
 */

import express, { Router, Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { notificationPreferencesService } from '../services/notification-preferences.service';
import { logger } from '../utils/logger';

const router = Router();

// ============================================
// Notification Retrieval
// ============================================

/**
 * Get user notifications
 * GET /api/notifications?limit=50&offset=0
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await NotificationService.getUserNotifications(userId, limit, offset);
    const unreadCount = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        limit,
        offset,
      },
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

/**
 * Get unread notifications
 * GET /api/notifications/unread
 */
router.get('/unread', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const unreadNotifications = await NotificationService.getUnreadNotifications(userId);
    const unreadCount = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications: unreadNotifications,
        count: unreadCount,
      },
    });
  } catch (error) {
    logger.error('Error fetching unread notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch unread notifications' });
  }
});

/**
 * Get unread count
 * GET /api/notifications/count
 */
router.get('/count', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const count = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    logger.error('Error getting unread count:', error);
    res.status(500).json({ success: false, error: 'Failed to get unread count' });
  }
});

// ============================================
// Notification Management
// ============================================

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const success = await NotificationService.markAsRead(req.params.id);

    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to mark notification as read' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/mark-all-read
 */
router.put('/mark-all-read', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const success = await NotificationService.markAllAsRead(userId);

    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to mark all notifications as read' });
    }

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const success = await NotificationService.deleteNotification(req.params.id);

    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to delete notification' });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

// ============================================
// Notification Preferences
// ============================================

/**
 * Get notification preferences
 * GET /api/notifications/preferences
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const preferences = await notificationPreferencesService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error('Error fetching notification preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification preferences' });
  }
});

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const preferences = await notificationPreferencesService.updatePreferences(userId, req.body);

    if (!preferences) {
      return res.status(400).json({ success: false, error: 'Failed to update preferences' });
    }

    res.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated',
    });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification preferences' });
  }
});

/**
 * Get notification summary
 * GET /api/notifications/preferences/summary
 */
router.get('/preferences/summary', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const summary = await notificationPreferencesService.getNotificationSummary(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Error fetching notification summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification summary' });
  }
});

/**
 * Unsubscribe from all notifications
 * POST /api/notifications/unsubscribe
 */
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const success = await notificationPreferencesService.unsubscribeAll(userId);

    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to unsubscribe' });
    }

    res.json({
      success: true,
      message: 'Unsubscribed from all notifications',
    });
  } catch (error) {
    logger.error('Error unsubscribing user:', error);
    res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
  }
});

/**
 * Resubscribe to notifications
 * POST /api/notifications/resubscribe
 */
router.post('/resubscribe', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const success = await notificationPreferencesService.resubscribe(userId);

    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to resubscribe' });
    }

    res.json({
      success: true,
      message: 'Resubscribed to notifications',
    });
  } catch (error) {
    logger.error('Error resubscribing user:', error);
    res.status(500).json({ success: false, error: 'Failed to resubscribe' });
  }
});

// ============================================
// Notification Categories/History
// ============================================

/**
 * Get notification history by type
 * GET /api/notifications/history/:type
 */
router.get('/history/:type', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const type = req.params.type;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    // This would typically query filtered notifications
    const notifications = await NotificationService.getUserNotifications(userId, limit, offset);
    const filtered = notifications.filter(n => n.type === type);

    res.json({
      success: true,
      data: {
        notifications: filtered,
        type,
        limit,
        offset,
      },
    });
  } catch (error) {
    logger.error('Error fetching notification history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification history' });
  }
});

export default router;
