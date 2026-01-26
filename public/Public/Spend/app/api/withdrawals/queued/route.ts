import { NextRequest, NextResponse } from 'next/server';
import { publicClient } from '@/lib/publicClient';
import { SpendVaultABI } from '@/lib/abis/SpendVault';
import { type Address, isAddress } from 'viem';

/**
 * GET /api/withdrawals/queued?vault=0x...
 * Fetch all queued withdrawals for a vault
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vaultAddress = searchParams.get('vault') as Address;
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    if (!vaultAddress || !isAddress(vaultAddress)) {
      return NextResponse.json(
        { error: 'Invalid vault address' },
        { status: 400 }
      );
    }

    const withdrawals: any[] = [];

    try {
      // Get total withdrawal queue ID
      const queueId = await publicClient.readContract({
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'withdrawalQueueId',
        args: []
      });

      const totalWithdrawals = Math.min(Number(queueId), maxResults);
      const now = Math.floor(Date.now() / 1000);

      // Fetch each withdrawal
      for (let i = 0; i < totalWithdrawals; i++) {
        try {
          const queued = await publicClient.readContract({
            address: vaultAddress,
            abi: SpendVaultABI,
            functionName: 'getQueuedWithdrawal',
            args: [BigInt(i)]
          });

          const readyAt = Number((queued as any).readyAt || 0);
          const timeRemaining = Math.max(0, readyAt - now);

          // Determine status
          let status = 'pending';
          if ((queued as any).isExecuted) status = 'executed';
          else if ((queued as any).isCancelled) status = 'cancelled';
          else if ((queued as any).isFrozen) status = 'frozen';
          else if (timeRemaining === 0) status = 'ready';

          withdrawals.push({
            withdrawalId: i,
            token: (queued as any).token,
            amount: (queued as any).amount.toString(),
            recipient: (queued as any).recipient,
            queuedAt: Number((queued as any).queuedAt || 0),
            readyAt,
            timeRemaining,
            status,
            isFrozen: (queued as any).isFrozen,
            isExecuted: (queued as any).isExecuted,
            isCancelled: (queued as any).isCancelled,
            freezeCount: Number((queued as any).freezeCount || 0),
            reason: (queued as any).reason || '',
            category: (queued as any).category || '',
            signers: (queued as any).signers || []
          });
        } catch (err) {
          console.error(`Error fetching withdrawal ${i}:`, err);
        }
      }

      return NextResponse.json({
        success: true,
        vault: vaultAddress,
        totalWithdrawals: Number(queueId),
        displayedWithdrawals: withdrawals.length,
        timestamp: now,
        withdrawals: withdrawals.reverse() // Newest first
      });
    } catch (err) {
      console.error('Error reading from contract:', err);
      return NextResponse.json(
        { error: 'Failed to read contract data', details: String(err) },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
