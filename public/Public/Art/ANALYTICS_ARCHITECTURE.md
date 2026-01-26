# Analytics System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    (React Components)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Collections     │  │  NFT Detail      │  │  Marketplace │ │
│  │  Page            │  │  Page            │  │  Page        │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│           │                    │                      │         │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼──────┐  │
│  │ usePageTracking │  │ usePageTracking │  │usePageTracking│  │
│  │ useEventTracking│  │ useEventTracking│  │useEventTracking  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬──────┘  │
└───────────┼──────────────────────┼──────────────────┼──────────┘
            │                      │                  │
┌───────────▼──────────────────────▼──────────────────▼──────────┐
│                    Service Layer                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         eventTrackingService                            │ │
│  │  (Session tracking, 15+ event types)                   │ │
│  └────────────────────┬─────────────────────────────────────┘ │
│                       │                                         │
│  ┌────────────────────▼──────────────────────────────────────┐ │
│  │         analyticsService (GA4)                          │ │
│  │  (trackEvent, trackConversion, trackException, etc)    │ │
│  └────────────────────┬──────────────────────────────────────┘ │
│                       │                                         │
│  ┌────────────────────▼──────────────────────────────────────┐ │
│  │    analyticsDataService (Backend API)                  │ │
│  │  (GET /api/analytics/*)                               │ │
│  └────────────────────┬──────────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │                │                │
    ┌───▼────┐  ┌────────▼────────┐  ┌──▼────────┐
    │ GA4    │  │ Backend API     │  │ Browser   │
    │ Cloud  │  │ (Analytics      │  │ Local     │
    │        │  │  Routes)        │  │ Storage   │
    └────────┘  └────────┬────────┘  └───────────┘
                         │
                    ┌────▼─────────┐
                    │  Supabase    │
                    │  PostgreSQL  │
                    │              │
                    │  Tables:     │
                    │  ├─ events   │
                    │  ├─ summary  │
                    │  └─ heatmap  │
                    └──────────────┘
```

## Event Tracking Flow

```
User Action (click, view, scroll, etc)
    │
    ├─────────────────────────┐
    │                         │
    ▼                         ▼
usePageTracking()      useEventTracking()
    │                         │
    ├─────────┬───────────────┤
    │         │               │
    ▼         ▼               ▼
scrollDepth  clicks      customEvent/
timeOnPage   (x, y)      nftView/
                        offerCreate
    │         │               │
    └─────────┴───────────────┘
            │
            ▼
    eventTrackingService
    (trackEvent method)
            │
            ├──────────────┬──────────────┐
            │              │              │
            ▼              ▼              ▼
        GA4 Event    Backend API      Local
        (Browser)    (Async POST)     Storage
            │              │              │
            ▼              ▼              ▼
        GA4 Cloud      analytics_      Session
        (Google)       events table    Storage
                            │
                            ▼
                    Dashboard Query/
                    Aggregation
```

## Dashboard Data Flow

```
┌──────────────────────────────────────────┐
│    AnalyticsDashboard.tsx                │
└──────────────────────────────────────────┘
        │
        ├─ Overview Tab
        │       │
        │       ├─ Daily Summary Card ◄─── analyticsDataService.getDashboardSummary()
        │       │
        │       ├─ Activity Trend Chart ◄─── Backend mock data
        │       │
        │       └─ Top Events List ◄─── analyticsDataService.getEventAnalytics()
        │
        ├─ Funnel Tab
        │       │
        │       └─ ConversionFunnel ◄──── analyticsDataService.getConversionFunnel()
        │               │
        │               ├─ Funnel Visualization (Recharts)
        │               │
        │               └─ Step Statistics
        │
        ├─ Behavior Tab
        │       │
        │       └─ UserBehaviorAnalysis
        │               │
        │               ├─ Behavior Metrics ◄── analyticsDataService.getUserBehavior()
        │               │
        │               ├─ User Flow Diagram ◄─ analyticsDataService.getUserFlow()
        │               │    (Sankey)
        │               │
        │               └─ Engagement Patterns
        │
        ├─ Events Tab
        │       │
        │       └─ CustomEventTracking
        │               │
        │               ├─ Event Stats ◄────── analyticsDataService.getEventAnalytics()
        │               │
        │               ├─ Trend Chart ◄────── Backend
        │               │    (Area Chart)
        │               │
        │               └─ Event Properties
        │
        └─ Heatmap Tab
                │
                └─ Heatmap
                        │
                        ├─ Canvas Visualization
                        │
                        ├─ Click Data ◄──── analyticsDataService.getHeatmapData()
                        │
                        └─ Top Elements List

```

## Component Hierarchy

```
AnalyticsDashboard
  ├─ Header
  │   ├─ Title
  │   └─ Date Range Selector
  │
  ├─ Tab Navigation
  │   ├─ Overview
  │   ├─ Funnel
  │   ├─ Behavior
  │   ├─ Events
  │   └─ Heatmap
  │
  ├─ [Overview Tab]
  │   ├─ MetricCard (Users)
  │   ├─ MetricCard (NFTs)
  │   ├─ MetricCard (Offers)
  │   ├─ MetricCard (Transactions)
  │   ├─ LineChart (Activity Trend)
  │   └─ EventsList
  │
  ├─ [Funnel Tab]
  │   └─ ConversionFunnel
  │       ├─ FunnelChart (Recharts)
  │       └─ FunnelStats (Grid)
  │
  ├─ [Behavior Tab]
  │   └─ UserBehaviorAnalysis
  │       ├─ BehaviorMetrics (Grid)
  │       ├─ SankeyDiagram
  │       └─ EngagementPatterns (List)
  │
  ├─ [Events Tab]
  │   └─ CustomEventTracking (x3)
  │       ├─ EventStats (Grid)
  │       ├─ AreaChart (Trend)
  │       └─ Properties (List)
  │
  └─ [Heatmap Tab]
      └─ Heatmap (x2)
          ├─ Canvas (Visualization)
          └─ ElementsList (Top Clicks)
```

## Service Architecture

### Google Analytics Service
```
analyticsService
├─ init(config)
├─ trackPageView(path, title)
├─ trackEvent(eventName, eventData)
├─ trackConversion(name, value, currency)
├─ trackException(description, fatal)
├─ setUserId(userId)
└─ setUserProperties(properties)
```

### Event Tracking Service
```
eventTrackingService
├─ getSessionId()
├─ trackNFTView(id, name, price)
├─ trackSearch(query, count, filters)
├─ trackCollectionView(id, name, items)
├─ trackOfferCreated(nftId, amount, currency)
├─ trackOfferAccepted(nftId, amount, currency)
├─ trackOfferCountered(nftId, amount)
├─ trackLogin(wallet, method)
├─ trackSignup(wallet)
├─ trackLogout(wallet)
├─ trackWishlistAdd(nftId, name)
├─ trackCollectionAdd(colId, name)
├─ trackFilterUsage(filters)
├─ trackTimeOnPage(page, duration)
├─ trackClickEvent(element, x, y)
├─ trackScrollDepth(page, percentage)
├─ trackVideoPlay(videoId, title)
└─ trackCustomEvent(eventName, eventData)
```

### Analytics Data Service
```
analyticsDataService
├─ trackEventToBackend(event)
├─ getConversionFunnel(dateRange?)
├─ getUserFlow(dateRange?)
├─ getUserBehavior(timeframe)
├─ getHeatmapData(pageUrl)
├─ getEventAnalytics(eventName, dateRange?)
├─ getDashboardSummary(dateRange?)
└─ getRetentionCohorts()
```

## Database Schema

```
analytics_events
├─ id (UUID PK)
├─ event_name (VARCHAR)
├─ event_data (JSONB)
├─ session_id (VARCHAR)
├─ user_id (UUID FK → users)
├─ page_url (TEXT)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
    Indexes: event_name, session_id, user_id, created_at

analytics_summary
├─ id (UUID PK)
├─ date (DATE)
├─ metric_name (VARCHAR)
├─ metric_value (NUMERIC)
├─ metric_data (JSONB)
├─ created_at (TIMESTAMP)
└─ UNIQUE(date, metric_name)

heatmap_data
├─ id (UUID PK)
├─ page_url (TEXT)
├─ x_position (INTEGER)
├─ y_position (INTEGER)
├─ click_count (INTEGER)
├─ element_class (TEXT)
├─ element_id (TEXT)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
    Indexes: page_url, created_at
```

## API Endpoint Architecture

```
/api/analytics/

├─ POST events
│   └─ Body: { eventName, eventData, sessionId, userId }
│   └─ Returns: { success, data }
│
├─ GET funnel
│   └─ Query: { startDate?, endDate? }
│   └─ Returns: FunnelStep[]
│
├─ GET user-flow
│   └─ Query: { startDate?, endDate? }
│   └─ Returns: UserFlow[]
│
├─ GET user-behavior
│   └─ Query: { timeframe: today|week|month }
│   └─ Returns: UserBehavior[]
│
├─ GET heatmap
│   └─ Query: { page: URL }
│   └─ Returns: HeatmapPoint[]
│
├─ GET events/:eventName
│   └─ Query: { startDate?, endDate? }
│   └─ Returns: EventAnalytics
│
├─ GET summary
│   └─ Query: { startDate?, endDate? }
│   └─ Returns: DashboardSummary
│
└─ GET retention
    └─ Returns: RetentionCohort[]
```

## State Management

```
Component State (React.useState)
├─ activeTab (Overview|Funnel|Behavior|Events|Heatmap)
├─ dateRange { startDate, endDate }
├─ data (API responses)
├─ loading (boolean)
└─ error (Error | null)

Session Storage
├─ sessionId (tracking)

Local Storage
├─ authToken (API authentication)

GA4 (Browser)
├─ User ID
├─ Session ID (Google generated)
├─ Event properties
└─ Conversion tracking
```

## Rendering Pipeline

```
Event Occurs
    │
    ├─── eventTrackingService (async)
    │    └─── analyticsService (GA4 send)
    │
    ├─── analyticsDataService (async, optional)
    │    └─── Backend POST /api/analytics/events
    │         └─── Database store
    │
    └─── Dashboard Query (on demand)
         └─── API GET /api/analytics/*
         └─── Data Aggregation
         └─── Component Re-render
              └─── Chart Rendering (Recharts)
              └─── UI Update
```

## Performance Optimization

```
Lazy Loading
└─ Charts render only when tab active

Data Caching
└─ API responses cached in component state

Database Optimization
├─ Indexes on: event_name, session_id, created_at, page_url
├─ Partitioned by date for large tables
└─ Aggregated views for summary data

Event Batching
└─ Browser batches GA4 events before sending

Async Processing
├─ Event tracking non-blocking (fire and forget)
├─ Dashboard queries in useEffect
└─ Dashboard UI responsive during loading

Query Optimization
├─ Indexed lookups
├─ Date range filters
└─ Aggregation at database level
```

## Security Architecture

```
Authentication & Authorization
├─ requireAppJWT middleware (all endpoints)
└─ RLS policies (all tables)

Data Isolation
├─ Users can only read analytics
├─ Admins can write analytics
└─ User-scoped queries with RLS

Environment Security
├─ GA4 Measurement ID in .env
├─ JWT Secret for backend
└─ Service Role Key for admin ops
```

## Deployment Pipeline

```
Development
├─ Local GA4 debug mode
├─ In-memory event storage
└─ Mock API responses

Staging
├─ GA4 staging property
├─ PostgreSQL test database
└─ Full analytics pipeline

Production
├─ GA4 production property
├─ PostgreSQL production database
├─ Database backups
└─ Real-time monitoring
```

## Monitoring & Alerts

```
Metrics to Monitor
├─ Event tracking volume
├─ API response times
├─ Database query latency
├─ GA4 data freshness
├─ Error rates
└─ User engagement trends

Alerts
├─ Drop in event volume (> 50%)
├─ API latency > 1s
├─ Database errors
├─ GA4 connection failure
└─ Funnel drop-offs > 80%
```

This architecture provides:
- ✅ Scalable event tracking
- ✅ Real-time analytics
- ✅ Multiple visualization options
- ✅ Secure data handling
- ✅ Easy integration
- ✅ Extensible design
