import { NextRequest, NextResponse } from 'next/server';
import { fetchResumeFromIPFS } from '@/lib/ipfs';

/**
 * GET /api/ipfs/fetch/[hash]
 * Fetch resume data from IPFS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash;

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash is required' },
        { status: 400 }
      );
    }

    const data = await fetchResumeFromIPFS(hash);

    if (!data) {
      return NextResponse.json(
        { error: 'Data not found on IPFS' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from IPFS' },
      { status: 500 }
    );
  }
}
