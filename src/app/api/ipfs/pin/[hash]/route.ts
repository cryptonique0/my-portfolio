import { NextRequest, NextResponse } from 'next/server';
import { isPinned, unpinFromIPFS, getPinnedContent } from '@/lib/ipfs';

/**
 * GET /api/ipfs/pin/[hash]
 * Check if content is pinned on Pinata
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash;

    if (!hash || hash.length < 46) {
      return NextResponse.json(
        { 
          error: 'Invalid IPFS hash',
          details: 'Hash must be a valid CID'
        },
        { status: 400 }
      );
    }

    const pinned = await isPinned(hash);

    return NextResponse.json(
      {
        success: true,
        ipfsHash: hash,
        pinned,
        message: pinned ? 'Content is pinned' : 'Content is not pinned'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking pin status:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to check pin status',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ipfs/pin/[hash]
 * Unpin content from Pinata
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash;

    if (!hash || hash.length < 46) {
      return NextResponse.json(
        { 
          error: 'Invalid IPFS hash',
          details: 'Hash must be a valid CID'
        },
        { status: 400 }
      );
    }

    const success = await unpinFromIPFS(hash);

    if (!success) {
      return NextResponse.json(
        { 
          error: 'Failed to unpin content',
          details: 'Content may not be pinned or credentials are invalid'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        ipfsHash: hash,
        message: 'Content unpinned successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unpinning content:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to unpin content',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
