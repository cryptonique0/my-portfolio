# Analytics Dashboard Implementation - Complete Guide

## Overview
Implemented a comprehensive Analytics Dashboard with Google Analytics integration, custom event tracking, conversion funnels, user behavior analysis, and heatmaps for the BitArt NFT marketplace.

---

## 1. Google Analytics Integration ✅

### Service: [google-analytics.service.ts](frontend/src/services/google-analytics.service.ts)

**Features:**
- GA4 initialization with measurement ID
- Event tracking
- Conversion tracking
- Exception/error tracking
- User ID and properties tracking
- Cross-device tracking support

**Initialization in [main.tsx](frontend/src/main.tsx):**
```typescript
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
analyticsService.init({
  measurementId: measurementId,
  debug: import.meta.env.DEV
});
```

**Environment Variable Required:**
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Usage:**
```typescript
import { analyticsService } from '../services/google-analytics.service';

// Track page view
analyticsService.trackPageView('/nft/123', 'NFT Detail Page');

// Track custom event
analyticsService.trackEvent('nft_view', {
  nft_id: '123',
  price: 100,
  currency: 'STX'
});

// Track conversion
analyticsService.trackConversion('purchase', 100, 'STX');

// Set user ID
analyticsService.setUserId('user_123');
```

---

## 2. Custom Event Tracking ✅

### Service: [event-tracking.service.ts](frontend/src/services/event-tracking.service.ts)

**Pre-defined Events:**
- `trackNFTView(nftId, nftName, price)` - Track NFT views
- `trackSearch(query, resultsCount, filters)` - Track searches
- `trackCollectionView(collectionId, collectionName, itemCount)` - Track collection views
- `trackOfferCreated(nftId, amount, currency)` - Track offer creation
- `trackOfferAccepted(nftId, amount, currency)` - Track purchases
- `trackOfferCountered(nftId, counterAmount)` - Track counter offers
- `trackLogin(wallet, method)` - Track user login
- `trackSignup(wallet)` - Track new signups
- `trackLogout(wallet)` - Track logouts
- `trackWishlistAdd(nftId, nftName)` - Track wishlist additions
- `trackCollectionAdd(collectionId, collectionName)` - Track collection creation
- `trackFilterUsage(filters)` - Track filter usage
- `trackTimeOnPage(page, duration)` - Track time spent
- `trackClickEvent(element, x, y)` - Track clicks with position
- `trackScrollDepth(page, percentage)` - Track scroll depth
- `trackVideoPlay(videoId, videoTitle)` - Track video plays
- `trackCustomEvent(eventName, eventData)` - Track custom events

**Usage:**
```typescript
import { eventTrackingService } from '../services/event-tracking.service';

// Track NFT view
eventTrackingService.trackNFTView('nft_123', 'Amazing Art', 100);

// Track offer creation
eventTrackingService.trackOfferCreated('nft_123', 50);

// Track purchase
eventTrackingService.trackOfferAccepted('nft_123', 100);
```

---

## 3. Analytics Data Service ✅

### Service: [analytics-data.service.ts](frontend/src/services/analytics-data.service.ts)

**API Endpoints (Backend):**
- `POST /api/analytics/events` - Track event
- `GET /api/analytics/funnel` - Get conversion funnel
- `GET /api/analytics/user-flow` - Get user flow
- `GET /api/analytics/user-behavior` - Get user behavior
- `GET /api/analytics/heatmap?page=URL` - Get heatmap data
- `GET /api/analytics/events/:eventName` - Get event analytics
- `GET /api/analytics/summary` - Get dashboard summary
- `GET /api/analytics/retention` - Get retention cohorts

**Usage:**
```typescript
import { analyticsDataService } from '../services/analytics-data.service';

// Get conversion funnel
const funnel = await analyticsDataService.getConversionFunnel({
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

// Get user flow
const flow = await analyticsDataService.getUserFlow();

// Get heatmap data
const heatmap = await analyticsDataService.getHeatmapData('/nft/:id');
```

---

## 4. Frontend Components ✅

### A. Conversion Funnel Component
**File:** [frontend/src/components/analytics/ConversionFunnel.tsx](frontend/src/components/analytics/ConversionFunnel.tsx)

**Features:**
- Funnel visualization (Browse → View → Offer → Purchase → Repeat)
- Conversion rate calculation
- Step-by-step metrics
- Date range filtering

**Usage:**
```tsx
<ConversionFunnel dateRange={{startDate: '2025-01-01', endDate: '2025-01-31'}} />
```

### B. User Behavior Analysis Component
**File:** [frontend/src/components/analytics/UserBehaviorAnalysis.tsx](frontend/src/components/analytics/UserBehaviorAnalysis.tsx)

