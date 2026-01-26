import { Router, Request, Response } from 'express';
import {
  getCreatorProfile,
  getCreatorEarnings,
  getCreatorStats,
  updateCreatorProfile,
  getCreatorRankings
} from '../services/creators';

const router = Router();

/**
 * GET /api/creators/:address
 * Get creator profile
 */
router.get('/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address required'
      });
    }

    const profile = await getCreatorProfile(address);

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch creator profile'
    });
  }
});

/**
 * GET /api/creators/:address/earnings
 * Get creator earnings and statistics
 */
router.get('/:address/earnings', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address required'
      });
    }

    const earnings = await getCreatorEarnings(address);

    res.json({
      success: true,
      data: earnings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch creator earnings'
    });
  }
});

/**
 * GET /api/creators/:address/stats
 * Get complete creator statistics
 */
router.get('/:address/stats', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address required'
      });
    }

    const stats = await getCreatorStats(address);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch creator stats'
    });
  }
});

/**
 * GET /api/creators/rankings
 * Get creator rankings
 */
router.get('/rankings/:type', async (req: Request, res: Response) => {
  try {
    const { type = 'earnings' } = req.params;
    const { limit = 50 } = req.query;

    const validTypes = ['earnings', 'sales', 'followers'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ranking type. Must be: earnings, sales, or followers'
      });
    }

    const limitNum = Math.min(parseInt(limit as string) || 50, 100);

    const rankings = await getCreatorRankings(
      type as 'earnings' | 'sales' | 'followers',
      limitNum
    );

    res.json({
      success: true,
      data: rankings,
      type,
      limit: limitNum
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch creator rankings'
    });
  }
});

/**
 * PUT /api/creators/:address
 * Update creator profile (authenticated)
 */
router.put('/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { username, bio, website, twitter, instagram } = req.body;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address required'
      });
    }

    // In production, verify the user is authenticated and owns this address
    const updatedProfile = await updateCreatorProfile(address, {
      username,
      bio,
      website,
      twitter,
      instagram
    });

    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update creator profile'
    });
  }
});

export default router;
