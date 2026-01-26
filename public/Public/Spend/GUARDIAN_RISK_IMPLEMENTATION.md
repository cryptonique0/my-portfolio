# Guardian Activity & Risk Scoring Implementation Guide

## Overview

This document describes the Guardian Activity Dashboard and Risk Scoring Engine features, including architecture, API contracts, component usage, and integration patterns.

## Features Implemented

### 1. Guardian Activity Dashboard
Tracks and displays guardian participation metrics, approval patterns, and performance badges.

**Key Metrics:**
- Participation Rate: % of proposals reviewed
- Approval Time: Average time to approve/reject
- Trust Score: Overall reliability score (0-100)
- Activity Timeline: Recent actions and badges earned
- Badge Tracking: Guardian performance indicators

**Components:**
- `GuardianActivityDashboard`: Main grid view with drill-down
- `VaultGuardianCard`: Individual guardian metrics
- `GuardianDetailView`: Detailed stats and timeline

**API Endpoint:**
```
GET /api/vaults/[address]/guardian-activity
Query params:
  - guardian?: string (optional, specific guardian address)
```

### 2. Risk Scoring Engine
Real-time vault risk assessment with 6-factor analysis and alert system.

**Risk Factors:**
1. **Withdrawal Velocity** (0-100)
   - Tracks daily/weekly/monthly average withdrawal amounts
   - Detects accelerated spending
   - Last withdrawal analysis

2. **Pattern Deviation** (0-100)
   - Identifies anomalies in withdrawal timing, frequency, amount
   - Compares against historical baseline
   - Flags unusual patterns

3. **Guardian Consensus** (0-100)
   - Measures approval consistency across guardians
   - Tracks dissenting votes
   - Monitors approval time variations

4. **Spending Headroom** (0-100)
   - Daily, weekly, monthly limit utilization
   - Identifies tokens approaching limits
   - Safe spending capacity

5. **Time-Lock Utilization** (0-100)
   - Queued and frozen withdrawals
   - Emergency freeze frequency
   - Protocol usage patterns

6. **Approval Patterns** (0-100)
   - Guardian approval/rejection ratios
   - Consensus trend
   - Deviation from expected patterns

**Overall Score:** Weighted average of all factors (0-100)
- 0-25: Safe (Green)
- 25-50: Normal (Yellow)
- 50-75: Caution (Orange)
- 75-100: Critical (Red)

**Components:**
- `RiskScoringDashboard`: Full risk assessment view
- Risk Factor Cards: Expandable factor details
- Alert Banner: Active risk alerts
- Spending Limit Bars: Visual utilization indicators

**API Endpoints:**
```
GET /api/vaults/[address]/risk-score
- Returns: Complete risk assessment

POST /api/vaults/[address]/risk-score/acknowledge-alert
- Body: { alertId: string }
- Updates: Alert seen status
```

### 3. Integrated Vault Dashboard
Combined view with tabbed navigation for overview, guardians, and risk.

**Tabs:**
- **Overview**: Compact risk + guardian summary
- **Guardians**: Full guardian activity dashboard
- **Risk**: Comprehensive risk assessment

## Architecture

### Data Flow

```
Smart Contract Events
    ↓
Backend API Routes (/api/vaults/[address]/*)
    ↓
React Hooks (useGuardianActivity, useRiskScore)
    ↓
Dashboard Components
    ├── VaultDashboard (Tab Container)
    ├── GuardianActivityDashboard
    └── RiskScoringDashboard
```

### API Response Structures

**Guardian Activity Response:**
```typescript
{
  success: true,
  vault: "0x...",
  timestamp: number,
  metrics: {
    participation: {
      approvalCount: number,
      rejectionCount: number,
      participationRate: number,
      averageApprovalTime: number
    },
    freezeVoting: {
      freezeVotesInMonth: number,
      unfreezeVotesInMonth: number
    },
    reliability: {
      trustScore: number
    },
    recentActivity: Array<{
      type: 'approve' | 'reject' | 'freeze' | 'unfreeze' | 'badge_earned',
      timestamp: number,
      details: string
    }>
  }
}
```

**Risk Score Response:**
```typescript
{
  success: true,
  riskScore: {
    overallScore: number,
    riskLevel: 'safe' | 'normal' | 'caution' | 'critical',
    factors: {
      withdrawalVelocity: { score: number, status: string, ... },
      patternDeviation: { score: number, status: string, ... },
      guardianConsensus: { score: number, status: string, ... },
      spendingHeadroom: { score: number, status: string, ... },
      timeLockUtilization: { score: number, status: string, ... },
      approvalPatterns: { score: number, status: string, ... }
    },
    alerts: Array<{
      id: string,
      severity: 'info' | 'warning' | 'critical',
      message: string,
      description: string,
      recommendation: string
    }>,
    recommendations: string[]
  }
}
```

## Usage Examples

### Using the Guardian Activity Hook

