import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';

/**
 * Badge API Routes - Listing and Queries
 * GET /api/badges/all - List all available badges
 * GET /api/badges/user/[address] - Get user's badges
 */

// Mock badge data - replace with contract queries
const MOCK_BADGES = [
  {
    id: 0,
    name: 'Verified Professional',
    description: 'First resume verified on-chain',
    imageURI: 'ipfs://QmVerifiedProfessional',
    requiredReputation: 0,
    currentSupply: 150,
    maxSupply: 1000,
    isActive: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
  },
  {
    id: 1,
    name: 'Rising Star',
    description: 'Reputation score above 1000',
    imageURI: 'ipfs://QmRisingStar',
    requiredReputation: 1000,
    currentSupply: 45,
    maxSupply: 500,
    isActive: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 20,
  },
  {
    id: 2,
    name: 'Expert Level',
    description: 'Reputation score above 5000',
    imageURI: 'ipfs://QmExpertLevel',
    requiredReputation: 5000,
    currentSupply: 8,
    maxSupply: 100,
    isActive: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
  },
  {
    id: 3,
    name: 'Hall of Fame',
    description: 'Reputation score above 10000',
    imageURI: 'ipfs://QmHallOfFame',
    requiredReputation: 10000,
    currentSupply: 1,
    maxSupply: 50,
    isActive: true,
    createdAt: Math.floor(Date.now() / 1000),
  },
];

/**
 * GET /api/badges/all
 * Returns all available badge types
 */
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Route: /api/badges/all
  if (pathname === '/api/badges/all') {
    try {
      // TODO: Query AchievementBadges contract for all badges
      // const badges = await badgeContract.getTotalBadgeTypes();
      // const badgeArray = [];
      // for (let i = 0; i < badges; i++) {
      //   const metadata = await badgeContract.getBadgeMetadata(i);
      //   badgeArray.push(metadata);
      // }

      return NextResponse.json(MOCK_BADGES);
    } catch (error) {
      console.error('Error fetching badges:', error);
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      );
    }
  }

  // Route: /api/badges/user/[address]
  if (pathname.includes('/api/badges/user/')) {
    const address = pathname.split('/api/badges/user/')[1];

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    try {
      // TODO: Query AchievementBadges contract for user badges
      // const userBadges = await badgeContract.getUserBadges(address);
      // const badgeArray = [];
      // for (const badgeId of userBadges) {
      //   const metadata = await badgeContract.getBadgeMetadata(badgeId);
      //   const quantity = await badgeContract.balanceOf(address, badgeId);
      //   badgeArray.push({ ...metadata, owned: true, quantity });
      // }

      // Mock response: return badges with earned flag based on reputation
      const userReputation = Math.floor(Math.random() * 15000); // Mock reputation
      const userBadges = MOCK_BADGES
        .filter((badge) => userReputation >= badge.requiredReputation)
        .map((badge) => ({
          ...badge,
          owned: true,
          quantity: 1,
        }));

      return NextResponse.json(userBadges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user badges' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * Security Considerations:
 * - Cache badge metadata with reasonable TTL (5-15 minutes)
 * - Rate limit badge queries per IP address
 * - Validate address format before contract queries
 * - Implement fallback responses for contract failures
 * - Consider batch queries for multiple user lookups
 * - Sanitize user input to prevent injection attacks
 */
