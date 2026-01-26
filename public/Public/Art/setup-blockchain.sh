#!/bin/bash

# ============================================
# Blockchain Features Setup Script
# Complete setup for all 5 blockchain features
# ============================================

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║        🚀 BLOCKCHAIN FEATURES SETUP 🚀                              ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"
echo ""

# ============================================
# 1. Check Prerequisites
# ============================================

echo -e "${BLUE}📋 Step 1: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js $(node --version) found"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi
echo "✅ npm $(npm --version) found"

echo ""

# ============================================
# 2. Install Backend Dependencies
# ============================================

echo -e "${BLUE}📦 Step 2: Installing backend dependencies...${NC}"
cd "$PROJECT_ROOT/backend"

if npm install; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo ""

# ============================================
# 3. Install Frontend Dependencies
# ============================================

echo -e "${BLUE}📦 Step 3: Installing frontend dependencies...${NC}"
cd "$PROJECT_ROOT/frontend"

if npm install; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo ""

# ============================================
# 4. Check Environment Files
# ============================================

echo -e "${BLUE}🔧 Step 4: Checking environment configuration...${NC}"

# Backend .env
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "✅ Backend .env exists"
    
    if grep -q "BASE_WS_RPC_URL" "$PROJECT_ROOT/backend/.env"; then
        echo "✅ BASE_WS_RPC_URL configured"
    else
        echo -e "${YELLOW}⚠️  BASE_WS_RPC_URL not found in backend .env${NC}"
        echo "   Add: BASE_WS_RPC_URL=wss://sepolia.base.org"
    fi
else
    echo -e "${YELLOW}⚠️  Backend .env not found${NC}"
    echo "   Please create backend/.env with required variables"
fi

# Frontend .env
if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo "✅ Frontend .env exists"
    
    if grep -q "VITE_API_URL" "$PROJECT_ROOT/frontend/.env"; then
        echo "✅ VITE_API_URL configured"
    else
        echo -e "${YELLOW}⚠️  VITE_API_URL not found in frontend .env${NC}"
        echo "   Add: VITE_API_URL=http://localhost:3001"
    fi
else
    echo -e "${YELLOW}⚠️  Frontend .env not found${NC}"
    echo "   Creating default frontend/.env..."
    echo "VITE_API_URL=http://localhost:3001" > "$PROJECT_ROOT/frontend/.env"
    echo "✅ Created frontend/.env"
fi

echo ""

# ============================================
# 5. Database Setup Instructions
# ============================================

echo -e "${BLUE}🗄️  Step 5: Database setup${NC}"
echo ""
echo "To set up your database, run this SQL script in Supabase:"
echo ""
echo -e "${GREEN}$PROJECT_ROOT/backend/migrations/complete_blockchain_setup.sql${NC}"
echo ""
echo "This will create:"
echo "  ✓ blockchain_events table (Event Listeners)"
echo "  ✓ transactions table (Transaction Tracker)"
echo "  ✓ nfts table (NFT Minting)"
echo "  ✓ marketplace_listings table (Buy/Sell Flow)"
echo "  ✓ auctions table (Auction System)"
echo "  ✓ auction_bids table (Auction Bids)"
echo ""
echo "Steps:"
echo "  1. Go to your Supabase project dashboard"
echo "  2. Click 'SQL Editor'"
echo "  3. Create a new query"
echo "  4. Copy and paste the contents of complete_blockchain_setup.sql"
echo "  5. Click 'Run'"
echo ""

read -p "Have you run the database migration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please run the database migration before continuing${NC}"
    echo "   You can run the backend and frontend now, but database features won't work."
fi

echo ""

# ============================================
# 6. Verify Files Exist
# ============================================

echo -e "${BLUE}📁 Step 6: Verifying blockchain feature files...${NC}"

FILES_TO_CHECK=(
    # Backend Services
    "backend/src/services/blockchain.service.ts"
    "backend/src/services/transaction-tracker.service.ts"
    "backend/src/services/minting.service.ts"
    "backend/src/services/event-listener.service.ts"
    # Backend Routes
    "backend/src/routes/minting.ts"
    "backend/src/routes/events.ts"
    # Frontend Hooks
    "frontend/src/hooks/useBlockchain.ts"
    "frontend/src/hooks/useEventListener.ts"
    # Frontend Components
    "frontend/src/components/MintNFT.tsx"
    "frontend/src/components/AuctionSystem.tsx"
    "frontend/src/components/TransactionTracker.tsx"
    "frontend/src/components/EventFeed.tsx"
)

ALL_FILES_EXIST=true
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
    echo ""
    echo -e "${GREEN}✅ All blockchain feature files verified!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some files are missing. Please check the implementation.${NC}"
fi

echo ""

# ============================================
# 7. Summary
# ============================================

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                    ✅ SETUP COMPLETE! ✅                            ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start Backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Access Features:"
echo "   • NFT Minting:          http://localhost:5173/mint"
echo "   • Auction System:       http://localhost:5173/auctions"
echo "   • Transaction Tracker:  http://localhost:5173/transactions"
echo "   • Event Feed:           http://localhost:5173/events"
echo ""
echo "4. API Documentation:"
echo "   http://localhost:3001/api-docs"
echo ""
echo "📚 Documentation:"
echo "   • BLOCKCHAIN_FEATURES.md"
echo "   • BLOCKCHAIN_QUICK_REFERENCE.md"
echo "   • EVENT_LISTENER_GUIDE.md"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
