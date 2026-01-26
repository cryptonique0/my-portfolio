/**
 * Auth Routes
 * - MetaMask wallet auth (nonce + verify)
 * - Supabase token auth proxy (me)
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { requireAppJWT, requireSupabaseAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/auth/nonce:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Generate nonce for wallet signature
 *     description: Request a nonce to sign with MetaMask for wallet authentication
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Wallet address (0x...)
 *         example: "0x1234567890123456789012345678901234567890"
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                 nonce:
 *                   type: string
 *                 message:
 *                   type: string
 *               example:
 *                 address: "0x1234567890123456789012345678901234567890"
 *                 nonce: "abc123def456"
 *                 message: "Sign in to BitArt Market\n\nNonce: abc123def456"
 *       400:
 *         description: Missing wallet address
 *       500:
 *         description: Server error
 */
router.get('/nonce', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const nonce = await AuthService.getOrCreateNonce(address);
    if (!nonce) return res.status(500).json({ error: 'Failed to generate nonce' });

    res.json({ address, ...nonce, message: `Sign in to BitArt Market\n\nNonce: ${nonce.nonce}` });
  } catch (error) {
    logger.error('Error generating nonce:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify wallet signature and issue JWT
 *     description: Submit signed message to get app JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - signature
 *             properties:
 *               address:
 *                 type: string
 *                 description: Wallet address
 *               signature:
 *                 type: string
 *                 description: Signed message from MetaMask
 *           example:
 *             address: "0x1234567890123456789012345678901234567890"
 *             signature: "0x7f7c6b5a..."
 *     responses:
 *       200:
 *         description: Signature verified, JWT issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *                 userId:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Missing address or signature
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Server error
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature required' });
    }

    const result = await AuthService.verifySignatureAndIssueToken(address, signature);
    if (!result) return res.status(401).json({ error: 'Invalid signature' });

    res.json({ token: result.token, userId: result.userId });
  } catch (error) {
    logger.error('Error verifying signature:', error);
    res.status(500).json({ error: 'Failed to verify signature' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user (App JWT)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/me', requireAppJWT, async (req: Request, res: Response) => {
  try {
    res.json({ user: req.authUser });
  } catch (error) {
    logger.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

/**
 * @swagger
 * /api/auth/me/supabase:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user (Supabase JWT)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile from Supabase
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/me/supabase', requireSupabaseAuth, async (req: Request, res: Response) => {
  try {
    res.json({ user: req.authUser });
  } catch (error) {
    logger.error('Error fetching supabase user:', error);
    res.status(500).json({ error: 'Failed to fetch supabase user' });
  }
});

export default router;
