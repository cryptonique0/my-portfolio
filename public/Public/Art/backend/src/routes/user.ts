import { Router, Request, Response } from 'express';

const router = Router();

// In-memory user profiles (in production, use database)
const users: Record<string, any> = {};
const userFavorites: Record<string, Set<number>> = {};

/**
 * GET /api/users/:address
 * Get user profile
 */
router.get('/:address', (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    let user = users[address];

    if (!user) {
      // Create default profile if doesn't exist
      user = {
        address,
        bio: '',
        avatar: '',
        banner: '',
        createdAt: new Date().toISOString(),
        stats: {
          nftsCreated: 0,
          nftsOwned: 0,
          totalSales: 0,
          followers: 0,
          following: 0
        },
        social: {
          twitter: '',
          instagram: '',
          website: ''
        },
        verified: false
      };
      users[address] = user;
    }

    res.json({
      success: true,
      user
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch user profile',
      message: error.message
    });
  }
});

/**
 * PUT /api/users/:address
 * Update user profile
 */
router.put('/:address', (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { bio, social } = req.body;

    let user = users[address] || {
      address,
      bio: '',
      avatar: '',
      banner: '',
      createdAt: new Date().toISOString(),
      stats: {
        nftsCreated: 0,
        nftsOwned: 0,
        totalSales: 0,
        followers: 0,
        following: 0
      },
      social: {}
    };

    if (bio) user.bio = bio;
    if (social) user.social = { ...user.social, ...social };
    user.updatedAt = new Date().toISOString();

    users[address] = user;

    res.json({
      success: true,
      user,
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

/**
 * GET /api/users/:address/nfts
 * Get user's owned NFTs
 */
router.get('/:address/nfts', (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // In production, fetch from database
    const userNfts: any[] = [
      // Mock data - would come from blockchain/database
    ];

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const start = (pageNum - 1) * limitNum;
    const paginatedNfts = userNfts.slice(start, start + limitNum);

    res.json({
      success: true,
      nfts: paginatedNfts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: userNfts.length,
        pages: Math.ceil(userNfts.length / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch user NFTs',
      message: error.message
    });
  }
});

/**
 * GET /api/users/:address/collections
 * Get user's created collections
 */
router.get('/:address/collections', (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    // In production, fetch from database
    const collections = [
      {
        id: 1,
        name: 'My First Collection',
        description: 'A collection of digital artworks',
        image: 'https://via.placeholder.com/300',
        nftCount: 5,
        floorPrice: 1,
        volume: 5,
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      collections
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch collections',
      message: error.message
    });
  }
});

/**
 * GET /api/users/:address/sales
 * Get user's sales activity
 */
router.get('/:address/sales', (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // In production, fetch from database
    const sales = [
      {
        id: 1,
        nftId: 1,
        buyer: '0xbuyer123...',
        price: 5,
        timestamp: new Date().toISOString(),
        txHash: 'mock-tx-hash'
      }
    ];

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const start = (pageNum - 1) * limitNum;
    const paginatedSales = sales.slice(start, start + limitNum);

    res.json({
      success: true,
      sales: paginatedSales,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: sales.length,
        pages: Math.ceil(sales.length / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch sales',
      message: error.message
    });
  }
});

/**
 * GET /api/users/:address/favorites
 * Get user's favorite NFTs
 */
router.get('/:address/favorites', (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const favorites = Array.from(userFavorites[address] || []);

    res.json({
      success: true,
      favorites
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch favorites',
      message: error.message
    });
  }
});

/**
 * POST /api/users/:address/favorites
 * Toggle a favorite NFT for a user
 */
router.post('/:address/favorites', (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { nftId } = req.body;

    if (!nftId) {
      return res.status(400).json({ error: 'nftId is required' });
    }

    const favorites = userFavorites[address] || new Set<number>();

    if (favorites.has(Number(nftId))) {
      favorites.delete(Number(nftId));
    } else {
      favorites.add(Number(nftId));
    }

    userFavorites[address] = favorites;

    res.json({
      success: true,
      favorited: favorites.has(Number(nftId)),
      favorites: Array.from(favorites)
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to update favorites',
      message: error.message
    });
  }
});

export default router;
