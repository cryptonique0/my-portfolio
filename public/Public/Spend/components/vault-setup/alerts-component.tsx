'use client';

import { useState, useMemo } from 'react';
import {
  Bell,
  Check,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Search,
  Filter,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Alert, AlertSeverity } from '@/lib/services/webhook-types';

interface AlertsComponentProps {
  alerts?: Alert[];
  onMarkAsRead?: (alertId: string) => void;
  onDelete?: (alertId: string) => void;
  onViewDetails?: (alertId: string) => void;
}

const severityColors: Record<AlertSeverity, string> = {
  critical: 'bg-red-900/20 text-red-400 border-red-500/30',
  high: 'bg-orange-900/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-900/20 text-blue-400 border-blue-500/30',
  info: 'bg-gray-900/20 text-gray-400 border-gray-500/30',
};

const severityIcons: Record<AlertSeverity, typeof AlertCircle> = {
  critical: AlertCircle,
  high: AlertCircle,
  medium: AlertCircle,
  low: Info,
  info: Info,
};

// Sample alerts for demonstration
const sampleAlerts: Alert[] = [
  {
    id: 'alert_1',
    vaultAddress: '0x1234567890123456789012345678901234567890',
    type: 'security.unusual_activity',
    severity: 'critical',
    title: 'Unusual Activity Detected',
    message: 'Login attempt from new device in Singapore detected. Was this you?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    actionRequired: true,
    actions: [
      { id: 'verify', label: 'Verify This Was Me', action: 'verify', isPrimary: true },
      { id: 'block', label: 'Block This Device', action: 'block', isPrimary: false },
    ],
  },
  {
    id: 'alert_2',
    vaultAddress: '0x1234567890123456789012345678901234567890',
    type: 'transaction.pending_approval',
    severity: 'high',
    title: 'Transaction Pending Approval',
    message: 'Guardian approval needed for withdrawal of 5.5 ETH to 0xabcd...',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    actionRequired: true,
    actions: [
      { id: 'view', label: 'View Transaction', action: 'view_transaction', isPrimary: true },
    ],
  },
  {
    id: 'alert_3',
    vaultAddress: '0x1234567890123456789012345678901234567890',
    type: 'guardian.added',
    severity: 'info',
    title: 'Guardian Added',
    message: 'John Doe has been successfully added as a guardian to your vault.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    actionRequired: false,
  },
  {
    id: 'alert_4',
    vaultAddress: '0x1234567890123456789012345678901234567890',
    type: 'transaction.completed',
    severity: 'info',
    title: 'Transaction Completed',
    message: 'Withdrawal of 2.0 ETH completed successfully. TX: 0xabcd1234...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    actionRequired: false,
  },
  {
    id: 'alert_5',
    vaultAddress: '0x1234567890123456789012345678901234567890',
    type: 'security.2fa_enabled',
    severity: 'info',
    title: '2FA Enabled',
    message: 'Two-factor authentication has been enabled on your account.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    actionRequired: false,
  },
];

export function AlertsComponent({ alerts: providedAlerts, onMarkAsRead, onDelete }: AlertsComponentProps) {
  const alerts = providedAlerts || sampleAlerts;
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showActionRequired, setShowActionRequired] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        alert.title.toLowerCase().includes(search.toLowerCase()) ||
        alert.message.toLowerCase().includes(search.toLowerCase());

      const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const matchesRead = !showUnreadOnly || !alert.read;
      const matchesAction = !showActionRequired || alert.actionRequired;

      return matchesSearch && matchesSeverity && matchesRead && matchesAction;
    });
  }, [alerts, search, selectedSeverity, showUnreadOnly, showActionRequired]);

  const stats = {
    total: alerts.length,
    unread: alerts.filter((a) => !a.read).length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    actionRequired: alerts.filter((a) => a.actionRequired).length,
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alerts & Notifications
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Real-time alerts from your vault and security events
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Configure
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total Alerts</div>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.unread}</div>
          <div className="text-xs text-blue-300">Unread</div>
        </div>
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
          <div className="text-xs text-red-300">Critical</div>
        </div>
        <div className="bg-orange-900/20 border border-orange-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-400">{stats.actionRequired}</div>
          <div className="text-xs text-orange-300">Action Required</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            variant={showUnreadOnly ? 'default' : 'outline'}
            size="sm"
          >
            {showUnreadOnly ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
            Unread Only
          </Button>

          <Button
            onClick={() => setShowActionRequired(!showActionRequired)}
            variant={showActionRequired ? 'default' : 'outline'}
            size="sm"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Action Required
          </Button>

          {/* Severity Filter */}
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedSeverity('all')}
              variant={selectedSeverity === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
            {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
              <Button
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                variant={selectedSeverity === severity ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {severity}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No alerts match your filters.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const SeverityIcon = severityIcons[alert.severity];
            const isExpanded = expandedAlert === alert.id;

            return (
              <div
                key={alert.id}
                className={`border rounded-lg transition-all ${
                  alert.read
                    ? 'bg-gray-900/30 border-gray-700'
                    : `${severityColors[alert.severity]} border`
                } ${isExpanded ? 'ring-2 ring-blue-500/50' : ''}`}
              >
                <button
                  onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                  className="w-full p-4 text-left hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-start gap-4 justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <SeverityIcon
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          alert.severity === 'critical'
                            ? 'text-red-400'
                            : alert.severity === 'high'
                              ? 'text-orange-400'
                              : alert.severity === 'medium'
                                ? 'text-yellow-400'
                                : alert.severity === 'low'
                                  ? 'text-blue-400'
                                  : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{alert.title}</h3>
                          {!alert.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                          )}
                          {alert.actionRequired && (
                            <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-300 font-medium">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(alert.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!alert.read && (
                        <div className="px-2 py-1 rounded text-xs bg-blue-900/50 text-blue-300">
                          Unread
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-700 px-4 py-4 bg-gray-950/50 space-y-4">
                    {/* Alert Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Details</h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 text-gray-300 font-mono">{alert.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Severity:</span>
                          <span className="ml-2 text-gray-300 capitalize font-semibold">{alert.severity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-2 text-gray-300">{alert.timestamp.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">ID:</span>
                          <span className="ml-2 text-gray-300 font-mono text-xs">{alert.id.slice(0, 12)}...</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {alert.actions && alert.actions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {alert.actions.map((action) => (
                            <Button
                              key={action.id}
                              variant={action.isPrimary ? 'default' : 'outline'}
                              size="sm"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alert Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
                      {!alert.read && (
                        <Button
                          onClick={() => onMarkAsRead?.(alert.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Mark as Read
                        </Button>
                      )}

                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(alert, null, 2));
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>

                      <Button
                        onClick={() => onDelete?.(alert.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-400 hover:text-red-300 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
