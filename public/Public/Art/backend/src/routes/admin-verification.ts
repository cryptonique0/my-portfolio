import { Router, Request, Response } from 'express';
import { VerificationService } from '../services/verification.service';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Admin middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: Function) => {
  // @ts-ignore - user is added by authenticateToken middleware
  const user = req.user;
  
  // For now, check if user has admin role
  // You might want to add an is_admin column to users table
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

/**
 * GET /api/admin/verification/pending
 * Get all pending verification requests
 */
router.get('/verification/pending', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const requests = await VerificationService.getPendingVerificationRequests(limit);
    
    res.json(requests);
  } catch (error) {
    logger.error('Error fetching pending verification requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

/**
 * GET /api/admin/verification/stats
 * Get verification statistics
 */
router.get('/verification/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await VerificationService.getVerificationStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching verification stats:', error);
    res.status(500).json({ error: 'Failed to fetch verification stats' });
  }
});

/**
 * POST /api/admin/verification/:requestId/approve
 * Approve a verification request
 */
router.post('/verification/:requestId/approve', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const adminId = req.user.id;
    const { requestId } = req.params;
    const { notes } = req.body;
    
    const result = await VerificationService.approveVerificationRequest(requestId, adminId, notes);
    
    res.json({
      success: true,
      message: 'Verification request approved',
      data: result
    });
  } catch (error: any) {
    logger.error('Error approving verification request:', error);
    res.status(500).json({ error: error.message || 'Failed to approve verification request' });
  }
});

/**
 * POST /api/admin/verification/:requestId/reject
 * Reject a verification request
 */
router.post('/verification/:requestId/reject', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const adminId = req.user.id;
    const { requestId } = req.params;
    const { notes } = req.body;
    
    if (!notes || !notes.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const result = await VerificationService.rejectVerificationRequest(requestId, adminId, notes);
    
    res.json({
      success: true,
      message: 'Verification request rejected',
      data: result
    });
  } catch (error: any) {
    logger.error('Error rejecting verification request:', error);
    res.status(500).json({ error: error.message || 'Failed to reject verification request' });
  }
});

/**
 * POST /api/admin/verification/user/:userId/revoke
 * Revoke a user's verification
 */
router.post('/verification/user/:userId/revoke', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const adminId = req.user.id;
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Revocation reason is required' });
    }
    
    await VerificationService.revokeVerification(userId, adminId, reason);
    
    res.json({
      success: true,
      message: 'Verification revoked successfully'
    });
  } catch (error: any) {
    logger.error('Error revoking verification:', error);
    res.status(500).json({ error: error.message || 'Failed to revoke verification' });
  }
});

/**
 * POST /api/admin/verification/auto-verify
 * Auto-verify all eligible users
 */
router.post('/verification/auto-verify', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await VerificationService.autoVerifyEligibleUsers();
    
    res.json({
      success: true,
      message: `Successfully verified ${result.length} users`,
      users: result
    });
  } catch (error: any) {
    logger.error('Error auto-verifying users:', error);
    res.status(500).json({ error: error.message || 'Failed to auto-verify users' });
  }
});

export default router;
