#!/bin/bash
# EXACT COMMANDS TO CREATE ALL PRS AND ISSUES
# Run these commands one by one or all at once

echo "🚀 Creating Pull Requests..."

# Authenticate first (if not already)
# gh auth login

# Create all PRs
gh pr create --head docs/add-contrib-templates --base main --title "docs: comprehensive contribution setup" --body "Adds CONTRIBUTING.md, ROADMAP.md, issue templates, Hardhat setup, deploy scripts, tests, and CI workflow. Complete foundation for contest project."

gh pr create --head fix/security-vulnerabilities --base main --title "docs: security vulnerabilities fix plan" --body "Documents 34 npm vulnerabilities and outlines migration from WalletConnect v1 to v2. Includes action items for dependency updates."

gh pr create --head feat/add-badges-readme --base main --title "feat: add project badges to README" --body "Adds professional badges: MIT license, Hardhat, Solidity 0.8.19, WalletConnect, and PRs Welcome badge."

gh pr create --head docs/add-license --base main --title "docs: add MIT license" --body "Adds MIT License to enable open-source contributions and clarify usage permissions."

gh pr create --head feat/add-gitignore --base main --title "feat: add comprehensive .gitignore" --body "Ignores node_modules, build artifacts, environment variables, IDE files, Hardhat cache, and deployment files."

gh pr create --head docs/improve-deployment-guide --base main --title "docs: add comprehensive deployment guide" --body "Step-by-step guide for Sepolia deployment with faucet links, verification process, troubleshooting, and CI/CD notes."

gh pr create --head feat/transaction-history --base main --title "feat: add transaction history component" --body "Tracks last 20 transactions in localStorage. Shows status (pending/confirmed/failed), copy hash button, view on Etherscan, and auto-refresh."

gh pr create --head feat/toast-notifications --base main --title "feat: add toast notification system" --body "Context-based toast provider with success/error/warning/info variants, auto-dismiss, smooth animations, and user-closeable."

gh pr create --head feat/wallet-connection-status --base main --title "feat: add wallet connection status widget" --body "Fixed-position status indicator showing address, network, balance with pulse animation. Auto-updates on connection changes."

gh pr create --head feat/copy-to-clipboard-util --base main --title "feat: add copy to clipboard utility" --body "Async clipboard API wrapper and reusable CopyButton component with visual feedback on successful copy."

gh pr create --head feat/dashboard-complete --base main --title "feat: implement dashboard with stats" --body "Complete dashboard showing total/successful transactions, gas spent, wallet balance, quick action buttons, and last activity."

gh pr create --head feat/mobile-responsive-styles --base main --title "feat: mobile responsive styles (WIP)" --body "Foundation for mobile-first responsive design. Ready for implementation."

gh pr create --head feat/dashboard-stats --base main --title "feat: dashboard stats component (WIP)" --body "Placeholder for enhanced stats visualization."

gh pr create --head feat/faucet-links --base main --title "feat: faucet integration (WIP)" --body "Quick links to testnet faucets for easy ETH acquisition."

gh pr create --head feat/transaction-details-modal --base main --title "feat: transaction details modal (WIP)" --body "Detailed transaction preview before signing."

gh pr create --head feat/address-book --base main --title "feat: address book (WIP)" --body "Save and manage frequently used addresses."

gh pr create --head feat/gas-speed-selector --base main --title "feat: gas speed selector (WIP)" --body "Choose transaction speed: slow/average/fast."

gh pr create --head feat/network-status-indicator --base main --title "feat: network status indicator (WIP)" --body "Show current gas prices and network congestion."

gh pr create --head feat/export-csv --base main --title "feat: export transaction history to CSV (WIP)" --body "Download transaction history as CSV file."

gh pr create --head feat/event-listener --base main --title "feat: contract event listener (WIP)" --body "Subscribe to and display contract events in real-time."

gh pr create --head feat/read-contract-functions --base main --title "feat: read contract functions (WIP)" --body "Call and display read-only contract functions."

echo "✅ All PRs created!"
echo ""
echo "🎯 Creating Issues..."

# Create 20 issues
gh issue create --title "Add animated demo GIF to README" --body "Create a short animated GIF (5s, ~800px width) showing:
- Wallet connection
- Network switch
- Claim tokens
- Transfer tokens

