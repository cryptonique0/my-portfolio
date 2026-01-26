'use client';

import { useState } from 'react';
import { type Address } from 'viem';
import { useRiskScore, getRiskLevelColor, getRiskLevelBgColor } from '@/lib/hooks/useGuardianActivity';

interface RiskScoringDashboardProps {
  vaultAddress: Address;
  autoRefresh?: number; // ms between refreshes
  compact?: boolean; // Show compact version
}

/**
 * Risk Scoring Dashboard
 * Shows vault risk assessment with factors, alerts, and recommendations
 */
export function RiskScoringDashboard({
  vaultAddress,
  autoRefresh = 60000,
  compact = false
}: RiskScoringDashboardProps) {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const { data, loading, error, acknowledgeAlert } = useRiskScore(vaultAddress, autoRefresh);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        Error loading risk score: {error}
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
    );
  }

  if (!data) return null;

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setAcknowledgedAlerts((prev) => new Set([...prev, alertId]));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const riskColor = getRiskLevelColor(data.riskLevel);
  const riskBgColor = getRiskLevelBgColor(data.riskLevel);
  const visibleAlerts = data.alerts.filter((a) => !acknowledgedAlerts.has(a.id));

  if (compact) {
    return (
      <div className={`rounded-lg border-2 p-4 ${riskBgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${riskColor}`}>Risk Score</p>
            <p className={`text-3xl font-bold ${riskColor}`}>{data.overallScore}/100</p>
          </div>
          <div>
            <p className={`text-lg font-bold uppercase ${riskColor}`}>{data.riskLevel}</p>
            {visibleAlerts.length > 0 && (
              <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vault Risk Assessment</h2>

      {/* Overall Score */}
      <div className={`rounded-lg border-2 p-8 ${riskBgColor}`}>
        <div className="flex flex-col items-center text-center">
          <p className={`text-sm font-semibold uppercase ${riskColor}`}>{data.riskLevel} Risk</p>
          <div className="mt-4 flex items-baseline gap-2">
            <p className={`text-6xl font-bold ${riskColor}`}>{data.overallScore}</p>
            <p className={`text-2xl ${riskColor}`}>/100</p>
          </div>
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
            Lower score = safer vault
          </p>
        </div>

        {/* Risk Gauge */}
        <div className="mt-6">
          <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full transition-all ${getRiskGaugeColor(data.overallScore)}`}
              style={{ width: `${Math.min(data.overallScore, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Safe</span>
            <span>Caution</span>
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-3">
          {visibleAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={() => handleAcknowledgeAlert(alert.id)}
            />
          ))}
        </div>
      )}

      {/* Risk Factors */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Factors</h3>

        <RiskFactorCard
          factor="Withdrawal Velocity"
          score={data.factors.withdrawalVelocity.score}
          status={data.factors.withdrawalVelocity.status}
          description={data.factors.withdrawalVelocity.description}
          isExpanded={expandedFactor === 'velocity'}
          onToggle={() => setExpandedFactor(expandedFactor === 'velocity' ? null : 'velocity')}
          details={() => (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Daily Avg</p>
                  <p className="font-semibold">${data.factors.withdrawalVelocity.dailyAverageAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Weekly Avg</p>
                  <p className="font-semibold">${data.factors.withdrawalVelocity.weeklyAverageAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Avg</p>
                  <p className="font-semibold">${data.factors.withdrawalVelocity.monthlyAverageAmount}</p>
                </div>
              </div>
              <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Last Withdrawal</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ${data.factors.withdrawalVelocity.lastWithdrawal.amount} •{' '}
                  {data.factors.withdrawalVelocity.lastWithdrawal.category}
                </p>
              </div>
            </div>
          )}
        />

        <RiskFactorCard
          factor="Pattern Deviation"
          score={data.factors.patternDeviation.score}
          status={data.factors.patternDeviation.status}
          description={data.factors.patternDeviation.description}
          isExpanded={expandedFactor === 'pattern'}
          onToggle={() => setExpandedFactor(expandedFactor === 'pattern' ? null : 'pattern')}
          details={() => (
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <Badge
                  active={data.factors.patternDeviation.timeOfDayAnomaly}
                  label="Time-of-day anomaly"
                />
                <Badge
                  active={data.factors.patternDeviation.frequencyAnomaly}
                  label="Frequency anomaly"
                />
                <Badge
                  active={data.factors.patternDeviation.amountAnomaly}
                  label="Amount anomaly"
                />
              </div>
              {data.factors.patternDeviation.anomalousWithdrawals.length > 0 && (
                <div className="rounded bg-yellow-100 p-2 dark:bg-yellow-900/30">
                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                    {data.factors.patternDeviation.anomalousWithdrawals.length} anomalies detected
                  </p>
                </div>
              )}
            </div>
          )}
        />

        <RiskFactorCard
          factor="Guardian Consensus"
          score={data.factors.guardianConsensus.score}
          status={data.factors.guardianConsensus.status}
          description={data.factors.guardianConsensus.description}
          isExpanded={expandedFactor === 'consensus'}
          onToggle={() => setExpandedFactor(expandedFactor === 'consensus' ? null : 'consensus')}
          details={() => (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Consensus Rate</p>
                  <p className="font-semibold">
                    {Math.round(data.factors.guardianConsensus.consensusRate * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Avg Approval Time</p>
                  <p className="font-semibold">
                    {Math.round(data.factors.guardianConsensus.averageApprovalTime / 60)}m
                  </p>
                </div>
              </div>
              {data.factors.guardianConsensus.dissenting > 0 && (
                <div className="rounded bg-yellow-100 p-2 dark:bg-yellow-900/30">
                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                    {data.factors.guardianConsensus.dissenting} guardian{data.factors.guardianConsensus.dissenting !== 1 ? 's' : ''} dissenting
                  </p>
                </div>
              )}
            </div>
          )}
        />

        <RiskFactorCard
          factor="Spending Headroom"
          score={data.factors.spendingHeadroom.score}
          status={data.factors.spendingHeadroom.status}
          description={data.factors.spendingHeadroom.description}
          isExpanded={expandedFactor === 'spending'}
          onToggle={() => setExpandedFactor(expandedFactor === 'spending' ? null : 'spending')}
          details={() => (
            <div className="space-y-3 text-sm">
              <div className="space-y-2">
                <SpendingLimitBar
                  label="Daily"
                  utilization={data.factors.spendingHeadroom.dailyUtilization}
                />
                <SpendingLimitBar
                  label="Weekly"
                  utilization={data.factors.spendingHeadroom.weeklyUtilization}
                  warning={data.factors.spendingHeadroom.weeklyUtilization > 0.7}
                />
                <SpendingLimitBar
                  label="Monthly"
                  utilization={data.factors.spendingHeadroom.monthlyUtilization}
                />
              </div>
              {data.factors.spendingHeadroom.tokensNearLimit.length > 0 && (
                <div className="rounded bg-orange-100 p-2 dark:bg-orange-900/30">
                  <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">
                    Tokens near limit:
                  </p>
                  {data.factors.spendingHeadroom.tokensNearLimit.map((token) => (
                    <p key={token.token} className="text-xs text-orange-700 dark:text-orange-400">
                      {token.token}: {Math.round(token.weeklyUtilization * 100)}% of weekly limit
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        />

        <RiskFactorCard
          factor="Time-Lock Utilization"
          score={data.factors.timeLockUtilization.score}
          status={data.factors.timeLockUtilization.status}
          description={data.factors.timeLockUtilization.description}
          isExpanded={expandedFactor === 'timelock'}
          onToggle={() => setExpandedFactor(expandedFactor === 'timelock' ? null : 'timelock')}
          details={() => (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Queued</p>
                  <p className="font-semibold">
                    {data.factors.timeLockUtilization.queuedWithdrawals}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Frozen</p>
                  <p className="font-semibold">
                    {data.factors.timeLockUtilization.frozenWithdrawals}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Emergencies (30d)</p>
                  <p className="font-semibold">
                    {data.factors.timeLockUtilization.emergencyFreezesInMonth}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-200">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-blue-800 dark:text-blue-300">
                <span className="mt-0.5 text-lg">💡</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Individual risk factor card
 */
function RiskFactorCard({
  factor,
  score,
  status,
  description,
  isExpanded,
  onToggle,
  details
}: {
  factor: string;
  score: number;
  status: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  details: () => React.ReactNode;
}) {
  const statusColor = getStatusColor(status);

  return (
    <button
      onClick={onToggle}
      className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white">{factor}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="ml-4 text-right">
          <p className={`text-sm font-bold ${statusColor}`}>{score}/100</p>
          <p className={`text-xs capitalize ${statusColor}`}>{status}</p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
          {details()}
        </div>
      )}
    </button>
  );
}

/**
 * Alert card for displaying risk alerts
 */
function AlertCard({
  alert,
  onAcknowledge
}: {
  alert: any;
  onAcknowledge: () => void;
}) {
  const severityColors = {
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    critical: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
  };

  const severityIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🔴'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${severityColors[alert.severity as 'info' | 'warning' | 'critical']}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{severityIcons[alert.severity as 'info' | 'warning' | 'critical']}</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white">{alert.message}</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{alert.description}</p>
          <p className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
            💡 {alert.recommendation}
          </p>
        </div>
        <button
          onClick={onAcknowledge}
          className="ml-2 whitespace-nowrap rounded px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

/**
 * Spending limit progress bar
 */
function SpendingLimitBar({
  label,
  utilization,
  warning = false
}: {
  label: string;
  utilization: number;
  warning?: boolean;
}) {
  const percentage = Math.min(utilization * 100, 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full transition-all ${
            percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Status badge
 */
function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs font-semibold ${
        active
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      }`}
    >
      {active ? '⚠️' : '✓'} {label}
    </span>
  );
}

/**
 * Get color for risk level
 */
function getRiskGaugeColor(score: number): string {
  if (score < 25) return 'bg-green-500';
  if (score < 50) return 'bg-yellow-500';
  if (score < 75) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Get color for status text
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'excellent':
    case 'healthy':
    case 'safe':
    case 'normal':
      return 'text-green-600 dark:text-green-400';
    case 'caution':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'warning':
      return 'text-orange-600 dark:text-orange-400';
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}
