import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData } from 'viem';
import { ON_CHAIN_RESUME_ABI } from '@/lib/contract';

/**
 * GET /api/contract/profile/[address]
 * Fetch profile data for an address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    // TODO: Implement contract read for profile data
    // This would call OnChainResumeEnhanced.getProfile(address)

    // Mock response for now
    return NextResponse.json({
      handle: 'user-profile',
      bio: 'Professional on-chain resume',
      title: 'Smart Contract Developer',
      address,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

/**
 * POST /api/contract/profile/[address]
 * Returns transaction data to update IPFS hash on-chain
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const body = await request.json();
    const ipfsHash: string = body?.ipfsHash;

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    if (!ipfsHash || typeof ipfsHash !== 'string') {
      return NextResponse.json({ error: 'ipfsHash is required' }, { status: 400 });
    }

    const contractAddress = process.env.NEXT_PUBLIC_ONCHAIN_RESUME_ADDRESS || process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      return NextResponse.json({ error: 'Contract address not configured' }, { status: 500 });
    }

    const data = encodeFunctionData({
      abi: ON_CHAIN_RESUME_ABI as any,
      functionName: 'updateProfile',
      args: [ipfsHash],
    });

    return NextResponse.json(
      {
        to: contractAddress,
        data,
        value: '0x0',
        from: address,
        chainId: process.env.NEXT_PUBLIC_CHAIN_ID || undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Prepare updateProfile tx error:', error);
    return NextResponse.json({ error: 'Failed to prepare transaction' }, { status: 500 });
  }
}
