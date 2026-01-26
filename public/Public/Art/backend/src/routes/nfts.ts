/**
 * NFT API Routes
 * Endpoints for NFT operations
 */

import { Router, Request, Response } from 'express';
import { NFTService } from '../services/nft.service';
import { TransactionService } from '../services/transaction.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { AnalyticsService } from '../services/analytics.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/nfts
 * List NFTs with filters and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0', forSale = 'false' } = req.query;

    let nfts;
    if (forSale === 'true') {
      nfts = await NFTService.getNFTsForSale(Number(limit), Number(offset));
    } else {
      nfts = await NFTService.getNFTsForSale(Number(limit), Number(offset));
    }

    res.json(nfts);
  } catch (error) {
    logger.error('Error fetching NFTs:', error);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

/**
 * GET /api/nfts/search
 * Search NFTs
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = '20' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const nfts = await NFTService.searchNFTs(String(q), Number(limit));
    res.json(nfts);
  } catch (error) {
    logger.error('Error searching NFTs:', error);
    res.status(500).json({ error: 'Failed to search NFTs' });
  }
});

/**
 * GET /api/nfts/trending
 * Get trending NFTs
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const nfts = await NFTService.getTrendingNFTs(Number(limit));
    res.json(nfts);
  } catch (error) {
    logger.error('Error fetching trending NFTs:', error);
    res.status(500).json({ error: 'Failed to fetch trending NFTs' });
  }
});

/**
 * GET /api/nfts/:nftId
 * Get NFT details
 */
router.get('/:nftId', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;

    const nft = await NFTService.getNFTDetails(nftId);

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    // Track view
    await AnalyticsService.trackEvent('nft_viewed', undefined, nftId);

    res.json(nft);
  } catch (error) {
    logger.error('Error fetching NFT:', error);
    res.status(500).json({ error: 'Failed to fetch NFT' });
  }
});

/**
 * GET /api/nfts/owner/:ownerId
 * Get NFTs by owner
 */
router.get('/owner/:ownerId', async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const nfts = await NFTService.getNFTsByOwner(ownerId, Number(limit), Number(offset));
    res.json(nfts);
  } catch (error) {
    logger.error('Error fetching owner NFTs:', error);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

/**
 * GET /api/nfts/creator/:creatorId
 * Get NFTs by creator
 */
router.get('/creator/:creatorId', async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const nfts = await NFTService.getNFTsByCreator(creatorId, Number(limit), Number(offset));
    res.json(nfts);
  } catch (error) {
    logger.error('Error fetching creator NFTs:', error);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

/**
 * POST /api/nfts
 * Create NFT
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tokenId,
      blockchain,
      name,
      description,
      imageUrl,
      ownerId,
      creatorId,
      collectionId,
      royaltyPercentage,
    } = req.body;

    if (!tokenId || !name || !ownerId || !creatorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const nft = await NFTService.createNFT({
      token_id: tokenId,
      blockchain: blockchain || 'bitcoin',
      name,
      description,
      image_url: imageUrl,
      owner_id: ownerId,
      creator_id: creatorId,
      collection_id: collectionId,
      royalty_percentage: royaltyPercentage || 10,
      for_sale: false,
      price: null,
    });

    if (!nft) {
      return res.status(500).json({ error: 'Failed to create NFT' });
    }

    // Track event
    await AnalyticsService.trackEvent('nft_created', creatorId, nft.id);

    res.status(201).json(nft);
  } catch (error) {
    logger.error('Error creating NFT:', error);
    res.status(500).json({ error: 'Failed to create NFT' });
  }
});

/**
 * PUT /api/nfts/:nftId
 * Update NFT
 */
router.put('/:nftId', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const { name, description, imageUrl } = req.body;

    const nft = await NFTService.updateNFT(nftId, {
      name,
      description,
      image_url: imageUrl,
    });

    if (!nft) {
      return res.status(500).json({ error: 'Failed to update NFT' });
    }

    res.json(nft);
  } catch (error) {
    logger.error('Error updating NFT:', error);
    res.status(500).json({ error: 'Failed to update NFT' });
  }
});

/**
 * POST /api/nfts/:nftId/list
 * List NFT for sale
 */
router.post('/:nftId/list', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price required' });
    }

    const success = await NFTService.listNFT(nftId, price);

    if (!success) {
      return res.status(500).json({ error: 'Failed to list NFT' });
    }

    res.json({ message: 'NFT listed successfully' });
  } catch (error) {
    logger.error('Error listing NFT:', error);
    res.status(500).json({ error: 'Failed to list NFT' });
  }
});

/**
 * POST /api/nfts/:nftId/delist
 * Remove NFT from sale
 */
router.post('/:nftId/delist', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;

    const success = await NFTService.delistNFT(nftId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delist NFT' });
    }

    res.json({ message: 'NFT delisted successfully' });
  } catch (error) {
    logger.error('Error delisting NFT:', error);
    res.status(500).json({ error: 'Failed to delist NFT' });
  }
});

/**
 * POST /api/nfts/:nftId/purchase
 * Purchase NFT
 */
router.post('/:nftId/purchase', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const { buyerId, transactionHash } = req.body;

    if (!buyerId || !transactionHash) {
      return res.status(400).json({ error: 'Buyer ID and transaction hash required' });
    }

    // Get NFT details
    const nft = await NFTService.getNFTById(nftId);
    if (!nft || !nft.for_sale) {
      return res.status(400).json({ error: 'NFT not available for sale' });
    }

    // Create transaction record
    const transaction = await TransactionService.createTransaction({
      type: 'sale',
      nft_id: nftId,
      seller_id: nft.owner_id,
      buyer_id: buyerId,
      price: nft.price?.toString() || '0',
      transaction_hash: transactionHash,
      status: 'pending',
    });

    if (!transaction) {
      return res.status(500).json({ error: 'Failed to create transaction' });
    }

    // Transfer NFT ownership
    await NFTService.transferNFT(nftId, buyerId);

    // Update transaction status
    await TransactionService.updateTransactionStatus(transaction.id, 'completed');

    // Send notification to seller
    const seller = await UserService.getUserById(nft.owner_id);
    const buyer = await UserService.getUserById(buyerId);

    if (seller && buyer) {
      await NotificationService.notifyPurchase(
        nft.owner_id,
        buyer.username || 'User',
        nft.name
      );
    }

    // Track event
    await AnalyticsService.trackEvent('nft_purchased', buyerId, nftId, {
      price: nft.price,
      seller_id: nft.owner_id,
    });

    res.json(transaction);
  } catch (error) {
    logger.error('Error purchasing NFT:', error);
    res.status(500).json({ error: 'Failed to purchase NFT' });
  }
});

export default router;
