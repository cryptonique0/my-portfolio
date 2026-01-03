import { NextRequest, NextResponse } from 'next/server';
import { getPinnedContent } from '@/lib/ipfs';

/**
 * GET /api/ipfs/pin/list/[address]
 * Get all pinned content for a specific address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;

    // Validate address format (basic check)
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { 
          error: 'Invalid address format',
          details: 'Address must be a valid Ethereum address'
        },
        { status: 400 }
      );
    }

    const pinnedHashes = await getPinnedContent(address);

    return NextResponse.json(
      {
        success: true,
        address,
        count: pinnedHashes.length,
        ipfsHashes: pinnedHashes,
        message: `Found ${pinnedHashes.length} pinned resume(s)`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching pinned content:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch pinned content',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