**Features:**
- User journey flow diagram (Sankey)
- Session duration metrics
- Retention rates
- Engagement patterns
- Bounce rate analysis

**Key Metrics:**
- Total users
- Average session duration
- Retention rate
- Bounce rate
- High/Medium/Low engagement breakdown

**Usage:**
```tsx
<UserBehaviorAnalysis timeframe="month" />
```

### C. Heatmap Component
**File:** [frontend/src/components/analytics/Heatmap.tsx](frontend/src/components/analytics/Heatmap.tsx)

**Features:**
- Interactive heatmap visualization
- Click tracking and visualization
- Element identification
- Color gradient (cool to hot)
- Top clicked elements list

**Usage:**
```tsx
<Heatmap pageUrl="/nft/:id" width={1200} height={800} />
```

### D. Custom Event Tracking Component
**File:** [frontend/src/components/analytics/CustomEventTracking.tsx](frontend/src/components/analytics/CustomEventTracking.tsx)

**Features:**
- Event count and trends
- User conversion tracking
- Event properties breakdown
- Geographic and device insights

**Usage:**
```tsx
<CustomEventTracking eventName="nft_view" dateRange={dateRange} />
```

---

## 5. Analytics Dashboard Page ✅

**File:** [frontend/src/pages/AnalyticsDashboard.tsx](frontend/src/pages/AnalyticsDashboard.tsx)

**Route:** `/analytics-dashboard`

**Features:**
- **Overview Tab:** Key metrics, activity trends, top events
- **Funnel Tab:** Conversion funnel visualization
- **Behavior Tab:** User journey flow and engagement patterns
- **Events Tab:** Custom event tracking for multiple events
- **Heatmap Tab:** Click heatmaps for key pages

**Key Metrics Displayed:**
- Total Users
- NFTs Created
- Total Offers
- Transactions
- User Growth
- Offer Growth
- Purchase Growth

---

## 6. Backend Integration ✅

### Analytics Routes: [backend/src/routes/analytics-advanced.ts](backend/src/routes/analytics-advanced.ts)

**Endpoints:**
```
POST /api/analytics/events
  - Track custom analytics events
  - Headers: Authorization: Bearer <token>
  - Body: { eventName, eventData, sessionId, userId }

GET /api/analytics/funnel
  - Get conversion funnel data
  - Query: startDate, endDate (optional)
  - Returns: FunnelStep[] with users, conversions, rates

GET /api/analytics/user-flow
  - Get user journey data
  - Returns: UserFlow[] with source, destination, count, bounceRate

GET /api/analytics/user-behavior
  - Get user behavior metrics
  - Query: timeframe (today|week|month)
  - Returns: UserBehavior[] with sessions, duration, engagement

GET /api/analytics/heatmap?page=URL
  - Get heatmap data for specific page
  - Returns: HeatmapPoint[] with x, y, value, element

GET /api/analytics/events/:eventName
  - Get specific event analytics
  - Query: startDate, endDate (optional)
  - Returns: event count, unique users, properties

GET /api/analytics/summary
  - Get dashboard summary metrics
  - Returns: totalUsers, activeUsers, nfts, offers, transactions, volume

GET /api/analytics/retention
  - Get retention cohorts
  - Returns: cohort analysis by sign-up date
```

### Database Schema: [database-migration-analytics.sql](database-migration-analytics.sql)

**Tables:**
- `analytics_events` - Stores all tracked events
- `analytics_summary` - Stores aggregated metrics
- `heatmap_data` - Stores click position data

**Indexes:**
- `idx_analytics_event_name` - Query by event name
- `idx_analytics_session_id` - Query by session
- `idx_analytics_user_id` - Query by user
- `idx_analytics_created_at` - Time range queries
- `idx_heatmap_page_url` - Query by page
- `idx_heatmap_created_at` - Time range queries

---

## 7. React Hooks ✅

### usePageTracking Hook
```typescript
import { usePageTracking } from '../hooks/useAnalytics';

// Automatically track scroll, clicks, and time on page
usePageTracking('marketplace');
```

### useEventTracking Hook
```typescript
import { useEventTracking } from '../hooks/useAnalytics';

const { trackNFTView, trackOfferCreated, trackCustomEvent } = useEventTracking();

// Track events in your component
trackNFTView('nft_123', 'Artwork Title', 100);
```

---

## 8. Environment Configuration

### Frontend (.env.local)
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```bash
# Already configured, no additional vars needed
```

---

## 9. Implementation Checklist

### Setup Steps:
1. ✅ Install dependencies: `npm install recharts`
2. ✅ Create database migration: `database-migration-analytics.sql`
3. ✅ Run migration on Supabase
4. ✅ Set `VITE_GA_MEASUREMENT_ID` environment variable
5. ✅ Add analytics route to App.tsx