```typescript
'use client';

import { useGuardianActivity } from '@/lib/hooks/useGuardianActivity';
import { GuardianActivityDashboard } from '@/components/dashboard/guardian-activity-dashboard';

export function MyVaultPage({ params }: { params: { address: string } }) {
  const { data, loading, error } = useGuardianActivity(params.address as Address);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <GuardianActivityDashboard vaultAddress={params.address as Address} />;
}
```

### Using the Risk Score Hook

```typescript
'use client';

import { useRiskScore } from '@/lib/hooks/useGuardianActivity';
import { RiskScoringDashboard } from '@/components/dashboard/risk-scoring-dashboard';

export function RiskPage({ params }: { params: { address: string } }) {
  const { data, loading, acknowledgeAlert } = useRiskScore(params.address as Address, 60000);

  if (loading) return <div>Loading...</div>;

  return (
    <RiskScoringDashboard vaultAddress={params.address as Address} />
  );
}
```

### Using the Integrated Dashboard

```typescript
'use client';

import { VaultDashboard } from '@/components/dashboard/vault-dashboard';

export function DashboardPage({ params }: { params: { address: string } }) {
  return (
    <VaultDashboard
      vaultAddress={params.address as Address}
      vaultName="My Spending Vault"
    />
  );
}
```

## Integration Checklist

- [ ] Guardian Activity API tested with mock data
- [ ] Risk Scoring API tested with mock data
- [ ] `useGuardianActivity` hook can fetch and update
- [ ] `useRiskScore` hook can fetch and acknowledge alerts
- [ ] `GuardianActivityDashboard` displays all guardians
- [ ] `RiskScoringDashboard` shows all 6 factors
- [ ] `VaultDashboard` tab navigation works smoothly
- [ ] Dark mode styling consistent across all components
- [ ] Loading states display properly
- [ ] Error states show user-friendly messages
- [ ] Poll interval configurable (default 60s)
- [ ] Alert acknowledgment persists locally
- [ ] Mobile responsive layout tested
- [ ] TypeScript types verified
- [ ] No console errors

## File Structure

```
components/
  └── dashboard/
      ├── vault-dashboard.tsx          (Main integrated dashboard)
      ├── guardian-activity-dashboard.tsx (Guardian view)
      └── risk-scoring-dashboard.tsx    (Risk scoring view)

lib/
  └── hooks/
      └── useGuardianActivity.ts       (Data fetching hooks)

app/
  └── api/
      └── vaults/
          └── [address]/
              ├── guardian-activity/
              │   └── route.ts         (Guardian API)
              └── risk-score/
                  └── route.ts         (Risk score API)
```

## Next Steps

1. **Connect to Real Data**
   - Replace mock data in APIs with actual contract queries
   - Index smart contract events for historical data
   - Set up caching for frequently accessed metrics

2. **Add Real-Time Updates**
   - Implement WebSocket for live event streaming
   - Use SWR or TanStack Query for optimized data fetching
   - Add server-sent events (SSE) for alert pushing

3. **Enhance Analytics**
   - Add time-series charts for trend analysis
   - Export risk reports as PDF
   - Create guardian performance comparison tools

4. **Add Alerting System**
   - Email notifications for critical alerts
   - Telegram/Discord integration
   - Custom alert rules configuration

5. **Performance Optimization**
   - Implement data pagination
   - Add caching layers
   - Optimize API response times
   - Use service workers for offline support

## Testing

### Unit Tests (WIP)
- API route handlers
- Hook logic and state management
- Component rendering and interactions

### Integration Tests (WIP)
- Hook + Component integration
- API data flow through UI
- User interactions (expand/collapse, acknowledge alerts)

### E2E Tests (WIP)
- Full dashboard workflows
- Guardian selection drill-down
- Risk factor exploration
- Alert acknowledgment

## Performance Considerations

- **API Response**: <500ms target
- **Hook Update**: <100ms re-render
- **Component Load**: <1s first paint
- **Poll Interval**: 60s default (user configurable)
- **Memory**: ~2MB for full dashboard with 10+ guardians

## Security Considerations

- All endpoints read-only except alert acknowledgment
- No private keys or secrets in responses
- Alert IDs prevent unauthorized modification
- Vault address validated in all endpoints
- Signature verification for state-changing operations

## Troubleshooting

**Hook not updating:**
- Check autoRefresh interval is set correctly
- Verify API endpoint returns data
- Check browser console for errors

**Alerts not dismissing:**
- Ensure POST endpoint is accessible
- Check alert ID format matches API expectations
- Verify server response includes success flag

**Components not rendering:**
- Check TypeScript types match API response
- Verify Address type imported from viem
- Ensure useRiskScore hook is called in client component

**Performance slow:**
- Increase poll interval if APIs are slow
- Check network tab for waterfall issues
- Monitor component re-renders with React DevTools

## Future Enhancements

- Multi-vault comparison dashboard
- Guardian reputation system
- Customizable risk weights per vault
- Whale address tracking
- Cross-chain risk aggregation
- ML-based anomaly detection
- Guardian incentive tracking
- Withdrawal pattern learning
