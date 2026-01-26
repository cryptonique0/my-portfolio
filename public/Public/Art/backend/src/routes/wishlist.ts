import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { WishlistService } from '../services/wishlist.service';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { limit = '100', offset = '0' } = req.query;
  const data = await WishlistService.getWishlist(userId, parseInt(limit as string), parseInt(offset as string));
  res.json({ success: true, data });
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { nftId, nftName, nftImage } = req.body;
  if (!nftId) return res.status(400).json({ error: 'nftId required' });
  const item = await WishlistService.addToWishlist(userId, nftId, nftName, nftImage);
  res.json({ success: true, data: item });
});

router.delete('/:nftId', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { nftId } = req.params;
  await WishlistService.removeFromWishlist(userId, nftId);
  res.json({ success: true });
});

router.get('/check/:nftId', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { nftId } = req.params;
  const isWishlisted = await WishlistService.isWishlisted(userId, nftId);
  res.json({ success: true, data: { isWishlisted } });
});

export default router;