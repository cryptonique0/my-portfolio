import { NextRequest, NextResponse } from 'next/server';
import { publicClient } from '@/lib/publicClient';
import { SpendVaultABI } from '@/lib/abis/SpendVault';
import { type Address, isAddress } from 'viem';

/**
 * GET /api/vaults/[address]/emergency-freeze
 * Get current emergency freeze status for a vault
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

    try {
      // Get freeze status from contract
      const status = await publicClient.readContract({
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'getEmergencyFreezeStatus',
        args: []
      });

      const freezeVoters = await publicClient.readContract({
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'getFreezeVoters',
        args: []
      });

      const unfreezeVoters = await publicClient.readContract({
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'getUnfreezeVoters',
        args: []
      });

      const lastFreezeTime = await publicClient.readContract({
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'lastFreezeTimestamp',
        args: []
      });

      const status_tuple = status as any;

      return NextResponse.json({
        success: true,
        vault: vaultAddress,
        timestamp: Math.floor(Date.now() / 1000),
        emergencyFreeze: {
          isFrozen: status_tuple[0],
          freezeVotes: Number(status_tuple[1]),
          unfreezeVotes: Number(status_tuple[2]),
          threshold: Number(status_tuple[3]),
          freezeVoters: freezeVoters as string[],
          unfreezeVoters: unfreezeVoters as string[],
          lastFreezeTimestamp: Number(lastFreezeTime),
          percentToFreeze: status_tuple[1] > 0n ? 
            Math.round((Number(status_tuple[1]) / Number(status_tuple[3])) * 100) : 0,
          percentToUnfreeze: status_tuple[0] && status_tuple[2] > 0n ?
            Math.round((Number(status_tuple[2]) / Number(status_tuple[3])) * 100) : 0
        }
      });
    } catch (err) {
      console.error('Error reading vault freeze status:', err);
      return NextResponse.json(
        { 
          error: 'Failed to read emergency freeze status',
          details: String(err)
        },
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