Place in \`demo/demo.gif\` and reference in README.md." --label "good first issue"

gh issue create --title "Improve mobile responsiveness" --body "Make all components fully responsive:
- Dashboard should stack cards on mobile
- Transaction history should be scrollable
- Buttons should be touch-friendly (min 44px)
- Test on iPhone and Android

Target: All components work perfectly on 375px width." --label "help wanted"

gh issue create --title "Add gas estimation before transactions" --body "Show gas cost estimate before user confirms transaction:
- Display in both ETH and USD
- Show slow/average/fast options
- Update in real-time based on network

Use ethers.js \`estimateGas\` and a price feed oracle." --label "help wanted"

gh issue create --title "Implement address book" --body "Allow users to save and label frequently used addresses:
- Store in localStorage
- Add/edit/delete addresses
- Use labels in transfer form dropdown
- Export/import address book

UI: Simple table with name, address, actions." --label "good first issue"

gh issue create --title "Add faucet integration" --body "Create a Faucet component with direct links:
- Sepolia faucets (Alchemy, QuickNode, etc.)
- Show user's balance
- Recommend amount to request
- Track faucet usage

Make it visible when balance < 0.01 ETH." --label "good first issue"

gh issue create --title "Create dashboard with advanced stats" --body "Enhance Dashboard.jsx with:
- Charts (transaction volume over time)
- Token distribution pie chart
- Gas spent by function
- Success rate percentage
- Average tx time

Use lightweight charting library (recharts or chart.js)." --label "help wanted"

gh issue create --title "Add export to CSV functionality" --body "Allow users to export transaction history:
- Generate CSV with columns: timestamp, hash, type, status, gas
- Download button in TransactionHistory component
- Optional: Export to JSON

Use native File API, no dependencies needed." --label "good first issue"

gh issue create --title "Implement contract event listeners" --body "Subscribe to contract events and display them:
- Listen for Transfer, Mint, Claim events
- Show in real-time activity feed
- Store recent events in localStorage
- Add event filters (by type, by address)

Use ethers.js event listeners with cleanup on unmount." --label "help wanted"

gh issue create --title "Add read-only contract functions viewer" --body "Create component to call and display read-only functions:
- Load contract ABI
- Show all \`view\` functions
- Display return values
- Auto-refresh option

Make it work with any ERC20 token address." --label "help wanted"

gh issue create --title "Improve error handling and messages" --body "Add better error messages for common failures:
- Insufficient funds → show balance and required amount
- Wrong network → show switch network button
- Rejected transaction → explain why
- RPC errors → suggest retry or alternative RPC

Create ErrorBoundary component with helpful recovery options." --label "good first issue"

gh issue create --title "Add loading states to all async operations" --body "Show loading spinners/skeletons for:
- Wallet connecting
- Transaction pending
- Balance loading
- Contract calls

Use consistent loading UI pattern across all components." --label "good first issue"

gh issue create --title "Implement dark mode toggle" --body "Add dark mode support:
- Toggle switch in header
- Store preference in localStorage
- Use CSS variables for colors
- Ensure all components support both modes

Make it accessible with proper ARIA labels." --label "help wanted"

gh issue create --title "Add network switcher component" --body "Auto-detect wrong network and provide switch button:
- Detect current network
- Show warning if not on Sepolia
- One-click switch using wallet_switchEthereumChain
- Handle MetaMask/WalletConnect differences

Use wagmi's useSwitchNetwork hook." --label "good first issue"

gh issue create --title "Improve accessibility (a11y)" --body "Audit and fix accessibility issues:
- Add ARIA labels to all interactive elements
- Ensure keyboard navigation works
- Test with screen reader
- Fix color contrast issues
- Add focus indicators

Target: WCAG 2.1 AA compliance." --label "help wanted"

gh issue create --title "Add keyboard shortcuts" --body "Implement useful keyboard shortcuts:
- \`C\` - Copy current address
- \`R\` - Refresh balances
- \`T\` - Open transfer modal
- \`Esc\` - Close modals
- \`?\` - Show keyboard shortcuts help

Use a hotkeys library or native event listeners." --label "good first issue"

gh issue create --title "Implement search/filter in transaction history" --body "Add search bar to TransactionHistory component:
- Filter by transaction type (claim, transfer, mint)
- Search by hash
- Filter by status
- Date range picker

Make it responsive and performant for 100+ transactions." --label "help wanted"

gh issue create --title "Add favorites/starred tokens" --body "Let users mark favorite tokens:
- Star icon next to tokens
- Show favorites at top of token selector
- Store in localStorage
- Quick access in dashboard

Simple boolean flag per token address." --label "good first issue"

gh issue create --title "Improve documentation with code examples" --body "Add code examples to documentation:
- How to add a new component
- How to integrate a new contract
- How to run tests
- How to deploy to different networks

Place examples in \`docs/examples/\` folder." --label "good first issue"

gh issue create --title "Add inline code comments for better maintainability" --body "Add JSDoc comments to all components:
- Describe component purpose
- Document props with @param
- Add usage examples
- Explain complex logic

Target: Every exported function/component has JSDoc." --label "good first issue"

gh issue create --title "Create video tutorial for setup and usage" --body "Record a 3-5 minute video tutorial showing:
- Clone and install
- Configure .env
- Deploy contract
- Use the dApp features

Upload to YouTube and link in README.
Helps judges quickly understand the project." --label "help wanted"

echo "✅ All 20 issues created!"
echo ""
echo "🎉 DONE! Now go merge some PRs and start implementing features!"
