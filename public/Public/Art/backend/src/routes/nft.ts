import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import ipfsService from '../services/ipfs';
import stacksApi from '../services/stacks';
import { 
  CreateNFTRequest, 
  CreateNFTResponse, 
  GetNFTsQuery,
  ErrorResponse 
} from '../types/api';

const router = Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// In-memory NFT store (in production, use database)
const nfts: Record<string, any> = {};
let nftIdCounter = 1;
const nftLikes: Record<string, Set<string>> = {};
const nftComments: Record<string, Array<{ id: string; author: string; text: string; createdAt: string }>> = {};

/**
 * GET /api/nfts/meta/categories
 * Get all available categories
 */
router.get('/meta/categories', (req: Request, res: Response) => {
  const categories = ['art', 'collectibles', 'sports', 'digital-items', 'music', 'video'];
  res.json({
    success: true,
    categories
  });
});

/**
 * POST /api/nfts
 * Create new NFT with metadata
 * Body: { name, description, imageFile, category, royaltyPercentage }
 */
router.post('/', upload.single('imageFile'), async (
  req: Request<{}, CreateNFTResponse | ErrorResponse, CreateNFTRequest>, 
  res: Response<CreateNFTResponse | ErrorResponse>
) => {
  try {
    const { name, description, category, royaltyPercentage } = req.body;
    const imageFile = req.file;

    // Validate inputs
    if (!name || !description || !imageFile) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, imageFile'
      });
    }

    const royaltyNum = Number(royaltyPercentage);
    if (isNaN(royaltyNum) || royaltyNum < 0 || royaltyNum > 25) {
      return res.status(400).json({
        error: 'Invalid royalty percentage. Must be between 0 and 25.'
      });
    }

    // Upload image to IPFS
    const imageHash = await ipfsService.uploadFile(imageFile.buffer, imageFile.originalname);
    const imageUri = ipfsService.getGatewayUrl(imageHash);

    // Calculate file hash for fraud detection
    const fileHash = await ipfsService.calculateFileHash(imageFile.buffer);

    // Create metadata
    const nftMetadata = {
      name,
      description,
      image: imageUri,
      imageHash: fileHash,
      category,
      royaltyPercentage: royaltyNum,
      creator: req.headers['x-creator-address'] as string || 'unknown',
      createdAt: new Date().toISOString()
    };

    // Upload metadata to IPFS
    const metadataHash = await ipfsService.uploadMetadata(nftMetadata);
    const metadataUri = ipfsService.getGatewayUrl(metadataHash);

    // Store in local database
    const nftId = nftIdCounter++;
    nfts[nftId.toString()] = {
      id: nftId,
      ...nftMetadata,
      metadataHash,
      metadataUri,
      owner: nftMetadata.creator
    };
    nftLikes[nftId.toString()] = new Set();
    nftComments[nftId.toString()] = [];

    res.status(201).json({
      success: true,
      nft: nfts[nftId.toString()],
      message: 'NFT created successfully. Ready to mint on blockchain.'
    });
  } catch (error: any) {
    console.error('Error creating NFT:', error);
    res.status(500).json({
      error: 'Failed to create NFT',
      message: error.message
    });
  }
});

/**
 * GET /api/nfts
 * List all NFTs with pagination and filters
 */
router.get('/', async (
  req: Request<{}, any, any, GetNFTsQuery>, 
  res: Response
) => {
  try {
    const { page = 1, limit = 20, category, sortBy = 'createdAt' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;

    let nftList = Object.values(nfts);

    // Filter by category
    if (category) {
      nftList = nftList.filter(nft => nft.category === category);
    }

    // Sort
    if (sortBy === 'createdAt') {
      nftList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'name') {
      nftList.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Paginate
    const start = (pageNum - 1) * limitNum;
    const paginatedNfts = nftList.slice(start, start + limitNum);

    res.json({
      success: true,
      nfts: paginatedNfts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: nftList.length,
        pages: Math.ceil(nftList.length / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch NFTs',
      message: error.message
    });
  }
});

/**
 * GET /api/nfts/:id/likes
 * Get like count and viewer state
 */
router.get('/:id/likes', (req: Request, res: Response) => {
  const { id } = req.params;
  const viewer = (req.query.viewer as string) || '';
  const likeSet = nftLikes[id] || new Set();

  res.json({
    success: true,
    likes: likeSet.size,
    liked: viewer ? likeSet.has(viewer) : false
  });
});

/**
 * POST /api/nfts/:id/like
 * Toggle like for an address
 */
router.post('/:id/like', (req: Request, res: Response) => {
  const { id } = req.params;
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  const likeSet = nftLikes[id] || new Set<string>();

  if (likeSet.has(address)) {
    likeSet.delete(address);
  } else {
    likeSet.add(address);
  }

  nftLikes[id] = likeSet;

  res.json({
    success: true,
    liked: likeSet.has(address),
    likes: likeSet.size
  });
});

/**
 * GET /api/nfts/:id/comments
 * List comments for an NFT
 */
router.get('/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const comments = nftComments[id] || [];

  res.json({
    success: true,
    comments
  });
});

/**
 * POST /api/nfts/:id/comments
 * Add a new comment
 */
router.post('/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).json({ error: 'Author and text are required' });
  }

  const comment = {
    id: `${id}_${Date.now()}`,
    author,
    text,
    createdAt: new Date().toISOString()
  };

  const comments = nftComments[id] || [];
  comments.unshift(comment);
  nftComments[id] = comments;

  res.status(201).json({
    success: true,
    comment
  });
});

/**
 * GET /api/nfts/:id
 * Get single NFT details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const nft = nfts[req.params.id];

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    res.json({
      success: true,
      nft
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch NFT',
      message: error.message
    });
  }
});

/**
 * GET /api/nfts/:id/history
 * Get transaction history for NFT
 */
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const nft = nfts[req.params.id];

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    // In production, fetch from blockchain or database
    const history = [
      {
        type: 'created',
        from: nft.creator,
        to: nft.creator,
        timestamp: nft.createdAt,
        txHash: 'mocked-tx-hash'
      }
    ];

    res.json({
      success: true,
      history
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch history',
      message: error.message
    });
  }
});

export default router;
