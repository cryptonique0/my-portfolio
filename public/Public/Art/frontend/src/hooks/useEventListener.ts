/**
 * useEventListener Hook
 * Real-time blockchain event subscription via Socket.IO
 */

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface EventData {
  type: string;
  data: any;
  timestamp?: number;
}

interface EventHistory {
  event_type: string;
  contract_address: string;
  transaction_hash: string;
  block_number: number;
  event_data: any;
  created_at: string;
}

interface UseEventListenerOptions {
  autoConnect?: boolean;
  onEvent?: (event: EventData) => void;
  onError?: (error: Error) => void;
}

export const useEventListener = (options: UseEventListenerOptions = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);

  const { autoConnect = true, onEvent, onError } = options;

  /**
   * Connect to Socket.IO server
   */
  const connect = useCallback(() => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('blockchain_event', (event: EventData) => {
      console.log('Received blockchain event:', event);
      setEvents((prev) => [{ ...event, timestamp: Date.now() }, ...prev].slice(0, 100));
      onEvent?.(event);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      onError?.(error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [onEvent, onError]);

  /**
   * Disconnect from Socket.IO server
   */
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  /**
   * Subscribe to specific event type
   */
  const subscribe = useCallback(
    async (eventType: string, options?: {
      contractAddress?: string;
      nftId?: string;
      auctionId?: string;
    }) => {
      if (!socket) {
        throw new Error('Socket not connected');
      }

      return new Promise<void>((resolve, reject) => {
        socket.emit('subscribe', {
          userId: 'current-user', // TODO: Get from auth context
          eventType,
          ...options,
        });

        socket.once('subscribed', (data) => {
          console.log('Subscribed to:', data.eventType);
          resolve();
        });

        setTimeout(() => reject(new Error('Subscription timeout')), 5000);
      });
    },
    [socket]
  );

  /**
   * Unsubscribe from event type
   */
  const unsubscribe = useCallback(
    async (eventType: string) => {
      if (!socket) {
        throw new Error('Socket not connected');
      }

      return new Promise<void>((resolve, reject) => {
        socket.emit('unsubscribe', {
          userId: 'current-user',
          eventType,
        });

        socket.once('unsubscribed', (data) => {
          console.log('Unsubscribed from:', data.eventType);
          resolve();
        });

        setTimeout(() => reject(new Error('Unsubscription timeout')), 5000);
      });
    },
    [socket]
  );

  /**
   * Clear all stored events
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      const cleanup = connect();
      return cleanup;
    }
  }, [autoConnect, connect]);

  return {
    socket,
    isConnected,
    events,
    loading,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    clearEvents,
  };
};

/**
 * Hook to fetch event history from API
 */
export const useEventHistory = () => {
  const [history, setHistory] = useState<EventHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (filters?: {
    eventType?: string;
    contractAddress?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.eventType) params.append('eventType', filters.eventType);
      if (filters?.contractAddress) params.append('contractAddress', filters.contractAddress);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/events/history?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event history');
      }

      const data = await response.json();
      setHistory(data.events);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch event history';
      setError(message);
      console.error('Error fetching event history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    history,
    loading,
    error,
    fetchHistory,
  };
};

/**
 * Hook to listen to specific NFT events
 */
export const useNFTEvents = (contractAddress?: string) => {
  const { isConnected, subscribe, unsubscribe, events } = useEventListener({
    autoConnect: true,
  });

  const [nftEvents, setNftEvents] = useState<EventData[]>([]);

  useEffect(() => {
    if (isConnected && contractAddress) {
      // Subscribe to NFT-related events
      subscribe('nft_minted', { contractAddress });
      subscribe('nft_transferred', { contractAddress });
      subscribe('nft_approved', { contractAddress });

      return () => {
        unsubscribe('nft_minted');
        unsubscribe('nft_transferred');
        unsubscribe('nft_approved');
      };
    }
  }, [isConnected, contractAddress, subscribe, unsubscribe]);

  useEffect(() => {
    // Filter events for NFT-related types
    const filtered = events.filter((e) =>
      ['nft_minted', 'nft_transferred', 'nft_approved'].includes(e.type)
    );
    setNftEvents(filtered);
  }, [events]);

  return {
    nftEvents,
    isConnected,
  };
};

/**
 * Hook to listen to auction events
 */
export const useAuctionEvents = (auctionId?: string) => {
  const { isConnected, subscribe, unsubscribe, events } = useEventListener({
    autoConnect: true,
  });

  const [auctionEvents, setAuctionEvents] = useState<EventData[]>([]);

  useEffect(() => {
    if (isConnected) {
      // Subscribe to auction-related events
      subscribe('auction_created');
      subscribe('bid_placed', auctionId ? { auctionId } : undefined);
      subscribe('auction_ended');

      return () => {
        unsubscribe('auction_created');
        unsubscribe('bid_placed');
        unsubscribe('auction_ended');
      };
    }
  }, [isConnected, auctionId, subscribe, unsubscribe]);

  useEffect(() => {
    // Filter events for auction-related types
    const filtered = events.filter((e) =>
      ['auction_created', 'bid_placed', 'auction_ended'].includes(e.type)
    );
    setAuctionEvents(filtered);
  }, [events]);

  return {
    auctionEvents,
    isConnected,
  };
};

/**
 * Hook to listen to marketplace events
 */
export const useMarketplaceEvents = () => {
  const { isConnected, subscribe, unsubscribe, events } = useEventListener({
    autoConnect: true,
  });

  const [marketplaceEvents, setMarketplaceEvents] = useState<EventData[]>([]);

  useEffect(() => {
    if (isConnected) {
      // Subscribe to marketplace-related events
      subscribe('item_listed');
      subscribe('item_sold');

      return () => {
        unsubscribe('item_listed');
        unsubscribe('item_sold');
      };
    }
  }, [isConnected, subscribe, unsubscribe]);

  useEffect(() => {
    // Filter events for marketplace-related types
    const filtered = events.filter((e) =>
      ['item_listed', 'item_sold'].includes(e.type)
    );
    setMarketplaceEvents(filtered);
  }, [events]);

  return {
    marketplaceEvents,
    isConnected,
  };
};
