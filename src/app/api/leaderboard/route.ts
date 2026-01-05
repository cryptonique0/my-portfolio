import { NextRequest, NextResponse } from 'next/server';
import { getContract } from '@/lib/contract';

interface LeaderboardEntry {
  rank: number;
  address: string;
  handle: string;
  reputation: number;
  reputationTier: string;
  achievementCount: number;
  credentialCount: number;
  verified: boolean;
  lastActive?: string;
}

/**
 * GET /api/leaderboard
 * Fetch top profiles by reputation
 * 
 * Query Parameters:
 * - limit: number (default: 50) - Number of entries to return
 * - page: number (default: 1) - Page number for pagination
 * - sortBy: 'reputation' | 'achievements' (default: 'reputation')
 * - minReputation: number (optional) - Filter by minimum reputation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const sortBy = (searchParams.get('sortBy') || 'reputation') as 'reputation' | 'achievements';
    const minReputation = searchParams.get('minReputation') ? parseInt(searchParams.get('minReputation')!) : 0;

    const offset = (page - 1) * limit;

    // Get contract instance
    const contract = getContract();

    // Note: This is a placeholder implementation
    // In production, you would query the contract or a backend database
    // For now, we'll return mock data structure
    
    const mockLeaderboard: LeaderboardEntry[] = [];
    
    // Mock implementation - replace with actual contract queries
    for (let i = 1; i <= limit; i++) {
      mockLeaderboard.push({
        rank: offset + i,
        address: `0x${'0'.repeat(40 - i.toString().length)}${i.toString().padStart(40, '0').slice(-40)}`,
        handle: `user_${offset + i}`,
        reputation: Math.max(0, 10000 - (offset + i - 1) * 100),
        reputationTier: getTierFromReputation(Math.max(0, 10000 - (offset + i - 1) * 100)),
        achievementCount: Math.floor(Math.random() * 20),
        credentialCount: Math.floor(Math.random() * 15),
        verified: Math.random() > 0.3,
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Sort based on criteria
    const sorted = mockLeaderboard.sort((a, b) => {
      if (sortBy === 'achievements') {
        return b.achievementCount - a.achievementCount;
      }
      return b.reputation - a.reputation;
    });

    // Filter by minimum reputation
    const filtered = sorted.filter(entry => entry.reputation >= minReputation);

    return NextResponse.json({
      success: true,
      data: filtered,
      pagination: {
        page,
        limit,
        total: filtered.length,
        hasNextPage: filtered.length === limit,
        hasPreviousPage: page > 1,
      },
      sortBy,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leaderboard/user/[address]
 * Get a specific user's rank and position
 */
export async function getUserRank(address: string): Promise<LeaderboardEntry | null> {
  try {
    if (!address || !address.startsWith('0x')) {
      return null;
    }

    // In production, query the contract for user's reputation and achievements
    // This is a mock implementation
    const reputation = Math.floor(Math.random() * 10000);
    
    return {
      rank: Math.floor(Math.random() * 1000),
      address,
      handle: 'user_' + address.slice(2, 6),
      reputation,
      reputationTier: getTierFromReputation(reputation),
      achievementCount: Math.floor(Math.random() * 20),
      credentialCount: Math.floor(Math.random() * 15),
      verified: Math.random() > 0.3,
      lastActive: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return null;
  }
}

/**
 * Determine reputation tier based on score
 */
function getTierFromReputation(reputation: number): string {
  if (reputation >= 9000) return 'Platinum';
  if (reputation >= 7000) return 'Gold';
  if (reputation >= 5000) return 'Silver';
  if (reputation >= 3000) return 'Bronze';
  return 'Bronze';
}
