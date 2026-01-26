/**
 * Activity Log Types & Interfaces
 * Comprehensive type definitions for activity tracking and reporting
 */

export type ActivityType =
  | 'vault_created'
  | 'vault_updated'
  | 'vault_deleted'
  | 'guardian_added'
  | 'guardian_removed'
  | 'guardian_approved'
  | 'guardian_rejected'
  | 'transaction_initiated'
  | 'transaction_approved'
  | 'transaction_rejected'
  | 'transaction_completed'
  | 'transaction_failed'
  | 'threshold_updated'
  | 'settings_changed'
  | 'security_event'
  | 'emergency_access_requested'
  | 'emergency_access_approved'
  | 'recovery_initiated'
  | 'user_login'
  | 'user_logout'
  | 'password_changed'
  | '2fa_enabled'
  | '2fa_disabled';

export type ActivitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ActivityCategory =
  | 'vault'
  | 'guardian'
  | 'transaction'
  | 'security'
  | 'settings'
  | 'emergency'
  | 'user';

export interface ActivityLog {
  id: string;
  timestamp: number;
  type: ActivityType;
  category: ActivityCategory;
  severity: ActivitySeverity;
  vaultAddress?: string;
  userId?: string;
  userEmail?: string;
  action: string;
  description: string;
  metadata: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface ActivityFilterOptions {
  types?: ActivityType[];
  categories?: ActivityCategory[];
  severities?: ActivitySeverity[];
  dateRange?: {
    start: number;
    end: number;
  };
  vaultAddress?: string;
  userId?: string;
  searchTerm?: string;
  successOnly?: boolean;
}

export interface ActivityExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeMetadata?: boolean;
  includeChanges?: boolean;
  filters?: ActivityFilterOptions;
  filename?: string;
}

export interface ActivityStatistics {
  totalActivities: number;
  byCategory: Record<ActivityCategory, number>;
  byType: Record<ActivityType, number>;
  bySeverity: Record<ActivitySeverity, number>;
  successRate: number;
  failureCount: number;
  dateRange: {
    earliest: number;
    latest: number;
  };
}

export interface ActivityGrouped {
  [key: string]: ActivityLog[];
}

// Default severity mapping
export const activitySeverityMap: Record<ActivityType, ActivitySeverity> = {
  vault_created: 'info',
  vault_updated: 'low',
  vault_deleted: 'high',
  guardian_added: 'medium',
  guardian_removed: 'high',
  guardian_approved: 'medium',
  guardian_rejected: 'medium',
  transaction_initiated: 'medium',
  transaction_approved: 'high',
  transaction_rejected: 'medium',
  transaction_completed: 'medium',
  transaction_failed: 'high',
  threshold_updated: 'medium',
  settings_changed: 'low',
  security_event: 'critical',
  emergency_access_requested: 'critical',
  emergency_access_approved: 'critical',
  recovery_initiated: 'critical',
  user_login: 'info',
  user_logout: 'info',
  password_changed: 'high',
  '2fa_enabled': 'high',
  '2fa_disabled': 'high',
};

// Category mapping
export const activityCategoryMap: Record<ActivityType, ActivityCategory> = {
  vault_created: 'vault',
  vault_updated: 'vault',
  vault_deleted: 'vault',
  guardian_added: 'guardian',
  guardian_removed: 'guardian',
  guardian_approved: 'guardian',
  guardian_rejected: 'guardian',
  transaction_initiated: 'transaction',
  transaction_approved: 'transaction',
  transaction_rejected: 'transaction',
  transaction_completed: 'transaction',
  transaction_failed: 'transaction',
  threshold_updated: 'settings',
  settings_changed: 'settings',
  security_event: 'security',
  emergency_access_requested: 'emergency',
  emergency_access_approved: 'emergency',
  recovery_initiated: 'emergency',
  user_login: 'user',
  user_logout: 'user',
  password_changed: 'security',
  '2fa_enabled': 'security',
  '2fa_disabled': 'security',
};

// Human-readable descriptions
export const activityDescriptions: Record<ActivityType, string> = {
  vault_created: 'Vault was created',
  vault_updated: 'Vault configuration was updated',
  vault_deleted: 'Vault was deleted',
  guardian_added: 'Guardian was added to vault',
  guardian_removed: 'Guardian was removed from vault',
  guardian_approved: 'Guardian approved a transaction',
  guardian_rejected: 'Guardian rejected a transaction',
  transaction_initiated: 'Transaction was initiated',
  transaction_approved: 'Transaction was approved',
  transaction_rejected: 'Transaction was rejected',
  transaction_completed: 'Transaction was completed',
  transaction_failed: 'Transaction failed',
  threshold_updated: 'Guardian threshold was updated',
  settings_changed: 'Vault settings were changed',
  security_event: 'Security event detected',
  emergency_access_requested: 'Emergency access was requested',
  emergency_access_approved: 'Emergency access was approved',
  recovery_initiated: 'Vault recovery was initiated',
  user_login: 'User logged in',
  user_logout: 'User logged out',
  password_changed: 'Password was changed',
  '2fa_enabled': 'Two-factor authentication was enabled',
  '2fa_disabled': 'Two-factor authentication was disabled',
};

