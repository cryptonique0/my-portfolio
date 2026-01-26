import { useState, useEffect } from 'react';
import { type Address } from 'viem';

/**
 * Guardian activity metrics and history
 */
export interface GuardianActivityMetrics {
  guardian?: Address;
  participation: {
    approvalCount: number;
    rejectionCount: number;
    totalOpportunities: number;
    participationRate: number;
    averageApprovalTime: number;
    medianApprovalTime: number;
    lastActivityTimestamp: number;
  };
  freezeVoting: {
    freezeVotesInMonth: number;
    unfreezeVotesInMonth: number;
    emergencyFreezeParticipation: number;
  };
  reliability: {
    responsiveness: number;
    consistency: number;
    trustScore: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'approval' | 'rejection' | 'freeze_vote' | 'unfreeze_vote';
    timestamp: number;
    action: string;
    details: Record<string, any>;
  }>;
  badge?: {
    type: string;
    level: number;
    issuedAt: number;
    earnedReason: string;
  };
}

export interface VaultGuardianMetrics {
  guardians: Array<{
    address: Address;
    participationRate: number;
    trustScore: number;
    approvalCount: number;
    lastActivity: number;
  }>;
  averageParticipation: number;
  vaultHealthScore: number;
  recentEvents: Array<{
    timestamp: number;
    type: string;
    guardian: Address;
    [key: string]: any;
  }>;
}

/**
 * useGuardianActivity - Fetch guardian participation metrics
 * 
 * @param vaultAddress - Vault contract address
 * @param guardianAddress - Optional: specific guardian address
 * @param pollInterval - How often to refresh (ms), 0 to disable
 */
export function useGuardianActivity(
  vaultAddress: Address | null,
  guardianAddress?: Address,
  pollInterval: number = 30000 // 30 seconds
) {
  const [data, setData] = useState<GuardianActivityMetrics | VaultGuardianMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    if (!vaultAddress) return;

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (guardianAddress) {
          params.append('guardian', guardianAddress);
        }

        const response = await fetch(
          `/api/vaults/${vaultAddress}/guardian-activity?${params}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch guardian activity: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setData(result.metrics);
          setLastUpdated(result.timestamp);
        } else {
          setError(result.error || 'Unknown error');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(message);
        console.error('Guardian activity fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();

    // Set up polling if interval > 0
    if (pollInterval > 0) {
      const interval = setInterval(fetchActivity, pollInterval);
      return () => clearInterval(interval);
    }
  }, [vaultAddress, guardianAddress, pollInterval]);

  return { data, loading, error, lastUpdated };
}

/**
 * Risk score assessment for vault
 */
export interface RiskScoreAssessment {
  overallScore: number; // 0-100, lower is better
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    withdrawalVelocity: {
      score: number;
      status: string;
      description: string;
      dailyAverageAmount: number;
      weeklyAverageAmount: number;
      monthlyAverageAmount: number;
      lastWithdrawal: {
        amount: number;
        timestamp: number;
        category: string;
      };
      historicalBaseline: {
        dailyMean: number;
        dailyStdDev: number;
        weeklyMean: number;
        weeklyStdDev: number;
      };
    };
    patternDeviation: {
      score: number;
      status: string;
      description: string;
      timeOfDayAnomaly: boolean;
      frequencyAnomaly: boolean;
      amountAnomaly: boolean;
      anomalousWithdrawals: Array<{
        timestamp: number;
        amount: number;
        reason: string;
      }>;
    };
    guardianConsensus: {
      score: number;
      status: string;
      description: string;
      consensusRate: number;
      dissenting: number;
      averageApprovalTime: number;
      responseConsistency: number;
    };
    spendingHeadroom: {
      score: number;
      status: string;
      description: string;
      dailyUtilization: number;
      weeklyUtilization: number;
      monthlyUtilization: number;
      tokensNearLimit: Array<{
        token: string;
        dailyUtilization: number;
        weeklyUtilization: number;
        monthlyUtilization: number;
        daysUntilReset: number;
      }>;
    };
    timeLockUtilization: {
      score: number;
      status: string;
      description: string;
      queuedWithdrawals: number;
      frozenWithdrawals: number;
      emergencyFreezesInMonth: number;
      averageFreezeDuration: number;
    };
    approvalPatterns: {
      score: number;
      status: string;
      description: string;
      recentSlowdown: boolean;
      averageTimeToApprove: number;
      fastestApproval: number;
      slowestApproval: number;
      timeVariance: number;
    };
  };
  alerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'critical';
    category: string;
    message: string;
    description: string;
    recommendation: string;
    [key: string]: any;
  }>;
  recentActivity: Array<{
    timestamp: number;
    type: string;
    [key: string]: any;
  }>;
  recommendations: string[];
}

/**
 * useRiskScore - Fetch real-time risk assessment
 * 
 * @param vaultAddress - Vault contract address
 * @param pollInterval - How often to refresh (ms), 0 to disable
 */
export function useRiskScore(
  vaultAddress: Address | null,
  pollInterval: number = 60000 // 60 seconds
) {
  const [data, setData] = useState<RiskScoreAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    if (!vaultAddress) return;

    const fetchRiskScore = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/vaults/${vaultAddress}/risk-score`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch risk score: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setData(result.riskScore);
          setLastUpdated(result.timestamp);
        } else {
          setError(result.error || 'Unknown error');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch risk data';
        setError(message);
        console.error('Risk score fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskScore();

    // Set up polling if interval > 0
    if (pollInterval > 0) {
      const interval = setInterval(fetchRiskScore, pollInterval);
      return () => clearInterval(interval);
    }
  }, [vaultAddress, pollInterval]);

  const acknowledgeAlert = async (alertId: string) => {
    if (!vaultAddress) return;

    try {
      const response = await fetch(
        `/api/vaults/${vaultAddress}/risk-score/acknowledge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      return await response.json();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      throw err;
    }
  };

  return { data, loading, error, lastUpdated, acknowledgeAlert };
}

/**
 * Utility: Get risk level color for UI
 */
export function getRiskLevelColor(
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
): string {
  switch (riskLevel) {
    case 'low':
      return 'text-green-600 dark:text-green-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'high':
      return 'text-orange-600 dark:text-orange-400';
    case 'critical':
      return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Utility: Get risk level background color for UI
 */
export function getRiskLevelBgColor(
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
): string {
  switch (riskLevel) {
    case 'low':
      return 'bg-green-50 dark:bg-green-950/20';
    case 'medium':
      return 'bg-yellow-50 dark:bg-yellow-950/20';
    case 'high':
      return 'bg-orange-50 dark:bg-orange-950/20';
    case 'critical':
      return 'bg-red-50 dark:bg-red-950/20';
  }
}
