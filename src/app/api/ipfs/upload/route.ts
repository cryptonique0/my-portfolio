import { NextRequest, NextResponse } from 'next/server';
import { uploadResumeToIPFS, validateResumeData } from '@/lib/ipfs';

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
 * Upload resume data to IPFS with Pinata pinning
 * 
 * Body: ResumeData
 * Returns: { ipfsHash, cid, size, pinned, gateway, timestamp }
 */
export async function POST(request: NextRequest) {
  try {
    const body: Partial<ResumeData> = await request.json();

    // Validate required fields
    if (!body.address || !body.name) {
      return NextResponse.json(
        { 
          error: 'Address and name are required',
          details: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    // Build complete resume data with defaults
    const resumeData: ResumeData = {
      address: body.address,
      name: body.name,
      bio: body.bio || '',
      skills: body.skills || [],
      experience: body.experience || [],
      education: body.education || [],
      projects: body.projects || [],
      timestamp: Date.now(),
    };

    // Validate structure
    if (!validateResumeData(resumeData)) {
      return NextResponse.json(
        { 
          error: 'Invalid resume data structure',
          details: 'Resume data does not match expected format'
        },
        { status: 400 }
      );
    }

    // Upload to IPFS with Pinata pinning
    const result = await uploadResumeToIPFS(resumeData);

    return NextResponse.json(
      { 
        success: true,
        ipfsHash: result.cid,
        cid: result.cid,
        size: result.size,
        pinned: result.pinned,
        gateway: result.gateway,
        timestamp: resumeData.timestamp,
        message: 'Resume uploaded and pinned to IPFS successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to upload to IPFS',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
