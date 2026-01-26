/**
 * Multi-Wallet Tracking System Configuration
 * Configure all aspects of the tracking system
 */

export interface MultiWalletTrackerConfig {
  // Smart Contract Configuration
  contract: {
    // Contract address on blockchain
    address: string;
    // Network chain ID
    chainId: number;
    // RPC provider URL
    rpcUrl: string;
    // Abi path (relative to project)
    abiPath: string;
  };

  // Wallet Configuration
  wallet: {
    // Private key for transactions (use environment variable)
    privateKey?: string;
    // Maximum wallets per watchlist
    maxWatchlistSize: number;
    // Enable wallet validation
    validateAddresses: boolean;
  };

  // Cache Configuration
  cache: {
    // Cache TTL in seconds
    ttl: number;
    // Enable cache
    enabled: boolean;
    // Maximum cache size (number of entries)
    maxSize: number;
  };

  // Auto-Update Configuration
  autoUpdate: {
    // Default interval for auto-update in seconds
    defaultIntervalSeconds: number;
    // Minimum interval to prevent spam
    minIntervalSeconds: number;
    // Maximum interval allowed
    maxIntervalSeconds: number;
    // Enable auto-update feature
    enabled: boolean;
  };

  // API Configuration
  api: {
    // API port
    port: number;
    // API base path
    basePath: string;
    // Enable CORS
    enableCors: boolean;
    // CORS allowed origins
    corsOrigins: string[];
    // Request timeout in milliseconds
    requestTimeoutMs: number;
  };

  // Logging Configuration
  logging: {
    // Log level: 'debug', 'info', 'warn', 'error'
    level: 'debug' | 'info' | 'warn' | 'error';
    // Enable console logging
    console: boolean;
    // Enable file logging
    file: boolean;
    // Log file path
    filePath?: string;
  };

  // Network Configuration
  network: {
    // Supported networks
    supported: SupportedNetwork[];
    // Default network
    defaultNetwork: string;
  };

  // Batch Operations Configuration
  batch: {
    // Maximum wallets per batch request
    maxWalletsPerRequest: number;
    // Timeout for batch operations (ms)
    timeoutMs: number;
    // Continue on error in batch
    continueOnError: boolean;
  };

  // Feature Flags
  features: {
    // Enable watchlist feature
    watchlist: boolean;
    // Enable comparison feature
    comparison: boolean;
    // Enable portfolio history
    history: boolean;
    // Enable snapshots
    snapshots: boolean;
  };
}

export interface SupportedNetwork {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
}

/**
 * Default Configuration
 */
export const defaultConfig: MultiWalletTrackerConfig = {
  contract: {
    address: process.env.TRACKER_CONTRACT_ADDRESS || '',
    chainId: parseInt(process.env.CHAIN_ID || '1'),
    rpcUrl: process.env.RPC_URL || '',
    abiPath: './contracts/abi/MultiWalletTracker.json'
  },

  wallet: {
    privateKey: process.env.PRIVATE_KEY,
    maxWatchlistSize: 50,
    validateAddresses: true
  },

  cache: {
    ttl: 300, // 5 minutes
    enabled: true,
    maxSize: 10000
  },

  autoUpdate: {
    defaultIntervalSeconds: 300, // 5 minutes
    minIntervalSeconds: 60, // 1 minute
    maxIntervalSeconds: 3600, // 1 hour
    enabled: true
  },

  api: {
    port: parseInt(process.env.API_PORT || '3000'),
    basePath: '/api',
    enableCors: true,
    corsOrigins: ['http://localhost:3000', 'http://localhost:3001'],
    requestTimeoutMs: 30000
  },

  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    console: true,
    file: false,
    filePath: './logs/app.log'
  },

  network: {
    supported: [
      {
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
        explorerUrl: 'https://etherscan.io'
      },
      {
        name: 'Arbitrum',
        chainId: 42161,
        rpcUrl: 'https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY',
        explorerUrl: 'https://arbiscan.io'
      },
      {
        name: 'Optimism',
        chainId: 10,
        rpcUrl: 'https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY',
        explorerUrl: 'https://optimistic.etherscan.io'
      },
      {
        name: 'Polygon',
        chainId: 137,
        rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY',
        explorerUrl: 'https://polygonscan.com'
      },
      {
        name: 'Avalanche',
        chainId: 43114,
        rpcUrl: 'https://avax-mainnet.g.alchemy.com/v2/YOUR_KEY',
        explorerUrl: 'https://snowtrace.io'
      },
      {
        name: 'Base',
        chainId: 8453,
        rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/YOUR_KEY',
        explorerUrl: 'https://basescan.org'
      }
    ],
    defaultNetwork: 'Ethereum'
  },

  batch: {
    maxWalletsPerRequest: 50,
    timeoutMs: 60000,
    continueOnError: true
  },

  features: {
    watchlist: true,
    comparison: true,
    history: true,
    snapshots: true
  }
};

