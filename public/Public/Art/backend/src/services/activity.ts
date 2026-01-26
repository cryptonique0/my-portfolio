/**
 * Activity Feed Service
 * Manages global marketplace activity (mints, sales, bids, follows)
 */

export interface ActivityEvent {
  id: string;
  type: 'mint' | 'sale' | 'bid' | 'listing' | 'follow' | 'verification';
  actor: string;
  target?: string;
  nftId?: string;
  contractAddress?: string;
  amount?: number;
  timestamp: Date;
  txHash?: string;
  details: Record<string, any>;
}

export interface MintEvent extends ActivityEvent {
  type: 'mint';
  nftId: string;
  nftName: string;
  contractAddress: string;
  details: {
    creator: string;
    tokenId: number;
    metadata: Record<string, any>;
  };
}

export interface SaleEvent extends ActivityEvent {
  type: 'sale';
  nftId: string;
  contractAddress: string;
  amount: number;
  details: {
    seller: string;
    buyer: string;
    price: number;
    royaltyFee?: number;
    platformFee?: number;
  };
}

export interface BidEvent extends ActivityEvent {
  type: 'bid';
  nftId: string;
  contractAddress: string;
  amount: number;
  details: {
    bidder: string;
    previousBid?: number;
    auctionId: string;
  };
}

export interface ListingEvent extends ActivityEvent {
  type: 'listing';
  nftId: string;
  contractAddress: string;
  amount: number;
  details: {
    seller: string;
    price: number;
    duration?: number;
  };
}

export interface FollowEvent extends ActivityEvent {
  type: 'follow';
  details: {
    follower: string;
    following: string;
  };
}

export interface VerificationEvent extends ActivityEvent {
  type: 'verification';
  details: {
    creator: string;
    verificationLevel: string;
    badge: string;
  };
}

/**
 * Get global activity feed
 */
export async function getActivityFeed(
  filters?: {
    type?: ActivityEvent['type'][];
    creatorAddress?: string;
    nftId?: string;
    limit?: number;
    page?: number;
  }
): Promise<{
  events: ActivityEvent[];
  total: number;
  page: number;
}> {
  const limit = filters?.limit || 20;
  const page = filters?.page || 1;

  // Mock activity events (generate extra to allow filtering)
  const events: ActivityEvent[] = [];
  const eventTypes: ActivityEvent['type'][] = ['mint', 'sale', 'bid', 'listing', 'follow', 'verification'];

  for (let i = 0; i < limit * 2; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    let event: ActivityEvent = {
      id: `event_${i}`,
      type,
      actor: `0x${Math.random().toString(16).slice(2)}`,
      timestamp,
      details: {}
    };

    if (type === 'sale') {
      event = {
        ...event,
        type: 'sale',
        nftId: `nft_${Math.floor(Math.random() * 1000)}`,
        contractAddress: `0x${Math.random().toString(16).slice(2)}`,
        amount: Math.random() * 100,
        details: {
          seller: `0x${Math.random().toString(16).slice(2)}`,
          buyer: event.actor,
          price: Math.random() * 100,
          royaltyFee: Math.random() * 5,
          platformFee: 2.5
        }
      };
    } else if (type === 'mint') {
      event = {
        ...event,
        type: 'mint',
        nftId: `nft_${Math.floor(Math.random() * 1000)}`,
        contractAddress: `0x${Math.random().toString(16).slice(2)}`,
        details: {
          creator: event.actor,
          tokenId: Math.floor(Math.random() * 10000),
          metadata: {
            name: `NFT #${Math.floor(Math.random() * 10000)}`,
            description: 'New NFT creation'
          }
        }
      };
    } else if (type === 'bid') {
      event = {
        ...event,
        type: 'bid',
        nftId: `nft_${Math.floor(Math.random() * 1000)}`,
        contractAddress: `0x${Math.random().toString(16).slice(2)}`,
        amount: Math.random() * 50,
        details: {
          bidder: event.actor,
          previousBid: Math.random() * 40,
          auctionId: `auction_${Math.floor(Math.random() * 100)}`
        }
      };
    } else if (type === 'follow') {
      event = {
        ...event,
        type: 'follow',
        target: `0x${Math.random().toString(16).slice(2)}`,
        details: {
          follower: event.actor,
          following: `0x${Math.random().toString(16).slice(2)}`
        }
      };
    }

    const matchesType = !filters?.type || filters.type.includes(event.type);
    const matchesCreator = !filters?.creatorAddress || event.actor === filters.creatorAddress || event.target === filters.creatorAddress || event.details?.creator === filters.creatorAddress;
    const matchesNft = !filters?.nftId || event.nftId === filters.nftId;

    if (matchesType && matchesCreator && matchesNft) {
      events.push(event);
    }
  }

  return {
    events: events.slice(0, limit),
    total: Math.floor(Math.random() * 10000),
    page
  };
}

