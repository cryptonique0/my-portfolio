/**
 * Event Listener Service
 * Real-time blockchain event monitoring via WebSocket
 * Listens to smart contract events and notifies users
 */

import { ethers } from 'ethers';
import { Server as SocketServer } from 'socket.io';
import { logger } from '../utils/logger';
import { supabase } from '../config/supabase';

interface ContractEvent {
  eventName: string;
  contractAddress: string;
  args: any[];
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

interface EventSubscription {
  userId: string;
  eventType: string;
  contractAddress?: string;
  nftId?: string;
  auctionId?: string;
}

export class EventListenerService {
  private provider: ethers.WebSocketProvider | null = null;
  private io: SocketServer | null = null;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private contractListeners: Map<string, ethers.Contract> = new Map();

  /**
   * Initialize WebSocket provider and Socket.IO server
   */
  async initialize(io: SocketServer) {
    try {
      this.io = io;

      // Initialize WebSocket provider for Base network
      const wsUrl = process.env.BASE_WS_RPC_URL || 'wss://sepolia.base.org';
      this.provider = new ethers.WebSocketProvider(wsUrl);

      logger.info('Event listener service initialized');

      // Setup Socket.IO connection handlers
      this.setupSocketHandlers();

      return true;
    } catch (error) {
      logger.error('Failed to initialize event listener:', error);
      throw error;
    }
  }

  /**
   * Setup Socket.IO connection and message handlers
   */
  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Subscribe to events
      socket.on('subscribe', async (data: EventSubscription) => {
        await this.addSubscription(socket.id, data);
        socket.emit('subscribed', { eventType: data.eventType });
      });

