import { NextRequest, NextResponse } from 'next/server';
import { getUserCredentials } from '@/lib/talent-protocol';

/**
 * GET /api/talent/credentials/[handle]
 * Fetch credentials for a user
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

    const credentials = await getUserCredentials(handle);

    return NextResponse.json({ credentials }, { status: 200 });
  } catch (error) {
    console.error('Error in credentials API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
