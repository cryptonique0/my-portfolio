import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: (req: Request) => string;
}

const cache = new Map<string, { data: any; expiry: number }>();

/**
 * Cache middleware for GET requests
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, key = (req) => req.originalUrl } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = key(req);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() < cached.expiry) {
      logger.info(`Cache hit for: ${cacheKey}`);
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data: any) {
      cache.set(cacheKey, {
        data,
        expiry: Date.now() + ttl * 1000,
      });
      logger.info(`Cached response for: ${cacheKey}`);
      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear cache by pattern
 */
export const clearCache = (pattern?: string) => {
  if (!pattern) {
    cache.clear();
    logger.info('Cleared entire cache');
    return;
  }

  const keysToDelete: string[] = [];
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cache.delete(key));
  logger.info(`Cleared ${keysToDelete.length} cache entries matching: ${pattern}`);
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  const stats = {
    totalEntries: cache.size,
    activeEntries: 0,
    expiredEntries: 0,
    totalSize: 0,
  };

  for (const [key, value] of cache.entries()) {
    if (now < value.expiry) {
      stats.activeEntries++;
    } else {
      stats.expiredEntries++;
    }
    stats.totalSize += JSON.stringify(value.data).length;
  }

  return stats;
};

/**
 * Clean expired cache entries
 */
export const cleanExpiredCache = () => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of cache.entries()) {
    if (now >= value.expiry) {
      cache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.info(`Cleaned ${cleaned} expired cache entries`);
  }

  return cleaned;
};

// Auto-clean expired entries every 5 minutes
setInterval(cleanExpiredCache, 5 * 60 * 1000);
