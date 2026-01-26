import { NextRequest, NextResponse } from 'next/server';
import { isAddress, type Address } from 'viem';

/**
 * GET /api/vaults/[address]/risk-score
 * 
 * Returns real-time risk assessment for the vault
 * Analyzes: withdrawal patterns, guardian consensus, spending headroom, time-lock usage
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const vaultAddress = params.address as Address;

    if (!isAddress(vaultAddress)) {
      return NextResponse.json(
        { error: 'Invalid vault address' },
        { status: 400 }
      );
    }

    const riskAssessment = calculateRiskScore(vaultAddress);

    return NextResponse.json({
      success: true,
      vault: vaultAddress,
      timestamp: Math.floor(Date.now() / 1000),
      riskScore: riskAssessment
    });
  } catch (err) {
    console.error('Error calculating risk score:', err);
    return NextResponse.json(
      { error: 'Failed to calculate vault risk score' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vaults/[address]/risk-score/acknowledge
 * 
 * Mark a risk alert as acknowledged by vault owner
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const vaultAddress = params.address as Address;

    if (!isAddress(vaultAddress)) {
      return NextResponse.json(
        { error: 'Invalid vault address' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'Missing alertId' },
        { status: 400 }
      );
    }

    // In production: Store acknowledgment in database
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      vault: vaultAddress,
      alertId: alertId,
      acknowledgedAt: Math.floor(Date.now() / 1000)
    });
  } catch (err) {
    console.error('Error acknowledging risk alert:', err);
    return NextResponse.json(
      { error: 'Failed to acknowledge risk alert' },
      { status: 500 }
    );
  }
}

/**
 * Calculate comprehensive risk score for vault
 * 
 * Factors:
 * - Withdrawal velocity (amount and frequency)
 * - Pattern deviation (deviation from historical baseline)
 * - Guardian consensus (consistency of approvals)
 * - Spending limit headroom (proximity to caps)
 * - Time-lock usage (are freezes being deployed?)
 * - Approval time patterns (sudden changes)
 */
function calculateRiskScore(vaultAddress: Address) {
  // In production: Query indexed events to calculate these metrics
  // For now, returning realistic structure with calculated risk factors

  const overallScore = 32; // 0-100, lower is better
  const riskLevel = 'low'; // low | medium | high | critical

  return {
    overallScore, // 32/100 = Low risk
    riskLevel,
    factors: {
      withdrawalVelocity: {
        score: 15,
        status: 'safe',
        description: 'Withdrawal velocity within normal range',
        dailyAverageAmount: 8.5,
        weeklyAverageAmount: 45.2,
        monthlyAverageAmount: 180.0,
        lastWithdrawal: {
          amount: 5.5,
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          category: 'Operations',
        },
        historicalBaseline: {
          dailyMean: 7.2,
          dailyStdDev: 2.1,
          weeklyMean: 42.0,
          weeklyStdDev: 8.5,
        }
      },
      patternDeviation: {
        score: 25,
        status: 'normal',
        description: 'Current patterns align with historical baseline',
        timeOfDayAnomaly: false,
        frequencyAnomaly: false,
        amountAnomaly: false,
        anomalousWithdrawals: [],
      },
      guardianConsensus: {
        score: 20,
        status: 'healthy',
        description: 'High consensus among guardians on approvals',
        consensusRate: 0.95, // 95% agreement
        dissenting: 0,
        averageApprovalTime: 2400,
        responseConsistency: 0.92,
      },
      spendingHeadroom: {
        score: 35,
        status: 'caution',
        description: 'Approaching weekly spending limit',
        dailyUtilization: 0.35, // 35% of daily cap
        weeklyUtilization: 0.72, // 72% of weekly cap (⚠️)
        monthlyUtilization: 0.45, // 45% of monthly cap
        tokensNearLimit: [
          {
            token: 'USDC',
            dailyUtilization: 0.25,
            weeklyUtilization: 0.68,
            monthlyUtilization: 0.42,
            daysUntilReset: 3,
          },
          {
            token: 'ETH',
            dailyUtilization: 0.45,
            weeklyUtilization: 0.78, // HIGHEST RISK
            monthlyUtilization: 0.50,
            daysUntilReset: 3,
          }
        ]
      },
      timeLockUtilization: {
        score: 10,
        status: 'excellent',
        description: 'Effective use of time-locks and emergency freeze',
        queuedWithdrawals: 1,
        frozenWithdrawals: 0,
        emergencyFreezesInMonth: 0,
        averageFreezeDuration: 0,
      },
      approvalPatterns: {
        score: 18,
        status: 'normal',
        description: 'Approval timing consistent with historical patterns',
        recentSlowdown: false,
        averageTimeToApprove: 2400,
        fastestApproval: 600,
        slowestApproval: 4200,
        timeVariance: 0.15, // Low variance = consistent
      }
    },
    alerts: [
      {
        id: 'alert_eth_limit',
        severity: 'warning',
        category: 'spendingLimit',
        message: 'ETH weekly spending limit at 78% utilization',
        description: 'Current weekly usage of ETH is approaching the configured limit. Consider approving carefully or increasing the limit.',
        recommendation: 'Monitor ETH approvals; prepare to reset weekly cap or increase limit',
        affectedToken: 'ETH',
        currentUtilization: 0.78,
        limitAmount: '10 ETH',
        usedAmount: '7.8 ETH',
        remainingAmount: '2.2 ETH',
        resetsAt: Math.floor(Date.now() / 1000) + 259200, // 3 days
      }
    ],
    recentActivity: [
      {
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        type: 'withdrawal',
        amount: '5.5',
        token: 'USDC',
        category: 'Operations',
        riskContribution: 'low',
      },
      {
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        type: 'approval',
        approvers: 2,
        threshold: 3,
        category: 'Operations',
        riskContribution: 'low',
      }
    ],
    recommendations: [
      'ETH weekly spending is at 78% - consider approving high-value requests carefully over next 3 days',
      'All guardians have healthy participation - continue current approval practices',
      'Time-lock mechanism is effective - no urgent changes needed'
    ]
  };
}
