import { Router, Request, Response } from 'express';
import {
  getCreatorRoyalties,
  getRoyaltyHistory,
  getNFTRoyaltyStats,
  getTopRoyaltyNFTs,
  calculateRoyalties
} from '../services/royalties';

const router = Router();

/**
 * GET /api/royalties/creator/:address
 * Get creator royalty statistics
 */
router.get('/creator/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address required'
      });
    }

    const royalties = await getCreatorRoyalties(address);

    res.json({
      success: true,
      data: royalties
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch creator royalties'
    });
  }
});

/**
 * GET /api/royalties/creator/:address/history
 * Get royalty history for chart data
 */
router.get('/creator/:address/history', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { days = 30 } = req.query;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address required'
      });
    }

    const daysNum = Math.min(parseInt(days as string) || 30, 365);

    const history = await getRoyaltyHistory(address, daysNum);

    res.json({
      success: true,
      data: history,
      days: daysNum
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch royalty history'
    });
  }
});

/**
 * GET /api/royalties/nft/:nftId
 * Get royalty statistics for specific NFT
 */
router.get('/nft/:nftId', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const { contract } = req.query;

    const contractAddress = (contract as string) || process.env.NFT_CONTRACT_ADDRESS || '';

    const stats = await getNFTRoyaltyStats(nftId, contractAddress);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch NFT royalty stats'
    });
  }
});

/**
 * GET /api/royalties/top
 * Get top earning NFTs by royalties
 */
router.get('/top', async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);

    const nfts = await getTopRoyaltyNFTs(limitNum);

    res.json({
      success: true,
      data: nfts,
      limit: limitNum
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch top royalty NFTs'
    });
  }
});

/**
 * POST /api/royalties/calculate
 * Calculate estimated royalties
 */
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { salePrice, royaltyPercentage } = req.body;

    if (!salePrice || royaltyPercentage === undefined) {
      return res.status(400).json({
        success: false,
        error: 'salePrice and royaltyPercentage are required'
      });
    }

    if (royaltyPercentage < 0 || royaltyPercentage > 100) {
      return res.status(400).json({
        success: false,
        error: 'royaltyPercentage must be between 0 and 100'
      });
    }

    const royaltyAmount = calculateRoyalties(salePrice, royaltyPercentage);

    res.json({
      success: true,
      data: {
        salePrice,
        royaltyPercentage,
        royaltyAmount,
        sellerAmount: (parseFloat(salePrice as string) - parseFloat(royaltyAmount)).toFixed(4)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate royalties'
    });
  }
});

export default router;
