// Backend Smart Contract Configuration
import { getConfig } from './env';

const config = getConfig();

export const STACKS_CONTRACTS = {
  network: config.network,
  
  // Contract addresses
  nft: config.stacks.nftContract,
  marketplace: config.stacks.marketplaceContract,
  auction: config.stacks.auctionContract,
  
  // API configuration
  apiUrl: config.stacks.apiUrl,
};

export const BASE_CONTRACTS = {
  network: 'mainnet', // Base is always mainnet
  
  // Contract addresses
  nft: config.base.nftContract,
  marketplace: config.base.marketplaceContract,
  auction: config.base.auctionContract,
  
  // RPC configuration
  rpcUrl: config.base.rpcUrl,
};