### Integration Steps:
1. ✅ Import hooks in components that need tracking
2. ✅ Add `usePageTracking('pageName')` to pages
3. ✅ Add `useEventTracking()` to components
4. ✅ Call tracking methods on user interactions

### Example: Tracking NFT View
```tsx
import { useEventTracking, usePageTracking } from '../hooks/useAnalytics';

const NFTDetailPage: React.FC = () => {
  usePageTracking('nft_detail');
  const { trackNFTView } = useEventTracking();

  useEffect(() => {
    // Track NFT view on load
    trackNFTView(nft.id, nft.name, nft.price);
  }, [nft, trackNFTView]);

  return (
    // Component JSX
  );
};
```

---

## 10. Data Flow

### Event Tracking Flow:
```
User Action
    ↓
eventTrackingService.trackEvent()
    ↓
analyticsService.trackEvent() [GA4]
    ↓
(Optional) analyticsDataService.trackEventToBackend()
    ↓
Backend /api/analytics/events
    ↓
analytics_events table
    ↓
Dashboard aggregation
    ↓
Analytics Dashboard UI
```

### Dashboard Data Flow:
```
Analytics Dashboard
    ↓
analyticsDataService.getFunnel/UserFlow/Behavior()
    ↓
Backend /api/analytics/* endpoints
    ↓
Database queries
    ↓
Component visualization (Recharts)
```

---

## 11. Visualization Libraries

**Recharts** - Primary charting library used for:
- LineChart (activity trends)
- BarChart (event counts)
- FunnelChart (conversion visualization)
- AreaChart (event trends)
- Sankey (user flow)

**Custom Canvas** - Heatmap visualization

---

## 12. Performance Considerations

- **Session ID:** Generated per user session for event grouping
- **Event Batching:** Events automatically batched by browser
- **Lazy Loading:** Charts load only when tab is active
- **Data Caching:** Query results cached where applicable
- **RLS Security:** All analytics queries protected with RLS policies

---

## 13. Monitoring & Debugging

### Check GA4 Connection:
```javascript
// In browser console
window.gtag('event', 'test_event');
// Check Google Analytics Realtime report
```

### View Tracked Events:
```typescript
// Check browser local storage
sessionStorage.getItem('sessionId');
```

### Backend Event Logging:
```bash
# Query analytics_events table
SELECT * FROM analytics_events 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## 14. Future Enhancements

- Real-time event dashboard
- Custom event creation UI for admins
- Predictive analytics
- ML-based anomaly detection
- Export analytics reports
- Custom dashboard builder
- Event webhooks
- Third-party integrations (Mixpanel, Amplitude, etc.)

---

## 15. API Response Examples

### Funnel Data:
```json
{
  "success": true,
  "data": [
    {
      "step": "Browse",
      "users": 5000,
      "conversionRate": 100
    },
    {
      "step": "View",
      "users": 3500,
      "conversionRate": 70
    },
    {
      "step": "Offer",
      "users": 1200,
      "conversionRate": 34
    }
  ]
}
```

### User Flow Data:
```json
{
  "success": true,
  "data": [
    {
      "source": "Homepage",
      "destination": "Marketplace",
      "count": 1200,
      "bounceRate": 0.15
    }
  ]
}
```

### Heatmap Data:
```json
{
  "success": true,
  "data": [
    {
      "x": 150,
      "y": 200,
      "value": 45,
      "element": "Make Offer Button"
    }
  ]
}
```

---

## Files Created/Modified

### Frontend:
- ✅ `src/services/google-analytics.service.ts` - GA4 integration
- ✅ `src/services/event-tracking.service.ts` - Custom event tracking
- ✅ `src/services/analytics-data.service.ts` - Backend API service
- ✅ `src/components/analytics/ConversionFunnel.tsx` - Funnel visualization
- ✅ `src/components/analytics/UserBehaviorAnalysis.tsx` - Behavior analysis
- ✅ `src/components/analytics/Heatmap.tsx` - Heatmap visualization
- ✅ `src/components/analytics/CustomEventTracking.tsx` - Event tracking
- ✅ `src/pages/AnalyticsDashboard.tsx` - Dashboard page
- ✅ `src/main.tsx` - GA4 initialization
- ✅ `src/App.tsx` - Added route
- ✅ `src/hooks/useAnalytics.ts` - Added tracking hooks

### Backend:
- ✅ `src/routes/analytics-advanced.ts` - Analytics endpoints
- ✅ `src/index.ts` - Registered routes
- ✅ `database-migration-analytics.sql` - Database schema

---

**Implementation Status:** ✅ Complete
**All Compilation Errors:** ✅ Resolved
