#!/bin/bash

# BitArt Market - Deployment Quick Reference
# This script provides helper commands for deployment tasks

set -e

echo "================================"
echo "BitArt Market - Deployment Tools"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "${BLUE}==== $1 ===${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verify builds
verify_builds() {
    print_section "Verifying Builds"
    
    echo "Building backend..."
    npm run build --workspace backend
    print_success "Backend build successful"
    
    echo "Building frontend..."
    npm run build --workspace frontend
    print_success "Frontend build successful"
    
    echo ""
    echo "Build artifacts:"
    echo "  - Backend: backend/dist/index.js"
    echo "  - Frontend: frontend/dist/index.html"
}

# Deploy backend to Render
deploy_backend_render() {
    print_section "Backend Deployment (Render)"
    echo ""
    echo "Manual steps to deploy to Render:"
    echo "1. Go to https://render.com"
    echo "2. Create new Web Service"
    echo "3. Connect GitHub repository"
    echo "4. Set Build Command:"
    echo "     npm run build --workspace backend"
    echo "5. Set Start Command:"
    echo "     node backend/dist/index.js"
    echo "6. Add environment variables from .env.production.backend"
    echo "7. Click 'Deploy'"
    echo ""
    print_warning "Backend will be available at: https://bitart-market-api.onrender.com"
}

# Deploy frontend to Vercel
deploy_frontend_vercel() {
    print_section "Frontend Deployment (Vercel)"
    echo ""
    echo "Option 1: Using Vercel CLI (recommended)"
    echo "  $ vercel login"
    echo "  $ vercel --prod"
    echo ""
    echo "Option 2: GitHub integration"
    echo "  1. Go to https://vercel.com"
    echo "  2. Import GitHub repository"
    echo "  3. Set Build Command: npm run build --workspace frontend"
    echo "  4. Set Output Directory: frontend/dist"
    echo "  5. Add environment variables from .env.production.frontend"
    echo "  6. Deploy"
    echo ""
    print_warning "Frontend will be available at: https://bitart-market.vercel.app"
}

# Test deployed services
test_deployment() {
    print_section "Testing Deployed Services"
    
    if [ -z "$BACKEND_URL" ]; then
        BACKEND_URL="http://localhost:3001"
        print_warning "Using local backend: $BACKEND_URL"
    fi
    
    if [ -z "$FRONTEND_URL" ]; then
        FRONTEND_URL="http://localhost:5173"
        print_warning "Using local frontend: $FRONTEND_URL"
    fi
    
    echo "Testing backend health endpoint..."
    if curl -s "$BACKEND_URL/api/celo/health" > /dev/null; then
        print_success "Backend is responding"
    else
        echo "  Could not reach $BACKEND_URL/api/celo/health"
    fi
    
    echo "Testing frontend..."
    if curl -s "$FRONTEND_URL" > /dev/null; then
        print_success "Frontend is responding"
    else
        echo "  Could not reach $FRONTEND_URL"
    fi
}

# Show environment variable templates
show_env_template() {
    print_section "Environment Variables Required"
    
    echo ""
    echo "Backend (.env or Render dashboard):"
    echo "  NODE_ENV=production"
    echo "  PORT=3001"
    echo "  STACKS_API_URL=https://api.mainnet.stacks.co"
    echo "  STACKS_NETWORK=mainnet"
    echo "  CELO_RPC_URL=https://forno.celo.org"
    echo "  CELO_CHAIN_ID=42220"
    echo "  PINATA_API_KEY=<your_key>"
    echo "  PINATA_SECRET_API_KEY=<your_secret>"
    echo "  CORS_ORIGIN=https://bitart-market.vercel.app"
    echo ""
    echo "Frontend (Vercel dashboard):"
    echo "  VITE_API_URL=https://bitart-market-api.onrender.com"
    echo "  VITE_STACKS_API_URL=https://api.mainnet.stacks.co"
    echo "  VITE_STACKS_NETWORK=mainnet"
    echo "  VITE_CELO_RPC_URL=https://forno.celo.org"
    echo "  VITE_CELO_CHAIN_ID=42220"
}

# Main menu
if [ $# -eq 0 ]; then
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  verify      - Verify both backend and frontend builds"
    echo "  backend     - Show backend deployment instructions (Render)"
    echo "  frontend    - Show frontend deployment instructions (Vercel)"
    echo "  test        - Test deployed services"
    echo "  env         - Show environment variable templates"
    echo "  all         - Show all deployment info"
    echo ""
    echo "Example: ./deploy.sh verify"
else
    case "$1" in
        verify)
            verify_builds
            ;;
        backend)
            deploy_backend_render
            ;;
        frontend)
            deploy_frontend_vercel
            ;;
        test)
            test_deployment
            ;;
        env)
            show_env_template
            ;;
        all)
            verify_builds
            echo ""
            show_env_template
            echo ""
            deploy_backend_render
            echo ""
            deploy_frontend_vercel
            ;;
        *)
            echo "Unknown command: $1"
            echo "Run: ./deploy.sh for usage"
            exit 1
            ;;
    esac
fi

echo ""
print_success "Deployment reference complete!"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
