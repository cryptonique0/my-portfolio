import { Router, Request, Response } from 'express';
import { requireAppJWT, requireRole } from '../middleware/auth';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept CSV, JSON, images
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/json' ||
      file.mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: CSV, JSON, images'));
    }
  }
});

/**
 * Parse CSV buffer to array of objects
 */
async function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = Readable.from(buffer.toString());
    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

/**
 * Bulk NFT upload (CSV or JSON)
 * Expected CSV columns: name, description, image_url, price, royalty_percentage
 */
router.post('/upload', requireAppJWT, requireRole(['admin', 'creator']), upload.single('file'), async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.authUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    let nftsData: any[] = [];

    if (file.mimetype === 'text/csv') {
      nftsData = await parseCSV(file.buffer);
    } else if (file.mimetype === 'application/json') {
      nftsData = JSON.parse(file.buffer.toString());
    } else {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    if (!Array.isArray(nftsData) || nftsData.length === 0) {
      return res.status(400).json({ error: 'No NFT data found in file' });
    }

    // Validate and insert NFTs
    const results = { success: 0, failed: 0, errors: [] as any[] };
    for (const nft of nftsData) {
      if (!nft.name || !nft.image_url) {
        results.failed++;
        results.errors.push({ nft, reason: 'Missing required fields (name, image_url)' });
        continue;
      }

      const { error } = await supabaseAdmin.from('nfts').insert({
        name: nft.name,
        description: nft.description || '',
        image_url: nft.image_url,
        owner_id: user.id,
        creator_id: user.id,
        price: nft.price ? Number(nft.price) : null,
        royalty_percentage: nft.royalty_percentage ? Number(nft.royalty_percentage) : 0,
        is_listed: !!nft.price,
        status: 'active'
      });

      if (error) {
        results.failed++;
        results.errors.push({ nft, reason: error.message });
      } else {
        results.success++;
      }
    }

    res.json({ 
      success: true, 
      total: nftsData.length,
      succeeded: results.success,
      failed: results.failed,
      errors: results.errors
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Batch price changes
 * Body: { nfts: [{ nftId, newPrice }] }
 */
router.post('/price-update', requireAppJWT, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.authUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { nfts } = req.body;

  if (!Array.isArray(nfts) || nfts.length === 0) {
    return res.status(400).json({ error: 'NFTs array required' });
  }

  try {
    const results = { success: 0, failed: 0, errors: [] as any[] };

    for (const item of nfts) {
      const { nftId, newPrice } = item;
      if (!nftId || newPrice === undefined) {
        results.failed++;
        results.errors.push({ item, reason: 'Missing nftId or newPrice' });
        continue;
      }

      // Verify ownership
      const { data: nft, error: fetchError } = await supabaseAdmin
        .from('nfts')
        .select('id, owner_id')
        .eq('id', nftId)
        .single();

      if (fetchError || !nft || nft.owner_id !== user.id) {
        results.failed++;
        results.errors.push({ item, reason: 'NFT not found or unauthorized' });
        continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from('nfts')
        .update({ 
          price: Number(newPrice),
          is_listed: Number(newPrice) > 0
        })
        .eq('id', nftId);

      if (updateError) {
        results.failed++;
        results.errors.push({ item, reason: updateError.message });
      } else {
        results.success++;
      }
    }

    res.json({ 
      success: true, 
      total: nfts.length,
      succeeded: results.success,
      failed: results.failed,
      errors: results.errors
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Mass transfers
 * Body: { transfers: [{ nftId, toAddress }] }
 */
router.post('/transfer', requireAppJWT, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.authUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { transfers } = req.body;

  if (!Array.isArray(transfers) || transfers.length === 0) {
    return res.status(400).json({ error: 'Transfers array required' });
  }

  try {
    const results = { success: 0, failed: 0, errors: [] as any[] };

    for (const item of transfers) {
      const { nftId, toAddress } = item;
      if (!nftId || !toAddress) {
        results.failed++;
        results.errors.push({ item, reason: 'Missing nftId or toAddress' });
        continue;
      }

      // Verify ownership
      const { data: nft, error: fetchError } = await supabaseAdmin
        .from('nfts')
        .select('id, owner_id')
        .eq('id', nftId)
        .single();

      if (fetchError || !nft || nft.owner_id !== user.id) {
        results.failed++;
        results.errors.push({ item, reason: 'NFT not found or unauthorized' });
        continue;
      }

      // Get recipient user ID
      const { data: recipient, error: recipientError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('wallet_address', toAddress)
        .single();

      if (recipientError || !recipient) {
        results.failed++;
        results.errors.push({ item, reason: 'Recipient not found' });
        continue;
      }

      // Transfer ownership
      const { error: transferError } = await supabaseAdmin
        .from('nfts')
        .update({ 
          owner_id: recipient.id,
          is_listed: false,
          price: null
        })
        .eq('id', nftId);

      if (transferError) {
        results.failed++;
        results.errors.push({ item, reason: transferError.message });
      } else {
        results.success++;

        // Create transaction record
        await supabaseAdmin.from('transactions').insert({
          nft_id: nftId,
          seller_id: user.id,
          buyer_id: recipient.id,
          transaction_type: 'transfer',
          status: 'completed'
        });
      }
    }

    res.json({ 
      success: true, 
      total: transfers.length,
      succeeded: results.success,
      failed: results.failed,
      errors: results.errors
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Bulk delisting
 * Body: { nftIds: [1, 2, 3] }
 */
router.post('/delist', requireAppJWT, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.authUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { nftIds } = req.body;

  if (!Array.isArray(nftIds) || nftIds.length === 0) {
    return res.status(400).json({ error: 'NFT IDs array required' });
  }

  try {
    // Verify ownership and delist
    const { data: owned, error: fetchError } = await supabaseAdmin
      .from('nfts')
      .select('id')
      .in('id', nftIds)
      .eq('owner_id', user.id);

    if (fetchError) throw fetchError;

    const ownedIds = (owned || []).map(n => n.id);
    
    if (ownedIds.length === 0) {
      return res.status(400).json({ error: 'No owned NFTs found' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('nfts')
      .update({ 
        is_listed: false,
        price: null
      })
      .in('id', ownedIds);

    if (updateError) throw updateError;

    res.json({ 
      success: true, 
      delisted: ownedIds.length,
      total: nftIds.length,
      notOwned: nftIds.length - ownedIds.length
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
