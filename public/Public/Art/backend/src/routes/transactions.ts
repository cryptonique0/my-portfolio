/**
 * Transaction API Routes
 * Endpoints for transaction history and management
 */

import { Router, Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/transactions
 * Get recent transactions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const transactions = await TransactionService.getRecentSales(Number(limit));
    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/:transactionId
 * Get transaction details
 */
router.get('/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transaction = await TransactionService.getTransactionDetails(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

/**
 * GET /api/transactions/user/:userId
 * Get user's transaction history
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const transactions = await TransactionService.getUserTransactionHistory(
      userId,
      Number(limit),
      Number(offset)
    );

    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/user/:userId/sales
 * Get user's sales
 */
router.get('/user/:userId/sales', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const sales = await TransactionService.getUserSales(
      userId,
      Number(limit),
      Number(offset)
    );

    res.json(sales);
  } catch (error) {
    logger.error('Error fetching user sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

/**
 * GET /api/transactions/user/:userId/purchases
 * Get user's purchases
 */
router.get('/user/:userId/purchases', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const purchases = await TransactionService.getUserPurchases(
      userId,
      Number(limit),
      Number(offset)
    );

    res.json(purchases);
  } catch (error) {
    logger.error('Error fetching user purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

/**
 * GET /api/transactions/nft/:nftId
 * Get NFT transaction history
 */
router.get('/nft/:nftId', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const transactions = await TransactionService.getNFTTransactionHistory(
      nftId,
      Number(limit),
      Number(offset)
    );

    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching NFT transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/stats/volume
 * Get platform volume stats
 */
router.get('/stats/volume', async (req: Request, res: Response) => {
  try {
    const volume = await TransactionService.getPlatformVolume();
    res.json({ volume });
  } catch (error) {
    logger.error('Error fetching volume stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/transactions/stats/user/:userId
 * Get user transaction volume
 */
router.get('/stats/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const volume = await TransactionService.getUserVolume(userId);
    res.json({ volume });
  } catch (error) {
    logger.error('Error fetching user volume:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * @swagger
 * /api/transactions/track:
 *   post:
 *     summary: Track a new blockchain transaction
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hash:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [mint, bid, buy, sell, list]
 *               relatedId:
 *                 type: string
 *               amount:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { hash, type, relatedId, amount } = req.body;
    const userId = (req as any).user?.id;

    if (!hash || !type) {
      return res.status(400).json({ error: 'Missing hash or type' });
    }

    // Import here to avoid circular dependency
    const { TransactionTrackerService } = await import('../services/transaction-tracker.service');
    const trackerService = new TransactionTrackerService();

    const transaction = await trackerService.createTransaction({
      hash,
      userId,
      type,
      relatedId,
      amount,
      status: 'pending',
    });

    // Start polling in background
    trackerService.watchTransaction(hash).catch((err) => {
      logger.error('Watch transaction error:', err);
    });

    res.status(201).json(transaction);
  } catch (error) {
    logger.error('Track transaction error:', error);
    res.status(500).json({ error: 'Failed to track transaction' });
  }
});

/**
 * @swagger
 * /api/transactions/:hash/status:
 *   get:
 *     summary: Get blockchain transaction status
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 */
router.get('/:hash/status', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;

    // Import here to avoid circular dependency
    const { TransactionTrackerService } = await import('../services/transaction-tracker.service');
    const trackerService = new TransactionTrackerService();

    const transaction = await trackerService.getTransaction(hash);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    logger.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

/**
 * @swagger
 * /api/transactions/user/:userId/blockchain:
 *   get:
 *     summary: Get user's blockchain transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: User blockchain transactions
 */
router.get('/user/:userId/blockchain', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Import here to avoid circular dependency
    const { TransactionTrackerService } = await import('../services/transaction-tracker.service');
    const trackerService = new TransactionTrackerService();

    const transactions = await trackerService.getUserTransactions(
      userId,
      Number(limit),
      Number(offset)
    );

    res.json(transactions);
  } catch (error) {
    logger.error('User transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * @swagger
 * /api/transactions/user/:userId/summary:
 *   get:
 *     summary: Get user blockchain transaction summary
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction summary
 */
router.get('/user/:userId/summary', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Import here to avoid circular dependency
    const { TransactionTrackerService } = await import('../services/transaction-tracker.service');
    const trackerService = new TransactionTrackerService();

    const summary = await trackerService.getTransactionSummary(userId);
    res.json(summary);
  } catch (error) {
    logger.error('Summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
