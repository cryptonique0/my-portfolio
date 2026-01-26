import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { CollectionsService } from '../services/collections.service';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const data = await CollectionsService.listCollections(userId);
  res.json({ success: true, data });
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { name, description, tags } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const collection = await CollectionsService.createCollection(userId, name, description, tags);
  res.json({ success: true, data: collection });
});

router.put('/:collectionId', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { collectionId } = req.params;
  const updates = req.body;
  const collection = await CollectionsService.updateCollection(collectionId, userId, updates);
  res.json({ success: true, data: collection });
});

router.delete('/:collectionId', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { collectionId } = req.params;
  await CollectionsService.deleteCollection(collectionId, userId);
  res.json({ success: true });
});

router.get('/:collectionId/items', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { collectionId } = req.params;
  const items = await CollectionsService.listItems(collectionId, userId);
  res.json({ success: true, data: items });
});

router.post('/:collectionId/items', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { collectionId } = req.params;
  const { nftId, nftName, nftImage, note, tags } = req.body;
  if (!nftId) return res.status(400).json({ error: 'nftId required' });
  const item = await CollectionsService.addItem(collectionId, userId, nftId, nftName, nftImage, note, tags);
  res.json({ success: true, data: item });
});

router.delete('/:collectionId/items/:nftId', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { collectionId, nftId } = req.params;
  await CollectionsService.removeItem(collectionId, userId, nftId);
  res.json({ success: true });
});

export default router;