/**
 * Notifications API Routes
 * Endpoints for user notifications
 */

import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/notifications/:userId
 * Get user notifications
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      userId,
      Number(limit),
      Number(offset)
    );

    res.json(notifications);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/:userId/unread
 * Get unread notifications
 */
router.get('/:userId/unread', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const notifications = await NotificationService.getUnreadNotifications(userId);
    const count = await NotificationService.getUnreadCount(userId);

    res.json({ notifications, count });
  } catch (error) {
    logger.error('Error fetching unread notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/:userId/count
 * Get unread notification count
 */
router.get('/:userId/count', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const count = await NotificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    logger.error('Error fetching notification count:', error);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

/**
 * PUT /api/notifications/:notificationId/read
 * Mark notification as read
 */
router.put('/:notificationId/read', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const success = await NotificationService.markAsRead(notificationId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to mark as read' });
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

/**
 * PUT /api/notifications/:userId/read-all
 * Mark all notifications as read
 */
router.put('/:userId/read-all', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const success = await NotificationService.markAllAsRead(userId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to mark all as read' });
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

/**
 * DELETE /api/notifications/:notificationId
 * Delete notification
 */
router.delete('/:notificationId', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const success = await NotificationService.deleteNotification(notificationId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delete notification' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
