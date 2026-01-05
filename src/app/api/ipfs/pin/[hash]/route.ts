import { NextRequest, NextResponse } from 'next/server';
import { checkPinStatus, unpinFromPinata } from '@/lib/ipfs';

/**
 * GET /api/ipfs/pin/[hash]
 * Check pin status of an IPFS hash
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash;

    if (!hash || hash.length < 10) {
      return NextResponse.json(
        { error: 'Valid IPFS hash is required' },
        { status: 400 }
      );
    }

    const status = await checkPinStatus(hash);

    return NextResponse.json(
      {
        hash,
        ...status,
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error checking pin status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check pin status',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ipfs/pin/[hash]
 * Unpin content from Pinata
 * Note: This should be protected with authentication in production
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash;

    if (!hash || hash.length < 10) {
      return NextResponse.json(
        { error: 'Valid IPFS hash is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check here
    // For now, this is a simple demonstration
    
    const success = await unpinFromPinata(hash);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to unpin content' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        hash,
        message: 'Content unpinned successfully',
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error unpinning from Pinata:', error);
    return NextResponse.json(
      { 
        error: 'Failed to unpin from Pinata',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
