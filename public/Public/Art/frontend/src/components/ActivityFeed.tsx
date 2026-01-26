import { FC, useState } from 'react';
import { getActivityFeed, ActivityEvent } from '../services/activity';
import { useInfiniteQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  filters?: {
    type?: string[];
    creatorAddress?: string;
    nftId?: string;
    timeRange?: TimeRange;
  };
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

type TimeRange = '24h' | '7d' | '30d' | 'all';

const ActivityTypeConfig = {
  mint: {
    icon: '✨',
    label: 'Mint',
    color: 'text-blue-600 bg-blue-50',
    action: 'minted'
  },
  sale: {
    icon: '💰',
    label: 'Sale',
    color: 'text-green-600 bg-green-50',
    action: 'sold'
  },
  bid: {
    icon: '🏷️',
    label: 'Bid',
    color: 'text-orange-600 bg-orange-50',
    action: 'bid on'
  },
  listing: {
    icon: '📋',
    label: 'Listing',
    color: 'text-purple-600 bg-purple-50',
    action: 'listed'
  },
  follow: {
    icon: '👤',
    label: 'Follow',
    color: 'text-pink-600 bg-pink-50',
    action: 'followed'
  },
  verification: {
    icon: '✅',
    label: 'Verification',
    color: 'text-amber-600 bg-amber-50',
    action: 'verified'
  }
};

const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const ActivityEventRow: FC<{ event: ActivityEvent }> = ({ event }) => {
  const config = ActivityTypeConfig[event.type as keyof typeof ActivityTypeConfig];
  if (!config) return null;

  const timestamp = new Date(event.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Icon */}
      <div className={`text-2xl`}>{config.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{formatAddress(event.actor)}</span>
          <span className="text-gray-600">{config.action}</span>
          {event.nftId && <span className="font-medium text-gray-900">NFT #{event.nftId}</span>}
          {event.amount && (
            <span className="text-gray-600">
              for <span className="font-semibold">{event.amount.toFixed(2)}</span> ETH
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-1">{timeAgo}</div>
      </div>

      {/* Badge */}
      <div className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${config.color}`}>
        {config.label}
      </div>
    </div>
  );
};

export const ActivityFeed: FC<ActivityFeedProps> = ({
  filters = {},
  limit = 20,
  showFilters = true,
  className = ''
}) => {
  const [typeFilter, setTypeFilter] = useState<string[]>(filters.type || []);
  const [timeRange, setTimeRange] = useState<TimeRange>(filters.timeRange || 'all');

  // Use infinite query for pagination
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error
  } = useInfiniteQuery({
    queryKey: ['activityFeed', typeFilter, filters.creatorAddress, filters.nftId],
    queryFn: ({ pageParam = 1 }) =>
      getActivityFeed({
        type: typeFilter.length > 0 ? typeFilter : undefined,
        creatorAddress: filters.creatorAddress,
        nftId: filters.nftId,
        limit,
        page: pageParam
      }),
    getNextPageParam: (lastPage: { page: number; total: number }) => {
      const nextPage = lastPage.page + 1;
      return nextPage * limit < lastPage.total ? nextPage : undefined;
    },
    initialPageParam: 1
  });

  const events = data?.pages.flatMap((page: { events: ActivityEvent[] }) => page.events) || [];

  const filteredEvents = events.filter((event: ActivityEvent) => {
    if (!timeRange || timeRange === 'all') return true;

    const now = Date.now();
    const ts = new Date(event.timestamp as any).getTime();
    const ranges: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      all: Infinity
    };

    const windowMs = ranges[timeRange] || Infinity;
    return now - ts <= windowMs;
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">Failed to load activity feed</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">No activity yet</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(ActivityTypeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => {
                setTypeFilter((current) =>
                  current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
                );
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                typeFilter.includes(type)
                  ? config.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.icon} {config.label}
            </button>
          ))}

          {/* Time filter */}
          <div className="flex items-center gap-2 ml-auto">
            {(['24h', '7d', '30d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {filteredEvents.map((event: ActivityEvent) => (
          <ActivityEventRow key={event.id} event={event} />
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="mt-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
