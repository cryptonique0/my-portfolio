#!/bin/bash

# BitArt Market - Quick Commands Reference
# Run this script to see all available commands

cat << 'EOF'

╔══════════════════════════════════════════════════════════════╗
║         BitArt Market - Quick Command Reference             ║
╔══════════════════════════════════════════════════════════════╗

📦 SETUP & INSTALLATION
═══════════════════════════════════════════════════════════════

  ./setup.sh                    # Complete automated setup
  ./start-dev.sh                # Start both backend & frontend

  # Manual installation
  cd backend && npm install
  cd frontend && npm install

🚀 DEVELOPMENT
═══════════════════════════════════════════════════════════════

  # Backend
  cd backend && npm run dev     # Start backend server (port 3001)
  cd backend && npm run build   # Build TypeScript

  # Frontend
  cd frontend && npm run dev    # Start frontend dev server (port 5173)
  cd frontend && npm run build  # Build for production
  cd frontend && npm run preview # Preview production build

🧪 TESTING
═══════════════════════════════════════════════════════════════

  # Backend tests
  cd backend && npm test                # Run all tests
  cd backend && npm run test:watch      # Watch mode
  cd backend && npm run test:coverage   # With coverage

  # Frontend tests
  cd frontend && npm test               # Run all tests
  cd frontend && npm run test:ui        # Vitest UI
  cd frontend && npm run test:coverage  # With coverage

🎨 CODE QUALITY
═══════════════════════════════════════════════════════════════

  # Linting
  cd backend && npm run lint            # Check backend
  cd frontend && npm run lint           # Check frontend
  cd backend && npm run lint:fix        # Auto-fix backend
  cd frontend && npm run lint:fix       # Auto-fix frontend

  # Formatting
  cd backend && npm run format          # Format backend
  cd frontend && npm run format         # Format frontend

📊 ANALYTICS & MONITORING
═══════════════════════════════════════════════════════════════

  # Server endpoints
  GET /api/analytics                    # Get analytics data
  GET /api/cache/stats                  # Cache statistics

🌐 REAL-TIME FEATURES
═══════════════════════════════════════════════════════════════

  # WebSocket connection
  ws://localhost:3001/ws                # WebSocket endpoint

  # Subscribe to channels
  { "type": "subscribe", "channel": "marketplace" }
  { "type": "subscribe", "channel": "auction" }

📧 EMAIL TESTING
═══════════════════════════════════════════════════════════════

  # Configure in backend/.env
  SMTP_HOST=smtp.gmail.com
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password

🌍 INTERNATIONALIZATION
═══════════════════════════════════════════════════════════════

  # Supported languages
  en - English
  es - Spanish
  fr - French
  zh - Chinese

📂 PROJECT STRUCTURE
═══════════════════════════════════════════════════════════════

  backend/
    src/
      __tests__/           # Tests
      middleware/          # Express middleware
      services/            # Business logic
      utils/              # Utilities
      validators/         # Zod schemas

  frontend/
    src/
      components/         # React components
      hooks/             # Custom hooks
      pages/             # Page components
      utils/             # Helper functions
      i18n/              # Translations

📝 GIT WORKFLOW
═══════════════════════════════════════════════════════════════

  # See COMMIT_GUIDE.md for 30 commit messages

  git add .
  git commit -m "feat: your feature description"
  git push origin main

🔧 USEFUL FILES
═══════════════════════════════════════════════════════════════

  IMPLEMENTATION_STATUS.md      # Complete status report
  NEW_FEATURES_SUMMARY.md       # All new features
  COMMIT_GUIDE.md              # Git commit messages
  COMPLETE_SUMMARY.md          # Project overview
  PROJECT_IMPROVEMENTS.md      # Original improvements

📖 DOCUMENTATION
═══════════════════════════════════════════════════════════════

  docs/API.md                  # API documentation
  docs/DEPLOYMENT.md           # Deployment guide
  CONTRIBUTING.md              # How to contribute
  SECURITY.md                  # Security policy

🐛 DEBUGGING
═══════════════════════════════════════════════════════════════

  # Check logs
  tail -f backend/logs/app.log

  # Check TypeScript errors
  cd backend && npx tsc --noEmit
  cd frontend && npx tsc --noEmit

  # Clear cache
  rm -rf node_modules package-lock.json
  npm install

🌐 ACCESS POINTS
═══════════════════════════════════════════════════════════════

  Frontend:     http://localhost:5173
  Backend API:  http://localhost:3001/api
  WebSocket:    ws://localhost:3001/ws

📦 DEPENDENCIES
═══════════════════════════════════════════════════════════════

  # Check versions
  cd backend && npm list --depth=0
  cd frontend && npm list --depth=0

  # Update dependencies
  cd backend && npm update
  cd frontend && npm update

  # Audit for vulnerabilities
  cd backend && npm audit
  cd frontend && npm audit
  cd backend && npm audit fix

🚀 DEPLOYMENT
═══════════════════════════════════════════════════════════════

  # Production build
  cd backend && npm run build
  cd frontend && npm run build

  # Start production
  cd backend && npm start
  
  # See DEPLOYMENT_GUIDE_XVERSE.md for full guide

🎯 QUICK TIPS
═══════════════════════════════════════════════════════════════

  1. Always run ./setup.sh first
  2. Check .env files are configured
  3. Run tests before committing
  4. Use ./start-dev.sh for quick start
  5. See COMMIT_GUIDE.md for commit messages
  6. Read IMPLEMENTATION_STATUS.md for overview

💡 COMMON ISSUES
═══════════════════════════════════════════════════════════════

  Issue: "Cannot find module"
  Fix: npm install in both backend and frontend

  Issue: "Port already in use"
  Fix: kill -9 $(lsof -t -i:3001) or change PORT in .env

  Issue: TypeScript errors
  Fix: Restart VS Code TypeScript server (Cmd+Shift+P > Restart TS Server)

  Issue: Git hooks not working
  Fix: npx husky install in both directories

📊 PROJECT STATS
═══════════════════════════════════════════════════════════════

  New Files:              62
  Total Dependencies:     1,771 packages
  Languages:              4 (EN, ES, FR, ZH)
  Custom Hooks:           10+
  UI Components:          7
  Utility Functions:      25+
  Bug Fixes:              9
  Commit Messages Ready:  30

═══════════════════════════════════════════════════════════════

✨ Need help? Check the documentation files above!
🚀 Ready to code? Run ./start-dev.sh

═══════════════════════════════════════════════════════════════

EOF
