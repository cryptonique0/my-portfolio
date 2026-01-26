'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Trash2, Copy, Check, Eye } from 'lucide-react';

interface WithdrawalMessage {
  id: string;
  name: string;
  withdrawalType: 'standard' | 'emergency' | 'scheduled' | 'batch' | 'recurring' | 'conditional' | 'bulk-approval' | 'multi-recipient';
  message: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  frequency?: string;
  conditions?: string;
  approvalThreshold?: number;
  recipients?: number;
}

const WITHDRAWAL_TYPES = [
  { id: 'standard', label: 'Standard Withdrawal', icon: '💳' },
  { id: 'emergency', label: 'Emergency Withdrawal', icon: '🚨' },
  { id: 'scheduled', label: 'Scheduled Withdrawal', icon: '⏰' },
  { id: 'batch', label: 'Batch Withdrawal', icon: '📦' },
  { id: 'recurring', label: 'Recurring Withdrawal', icon: '🔄' },
  { id: 'conditional', label: 'Conditional Withdrawal', icon: '❓' },
  { id: 'bulk-approval', label: 'Bulk Approval Template', icon: '✅' },
  { id: 'multi-recipient', label: 'Multi-Recipient Withdrawal', icon: '👥' }
];

const AVAILABLE_VARIABLES = [
  { name: 'amount', label: 'Withdrawal Amount', example: '$1,250.00' },
  { name: 'date', label: 'Withdrawal Date', example: 'January 17, 2026' },
  { name: 'time', label: 'Withdrawal Time', example: '2:30 PM' },
  { name: 'recipient', label: 'Recipient Address', example: '0x742d...3E8Db' },
  { name: 'guardianName', label: 'Guardian Name', example: 'Sarah Johnson' },
  { name: 'vaultName', label: 'Vault Name', example: 'Emergency Fund' },
  { name: 'count', label: 'Withdrawal Count', example: '5 of 10' },
  { name: 'frequency', label: 'Recurrence Frequency', example: 'Monthly' },
  { name: 'condition', label: 'Trigger Condition', example: 'Balance > $10,000' },
  { name: 'totalAmount', label: 'Total Bulk Amount', example: '$50,000.00' },
  { name: 'recipientCount', label: 'Number of Recipients', example: '5 accounts' },
  { name: 'nextOccurrence', label: 'Next Occurrence Date', example: 'February 17, 2026' }
];

const SAMPLE_MESSAGES: WithdrawalMessage[] = [
  {
    id: '1',
    name: 'Standard Notification',
    withdrawalType: 'standard',
    message: 'You are withdrawing {{amount}} from {{vaultName}}. This transaction was initiated on {{date}} at {{time}}.',
    variables: ['amount', 'vaultName', 'date', 'time'],
    isActive: true,
    createdAt: '2026-01-10'
  },
  {
    id: '2',
    name: 'Emergency Alert',
    withdrawalType: 'emergency',
    message: 'EMERGENCY WITHDRAWAL: {{amount}} is being withdrawn. Guardian {{guardianName}} has approved this emergency transaction. Initiated at {{time}} on {{date}}.',
    variables: ['amount', 'guardianName', 'time', 'date'],
    isActive: true,
    createdAt: '2026-01-12'
  },
  {
    id: '3',
    name: 'Scheduled Reminder',
    withdrawalType: 'scheduled',
    message: 'Your scheduled withdrawal of {{amount}} is confirmed for {{date}}. Recipient: {{recipient}}. Reference: {{count}}.',
    variables: ['amount', 'date', 'recipient', 'count'],
    isActive: false,
    createdAt: '2026-01-08'
  },
  {
    id: '4',
    name: 'Monthly Recurring Payment',
    withdrawalType: 'recurring',
    message: 'Recurring withdrawal of {{amount}} scheduled {{frequency}} from {{vaultName}}. Next occurrence: {{nextOccurrence}}. Recipient: {{recipient}}.',
    variables: ['amount', 'frequency', 'vaultName', 'nextOccurrence', 'recipient'],
    isActive: true,
    createdAt: '2026-01-14',
    frequency: 'Monthly'
  },
  {
    id: '5',
    name: 'Balance Threshold Alert',
    withdrawalType: 'conditional',
    message: 'Condition triggered: {{condition}}. Automatic withdrawal of {{amount}} initiated from {{vaultName}} at {{time}}. This withdrawal was conditional on the specified trigger.',
    variables: ['condition', 'amount', 'vaultName', 'time'],
    isActive: true,
    createdAt: '2026-01-13',
    conditions: 'Balance exceeds $50,000'
  },
  {
    id: '6',
    name: 'Bulk Approval Batch',
    withdrawalType: 'bulk-approval',
    message: 'Bulk approval required: {{totalAmount}} across {{recipientCount}} recipients. Total transactions in batch: {{count}}. All withdrawals require {{guardianName}} approval.',
    variables: ['totalAmount', 'recipientCount', 'count', 'guardianName'],
    isActive: true,
    createdAt: '2026-01-15',
    approvalThreshold: 2
  },
  {
    id: '7',
    name: 'Multi-Recipient Distribution',
    withdrawalType: 'multi-recipient',
    message: 'Distributing {{totalAmount}} across {{recipientCount}} recipients. First recipient: {{recipient}}. Distribution initiated by {{guardianName}} on {{date}}.',
    variables: ['totalAmount', 'recipientCount', 'recipient', 'guardianName', 'date'],
    isActive: true,
    createdAt: '2026-01-16',
    recipients: 5
  }
];

