/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation from JSDoc comments
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { getConfig } from './env';

const config = getConfig();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BitArt Market API',
      version: '1.0.0',
      description: 'Complete REST API for NFT marketplace with analytics, authentication, and admin features',
      contact: {
        name: 'BitArt Team',
        url: 'https://bitart.market',
      },
    },
    servers: [
      {
        url: config.nodeEnv === 'production' ? 'https://api.bitart.market' : `http://localhost:${config.port}`,
        description: config.nodeEnv === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from /api/auth/verify endpoint',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Bearer <JWT_TOKEN>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            status: { type: 'number' },
            message: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['user', 'creator', 'admin'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        NFT: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            image_url: { type: 'string' },
            creator_id: { type: 'string' },
            collection_id: { type: 'string' },
            price: { type: 'number' },
            blockchain: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Listing: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nft_id: { type: 'string' },
            seller_id: { type: 'string' },
            price: { type: 'number' },
            status: { type: 'string', enum: ['active', 'sold', 'cancelled'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Analytics: {
          type: 'object',
          properties: {
            totalVolume: { type: 'number' },
            totalTransactions: { type: 'number' },
            totalNFTsSold: { type: 'number' },
            averagePrice: { type: 'number' },
            activeUsers: { type: 'number' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/routes/auth.ts',
    './src/routes/admin.ts',
    './src/routes/advanced-analytics.ts',
    './src/routes/nft.ts',
    './src/routes/marketplace.ts',
    './src/routes/user.ts',
    './src/routes/collections.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
