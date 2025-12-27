import { StacksNetwork, StacksMainnet, StacksTestnet } from '@stacks/network';

/**
 * Stacks Network Configuration
 * Handles Stacks-specific network setup for Bitcoin L2 integration
 */

// Stacks Mainnet Configuration
export const stacksMainnet = new StacksMainnet({
  url: 'https://mainnet.stacks.co:20443',
});

// Stacks Testnet Configuration
export const stacksTestnet = new StacksTestnet({
  url: 'https://testnet-api.stacks.co',
});

// Network selector
export function getStacksNetwork(isTestnet: boolean = false): StacksNetwork {
  return isTestnet ? stacksTestnet : stacksMainnet;
}

// Stacks Contract Addresses
export const STACKS_CONTRACTS = {
  mainnet: {
    onChainResume: process.env.NEXT_PUBLIC_STACKS_RESUME_CONTRACT || 'SP...',
    achievementNFT: process.env.NEXT_PUBLIC_STACKS_ACHIEVEMENT_NFT || 'SP...',
    credentialVerifier: process.env.NEXT_PUBLIC_STACKS_VERIFIER || 'SP...',
  },
  testnet: {
    onChainResume: process.env.NEXT_PUBLIC_STACKS_RESUME_CONTRACT_TESTNET || 'ST...',
    achievementNFT: process.env.NEXT_PUBLIC_STACKS_ACHIEVEMENT_NFT_TESTNET || 'ST...',
    credentialVerifier: process.env.NEXT_PUBLIC_STACKS_VERIFIER_TESTNET || 'ST...',
  },
};

// Get Stacks contract addresses based on environment
export function getStacksContracts(isTestnet: boolean = false) {
  return isTestnet ? STACKS_CONTRACTS.testnet : STACKS_CONTRACTS.mainnet;
}

// Stacks Address Utilities
export function isValidStacksAddress(address: string): boolean {
  return /^S[P|T][0-9A-Z]{32}$/.test(address);
}

export function formatStacksAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 10)}...${address.slice(-4)}`;
}

// Constants for Stacks Integration
export const STACKS_CONSTANTS = {
  STX_DECIMALS: 6,
  MICROSTACKS_PER_STX: 1_000_000,
  MIN_TX_FEE: 180,
  ACHIEVEMENT_NFT_PRICE: 100000, // In microSTX
  CREDENTIAL_VERIFICATION_PRICE: 50000,
  REPUTATION_SCORE_MULTIPLIER: 2.5,
};

// Stacks Smart Contract Function Names
export const STACKS_FUNCTIONS = {
  profileOperations: {
    createProfile: 'create-profile',
    updateProfile: 'update-profile',
    getProfile: 'get-profile',
  },
  achievementOperations: {
    unlockAchievement: 'unlock-achievement',
    mintAchievementNFT: 'mint-nft',
    getAchievements: 'get-achievements',
  },
  credentialOperations: {
    addCredential: 'add-credential',
    verifyCredential: 'verify-credential',
    getCredentials: 'get-credentials',
  },
  reputationOperations: {
    updateReputation: 'update-reputation',
    getReputation: 'get-reputation',
    claimReputationBadge: 'claim-badge',
  },
};

// Stacks Wallet Connection Types
export enum StacksWalletType {
  HIRO = 'hiro',
  XVERSE = 'xverse',
  LEATHER = 'leather',
}

// Stacks Integration Features
export const STACKS_FEATURES = {
  nftMinting: true,
  bitcoinSettlement: true,
  reputationTokens: true,
  achievementBadges: true,
  smartContracts: true,
  micropayments: true,
};
