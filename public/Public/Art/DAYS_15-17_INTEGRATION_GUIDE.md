# Days 15-17 Integration Guide

This guide shows how to integrate the new verification, follows, and activity features into existing pages.

## 1. CreatorProfilePage Integration

### Add Verification Badge and Follow Button

```tsx
import { VerificationBadge } from '../components/VerificationBadge';
import { FollowButton } from '../components/FollowButton';
import { FollowerStats } from '../components/FollowerStats';
import { useWallet } from '../hooks/useWallet';

export function CreatorProfilePage() {
  const { address: userAddress } = useWallet();
  const creatorAddress = useParams().address;

  return (
    <div className="creator-profile">
      {/* Header with Verification Badge */}
      <div className="flex items-center gap-4">
        <h1>{creatorName}</h1>
        <VerificationBadge address={creatorAddress} size="lg" />
      </div>

      {/* Follow Stats and Button */}
      <div className="flex gap-8">
        <FollowerStats address={creatorAddress} showFollowing showRecent />
        {userAddress && userAddress !== creatorAddress && (
          <FollowButton 
            followerAddress={userAddress}
            creatorAddress={creatorAddress}
          />
        )}
      </div>

      {/* Creator Activity Feed */}
      <ActivityFeed
        filters={{ creatorAddress }}
        limit={20}
        showFilters
      />
    </div>
  );
}
```

## 2. MarketplaceAnalytics Integration

### Add Top Creators and Activity Stats

```tsx
import { getTopCreators } from '../services/follows';
import { getActivityStats } from '../services/activity';
import { useQuery } from '@tanstack/react-query';
import { VerificationBadge } from '../components/VerificationBadge';

export function MarketplaceAnalytics() {
  const { data: topCreators } = useQuery({
    queryKey: ['topCreators'],
    queryFn: () => getTopCreators(10)
  });

  const { data: stats } = useQuery({
    queryKey: ['activityStats'],
    queryFn: () => getActivityStats()
  });

  return (
    <div className="analytics">
      {/* Activity Stats */}
      <div className="stats-grid">
        <StatCard label="Total Mints" value={stats?.totalMints} />
        <StatCard label="Total Sales" value={stats?.totalSales} />
        <StatCard label="Total Volume" value={stats?.totalVolume} />
        <StatCard label="Avg Price" value={stats?.averagePrice} />
      </div>

      {/* Top Creators */}
      <div className="top-creators">
        <h2>Top Creators by Followers</h2>
        <div className="creator-list">
          {topCreators?.map((creator) => (
            <div key={creator.address} className="creator-item">
              <VerificationBadge address={creator.address} />
              <span>{creator.followerCount} followers</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 3. DiscoveryPage Integration

### Add Verified Filter and Activity-Based Sorting

```tsx
import { getVerifiedCreators } from '../services/verification';
import { getTrendingByActivity } from '../services/activity';
import { useState } from 'react';

export function DiscoveryPage() {
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const { data: verifiedCreators } = useQuery({
    queryKey: ['verifiedCreators'],
    queryFn: () => getVerifiedCreators(50),
    enabled: showVerifiedOnly
  });

  const { data: trending } = useQuery({
    queryKey: ['trendingByActivity'],
    queryFn: () => getTrendingByActivity(20)
  });

  return (
    <div className="discovery">
      {/* Filters */}
      <div className="filters">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={showVerifiedOnly}
            onChange={(e) => setShowVerifiedOnly(e.target.checked)}
          />
          Show Verified Creators Only
        </label>
      </div>

      {/* Trending Section */}
      <div className="trending">
        <h2>Trending by Activity</h2>
        <div className="nft-grid">
          {trending?.map((nft) => (
            <div key={nft.nftId} className="nft-card">
              <span className="activity-count">
                {nft.activityCount} activities
              </span>
              <span className="price">{nft.recentPrice?.toFixed(2)} ETH</span>
            </div>
          ))}
        </div>
      </div>

      {/* Creator List if Verified Filter */}
      {showVerifiedOnly && (
        <div className="creators">
          <h2>Verified Creators</h2>
          {/* List verified creators */}
        </div>
      )}
    </div>
  );
}
```

## 4. NFTDetailPage Integration

### Add NFT Activity History and Creator Info

```tsx
import { getNFTActivity } from '../services/activity';
import { getVerificationStatus } from '../services/verification';
import { FollowButton } from '../components/FollowButton';
import { VerificationBadge } from '../components/VerificationBadge';

export function NFTDetailPage() {
  const nftId = useParams().id;
  const { address: userAddress } = useWallet();

  const { data: activity } = useQuery({
    queryKey: ['nftActivity', nftId],
    queryFn: () => getNFTActivity(nftId, contractAddress)
  });

  return (
    <div className="nft-detail">
      {/* Creator Info with Verification */}
      <div className="creator-info">
        <div className="creator-header">
          <h3>{creatorName}</h3>
          <VerificationBadge address={creatorAddress} size="sm" />
        </div>
        <FollowButton 
          followerAddress={userAddress}
          creatorAddress={creatorAddress}
        />
      </div>

      {/* Activity History */}
      <div className="activity-section">
        <h3>NFT Activity History</h3>
        <ActivityFeed
          filters={{ nftId }}
          limit={10}
          showFilters={false}
        />
      </div>
    </div>
  );
}
```

## 5. Header Integration

### Add Notifications and Quick Stats

```tsx
import { getFollowNotifications } from '../services/follows';
import { useQuery } from '@tanstack/react-query';

