# Enhanced Analytics - Quick Start Guide

## 📊 What You Just Got

A complete analytics system for your AirStack airdrop with:

✅ **Real-time Dashboard** - Live metrics, charts, leaderboards  
✅ **Predictive Forecasting** - AI claims & success predictions  
✅ **CSV Export** - Download all analytics data  
✅ **ROI Tracking** - Measure campaign profitability  
✅ **Leaderboards** - Top claimers rankings  

---

## 🚀 Quick Start

### 1. Import Components

```typescript
import {
  AnalyticsDashboard,
  Leaderboard,
  PredictiveAnalytics,
  DataExport,
  ROITracking
} from '@/components/Analytics';
```

### 2. Use in Your App

```typescript
// Single component
<AnalyticsDashboard />

// Full analytics page
<div className="space-y-8">
  <AnalyticsDashboard />
  <Leaderboard />
  <PredictiveAnalytics />
  <ROITracking />
  <DataExport />
</div>
```

### 3. Setup Backend Services

```typescript
import { AnalyticsService } from '@backend/analyticsService';
import { PredictiveAnalyticsService } from '@backend/predictiveAnalytics';
import { ROITrackingService } from '@backend/roiTracking';

// Initialize analytics
const analytics = new AnalyticsService(provider);
const predictor = new PredictiveAnalyticsService();
const roiTracker = new ROITrackingService();

// Register your contracts
analytics.registerContract('AirdropManager', contract);
```

---

## 📁 File Structure

```
backend/
├── analyticsService.ts       # Real-time metrics tracking
├── predictiveAnalytics.ts    # Claim rate forecasting
├── roiTracking.ts           # Campaign ROI calculations
└── csvExport.ts             # CSV export functionality

frontend/src/
├── components/Analytics/
│   ├── Dashboard.tsx        # Main dashboard UI
│   ├── Leaderboard.tsx      # Top claimers
│   ├── PredictiveAnalytics.tsx  # Forecasts
│   ├── DataExport.tsx       # Export interface
│   ├── ROITracking.tsx      # ROI metrics
│   └── index.ts             # Component exports
└── utils/
    └── csvExport.ts         # Frontend CSV utilities
```

---

## 💡 Key Features

### Dashboard
- 📊 Real-time metrics (claims, users, success score)
- 📈 Claims over time (line chart)
- 🥧 Claim status distribution (pie chart)
- 📊 Trading volume trends (bar chart)
- ⏱️ Time range filters (24h, 7d, 30d, 90d)

### Leaderboard
- 🏆 Top 100 claimers
- 🔍 Address search/filter
- 🥇 Medal indicators (1st, 2nd, 3rd)
- 📊 Sortable columns (total, count, percentage)
- ⏰ Relative timestamps

### Predictive Analytics
- 🔮 30/60/90 day forecasts
- 📉 Trend prediction
- 🎯 Success probability (0-100%)
- ⚠️ Risk factor detection
- 💡 Actionable recommendations

### Data Export
- 📥 Multi-format export
- 🗂️ 5 export types:
  - Airdrop data (allocations, claims, status)
  - Daily metrics (volume, users, rates)
  - Leaderboard (rankings, totals)
  - ROI report (profitability, scores)
  - Forecast data (predictions, confidence)
- ⚙️ CSV format options (comma/semicolon)
- 📋 Header toggle

### ROI Tracking
- 💰 Campaign profitability metrics
- 📊 ROI comparison charts
- 🎯 Success scores
- 📉 Performance indicators
- 🔄 Segmented analysis (whale/mid/small holders)

---

## 📊 Data Types

### ClaimMetrics
```typescript
{
  totalClaims: 5000,
  totalClaimAmount: "2500000000000000000000",
  uniqueClaimers: 2500,
  claimRate: 75.5,
  averageClaimSize: "1000000000000000000",
  claimsByHour: { 0: 45, 1: 52, ... },
  claimsByDay: { "2024-01-10": 1200, ... }
}
```

