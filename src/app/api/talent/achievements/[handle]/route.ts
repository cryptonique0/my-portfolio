import { NextRequest, NextResponse } from 'next/server';
import { getUserAchievements } from '@/lib/talent-protocol';

/**
 * GET /api/talent/achievements/[handle]
 * Fetch achievements for a user
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

    const achievements = await getUserAchievements(handle);

    return NextResponse.json({ achievements }, { status: 200 });
  } catch (error) {
    console.error('Error in achievements API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
