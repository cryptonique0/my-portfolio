import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/credentials/[address]
 * Fetch credentials for a specific user address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // TODO: Call smart contract to fetch credentials
    // This is a placeholder that returns mock data
    const mockCredentials = [
      {
        id: 0,
        type: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        issuedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        verificationCount: 2,
        proofUrl: 'https://aws.amazon.com/certification',
      },
      {
        id: 1,
        type: 'Senior Full Stack Developer',
        issuer: 'TechCorp Inc',
        issuedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: undefined,
        verified: false,
        verificationCount: 1,
        proofUrl: 'ipfs://QmExample',
      },
    ];

    return NextResponse.json(mockCredentials, { status: 200 });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}
