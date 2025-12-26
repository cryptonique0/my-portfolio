import { NextRequest, NextResponse } from 'next/server';
import { uploadResumeToIPFS } from '@/lib/ipfs';

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

    // Validate required fields
    if (!body.address || !body.name) {
      return NextResponse.json(
        { error: 'Address and name are required' },
        { status: 400 }
      );
    }

    const ipfsHash = await uploadResumeToIPFS({
      ...body,
      timestamp: Date.now(),
    });

    return NextResponse.json(
      { ipfsHash, gateway: `https://gateway.pinata.cloud/ipfs/${ipfsHash}` },
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
