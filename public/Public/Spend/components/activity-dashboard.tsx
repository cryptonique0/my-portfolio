'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  LogIn,
  ShieldAlert,
  Filter,
  Search,
  ChevronDown,
  AlertCircle,
  Shield,
} from 'lucide-react';

// Type definitions
interface WithdrawalActivity {
  id: string;
  timestamp: string;
  type: 'withdrawal' | 'deposit';
  amount: string;
  currency: string;
  recipient: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  guardianApprovals: number;
  guardianRequired: number;
}

interface GuardianApproval {
  id: string;
  timestamp: string;
  action: string;
  guardian: string;
  status: 'approved' | 'rejected' | 'pending';
  reason?: string;
  requestType: 'withdrawal' | 'settings-change' | 'recovery' | 'guardian-change';
}

interface RecoveryAttempt {
  id: string;
  timestamp: string;
  method: 'guardian' | 'biometric' | 'hardware-key' | 'email';
  status: 'success' | 'pending' | 'failed';
  details: string;
  initiator: string;
  completedAt?: string;
}

interface SettingsChange {
  id: string;
  timestamp: string;
  setting: string;
  oldValue: string;
  newValue: string;
  status: 'completed' | 'pending' | 'reverted';
  performedBy: string;
  description: string;
}

interface LoginActivity {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  location: string;
  status: 'success' | 'failed' | 'suspicious';
  method: 'password' | 'biometric' | '2fa' | 'passkey';
  reason?: string;
}

// Sample data
const SAMPLE_WITHDRAWALS: WithdrawalActivity[] = [
  {
    id: 'w-001',
    timestamp: '2026-01-17 14:32:00',
    type: 'withdrawal',
    amount: '2.5',
    currency: 'ETH',
    recipient: '0x1234...5678',
    status: 'completed',
    txHash: '0xabc123...def456',
    guardianApprovals: 3,
    guardianRequired: 3,
  },
  {
    id: 'w-002',
    timestamp: '2026-01-17 11:15:00',
    type: 'deposit',
    amount: '10.0',
    currency: 'USDC',
    recipient: 'Your Vault',
    status: 'completed',
    guardianApprovals: 0,
    guardianRequired: 0,
  },
  {
    id: 'w-003',
    timestamp: '2026-01-16 09:45:00',
    type: 'withdrawal',
    amount: '1.75',
    currency: 'ETH',
    recipient: '0x5678...9abc',
    status: 'pending',
    guardianApprovals: 2,
    guardianRequired: 3,
  },
  {
    id: 'w-004',
    timestamp: '2026-01-15 16:20:00',
    type: 'withdrawal',
    amount: '500.0',
    currency: 'USDC',
    recipient: '0x9abc...def0',
    status: 'failed',
    guardianApprovals: 1,
    guardianRequired: 3,
  },
];

const SAMPLE_GUARDIAN_APPROVALS: GuardianApproval[] = [
  {
    id: 'g-001',
    timestamp: '2026-01-17 14:28:00',
    action: 'Approved withdrawal request',
    guardian: 'Sarah Johnson',
    status: 'approved',
    requestType: 'withdrawal',
  },
  {
    id: 'g-002',
    timestamp: '2026-01-17 14:25:00',
    action: 'Approved withdrawal request',
    guardian: 'Michael Chen',
    status: 'approved',
    requestType: 'withdrawal',
  },
  {
    id: 'g-003',
    timestamp: '2026-01-17 14:20:00',
    action: 'Approved withdrawal request',
    guardian: 'Emma Rodriguez',
    status: 'approved',
    requestType: 'withdrawal',
  },
  {
    id: 'g-004',
    timestamp: '2026-01-16 10:15:00',
    action: 'Rejected settings change (increased withdrawal limit)',
    guardian: 'Sarah Johnson',
    status: 'rejected',
    reason: 'Too risky an increase',
    requestType: 'settings-change',
  },
  {
    id: 'g-005',
    timestamp: '2026-01-15 15:30:00',
    action: 'Approved guardian change',
    guardian: 'Michael Chen',
    status: 'approved',
    requestType: 'guardian-change',
  },
];