/**
 * Get activity for specific creator
 */
export async function getCreatorActivity(
  creatorAddress: string,
  limit: number = 50
): Promise<ActivityEvent[]> {
  if (!creatorAddress) {
    throw new Error('Creator address is required');
  }

  return getActivityFeed({
    creatorAddress,
    limit
  }).then(res => res.events);
}

/**
 * Get activity for specific NFT
 */
export async function getNFTActivity(
  nftId: string,
  contractAddress: string,
  limit: number = 50
): Promise<ActivityEvent[]> {
  if (!nftId || !contractAddress) {
    throw new Error('NFT ID and contract address are required');
  }

  return getActivityFeed({
    nftId,
    limit
  }).then(res => res.events);
}

/**
 * Get recent sales activity
 */
export async function getRecentSales(limit: number = 20): Promise<SaleEvent[]> {
  const feed = await getActivityFeed({
    type: ['sale'],
    limit
  });

  return feed.events as SaleEvent[];
}

/**
 * Get recent mints activity
 */
export async function getRecentMints(limit: number = 20): Promise<MintEvent[]> {
  const feed = await getActivityFeed({
    type: ['mint'],
    limit
  });

  return feed.events as MintEvent[];
}

/**
 * Get trending NFTs by activity
 */
export async function getTrendingByActivity(limit: number = 20): Promise<{
  nftId: string;
  contractAddress: string;
  activityCount: number;
  recentPrice?: number;
  floorPrice?: number;
}[]> {
  const feed = await getActivityFeed({ limit: 100 });

  const nftActivityMap = new Map<string, number>();

  feed.events.forEach(event => {
    if (event.nftId) {
      const key = `${event.nftId}_${event.contractAddress}`;
      nftActivityMap.set(key, (nftActivityMap.get(key) || 0) + 1);
    }
  });

  return Array.from(nftActivityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => {
      const [nftId, contractAddress] = key.split('_');
      return {
        nftId,
        contractAddress,
        activityCount: count,
        recentPrice: Math.random() * 100,
        floorPrice: Math.random() * 50
      };
    });
}

/**
 * Track activity event
 */
export async function trackActivity(event: Omit<ActivityEvent, 'id'>): Promise<string> {
  if (!event.type || !event.actor) {
    throw new Error('Activity type and actor are required');
  }

  const eventId = `event_${Date.now()}`;
  // In production, would save to database
  return eventId;
}

/**
 * Get activity statistics
 */
export async function getActivityStats(): Promise<{
  totalMints: number;
  totalSales: number;
  totalBids: number;
  totalListings: number;
  totalFollows: number;
  recentActivity: number;
  averagePrice: number;
  totalVolume: number;
}> {
  const feed = await getActivityFeed({ limit: 1000 });

  const stats = {
    totalMints: 0,
    totalSales: 0,
    totalBids: 0,
    totalListings: 0,
    totalFollows: 0,
    recentActivity: feed.events.length,
    averagePrice: 0,
    totalVolume: 0
  };

  let volumeCount = 0;

  feed.events.forEach(event => {
    switch (event.type) {
      case 'mint':
        stats.totalMints++;
        break;
      case 'sale':
        stats.totalSales++;
        if (event.amount) {
          stats.totalVolume += event.amount;
          volumeCount++;
        }
        break;
      case 'bid':
        stats.totalBids++;
        break;
      case 'listing':
        stats.totalListings++;
        break;
      case 'follow':
        stats.totalFollows++;
        break;
    }
  });

  stats.averagePrice = volumeCount > 0 ? stats.totalVolume / volumeCount : 0;

  return stats;
}
