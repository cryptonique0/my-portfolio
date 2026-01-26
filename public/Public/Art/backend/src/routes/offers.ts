import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { OffersService } from '../services/offers.service';

const router = Router();

// Create offer
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { nftId, amount, expiresAt, currency } = req.body;
  if (!nftId || !amount) return res.status(400).json({ error: 'nftId and amount required' });
  try {
    const offer = await OffersService.createOffer(String(nftId), user.address, Number(amount), expiresAt, currency);
    res.json({ success: true, data: offer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// List offers for NFT
router.get('/nft/:nftId', authenticateToken, async (req: Request, res: Response) => {
  const { nftId } = req.params;
  try {
    const offers = await OffersService.listNFTOffers(String(nftId));
    res.json({ success: true, data: offers });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Offer history (same as list for now)
router.get('/nft/:nftId/history', authenticateToken, async (req: Request, res: Response) => {
  const { nftId } = req.params;
  try {
    const offers = await OffersService.listNFTOffers(String(nftId));
    res.json({ success: true, data: offers });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// List offers for current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  try {
    const offers = await OffersService.listUserOffers(user.address);
    res.json({ success: true, data: offers });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Accept offer
router.post('/:offerId/accept', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { offerId } = req.params;
  try {
    const offer = await OffersService.acceptOffer(String(offerId), user.address);
    res.json({ success: true, data: offer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reject offer
router.post('/:offerId/reject', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { offerId } = req.params;
  try {
    const offer = await OffersService.rejectOffer(String(offerId), user.address);
    res.json({ success: true, data: offer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Counter-offer
router.post('/:offerId/counter', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { offerId } = req.params;
  const { amount, expiresAt } = req.body;
  if (!amount) return res.status(400).json({ error: 'amount required' });
  try {
    const newOffer = await OffersService.counterOffer(String(offerId), user.address, Number(amount), expiresAt);
    res.json({ success: true, data: newOffer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Expiration check
router.post('/expire-check', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const count = await OffersService.expireOpenOffers();
    res.json({ success: true, data: { expired: count } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;