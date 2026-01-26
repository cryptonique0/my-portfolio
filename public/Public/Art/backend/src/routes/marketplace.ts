import { Router, Request, Response } from 'express';

const router = Router();

// In-memory listings store (in production, use database)
const listings: Record<string, any> = {};
let listingIdCounter = 1;

/**
 * POST /api/marketplace/listings
 * Create a new marketplace listing
 */
router.post('/listings', (req: Request, res: Response) => {
  try {
    const { nftId, price, quantity = 1, duration = 2592000 } = req.body;

    // Validate inputs
    if (!nftId || !price) {
      return res.status(400).json({
        error: 'Missing required fields: nftId, price'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        error: 'Price must be greater than 0'
      });
    }

    const listingId = listingIdCounter++;
    const listing = {
      id: listingId,
      nftId,
      seller: req.headers['x-seller-address'] || 'unknown',
      price,
      quantity,
      listedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 1000).toISOString(),
      status: 'active'
    };

    listings[listingId.toString()] = listing;

    res.status(201).json({
      success: true,
      listing,
      message: 'Listing created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to create listing',
      message: error.message
    });
  }
});

/**
 * GET /api/marketplace/listings
 * Get all active marketplace listings
 */
router.get('/listings', (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, sortBy = 'price', order = 'asc', minPrice, maxPrice } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;

    let listingList = Object.values(listings).filter(l => l.status === 'active');

    // Filter by price range
    const min = minPrice ? parseFloat(minPrice as string) : 0;
    const max = maxPrice ? parseFloat(maxPrice as string) : Infinity;
    listingList = listingList.filter(l => l.price >= min && l.price <= max);

    // Sort
    if (sortBy === 'price') {
      listingList.sort((a, b) => order === 'asc' ? a.price - b.price : b.price - a.price);
    } else if (sortBy === 'date') {
      listingList.sort((a, b) => order === 'asc'
        ? new Date(a.listedAt).getTime() - new Date(b.listedAt).getTime()
        : new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
      );
    }

    // Paginate
    const start = (pageNum - 1) * limitNum;
    const paginatedListings = listingList.slice(start, start + limitNum);

    res.json({
      success: true,
      listings: paginatedListings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: listingList.length,
        pages: Math.ceil(listingList.length / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch listings',
      message: error.message
    });
  }
});

/**
 * GET /api/marketplace/listings/:id
 * Get single listing details
 */
router.get('/listings/:id', (req: Request, res: Response) => {
  try {
    const listing = listings[req.params.id];

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({
      success: true,
      listing
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch listing',
      message: error.message
    });
  }
});

/**
 * PUT /api/marketplace/listings/:id
 * Update listing price
 */
router.put('/listings/:id', (req: Request, res: Response) => {
  try {
    const listing = listings[req.params.id];

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const seller = req.headers['x-seller-address'];
    if (listing.seller !== seller) {
      return res.status(403).json({ error: 'Unauthorized to update this listing' });
    }

    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    listing.price = price;
    listing.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      listing,
      message: 'Listing updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to update listing',
      message: error.message
    });
  }
});

/**
 * DELETE /api/marketplace/listings/:id
 * Cancel listing
 */
router.delete('/listings/:id', (req: Request, res: Response) => {
  try {
    const listing = listings[req.params.id];

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const seller = req.headers['x-seller-address'];
    if (listing.seller !== seller) {
      return res.status(403).json({ error: 'Unauthorized to cancel this listing' });
    }

    listing.status = 'cancelled';
    listing.cancelledAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Listing cancelled successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to cancel listing',
      message: error.message
    });
  }
});

/**
 * POST /api/marketplace/buy
 * Purchase NFT from listing
 */
router.post('/buy', (req: Request, res: Response) => {
  try {
    const { listingId, quantity = 1 } = req.body;
    const buyer = req.headers['x-buyer-address'];

    if (!listingId) {
      return res.status(400).json({ error: 'Missing listingId' });
    }

    const listing = listings[listingId];

    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ error: 'Listing not found or inactive' });
    }

    if (quantity > listing.quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    const totalPrice = listing.price * quantity;
    const platformFee = Math.floor(totalPrice * 0.025); // 2.5%
    const sellerAmount = totalPrice - platformFee;

    // Update quantity
    listing.quantity -= quantity;
    if (listing.quantity === 0) {
      listing.status = 'sold';
    }

    const transaction = {
      id: `tx-${Date.now()}`,
      listingId,
      nftId: listing.nftId,
      buyer,
      seller: listing.seller,
      quantity,
      pricePerUnit: listing.price,
      totalPrice,
      platformFee,
      sellerAmount,
      timestamp: new Date().toISOString(),
      status: 'pending' // Would be 'confirmed' after blockchain confirmation
    };

    res.status(201).json({
      success: true,
      transaction,
      message: 'Purchase initiated. Awaiting blockchain confirmation.'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to process purchase',
      message: error.message
    });
  }
});

export default router;
