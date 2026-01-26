/**
 * EventFeed Component
 * Real-time blockchain event feed with filtering and history
 */

import React, { useState, useEffect } from 'react';
import { useEventListener, useEventHistory } from '../hooks/useEventListener';

interface EventData {
  type: string;
  data: any;
  timestamp?: number;
}

export const EventFeed: React.FC = () => {
  const { isConnected, events, connect, disconnect, clearEvents } = useEventListener({
    autoConnect: true,
    onEvent: (event) => {
      console.log('New event received:', event);
    },
  });

  const { history, loading, fetchHistory } = useEventHistory();

  const [filter, setFilter] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory, fetchHistory]);

  const filteredEvents = filter === 'all'
    ? events
    : events.filter((e) => e.type === filter);

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      nft_minted: '🎨',
      nft_transferred: '↗️',
      nft_approved: '✅',
      item_listed: '🏷️',
      item_sold: '💰',
      auction_created: '🔨',
      bid_placed: '💵',
      auction_ended: '🏆',
    };
    return icons[type] || '📋';
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      nft_minted: 'bg-purple-100 text-purple-800',
      nft_transferred: 'bg-blue-100 text-blue-800',
      nft_approved: 'bg-green-100 text-green-800',
      item_listed: 'bg-yellow-100 text-yellow-800',
      item_sold: 'bg-emerald-100 text-emerald-800',
      auction_created: 'bg-orange-100 text-orange-800',
      bid_placed: 'bg-cyan-100 text-cyan-800',
      auction_ended: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderEventData = (event: EventData) => {
    switch (event.type) {
      case 'nft_minted':
        return (
          <div className="text-sm">
            <p>
              <span className="font-medium">Token ID:</span> {event.data.tokenId}
            </p>
            <p>
              <span className="font-medium">Minted to:</span>{' '}
              {formatAddress(event.data.to)}
            </p>
            {event.data.transactionHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${event.data.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                View on BaseScan →
              </a>
            )}
          </div>
        );

      case 'nft_transferred':
        return (
          <div className="text-sm">
            <p>
              <span className="font-medium">Token ID:</span> {event.data.tokenId}
            </p>
            <p>
              <span className="font-medium">From:</span> {formatAddress(event.data.from)}
            </p>
            <p>
              <span className="font-medium">To:</span> {formatAddress(event.data.to)}
            </p>
          </div>
        );

      case 'item_listed':
        return (
          <div className="text-sm">
            <p>
              <span className="font-medium">Token ID:</span> {event.data.tokenId}
            </p>
            <p>
              <span className="font-medium">Price:</span> {event.data.price} ETH
            </p>
            <p>
              <span className="font-medium">Seller:</span> {formatAddress(event.data.seller)}
            </p>
          </div>
        );

      case 'item_sold':
        return (
          <div className="text-sm">
            <p>
              <span className="font-medium">Token ID:</span> {event.data.tokenId}
            </p>
            <p>
              <span className="font-medium">Price:</span> {event.data.price} ETH
            </p>
            <p>
              <span className="font-medium">Buyer:</span> {formatAddress(event.data.buyer)}
            </p>
          </div>
        );

      case 'bid_placed':
        return (
          <div className="text-sm">
            <p>
              <span className="font-medium">Auction ID:</span> {event.data.auctionId}
            </p>
            <p>
              <span className="font-medium">Bid Amount:</span> {event.data.amount} ETH
            </p>
            <p>
              <span className="font-medium">Bidder:</span> {formatAddress(event.data.bidder)}
            </p>
          </div>
        );

      case 'auction_ended':
        return (
          <div className="text-sm">
            <p>
              <span className="font-medium">Auction ID:</span> {event.data.auctionId}
            </p>
            <p>
              <span className="font-medium">Winner:</span> {formatAddress(event.data.winner)}
            </p>
            <p>
              <span className="font-medium">Final Bid:</span> {event.data.amount} ETH
            </p>
          </div>
        );

      default:
        return <pre className="text-xs">{JSON.stringify(event.data, null, 2)}</pre>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Live Event Feed</h1>
          <p className="text-gray-600 mt-1">
            Real-time blockchain events from smart contracts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`}
            />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {isConnected ? (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connect}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowHistory(false)}
          className={`px-4 py-2 rounded-lg font-medium ${
            !showHistory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Live Events
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`px-4 py-2 rounded-lg font-medium ${
            showHistory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Event History
        </button>
      </div>

      {/* Filters */}
      {!showHistory && (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium">Filter:</span>
          <div className="flex flex-wrap gap-2">
            {[
              'all',
              'nft_minted',
              'nft_transferred',
              'item_listed',
              'item_sold',
              'bid_placed',
              'auction_ended',
            ].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All Events' : formatEventType(type)}
              </button>
            ))}
          </div>
          {events.length > 0 && (
            <button
              onClick={clearEvents}
              className="ml-auto px-3 py-1 text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Live Events */}
      {!showHistory && (
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {isConnected
                  ? 'Waiting for blockchain events...'
                  : 'Connect to see live events'}
              </p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={`${event.type}-${event.timestamp}-${index}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getEventIcon(event.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(
                          event.type
                        )}`}
                      >
                        {formatEventType(event.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    {renderEventData(event)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Event History */}
      {showHistory && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="text-gray-500 mt-4">Loading event history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No events found in history</p>
            </div>
          ) : (
            history.map((event, index) => (
              <div
                key={`${event.transaction_hash}-${index}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getEventIcon(event.event_type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(
                          event.event_type
                        )}`}
                      >
                        {formatEventType(event.event_type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Block:</span> {event.block_number}
                      </p>
                      <p>
                        <span className="font-medium">Contract:</span>{' '}
                        {formatAddress(event.contract_address)}
                      </p>
                      <a
                        href={`https://sepolia.basescan.org/tx/${event.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs inline-block"
                      >
                        View on BaseScan →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