      // Unsubscribe from events
      socket.on('unsubscribe', async (data: EventSubscription) => {
        await this.removeSubscription(socket.id, data);
        socket.emit('unsubscribed', { eventType: data.eventType });
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.removeAllSubscriptions(socket.id);
      });
    });
  }

  /**
   * Add event subscription for a socket client
   */
  private async addSubscription(socketId: string, subscription: EventSubscription) {
    const existing = this.subscriptions.get(socketId) || [];
    existing.push(subscription);
    this.subscriptions.set(socketId, existing);

    logger.info(`Subscription added for ${socketId}: ${subscription.eventType}`);
  }

  /**
   * Remove event subscription
   */
  private async removeSubscription(socketId: string, subscription: EventSubscription) {
    const existing = this.subscriptions.get(socketId) || [];
    const filtered = existing.filter(
      (sub) => sub.eventType !== subscription.eventType
    );
    this.subscriptions.set(socketId, filtered);

    logger.info(`Subscription removed for ${socketId}: ${subscription.eventType}`);
  }

  /**
   * Remove all subscriptions for a socket
   */
  private removeAllSubscriptions(socketId: string) {
    this.subscriptions.delete(socketId);
  }

  /**
   * Listen to NFT contract events
   */
  async listenToNFTContract(contractAddress: string, abi: any[]) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      this.contractListeners.set(contractAddress, contract);

      // Listen to Transfer events (NFT minting and transfers)
      contract.on('Transfer', async (from, to, tokenId, event) => {
        const contractEvent: ContractEvent = {
          eventName: 'Transfer',
          contractAddress,
          args: [from, to, tokenId.toString()],
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
          timestamp: Date.now(),
        };

        await this.handleNFTTransfer(contractEvent);
      });

      // Listen to Approval events
      contract.on('Approval', async (owner, approved, tokenId, event) => {
        const contractEvent: ContractEvent = {
          eventName: 'Approval',
          contractAddress,
          args: [owner, approved, tokenId.toString()],
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
          timestamp: Date.now(),
        };

        await this.handleNFTApproval(contractEvent);
      });

      logger.info(`Listening to NFT contract: ${contractAddress}`);
    } catch (error) {
      logger.error('Failed to listen to NFT contract:', error);
      throw error;
    }
  }

  /**
   * Listen to Marketplace contract events
   */
  async listenToMarketplaceContract(contractAddress: string, abi: any[]) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      this.contractListeners.set(`marketplace-${contractAddress}`, contract);

      // Listen to ItemListed events
      contract.on('ItemListed', async (seller, nftAddress, tokenId, price, event) => {
        const contractEvent: ContractEvent = {
          eventName: 'ItemListed',
          contractAddress,
          args: [seller, nftAddress, tokenId.toString(), price.toString()],
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
          timestamp: Date.now(),
        };

        await this.handleItemListed(contractEvent);
      });

      // Listen to ItemSold events
      contract.on('ItemSold', async (buyer, nftAddress, tokenId, price, event) => {
        const contractEvent: ContractEvent = {
          eventName: 'ItemSold',
          contractAddress,
          args: [buyer, nftAddress, tokenId.toString(), price.toString()],
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
          timestamp: Date.now(),
        };

        await this.handleItemSold(contractEvent);
      });

      logger.info(`Listening to Marketplace contract: ${contractAddress}`);
    } catch (error) {
      logger.error('Failed to listen to Marketplace contract:', error);
      throw error;
    }
  }

  /**
   * Listen to Auction contract events
   */
  async listenToAuctionContract(contractAddress: string, abi: any[]) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      this.contractListeners.set(`auction-${contractAddress}`, contract);

      // Listen to AuctionCreated events
      contract.on('AuctionCreated', async (auctionId, seller, nftAddress, tokenId, startPrice, event) => {
        const contractEvent: ContractEvent = {
          eventName: 'AuctionCreated',
          contractAddress,
          args: [auctionId.toString(), seller, nftAddress, tokenId.toString(), startPrice.toString()],
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
          timestamp: Date.now(),
        };

        await this.handleAuctionCreated(contractEvent);
      });

      // Listen to BidPlaced events
      contract.on('BidPlaced', async (auctionId, bidder, amount, event) => {
        const contractEvent: ContractEvent = {
          eventName: 'BidPlaced',
          contractAddress,
          args: [auctionId.toString(), bidder, amount.toString()],
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
          timestamp: Date.now(),
        };

        await this.handleBidPlaced(contractEvent);
      });

      // Listen to AuctionEnded events
      contract.on('AuctionEnded', async (auctionId, winner, amount, event) => {
        const contractEvent: ContractEvent = {
          eventName: 'AuctionEnded',
          contractAddress,
          args: [auctionId.toString(), winner, amount.toString()],
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
          timestamp: Date.now(),
        };

        await this.handleAuctionEnded(contractEvent);
      });

      logger.info(`Listening to Auction contract: ${contractAddress}`);
    } catch (error) {
      logger.error('Failed to listen to Auction contract:', error);
      throw error;
    }
  }

  /**
   * Handle NFT Transfer event
   */
  private async handleNFTTransfer(event: ContractEvent) {
    const [from, to, tokenId] = event.args;

    // Check if it's a mint (from zero address)
    const isMint = from === ethers.ZeroAddress;

    // Store event in database
    await this.storeEvent({
      event_type: isMint ? 'nft_minted' : 'nft_transferred',
      contract_address: event.contractAddress,
      transaction_hash: event.transactionHash,
      block_number: event.blockNumber,
      event_data: {
        from,
        to,
        tokenId,
      },
    });

    // Emit to subscribed clients
    this.broadcastEvent({
      type: isMint ? 'nft_minted' : 'nft_transferred',
      data: {
        from,
        to,
        tokenId,
        contractAddress: event.contractAddress,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      },
    });

    logger.info(`NFT ${isMint ? 'minted' : 'transferred'}: ${tokenId}`);
  }

  /**
   * Handle NFT Approval event
   */
  private async handleNFTApproval(event: ContractEvent) {
    const [owner, approved, tokenId] = event.args;

    await this.storeEvent({
      event_type: 'nft_approved',
      contract_address: event.contractAddress,
      transaction_hash: event.transactionHash,
      block_number: event.blockNumber,
      event_data: {
        owner,
        approved,
        tokenId,
      },
    });

    this.broadcastEvent({
      type: 'nft_approved',
      data: {
        owner,
        approved,
        tokenId,
        contractAddress: event.contractAddress,
        transactionHash: event.transactionHash,
      },
    });
  }

  /**
   * Handle ItemListed event
   */
  private async handleItemListed(event: ContractEvent) {
    const [seller, nftAddress, tokenId, price] = event.args;

    await this.storeEvent({
      event_type: 'item_listed',
      contract_address: event.contractAddress,
      transaction_hash: event.transactionHash,
      block_number: event.blockNumber,
      event_data: {
        seller,
        nftAddress,
        tokenId,
        price,
      },
    });

    this.broadcastEvent({
      type: 'item_listed',
      data: {
        seller,
        nftAddress,
        tokenId,
        price,
        transactionHash: event.transactionHash,
      },
    });
  }

  /**
   * Handle ItemSold event
   */
  private async handleItemSold(event: ContractEvent) {
    const [buyer, nftAddress, tokenId, price] = event.args;

    await this.storeEvent({
      event_type: 'item_sold',
      contract_address: event.contractAddress,
      transaction_hash: event.transactionHash,
      block_number: event.blockNumber,
      event_data: {
        buyer,
        nftAddress,
        tokenId,
        price,
      },
    });

    this.broadcastEvent({
      type: 'item_sold',
      data: {
        buyer,
        nftAddress,
        tokenId,
        price,
        transactionHash: event.transactionHash,
      },
    });
  }

  /**
   * Handle AuctionCreated event
   */
  private async handleAuctionCreated(event: ContractEvent) {
    const [auctionId, seller, nftAddress, tokenId, startPrice] = event.args;

    await this.storeEvent({
      event_type: 'auction_created',
      contract_address: event.contractAddress,
      transaction_hash: event.transactionHash,
      block_number: event.blockNumber,
      event_data: {
        auctionId,
        seller,
        nftAddress,
        tokenId,
        startPrice,
      },
    });

    this.broadcastEvent({
      type: 'auction_created',
      data: {
        auctionId,
        seller,
        nftAddress,
        tokenId,
        startPrice,
        transactionHash: event.transactionHash,
      },
    });
  }

  /**
   * Handle BidPlaced event
   */
  private async handleBidPlaced(event: ContractEvent) {
    const [auctionId, bidder, amount] = event.args;

    await this.storeEvent({
      event_type: 'bid_placed',
      contract_address: event.contractAddress,
      transaction_hash: event.transactionHash,
      block_number: event.blockNumber,
      event_data: {
        auctionId,
        bidder,
        amount,
      },
    });

    this.broadcastEvent({
      type: 'bid_placed',
      data: {
        auctionId,
        bidder,
        amount,
        transactionHash: event.transactionHash,
      },
    });
  }

  /**
   * Handle AuctionEnded event
   */
  private async handleAuctionEnded(event: ContractEvent) {
    const [auctionId, winner, amount] = event.args;

    await this.storeEvent({
      event_type: 'auction_ended',
      contract_address: event.contractAddress,
      transaction_hash: event.transactionHash,
      block_number: event.blockNumber,
      event_data: {
        auctionId,
        winner,
        amount,
      },
    });

    this.broadcastEvent({
      type: 'auction_ended',
      data: {
        auctionId,
        winner,
        amount,
        transactionHash: event.transactionHash,
      },
    });
  }

  /**
   * Store event in database
   */
  private async storeEvent(eventData: any) {
    try {
      const { error } = await supabase.from('blockchain_events').insert({
        ...eventData,
        created_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Failed to store event:', error);
      }
    } catch (error) {
      logger.error('Error storing event:', error);
    }
  }

  /**
   * Broadcast event to subscribed Socket.IO clients
   */
  private broadcastEvent(event: { type: string; data: any }) {
    if (!this.io) return;

    // Broadcast to all connected clients
    this.io.emit('blockchain_event', event);

    // Also emit to specific event type rooms if implemented
    this.io.to(event.type).emit('blockchain_event', event);

    logger.info(`Broadcasted event: ${event.type}`);
  }

  /**
   * Get event history from database
   */
  async getEventHistory(filters: {
    eventType?: string;
    contractAddress?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase.from('blockchain_events').select('*');

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.contractAddress) {
        query = query.eq('contract_address', filters.contractAddress);
      }

      query = query.order('created_at', { ascending: false });
      query = query.range(
        filters.offset || 0,
        (filters.offset || 0) + (filters.limit || 50) - 1
      );

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get event history:', error);
      throw error;
    }
  }

  /**
   * Stop all listeners and cleanup
   */
  async cleanup() {
    try {
      // Remove all contract listeners
      for (const [key, contract] of this.contractListeners.entries()) {
        contract.removeAllListeners();
        logger.info(`Removed listeners for: ${key}`);
      }

      this.contractListeners.clear();

      // Close WebSocket provider
      if (this.provider) {
        await this.provider.destroy();
        this.provider = null;
      }

      // Clear subscriptions
      this.subscriptions.clear();

      logger.info('Event listener service cleaned up');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }
}

export const eventListenerService = new EventListenerService();
