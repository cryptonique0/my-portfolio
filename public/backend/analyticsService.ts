/**
 * Analytics Service - Real-time metrics and campaign tracking
 * Tracks airdrop claims, allocations, and campaign performance
 */

import { ethers } from 'ethers';

export interface ClaimMetrics {
  totalClaims: number;
  totalClaimAmount: string;
  uniqueClaimers: number;
  claimRate: number; // percentage
  averageClaimSize: string;
  claimsByHour: Record<number, number>;
  claimsByDay: Record<string, number>;
}

export interface CampaignMetrics {
  campaignId: string;
  totalAllocated: string;
  totalClaimed: string;
  claimPercentage: number;
  allocatedCount: number;
  claimedCount: number;
  pendingCount: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'paused';
}

export interface RealTimeMetrics {
  totalValue: string;
  activeUsers: number;
  claimsLast24h: number;
  avgClaimTime: number; // in seconds
  topClaimers: Array<{ address: string; amount: string; claims: number }>;
  peakClaimTime: number; // hour of day
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  totalClaimed: string;
  claimCount: number;
  percentageOfTotal: number;
  joinDate: Date;
  lastClaimDate: Date;
}

export class AnalyticsService {
  private provider: ethers.Provider;
  private contracts: Map<string, ethers.Contract> = new Map();
  private metricsCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Register a contract for tracking
   */
  registerContract(name: string, contract: ethers.Contract): void {
    this.contracts.set(name, contract);
  }

