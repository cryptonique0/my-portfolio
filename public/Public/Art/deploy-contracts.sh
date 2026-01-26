#!/bin/bash

# BitArt Market - Smart Contract Deployment Script
# This script helps deploy your Clarity contracts to Stacks

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  BitArt Market - Smart Contract Deploy${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_prerequisites() {
    echo -e "${BLUE}Checking Prerequisites...${NC}"
    echo ""
    
    # Check if contracts exist
    if [ ! -f "contracts/nft.clar" ]; then
        print_error "nft.clar not found"
        exit 1
    fi
    print_success "nft.clar found"
    
    if [ ! -f "contracts/marketplace.clar" ]; then
        print_error "marketplace.clar not found"
        exit 1
    fi
    print_success "marketplace.clar found"
    
    if [ ! -f "contracts/auction.clar" ]; then
        print_error "auction.clar not found"
        exit 1
    fi
    print_success "auction.clar found"
    
    echo ""
}

show_deployment_options() {
    echo -e "${BLUE}Deployment Options${NC}"
    echo ""
    echo "1) Deploy to Testnet (Recommended for testing)"
    echo "2) Deploy to Mainnet (Production - requires real STX)"
    echo "3) Check Clarinet Installation"
    echo "4) View Contract Code"
    echo "5) Test Contracts Locally"
    echo "6) View Deployment Instructions"
    echo "7) Exit"
    echo ""
}

check_clarinet() {
    if command -v clarinet &> /dev/null; then
        print_success "Clarinet is installed"
        clarinet --version
    else
        print_warning "Clarinet not found"
        echo ""
        echo "Install Clarinet with:"
        echo "  npm install -g @stacks/clarinet"
        echo ""
        return 1
    fi
}

view_contract() {
    echo ""
    echo -e "${BLUE}Which contract would you like to view?${NC}"
    echo "1) nft.clar"
    echo "2) marketplace.clar"
    echo "3) auction.clar"
    echo ""
    read -p "Enter choice (1-3): " contract_choice
    
    case $contract_choice in
        1)
            cat contracts/nft.clar | head -50
            echo ""
            print_warning "... (showing first 50 lines)"
            echo ""
            ;;
        2)
            cat contracts/marketplace.clar | head -50
            echo ""
            print_warning "... (showing first 50 lines)"
            echo ""
            ;;
        3)
            cat contracts/auction.clar | head -50
            echo ""
            print_warning "... (showing first 50 lines)"
            echo ""
            ;;
        *)
            echo "Invalid choice"
            ;;
    esac
}

test_contracts_locally() {
    echo -e "${BLUE}Testing Contracts Locally${NC}"
    echo ""
    
    if command -v clarinet &> /dev/null; then
        echo "Running: clarinet check"
        clarinet check
        print_success "Contract syntax verified"
        echo ""
    else
        print_error "Clarinet not installed"
        echo "Install with: npm install -g @stacks/clarinet"
        return 1
    fi
}

show_testnet_deployment() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Testnet Deployment Instructions${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    echo -e "${YELLOW}Step 1: Set Up Wallet${NC}"
    echo "1. Install Hiro Wallet: https://www.hiro.so/wallet"
    echo "2. Create/Import wallet"
    echo "3. Switch to Testnet in settings"
    echo "4. Copy your Stacks address (starts with SP...)"
    echo ""
    
    echo -e "${YELLOW}Step 2: Get Testnet STX${NC}"
    echo "1. Visit: https://testnet-faucet.stacks.org/"
    echo "2. Paste your Stacks address"
    echo "3. Receive 500 testnet STX"
    echo "4. Wait 5-10 minutes for arrival"
    echo ""
    
    echo -e "${YELLOW}Step 3: Deploy Contracts${NC}"
    echo "1. Go to: https://clarityrepl.io/"
    echo "2. Connect Hiro Wallet"
    echo "3. Select Network: Testnet"
    echo "4. Paste nft.clar code"
    echo "5. Click Deploy"
    echo "6. Approve transaction"
    echo "7. Repeat for marketplace.clar and auction.clar"
    echo ""
    
    echo -e "${YELLOW}Step 4: Verify on Explorer${NC}"
    echo "1. Visit: https://explorer.stacks.co/?chain=testnet"
    echo "2. Search for contract ID (SP.../bitart-nft)"
    echo "3. Verify contract code is visible"
    echo ""
    
    print_success "Testnet deployment takes 5-15 minutes per contract"
    echo ""
}

show_mainnet_deployment() {
    echo ""
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}  MAINNET DEPLOYMENT - PRODUCTION${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo ""
    
    echo -e "${RED}⚠ WARNING: This deploys REAL contracts with REAL STX costs${NC}"
    echo ""
    
    read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled"
        return
    fi
    
    echo ""
    echo -e "${YELLOW}Step 1: Verify Everything${NC}"
    echo "  ✓ Tested on testnet?"
    echo "  ✓ Contracts reviewed?"
    echo "  ✓ Wallet secure?"
    echo "  ✓ Have enough STX for fees (~150-250 STX)?"
    echo ""
    
    echo -e "${YELLOW}Step 2: Use Hiro Wallet${NC}"
    echo "1. Install: https://www.hiro.so/wallet"
    echo "2. Switch to Mainnet"
    echo "3. Ensure sufficient STX balance"
    echo ""
    
    echo -e "${YELLOW}Step 3: Deploy via clarityrepl.io${NC}"
    echo "1. Go to: https://clarityrepl.io/"
    echo "2. Connect Hiro Wallet (MAINNET)"
    echo "3. Deploy each contract in order:"
    echo "   a) nft.clar"
    echo "   b) marketplace.clar"
    echo "   c) auction.clar"
    echo "4. Approve transactions"
    echo "5. Wait for confirmations"
    echo ""
    
    echo -e "${YELLOW}Step 4: Update Application${NC}"
    echo "1. Note contract IDs"
    echo "2. Update frontend config"
    echo "3. Update backend config"
    echo "4. Deploy frontend & backend"
    echo ""
    
    print_warning "Mainnet deployment is permanent!"
    echo ""
}

show_full_instructions() {
    cat SMART_CONTRACT_DEPLOYMENT.md | head -100
    echo ""
    print_warning "... (showing first 100 lines)"
    echo ""
    echo "Read full guide: SMART_CONTRACT_DEPLOYMENT.md"
    echo ""
}

main() {
    print_header
    
    check_prerequisites
    
    while true; do
        show_deployment_options
        read -p "Enter your choice (1-7): " choice
        
        case $choice in
            1)
                show_testnet_deployment
                ;;
            2)
                show_mainnet_deployment
                ;;
            3)
                check_clarinet
                echo ""
                ;;
            4)
                view_contract
                ;;
            5)
                test_contracts_locally
                ;;
            6)
                show_full_instructions
                ;;
            7)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Try again."
                ;;
        esac
    done
}

main
