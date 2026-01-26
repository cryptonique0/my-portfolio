/**
 * Predictive Analytics Service
 * Forecasts claim rates, user behavior, and campaign success metrics
 */

export interface ClaimForecast {
  date: Date;
  predictedClaims: number;
  confidence: number; // 0-100%
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
}

export interface UserBehaviorForecast {
  claimProbability: number; // 0-100%
  estimatedClaimTime: number; // days from eligibility
  likelyClaimAmount: string;
  userSegment: 'whale' | 'mid-holder' | 'small-holder';
}

export interface CampaignSuccessForecast {
  campaignId: string;
  successProbability: number; // 0-100%
  estimatedFinalClaimRate: number; // percentage
  estimatedCompletionDate: Date;
  riskFactors: string[];
  recommendations: string[];
}

export interface ROIProjection {
  campaignId: string;
  investedAmount: string;
  projectedReturn: string;
  projectedROI: number; // percentage
  paybackPeriod: number; // days
  confidence: number; // 0-100%
}

export class PredictiveAnalyticsService {
  private historicalData: Map<string, number[]> = new Map();
  private readonly MIN_DATA_POINTS = 10;

  /**
   * Forecast claim rates for next N days
   */
  forecastClaimRates(
    historicalClaims: number[],
    daysToForecast: number = 30
  ): ClaimForecast[] {
    if (historicalClaims.length < this.MIN_DATA_POINTS) {
      return this.generateDefaultForecast(daysToForecast);
    }

    const forecasts: ClaimForecast[] = [];
    const trend = this.calculateTrend(historicalClaims);
    const avgClaims = historicalClaims.reduce((a, b) => a + b, 0) / historicalClaims.length;
    const volatility = this.calculateVolatility(historicalClaims);

    for (let i = 1; i <= daysToForecast; i++) {
      const seasonalFactor = this.calculateSeasonalFactor(i);
      const trendFactor = this.calculateTrendFactor(trend, i);
      
      // Simple exponential smoothing with trend
      const baseForecasted = avgClaims * trendFactor * seasonalFactor;
      
      // Add some variance
      const variance = baseForecasted * (volatility / 100);
      const predictedClaims = Math.max(0, Math.round(baseForecasted + (Math.random() - 0.5) * variance));

      // Calculate confidence (higher confidence for near-term forecasts)
      const confidence = Math.max(40, 95 - (i * 2));

      forecasts.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        predictedClaims,
        confidence,
        trend: trendFactor > 1 ? 'increasing' : trendFactor < 1 ? 'decreasing' : 'stable',
        seasonalFactor
      });
    }

    return forecasts;
  }

  /**
   * Predict user claim behavior based on historical patterns
   */
  predictUserBehavior(
    userAllocationTime: Date,
    userHistoricalClaims: number,
    averageClaimAmount: string,
    userTierPercentile: number
  ): UserBehaviorForecast {
    const daysSinceAllocated = (Date.now() - userAllocationTime.getTime()) / (1000 * 60 * 60 * 24);
    
    // Claim probability based on days since allocation
    // Higher percentile users have higher claim probability
    const baseProbability = Math.min(95, 20 + daysSinceAllocated * 2 + (userTierPercentile / 100) * 40);
    const claimProbability = userHistoricalClaims > 0 ? Math.min(99, baseProbability * 1.3) : baseProbability;

    // Estimate claim time
    const estimatedClaimTime = Math.max(1, 10 - (userHistoricalClaims * 2) - (userTierPercentile / 100) * 5);

    // Determine user segment
    const avgAmount = BigInt(averageClaimAmount);
    let userSegment: 'whale' | 'mid-holder' | 'small-holder' = 'small-holder';
    if (userTierPercentile > 75) {
      userSegment = 'whale';
    } else if (userTierPercentile > 40) {
      userSegment = 'mid-holder';
    }

    // Estimate likely claim amount based on segment
    let claimMultiplier = 1;
    if (userSegment === 'whale') {
      claimMultiplier = 1.3;
    } else if (userSegment === 'mid-holder') {
      claimMultiplier = 1.1;
    }

    const likelyClaimAmount = (avgAmount * BigInt(Math.round(claimMultiplier * 100)) / BigInt(100)).toString();

    return {
      claimProbability: Math.min(99, claimProbability),
      estimatedClaimTime: Math.round(estimatedClaimTime),
      likelyClaimAmount,
      userSegment
    };
  }

  /**
   * Forecast overall campaign success metrics
   */
  forecastCampaignSuccess(
    campaignId: string,
    currentClaimRate: number,
    daysElapsed: number,
    totalAllocatedUsers: number,
    currentClaimedUsers: number,
    historicalDailyClaimRates: number[]
  ): CampaignSuccessForecast {
    const trend = this.calculateTrend(historicalDailyClaimRates);
    const avgClaimRate = historicalDailyClaimRates.reduce((a, b) => a + b, 0) / historicalDailyClaimRates.length;
    
    // Project final claim rate
    const projectionDays = 90; // Standard projection period
    const remainingUsers = totalAllocatedUsers - currentClaimedUsers;
    const projectedAdditionalClaims = Math.round(remainingUsers * (avgClaimRate / 100) * (1 + trend / 100) * 0.7); // 70% of remaining
    
    const projectedFinalClaims = currentClaimedUsers + projectedAdditionalClaims;
    const estimatedFinalClaimRate = (projectedFinalClaims / totalAllocatedUsers) * 100;

    // Calculate estimated completion date
    const daysToCompletion = remainingUsers > 0 
      ? Math.ceil(remainingUsers / (historicalDailyClaimRates[historicalDailyClaimRates.length - 1] || 1))
      : 1;
    
    const estimatedCompletionDate = new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000);

    // Success probability (higher if claim rate is stable and positive)
    const trendFactor = trend > 0 ? 1.2 : trend < -10 ? 0.7 : 1;
    const rateStability = 1 - (this.calculateVolatility(historicalDailyClaimRates) / 100);
    const successProbability = Math.min(95, 70 * trendFactor * rateStability);

    // Risk factors
    const riskFactors: string[] = [];
    if (trend < -15) riskFactors.push('Declining claim momentum');
    if (currentClaimRate < 20) riskFactors.push('Low initial claim rate');
    if (daysElapsed > 60 && estimatedFinalClaimRate < 30) riskFactors.push('Projected low final claim rate');
    if (this.calculateVolatility(historicalDailyClaimRates) > 50) riskFactors.push('High volatility in claims');

    // Recommendations
    const recommendations: string[] = [];
    if (currentClaimRate < 30) {
      recommendations.push('Consider marketing push to increase awareness');
      recommendations.push('Simplify claim process or add incentives');
    }
    if (trend < 0) {
      recommendations.push('Analyze user feedback for friction points');
      recommendations.push('Monitor for technical issues with claiming');
    }
    if (estimatedFinalClaimRate < 50) {
      recommendations.push('Consider extending campaign deadline');
      recommendations.push('Implement retargeting campaign for unclaimed users');
    }
    if (riskFactors.length === 0) {
      recommendations.push('Campaign tracking on positive trajectory');
      recommendations.push('Continue current engagement strategy');
    }

    return {
      campaignId,
      successProbability: Math.round(successProbability),
      estimatedFinalClaimRate: Math.round(estimatedFinalClaimRate * 100) / 100,
      estimatedCompletionDate,
      riskFactors,
      recommendations
    };
  }

  /**
   * Calculate ROI projection for a campaign
   */
  calculateROIProjection(
    campaignId: string,
    investedAmount: string,
    currentClaimed: string,
    projectedFinalClaim: string,
    investmentDays: number
  ): ROIProjection {
    const invested = BigInt(investedAmount);
    const claimed = BigInt(currentClaimed);
    const projected = BigInt(projectedFinalClaim);

    // Calculate metrics
    const paybackPeriod = invested > BigInt(0) 
      ? Math.ceil(Number(investmentDays * invested / claimed))
      : 0;

    const projectedROI = invested > BigInt(0)
      ? (Number((projected - invested) * BigInt(10000) / invested)) / 100
      : 0;

    // Confidence based on data maturity
    const dataMaturity = Math.min(100, (investmentDays / 60) * 100);
    const confidence = Math.max(40, dataMaturity * 0.8);

    return {
      campaignId,
      investedAmount,
      projectedReturn: projected.toString(),
      projectedROI: Math.round(projectedROI * 100) / 100,
      paybackPeriod,
      confidence: Math.round(confidence)
    };
  }

  /**
   * Private: Calculate trend from historical data
   * Returns percentage change per period
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
   * Private: Calculate volatility (standard deviation)
   */
  private calculateVolatility(data: number[]): number {
    if (data.length < 2) return 0;

    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return avg > 0 ? (stdDev / avg) * 100 : 0;
  }

  /**
   * Private: Calculate seasonal factor (simple weekly pattern)
   */
  private calculateSeasonalFactor(daysAhead: number): number {
    // Assume lower claims on weekends
    const dayOfWeek = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).getDay();
    return [0.8, 1, 1, 1, 1, 1, 0.85][dayOfWeek] || 1;
  }

  /**
   * Private: Calculate trend factor for exponential smoothing
   */
  private calculateTrendFactor(trend: number, period: number): number {
    // Dampen the trend effect for longer projections
    return 1 + (trend / 100) * Math.pow(0.95, period);
  }

  /**
   * Private: Generate default forecast when insufficient data
   */
  private generateDefaultForecast(days: number): ClaimForecast[] {
    const forecasts: ClaimForecast[] = [];
    const baseClaims = 100;

    for (let i = 1; i <= days; i++) {
      const seasonalFactor = this.calculateSeasonalFactor(i);
      forecasts.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        predictedClaims: Math.round(baseClaims * seasonalFactor),
        confidence: 40,
        trend: 'stable',
        seasonalFactor
      });
    }

    return forecasts;
  }
}

export default PredictiveAnalyticsService;
