// Webhook configuration and alert types
export type EventType =
  | 'vault.created'
  | 'vault.settings_updated'
  | 'guardian.added'
  | 'guardian.removed'
  | 'guardian.invitation_sent'
  | 'guardian.invitation_accepted'
  | 'transaction.pending_approval'
  | 'transaction.approved'
  | 'transaction.rejected'
  | 'transaction.completed'
  | 'transaction.failed'
  | 'security.login_new_device'
  | 'security.password_changed'
  | 'security.2fa_enabled'
  | 'security.unusual_activity'
  | 'emergency.access_requested'
  | 'emergency.access_approved'
  | 'emergency.access_denied';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface WebhookEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  vaultAddress: string;
  data: Record<string, any>;
  severity: AlertSeverity;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
  };
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: EventType[];
  active: boolean;
  secret: string; // For signature verification
  retryPolicy: {
    maxRetries: number;
    retryDelayMs: number;
  };
  headers?: Record<string, string>;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  eventTypes: EventType[];
  conditions: AlertCondition[];
  actions: AlertAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'matches';
  value: any;
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'in_app' | 'sms';
  target: string;
  template?: string;
}

export interface Alert {
  id: string;
  vaultAddress: string;
  type: EventType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  actions?: AlertActionItem[];
  metadata?: Record<string, any>;
}

export interface AlertActionItem {
  id: string;
  label: string;
  action: string;
  isPrimary: boolean;
}

// Event severity mapping
export const eventSeverityMap: Record<EventType, AlertSeverity> = {
  'vault.created': 'info',
  'vault.settings_updated': 'medium',
  'guardian.added': 'info',
  'guardian.removed': 'high',
  'guardian.invitation_sent': 'info',
  'guardian.invitation_accepted': 'info',
  'transaction.pending_approval': 'medium',
  'transaction.approved': 'info',
  'transaction.rejected': 'medium',
  'transaction.completed': 'info',
  'transaction.failed': 'high',
  'security.login_new_device': 'high',
  'security.password_changed': 'info',
  'security.2fa_enabled': 'info',
  'security.unusual_activity': 'critical',
  'emergency.access_requested': 'high',
  'emergency.access_approved': 'critical',
  'emergency.access_denied': 'medium',
};

// Event descriptions
export const eventDescriptions: Record<EventType, string> = {
  'vault.created': 'A new vault was created',
  'vault.settings_updated': 'Vault settings were updated',
  'guardian.added': 'A new guardian was added',
  'guardian.removed': 'A guardian was removed',
  'guardian.invitation_sent': 'Guardian invitation was sent',
  'guardian.invitation_accepted': 'Guardian accepted invitation',
  'transaction.pending_approval': 'Transaction awaiting guardian approvals',
  'transaction.approved': 'Transaction was approved',
  'transaction.rejected': 'Transaction was rejected',
  'transaction.completed': 'Transaction completed successfully',
  'transaction.failed': 'Transaction failed',
  'security.login_new_device': 'Login from a new device detected',
  'security.password_changed': 'Vault password was changed',
  'security.2fa_enabled': 'Two-factor authentication enabled',
  'security.unusual_activity': 'Unusual activity detected',
  'emergency.access_requested': 'Emergency access was requested',
  'emergency.access_approved': 'Emergency access was approved',
  'emergency.access_denied': 'Emergency access was denied',
};

// Default alert rules
export const defaultAlertRules: AlertRule[] = [
  {
    id: 'critical-transaction',
    name: 'Critical Transaction Alert',
    description: 'Alert on large or suspicious transactions',
    eventTypes: ['transaction.pending_approval'],
    conditions: [
      {
        field: 'amount',
        operator: 'greater_than',
        value: 10, // 10 ETH threshold
      },
    ],
    actions: [
      {
        type: 'email',
        target: 'user@example.com',
      },
      {
        type: 'in_app',
        target: 'notifications',
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'security-alert',
    name: 'Security Event Alert',
    description: 'Alert on any security-related events',
    eventTypes: ['security.unusual_activity', 'security.login_new_device'],
    conditions: [],
    actions: [
      {
        type: 'email',
        target: 'user@example.com',
      },
      {
        type: 'sms',
        target: '+1234567890',
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'guardian-changes',
    name: 'Guardian Changes Alert',
    description: 'Alert when guardians are added or removed',
    eventTypes: ['guardian.added', 'guardian.removed'],
    conditions: [],
    actions: [
      {
        type: 'email',
        target: 'user@example.com',
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'emergency-alerts',
    name: 'Emergency Access Alert',
    description: 'Alert on emergency access requests',
    eventTypes: ['emergency.access_requested', 'emergency.access_approved'],
    conditions: [],
    actions: [
      {
        type: 'email',
        target: 'user@example.com',
      },
      {
        type: 'sms',
        target: '+1234567890',
      },
      {
        type: 'in_app',
        target: 'notifications',
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Webhook helper functions
export function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = 'whsec_';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export function createSignature(payload: string, secret: string): string {
  // In production, use crypto.subtle or node:crypto
  // This is a placeholder
  return Buffer.from(`${payload}.${secret}`).toString('base64');
}

export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createSignature(payload, secret);
  return signature === expectedSignature;
}

// Alert filtering and searching
export function filterAlerts(
  alerts: Alert[],
  filters: {
    severity?: AlertSeverity;
    type?: EventType;
    read?: boolean;
    actionRequired?: boolean;
  },
): Alert[] {
  return alerts.filter((alert) => {
    if (filters.severity && alert.severity !== filters.severity) return false;
    if (filters.type && alert.type !== filters.type) return false;
    if (filters.read !== undefined && alert.read !== filters.read) return false;
    if (filters.actionRequired !== undefined && alert.actionRequired !== filters.actionRequired)
      return false;
    return true;
  });
}

export function searchAlerts(alerts: Alert[], query: string): Alert[] {
  const lowerQuery = query.toLowerCase();
  return alerts.filter(
    (alert) =>
      alert.title.toLowerCase().includes(lowerQuery) ||
      alert.message.toLowerCase().includes(lowerQuery) ||
      alert.type.toLowerCase().includes(lowerQuery),
  );
}

// Statistics
export function getAlertStats(alerts: Alert[]) {
  return {
    total: alerts.length,
    unread: alerts.filter((a) => !a.read).length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    actionRequired: alerts.filter((a) => a.actionRequired).length,
    byType: alerts.reduce(
      (acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      },
      {} as Record<EventType, number>,
    ),
    bySeverity: alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      },
      {} as Record<AlertSeverity, number>,
    ),
  };
}
