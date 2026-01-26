/**
 * Advanced Search Routes
 * Full-text search, filtering, trending, and collections
 */

import { Router, Request, Response } from 'express';
import { searchService } from '../services/search-advanced.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search NFTs with filters
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term (name or description)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by rarity (common, rare, epic, legendary)
 *       - in: query
 *         name: category
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, recent, trending, views]
 *         description: Sort results
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      query,
      minPrice,
      maxPrice,
      rarity,
      category,
      creator,
      owner,
      sortBy,
      limit,
      offset,
    } = req.query;

    // Record the search for analytics
    if (query && typeof query === 'string') {
      const userId = (req as any).user?.id;
      await searchService.recordSearch(query, userId);
    }

    const results = await searchService.searchNFTs({
      query: query as string,
      minPrice: minPrice ? parseInt(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
      rarity: rarity
        ? Array.isArray(rarity)
          ? rarity
          : [rarity as string]
        : undefined,
      category: category
        ? Array.isArray(category)
          ? category
          : [category as string]
        : undefined,
      creator: creator as string,
      owner: owner as string,
      sortBy: (sortBy as any) || 'recent',
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({
      success: true,
      data: results.results,
      total: results.total,
      query,
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
    });
  }
});

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of suggestions
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { query, limit } = req.query;

    if (!query || typeof query !== 'string') {
      return res.json({ suggestions: [] });
    }

    const suggestions = await searchService.getSearchSuggestions(
      query,
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    logger.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
    });
  }
});

/**
 * @swagger
 * /api/search/trending:
 *   get:
 *     summary: Get trending NFTs
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of trending NFTs
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const trending = await searchService.getTrendingNFTs(
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      data: trending,
    });
  } catch (error) {
    logger.error('Trending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending NFTs',
    });
  }
});

/**
 * @swagger
 * /api/search/hot-collections:
 *   get:
 *     summary: Get hot collections
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of hot collections
 */
router.get('/hot-collections', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const collections = await searchService.getHotCollections(
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      data: collections,
    });
  } catch (error) {
    logger.error('Hot collections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hot collections',
    });
  }
});

/**
 * @swagger
 * /api/search/recently-added:
 *   get:
 *     summary: Get recently added NFTs
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of recently added NFTs
 */
router.get('/recently-added', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const recent = await searchService.getRecentlyAdded(
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: recent,
    });
  } catch (error) {
    logger.error('Recently added error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recently added NFTs',
    });
  }
});

/**
 * @swagger
 * /api/search/filters:
 *   get:
 *     summary: Get available filter options
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: Available filters
 */
router.get('/filters', async (req: Request, res: Response) => {
  try {
    const filters = await searchService.getFilterOptions();

    res.json({
      success: true,
      data: filters,
    });
  } catch (error) {
    logger.error('Filters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get filters',
    });
  }
});

/**
 * @swagger
 * /api/search/popular:
 *   get:
 *     summary: Get popular search terms
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of popular searches
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const popular = await searchService.getPopularSearches(
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: popular,
    });
  } catch (error) {
    logger.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular searches',
    });
  }
});

export default router;