### CampaignROI
```typescript
{
  campaignId: "campaign-1",
  roi: 145.8,
  successScore: 89,
  engagementRate: 85,
  paybackPeriod: 23,
  recommendations: ["Increase marketing", ...]
}
```

### ClaimForecast
```typescript
{
  date: 2024-02-10,
  predictedClaims: 320,
  confidence: 87.5,
  trend: "increasing",
  seasonalFactor: 1.0
}
```

---

## 🔗 API Endpoints

Create these endpoints in your backend:

```typescript
// Get dashboard metrics
GET /api/analytics/dashboard

// Get leaderboard
GET /api/analytics/leaderboard?limit=100

// Get forecasts
GET /api/analytics/forecast?days=30

// Get ROI
GET /api/analytics/roi

// Export data
GET /api/analytics/export?type=airdrop&format=csv
```

---

## 🎯 Use Cases

### Campaign Manager
1. Use Dashboard for daily performance tracking
2. Check Leaderboard for user engagement
3. Review ROI Tracking for profitability

### Data Analyst
1. Export data in CSV format
2. Analyze trends in spreadsheet
3. Cross-reference with external metrics

### Marketing Team
1. Check PredictiveAnalytics for success probability
2. Review recommendations for optimizations
3. Use ROI comparison to validate strategy

### Investors
1. Monitor ROI metrics in real-time
2. Review campaign success scores
3. Export reports for stakeholder meetings

---

## ⚙️ Configuration

### Cache Settings
```typescript
// Default: 5 minutes
private readonly CACHE_TTL = 5 * 60 * 1000;

// Customize as needed
analytics.CACHE_TTL = 10 * 60 * 1000; // 10 minutes
```

### Forecast Periods
```typescript
// Available: 30, 60, 90 days
forecastClaimRates(data, 30);  // 30-day forecast
forecastClaimRates(data, 90);  // 90-day forecast
```

### Export Formats
```typescript
// Comma or semicolon delimiter
{ delimiter: ',' }   // USA/UK default
{ delimiter: ';' }   // European standard
```

---

## 🐛 Troubleshooting

**No data in dashboard?**
- Verify contract is registered
- Check RPC endpoint is working
- Ensure events are emitted

**Export not downloading?**
- Check browser console for errors
- Verify data is not empty
- Try different browser

**Forecast seems inaccurate?**
- Need minimum 10 historical data points
- Confidence is lower for long-term forecasts
- More data = better predictions

---

## 📚 Documentation

For detailed guides, see:
- `ANALYTICS_GUIDE.md` - Complete API reference
- `backend/*.ts` - Inline code documentation
- `frontend/src/components/Analytics/*.tsx` - Component props

---

## 🎨 Styling

All components use:
- **Tailwind CSS** for styling
- **Recharts** for visualizations
- **Gradient backgrounds** and modern design
- **Dark theme** (slate/purple) optimized for analytics

Customize colors in component className attributes.

---

## 🔐 Security Notes

1. ✅ Validate campaign IDs before queries
2. ✅ Rate limit analytics endpoints
3. ✅ Sanitize exported CSV data
4. ✅ Verify user permissions
5. ✅ Use HTTPS for data transmission

---

## 📊 Next Steps

1. **Setup**: Register contracts with analytics service
2. **Integrate**: Create API routes for endpoints
3. **Deploy**: Add analytics page to your app
4. **Monitor**: Track real-time metrics
5. **Optimize**: Use insights to improve campaigns

---

## 💬 Questions?

Check the documentation files:
- Technical details → `ANALYTICS_GUIDE.md`
- Integration examples → Code comments
- Component usage → JSX/TSX files

---

**Ready to launch?** 🚀

Your analytics system is production-ready with:
✅ 5 fully functional components
✅ 4 backend services
✅ Complete documentation
✅ Mock data for testing
✅ Responsive design

Start using it today!
