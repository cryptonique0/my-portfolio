import { NextRequest, NextResponse } from 'next/server';
import { getTalentProfile } from '@/lib/talent-protocol';

/**
 * GET /api/talent/profile/[handle]
 * Fetch user profile from Talent Protocol
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle;

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    const profile = await getTalentProfile(handle);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error in talent profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
