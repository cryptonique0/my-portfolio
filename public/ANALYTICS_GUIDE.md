# Enhanced Analytics Documentation

## Overview

The Enhanced Analytics system provides comprehensive real-time metrics, predictive insights, and performance tracking for airdrop campaigns. This module includes:

- **Real-time Dashboard** - Live metrics, charts, and key performance indicators
- **Leaderboard** - Top claimers and user rankings
- **Predictive Analytics** - ML-based forecasts for claim rates and campaign success
- **Data Export** - CSV export functionality for all analytics data
- **ROI Tracking** - Campaign profitability and success metrics

## Architecture

### Backend Services

#### 1. AnalyticsService (`analyticsService.ts`)

Tracks and aggregates real-time airdrop metrics from smart contracts.

**Key Methods:**

```typescript
// Get comprehensive claim metrics
getClaimMetrics(campaignId: string): Promise<ClaimMetrics>

// Campaign-specific metrics
getCampaignMetrics(campaignId: string): Promise<CampaignMetrics>

// Real-time metrics across all campaigns
getRealTimeMetrics(): Promise<RealTimeMetrics>

// Top claimers leaderboard
getLeaderboard(limit: number): Promise<LeaderboardEntry[]>

// Historical trend analysis
getTrendAnalysis(days: number): Promise<Record<string, number[]>>
```

**Usage Example:**

```typescript
import { AnalyticsService } from '@backend/analyticsService';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(rpcUrl);
const analytics = new AnalyticsService(provider);

// Register contracts for tracking
const airdropContract = new ethers.Contract(address, abi, provider);
analytics.registerContract('AirdropManager', airdropContract);

// Get metrics
const metrics = await analytics.getClaimMetrics('campaign-1');
const leaderboard = await analytics.getLeaderboard(100);
const realtime = await analytics.getRealTimeMetrics();
```

**Caching:**

- 5-minute cache for metrics
- Automatic expiry and refresh
- Manual cache clearing available

#### 2. PredictiveAnalyticsService (`predictiveAnalytics.ts`)

Forecasts claim rates and campaign success using statistical models.

**Key Methods:**

```typescript
// Forecast claim rates for next N days
forecastClaimRates(historicalClaims: number[], daysToForecast: number): ClaimForecast[]

// Predict individual user behavior
predictUserBehavior(userAllocationTime: Date, ...): UserBehaviorForecast

// Overall campaign success forecast
forecastCampaignSuccess(campaignId: string, ...): CampaignSuccessForecast

// Calculate ROI projections
calculateROIProjection(campaignId: string, ...): ROIProjection
```

**Forecast Models:**

- **Exponential Smoothing**: Predicts short-term trends
- **Seasonal Decomposition**: Accounts for day-of-week patterns
- **Volatility Analysis**: Confidence scoring based on data stability
- **Momentum Calculation**: Trend acceleration detection

**Usage Example:**

```typescript
import { PredictiveAnalyticsService } from '@backend/predictiveAnalytics';

const predictor = new PredictiveAnalyticsService();

// Forecast next 30 days
const forecast = predictor.forecastClaimRates(historicalData, 30);

// Campaign success prediction
const success = predictor.forecastCampaignSuccess(
  'campaign-1',
  75, // current claim rate
  15, // days elapsed
  1000, // total users
  750, // claimed users
  dailyRates // historical daily rates
);

// User behavior prediction
const userForecast = predictor.predictUserBehavior(
  allocationDate,
  previousClaims,
  averageAmount,
  userPercentile
);
```

**Confidence Scoring:**

- Higher confidence for near-term forecasts
- Confidence decreases with forecast horizon
- Minimum 40%, maximum 95% confidence

#### 3. ROITrackingService (`roiTracking.ts`)

Measures campaign profitability and success metrics.

**Key Methods:**

```typescript
// Calculate campaign ROI
calculateCampaignROI(campaignId: string, ...): CampaignROI

// ROI by user segments
calculateSegmentedROI(segments: Segment[]): SegmentedROI[]

// Compare multiple campaigns
compareCampaigns(campaigns: CampaignROI[]): CampaignComparison

// Detailed success metrics
calculateSuccessMetrics(campaignId: string, ...): SuccessMetrics
```

**ROI Calculation:**

