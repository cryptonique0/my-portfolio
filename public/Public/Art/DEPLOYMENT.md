# BitArt Market - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the BitArt Market application to production environments.

## Technology Stack
- **Backend**: Node.js + Express (deployed on Render or AWS)
- **Frontend**: React + Vite (deployed on Vercel or Netlify)
- **Blockchain**: Stacks Mainnet + Celo Mainnet
- **Storage**: IPFS via Pinata

## Prerequisites
1. GitHub account with repository access
2. Render.com account (for backend)
3. Vercel.com account (for frontend)
4. Pinata account (for IPFS)
5. Domain name (optional but recommended)
6. Infura account for Celo RPC (recommended)

---

## Backend Deployment (Render)

### Step 1: Prepare Backend
```bash
# Verify build succeeds
npm run build --workspace backend

# Check that dist folder is created
ls -la backend/dist/
```

### Step 2: Create Render Service
1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `bitart-market-api`
   - **Environment**: `Node`
   - **Build Command**: `npm run build --workspace backend`
   - **Start Command**: `node backend/dist/index.js`
   - **Plan**: Free or Paid (recommended: paid for better uptime)

### Step 3: Set Environment Variables
In Render dashboard, go to your service → Environment:
```
NODE_ENV=production
PORT=3001
STACKS_API_URL=https://api.mainnet.stacks.co
STACKS_NETWORK=mainnet
CELO_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
CELO_CHAIN_ID=42220
PINATA_API_KEY=your_key
PINATA_SECRET_API_KEY=your_secret
PINATA_JWT=your_jwt
CORS_ORIGIN=https://bitart-market.vercel.app
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Deploy
- Push to GitHub main branch
- Render auto-deploys or click "Deploy" button
- Wait for build to complete
- Your API URL will be: `https://bitart-market-api.onrender.com`

### Step 5: Verify Backend
```bash
# Test health endpoint
curl https://bitart-market-api.onrender.com/api/celo/health

# Expected response:
# {"jsonrpc":"2.0","result":"0.1.0","id":1}
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
# Verify build succeeds
npm run build --workspace frontend

# Check dist folder
ls -la frontend/dist/
```

### Step 2: Deploy to Vercel
**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build --workspace frontend`
   - **Output Directory**: `frontend/dist`

### Step 3: Set Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:
```
VITE_API_URL=https://bitart-market-api.onrender.com
VITE_STACKS_API_URL=https://api.mainnet.stacks.co
VITE_STACKS_NETWORK=mainnet
VITE_CELO_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
VITE_CELO_CHAIN_ID=42220
```

### Step 4: Deploy
- Vercel auto-deploys on push to main
- Your app URL will be: `https://bitart-market.vercel.app`
- Custom domain can be added in Settings

### Step 5: Verify Frontend
- Visit https://bitart-market.vercel.app
- Check browser console for any errors
- Try connecting wallet (Stacks or Celo)
- Test NFT creation flow

---

## Alternative Deployment Options

### Backend Alternatives
1. **AWS EC2/Lambda**: Use AWS deployment tools
2. **Heroku**: (deprecated free tier, but paid options available)
3. **DigitalOcean App Platform**: Similar to Render
4. **Railway.app**: Modern alternative to Render

### Frontend Alternatives
1. **Netlify**: Similar to Vercel
2. **AWS CloudFront + S3**: Higher control
3. **GitHub Pages**: For static sites (limited features)

---

## Post-Deployment Checklist

- [ ] Backend API responds to health check
- [ ] Frontend loads without console errors
- [ ] Stacks wallet connection works
- [ ] Celo wallet connection works (if available)
- [ ] NFT creation flow completes
- [ ] IPFS upload via Pinata works
- [ ] Mobile responsiveness verified
- [ ] Dark/Light mode toggle works
- [ ] Rate limiting is active on API
- [ ] CORS headers are correct
- [ ] Environment variables are not exposed
- [ ] SSL certificates are valid

---

## Monitoring & Maintenance

### Backend Monitoring
- Monitor Render dashboard for errors
- Check logs: Render → Logs tab
- Monitor API response times

### Frontend Monitoring
- Monitor Vercel Analytics dashboard
- Check for JavaScript errors
- Monitor Core Web Vitals

### Common Issues

**Backend won't start:**
- Check environment variables are set
- Verify Node.js version is 16+
- Check logs for missing dependencies

**Frontend blank page:**
- Check browser console for errors
- Verify VITE_API_URL is correct
- Clear browser cache
- Check network tab for failed requests

**Wallet connection fails:**
- Verify using mainnet or testnet consistently
- Check browser wallet extension is installed
- Verify CORS_ORIGIN is set correctly on backend

---

## Environment Variable Reference

### Testnet Configuration (for testing)
```
VITE_STACKS_API_URL=https://api.testnet.stacks.co
VITE_STACKS_NETWORK=testnet
VITE_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
VITE_CELO_CHAIN_ID=0xaef3
```

### Mainnet Configuration (production)
```
VITE_STACKS_API_URL=https://api.mainnet.stacks.co
VITE_STACKS_NETWORK=mainnet
VITE_CELO_RPC_URL=https://forno.celo.org
VITE_CELO_CHAIN_ID=42220
```

---

## Support

- GitHub Issues: https://github.com/cryptonique0/BitArt-Market/issues
- Stacks Documentation: https://docs.stacks.co
- Celo Documentation: https://docs.celo.org
- Pinata Documentation: https://docs.pinata.cloud

---

## Security Notes

1. **Never commit `.env` files** - they are in `.gitignore`
2. **Use environment variables** for all secrets
3. **Enable CORS carefully** - only allow trusted origins
4. **Keep dependencies updated** - run `npm audit` regularly
5. **Use HTTPS only** - all production URLs should be HTTPS
6. **Rotate API keys** - if exposed, regenerate them immediately
7. **Monitor rate limits** - ensure they're appropriate for your traffic
