import { Router, Request, Response } from 'express';
import * as verificationService from '../services/verification';

const router = Router();

/**
 * GET /api/verification/:address
 * Get verification status for a creator
 */
router.get('/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const status = await verificationService.getVerificationStatus(address);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

/**
 * GET /api/verification/:address/requirements
 * Get verification requirements for a creator
 */
router.get('/:address/requirements', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const requirements = await verificationService.getVerificationRequirements(address);
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get verification requirements' });
  }
});

/**
 * POST /api/verification/submit
 * Submit verification request as creator
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const request = req.body;
    const eventId = await verificationService.submitVerificationRequest(request);
    res.status(201).json({ eventId, status: 'pending_review' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit verification request' });
  }
});

/**
 * GET /api/verification/pending
 * Get pending verification requests (admin only)
 */
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;

    const requests = await verificationService.getPendingVerifications(limit, page);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pending verifications' });
  }
});

/**
 * POST /api/verification/:address/approve
 * Approve verification request (admin only)
 */
router.post('/:address/approve', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { level } = req.body;

    if (!level) {
      return res.status(400).json({ error: 'Verification level is required' });
    }

    const result = await verificationService.approveVerification(address, level);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed to approve verification' });
  }
});

/**
 * POST /api/verification/:address/reject
 * Reject verification request (admin only)
 */
router.post('/:address/reject', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const result = await verificationService.rejectVerification(address, reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed to reject verification' });
  }
});

/**
 * GET /api/verification/badge/:type
 * Get badge details
 */
router.get('/badge/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const badge = await verificationService.getVerificationBadge(type);
    res.json(badge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get badge' });
  }
});

/**
 * GET /api/verification/verified-creators
 * Get list of verified creators
 */
router.get('/verified-creators', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const creators = await verificationService.getVerifiedCreators(limit);
    res.json(creators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get verified creators' });
  }
});

export default router;
