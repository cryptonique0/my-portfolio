import WebSocket from 'ws';
import { logger } from '../utils/logger';
import http from 'http';

interface Client {
  id: string;
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
}

class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, Client> = new Map();

  initialize(server: http.Server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
      const clientId = this.generateClientId();
      
      const client: Client = {
        id: clientId,
        ws,
        subscriptions: new Set(),
      };

      this.clients.set(clientId, client);
      logger.info(`WebSocket client connected: ${clientId}`);

      // Send welcome message
      this.send(clientId, {
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString(),
      });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(clientId, data);
        } catch (error) {
          logger.error('Invalid WebSocket message', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info(`WebSocket client disconnected: ${clientId}`);
      });

      ws.on('error', (error: Error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
      });
    });

    logger.info('WebSocket server initialized');
  }

  private handleMessage(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case 'subscribe':
        if (data.channel) {
          client.subscriptions.add(data.channel);
          this.send(clientId, {
            type: 'subscribed',
            channel: data.channel,
          });
        }
        break;

      case 'unsubscribe':
        if (data.channel) {
          client.subscriptions.delete(data.channel);
          this.send(clientId, {
            type: 'unsubscribed',
            channel: data.channel,
          });
        }
        break;

      case 'authenticate':
        client.userId = data.userId;
        this.send(clientId, {
          type: 'authenticated',
          userId: data.userId,
        });
        break;

      case 'ping':
        this.send(clientId, { type: 'pong' });
        break;

      default:
        logger.warn(`Unknown message type: ${data.type}`);
    }
  }

  /**
   * Send message to specific client
   */
  send(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Broadcast to all clients
   */
  broadcast(data: any, excludeClientId?: string) {
    const message = JSON.stringify(data);
    this.clients.forEach((client, id) => {
      if (id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  /**
   * Broadcast to specific channel subscribers
   */
  broadcastToChannel(channel: string, data: any) {
    const message = JSON.stringify({ ...data, channel });
    this.clients.forEach(client => {
      if (
        client.subscriptions.has(channel) &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(message);
      }
    });
  }

  /**
   * Send to specific user
   */
  sendToUser(userId: string, data: any) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  /**
   * Notify about new NFT listing
   */
  notifyNewListing(nft: any) {
    this.broadcastToChannel('marketplace', {
      type: 'new_listing',
      data: nft,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about NFT sale
   */
  notifySale(sale: any) {
    this.broadcastToChannel('marketplace', {
      type: 'sale',
      data: sale,
      timestamp: new Date().toISOString(),
    });

    // Notify seller
    if (sale.sellerId) {
      this.sendToUser(sale.sellerId, {
        type: 'your_nft_sold',
        data: sale,
        timestamp: new Date().toISOString(),
      });
    }

    // Notify buyer
    if (sale.buyerId) {
      this.sendToUser(sale.buyerId, {
        type: 'purchase_confirmed',
        data: sale,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Notify about new bid
   */
  notifyNewBid(bid: any) {
    this.broadcastToChannel('auction', {
      type: 'new_bid',
      data: bid,
      timestamp: new Date().toISOString(),
    });

    // Notify NFT owner
    if (bid.ownerId) {
      this.sendToUser(bid.ownerId, {
        type: 'bid_received',
        data: bid,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Notify about price change
   */
  notifyPriceChange(nftId: string, oldPrice: number, newPrice: number) {
    this.broadcastToChannel('marketplace', {
      type: 'price_update',
      data: { nftId, oldPrice, newPrice },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get connected clients count
   */
  getConnectionCount(): number {
    return this.clients.size;
  }

  /**
   * Get channel subscribers count
   */
  getChannelSubscribers(channel: string): number {
    let count = 0;
    this.clients.forEach(client => {
      if (client.subscriptions.has(channel)) count++;
    });
    return count;
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const wsService = new WebSocketService();
