# Deployment Guide

## Prerequisites

- Node.js 16+
- Git
- Stacks CLI (Clarinet)
- Wallet with testnet STX (for testnet deployment)
- Pinata account (for IPFS)
- Domain name (for production)

## Step 1: Prepare Environment

### Clone Repository
```bash
git clone https://github.com/yourusername/bitart-market.git
cd bitart-market
npm install
```

### Set Up Environment Variables

**Backend** (`backend/.env`):
```bash
NODE_ENV=production
PORT=3001
NETWORK=mainnet
STACKS_API_URL=https://api.mainnet.stacks.co
IPFS_GATEWAY=https://gateway.pinata.cloud
PINATA_JWT=your_pinata_jwt_here
ALLOWED_ORIGINS=https://yourdomain.com
```

**Frontend** (`frontend/.env.production`):
```bash
VITE_NETWORK=mainnet
VITE_API_URL=https://api.yourdomain.com
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

## Step 2: Deploy Smart Contracts

### Testnet Deployment (Recommended First)

1. **Prepare contracts**
```bash
cd contracts
clarinet check  # Verify syntax
```

2. **Deploy to testnet**
```bash
clarinet deploy --network testnet
```

3. **Verify deployment**
```bash
# Check contract status
clarinet info --contract nft --network testnet
```

### Mainnet Deployment

⚠️ **IMPORTANT**: Only deploy to mainnet after thorough testing on testnet!

1. **Final checks**
```bash
# Run all tests
clarinet test

# Verify security
clarinet check --security
```

2. **Deploy to mainnet**
```bash
clarinet deploy --network mainnet
```

3. **Update contract addresses**
```bash
# Store deployed contract addresses
export NFT_CONTRACT=ST...
export MARKETPLACE_CONTRACT=ST...
export AUCTION_CONTRACT=ST...
```

4. **Verify on explorer**
- Visit https://explorer.stacks.co/
- Search for your contract address
- Confirm all three contracts are deployed

## Step 3: Build & Deploy Backend

### Local Development
```bash
npm run dev --workspace backend
```

### Production Build
```bash
npm run build --workspace backend
```

### Deploy to VPS/Cloud

#### Option A: Deploy to Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create app**
```bash
heroku create bitart-market-api
```

3. **Add buildpack**
```bash
heroku buildpacks:add heroku/nodejs
```

4. **Set environment variables**
```bash
heroku config:set NODE_ENV=production \
  NETWORK=mainnet \
  STACKS_API_URL=https://api.mainnet.stacks.co \
  PINATA_JWT=your_jwt \
  ALLOWED_ORIGINS=https://yourdomain.com
```

5. **Deploy**
```bash
git push heroku main
```

#### Option B: Deploy to AWS EC2

1. **Launch EC2 instance**
   - Ubuntu 22.04 LTS
   - t3.small or larger
   - Open ports 80, 443, 3001

2. **Connect & install**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone repo
git clone https://github.com/yourusername/bitart-market.git
cd bitart-market
npm install
```

3. **Set up PM2 (process manager)**
```bash
sudo npm install -g pm2

# Create ecosystem config
pm2 start backend/src/index.ts --name "bitart-api" --interpreter tsx

# Save and auto-restart on reboot
pm2 save
pm2 startup
```

4. **Set up Nginx (reverse proxy)**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/bitart