```
ROI = (Claimed Value - Gas Costs) / Gas Costs × 100%
Success Score = (Engagement × 0.25) + (Claims × 0.25) + (ROI × 0.25) + (Momentum × 0.25)
```

**Health Indicators:**

- Positive indicators (high engagement, improving trends)
- Negative indicators (low engagement, declining trends)
- Overall health score (0-100)

#### 4. CSVExportService (`csvExport.ts`)

Generates and exports analytics data in CSV format.

**Key Methods:**

```typescript
// Export airdrop data
exportAirdropData(data: AirdropDataExport[], options?: ExportOptions): string

// Export metrics
exportMetrics(data: MetricsExport[], options?: ExportOptions): string

// Export leaderboard
exportLeaderboard(data: LeaderboardExport[], options?: ExportOptions): string

// Generic export
exportGeneric(data: Record<string, any>[], options?: ExportOptions): string

// Download as file (browser only)
downloadCSV(content: string, filename: string): void

// Generate timestamped filename
generateFilename(prefix: string, extension: string): string
```

**Export Options:**

```typescript
{
  includeHeaders: boolean,      // Include CSV headers (default: true)
  delimiter: string,            // CSV delimiter: ',' or ';' (default: ',')
  encoding: string,             // Character encoding (default: 'utf-8')
  quoteFields: boolean         // Quote fields with special chars (default: true)
}
```

### Frontend Components

#### 1. Dashboard (`Dashboard.tsx`)

Real-time metrics and performance charts.

**Features:**

- Summary cards (Total Claimed, Claim Rate, Active Users, Success Score)
- Line chart: Claims over time
- Pie chart: Claim status distribution
- Bar chart: Trading volume and user metrics
- Time range selector (24h, 7d, 30d, 90d)

**Usage:**

```tsx
import { AnalyticsDashboard } from '@/components/Analytics';

export default function Page() {
  return <AnalyticsDashboard />;
}
```

#### 2. Leaderboard (`Leaderboard.tsx`)

Top claimers and user rankings.

**Features:**

- Sortable leaderboard table
- Address filtering
- Top 3 badge indicators
- Relative time display (e.g., "2h ago")
- Percentage of total claimed

**Usage:**

```tsx
import { Leaderboard } from '@/components/Analytics';

export default function Page() {
  return <Leaderboard />;
}
```

#### 3. PredictiveAnalytics (`PredictiveAnalytics.tsx`)

Campaign forecast and success predictions.

**Features:**

- Adjustable forecast period (30, 60, 90 days)
- Predicted claims trend line
- Success probability meter
- Risk factors and recommendations
- Confidence breakdown

**Usage:**

```tsx
import { PredictiveAnalytics } from '@/components/Analytics';

export default function Page() {
  return <PredictiveAnalytics />;
}
```

#### 4. DataExport (`DataExport.tsx`)

CSV export interface for analytics data.

**Features:**

- Multi-select export types
- CSV format options (comma/semicolon)
- Header toggle
- Batch export functionality
- File preview examples
- Export status messages

**Export Types:**

- Airdrop Data (addresses, amounts, status)
- Daily Metrics (claims, volume, users, rate)
- Leaderboard (rankings, totals, dates)
- ROI Report (invested, claimed, ROI, scores)
- Forecast Data (predicted claims, confidence, trends)

**Usage:**

```tsx
import { DataExport } from '@/components/Analytics';

export default function Page() {
  return <DataExport />;
}
```

#### 5. ROITracking (`ROITracking.tsx`)

Campaign profitability and success analysis.

**Features:**

- Campaign summary cards
- Campaign comparison bar charts
- Detailed metrics for selected campaign
- ROI distribution progress bars
- Success score visualization
- Campaign status indicators

**Usage:**

```tsx
import { ROITracking } from '@/components/Analytics';

export default function Page() {
  return <ROITracking />;
}
```

## Integration Guide

### 1. Smart Contract Integration

Register your airdrop contracts with the AnalyticsService:

```typescript
// In your initialization code
import { AnalyticsService } from '@backend/analyticsService';
import AirdropManagerABI from '@contracts/AirdropManager.json';

const initAnalytics = async () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const analytics = new AnalyticsService(provider);

  const airdropManager = new ethers.Contract(
    AIRDROP_MANAGER_ADDRESS,
    AirdropManagerABI,
    provider
  );

  analytics.registerContract('AirdropManager', airdropManager);

  // Now you can query metrics
  const metrics = await analytics.getClaimMetrics('campaign-1');
  return analytics;
};
```