const SAMPLE_RECOVERY_ATTEMPTS: RecoveryAttempt[] = [
  {
    id: 'r-001',
    timestamp: '2026-01-17 14:32:00',
    method: 'guardian',
    status: 'pending',
    details: 'Awaiting approval from Sarah Johnson',
    initiator: 'You (Manual Initiation)',
  },
  {
    id: 'r-002',
    timestamp: '2026-01-16 09:15:00',
    method: 'biometric',
    status: 'success',
    details: 'Fingerprint authentication successful',
    initiator: 'Auto-triggered after failed login',
    completedAt: '2026-01-16 09:16:00',
  },
  {
    id: 'r-003',
    timestamp: '2026-01-15 18:45:00',
    method: 'email',
    status: 'success',
    details: 'Verified via backup.email@example.com',
    initiator: 'You (Manual Initiation)',
    completedAt: '2026-01-15 18:50:00',
  },
  {
    id: 'r-004',
    timestamp: '2026-01-14 11:20:00',
    method: 'hardware-key',
    status: 'failed',
    details: 'Hardware key not recognized (timeout)',
    initiator: 'You (Manual Initiation)',
  },
];

const SAMPLE_SETTINGS_CHANGES: SettingsChange[] = [
  {
    id: 's-001',
    timestamp: '2026-01-17 13:00:00',
    setting: 'Withdrawal Limit',
    oldValue: '$5,000 per day',
    newValue: '$10,000 per day',
    status: 'pending',
    performedBy: 'You',
    description: 'Increased daily withdrawal limit (pending guardian approval)',
  },
  {
    id: 's-002',
    timestamp: '2026-01-16 16:45:00',
    setting: 'Recovery Timeline',
    oldValue: 'Standard (48h)',
    newValue: 'Conservative (72h)',
    status: 'completed',
    performedBy: 'You',
    description: 'Changed recovery timeline to allow more time',
  },
  {
    id: 's-003',
    timestamp: '2026-01-15 10:30:00',
    setting: 'Notification Preferences',
    oldValue: 'All notifications enabled',
    newValue: 'Hourly reminders disabled',
    status: 'completed',
    performedBy: 'You',
    description: 'Disabled hourly recovery reminders',
  },
  {
    id: 's-004',
    timestamp: '2026-01-14 09:00:00',
    setting: 'Two-Factor Authentication',
    oldValue: 'Disabled',
    newValue: 'Enabled (TOTP)',
    status: 'completed',
    performedBy: 'You',
    description: 'Enabled time-based one-time password authentication',
  },
];

const SAMPLE_LOGIN_ACTIVITY: LoginActivity[] = [
  {
    id: 'l-001',
    timestamp: '2026-01-17 14:00:00',
    ipAddress: '192.168.1.100',
    device: 'Chrome on Windows 11',
    location: 'San Francisco, CA',
    status: 'success',
    method: '2fa',
  },
  {
    id: 'l-002',
    timestamp: '2026-01-17 08:30:00',
    ipAddress: '192.168.1.100',
    device: 'Safari on iPhone 15',
    location: 'San Francisco, CA',
    status: 'success',
    method: 'biometric',
  },
  {
    id: 'l-003',
    timestamp: '2026-01-16 22:15:00',
    ipAddress: '203.45.67.89',
    device: 'Chrome on MacOS',
    location: 'Tokyo, Japan',
    status: 'suspicious',
    method: 'password',
    reason: 'Unusual location',
  },
  {
    id: 'l-004',
    timestamp: '2026-01-16 15:45:00',
    ipAddress: '45.67.89.123',
    device: 'Unknown',
    location: 'Mumbai, India',
    status: 'failed',
    method: 'password',
    reason: 'Invalid credentials',
  },
  {
    id: 'l-005',
    timestamp: '2026-01-16 14:30:00',
    ipAddress: '192.168.1.100',
    device: 'Chrome on Windows 11',
    location: 'San Francisco, CA',
    status: 'success',
    method: 'passkey',
  },
];