export function CustomWithdrawalMessages() {
  const [messages, setMessages] = useState<WithdrawalMessage[]>(SAMPLE_MESSAGES);
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WithdrawalMessage | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    withdrawalType: 'standard',
    message: '',
    variables: [] as string[],
    frequency: '',
    conditions: '',
    approvalThreshold: 1,
    recipients: 1
  });

  const getWithdrawalTypeLabel = (typeId: string) => {
    return WITHDRAWAL_TYPES.find(t => t.id === typeId)?.label || typeId;
  };

  const getWithdrawalTypeIcon = (typeId: string) => {
    return WITHDRAWAL_TYPES.find(t => t.id === typeId)?.icon || '📝';
  };

  const handleAddMessage = () => {
    if (formData.name && formData.message) {
      const generateId = () => String(Math.random()).slice(2, 11);
      const newMessage: WithdrawalMessage = {
        id: generateId(),
        name: formData.name,
        withdrawalType: formData.withdrawalType as 'standard' | 'emergency' | 'scheduled' | 'batch' | 'recurring' | 'conditional' | 'bulk-approval' | 'multi-recipient',
        message: formData.message,
        variables: extractVariables(formData.message),
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        frequency: formData.frequency || undefined,
        conditions: formData.conditions || undefined,
        approvalThreshold: formData.approvalThreshold > 1 ? formData.approvalThreshold : undefined,
        recipients: formData.recipients > 1 ? formData.recipients : undefined
      };
      setMessages([newMessage, ...messages]);
      setFormData({ name: '', withdrawalType: 'standard', message: '', variables: [], frequency: '', conditions: '', approvalThreshold: 1, recipients: 1 });
      setShowForm(false);
    }
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const found = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      found.add(match[1]);
    }
    return Array.from(found);
  };

  const generatePreview = (msg: WithdrawalMessage) => {
    let preview = msg.message;
    const examples: Record<string, string> = {
      amount: '$2,500.00',
      date: 'January 17, 2026',
      time: '3:45 PM',
      recipient: '0x742d35Cc6634C0532925a3b844Bc8e7595f3E8Db',
      guardianName: 'Michael Chen',
      vaultName: 'Savings Vault',
      count: '3 of 5',
      frequency: 'Monthly',
      condition: 'Balance exceeds $50,000',
      totalAmount: '$50,000.00',
      recipientCount: '5 accounts',
      nextOccurrence: 'February 17, 2026'
    };
    
    Object.entries(examples).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return preview;
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
      setPreview('');
    }
  };

  const handleToggleActive = (id: string) => {
    setMessages(messages.map(m =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const handleCopyMessage = (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      navigator.clipboard.writeText(msg.message);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Custom Withdrawal Messages
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Create personalized messages for different types of vault withdrawals. Use template variables to customize content.
        </p>
      </div>

      {/* Available Variables Info */}
      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">Available Template Variables:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AVAILABLE_VARIABLES.map(v => (
              <div key={v.name} className="text-xs text-blue-800 dark:text-blue-200">
                <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">{`{{${v.name}}}`}</code>
                <span className="ml-2">{v.label}</span>
                <span className="text-blue-600 dark:text-blue-400 ml-1">({v.example})</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-blue-200 dark:border-blue-500/20 pt-3 mt-3">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">Withdrawal Type Descriptions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
            <div><strong>Recurring:</strong> Automatic withdrawals at set intervals (weekly, monthly, etc.)</div>
            <div><strong>Conditional:</strong> Triggered by specific conditions (balance threshold, price action, etc.)</div>
            <div><strong>Bulk Approval:</strong> Multiple transactions requiring guardian consensus</div>
            <div><strong>Multi-Recipient:</strong> Distributes funds across multiple recipient addresses</div>
          </div>
        </div>
      </div>

      {/* Add New Message Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Message
        </button>
      )}

      {/* Add Message Form */}
      {showForm && (
        <div className="bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Message Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Emergency Withdrawal Alert"
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Withdrawal Type
            </label>
            <select
              value={formData.withdrawalType}
              onChange={(e) => setFormData({ ...formData, withdrawalType: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {WITHDRAWAL_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Message Template
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Type your message here. Use {{variable}} syntax for dynamic content. Example: {{amount}} from {{vaultName}}"
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-sm"
            />
          </div>

          {/* Type-specific fields */}
          {formData.withdrawalType === 'recurring' && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Recurrence Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Select frequency</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          )}

          {formData.withdrawalType === 'conditional' && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Trigger Condition
              </label>
              <input
                type="text"
                value={formData.conditions}
                onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                placeholder="e.g., Balance exceeds $50,000 or Market cap rises above $1B"
                className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          )}

          {formData.withdrawalType === 'bulk-approval' && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Approval Threshold (Guardians Required)
              </label>
              <select
                value={formData.approvalThreshold}
                onChange={(e) => setFormData({ ...formData, approvalThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="1">1 of 3 Guardians</option>
                <option value="2">2 of 3 Guardians</option>
                <option value="3">3 of 3 Guardians (All Required)</option>
              </select>
            </div>
          )}

          {formData.withdrawalType === 'multi-recipient' && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Number of Recipients
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: Number(e.target.value) })}
                placeholder="How many recipients will receive funds?"
                className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddMessage}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
            >
              Save Message
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`bg-white dark:bg-surface-dark border rounded-lg p-4 transition-all cursor-pointer ${
              selectedMessage?.id === msg.id
                ? 'border-primary dark:border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-surface-border dark:border-gray-700 hover:border-primary/50'
            }`}
            onClick={() => {
              setSelectedMessage(msg);
              setPreview(generatePreview(msg));
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getWithdrawalTypeIcon(msg.withdrawalType)}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{msg.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {getWithdrawalTypeLabel(msg.withdrawalType)} • Created {msg.createdAt}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-mono line-clamp-2 bg-slate-50 dark:bg-slate-900/20 p-2 rounded">
                  {msg.message}
                </p>
                {msg.variables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.variables.map(v => (
                      <span key={v} className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-2 py-1 rounded">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
                {/* Type-specific attributes */}
                {(msg.frequency || msg.conditions || msg.approvalThreshold || msg.recipients) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.frequency && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                        {msg.frequency}
                      </span>
                    )}
                    {msg.conditions && (
                      <span className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded">
                        Condition: {msg.conditions.substring(0, 30)}...
                      </span>
                    )}
                    {msg.approvalThreshold && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        {msg.approvalThreshold} Guardian{msg.approvalThreshold > 1 ? 's' : ''} Required
                      </span>
                    )}
                    {msg.recipients && (
                      <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-1 rounded">
                        {msg.recipients} Recipients
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyMessage(msg.id);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(msg.id);
                  }}
                  className={`p-2 rounded transition-colors ${
                    msg.isActive
                      ? 'bg-success/10 text-success hover:bg-success/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={msg.isActive ? 'Active' : 'Inactive'}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMessage(msg.id);
                  }}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {selectedMessage && preview && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-surface-border dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Preview</h3>
          <div className="bg-white dark:bg-surface-dark rounded-lg p-4 border border-surface-border dark:border-gray-700">
            <p className="text-slate-900 dark:text-white text-sm leading-relaxed">{preview}</p>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
            This is how the message will appear during a {getWithdrawalTypeLabel(selectedMessage.withdrawalType).toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
}
