# Monitoring Configuration Guide

## Overview
This document provides setup instructions for the error tracking and monitoring services integrated into BitArt Market.

## Backend Monitoring (Sentry)

### Configuration File
- Location: `backend/src/config/sentry.ts`
- Initialized in: `backend/src/index.ts`

### Setup Instructions

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Create a new project for Node.js
   - Get your DSN from project settings

2. **Configure Environment Variables**
   ```bash
   # In backend/.env
   ENABLE_SENTRY=true
   SENTRY_DSN=https://your-key@your-sentry-id.ingest.sentry.io/your-project-id
   ```

3. **Features Enabled**
   - Error tracking and reporting
   - Performance monitoring (10% sample rate in production)
   - HTTP request/response tracking
   - Express.js integration
   - Automatic breadcrumb collection (up to 50 breadcrumbs)

4. **Customizations**
   - Non-critical errors are filtered out automatically
   - Environment-based configuration
   - Errors in development are always captured (100% sample rate)

### Testing Sentry

```typescript
// In any backend route or service
import { Sentry } from './config/sentry';

// Capture an exception
try {
  // your code
} catch (error) {
  Sentry.captureException(error);
}

// Capture a message
Sentry.captureMessage('Important event occurred', 'info');
```

---

## Frontend Monitoring (LogRocket)

### Configuration File
- Location: `frontend/src/config/logrocket.ts`
- To integrate in App.tsx:

```typescript
import { initLogRocket } from './config/logrocket';

// In your App component useEffect
useEffect(() => {
  initLogRocket();
}, []);
```

### Setup Instructions

1. **Create LogRocket Account**
   - Go to [logrocket.com](https://logrocket.com)
   - Create a new project
   - Get your App ID from project settings

2. **Configure Environment Variables**
   ```bash
   # In frontend/.env
   VITE_ENABLE_LOGROCKET=true
   VITE_LOGROCKET_APP_ID=your-app-id
   ```

3. **Features Enabled**
   - Session replay recording
   - Console error capturing
   - Network request tracking
   - DOM mutation tracking
   - Automatic error boundaries

4. **Privacy & Security**
   - Authorization headers are automatically stripped
   - Password inputs are never captured
   - Token/key fields are redacted
   - Response bodies are not stored

### Testing LogRocket

```typescript
// In any frontend component
import LogRocket from 'logrocket';

// Manual event logging
LogRocket.getSessionURL(sessionURL => {
  console.log('Session replay:', sessionURL);
});

// Identify user
LogRocket.identify('user-id', {
  name: 'User Name',
  email: 'user@example.com'
});
```

---

## Environment Variables Quick Reference

### Backend (.env)
```bash
# Sentry Configuration
ENABLE_SENTRY=true                                    # Set to true to enable error tracking
SENTRY_DSN=https://your-key@id.ingest.sentry.io/xxx  # Get from sentry.io project
```

### Frontend (.env)
```bash
# LogRocket Configuration
VITE_ENABLE_LOGROCKET=true              # Set to true to enable session replay
VITE_LOGROCKET_APP_ID=your-app-id       # Get from logrocket.com project
```

---

## Monitoring Stack Overview

| Service    | Type              | Purpose                  | Status        |
|-----------|-------------------|--------------------------|---------------|
| Sentry    | Error Tracking    | Backend errors & perf    | ✅ Configured |
| LogRocket | Session Replay    | Frontend UX monitoring   | ✅ Configured |
| Datadog   | APM               | Full-stack monitoring    | 📝 Optional   |

---

## Gamification API Endpoints

All endpoints available at: `http://localhost:3001/api/gamification`

### XP System
- `GET /xp/user/:userId` - Get user XP and level
- `POST /xp/award` - Award XP to user
- `GET /xp/levels` - Get level configuration
- `GET /xp/history/:userId` - Get XP history
- `GET /xp/leaderboard` - Get XP leaderboard

### Achievements
- `GET /achievements` - List all achievements
- `GET /achievements/user/:userId` - Get user achievements
- `POST /achievements/unlock` - Unlock achievement
- `GET /achievements/progress` - Get achievement progress

### Daily Rewards
- `GET /rewards/daily/:userId` - Get daily rewards
- `POST /rewards/daily/claim` - Claim daily reward
- `GET /rewards/daily/history/:userId` - Get reward history

### Lucky Draw
- `GET /rewards/lucky-draw/prizes` - List prizes
- `POST /rewards/lucky-draw/spin` - Spin the wheel
- `POST /rewards/lucky-draw/claim` - Claim prize
- `GET /rewards/lucky-draw/can-draw/:userId` - Check if can draw
- `GET /rewards/lucky-draw/history/:userId` - Draw history

---

## Deployment Checklist

- [ ] Sentry project created and DSN obtained
- [ ] LogRocket project created and App ID obtained
- [ ] Environment variables configured for production
- [ ] Backend configured with ENABLE_SENTRY=true
- [ ] Frontend configured with VITE_ENABLE_LOGROCKET=true
- [ ] SSL certificate installed for HTTPS
- [ ] Supabase database configured with gamification schema
- [ ] Tested error tracking in staging environment
- [ ] Configured alerts in Sentry/LogRocket dashboards

---

## Support & Documentation

- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/node-express/)
- [LogRocket Docs](https://docs.logrocket.com/reference)
- [Gamification Guide](./GAMIFICATION_GUIDE.md)
- [Environment Configuration](../.env.example)
