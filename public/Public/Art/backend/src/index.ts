import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// import { initMonitoring } from './services/monitoring';
// import { sentryRequestHandler, sentryErrorHandler } from './middleware/errorMonitoring';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { getConfig } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { performanceMonitor, performanceHealthCheck } from './middleware/performance';
import { securityHeaders, addCSRFToken } from './middleware/security';

// Load environment variables
dotenv.config();

// Validate environment and get typed config
const config = getConfig();

// Initialize Monitoring (Sentry, Datadog) - Commented out for now
// initMonitoring();

// Import routes
import nftRoutes from './routes/nft';
import marketplaceRoutes from './routes/marketplace';
import userRoutes from './routes/user';
import analyticsRoutes from './routes/analytics';
import baseRoutes from './routes/base';
import royaltiesRoutes from './routes/royalties';
import royaltyPayoutsRoutes from './routes/royalty-payouts';
import searchRoutes from './routes/search';
import verificationRoutes from './routes/verification';
import followsRoutes from './routes/follows';
import activityRoutes from './routes/activity';
import engagementRoutes from './routes/engagement';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import wishlistRoutes from './routes/wishlist';
import userCollectionsRoutes from './routes/user-collections';
import alertsRoutes from './routes/alerts';
import transactionHistoryRoutes from './routes/transaction-history';
import offersRoutes from './routes/offers';
import bulkRoutes from './routes/bulk';
import analyticsAdvancedRoutes from './routes/analytics-advanced';
import { OffersService } from './services/offers.service';
import { RoyaltyAggregationService } from './services/royalty-aggregation.service';

// Supabase Database Routes
import usersDbRoutes from './routes/users';
import nftsDbRoutes from './routes/nfts';
import auctionsDbRoutes from './routes/auctions';
import transactionsDbRoutes from './routes/transactions';
import notificationsDbRoutes from './routes/notifications';
import collectionsDbRoutes from './routes/collections';
import analyticsDbRoutes from './routes/analytics-db';

// Advanced Analytics Routes
import advancedAnalyticsRoutes from './routes/advanced-analytics';

// Admin Routes
import adminRoutes from './routes/admin';
import adminVerificationRoutes from './routes/admin-verification';

// Blockchain Routes
import mintingRoutes from './routes/minting';
import eventsRoutes from './routes/events';

// Advanced Search Routes
import searchAdvancedRoutes from './routes/search-advanced';
import gamificationRoutes from './routes/gamification';

// Event listener service
import { eventListenerService } from './services/event-listener.service';

// Achievement service for auto-initialization
import { AchievementsService } from './services/achievements.service';

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: config.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = config.port;

// ============================================
// Security Middleware
// ============================================

// Helmet for security headers
app.use(helmet());

// Sentry request handler (no-op if disabled)
// app.use(sentryRequestHandler());

// Additional security headers
app.use(securityHeaders);

// CSRF protection
app.use(addCSRFToken);

// CORS configuration
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});

const uploadLimiter = rateLimit({
  windowMs: config.rateLimit.uploadWindowMs,
  max: config.rateLimit.uploadMaxRequests,
  message: 'Too many uploads from this IP, please try again later.',
});

app.use('/api/', limiter);
app.use('/api/upload/', uploadLimiter);

// ============================================
// Body Parsing Middleware
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// Performance Monitoring
// ============================================

app.use(performanceMonitor);

// ============================================
// Request Logging Middleware
// ============================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.http(req, res, duration);
  });
  
  next();
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    network: config.network
  });
});

// Performance metrics
app.get('/api/health/performance', performanceHealthCheck);

// ============================================
// Swagger/OpenAPI Documentation
// ============================================

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/api-docs.json',
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
  }
}));

app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root route for quick info
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'BitArt Market API',
    docs: {
      health: '/api/health',
      nfts: '/api/nfts',
      marketplace: '/api/marketplace/listings',
      users: '/api/users/{address}',
      analytics: '/api/analytics/stats'
    }
  });
});