/**
 * Development Configuration
 */
export const devConfig: Partial<MultiWalletTrackerConfig> = {
  logging: {
    level: 'debug',
    console: true,
    file: true
  },
  cache: {
    ttl: 60, // 1 minute for faster testing
    enabled: true
  },
  api: {
    enableCors: true,
    corsOrigins: ['*']
  }
};

/**
 * Production Configuration
 */
export const prodConfig: Partial<MultiWalletTrackerConfig> = {
  logging: {
    level: 'warn',
    console: true,
    file: true
  },
  cache: {
    ttl: 600, // 10 minutes
    enabled: true
  },
  api: {
    enableCors: false,
    corsOrigins: ['https://yourdomain.com']
  },
  batch: {
    continueOnError: false // Strict error handling in production
  }
};

/**
 * Get configuration based on environment
 */
export function getConfig(
  environment: 'development' | 'production' = 'development'
): MultiWalletTrackerConfig {
  const baseConfig = { ...defaultConfig };

  if (environment === 'development') {
    return { ...baseConfig, ...devConfig };
  } else {
    return { ...baseConfig, ...prodConfig };
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: MultiWalletTrackerConfig): boolean {
  if (!config.contract.address) {
    throw new Error('Contract address is required');
  }

  if (!config.contract.rpcUrl) {
    throw new Error('RPC URL is required');
  }

  if (config.wallet.maxWatchlistSize < 1) {
    throw new Error('Max watchlist size must be at least 1');
  }

  if (config.cache.ttl < 0) {
    throw new Error('Cache TTL must be non-negative');
  }

  if (config.api.port < 1 || config.api.port > 65535) {
    throw new Error('Invalid API port');
  }

  if (
    config.autoUpdate.minIntervalSeconds > config.autoUpdate.maxIntervalSeconds
  ) {
    throw new Error(
      'Min auto-update interval must be less than max interval'
    );
  }

  return true;
}

/**
 * Merge user config with defaults
 */
export function mergeConfig(
  userConfig: Partial<MultiWalletTrackerConfig>,
  environment: 'development' | 'production' = 'development'
): MultiWalletTrackerConfig {
  const baseConfig = getConfig(environment);

  return {
    ...baseConfig,
    ...userConfig,
    contract: {
      ...baseConfig.contract,
      ...userConfig.contract
    },
    wallet: {
      ...baseConfig.wallet,
      ...userConfig.wallet
    },
    cache: {
      ...baseConfig.cache,
      ...userConfig.cache
    },
    autoUpdate: {
      ...baseConfig.autoUpdate,
      ...userConfig.autoUpdate
    },
    api: {
      ...baseConfig.api,
      ...userConfig.api
    },
    logging: {
      ...baseConfig.logging,
      ...userConfig.logging
    },
    batch: {
      ...baseConfig.batch,
      ...userConfig.batch
    },
    features: {
      ...baseConfig.features,
      ...userConfig.features
    },
    network: {
      ...baseConfig.network,
      ...userConfig.network
    }
  };
}

/**
 * Export configuration singleton
 */
let configInstance: MultiWalletTrackerConfig | null = null;

export function initializeConfig(
  userConfig?: Partial<MultiWalletTrackerConfig>,
  environment: 'development' | 'production' = 'development'
): MultiWalletTrackerConfig {
  const merged = userConfig
    ? mergeConfig(userConfig, environment)
    : getConfig(environment);

  validateConfig(merged);
  configInstance = merged;

  return configInstance;
}

export function getConfigInstance(): MultiWalletTrackerConfig {
  if (!configInstance) {
    initializeConfig();
  }

  return configInstance!;
}
