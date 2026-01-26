'use client';

import { useState } from 'react';
import { type Address } from 'viem';
import { GuardianActivityDashboard } from './guardian-activity-dashboard';
import { RiskScoringDashboard } from './risk-scoring-dashboard';

type DashboardTab = 'overview' | 'guardians' | 'risk';

interface VaultDashboardProps {
  vaultAddress: Address;
  vaultName?: string;
}

/**
 * Integrated Vault Dashboard
 * Combines guardian activity and risk scoring with tabbed navigation
 */
export function VaultDashboard({ vaultAddress, vaultName = 'Vault' }: VaultDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const tabs: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'guardians', label: 'Guardians', icon: '🛡️' },
    { id: 'risk', label: 'Risk', icon: '⚠️' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{vaultName}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{vaultAddress}</p>

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab vaultAddress={vaultAddress} />
        )}
        {activeTab === 'guardians' && (
          <GuardianActivityDashboard vaultAddress={vaultAddress} />
        )}
        {activeTab === 'risk' && (
          <RiskScoringDashboard vaultAddress={vaultAddress} />
        )}
      </div>
    </div>
  );
}

/**
 * Overview tab showing key metrics from both systems
 */
function OverviewTab({ vaultAddress }: { vaultAddress: Address }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Risk Score Compact */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Vault Risk Score</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Real-time risk assessment across multiple dimensions
        </p>
        <div className="mt-4">
          <RiskScoringDashboard vaultAddress={vaultAddress} autoRefresh={60000} compact={true} />
        </div>
      </div>

      {/* Guardian Summary */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Guardian Status</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Participation and performance metrics
        </p>
        <div className="mt-4">
          <GuardianActivityDashboard vaultAddress={vaultAddress} />
        </div>
      </div>
    </div>
  );
}

export { RiskScoringDashboard, GuardianActivityDashboard };