# Add config:
server {
  listen 80;
  server_name api.yourdomain.com;

  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/bitart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Option C: Deploy to Docker

1. **Create Dockerfile** (backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY backend ./backend
RUN npm run build --workspace backend

EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NETWORK=mainnet
      - STACKS_API_URL=https://api.mainnet.stacks.co
      - PINATA_JWT=${PINATA_JWT}
    restart: always

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: always
```

3. **Build and run**
```bash
docker-compose build
docker-compose up -d
```

## Step 4: Build & Deploy Frontend

### Production Build
```bash
npm run build --workspace frontend
```

### Deploy to Vercel (Recommended)

1. **Connect repository**
```bash
npm i -g vercel
vercel link
```

2. **Set environment variables**
```bash
vercel env add VITE_API_URL
vercel env add VITE_CONTRACT_ADDRESS
vercel env add VITE_NETWORK
```

3. **Deploy**
```bash
vercel --prod
```

### Deploy to Netlify

1. **Create netlify.toml**
```toml
[build]
  command = "npm run build --workspace frontend"
  publish = "frontend/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Deploy to AWS S3 + CloudFront

1. **Build**
```bash
npm run build --workspace frontend
```

2. **Upload to S3**
```bash
aws s3 sync frontend/dist s3://your-bucket-name --delete
```

3. **Create CloudFront distribution**
   - Origin: S3 bucket
   - Default Root Object: index.html
   - Create Origin Access Identity
   - Enable HTTPS

## Step 5: Set Up Domain & SSL

### Point Domain to Your Deployment

**For Vercel:** CNAME to your-project.vercel.app
**For AWS:** CNAME to CloudFront distribution
**For VPS:** A record to your instance IP

### Enable HTTPS

All production deployments must use HTTPS:
- Vercel/Netlify: Automatic
- AWS: CloudFront with ACM certificate
- VPS: Let's Encrypt (see Nginx section above)

## Step 6: Monitoring & Maintenance

### Application Monitoring

**Backend Logs**
```bash
# Heroku
heroku logs --tail

# PM2
pm2 logs

# Docker
docker-compose logs -f backend
```

### Health Checks

Monitor endpoint:
```bash
curl https://api.yourdomain.com/api/health
```

### Database Backups

For production MongoDB (when implemented):
```bash
# Local backup
mongodump --out backup/

# Restore
mongorestore backup/
```

### Update Strategy

1. **Test changes locally**
```bash
npm run dev
```

2. **Push to staging environment**
```bash
git push staging main
```

3. **Verify on staging**
```bash
# Test all API endpoints
# Check frontend functionality
# Monitor logs
```

4. **Deploy to production**
```bash
git push main
# Automatic deployment triggers
```

## Step 7: Security Checklist

- [ ] Enable CORS correctly (whitelist domains)
- [ ] Use HTTPS everywhere
- [ ] Set secure headers (Helmet.js enabled)
- [ ] Implement rate limiting (enabled)
- [ ] Validate all inputs
- [ ] Use environment variables (no secrets in code)
- [ ] Enable wallet signature verification
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor error logs
- [ ] Backup critical data
- [ ] Test disaster recovery

## Step 8: Performance Optimization

### Frontend
```bash
# Enable code splitting
npm run build --workspace frontend

# Check bundle size
npm install -g webpack-bundle-analyzer
```

### Backend
- Enable caching headers
- Compress responses (gzip enabled)
- Use CDN for static content
- Database query optimization
- Connection pooling

### Monitor Performance
- Frontend: Google Lighthouse
- Backend: New Relic, Datadog, or similar
- Real user monitoring with Sentry

## Troubleshooting

### Contract Deployment Issues

**Error: "Invalid contract"**
- Check Clarity syntax: `clarinet check`
- Verify dependencies in Clarinet.toml

**Error: "Insufficient STX"**
- Fund testnet address via faucet
- Use mainnet wallet with STX

### API Connection Issues

**Error: "CORS not allowed"**
- Check ALLOWED_ORIGINS env variable
- Verify frontend domain is whitelisted

**Error: "IPFS timeout"**
- Check Pinata JWT is valid
- Verify internet connectivity

### Frontend Build Issues

**Error: "Cannot find module"**
```bash
# Clean and rebuild
rm -rf node_modules frontend/node_modules
npm install
npm run build --workspace frontend
```

## Support

- Documentation: See `/docs` directory
- Issues: GitHub Issues
- Community: Stacks Discord
- Email: support@bitart-market.com

## Rollback Plan

If issues occur:

1. **Backend rollback**
```bash
# Revert to previous version
git revert HEAD
npm run build --workspace backend
# Redeploy
```

2. **Frontend rollback**
```bash
# Vercel: Select previous deployment
vercel rollback

# Manual: Redeploy previous build
npm run build --workspace frontend
npm run deploy
```

3. **Contract rollback**
```bash
# Deploy new version of contract
# Update frontend with new address
```
