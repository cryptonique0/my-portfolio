#!/bin/bash

# Script to update contract address after Remix deployment
# Usage: ./update-contract-address.sh <CONTRACT_ADDRESS>

if [ -z "$1" ]; then
    echo "❌ Error: Contract address is required"
    echo "Usage: ./update-contract-address.sh <CONTRACT_ADDRESS>"
    exit 1
fi

CONTRACT_ADDRESS=$1

# Validate address format
if [[ ! $CONTRACT_ADDRESS =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "❌ Error: Invalid Ethereum address format"
    echo "Address should be 42 characters starting with 0x"
    exit 1
fi

echo "📝 Updating contract address to: $CONTRACT_ADDRESS"

# Update .env.local
if [ -f .env.local ]; then
    # Check if line exists
    if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS=" .env.local; then
        # Update existing line
        sed -i "s/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env.local
        echo "✅ Updated NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local"
    else
        # Add new line
        echo "" >> .env.local
        echo "# Contract Deployment" >> .env.local
        echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env.local
        echo "NEXT_PUBLIC_NETWORK=base" >> .env.local
        echo "NEXT_PUBLIC_CHAIN_ID=8453" >> .env.local
        echo "✅ Added contract address to .env.local"
    fi
else
    echo "⚠️  Warning: .env.local not found, creating it..."
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > .env.local
    echo "NEXT_PUBLIC_NETWORK=base" >> .env.local
    echo "NEXT_PUBLIC_CHAIN_ID=8453" >> .env.local
    echo "✅ Created .env.local with contract address"
fi

# Update src/lib/contract.ts
if [ -f src/lib/contract.ts ]; then
    sed -i "s/export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';/export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '$CONTRACT_ADDRESS';/" src/lib/contract.ts
    echo "✅ Updated src/lib/contract.ts with fallback address"
fi

# Create deployment record
mkdir -p deployments
cat > deployments/base-mainnet.json << EOF
{
  "contractAddress": "$CONTRACT_ADDRESS",
  "network": "base",
  "chainId": 8453,
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployer": "Deployed via Remix",
  "explorer": "https://basescan.org/address/$CONTRACT_ADDRESS"
}
EOF
echo "✅ Created deployment record in deployments/base-mainnet.json"

echo ""
echo "🎉 Contract address updated successfully!"
echo ""
echo "📍 Contract Address: $CONTRACT_ADDRESS"
echo "🌐 Network: Base Mainnet (Chain ID: 8453)"
echo "🔍 View on BaseScan: https://basescan.org/address/$CONTRACT_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Verify your contract on BaseScan"
echo "2. Run: npm run dev"
echo "3. Test the application with your deployed contract"
