import React, { useEffect, useState } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  channel?: string;
  timestamp?: string;
}

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    autoConnect = true,
    reconnect = true,
    reconnectInterval = 5000,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout>();

  const connect = React.useCallback(() => {
    try {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        setIsConnected(true);
        setWs(socket);
        onConnect?.();
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        setWs(null);
        onDisconnect?.();

        // Auto reconnect
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      setWs(socket);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, reconnect, reconnectInterval, onConnect, onMessage, onDisconnect, onError]);

  const disconnect = React.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    ws?.close();
  }, [ws]);

  const send = React.useCallback(
    (data: any) => {
      if (ws && isConnected) {
        ws.send(JSON.stringify(data));
      } else {
        console.warn('WebSocket not connected');
      }
    },
    [ws, isConnected]
  );

  const subscribe = React.useCallback(
    (channel: string) => {
      send({ type: 'subscribe', channel });
    },
    [send]
  );

  const unsubscribe = React.useCallback(
    (channel: string) => {
      send({ type: 'unsubscribe', channel });
    },
    [send]
  );

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    send,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  };
}

/**
 * Hook for marketplace WebSocket notifications
 */
export function useMarketplaceWebSocket() {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

  const [newListings, setNewListings] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [activeBids, setActiveBids] = useState<any[]>([]);

  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    url: wsUrl,
    onMessage: (message) => {
      switch (message.type) {
        case 'new_listing':
          setNewListings((prev) => [message.data, ...prev].slice(0, 10));
          break;
        case 'sale':
          setRecentSales((prev) => [message.data, ...prev].slice(0, 10));
          break;
        case 'new_bid':
          setActiveBids((prev) => [message.data, ...prev].slice(0, 10));
          break;
      }
    },
  });

  useEffect(() => {
    if (isConnected) {
      subscribe('marketplace');
      subscribe('auction');
    }

    return () => {
      if (isConnected) {
        unsubscribe('marketplace');
        unsubscribe('auction');
      }
    };
  }, [isConnected, subscribe, unsubscribe]);

  return {
    isConnected,
    newListings,
    recentSales,
    activeBids,
  };
}