// Severity colors for UI
export const severityColors: Record<ActivitySeverity, string> = {
  critical: '#FF0000',
  high: '#FF6600',
  medium: '#FFCC00',
  low: '#0099FF',
  info: '#CCCCCC',
};

// Severity emojis for UI
export const severityEmojis: Record<ActivitySeverity, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
  info: '⚪',
};

// Category colors for UI
export const categoryColors: Record<ActivityCategory, string> = {
  vault: '#6366F1',
  guardian: '#8B5CF6',
  transaction: '#10B981',
  security: '#EF4444',
  settings: '#3B82F6',
  emergency: '#F59E0B',
  user: '#64748B',
};

// Create sample activity log for demonstration
export function createSampleActivityLogs(): ActivityLog[] {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  return [
    {
      id: '1',
      timestamp: now,
      type: 'user_login',
      category: 'user',
      severity: 'info',
      userId: 'user123',
      userEmail: 'alice@example.com',
      action: 'Login successful',
      description: 'User logged into the vault management system',
      metadata: { ipAddress: '192.168.1.1', browser: 'Chrome' },
      success: true,
    },
    {
      id: '2',
      timestamp: now - oneDay,
      type: 'transaction_initiated',
      category: 'transaction',
      severity: 'medium',
      vaultAddress: '0xabcd...ef01',
      action: 'ETH withdrawal',
      description: 'User initiated 5 ETH withdrawal from vault',
      metadata: {
        amount: '5',
        token: 'ETH',
        recipient: '0x1234...5678',
      },
      success: true,
    },
    {
      id: '3',
      timestamp: now - 2 * oneDay,
      type: 'guardian_added',
      category: 'guardian',
      severity: 'medium',
      vaultAddress: '0xabcd...ef01',
      action: 'Guardian added',
      description: 'New guardian (Bob) was added to vault',
      metadata: {
        guardianAddress: '0x9876...5432',
        guardianName: 'Bob',
      },
      success: true,
    },
    {
      id: '4',
      timestamp: now - 3 * oneDay,
      type: 'transaction_approved',
      category: 'transaction',
      severity: 'high',
      vaultAddress: '0xabcd...ef01',
      action: 'Transaction approved',
      description: 'Guardian approved withdrawal transaction',
      metadata: {
        transactionId: 'tx_789',
        approvedBy: 'Charlie',
      },
      success: true,
    },
    {
      id: '5',
      timestamp: now - 4 * oneDay,
      type: 'vault_created',
      category: 'vault',
      severity: 'info',
      vaultAddress: '0xabcd...ef01',
      action: 'Vault created',
      description: 'New vault was successfully created',
      metadata: {
        threshold: '2/3',
        initialGuardians: 3,
      },
      success: true,
    },
    {
      id: '6',
      timestamp: now - 5 * oneDay,
      type: 'security_event',
      category: 'security',
      severity: 'critical',
      vaultAddress: '0xabcd...ef01',
      action: 'Suspicious activity',
      description: 'Unusual activity detected - multiple failed login attempts',
      metadata: {
        failureCount: 5,
        source: '203.0.113.45',
      },
      success: false,
      errorMessage: 'Multiple failed authentication attempts detected',
    },
    {
      id: '7',
      timestamp: now - 6 * oneDay,
      type: 'password_changed',
      category: 'security',
      severity: 'high',
      userId: 'user123',
      action: 'Password changed',
      description: 'User password was changed',
      metadata: {
        changedAt: new Date(now - 6 * oneDay).toISOString(),
      },
      success: true,
    },
    {
      id: '8',
      timestamp: now - 7 * oneDay,
      type: 'threshold_updated',
      category: 'settings',
      severity: 'medium',
      vaultAddress: '0xabcd...ef01',
      action: 'Threshold updated',
      description: 'Guardian approval threshold was changed',
      metadata: {
        oldThreshold: '2/3',
        newThreshold: '3/3',
        changedBy: 'Alice',
      },
      success: true,
      changes: {
        before: { threshold: '2/3' },
        after: { threshold: '3/3' },
      },
    },
  ];
}
