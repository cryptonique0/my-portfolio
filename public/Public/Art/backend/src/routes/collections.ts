/**
 * Collections API Routes
 * Endpoints for NFT collection operations
 */

import { Router, Request, Response } from 'express';
import { requireAppJWT, requireRole } from '../middleware/auth';
import { CollectionService } from '../services/collection.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/collections
 * Get all collections
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const collections = await CollectionService.getAllCollections(
      Number(limit),
      Number(offset)
    );

    res.json(collections);
  } catch (error) {
    logger.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

/**
 * GET /api/collections/trending
 * Get trending collections
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const collections = await CollectionService.getTrendingCollections(Number(limit));
    res.json(collections);
  } catch (error) {
    logger.error('Error fetching trending collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

/**
 * GET /api/collections/search
 * Search collections
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = '20' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const collections = await CollectionService.searchCollections(
      String(q),
      Number(limit)
    );

    res.json(collections);
  } catch (error) {
    logger.error('Error searching collections:', error);
    res.status(500).json({ error: 'Failed to search collections' });
  }
});

/**
 * GET /api/collections/:collectionId
 * Get collection details with items
 */
router.get('/:collectionId', async (req: Request, res: Response) => {
  try {
    const { collectionId } = req.params;

    const collection = await CollectionService.getCollectionWithItems(collectionId);

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    logger.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

/**
 * GET /api/collections/creator/:creatorId
 * Get creator's collections
 */
router.get('/creator/:creatorId', async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const collections = await CollectionService.getCreatorCollections(
      creatorId,
      Number(limit),
      Number(offset)
    );

    res.json(collections);
  } catch (error) {
    logger.error('Error fetching creator collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

/**
 * POST /api/collections
 * Create collection
 */
router.post('/', requireAppJWT, requireRole(['creator', 'admin']), async (req: Request, res: Response) => {
  try {
    const { creatorId, name, description, imageUrl, bannerUrl } = req.body;

    if (!creatorId || !name) {
      return res.status(400).json({ error: 'Creator ID and name required' });
    }

    const collection = await CollectionService.createCollection({
      creator_id: creatorId,
      name,
      description,
      image_url: imageUrl,
      banner_url: bannerUrl,
      floor_price: null,
      volume: 0,
      item_count: 0,
    });

    if (!collection) {
      return res.status(500).json({ error: 'Failed to create collection' });
    }

    res.status(201).json(collection);
  } catch (error) {
    logger.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

/**
 * PUT /api/collections/:collectionId
 * Update collection
 */
router.put('/:collectionId', requireAppJWT, requireRole(['creator', 'admin']), async (req: Request, res: Response) => {
  try {
    const { collectionId } = req.params;
    const { name, description, imageUrl, bannerUrl } = req.body;

    const collection = await CollectionService.updateCollection(collectionId, {
      name,
      description,
      image_url: imageUrl,
      banner_url: bannerUrl,
    });

    if (!collection) {
      return res.status(500).json({ error: 'Failed to update collection' });
    }

    res.json(collection);
  } catch (error) {
    logger.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

/**
 * POST /api/collections/:collectionId/refresh-stats
 * Refresh collection statistics
 */
router.post('/:collectionId/refresh-stats', requireAppJWT, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { collectionId } = req.params;

    const success = await CollectionService.updateCollectionStats(collectionId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to refresh stats' });
    }

    res.json({ message: 'Stats refreshed successfully' });
  } catch (error) {
    logger.error('Error refreshing collection stats:', error);
    res.status(500).json({ error: 'Failed to refresh stats' });
  }
});

export default router;
