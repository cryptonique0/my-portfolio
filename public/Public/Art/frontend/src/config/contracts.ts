// Smart Contract Configuration
// Type-safe contract addresses and configuration

import { config } from './env';

// Base Sepolia Testnet
export const BASE_TESTNET_CONTRACTS = {
  // Network configuration
  chainId: config.base.testnet.chainId,
  chainName: config.base.testnet.chainName,
  currency: config.base.testnet.currency,
  rpcUrl: config.base.testnet.rpcUrl,
  explorer: config.base.testnet.explorer,
  
  // Contract addresses
  nft: config.base.testnet.nftContract,
  marketplace: config.base.testnet.marketplaceContract,
  auction: config.base.testnet.auctionContract,
} as const;

// Base Mainnet
export const BASE_MAINNET_CONTRACTS = {
  // Network configuration
  chainId: config.base.mainnet.chainId,
  chainName: config.base.mainnet.chainName,
  currency: config.base.mainnet.currency,
  rpcUrl: config.base.mainnet.rpcUrl,
  explorer: config.base.mainnet.explorer,
  
  // Contract addresses
  nft: config.base.mainnet.nftContract,
  marketplace: config.base.mainnet.marketplaceContract,
  auction: config.base.mainnet.auctionContract,
} as const;

// Deprecated: kept for backwards compatibility
export const BASE_CONTRACTS = BASE_MAINNET_CONTRACTS;
export const STACKS_CONTRACTS = BASE_TESTNET_CONTRACTS; // fallback

// Contract function names for reference
export const CONTRACT_FUNCTIONS = {
  nft: {
    mint: 'mint-nft',
    transfer: 'transfer-nft',
    getMetadata: 'get-nft-metadata',
    getBalance: 'get-nft-balance',
    getTotalNfts: 'get-total-nfts',
  },
  marketplace: {
    list: 'list-nft',
    updatePrice: 'update-listing-price',
    cancelListing: 'cancel-listing',
    buy: 'buy-nft',
    getListing: 'get-listing',
  },
  auction: {
    create: 'create-auction',
    placeBid: 'place-bid',
    endAuction: 'end-auction',
    claim: 'claim-auction',
    getAuction: 'get-auction',
  },
} as const;
