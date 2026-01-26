import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  memoryUsage: NodeJS.MemoryUsage;
}

const metrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

/**
 * Middleware to track API performance
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const responseTime = Date.now() - startTime;
    const endMemory = process.memoryUsage();

    const metric: PerformanceMetrics = {
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
      },
    };

    // Store metric
    metrics.push(metric);
    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }

    // Log slow requests
    if (responseTime > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`);
    }

    // Add performance headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Memory-Usage', `${Math.round(metric.memoryUsage.heapUsed / 1024 / 1024)}MB`);

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Get performance analytics
 */
export const getPerformanceAnalytics = () => {
  if (metrics.length === 0) {
    return null;
  }

  const avgResponseTime =
    metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
  const maxResponseTime = Math.max(...metrics.map(m => m.responseTime));
  const minResponseTime = Math.min(...metrics.map(m => m.responseTime));

  const statusCodes = metrics.reduce((acc, m) => {
    acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const endpointStats = metrics.reduce((acc, m) => {
    const key = `${m.method} ${m.path}`;
    if (!acc[key]) {
      acc[key] = { count: 0, totalTime: 0, avgTime: 0 };
    }
    acc[key].count++;
    acc[key].totalTime += m.responseTime;
    acc[key].avgTime = acc[key].totalTime / acc[key].count;
    return acc;
  }, {} as Record<string, { count: number; totalTime: number; avgTime: number }>);

  return {
    totalRequests: metrics.length,
    avgResponseTime: Math.round(avgResponseTime),
    maxResponseTime,
    minResponseTime,
    statusCodes,
    endpointStats,
    slowestEndpoints: Object.entries(endpointStats)
      .sort(([, a], [, b]) => b.avgTime - a.avgTime)
      .slice(0, 10)
      .map(([endpoint, stats]) => ({ endpoint, ...stats })),
  };
};

/**
 * Health check with performance metrics
 */
export const performanceHealthCheck = (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  const analytics = getPerformanceAnalytics();

  res.json({
    status: 'ok',
    uptime: `${Math.floor(uptime / 60)} minutes`,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    },
    cpu: process.cpuUsage(),
    performance: analytics,
  });
};
