# Environment Configuration Guide

This guide explains how to configure environment variables for the BitArt Market application.

## Quick Start

### Backend Setup

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env.local
   ```

2. Update the following **required** variables:
   ```env
   PINATA_JWT=your_actual_pinata_jwt_token
   PINATA_GATEWAY=https://gateway.pinata.cloud
   ```

3. (Optional) Configure other settings as needed for your environment.

### Frontend Setup

1. Copy the example environment file:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. Update the API URL if your backend runs on a different port:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

## Environment Variables

### Backend Variables

#### Server Configuration
- `PORT` (default: `3001`) - Port for the backend server
- `NODE_ENV` - Environment mode: `development`, `production`, or `test`

#### Network Configuration
- `NETWORK` - Blockchain network: `testnet` or `mainnet`
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

#### Stacks Configuration
- `STACKS_API_URL` - Stacks API endpoint
- `NFT_CONTRACT` - Deployed NFT contract address
- `MARKETPLACE_CONTRACT` - Deployed marketplace contract address
- `AUCTION_CONTRACT` - Deployed auction contract address

#### Base (L2) Configuration
- `BASE_RPC_URL` - Base network RPC endpoint
- `BASE_NFT_CONTRACT` - Base NFT contract address
- `BASE_MARKETPLACE_CONTRACT` - Base marketplace contract address
- `BASE_AUCTION_CONTRACT` - Base auction contract address

#### IPFS Configuration (Required)
- `PINATA_JWT` - **Required** - Your Pinata JWT token for IPFS uploads
- `PINATA_GATEWAY` - **Required** - Pinata gateway URL

#### Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Time window for rate limiting (milliseconds)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window
- `UPLOAD_LIMIT_WINDOW_MS` - Upload rate limit window
- `UPLOAD_LIMIT_MAX_REQUESTS` - Max uploads per window

#### Security
- `API_SECRET_KEY` - (Optional) Secret key for API authentication

### Frontend Variables

All Vite environment variables must be prefixed with `VITE_`:

#### API Configuration
- `VITE_API_URL` - Backend API base URL
- `VITE_NETWORK` - Target network: `testnet` or `mainnet`

#### Stacks Configuration
- `VITE_STACKS_API_URL` - Stacks API endpoint
- `VITE_NFT_CONTRACT` - NFT contract address
- `VITE_MARKETPLACE_CONTRACT` - Marketplace contract address
- `VITE_AUCTION_CONTRACT` - Auction contract address

#### Base Configuration
- `VITE_BASE_RPC_URL` - Base RPC endpoint
- `VITE_BASE_CHAIN_ID` - Chain ID (8453 for mainnet)
- `VITE_BASE_NFT_CONTRACT` - Base NFT contract
- `VITE_BASE_MARKETPLACE_CONTRACT` - Base marketplace contract
- `VITE_BASE_AUCTION_CONTRACT` - Base auction contract
- `VITE_BASE_CHAIN_NAME` - Display name for the chain
- `VITE_BASE_CURRENCY` - Native currency symbol
- `VITE_BASE_EXPLORER` - Block explorer URL

#### Feature Flags
- `VITE_ENABLE_BASE` - Enable Base blockchain features
- `VITE_ENABLE_STACKS` - Enable Stacks blockchain features

## Environment Validation

### Backend
The backend automatically validates required environment variables on startup. If validation fails, you'll see:

```
❌ Environment validation failed:
  - Missing required environment variables: PINATA_JWT, PINATA_GATEWAY

💡 Check .env.example for required variables
```

The application will exit with an error. Fix the missing variables and restart.

### Frontend
The frontend uses default values for most variables, but will warn about missing critical configuration in the console.

## Type Safety

Both frontend and backend use **typed configuration objects** to access environment variables:

### Backend Example
```typescript
import { getConfig } from './config/env';

const config = getConfig();
console.log(config.port); // Type-safe access
console.log(config.ipfs.jwt); // Nested configuration
```

### Frontend Example
```typescript
import { config } from './config/env';

console.log(config.apiUrl); // Type-safe access
console.log(config.base.chainId); // Nested configuration
```

## Getting Pinata Credentials

1. Sign up at [Pinata.cloud](https://www.pinata.cloud/)
2. Navigate to **API Keys** in the dashboard
3. Create a new API key with pinning permissions
4. Copy the JWT token to your `.env.local` file

## Network-Specific Configuration

### Testnet (Development)
```env
NETWORK=testnet
STACKS_API_URL=https://api.testnet.stacks.co
```

### Mainnet (Production)
```env
NETWORK=mainnet
STACKS_API_URL=https://api.mainnet.stacks.co
# Update contract addresses to mainnet deployments
```

## Security Best Practices

1. **Never commit `.env.local` or `.env` files to version control**
2. Use `.env.example` files as templates only
3. Rotate API keys and secrets regularly
4. Use different credentials for development/production
5. Limit CORS origins in production to trusted domains

## Troubleshooting

### Backend won't start
- Check that all required variables are set
- Verify JWT token is valid
- Ensure PORT is not already in use

### Frontend can't connect to backend
- Verify `VITE_API_URL` matches your backend URL
- Check CORS configuration in backend
- Ensure backend is running

### IPFS uploads fail
- Verify `PINATA_JWT` is correct and active
- Check Pinata account has sufficient storage
- Ensure network connectivity to Pinata

## Reference

- [Pinata Documentation](https://docs.pinata.cloud/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js dotenv](https://github.com/motdotla/dotenv)
