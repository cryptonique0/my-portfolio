/**
 * ROI Tracking Service
 * Measures campaign success and return on investment
 */

export interface CampaignROI {
  campaignId: string;
  campaignName: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'paused';
  
  // Investment metrics
  totalInvested: string; // Total tokens allocated
  totalSpent: string; // Total gas + setup costs in USD
  costPerUser: number; // Average cost per user
  
  // Claim metrics
  totalClaimed: string;
  claimedPercentage: number;
  uniqueClaimers: number;
  averageClaimPerUser: string;
  
  // ROI metrics
  roi: number; // percentage
  roiPerDay: number; // percentage per day
  paybackPeriod: number; // days
  
  // Performance metrics
  engagementRate: number; // percentage of allocated users who claimed
  successScore: number; // 0-100
  recommendations: string[];
}

export interface SegmentedROI {
  segment: string; // 'whale', 'mid-holder', 'small-holder', etc.
  userCount: number;
  totalAllocated: string;
  totalClaimed: string;
  claimRate: number;
  averageClaim: string;
  roi: number;
}

export interface CampaignComparison {
  campaigns: Array<{
    campaignId: string;
    name: string;
    roi: number;
    engagementRate: number;
    successScore: number;
    totalClaimed: string;
  }>;
  bestPerforming: string;
  averageROI: number;
  averageEngagement: number;
  insights: string[];
}

export interface SuccessMetrics {
  campaignId: string;
  
  // Conversion metrics
  conversionRate: number; // allocated -> claimed
  conversionFunnel: {
    allocated: number;
    claimed: number;
    rate: number;
  };
  
  // Time metrics
  averageClaimLatency: number; // hours from eligibility to claim
  claimingBehavior: 'fast' | 'medium' | 'slow'; // claim speed profile
  seasonality: Record<string, number>; // day-of-week patterns
  
  // Quality metrics
  claimingTrend: 'improving' | 'declining' | 'stable';
  volatility: number; // 0-100, lower is more stable
  momentum: number; // trend strength
  
  // Health indicators
  healthScore: number; // 0-100
  indicators: {
    positive: string[];
    negative: string[];
  };
}

