#!/bin/bash

# BitArt Market - Simple Contract Deployment Script
# This script deploys contracts using the deploy.ts script

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   BitArt Contract Deployment Script   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

check_environment() {
    print_info "Checking environment..."
    
    if [ ! -f ".env.contracts" ]; then
        print_error ".env.contracts not found"
        echo "Create it with:"
        echo "  cp .env.contracts.example .env.contracts"
        exit 1
    fi
    print_success ".env.contracts found"
    
    # Load environment
    source .env.contracts
    
    if [ -z "$STACKS_PRIVATE_KEY" ] || [ "$STACKS_PRIVATE_KEY" = "your_private_key_here" ]; then
        print_error "STACKS_PRIVATE_KEY not set"
        echo "Update .env.contracts with your private key"
        exit 1
    fi
    print_success "Private key configured"
    
    print_success "Network: ${STACKS_NETWORK:-testnet}"
}

check_contracts() {
    print_info "Checking contract files..."
    
    contracts=(
        "contracts/nft.clar"
        "contracts/marketplace.clar"
        "contracts/auction.clar"
    )
    
    for contract in "${contracts[@]}"; do
        if [ ! -f "$contract" ]; then
            print_error "$contract not found"
            exit 1
        fi
        print_success "$contract found"
    done
}

check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        echo "Install from: https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js installed"
    
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found, installing..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies installed"
    fi
}

deploy_contracts() {
    print_info "Starting deployment..."
    echo ""
    
    # Check if deploy.ts exists
    if [ ! -f "deploy.ts" ]; then
        print_error "deploy.ts not found"
        exit 1
    fi
    
    # Run deployment
    npx tsx deploy.ts
    
    if [ $? -eq 0 ]; then
        print_success "Deployment completed"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

show_next_steps() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}📋 NEXT STEPS${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    echo "1. Verify your contracts on Stacks Explorer:"
    echo "   https://explorer.stacks.co/?chain=${STACKS_NETWORK}"
    echo ""
    echo "2. Update your application with contract addresses:"
    echo "   - frontend/src/services/wallet.ts"
    echo "   - backend/src/config/contracts.ts"
    echo ""
    echo "3. Test contract functions"
    echo ""
    echo "4. Deploy your application"
    echo ""
}

main() {
    print_header
    echo ""
    
    check_environment
    echo ""
    
    check_contracts
    echo ""
    
    check_dependencies
    echo ""
    
    read -p "Proceed with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    deploy_contracts
    show_next_steps
}

main
