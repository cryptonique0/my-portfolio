import { Router, Request, Response } from 'express';
import {
  searchNFTs,
  getPopularCategories,
  getPriceStats,
  getTrendingNFTs,
  SearchFilters
} from '../services/search';

const router = Router();

/**
 * POST /api/search
 * Advanced NFT search with filters
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const filters: SearchFilters = {
      query: req.body.query,
      category: req.body.category,
      priceMin: req.body.priceMin ? parseFloat(req.body.priceMin) : undefined,
      priceMax: req.body.priceMax ? parseFloat(req.body.priceMax) : undefined,
      status: req.body.status,
      sortBy: req.body.sortBy,
      sortOrder: req.body.sortOrder,
      verified: req.body.verified === true,
      hasRoyalties: req.body.hasRoyalties === true
    };

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 20;

    // Validate page and limit
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Invalid pagination parameters'
      });
    }

    const results = await searchNFTs(
      filters,
      {
        field: (filters.sortBy as any) || 'popularity',
        order: (filters.sortOrder as any) || 'desc'
      },
      page,
      limit
    );

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Search NFTs error:', error);
    res.status(500).json({
      error: 'Failed to search NFTs',
      message: error.message
    });
  }
});

/**
 * GET /api/search/categories
 * Get popular categories with counts
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await getPopularCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to get categories',
      message: error.message
    });
  }
});

/**
 * GET /api/search/price-stats
 * Get price range statistics
 */
router.get('/price-stats', async (req: Request, res: Response) => {
  try {
    const stats = await getPriceStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get price stats error:', error);
    res.status(500).json({
      error: 'Failed to get price statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/search/trending
 * Get trending NFTs
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        error: 'Invalid limit parameter (1-50)'
      });
    }

    const nfts = await getTrendingNFTs(limit);

    res.json({
      success: true,
      data: nfts
    });
  } catch (error: any) {
    console.error('Get trending NFTs error:', error);
    res.status(500).json({
      error: 'Failed to get trending NFTs',
      message: error.message
    });
  }
});

export default router;