export class ROITrackingService {
  /**
   * Calculate campaign ROI
   */
  calculateCampaignROI(
    campaignId: string,
    campaignName: string,
    startDate: Date,
    endDate: Date | undefined,
    totalAllocated: string,
    totalClaimed: string,
    uniqueClaimers: number,
    totalUsers: number,
    gasSpentUSD: number,
    tokenPriceUSD: number
  ): CampaignROI {
    const invested = BigInt(totalAllocated);
    const claimed = BigInt(totalClaimed);
    const unclaimedValue = invested - claimed;

    const claimedPercentage = (Number(claimed) / Number(invested)) * 100;
    const investedUSD = (Number(invested) / 1e18) * tokenPriceUSD;
    const claimedUSD = (Number(claimed) / 1e18) * tokenPriceUSD;

    // ROI Calculation
    const totalSpent = gasSpentUSD;
    const netProfit = claimedUSD - totalSpent;
    const roi = totalSpent > 0 ? (netProfit / totalSpent) * 100 : 0;

    // Cost per user
    const costPerUser = totalUsers > 0 ? totalSpent / totalUsers : 0;

    // Payback period
    const daysRunning = endDate 
      ? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      : (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const paybackPeriod = roi > 0 ? (100 * daysRunning) / roi : 0;

    // ROI per day
    const roiPerDay = daysRunning > 0 ? roi / daysRunning : 0;

    // Engagement metrics
    const engagementRate = (uniqueClaimers / totalUsers) * 100;
    const successScore = this.calculateSuccessScore(
      engagementRate,
      claimedPercentage,
      roi,
      roiPerDay
    );

    // Recommendations
    const recommendations = this.generateROIRecommendations(
      engagementRate,
      claimedPercentage,
      roi,
      roiPerDay,
      daysRunning
    );

    const status = endDate && Date.now() > endDate.getTime() 
      ? 'completed' 
      : 'active';

    return {
      campaignId,
      campaignName,
      startDate,
      endDate,
      status,
      totalInvested: totalAllocated,
      totalSpent: totalSpent.toFixed(2),
      costPerUser,
      totalClaimed,
      claimedPercentage,
      uniqueClaimers,
      averageClaimPerUser: (Number(claimed) / (uniqueClaimers || 1) / 1e18).toFixed(6),
      roi: Math.round(roi * 100) / 100,
      roiPerDay: Math.round(roiPerDay * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod),
      engagementRate: Math.round(engagementRate * 100) / 100,
      successScore,
      recommendations
    };
  }

  /**
   * Calculate segmented ROI by user tier
   */
  calculateSegmentedROI(
    segments: Array<{
      name: string;
      userCount: number;
      allocated: string;
      claimed: string;
    }>
  ): SegmentedROI[] {
    const totalAllocated = segments.reduce(
      (sum, seg) => sum + BigInt(seg.allocated),
      BigInt(0)
    );

    return segments.map(segment => {
      const allocated = BigInt(segment.allocated);
      const claimed = BigInt(segment.claimed);
      const claimRate = (Number(claimed) / Number(allocated)) * 100;
      const averageClaim = segment.userCount > 0 
        ? (Number(claimed) / segment.userCount).toString()
        : '0';

      // Simple ROI proxy: claim rate as percentage
      const roi = claimRate * 1.5; // Weighted metric

      return {
        segment: segment.name,
        userCount: segment.userCount,
        totalAllocated: segment.allocated,
        totalClaimed: segment.claimed,
        claimRate: Math.round(claimRate * 100) / 100,
        averageClaim,
        roi: Math.round(roi * 100) / 100
      };
    });
  }

  /**
   * Compare multiple campaigns
   */
  compareCampaigns(campaigns: CampaignROI[]): CampaignComparison {
    if (campaigns.length === 0) {
      return {
        campaigns: [],
        bestPerforming: '',
        averageROI: 0,
        averageEngagement: 0,
        insights: ['No campaigns to compare']
      };
    }

    const campaignData = campaigns.map(c => ({
      campaignId: c.campaignId,
      name: c.campaignName,
      roi: c.roi,
      engagementRate: c.engagementRate,
      successScore: c.successScore,
      totalClaimed: c.totalClaimed
    }));

    // Find best performing
    const bestPerforming = campaigns.reduce((best, current) =>
      current.successScore > best.successScore ? current : best
    );

    // Calculate averages
    const averageROI = campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length;
    const averageEngagement = campaigns.reduce((sum, c) => sum + c.engagementRate, 0) / campaigns.length;

    // Generate insights
    const insights = this.generateCampaignInsights(campaigns, averageROI, averageEngagement);

    return {
      campaigns: campaignData,
      bestPerforming: bestPerforming.campaignId,
      averageROI: Math.round(averageROI * 100) / 100,
      averageEngagement: Math.round(averageEngagement * 100) / 100,
      insights
    };
  }

  /**
   * Calculate detailed success metrics
   */
  calculateSuccessMetrics(
    campaignId: string,
    dailyClaimCounts: number[],
    dailyUniqueUsers: number[],
    totalAllocated: number,
    currentClaimed: number,
    claimLatencies: number[] // in hours
  ): SuccessMetrics {
    const conversionRate = (currentClaimed / totalAllocated) * 100;
    const trend = this.calculateTrend(dailyClaimCounts);
    const volatility = this.calculateVolatility(dailyClaimCounts);
    const momentum = this.calculateMomentum(dailyClaimCounts);

    // Claiming behavior
    const avgLatency = claimLatencies.length > 0
      ? claimLatencies.reduce((a, b) => a + b, 0) / claimLatencies.length
      : 0;

    let claimingBehavior: 'fast' | 'medium' | 'slow' = 'medium';
    if (avgLatency < 24) claimingBehavior = 'fast';
    if (avgLatency > 72) claimingBehavior = 'slow';

    // Health score
    const healthScore = this.calculateHealthScore(
      conversionRate,
      trend,
      volatility,
      momentum
    );

    // Generate indicators
    const { positive, negative } = this.generateHealthIndicators(
      conversionRate,
      trend,
      volatility,
      momentum
    );

    // Seasonality (simplified day-of-week)
    const seasonality: Record<string, number> = {
      Monday: 1.0,
      Tuesday: 1.0,
      Wednesday: 1.0,
      Thursday: 1.0,
      Friday: 1.0,
      Saturday: 0.8,
      Sunday: 0.8
    };

    return {
      campaignId,
      conversionRate: Math.round(conversionRate * 100) / 100,
      conversionFunnel: {
        allocated: totalAllocated,
        claimed: currentClaimed,
        rate: conversionRate
      },
      averageClaimLatency: Math.round(avgLatency),
      claimingBehavior,
      seasonality,
      claimingTrend: trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable',
      volatility: Math.round(volatility * 100) / 100,
      momentum: Math.round(momentum * 100) / 100,
      healthScore,
      indicators: { positive, negative }
    };
  }

  /**
   * Private: Calculate success score (0-100)
   */
  private calculateSuccessScore(
    engagementRate: number,
    claimedPercentage: number,
    roi: number,
    roiPerDay: number
  ): number {
    // Weighted scoring
    const engagementScore = Math.min(100, engagementRate * 1.5);
    const claimScore = Math.min(100, claimedPercentage);
    const roiScore = Math.min(100, Math.max(0, roi / 2 + 50));
    const momentumScore = roiPerDay > 0 ? 100 : Math.max(0, 50 + roiPerDay * 10);

    return Math.round(
      (engagementScore * 0.25 + claimScore * 0.25 + roiScore * 0.25 + momentumScore * 0.25)
    );
  }

  /**
   * Private: Generate ROI recommendations
   */
  private generateROIRecommendations(
    engagementRate: number,
    claimedPercentage: number,
    roi: number,
    roiPerDay: number,
    daysRunning: number
  ): string[] {
    const recommendations: string[] = [];

    if (engagementRate < 30) {
      recommendations.push('Low engagement rate - consider improving distribution channels');
    }
    if (engagementRate >= 70) {
      recommendations.push('Excellent engagement - replicate this campaign strategy');
    }

    if (claimedPercentage < 40) {
      recommendations.push('Low claim percentage - analyze friction points in claiming process');
    }
    if (claimedPercentage >= 80) {
      recommendations.push('High claim rate - excellent campaign execution');
    }

    if (roi < 0) {
      recommendations.push('Negative ROI - consider optimizing costs or token allocation');
    }
    if (roi > 200) {
      recommendations.push('Exceptional ROI - this campaign model is highly effective');
    }

    if (roiPerDay < 0 && daysRunning > 30) {
      recommendations.push('Declining ROI trend - campaign momentum is slowing');
    }

    if (recommendations.length === 0) {
      recommendations.push('Campaign is performing within normal parameters');
    }

    return recommendations;
  }

  /**
   * Private: Generate campaign insights
   */
  private generateCampaignInsights(
    campaigns: CampaignROI[],
    averageROI: number,
    averageEngagement: number
  ): string[] {
    const insights: string[] = [];

    // ROI insights
    const roiOutliers = campaigns.filter(c => c.roi > averageROI * 1.5);
    if (roiOutliers.length > 0) {
      insights.push(`${roiOutliers.length} campaign(s) significantly outperforming ROI average`);
    }

    // Engagement insights
    const lowEngagement = campaigns.filter(c => c.engagementRate < averageEngagement * 0.7);
    if (lowEngagement.length > 0) {
      insights.push(`${lowEngagement.length} campaign(s) with below-average engagement`);
    }

    // Status insights
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
    insights.push(`${activeCampaigns} active, ${completedCampaigns} completed campaigns`);

    // Trend insights
    const improving = campaigns.filter(c => c.roiPerDay > 0).length;
    insights.push(`${improving} campaign(s) showing positive ROI trend`);

    return insights;
  }

  /**
   * Private: Calculate trend
   */
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  }

