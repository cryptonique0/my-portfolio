import { ethers, Contract } from "ethers";
import { EventEmitter } from "events";

/**
 * MultiWalletTrackingService
 * Monitors multiple wallets across chains and campaigns
 */

export interface WalletMetrics {
  address: string;
  name: string;
  totalAllocated: bigint;
  totalClaimed: bigint;
  totalPending: bigint;
  numCampaigns: number;
  numChains: number;
  lastUpdated: number;
  claimPercentage: number;
}

export interface CampaignAllocation {
  campaignId: number;
  token: string;
  allocated: bigint;
  claimed: bigint;
  pending: bigint;
  chainId: number;
  isClaimed: boolean;
}

export interface WalletSnapshot {
  timestamp: number;
  totalAllocated: bigint;
  totalClaimed: bigint;
  totalPending: bigint;
}

export interface PortfolioComparison {
  wallet1: string;
  wallet2: string;
  totalAllocatedDiff: bigint;
  totalClaimedDiff: bigint;
  claimRateDiff: number;
}

export class MultiWalletTrackingService extends EventEmitter {
  private trackerContract: Contract;
  private signer: ethers.Signer;
  private walletCache: Map<string, WalletMetrics> = new Map();
  private campaignCache: Map<string, CampaignAllocation[]> = new Map();
  private updateInterval: NodeJS.Timer | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    contractAddress: string,
    contractAbi: any,
    signer: ethers.Signer
  ) {
    super();
    this.trackerContract = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );
    this.signer = signer;
  }

  /**
   * Create wallet profile
   */
  async createProfile(walletAddress: string, name: string): Promise<string> {
    try {
      const tx = await this.trackerContract.createProfile(walletAddress, name);
      const receipt = await tx.wait();
      console.log(`Profile created for ${walletAddress}`);
      this.walletCache.delete(walletAddress);
      this.emit("profileCreated", { wallet: walletAddress, name });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Create profile error:", error);
      throw error;
    }
  }

  /**
   * Add wallet to watchlist
   */
  async addToWatchlist(walletAddress: string): Promise<string> {
    try {
      const tx = await this.trackerContract.addToWatchlist(walletAddress);
      const receipt = await tx.wait();
      console.log(`Added ${walletAddress} to watchlist`);
      this.emit("walletAdded", { wallet: walletAddress });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Add to watchlist error:", error);
      throw error;
    }
  }

  /**
   * Remove wallet from watchlist
   */
  async removeFromWatchlist(walletAddress: string): Promise<string> {
    try {
      const tx = await this.trackerContract.removeFromWatchlist(walletAddress);
      const receipt = await tx.wait();
      console.log(`Removed ${walletAddress} from watchlist`);
      this.walletCache.delete(walletAddress);
      this.campaignCache.delete(walletAddress);
      this.emit("walletRemoved", { wallet: walletAddress });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Remove from watchlist error:", error);
      throw error;
    }
  }

  /**
   * Get wallet metrics with caching
   */
  async getWalletMetrics(walletAddress: string): Promise<WalletMetrics> {
    // Check cache
    const cached = this.walletCache.get(walletAddress);
    if (cached && Date.now() - cached.lastUpdated < this.cacheTimeout) {
      return cached;
    }

    try {
      const portfolio =
        await this.trackerContract.getPortfolio(walletAddress);
      const profile = await this.trackerContract.getProfile(walletAddress);

      const claimPercentage =
        portfolio.totalAllocated > 0n
          ? Number((portfolio.totalClaimed * 100n) / portfolio.totalAllocated)
          : 0;

      const metrics: WalletMetrics = {
        address: walletAddress,
        name: profile.name || "Unnamed",
        totalAllocated: portfolio.totalAllocated,
        totalClaimed: portfolio.totalClaimed,
        totalPending: portfolio.totalPending,
        numCampaigns: portfolio.numCampaigns,
        numChains: portfolio.numChains,
        lastUpdated: Date.now(),
        claimPercentage
      };

      this.walletCache.set(walletAddress, metrics);
      return metrics;
    } catch (error) {
      console.error(`Get wallet metrics error for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get all campaigns for wallet
   */
  async getWalletCampaigns(
    walletAddress: string
  ): Promise<CampaignAllocation[]> {
    // Check cache
    const cached = this.campaignCache.get(walletAddress);
    if (cached) {
      return cached;
    }

    try {
      const campaigns =
        await this.trackerContract.getAllCampaigns(walletAddress);

      const campaignData: CampaignAllocation[] = campaigns.map(
        (campaign: any) => ({
          campaignId: Number(campaign.campaignId),
          token: campaign.token,
          allocated: campaign.allocatedAmount,
          claimed: campaign.claimedAmount,
          pending: campaign.pendingAmount,
          chainId: campaign.chainId,
          isClaimed: campaign.isClaimed
        })
      );

      this.campaignCache.set(walletAddress, campaignData);
      return campaignData;
    } catch (error) {
      console.error(`Get campaigns error for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get user's watchlist
   */
  async getWatchlist(userAddress: string): Promise<string[]> {
    try {
      return await this.trackerContract.getWatchlist(userAddress);
    } catch (error) {
      console.error("Get watchlist error:", error);
      throw error;
    }
  }

  /**
   * Get metrics for entire watchlist
   */
  async getWatchlistMetrics(userAddress: string): Promise<WalletMetrics[]> {
    try {
      const watchlist = await this.getWatchlist(userAddress);
      const metrics: WalletMetrics[] = [];

      for (const wallet of watchlist) {
        try {
          const walletMetrics = await this.getWalletMetrics(wallet);
          metrics.push(walletMetrics);
        } catch (error) {
          console.error(`Error getting metrics for ${wallet}:`, error);
        }
      }

      return metrics;
    } catch (error) {
      console.error("Get watchlist metrics error:", error);
      throw error;
    }
  }

  /**
   * Compare two wallets
   */
  async compareWallets(
    wallet1: string,
    wallet2: string
  ): Promise<PortfolioComparison> {
    try {
      const metrics1 = await this.getWalletMetrics(wallet1);
      const metrics2 = await this.getWalletMetrics(wallet2);

      return {
        wallet1,
        wallet2,
        totalAllocatedDiff: metrics1.totalAllocated - metrics2.totalAllocated,
        totalClaimedDiff: metrics1.totalClaimed - metrics2.totalClaimed,
        claimRateDiff: metrics1.claimPercentage - metrics2.claimPercentage
      };
    } catch (error) {
      console.error("Compare wallets error:", error);
      throw error;
    }
  }

  /**
   * Get portfolio history
   */
  async getPortfolioHistory(
    walletAddress: string
  ): Promise<WalletSnapshot[]> {
    try {
      const history =
        await this.trackerContract.getPortfolioHistory(walletAddress);

      return history.map((snapshot: any) => ({
        timestamp: Number(snapshot.timestamp),
        totalAllocated: snapshot.totalValue,
        totalClaimed: snapshot.claimedValue,
        totalPending: snapshot.pendingValue
      }));
    } catch (error) {
      console.error("Get portfolio history error:", error);
      throw error;
    }
  }

  /**
   * Create portfolio snapshot
   */
  async createSnapshot(walletAddress: string): Promise<string> {
    try {
      const tx = await this.trackerContract.createSnapshot(walletAddress);
      const receipt = await tx.wait();
      console.log(`Snapshot created for ${walletAddress}`);
      this.walletCache.delete(walletAddress);
      this.emit("snapshotCreated", { wallet: walletAddress });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Create snapshot error:", error);
      throw error;
    }
  }

  /**
   * Get chain allocations
   */
  async getChainAllocations(walletAddress: string): Promise<any[]> {
    try {
      return await this.trackerContract.getChainAllocations(walletAddress);
    } catch (error) {
      console.error("Get chain allocations error:", error);
      throw error;
    }
  }

  /**
   * Get all tracked wallets
   */
  async getAllTrackedWallets(): Promise<string[]> {
    try {
      return await this.trackerContract.getAllTrackedWallets();
    } catch (error) {
      console.error("Get all tracked wallets error:", error);
      throw error;
    }
  }

  /**
   * Get total tracked wallet count
   */
  async getTrackedWalletCount(): Promise<number> {
    try {
      const count = await this.trackerContract.getTrackedWalletCount();
      return Number(count);
    } catch (error) {
      console.error("Get tracked wallet count error:", error);
      throw error;
    }
  }

  /**
   * Batch get metrics for multiple wallets
   */
  async batchGetMetrics(wallets: string[]): Promise<WalletMetrics[]> {
    const metrics: WalletMetrics[] = [];
    const errors: { wallet: string; error: any }[] = [];

    for (const wallet of wallets) {
      try {
        const m = await this.getWalletMetrics(wallet);
        metrics.push(m);
      } catch (error) {
        errors.push({ wallet, error });
      }
    }

    if (errors.length > 0) {
      console.warn("Batch get metrics errors:", errors);
    }

    return metrics;
  }

  /**
   * Start auto-update for watchlist
   */
  startAutoUpdate(userAddress: string, intervalMs: number = 60000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        const metrics = await this.getWatchlistMetrics(userAddress);
        this.emit("metricsUpdated", metrics);
      } catch (error) {
        this.emit("updateError", error);
      }
    }, intervalMs);

    console.log(`Auto-update started for ${userAddress} every ${intervalMs}ms`);
  }

  /**
   * Stop auto-update
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("Auto-update stopped");
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.walletCache.clear();
    this.campaignCache.clear();
    console.log("Cache cleared");
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { wallets: number; campaigns: number } {
    return {
      wallets: this.walletCache.size,
      campaigns: this.campaignCache.size
    };
  }
}

export default MultiWalletTrackingService;
