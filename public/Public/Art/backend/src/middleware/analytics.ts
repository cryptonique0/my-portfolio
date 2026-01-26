import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

const requestMetrics: RequestMetrics[] = [];
const MAX_METRICS_SIZE = 10000;

/**
 * Request tracking middleware
 */
export const requestTracker = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const metric: RequestMetrics = {
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date(),
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    // Store metric
    requestMetrics.push(metric);
    
    // Keep array size under control
    if (requestMetrics.length > MAX_METRICS_SIZE) {
      requestMetrics.shift();
    }

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

/**
 * Get analytics data
 */
export const getAnalytics = (timeRange: 'hour' | 'day' | 'week' = 'hour') => {
  const now = Date.now();
  const ranges = {
    hour: 3600000,
    day: 86400000,
    week: 604800000,
  };

  const cutoff = now - ranges[timeRange];
  const relevantMetrics = requestMetrics.filter(
    m => m.timestamp.getTime() > cutoff
  );

  if (relevantMetrics.length === 0) {
    return null;
  }

  // Calculate statistics
  const totalRequests = relevantMetrics.length;
  const avgDuration =
    relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
  const maxDuration = Math.max(...relevantMetrics.map(m => m.duration));
  const minDuration = Math.min(...relevantMetrics.map(m => m.duration));

  // Status code distribution
  const statusCodes = relevantMetrics.reduce((acc, m) => {
    acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Top endpoints
  const endpointCount = relevantMetrics.reduce((acc, m) => {
    const key = `${m.method} ${m.path}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEndpoints = Object.entries(endpointCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }));

  // Error rate
  const errorRequests = relevantMetrics.filter(m => m.statusCode >= 400).length;
  const errorRate = (errorRequests / totalRequests) * 100;

  // Unique IPs
  const uniqueIPs = new Set(relevantMetrics.map(m => m.ip).filter(Boolean)).size;

  return {
    timeRange,
    totalRequests,
    avgDuration: Math.round(avgDuration),
    maxDuration,
    minDuration,
    statusCodes,
    topEndpoints,
    errorRate: Math.round(errorRate * 100) / 100,
    uniqueIPs,
    requestsPerMinute: Math.round(
      totalRequests / (ranges[timeRange] / 60000)
    ),
  };
};

/**
 * Get endpoint-specific analytics
 */
export const getEndpointAnalytics = (path: string) => {
  const endpointMetrics = requestMetrics.filter(m => m.path === path);

  if (endpointMetrics.length === 0) {
    return null;
  }

  const durations = endpointMetrics.map(m => m.duration);
  const statusCodes = endpointMetrics.reduce((acc, m) => {
    acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    path,
    totalRequests: endpointMetrics.length,
    avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
    statusCodes,
    successRate: Math.round(
      ((endpointMetrics.filter(m => m.statusCode < 400).length) /
        endpointMetrics.length) *
        100
    ),
  };
};

/**
 * Reset analytics data
 */
export const resetAnalytics = () => {
  const count = requestMetrics.length;
  requestMetrics.length = 0;
  logger.info(`Reset analytics data (removed ${count} metrics)`);
  return count;
};
