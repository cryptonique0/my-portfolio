'use client';

import { useState } from 'react';
import { type Address } from 'viem';
import { useGuardianActivity, type GuardianActivityMetrics } from '@/lib/hooks/useGuardianActivity';

interface GuardianActivityDashboardProps {
  vaultAddress: Address;
  autoRefresh?: number; // ms between refreshes
}

/**
 * Guardian Activity Dashboard
 * Shows participation metrics, approval history, badges, and performance
 */
export function GuardianActivityDashboard({
  vaultAddress,
  autoRefresh = 30000
}: GuardianActivityDashboardProps) {
  const [selectedGuardian, setSelectedGuardian] = useState<Address | undefined>(undefined);
  const { data, loading, error } = useGuardianActivity(vaultAddress, selectedGuardian, autoRefresh);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        Error loading guardian activity: {error}
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  // If no guardian selected, show all guardians
  if (!selectedGuardian && data && 'guardians' in data) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Guardian Activity Dashboard
        </h2>

        {/* Vault Health Summary */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vault Health Score</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {data.vaultHealthScore}/100
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Guardian Participation</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(data.averageParticipation * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Guardians Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.guardians.map((guardian) => (
            <button
              key={guardian.address}
              onClick={() => setSelectedGuardian(guardian.address)}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-400"
            >
              <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                {guardian.address.slice(0, 6)}...{guardian.address.slice(-4)}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Trust Score</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {guardian.trustScore}/100
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Participation</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {Math.round(guardian.participationRate * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Approvals</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {guardian.approvalCount}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Events */}
        {data.recentEvents.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Recent Events
            </h3>
            <div className="space-y-3">
              {data.recentEvents.slice(0, 5).map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.type === 'approval' ? '✓ Approved' : '🔒 Freeze Vote'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {event.guardian.slice(0, 6)}...{event.guardian.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {event.amount && `${event.amount} ${event.type}`}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Guardian-specific view
  if (selectedGuardian && data && 'participation' in data) {
    return <GuardianDetailView metrics={data as GuardianActivityMetrics} onBack={() => setSelectedGuardian(undefined)} />;
  }

  return null;
}

/**
 * Detailed view for a single guardian
 */
function GuardianDetailView({
  metrics,
  onBack
}: {
  metrics: GuardianActivityMetrics;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        ← Back to All Guardians
      </button>

      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {metrics.guardian}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              Trust Score: {metrics.reliability.trustScore}/100
            </p>
          </div>
          {metrics.badge && (
            <div className="rounded-lg bg-purple-100 p-4 text-center dark:bg-purple-900/30">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                {metrics.badge.type.toUpperCase()}
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Level {metrics.badge.level}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Participation Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Participation Rate"
          value={`${Math.round(metrics.participation.participationRate * 100)}%`}
          detail={`${metrics.participation.approvalCount} approvals / ${metrics.participation.totalOpportunities} opportunities`}
        />
        <MetricCard
          label="Avg Approval Time"
          value={`${Math.round(metrics.participation.averageApprovalTime / 60)}m`}
          detail="Time to respond to requests"
        />
        <MetricCard
          label="Responsiveness"
          value={`${Math.round(metrics.reliability.responsiveness * 100)}%`}
          detail="Quick to act on requests"
        />
        <MetricCard
          label="Consistency"
          value={`${Math.round(metrics.reliability.consistency * 100)}%`}
          detail="Alignment with other guardians"
        />
      </div>

      {/* Emergency Freeze Participation */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Emergency Freeze Activity
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Freeze Votes (30d)</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {metrics.freezeVoting.freezeVotesInMonth}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unfreeze Votes (30d)</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {metrics.freezeVoting.unfreezeVotesInMonth}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Participation Rate</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(metrics.freezeVoting.emergencyFreezeParticipation * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      {metrics.recentActivity.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {metrics.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatTime(activity.timestamp)}
                </p>
                {activity.type === 'approval' && (
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>Amount: {activity.details.withdrawalAmount}</p>
                    <p>Category: {activity.details.category}</p>
                    <p>Response time: {Math.round(activity.details.timeToApprove / 60)} minutes</p>
                  </div>
                )}
                {activity.type === 'freeze_vote' && (
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>Reason: {activity.details.reason}</p>
                    <p>
                      Votes: {activity.details.voteCount} / {activity.details.threshold}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Metric card component
 */
function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{detail}</p>
    </div>
  );
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return date.toLocaleDateString();
}