### 2. API Routes

Create backend API routes to expose analytics:

```typescript
// pages/api/analytics/metrics/[campaignId].ts
import { AnalyticsService } from '@backend/analyticsService';

export default async function handler(req, res) {
  const { campaignId } = req.query;
  const analytics = await getAnalyticsService();

  const metrics = await analytics.getCampaignMetrics(campaignId);
  res.status(200).json(metrics);
}

// pages/api/analytics/leaderboard.ts
export default async function handler(req, res) {
  const analytics = await getAnalyticsService();
  const { limit = 100 } = req.query;

  const leaderboard = await analytics.getLeaderboard(Number(limit));
  res.status(200).json(leaderboard);
}

// pages/api/analytics/forecast.ts
import { PredictiveAnalyticsService } from '@backend/predictiveAnalytics';

export default async function handler(req, res) {
  const { days = 30 } = req.query;
  const predictor = new PredictiveAnalyticsService();

  const forecast = predictor.forecastClaimRates(historicalData, Number(days));
  res.status(200).json(forecast);
}

// pages/api/analytics/export.ts
import { CSVExportService } from '@backend/csvExport';

export default async function handler(req, res) {
  const { type, format = 'comma' } = req.query;
  const analytics = await getAnalyticsService();

  let data;
  switch (type) {
    case 'airdrop':
      data = await getAirdropData();
      break;
    case 'metrics':
      data = await getMetricsData();
      break;
    // ... other cases
  }

  const csv = CSVExportService.exportGeneric(data);
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
}
```

### 3. Dashboard Integration

Create a unified analytics page:

```typescript
// pages/analytics.tsx
import { AnalyticsDashboard, Leaderboard, ROITracking } from '@/components/Analytics';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <AnalyticsDashboard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Leaderboard />
        <ROITracking />
      </div>
    </div>
  );
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Automatic caching with 5-minute TTL
const metrics = await analytics.getClaimMetrics('campaign-1');

// Manual cache clearing
analytics.clearCache('claims_campaign-1');

// Clear all caches
analytics.clearCache();
```

### Real-time Updates

Implement WebSocket updates for live metrics:

```typescript
// useAnalyticsSubscription.ts
import { useEffect, useState } from 'react';

export function useAnalyticsSubscription(campaignId: string) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics_update') {
        setMetrics(data.payload);
      }
    };

    return () => ws.close();
  }, [campaignId]);

  return metrics;
}
```

## Best Practices

### 1. Data Freshness

- Use appropriate cache TTLs based on update frequency
- Implement WebSocket for critical metrics
- Batch API calls to reduce overhead

### 2. Error Handling

```typescript
try {
  const metrics = await analytics.getClaimMetrics(campaignId);
} catch (error) {
  if (error.message.includes('not registered')) {
    console.error('Contract not registered with analytics service');
  }
  // Handle appropriately
}
```

### 3. Performance

- Limit leaderboard queries to necessary users
- Use pagination for large datasets
- Pre-calculate aggregations for historical data

### 4. Security

- Validate campaign IDs before querying
- Rate limit analytics API endpoints
- Sanitize exported CSV data
- Verify user permissions for sensitive metrics

## Troubleshooting

### No Data Appearing

1. Verify contract is registered: `analytics.contracts.has('AirdropManager')`
2. Check contract address matches deployment
3. Ensure events are being emitted correctly

### Forecast Inaccuracies

1. Require minimum 10 historical data points
2. Check for outliers in historical data
3. Verify timestamp accuracy
4. Consider external factors not in model

### Export Issues

1. Check browser console for errors
2. Verify data is not empty
3. Try different delimiter (comma vs semicolon)
4. Ensure Blob API is available

## Examples

See `frontend/src/components/Analytics/` for complete component examples with mock data.

## Support

For issues or questions:
1. Check component source code comments
2. Review integration examples above
3. Test with mock data first
4. Verify smart contract integration

---

**Version**: 1.0.0  
**Last Updated**: January 2026
