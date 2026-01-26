import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PriceAlertsService } from '../services/price-alerts.service';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const data = await PriceAlertsService.listAlerts(userId);
  res.json({ success: true, data });
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { nftId, alertType, targetPrice, percentDrop } = req.body;
  if (!nftId || !alertType) return res.status(400).json({ error: 'nftId and alertType required' });
  const alert = await PriceAlertsService.createAlert(userId, nftId, { alertType, targetPrice, percentDrop });
  res.json({ success: true, data: alert });
});

router.delete('/:alertId', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { alertId } = req.params;
  await PriceAlertsService.deleteAlert(userId, alertId);
  res.json({ success: true });
});

router.post('/check', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const results = await PriceAlertsService.checkAlertsForUser(userId);
  res.json({ success: true, data: results });
});

export default router;
