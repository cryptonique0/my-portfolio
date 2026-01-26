/**
 * Environment validation and typed configuration
 * Validates required environment variables on startup
 */

interface EnvConfig {
  // Server
  port: number;
  nodeEnv: 'development' | 'production' | 'test';

  // Network
  network: 'testnet' | 'mainnet';
  allowedOrigins: string[];

  // Stacks
  stacks: {
    apiUrl: string;
    nftContract: string;
    marketplaceContract: string;
    auctionContract: string;
  };

  // Base
  base: {
    rpcUrl: string;
    nftContract: string;
    marketplaceContract: string;
    auctionContract: string;
  };

  // IPFS
  ipfs: {
    jwt: string;
    gateway: string;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    uploadWindowMs: number;
    uploadMaxRequests: number;
  };

  // Security
  apiSecretKey?: string;
  jwtSecret: string;
}

/**
 * Get required environment variable or throw error
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Validate and parse environment variables
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Allow relaxed validation in development to run with mock IPFS
  const nodeEnv = getOptionalEnv('NODE_ENV', 'development');
  const isDev = nodeEnv === 'development';

  const requiredVars = ['PINATA_JWT', 'PINATA_GATEWAY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0 && !isDev) {
    errors.push(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate network
  const network = getOptionalEnv('NETWORK', 'testnet');
  if (network !== 'testnet' && network !== 'mainnet') {
    errors.push(`Invalid NETWORK value: ${network}. Must be 'testnet' or 'mainnet'`);
  }

  // Validate node env
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    errors.push(`Invalid NODE_ENV value: ${nodeEnv}`);
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:\n');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\n💡 Check .env.example for required variables\n');
    throw new Error('Environment validation failed');
  }

  // Parse and return config
  return {
    port: parseInt(getOptionalEnv('PORT', '3001'), 10),
    nodeEnv: nodeEnv as 'development' | 'production' | 'test',
    network: network as 'testnet' | 'mainnet',
    allowedOrigins: getOptionalEnv('ALLOWED_ORIGINS', 'http://localhost:5173').split(','),

    stacks: {
      apiUrl: getOptionalEnv('STACKS_API_URL', 'https://api.testnet.stacks.co'),
      nftContract: getOptionalEnv(
        'NFT_CONTRACT',
        'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.colorful-lime-guan'
      ),
      marketplaceContract: getOptionalEnv(
        'MARKETPLACE_CONTRACT',
        'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.partial-harlequin-tahr'
      ),
      auctionContract: getOptionalEnv(
        'AUCTION_CONTRACT',
        'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.better-copper-lemming'
      ),
    },

    base: {
      rpcUrl: getOptionalEnv('BASE_RPC_URL', 'https://mainnet.base.org'),
      nftContract: getOptionalEnv('BASE_NFT_CONTRACT', '0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682'),
      marketplaceContract: getOptionalEnv(
        'BASE_MARKETPLACE_CONTRACT',
        '0x7d28443e3571faB3821d669537E45484E4A06AC9'
      ),
      auctionContract: getOptionalEnv(
        'BASE_AUCTION_CONTRACT',
        '0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2'
      ),
    },

    ipfs: {
      jwt: getOptionalEnv('PINATA_JWT', isDev ? 'demo_jwt_token' : ''),
      gateway: getOptionalEnv('PINATA_GATEWAY', isDev ? 'https://gateway.pinata.cloud' : ''),
    },

    rateLimit: {
      windowMs: parseInt(getOptionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
      maxRequests: parseInt(getOptionalEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
      uploadWindowMs: parseInt(getOptionalEnv('UPLOAD_LIMIT_WINDOW_MS', '3600000'), 10),
      uploadMaxRequests: parseInt(getOptionalEnv('UPLOAD_LIMIT_MAX_REQUESTS', '20'), 10),
    },

    apiSecretKey: process.env.API_SECRET_KEY,
    jwtSecret: getOptionalEnv('JWT_SECRET', isDev ? 'dev_jwt_secret' : ''),
  };
}

// Export singleton config instance
let config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!config) {
    config = validateEnv();
  }
  return config;
}

export type { EnvConfig };
