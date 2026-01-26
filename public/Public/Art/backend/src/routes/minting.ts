import { Router, Request, Response } from 'express';
import { NFTMintingService } from '../services/minting.service';
import { logger } from '../utils/logger';

const router = Router();
const mintingService = new NFTMintingService();

/**
 * @swagger
 * /api/minting/prepare:
 *   post:
 *     summary: Prepare NFT metadata for minting
 *     tags: [Minting]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 *               contractAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Metadata prepared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadataIPFS:
 *                   type: string
 *                 nftRecordId:
 *                   type: string
 */
router.post('/prepare', async (req: Request, res: Response) => {
  try {
    const { metadata, contractAddress } = req.body;
    const userId = (req as any).user?.id;

    if (!metadata || !contractAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await mintingService.prepareMint(metadata, contractAddress);
    const nftRecord = await mintingService.createNFTRecord(
      userId,
      contractAddress,
      metadata.name,
      metadata.description,
      result.metadataIPFS
    );

    res.json({
      metadataIPFS: result.metadataIPFS,
      nftRecordId: nftRecord.id,
    });
  } catch (error) {
    logger.error('Mint prepare error:', error);
    res.status(500).json({ error: 'Failed to prepare mint' });
  }
});

/**
 * @swagger
 * /api/minting/confirm:
 *   post:
 *     summary: Confirm NFT minting after on-chain transaction
 *     tags: [Minting]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nftId:
 *                 type: string
 *               transactionHash:
 *                 type: string
 *               tokenId:
 *                 type: string
 *     responses:
 *       200:
 *         description: NFT minting confirmed
 */
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { nftId, transactionHash, tokenId } = req.body;

    if (!nftId || !transactionHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updated = await mintingService.updateNFTStatus(
      nftId,
      'minted',
      transactionHash,
      tokenId
    );

    res.json({
      success: true,
      nft: updated,
    });
  } catch (error) {
    logger.error('Mint confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm mint' });
  }
});

/**
 * @swagger
 * /api/minting/stats:
 *   get:
 *     summary: Get minting statistics
 *     tags: [Minting]
 *     responses:
 *       200:
 *         description: Minting statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 minted:
 *                   type: number
 *                 failed:
 *                   type: number
 *                 inProgress:
 *                   type: number
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await mintingService.getMintingStats();
    res.json(stats);
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * @swagger
 * /api/minting/user/:userId:
 *   get:
 *     summary: Get user's minting history
 *     tags: [Minting]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's NFT mints
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const mints = await mintingService.getUserMints(userId);
    res.json(mints);
  } catch (error) {
    logger.error('User mints error:', error);
    res.status(500).json({ error: 'Failed to fetch user mints' });
  }
});

/**
 * @swagger
 * /api/minting/estimate:
 *   post:
 *     summary: Estimate gas cost for minting
 *     tags: [Minting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractAddress:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Gas estimate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gasEstimate:
 *                   type: string
 *                 gasCost:
 *                   type: string
 */
router.post('/estimate', async (req: Request, res: Response) => {
  try {
    const { contractAddress } = req.body;

    const estimate = await mintingService.estimateMintGas(contractAddress);
    res.json(estimate);
  } catch (error) {
    logger.error('Gas estimate error:', error);
    res.status(500).json({ error: 'Failed to estimate gas' });
  }
});

export default router;
