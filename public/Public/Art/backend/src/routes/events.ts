/**
 * Event Routes
 * API endpoints for blockchain event subscriptions and history
 */

import { Router } from 'express';
import { eventListenerService } from '../services/event-listener.service';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/events/history:
 *   get:
 *     summary: Get blockchain event history
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: contractAddress
 *         schema:
 *           type: string
 *         description: Filter by contract address
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of events to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Event history retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { eventType, contractAddress, limit, offset } = req.query;

    const events = await eventListenerService.getEventHistory({
      eventType: eventType as string,
      contractAddress: contractAddress as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    logger.error('Failed to get event history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get event history',
    });
  }
});

/**
 * @swagger
 * /api/events/nft/{contractAddress}:
 *   post:
 *     summary: Start listening to NFT contract events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: NFT contract address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               abi:
 *                 type: array
 *                 description: Contract ABI
 *     responses:
 *       200:
 *         description: Listening started successfully
 *       500:
 *         description: Server error
 */
router.post('/nft/:contractAddress', authenticateToken, async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { abi } = req.body;

    if (!abi) {
      return res.status(400).json({
        success: false,
        error: 'Contract ABI is required',
      });
    }

    await eventListenerService.listenToNFTContract(contractAddress, abi);

    res.json({
      success: true,
      message: `Listening to NFT contract: ${contractAddress}`,
    });
  } catch (error) {
    logger.error('Failed to start NFT listener:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start NFT listener',
    });
  }
});

/**
 * @swagger
 * /api/events/marketplace/{contractAddress}:
 *   post:
 *     summary: Start listening to Marketplace contract events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Marketplace contract address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               abi:
 *                 type: array
 *                 description: Contract ABI
 *     responses:
 *       200:
 *         description: Listening started successfully
 *       500:
 *         description: Server error
 */
router.post('/marketplace/:contractAddress', authenticateToken, async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { abi } = req.body;

    if (!abi) {
      return res.status(400).json({
        success: false,
        error: 'Contract ABI is required',
      });
    }

    await eventListenerService.listenToMarketplaceContract(contractAddress, abi);

    res.json({
      success: true,
      message: `Listening to Marketplace contract: ${contractAddress}`,
    });
  } catch (error) {
    logger.error('Failed to start Marketplace listener:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Marketplace listener',
    });
  }
});

/**
 * @swagger
 * /api/events/auction/{contractAddress}:
 *   post:
 *     summary: Start listening to Auction contract events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction contract address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               abi:
 *                 type: array
 *                 description: Contract ABI
 *     responses:
 *       200:
 *         description: Listening started successfully
 *       500:
 *         description: Server error
 */
router.post('/auction/:contractAddress', authenticateToken, async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { abi } = req.body;

    if (!abi) {
      return res.status(400).json({
        success: false,
        error: 'Contract ABI is required',
      });
    }

    await eventListenerService.listenToAuctionContract(contractAddress, abi);

    res.json({
      success: true,
      message: `Listening to Auction contract: ${contractAddress}`,
    });
  } catch (error) {
    logger.error('Failed to start Auction listener:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Auction listener',
    });
  }
});

export default router;
