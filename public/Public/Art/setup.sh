#!/bin/bash

# BitArt Market - Complete Installation and Setup Script
# This script installs all dependencies and sets up the project

set -e  # Exit on error

echo "🎨 BitArt Market - Installation & Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p logs
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..
echo ""

# Setup Husky (Git hooks)
echo "🔧 Setting up Git hooks with Husky..."
if [ -d ".git" ]; then
    cd backend
    npx husky install
    cd ../frontend
    npx husky install
    cd ..
    echo -e "${GREEN}✓ Git hooks configured${NC}"
else
    echo -e "${YELLOW}⚠ Not a Git repository. Skipping Husky setup.${NC}"
fi
echo ""

# Create .env files if they don't exist
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cat > backend/.env << 'EOF'
# Server
PORT=3001
NODE_ENV=development

# API Keys
STACKS_API_URL=https://api.testnet.hiro.so
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CSRF_SECRET=your-csrf-secret-change-this-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@bitart.market

# Frontend URL
FRONTEND_URL=http://localhost:5173
EOF
    echo -e "${GREEN}✓ Backend .env file created${NC}"
    echo -e "${YELLOW}⚠ Please update backend/.env with your actual values${NC}"
else
    echo -e "${YELLOW}⚠ Backend .env file already exists${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws

# Blockchain
VITE_NETWORK=testnet
VITE_CHAIN_ID=0x14a34

# IPFS
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Analytics (Optional)
# VITE_GOOGLE_ANALYTICS_ID=
# VITE_MIXPANEL_TOKEN=
EOF
    echo -e "${GREEN}✓ Frontend .env file created${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env file already exists${NC}"
fi
echo ""

# Build TypeScript for backend
echo "🔨 Building backend TypeScript..."
cd backend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend build successful${NC}"
else
    echo -e "${YELLOW}⚠ Backend build had some warnings (this is normal)${NC}"
fi
cd ..
echo ""

# Run tests
echo "🧪 Running tests..."
echo "Testing backend..."
cd backend
npm test -- --passWithNoTests
cd ..
echo ""

echo "Testing frontend..."
cd frontend
npm test -- --run
cd ..
echo ""

echo "=================================="
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "=================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update environment variables:"
echo "   - Edit backend/.env"
echo "   - Edit frontend/.env"
echo ""
echo "2. Start the development servers:"
echo "   - Backend:  cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "3. Or use the quick start scripts:"
echo "   - ./start-dev.sh  (starts both servers)"
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend:  http://localhost:3001"
echo ""
echo "📚 Documentation:"
echo "   - API Docs:    docs/API.md"
echo "   - Deployment:  DEPLOYMENT_GUIDE_XVERSE.md"
echo "   - Contributing: CONTRIBUTING.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