export function Header() {
  const { address } = useWallet();

  const { data: notifications } = useQuery({
    queryKey: ['followNotifications', address],
    queryFn: () => getFollowNotifications(address || '', 10),
    enabled: !!address,
    refetchInterval: 30000 // Refresh every 30s
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="header">
      {/* Existing header content */}
      
      {/* Notifications Badge */}
      {unreadCount > 0 && (
        <div className="notification-badge">
          {unreadCount}
        </div>
      )}
    </header>
  );
}
```

## 6. HomePage Integration

### Add Global Activity Feed and Top Creators

```tsx
import { ActivityFeed } from '../components/ActivityFeed';
import { getTopCreators } from '../services/follows';
import { useQuery } from '@tanstack/react-query';
import { VerificationBadge } from '../components/VerificationBadge';

export function HomePage() {
  const { data: topCreators } = useQuery({
    queryKey: ['topCreatorsHome'],
    queryFn: () => getTopCreators(5)
  });

  return (
    <div className="home">
      {/* Existing home content */}

      {/* Top Creators Section */}
      <section className="top-creators">
        <h2>Top Creators</h2>
        <div className="creator-cards">
          {topCreators?.map((creator) => (
            <div key={creator.address} className="creator-card">
              <VerificationBadge address={creator.address} showLabel={false} />
              <p>{creator.followerCount} followers</p>
            </div>
          ))}
        </div>
      </section>

      {/* Global Activity Feed */}
      <section className="activity-section">
        <h2>Marketplace Activity</h2>
        <ActivityFeed limit={20} showFilters />
      </section>
    </div>
  );
}
```

## 7. User Profile Integration

### Show User's Followers and Following

```tsx
import { useQuery } from '@tanstack/react-query';
import { getFollowers, getFollowing } from '../services/follows';

export function UserProfile() {
  const { address } = useWallet();

  const { data: followers } = useQuery({
    queryKey: ['myFollowers', address],
    queryFn: () => getFollowers(address || ''),
    enabled: !!address
  });

  const { data: following } = useQuery({
    queryKey: ['myFollowing', address],
    queryFn: () => getFollowing(address || ''),
    enabled: !!address
  });

  return (
    <div className="profile">
      {/* Tabs for followers/following */}
      <div className="followers-section">
        <h3>My Followers ({followers?.total})</h3>
        <div className="follower-list">
          {followers?.followers.map((addr) => (
            <div key={addr} className="follower-item">
              <VerificationBadge address={addr} size="sm" />
              <span>{addr}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="following-section">
        <h3>Following ({following?.total})</h3>
        <div className="following-list">
          {following?.following.map((addr) => (
            <div key={addr} className="following-item">
              <VerificationBadge address={addr} size="sm" />
              <span>{addr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Integration Checklist

- [ ] Update CreatorProfilePage with verification badge
- [ ] Add FollowButton to CreatorProfilePage
- [ ] Add FollowerStats to CreatorProfilePage
- [ ] Add ActivityFeed to CreatorProfilePage
- [ ] Update MarketplaceAnalytics with activity stats
- [ ] Add top creators section to MarketplaceAnalytics
- [ ] Update DiscoveryPage with verified filter
- [ ] Add trending section to DiscoveryPage
- [ ] Add activity history to NFTDetailPage
- [ ] Add follow button to NFTDetailPage creator info
- [ ] Update Header with notification badge
- [ ] Add top creators to HomePage
- [ ] Add global activity feed to HomePage
- [ ] Update user profile with followers/following
- [ ] Test all features end-to-end
- [ ] Deploy to production

## API Query Keys

Use these query keys to ensure proper cache invalidation:

```typescript
// Verification
['verification', address]
['verifiedCreators']
['verificationRequirements', address]

// Follows
['isFollowing', follower, following]
['followerCount', address]
['creatorStats', address]
['followers', address, page]
['following', address, page]
['topCreators']
['followNotifications', address]

// Activity
['activityFeed', type, creator, nft, page]
['creatorActivity', address]
['nftActivity', nftId, contract]
['trendingByActivity']
['activityStats']
```

## Testing Recommendations

1. **Verification Testing**
   - Test badge display for different verification levels
   - Test admin approval/rejection flows
   - Test requirement checking

2. **Follows Testing**
   - Test follow/unfollow with optimistic updates
   - Test follower count accuracy
   - Test notification system
   - Test mutual follows detection

3. **Activity Testing**
   - Test activity feed infinite scroll
   - Test activity filtering
   - Test creator-specific activity
   - Test trending calculation
   - Test time formatting

4. **Integration Testing**
   - Test verification badge display in profiles
   - Test follow button in different contexts
   - Test activity feed in all pages
   - Test stats updates after follows
   - Test notification refresh
