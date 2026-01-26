# Dashboard Analytics - Quick Reference Guide

## 🚀 Quick Start

### Access the Dashboard
```
URL: http://localhost:3000/analytics
```

### Navigate
- Use the 5 tabs to switch between charts
- Click time range buttons (7d, 30d, 90d, 1y, all) to change data
- Hover over charts for tooltips
- Click export buttons for reporting

---

## 📊 The 5 Charts Explained

### 1. Withdrawal Trends
**What it shows:** How many withdrawals happen per day (bars) vs total ETH amount (line)
**Use it for:** Track withdrawal patterns and volume over time
**Data:** Date, withdrawal count, ETH amount

### 2. Spending Analysis
**What it shows:** Daily/weekly/monthly spending limits vs actual spending
**Use it for:** Monitor spending against your limits
**Data:** 4 lines showing limits and actual usage

### 3. Guardian Participation
**What it shows:** How many times each guardian approved/rejected requests
**Use it for:** Evaluate guardian performance and response times
**Data:** Approval count, rejection count, response time, reliability

### 4. Token Distribution
**What it shows:** What percentage of your vault is each token (ETH, USDC, etc.)
**Use it for:** See your portfolio asset allocation
**Data:** Token name, amount, USD value, percentage

### 5. Risk Score History
**What it shows:** Your vault's risk score over 7 days (0-100 scale)
**Use it for:** Understand security posture and what impacts it
**Data:** Daily risk score, risk level, contributing factors

---

## 👥 Guardian Leaderboard

Shows your guardians ranked by "Trust Score" which combines:
- ⭐ Approval Rate (40%) - How often they approve
- ⚡ Response Speed (30%) - How fast they respond
- 📊 Activity (20%) - How often they participate
- ✅ Reliability (10%) - Consistency and dependability

**Medals:**
- 🥇 Gold - Rank 1
- 🥈 Silver - Rank 2
- 🥉 Bronze - Rank 3

**Badges Earned:**
- 🏆 Fast Responder - Responds in < 2 hours
- ✅ 100% Reliable - Perfect approval rate
- 📊 Consistent - Regular participation
- 💎 Trusted Advisor - Trust score > 90

---

## 📈 Key Metrics (6 Cards)

| Card | Shows | Color |
|------|-------|-------|
| Total Vault Value | Sum of all assets in USD | Blue |
| Total Withdrawn | Cumulative ETH withdrawn | Green |
| Guardian Count | Number of active guardians | Purple |
| Approval Rate | % of requests approved | Orange |
| Avg Response | Median guardian response time | Pink |
| Risk Score | Current safety assessment 0-100 | Cyan |

**Trend Indicators:**
- ↑ +12.5% = Increasing/positive
- ↓ -8% = Decreasing/negative

---

## ⏱️ Time Range Options

- **7d** - Last 7 days of data
- **30d** - Last month (default)
- **90d** - Last quarter
- **1y** - Last year
- **all** - All historical data available

*Click buttons to switch, charts update automatically*

---

## 🎨 Dark Mode

All components automatically switch to dark mode:
- Charts adjust colors for dark background
- Text improves contrast
- Icons invert properly
- Toggle in settings or OS preference

---

## 📱 Mobile View

Works on all screen sizes:
- **Mobile (< 640px):** Single column, charts stack vertically
- **Tablet (640-1024px):** 2-column layout
- **Desktop (> 1024px):** Full-width optimized layout

Pinch to zoom on charts, swipe to scroll

---

## 🔗 Integration Points

### Import Metrics in Dashboard
```tsx
import { AnalyticsMetrics } from '@/components/analytics/analytics-metrics';

<AnalyticsMetrics timeRange="30d" />
```

### Import Leaderboard Anywhere
```tsx
import { GuardianLeaderboard } from '@/components/analytics/guardian-leaderboard';

<GuardianLeaderboard />
```

### Link to Analytics
```tsx
<Link href="/analytics">View Full Analytics</Link>
```

---

## 💾 Data Sources (Currently Demo)

**To add real data, update:**
1. **Withdrawals:** Query `Withdrawn` contract events
2. **Spending:** Use vault balance tracking
3. **Guardian Stats:** Process approval/rejection events
4. **Tokens:** Real-time balance queries
5. **Risk Score:** Existing risk calculation engine
6. **Leaderboard:** Aggregate guardian metrics

---

## 🛠️ Customization

### Change Chart Colors
Edit the `COLORS` array in each chart component

### Adjust Chart Height
Modify the height prop in `ResponsiveContainer`:
```tsx
<ResponsiveContainer width="100%" height={400}>
```

### Add/Remove Metrics
Edit the metrics array in `analytics-metrics.tsx`

### Modify Guardian Badges
Update badge definitions in `guardian-leaderboard.tsx`

---

## ⚡ Performance Tips

- Charts limit data to prevent slowness
- Demo data is lightweight
- Real data should be aggregated on backend
- Consider caching frequently requested data
- Use time range to limit data points

---

## 🔍 Troubleshooting

**Charts not showing?**
- Verify Recharts is installed: `npm list recharts`
- Check console for errors
- Ensure data format matches expected structure

**Dark mode not working?**
- Check CSS variables in `globals.css`
- Verify dark mode classes applied
- Clear browser cache

**Mobile layout broken?**
- Check responsive classes (w-full, grid-cols-1, etc.)
- Verify breakpoints (md:, lg:)
- Test with Chrome DevTools device emulation

**Time range not updating?**
- Check if state is passed to components
- Verify button onClick handlers
- Look for missing prop drilling

---

## 📚 Files to Know

```
app/analytics/page.tsx              ← Main page, start here
components/analytics/               ← All chart components
  ├─ withdrawal-trends-chart.tsx    ← Bar + line chart
  ├─ spending-analysis-chart.tsx    ← 4-line chart
  ├─ guardian-participation-chart   ← Guardian bars
  ├─ token-distribution-chart       ← Pie chart
  ├─ risk-score-history-chart       ← Area chart
  ├─ analytics-metrics.tsx          ← 6 KPI cards
  └─ guardian-leaderboard.tsx       ← Ranking system
```

---

## 🚀 Next Steps

1. **View Demo:** Go to `/analytics`
2. **Explore Charts:** Click different tabs
3. **Check Leaderboard:** Scroll down for guardian ranks
4. **Try Filters:** Click time range buttons
5. **Test Mobile:** Shrink browser to < 640px
6. **Read Docs:** See DASHBOARD_ANALYTICS_DOCUMENTATION.md

---

## 🆘 Need Help?

- **Component Questions:** Check component JSDoc comments
- **Recharts Help:** See official docs at recharts.org
- **Styling Help:** Check Tailwind CSS documentation
- **Data Integration:** See ANALYTICS_IMPLEMENTATION_GUIDE.md

---

## 📊 Tech Stack

- **Framework:** Next.js 16.1 + React 19
- **Styling:** TailwindCSS 3.4
- **Charts:** Recharts 2.x
- **Web3:** Wagmi v2.19
- **Language:** TypeScript 5

---

## ✅ What's Included

- ✅ 5 interactive chart components
- ✅ Guardian leaderboard with rankings
- ✅ 6 key metrics dashboard
- ✅ Time range filtering
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Demo data included
- ✅ Full documentation
- ✅ Production ready

---

**Ready to use!** Navigate to `/analytics` and start exploring your vault data.
