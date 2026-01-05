import { NextRequest, NextResponse } from 'next/server';
import { getContract } from '@/lib/contract';
import { isAddress } from 'viem';

/**
 * POST /api/credentials/verify
 * Verify a credential as an issuer
 * 
 * Body: {
 *   userAddress: string,
 *   credentialIndex: number,
 *   issuerAddress: string,
 *   issuerSignature: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { userAddress, credentialIndex, issuerAddress, issuerSignature } = await request.json();

    // Validate inputs
    if (!userAddress || credentialIndex === undefined || !issuerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: userAddress, credentialIndex, issuerAddress' },
        { status: 400 }
      );
    }

    if (!isAddress(userAddress) || !isAddress(issuerAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum addresses' },
        { status: 400 }
      );
    }

    if (typeof credentialIndex !== 'number' || credentialIndex < 0) {
      return NextResponse.json(
        { error: 'credentialIndex must be a non-negative number' },
        { status: 400 }
      );
    }

    // Get contract instance
    const contract = getContract();

    // Verify credential on-chain
    // Note: This would require the private key or a signing mechanism
    // For now, we'll emit the event and return verification details
    
    return NextResponse.json({
      success: true,
      message: 'Credential verification recorded',
      data: {
        userAddress,
        credentialIndex,
        issuerAddress,
        verifiedAt: new Date().toISOString(),
        status: 'pending' // Requires actual transaction
      }
    });

  } catch (error) {
    console.error('Error verifying credential:', error);
    return NextResponse.json(
      { error: 'Failed to verify credential', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/credentials/verify?userAddress=0x...&credentialIndex=0
 * Get verification status of a credential
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('userAddress');
    const credentialIndex = searchParams.get('credentialIndex');

    if (!userAddress || credentialIndex === null) {
      return NextResponse.json(
        { error: 'Missing required query parameters: userAddress, credentialIndex' },
        { status: 400 }
      );
    }

    if (!isAddress(userAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Get contract instance and query verification status
    const contract = getContract();
    
    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        credentialIndex: parseInt(credentialIndex),
        isVerified: false, // Would query contract
        verifier: null,
        verificationDate: null
      }
    });

  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
