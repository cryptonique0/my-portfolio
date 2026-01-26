import { NextRequest, NextResponse } from 'next/server';
import { isAddress, type Address } from 'viem';

/**
 * GET /api/vaults/[address]/guardian-activity
 * 
 * Returns guardian participation metrics and activity history
 * Tracks: approval rates, response times, freeze votes, rejections
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const vaultAddress = params.address as Address;
    const guardianAddressParam = request.nextUrl.searchParams.get('guardian');

    if (!isAddress(vaultAddress)) {
      return NextResponse.json(
        { error: 'Invalid vault address' },
        { status: 400 }
      );
    }

    // If specific guardian requested, validate their address
    if (guardianAddressParam && !isAddress(guardianAddressParam)) {
      return NextResponse.json(
        { error: 'Invalid guardian address' },
        { status: 400 }
      );
    }

    const guardianAddress = guardianAddressParam as Address | null;

    // Mock data structure - In production, this would query indexed events
    // For now returning realistic metrics that match the contract architecture
    
    const guardianMetrics = guardianAddress 
      ? getGuardianMetrics(guardianAddress)
      : getVaultGuardianMetrics();

    return NextResponse.json({
      success: true,
      vault: vaultAddress,
      timestamp: Math.floor(Date.now() / 1000),
      ...(guardianAddress ? { guardian: guardianAddress } : {}),
      metrics: guardianMetrics
    });
  } catch (err) {
    console.error('Error fetching guardian activity:', err);
    return NextResponse.json(
      { error: 'Failed to fetch guardian activity metrics' },
      { status: 500 }
    );
  }
}

/**
 * Get metrics for a specific guardian
 */
function getGuardianMetrics(guardianAddress: Address) {
  // In production: Query indexed events for this guardian
  // - GuardianAction events (approvals, rejections)
  // - EmergencyFreezeVoteCast events
  // - WithdrawalFrozen events
  // Calculate metrics from indexed data
  
  return {
    guardian: guardianAddress,
    participation: {
      approvalCount: 15,
      rejectionCount: 2,
      totalOpportunities: 20,
      participationRate: 0.85, // 85%
      averageApprovalTime: 3600, // seconds
      medianApprovalTime: 2400, // seconds
      lastActivityTimestamp: Math.floor(Date.now() / 1000) - 7200,
    },
    freezeVoting: {
      freezeVotesInMonth: 3,
      unfreezeVotesInMonth: 2,
      emergencyFreezeParticipation: 0.6, // 60%
    },
    reliability: {
      responsiveness: 0.88, // Quick to respond
      consistency: 0.92, // Consistent with other guardians
      trustScore: 89, // 0-100 composite score
    },
    recentActivity: [
      {
        id: 'act_1',
        type: 'approval',
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        action: 'Approved withdrawal',
        details: {
          withdrawalAmount: '5.5',
          recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f42aE9',
          category: 'Operations',
          timeToApprove: 1800,
        }
      },
      {
        id: 'act_2',
        type: 'freeze_vote',
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        action: 'Voted to freeze vault',
        details: {
          reason: 'Suspicious withdrawal pattern detected',
          voteCount: 2,
          threshold: 3,
        }
      },
      {
        id: 'act_3',
        type: 'approval',
        timestamp: Math.floor(Date.now() / 1000) - 172800,
        action: 'Approved withdrawal',
        details: {
          withdrawalAmount: '2.0',
          recipient: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          category: 'Maintenance',
          timeToApprove: 2400,
        }
      }
    ],
    badge: {
      type: 'expert',
      level: 3,
      issuedAt: Math.floor(Date.now() / 1000) - 2592000,
      earnedReason: 'High participation and reliability',
    }
  };
}

/**
 * Get metrics for all guardians of a vault
 */
function getVaultGuardianMetrics() {
  // In production: Aggregate across all guardians in the vault
  
  return {
    guardians: [
      {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42aE9',
        participationRate: 0.95,
        trustScore: 94,
        approvalCount: 19,
        lastActivity: Math.floor(Date.now() / 1000) - 3600,
      },
      {
        address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        participationRate: 0.80,
        trustScore: 82,
        approvalCount: 16,
        lastActivity: Math.floor(Date.now() / 1000) - 7200,
      },
      {
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        participationRate: 0.85,
        trustScore: 88,
        approvalCount: 17,
        lastActivity: Math.floor(Date.now() / 1000) - 14400,
      }
    ],
    averageParticipation: 0.87,
    vaultHealthScore: 88,
    recentEvents: [
      {
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        type: 'approval',
        guardian: '0x742d35Cc6634C0532925a3b844Bc9e7595f42aE9',
        amount: '5.5',
        category: 'Operations',
      },
      {
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        type: 'freeze_vote',
        guardian: '0x742d35Cc6634C0532925a3b844Bc9e7595f42aE9',
        reason: 'Pattern anomaly',
      }
    ]
  };
}
