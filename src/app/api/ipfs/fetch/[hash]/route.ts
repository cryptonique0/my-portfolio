import { NextRequest, NextResponse } from 'next/server';
import { fetchResumeFromIPFS, getIPFSGatewayUrl } from '@/lib/ipfs';

/**
 * GET /api/ipfs/fetch/[hash]
 * Fetch resume data from IPFS using multiple gateways for reliability
 * 
 * Returns: Resume data JSON or error
 * Cache: 1 hour (3600 seconds)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash;

    // Validate hash parameter
    if (!hash || hash.length < 46) {
      return NextResponse.json(
        { 
          error: 'Invalid IPFS hash',
          details: 'Hash must be a valid CID'
        },
        { status: 400 }
      );
    }

    // Fetch from IPFS (tries multiple gateways)
    const data = await fetchResumeFromIPFS(hash);

    if (!data) {
      return NextResponse.json(
        { 
          error: 'Data not found on IPFS',
          details: 'Content could not be retrieved from any gateway',
          hash
        },
        { status: 404 }
      );
    }

    // Return data with caching headers
    return NextResponse.json(
      {
        success: true,
        data,
        ipfsHash: hash,
        gateway: getIPFSGatewayUrl(hash),
        cached: true
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch from IPFS',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
