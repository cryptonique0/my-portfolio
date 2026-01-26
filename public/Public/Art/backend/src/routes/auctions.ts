/**
 * Auction API Routes
 * Endpoints for auction operations
 */

import { Router, Request, Response } from 'express';
import { AuctionService } from '../services/auction.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/auctions
 * Get active auctions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const auctions = await AuctionService.getActiveAuctions(Number(limit), Number(offset));
    res.json(auctions);
  } catch (error) {
    logger.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

/**
 * GET /api/auctions/ending-soon
 * Get auctions ending soon
 */
router.get('/ending-soon', async (req: Request, res: Response) => {
  try {
    const { hoursUntilEnd = '24', limit = '10' } = req.query;

    const auctions = await AuctionService.getEndingSoonAuctions(
      Number(hoursUntilEnd),
      Number(limit)
    );
    res.json(auctions);
  } catch (error) {
    logger.error('Error fetching ending soon auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

/**
 * GET /api/auctions/:auctionId
 * Get auction details
 */
router.get('/:auctionId', async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;

    const auction = await AuctionService.getAuctionDetails(auctionId);

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.json(auction);
  } catch (error) {
    logger.error('Error fetching auction:', error);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

/**
 * GET /api/auctions/:auctionId/bids
 * Get auction bids
 */
router.get('/:auctionId/bids', async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    const { limit = '50' } = req.query;

    const bids = await AuctionService.getAuctionBids(auctionId, Number(limit));
    res.json(bids);
  } catch (error) {
    logger.error('Error fetching auction bids:', error);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

/**
 * POST /api/auctions
 * Create auction
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nftId, creatorId, startPrice, endDate } = req.body;

    if (!nftId || !creatorId || !startPrice || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const auction = await AuctionService.createAuction({
      nft_id: nftId,
      creator_id: creatorId,
      start_price: startPrice,
      current_price: startPrice,
      highest_bidder_id: null,
      status: 'active',
      end_date: new Date(endDate).toISOString(),
    });

    if (!auction) {
      return res.status(500).json({ error: 'Failed to create auction' });
    }

    res.status(201).json(auction);
  } catch (error) {
    logger.error('Error creating auction:', error);
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

/**
 * POST /api/auctions/:auctionId/bid
 * Place bid on auction
 */
router.post('/:auctionId/bid', async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    const { bidderId, amount } = req.body;

    if (!bidderId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Bidder ID and valid amount required' });
    }

    const bid = await AuctionService.placeBid(auctionId, bidderId, amount);

    if (!bid) {
      return res.status(400).json({ error: 'Failed to place bid' });
    }

    // Send notification to auction creator
    const auction = await AuctionService.getAuctionById(auctionId);
    const bidder = await UserService.getUserById(bidderId);

    if (auction && bidder) {
      await NotificationService.notifyAuctionBid(
        auction.creator_id,
        bidder.username || 'User',
        'NFT',
        amount
      );
    }

    res.status(201).json(bid);
  } catch (error) {
    logger.error('Error placing bid:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

/**
 * GET /api/auctions/user/:userId
 * Get user's auctions
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const auctions = await AuctionService.getUserAuctions(
      userId,
      Number(limit),
      Number(offset)
    );
    res.json(auctions);
  } catch (error) {
    logger.error('Error fetching user auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

/**
 * GET /api/auctions/user/:userId/bids
 * Get user's bids
 */
router.get('/user/:userId/bids', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const bids = await AuctionService.getUserBids(userId, Number(limit), Number(offset));
    res.json(bids);
  } catch (error) {
    logger.error('Error fetching user bids:', error);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

/**
 * POST /api/auctions/:auctionId/end
 * End auction
 */
router.post('/:auctionId/end', async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;

    const success = await AuctionService.endAuction(auctionId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to end auction' });
    }

    res.json({ message: 'Auction ended successfully' });
  } catch (error) {
    logger.error('Error ending auction:', error);
    res.status(500).json({ error: 'Failed to end auction' });
  }
});

/**
 * POST /api/auctions/:auctionId/cancel
 * Cancel auction
 */
router.post('/:auctionId/cancel', async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;

    const success = await AuctionService.cancelAuction(auctionId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to cancel auction' });
    }

    res.json({ message: 'Auction cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling auction:', error);
    res.status(500).json({ error: 'Failed to cancel auction' });
  }
});

export default router;