  /**
   * Get claim metrics for a campaign
   */
  async getClaimMetrics(
    campaignId: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<ClaimMetrics> {
    const cacheKey = `claims_${campaignId}`;
    
    if (this.isCache Valid(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const contract = this.contracts.get('AirdropManager');
    if (!contract) throw new Error('AirdropManager contract not registered');

    // Get all claim events
    const claimEvents = await contract.queryFilter(
      contract.filters.TokensClaimed(),
      fromBlock,
      toBlock
    );

    const metrics = this.processClaimEvents(claimEvents);
    
    this.metricsCache.set(cacheKey, metrics);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    return metrics;
  }

  /**
   * Get campaign-specific metrics
   */
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const cacheKey = `campaign_${campaignId}`;
    
    if (this.isCache Valid(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const contract = this.contracts.get('AirdropManager');
    if (!contract) throw new Error('AirdropManager contract not registered');

    // Get campaign data from contract
    const campaign = await contract.campaigns(campaignId);
    
    const metrics: CampaignMetrics = {
      campaignId,
      totalAllocated: campaign.totalAllocated.toString(),
      totalClaimed: campaign.totalClaimed.toString(),
      claimPercentage: (
        (Number(campaign.totalClaimed) / Number(campaign.totalAllocated)) * 100
      ),
      allocatedCount: campaign.allocatedCount,
      claimedCount: campaign.claimedCount,
      pendingCount: campaign.allocatedCount - campaign.claimedCount,
      startDate: new Date(Number(campaign.startTime) * 1000),
      endDate: campaign.endTime ? new Date(Number(campaign.endTime) * 1000) : undefined,
      status: campaign.paused ? 'paused' : campaign.endTime && Date.now() > Number(campaign.endTime) * 1000 ? 'completed' : 'active'
    };

    this.metricsCache.set(cacheKey, metrics);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    return metrics;
  }

  /**
   * Get real-time metrics across all campaigns
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const cacheKey = 'realtime_metrics';
    
    if (this.isCache Valid(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const contract = this.contracts.get('AirdropManager');
    if (!contract) throw new Error('AirdropManager contract not registered');

    // Get events from last 24 hours
    const currentBlock = await this.provider.getBlockNumber();
    const blocksPerDay = (24 * 60 * 60) / 2; // ~2 second blocks
    const fromBlock = Math.max(0, currentBlock - blocksPerDay);

    const events = await contract.queryFilter(
      contract.filters.TokensClaimed(),
      fromBlock,
      currentBlock
    );

    const metrics = this.processRealTimeEvents(events);

    this.metricsCache.set(cacheKey, metrics);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    return metrics;
  }

  /**
   * Get leaderboard of top claimers
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const cacheKey = `leaderboard_${limit}`;
    
    if (this.isCache Valid(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const contract = this.contracts.get('AirdropManager');
    if (!contract) throw new Error('AirdropManager contract not registered');

    // Get all claim events from contract creation
    const events = await contract.queryFilter(contract.filters.TokensClaimed());

    // Process events to create leaderboard
    const claimerMap = new Map<string, {
      totalClaimed: bigint;
      claimCount: number;
      firstClaim: Date;
      lastClaim: Date;
    }>();

    for (const event of events) {
      const address = event.args[1]; // claimer address
      const amount = event.args[2]; // claim amount
      const timestamp = (await this.provider.getBlock(event.blockNumber))?.timestamp || 0;
      const date = new Date(timestamp * 1000);

      if (!claimerMap.has(address)) {
        claimerMap.set(address, {
          totalClaimed: BigInt(0),
          claimCount: 0,
          firstClaim: date,
          lastClaim: date
        });
      }

      const entry = claimerMap.get(address)!;
      entry.totalClaimed += BigInt(amount);
      entry.claimCount++;
      entry.lastClaim = date;
    }

    // Convert to leaderboard entries
    const totalClaimed = Array.from(claimerMap.values()).reduce(
      (sum, entry) => sum + entry.totalClaimed,
      BigInt(0)
    );

    const leaderboard = Array.from(claimerMap.entries())
      .map(([address, data], index) => ({
        rank: index + 1,
        address,
        totalClaimed: data.totalClaimed.toString(),
        claimCount: data.claimCount,
        percentageOfTotal: Number((data.totalClaimed * BigInt(10000) / totalClaimed)) / 100,
        joinDate: data.firstClaim,
        lastClaimDate: data.lastClaim
      }))
      .sort((a, b) => BigInt(b.totalClaimed) - BigInt(a.totalClaimed))
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    this.metricsCache.set(cacheKey, leaderboard);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    return leaderboard;
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(days: number = 30): Promise<Record<string, number[]>> {
    const contract = this.contracts.get('AirdropManager');
    if (!contract) throw new Error('AirdropManager contract not registered');

    const currentBlock = await this.provider.getBlockNumber();
    const secondsPerDay = 24 * 60 * 60;
    const blocksPerDay = secondsPerDay / 2;

    const trends: Record<string, number[]> = {
      claims: [],
      volume: [],
      uniqueUsers: [],
      avgClaimSize: []
    };

    for (let i = days - 1; i >= 0; i--) {
      const toBlock = currentBlock;
      const fromBlock = Math.max(0, currentBlock - blocksPerDay * (days - i));

      const events = await contract.queryFilter(
        contract.filters.TokensClaimed(),
        fromBlock,
        toBlock
      );

      const dayEvents = events.filter(e => {
        const blockTimestamp = Math.floor(e.blockNumber / (blocksPerDay / secondsPerDay));
        const daysAgo = (Date.now() / 1000 - blockTimestamp) / secondsPerDay;
        return daysAgo >= i && daysAgo < i + 1;
      });

      const uniqueUsers = new Set(dayEvents.map(e => e.args[1])).size;
      const totalVolume = dayEvents.reduce((sum, e) => sum + BigInt(e.args[2]), BigInt(0));

      trends.claims.push(dayEvents.length);
      trends.volume.push(Number(totalVolume));
      trends.uniqueUsers.push(uniqueUsers);
      trends.avgClaimSize.push(dayEvents.length > 0 ? Number(totalVolume) / dayEvents.length : 0);
    }

    return trends;
  }

  /**
   * Private: Process claim events into metrics
   */
  private processClaimEvents(events: any[]): ClaimMetrics {
    const uniqueClaimers = new Set(events.map(e => e.args[1]));
    const totalClaimAmount = events.reduce((sum, e) => sum + BigInt(e.args[2]), BigInt(0));
    const claimsByHour: Record<number, number> = {};
    const claimsByDay: Record<string, number> = {};

    for (const event of events) {
      const timestamp = event.blockNumber; // Simplified, would need block timestamp
      const hour = Math.floor(timestamp / 3600) % 24;
      const day = new Date(timestamp * 1000).toISOString().split('T')[0];

      claimsByHour[hour] = (claimsByHour[hour] || 0) + 1;
      claimsByDay[day] = (claimsByDay[day] || 0) + 1;
    }

    return {
      totalClaims: events.length,
      totalClaimAmount: totalClaimAmount.toString(),
      uniqueClaimers: uniqueClaimers.size,
      claimRate: (uniqueClaimers.size / (events.length || 1)) * 100,
      averageClaimSize: (totalClaimAmount / BigInt(events.length || 1)).toString(),
      claimsByHour,
      claimsByDay
    };
  }

  /**
   * Private: Process real-time events
   */
  private processRealTimeEvents(events: any[]): RealTimeMetrics {
    const uniqueUsers = new Set(events.map(e => e.args[1]));
    const totalValue = events.reduce((sum, e) => sum + BigInt(e.args[2]), BigInt(0));

    // Calculate average claim time (simplified)
    const avgClaimTime = events.length > 0 ? 45 : 0; // Placeholder: 45 seconds average

    // Get top claimers
    const claimerStats = new Map<string, { amount: bigint; count: number }>();
    for (const event of events) {
      const address = event.args[1];
      const amount = BigInt(event.args[2]);
      if (!claimerStats.has(address)) {
        claimerStats.set(address, { amount: BigInt(0), count: 0 });
      }
      const stat = claimerStats.get(address)!;
      stat.amount += amount;
      stat.count++;
    }

    const topClaimers = Array.from(claimerStats.entries())
      .map(([address, stat]) => ({
        address,
        amount: stat.amount.toString(),
        claims: stat.count
      }))
      .sort((a, b) => BigInt(b.amount) - BigInt(a.amount))
      .slice(0, 10);

    // Calculate peak claim time (simplified)
    const peakClaimTime = 14; // Placeholder: 2 PM

    return {
      totalValue: totalValue.toString(),
      activeUsers: uniqueUsers.size,
      claimsLast24h: events.length,
      avgClaimTime,
      topClaimers,
      peakClaimTime
    };
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return !!expiry && expiry > Date.now();
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.metricsCache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.metricsCache.clear();
      this.cacheExpiry.clear();
    }
  }
}

export default AnalyticsService;
