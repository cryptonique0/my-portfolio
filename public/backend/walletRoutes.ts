import express, { Request, Response } from "express";
import { MultiWalletTrackingService } from "./multiWalletTrackingService";
import { ethers } from "ethers";

const router = express.Router();

// Initialize the service (would be injected in production)
let walletTrackingService: MultiWalletTrackingService;

/**
 * Initialize the wallet tracking service
 */
export function initializeWalletRoutes(service: MultiWalletTrackingService) {
  walletTrackingService = service;
  return router;
}

/**
 * POST /api/wallets/profile/create
 * Create a new wallet profile
 */
router.post("/profile/create", async (req: Request, res: Response) => {
  try {
    const { walletAddress, name } = req.body;

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const txHash = await walletTrackingService.createProfile(
      walletAddress,
      name
    );

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      transactionHash: txHash
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to create profile"
    });
  }
});

/**
 * GET /api/wallets/profile/:address
 * Get wallet profile information
 */
router.get("/profile/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const profile = await walletTrackingService.getWalletMetrics(address);

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch profile"
    });
  }
});

/**
 * POST /api/wallets/watchlist/add
 * Add wallet to user's watchlist
 */
router.post("/watchlist/add", async (req: Request, res: Response) => {
  try {
    const { userAddress, wallet } = req.body;

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: "Invalid user address" });
    }

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const txHash = await walletTrackingService.addToWatchlist(
      userAddress,
      wallet
    );

    res.status(200).json({
      success: true,
      message: "Wallet added to watchlist",
      transactionHash: txHash
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to add wallet to watchlist"
    });
  }
});

/**
 * POST /api/wallets/watchlist/remove
 * Remove wallet from user's watchlist
 */
router.post("/watchlist/remove", async (req: Request, res: Response) => {
  try {
    const { userAddress, wallet } = req.body;

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: "Invalid user address" });
    }

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const txHash = await walletTrackingService.removeFromWatchlist(
      userAddress,
      wallet
    );

    res.status(200).json({
      success: true,
      message: "Wallet removed from watchlist",
      transactionHash: txHash
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to remove wallet from watchlist"
    });
  }
});

/**
 * GET /api/wallets/watchlist/:userAddress
 * Get user's complete watchlist with metrics
 */
router.get("/watchlist/:userAddress", async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.params;

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: "Invalid user address" });
    }

    const watchlistMetrics = await walletTrackingService.getWatchlistMetrics(
      userAddress
    );

    res.status(200).json({
      success: true,
      data: watchlistMetrics
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch watchlist"
    });
  }
});

/**
 * POST /api/wallets/compare
 * Compare two wallets
 */
router.post("/compare", async (req: Request, res: Response) => {
  try {
    const { wallet1, wallet2 } = req.body;

    if (!ethers.isAddress(wallet1) || !ethers.isAddress(wallet2)) {
      return res
        .status(400)
        .json({ error: "Invalid wallet addresses" });
    }

    if (wallet1.toLowerCase() === wallet2.toLowerCase()) {
      return res
        .status(400)
        .json({ error: "Cannot compare wallet with itself" });
    }

    const comparison = await walletTrackingService.compareWallets(
      wallet1,
      wallet2
    );

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to compare wallets"
    });
  }
});

/**
 * GET /api/wallets/metrics/:address
 * Get wallet metrics
 */
router.get("/metrics/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const metrics = await walletTrackingService.getWalletMetrics(address);

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch metrics"
    });
  }
});

/**
 * GET /api/wallets/campaigns/:address
 * Get wallet's campaigns
 */
router.get("/campaigns/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const campaigns = await walletTrackingService.getWalletCampaigns(address);

    res.status(200).json({
      success: true,
      data: campaigns
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch campaigns"
    });
  }
});

/**
 * POST /api/wallets/batch-metrics
 * Get metrics for multiple wallets
 */
router.post("/batch-metrics", async (req: Request, res: Response) => {
  try {
    const { wallets } = req.body;

    if (!Array.isArray(wallets)) {
      return res.status(400).json({ error: "Wallets must be an array" });
    }

    for (const wallet of wallets) {
      if (!ethers.isAddress(wallet)) {
        return res
          .status(400)
          .json({ error: `Invalid wallet address: ${wallet}` });
      }
    }

    const metrics = await walletTrackingService.batchGetMetrics(wallets);

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch batch metrics"
    });
  }
});

/**
 * GET /api/wallets/history/:address
 * Get wallet portfolio history
 */
router.get("/history/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const history = await walletTrackingService.getPortfolioHistory(address);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch history"
    });
  }
});

/**
 * POST /api/wallets/snapshot/create
 * Create a portfolio snapshot
 */
router.post("/snapshot/create", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const txHash = await walletTrackingService.createPortfolioSnapshot(
      walletAddress
    );

    res.status(201).json({
      success: true,
      message: "Snapshot created successfully",
      transactionHash: txHash
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to create snapshot"
    });
  }
});

/**
 * GET /api/wallets/cache-status
 * Get current cache status
 */
router.get("/cache-status", async (req: Request, res: Response) => {
  try {
    const cacheStatus = walletTrackingService.getCacheStatus();

    res.status(200).json({
      success: true,
      data: cacheStatus
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch cache status"
    });
  }
});

/**
 * POST /api/wallets/cache/clear
 * Clear the cache
 */
router.post("/cache/clear", async (req: Request, res: Response) => {
  try {
    walletTrackingService.clearCache();

    res.status(200).json({
      success: true,
      message: "Cache cleared successfully"
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to clear cache"
    });
  }
});

/**
 * POST /api/wallets/auto-update/start
 * Start auto-update for watchlist
 */
router.post("/auto-update/start", async (req: Request, res: Response) => {
  try {
    const { userAddress, intervalSeconds = 300 } = req.body;

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: "Invalid user address" });
    }

    walletTrackingService.startAutoUpdate(userAddress, intervalSeconds);

    res.status(200).json({
      success: true,
      message: "Auto-update started"
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to start auto-update"
    });
  }
});

/**
 * POST /api/wallets/auto-update/stop
 * Stop auto-update for watchlist
 */
router.post("/auto-update/stop", async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.body;

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: "Invalid user address" });
    }

    walletTrackingService.stopAutoUpdate(userAddress);

    res.status(200).json({
      success: true,
      message: "Auto-update stopped"
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to stop auto-update"
    });
  }
});

/**
 * Error handling middleware
 */
router.use((err: any, req: Request, res: Response) => {
  console.error("Route error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

export default router;