// Activity Dashboard Component
export function ActivityDashboard() {
  const [activeTab, setActiveTab] = useState<
    'all' | 'withdrawals' | 'guardian' | 'recovery' | 'settings' | 'login'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed':
      case 'rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      case 'suspicious':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'suspicious':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Render withdrawal activity row
  const renderWithdrawalRow = (activity: WithdrawalActivity) => (
    <div
      key={activity.id}
      onClick={() => setExpandedItem(expandedItem === activity.id ? null : activity.id)}
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            {activity.type === 'withdrawal' ? (
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'} - {activity.amount} {activity.currency}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activity.guardianRequired > 0 && (
            <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
              <Shield className="w-3 h-3" />
              {activity.guardianApprovals}/{activity.guardianRequired}
            </div>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(activity.status)}`}>
            {getStatusIcon(activity.status)}
            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedItem === activity.id ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {expandedItem === activity.id && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Recipient</p>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{activity.recipient}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Status</p>
              <p className="text-gray-900 dark:text-white capitalize">{activity.status}</p>
            </div>
            {activity.txHash && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Transaction Hash</p>
                <p className="text-gray-900 dark:text-white font-mono text-sm">{activity.txHash}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Guardian Approvals</p>
              <p className="text-gray-900 dark:text-white">
                {activity.guardianApprovals} of {activity.guardianRequired}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render guardian approval row
  const renderGuardianRow = (approval: GuardianApproval) => (
    <div
      key={approval.id}
      onClick={() => setExpandedItem(expandedItem === approval.id ? null : approval.id)}
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{approval.guardian}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{approval.action}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{approval.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(approval.status)}`}>
            {getStatusIcon(approval.status)}
            {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedItem === approval.id ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {expandedItem === approval.id && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Guardian</p>
              <p className="text-gray-900 dark:text-white">{approval.guardian}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Request Type</p>
              <p className="text-gray-900 dark:text-white capitalize">{approval.requestType.replace('-', ' ')}</p>
            </div>
            {approval.reason && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Reason</p>
                <p className="text-gray-900 dark:text-white">{approval.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Render recovery attempt row
  const renderRecoveryRow = (attempt: RecoveryAttempt) => (
    <div
      key={attempt.id}
      onClick={() => setExpandedItem(expandedItem === attempt.id ? null : attempt.id)}
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Recovery via {attempt.method.replace('-', ' ')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{attempt.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(attempt.status)}`}>
            {getStatusIcon(attempt.status)}
            {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedItem === attempt.id ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {expandedItem === attempt.id && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Method</p>
              <p className="text-gray-900 dark:text-white capitalize">{attempt.method.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Details</p>
              <p className="text-gray-900 dark:text-white">{attempt.details}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Initiated By</p>
              <p className="text-gray-900 dark:text-white">{attempt.initiator}</p>
            </div>
            {attempt.completedAt && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Completed At</p>
                <p className="text-gray-900 dark:text-white">{attempt.completedAt}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Render settings change row
  const renderSettingsRow = (change: SettingsChange) => (
    <div
      key={change.id}
      onClick={() => setExpandedItem(expandedItem === change.id ? null : change.id)}
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{change.setting}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{change.description}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{change.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(change.status)}`}>
            {getStatusIcon(change.status)}
            {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedItem === change.id ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {expandedItem === change.id && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Setting</p>
              <p className="text-gray-900 dark:text-white font-medium">{change.setting}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Previous Value</p>
                <p className="text-gray-900 dark:text-white">{change.oldValue}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">New Value</p>
                <p className="text-gray-900 dark:text-white">{change.newValue}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Performed By</p>
              <p className="text-gray-900 dark:text-white">{change.performedBy}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render login activity row
  const renderLoginRow = (login: LoginActivity) => (
    <div
      key={login.id}
      onClick={() => setExpandedItem(expandedItem === login.id ? null : login.id)}
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              {login.status === 'success' ? (
                <LogIn className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {login.device}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{login.location}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{login.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(login.status)}`}>
            {getStatusIcon(login.status)}
            {login.status.charAt(0).toUpperCase() + login.status.slice(1)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedItem === login.id ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {expandedItem === login.id && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">IP Address</p>
                <p className="text-gray-900 dark:text-white font-mono">{login.ipAddress}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Device</p>
                <p className="text-gray-900 dark:text-white">{login.device}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Location</p>
                <p className="text-gray-900 dark:text-white">{login.location}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Auth Method</p>
                <p className="text-gray-900 dark:text-white capitalize">{login.method}</p>
              </div>
            </div>
            {login.reason && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Reason/Alert</p>
                <p className="text-gray-900 dark:text-white">{login.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Filter data based on active tab
  const getFilteredData = () => {
    interface ActivityItemWithType {
      timestamp: string;
      id: string;
      type: string;
      [key: string]: unknown;
    }
    
    let allData: ActivityItemWithType[] = [];

    if (activeTab === 'all' || activeTab === 'withdrawals') {
      allData = [...allData, ...SAMPLE_WITHDRAWALS.map(w => ({ ...w, type: 'withdrawal' }))];
    }
    if (activeTab === 'all' || activeTab === 'guardian') {
      allData = [...allData, ...SAMPLE_GUARDIAN_APPROVALS.map(g => ({ ...g, type: 'guardian' }))];
    }
    if (activeTab === 'all' || activeTab === 'recovery') {
      allData = [...allData, ...SAMPLE_RECOVERY_ATTEMPTS.map(r => ({ ...r, type: 'recovery' }))];
    }
    if (activeTab === 'all' || activeTab === 'settings') {
      allData = [...allData, ...SAMPLE_SETTINGS_CHANGES.map(s => ({ ...s, type: 'settings' }))];
    }
    if (activeTab === 'all' || activeTab === 'login') {
      allData = [...allData, ...SAMPLE_LOGIN_ACTIVITY.map(l => ({ ...l, type: 'login' }))];
    }

    // Sort by timestamp (newest first)
    allData.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    return allData;
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive audit trail of all vault activity
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{SAMPLE_WITHDRAWALS.length}</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-rose-600 dark:text-rose-400 opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Guardian Actions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{SAMPLE_GUARDIAN_APPROVALS.length}</p>
            </div>
            <ShieldAlert className="w-8 h-8 text-purple-600 dark:text-purple-400 opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recovery Attempts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{SAMPLE_RECOVERY_ATTEMPTS.length}</p>
            </div>
            <Shield className="w-8 h-8 text-cyan-600 dark:text-cyan-400 opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Settings Changes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{SAMPLE_SETTINGS_CHANGES.length}</p>
            </div>
            <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400 opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Login Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{SAMPLE_LOGIN_ACTIVITY.length}</p>
            </div>
            <LogIn className="w-8 h-8 text-teal-600 dark:text-teal-400 opacity-20" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 flex overflow-x-auto">
          {[
            { id: 'all' as const, label: 'All Activity' },
            { id: 'withdrawals' as const, label: 'Withdrawals' },
            { id: 'guardian' as const, label: 'Guardian Approvals' },
            { id: 'recovery' as const, label: 'Recovery Attempts' },
            { id: 'settings' as const, label: 'Settings' },
            { id: 'login' as const, label: 'Login Activity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No activities found</p>
            </div>
          ) : (
            filteredData.map((item) => {
              if (item.type === 'withdrawal') return renderWithdrawalRow(item as unknown as WithdrawalActivity);
              if (item.type === 'guardian') return renderGuardianRow(item as unknown as GuardianApproval);
              if (item.type === 'recovery') return renderRecoveryRow(item as unknown as RecoveryAttempt);
              if (item.type === 'settings') return renderSettingsRow(item as unknown as SettingsChange);
              if (item.type === 'login') return renderLoginRow(item as unknown as LoginActivity);
              return null;
            })
          )}
        </div>
      </div>

      {/* Export Option */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
          Export as CSV
        </button>
        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium">
          Generate Report
        </button>
      </div>
    </div>
  );
}