// API Routes
app.use('/api/nfts', nftRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/base', baseRoutes);
app.use('/api/royalties', royaltiesRoutes);
app.use('/api/royalties/payouts', royaltyPayoutsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/profile', profileRoutes);
// Wishlist & Collections
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/user-collections', userCollectionsRoutes);
// Price Alerts
app.use('/api/alerts', alertsRoutes);
// Offers
app.use('/api/offers', offersRoutes);
// Bulk Operations
app.use('/api/bulk', bulkRoutes);
// Advanced Analytics
app.use('/api/analytics', analyticsAdvancedRoutes);

// Transaction History Routes
app.use('/api/transactions', transactionHistoryRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/auth', authRoutes);

// Supabase Database API Routes
app.use('/api/db/users', usersDbRoutes);
app.use('/api/db/nfts', nftsDbRoutes);
app.use('/api/db/auctions', auctionsDbRoutes);
app.use('/api/db/transactions', transactionsDbRoutes);
app.use('/api/db/notifications', notificationsDbRoutes);
app.use('/api/db/collections', collectionsDbRoutes);
app.use('/api/db/analytics', analyticsDbRoutes);

// Advanced Analytics Routes
app.use('/api/advanced-analytics', advancedAnalyticsRoutes);
app.use('/api/gamification', gamificationRoutes);

// Admin Routes (protected with admin role)
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminVerificationRoutes);

// Blockchain Routes
app.use('/api/minting', mintingRoutes);
app.use('/api/events', eventsRoutes);

// Advanced Search Routes
app.use('/api/search-advanced', searchAdvancedRoutes);

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
// Sentry error handler should be before app error handler to capture exceptions
// app.use(sentryErrorHandler());
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

// Initialize event listener service
eventListenerService.initialize(io).catch((error) => {
  logger.error('Failed to initialize event listener service:', error);
});

// Initialize achievements (one-time setup)
AchievementsService.initializeAchievements()
  .then(() => {
    logger.info('✅ Achievements initialized successfully');
  })
  .catch((error) => {
    logger.warn('⚠️ Achievement initialization failed (may already be initialized):', error.message);
  });

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     BitArt Market Backend Started     ║
╚═══════════════════════════════════════╝
  
  Server: http://localhost:${PORT}
  Environment: ${config.nodeEnv}
  Network: ${config.network}
  WebSocket: Enabled for real-time events
  
  API Documentation:
  - GET    /api/health                 - Health check
  - GET    /api/nfts                   - List NFTs
  - POST   /api/nfts                   - Create NFT
  - GET    /api/nfts/:id               - Get NFT details
  - GET    /api/marketplace/listings   - Get marketplace listings
  - POST   /api/marketplace/listings   - Create listing
  - GET    /api/users/:address         - Get user profile
  - GET    /api/analytics/stats        - Get marketplace stats
  - GET    /api/events/history         - Get blockchain events
  - WebSocket: Real-time blockchain events
  
  Listening on port ${PORT}...
  `);
});

// ============================================
// Scheduled Jobs
// ============================================

// Expire open offers periodically (every 10 minutes)
const OFFER_EXPIRY_INTERVAL_MS = 10 * 60 * 1000;
setInterval(async () => {
  try {
    const expired = await OffersService.expireOpenOffers();
    if (expired > 0) {
      logger.info(`Expired ${expired} offers`);
    }
  } catch (err: any) {
    logger.warn('Offer expiry job failed:', err.message || err);
  }
}, OFFER_EXPIRY_INTERVAL_MS);

// Aggregate royalties and process auto-payouts (daily at 00:00 UTC)
const ROYALTY_AGGREGATION_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const runRoyaltyAggregation = async () => {
  try {
    await RoyaltyAggregationService.runFullCycle();
  } catch (err: any) {
    logger.warn('Royalty aggregation job failed:', err.message || err);
  }
};
// Run immediately on startup
runRoyaltyAggregation();
// Then schedule daily
setInterval(runRoyaltyAggregation, ROYALTY_AGGREGATION_INTERVAL_MS);

export default app;
