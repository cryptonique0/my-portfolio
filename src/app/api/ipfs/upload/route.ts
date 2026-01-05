import { NextRequest, NextResponse } from 'next/server';
import { uploadResume } from '@/lib/ipfs';

interface ResumeData {
  address: string;
  name: string;
  bio: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationDate: string;
    field: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    url?: string;
    technologies: string[];
    date: string;
  }>;
  timestamp: number;
}

/**
 * POST /api/ipfs/upload
 * Upload resume data to IPFS
 */
export async function POST(request: NextRequest) {
  try {
    const body: ResumeData = await request.json();
    const provider = request.nextUrl.searchParams.get('provider') as 'pinata' | 'nftstorage' | 'infura' | null;

    // Validate required fields
    if (!body.address || !body.name) {
      return NextResponse.json(
        { error: 'Address and name are required' },
        { status: 400 }
      );
    }

    const uploadResult = await uploadResume(
      {
        ...body,
        timestamp: Date.now(),
      },
      provider || 'pinata'
    );

    return NextResponse.json(
      {
        ipfsHash: uploadResult.hash,
        gateway: uploadResult.url,
        provider: uploadResult.provider,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 }
    );
  }
}
