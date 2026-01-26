import { Router, Request, Response } from 'express';
import { requireAppJWT, requireRole } from '../middleware/auth';
import { RoyaltyPayoutsService } from '../services/royalty-payouts.service';
import rateLimit from 'express-rate-limit';

const router = Router();

const MIN_PAYOUT = 1;
const MAX_PAYOUT = 10000;

const payoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 payout requests per hour
  message: 'Too many payout requests. Please try again later.'
});

// List payouts for current user
router.get('/', requireAppJWT, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  try {
    const payouts = await RoyaltyPayoutsService.listPayouts(user.address);
    res.json({ success: true, data: payouts });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Request payout
router.post('/', requireAppJWT, payoutLimiter, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { amount, currency = 'STX', notes } = req.body;
  const amt = Number(amount);
  if (!amount || amt <= 0) return res.status(400).json({ error: 'Amount required' });
  if (amt < MIN_PAYOUT) return res.status(400).json({ error: `Minimum payout is ${MIN_PAYOUT} ${currency}` });
  if (amt > MAX_PAYOUT) return res.status(400).json({ error: `Maximum payout is ${MAX_PAYOUT} ${currency}` });
  try {
    const payout = await RoyaltyPayoutsService.requestPayout(user.address, amt, currency, notes);
    res.json({ success: true, data: payout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel payout (if pending)
router.post('/:payoutId/cancel', requireAppJWT, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { payoutId } = req.params;
  try {
    const updated = await RoyaltyPayoutsService.cancelPayout(String(payoutId), user.address);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Mark payout as processed
router.post('/:payoutId/process', requireAppJWT, requireRole(['admin']), async (req: Request, res: Response) => {
  const { payoutId } = req.params;
  const { txHash } = req.body;
  if (!txHash) return res.status(400).json({ error: 'Transaction hash required' });
  try {
    const updated = await RoyaltyPayoutsService.markProcessed(String(payoutId), String(txHash));
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;