#!/bin/bash
# Setup and Deploy Script - Base Mainnet + Stacks Testnet
# Run this script to automate deployment setup

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 WEB3 RESUME - BASE MAINNET + STACKS TESTNET SETUP   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}STEP 1: Install Dependencies${NC}"
echo "================================"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

echo -e "${BLUE}STEP 2: Compile Smart Contracts${NC}"
echo "================================"
npm run compile
echo -e "${GREEN}✓ Contracts compiled${NC}\n"

echo -e "${BLUE}STEP 3: Environment Configuration${NC}"
echo "================================"
if [ -f .env.local ]; then
  echo -e "${YELLOW}ℹ️  .env.local already exists${NC}"
else
  echo "Creating .env.local from template..."
  cp .env.local.example .env.local
  echo -e "${YELLOW}⚠️  Edit .env.local with your values:${NC}"
  echo "   - PRIVATE_KEY: Your deployment wallet key"
  echo "   - BASE_RPC_URL: Already configured"
  echo "   - STACKS_TESTNET_RPC_URL: Already configured"
  echo "   - BASESCAN_API_KEY: Get from https://basescan.org/apis"
  echo ""
  echo -e "${RED}📌 IMPORTANT: Edit .env.local before continuing!${NC}"
  echo ""
  read -p "Press Enter after editing .env.local..."
fi
echo -e "${GREEN}✓ Environment configured${NC}\n"

echo -e "${BLUE}STEP 4: Verify Wallet Funding${NC}"
echo "================================"
echo -e "${YELLOW}Check your wallet balances:${NC}"
echo ""
echo "📊 BASE MAINNET:"
echo "   - Network: Base Mainnet (Chain ID: 8453)"
echo "   - Required: 0.01 - 0.05 ETH"
echo "   - Check: https://basescan.org/ → search your address"
echo "   - Get ETH: Bridge from ETH at https://bridge.base.org/"
echo ""
echo "📊 STACKS TESTNET:"
echo "   - Network: Stacks Testnet (Chain ID: 2147483648)"
echo "   - Required: 0.5 - 2.0 STX (free)"
echo "   - Get STX: https://faucet.testnet.stacks.co/"
echo "   - Check: https://testnet-api.stacks.co/v2/accounts/{your-address}"
echo ""
read -p "Once funded, press Enter to continue..."
echo -e "${GREEN}✓ Wallet funding verified${NC}\n"

echo -e "${BLUE}STEP 5: Deploy to Base Mainnet${NC}"
echo "================================"
echo -e "${YELLOW}Starting EVM contract deployment...${NC}"
echo ""
npm run deploy:base-mainnet
echo ""
echo -e "${GREEN}✓ Base Mainnet deployment complete${NC}\n"

echo -e "${BLUE}STEP 6: Save Base Contract Address${NC}"
echo "================================"
if [ -f deployment-info/base-mainnet-deployment.json ]; then
  BASE_ADDRESS=$(grep -o '"OnChainResumeEnhanced":"[^"]*' deployment-info/base-mainnet-deployment.json | cut -d'"' -f4)
  echo -e "${GREEN}📌 Base Mainnet Contract Address:${NC}"
  echo "   $BASE_ADDRESS"
  echo ""
  echo "Update your .env.local with:"
  echo "   NEXT_PUBLIC_CONTRACT_ADDRESS=$BASE_ADDRESS"
else
  echo -e "${RED}⚠️  Deployment info not found${NC}"
  echo "Check: cat deployment-info/base-mainnet-deployment.json"
fi
echo ""
read -p "Press Enter after updating .env.local..."
echo -e "${GREEN}✓ Contract address saved${NC}\n"

echo -e "${BLUE}STEP 7: Deploy to Stacks Testnet${NC}"
echo "================================"
echo -e "${YELLOW}Two options:${NC}"
echo ""
echo "A) Use Stacks Web IDE (Easiest - no setup)"
echo "   1. Go to: https://www.hiro.so/remix"
echo "   2. Create new project"
echo "   3. Copy: contracts/OnChainResume.clar"
echo "   4. Click Deploy → Confirm in wallet"
echo ""
echo "B) Use Clarinet (Recommended - CLI)"
echo "   1. brew install clarinet"
echo "   2. clarinet new talent-resume && cd talent-resume"
echo "   3. cp ../contracts/OnChainResume.clar contracts/"
echo "   4. clarinet integrate"
echo ""
echo "C) Automated (requires setup)"
echo "   npm run deploy:stacks-testnet"
echo ""
read -p "After deploying, press Enter..."
echo -e "${GREEN}✓ Stacks Testnet deployment complete${NC}\n"

echo -e "${BLUE}STEP 8: Update Environment Variables${NC}"
echo "================================"
echo "Edit .env.local and add:"
echo "   NEXT_PUBLIC_STACKS_RESUME_CONTRACT_TESTNET=ST..."
echo ""
read -p "Press Enter after updating..."
echo -e "${GREEN}✓ Environment variables updated${NC}\n"

echo -e "${BLUE}STEP 9: Verify Deployments${NC}"
echo "================================"
echo ""
echo "Base Mainnet:"
echo "   Check: https://basescan.org/"
echo "   Search: Your contract address"
echo "   Expected: OnChainResumeEnhanced contract, 10 badges"
echo ""
echo "Stacks Testnet:"
echo "   Check: https://explorer.stacks.co/?chain=testnet"
echo "   Search: Your contract address"
echo "   Expected: Deployment transaction confirmed"
echo ""
read -p "After verifying, press Enter..."
echo -e "${GREEN}✓ Deployments verified${NC}\n"

echo -e "${BLUE}STEP 10: Ready to Use${NC}"
echo "================================"
echo ""
echo "Your Web3 Resume platform is now deployed!"
echo ""
echo "🎯 Next Steps:"
echo "   1. Start development server: npm run dev"
echo "   2. Navigate to: http://localhost:3000"
echo "   3. Connect wallet (MetaMask/Hiro)"
echo "   4. Test creating a profile"
echo "   5. Verify contract interactions"
echo ""
echo "📚 Documentation:"
echo "   - DEPLOY_COMPLETE_GUIDE.md - Full deployment guide"
echo "   - DEPLOY_CHEATSHEET.md - Quick reference"
echo "   - DEPLOYMENT_BASE_STACKS.md - Detailed instructions"
echo ""
echo "🌐 Live Contracts:"
echo "   - Base Mainnet: https://basescan.org/address/..."
echo "   - Stacks Testnet: https://explorer.stacks.co/?chain=testnet"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗"
echo "║                   ✅ SETUP COMPLETE! 🎉                      ║"
echo "║          Ready for production use and testing                ║"
echo "╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Display deployment info
if [ -f deployment-info/base-mainnet-deployment.json ]; then
  echo "📋 Deployment Summary:"
  cat deployment-info/base-mainnet-deployment.json | jq '.' 2>/dev/null || cat deployment-info/base-mainnet-deployment.json
fi