  /**
   * Private: Calculate volatility
   */
  private calculateVolatility(data: number[]): number {
    if (data.length < 2) return 0;
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  /**
   * Private: Calculate momentum
   */
  private calculateMomentum(data: number[]): number {
    if (data.length < 3) return 0;
    const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous = data.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
  }

  /**
   * Private: Calculate health score
   */
  private calculateHealthScore(
    conversionRate: number,
    trend: number,
    volatility: number,
    momentum: number
  ): number {
    let score = 50; // Base score

    // Conversion impact
    score += Math.min(30, (conversionRate / 100) * 30);

    // Trend impact
    if (trend > 10) score += 10;
    if (trend > 20) score += 5;
    if (trend < -10) score -= 10;

    // Volatility impact
    if (volatility < 20) score += 5;
    if (volatility > 50) score -= 10;

    // Momentum impact
    if (momentum > 10) score += 5;
    if (momentum < -10) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Private: Generate health indicators
   */
  private generateHealthIndicators(
    conversionRate: number,
    trend: number,
    volatility: number,
    momentum: number
  ): { positive: string[]; negative: string[] } {
    const positive: string[] = [];
    const negative: string[] = [];

    if (conversionRate > 60) positive.push('Strong claim conversion rate');
    if (conversionRate < 20) negative.push('Low claim conversion rate');

    if (trend > 15) positive.push('Positive upward trend');
    if (trend < -15) negative.push('Declining trend in claims');

    if (volatility < 15) positive.push('Stable claim pattern');
    if (volatility > 50) negative.push('High volatility in claims');

    if (momentum > 10) positive.push('Strong recent momentum');
    if (momentum < -10) negative.push('Declining momentum');

    if (positive.length === 0) positive.push('Metrics within normal range');

    return { positive, negative };
  }
}

export default ROITrackingService;
