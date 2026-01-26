'use client';

/**
 * Notification Integrations Component
 * Manages Slack, Discord, Twilio, and Push notification settings
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Plus,
  Settings,
  Trash2,
  Zap,
} from 'lucide-react';

type IntegrationType = 'slack' | 'discord' | 'twilio' | 'push';

interface IntegrationStatus {
  type: IntegrationType;
  enabled: boolean;
  configured: boolean;
  lastTest?: number;
  error?: string;
}

interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  mentionOnCritical: boolean;
}

interface DiscordConfig {
  webhookUrl: string;
  mentionOnCritical: boolean;
  roleId?: string;
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumbers: string[];
}

interface PushConfig {
  enabled: boolean;
  appName: string;
}

export default function NotificationIntegrations() {
  const [activeTab, setActiveTab] = useState<IntegrationType>('slack');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [statuses, setStatuses] = useState<Record<IntegrationType, IntegrationStatus>>({
    slack: { type: 'slack', enabled: false, configured: false },
    discord: { type: 'discord', enabled: false, configured: false },
    twilio: { type: 'twilio', enabled: false, configured: false },
    push: { type: 'push', enabled: false, configured: false },
  });

  const [configs, setConfigs] = useState<{
    slack: SlackConfig;
    discord: DiscordConfig;
    twilio: TwilioConfig;
    push: PushConfig;
  }>({
    slack: { webhookUrl: '', mentionOnCritical: true },
    discord: { webhookUrl: '', mentionOnCritical: true },
    twilio: { accountSid: '', authToken: '', fromNumber: '', toNumbers: [] },
    push: { enabled: false, appName: 'Vault Guard' },
  });

  const [testing, setTesting] = useState<Record<IntegrationType, boolean>>({
    slack: false,
    discord: false,
    twilio: false,
    push: false,
  });

  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const handleConfigChange = (type: IntegrationType, field: string, value: any) => {
    setConfigs((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleTestIntegration = async (type: IntegrationType) => {
    setTesting((prev) => ({ ...prev, [type]: true }));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatuses((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        lastTest: Date.now(),
        configured: true,
      },
    }));

    setTesting((prev) => ({ ...prev, [type]: false }));
  };

  const handleSaveConfig = (type: IntegrationType) => {
    setStatuses((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        configured: true,
        enabled: true,
      },
    }));
  };

  const handleToggle = (type: IntegrationType) => {
    setStatuses((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: !prev[type].enabled,
      },
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleSecretVisibility = (type: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const addPhoneNumber = () => {
    if (newPhoneNumber.trim()) {
      const currentConfig = configs.twilio;
      if (!currentConfig.toNumbers.includes(newPhoneNumber)) {
        handleConfigChange('twilio', 'toNumbers', [
          ...currentConfig.toNumbers,
          newPhoneNumber,
        ]);
        setNewPhoneNumber('');
      }
    }
  };

  const removePhoneNumber = (phone: string) => {
    const currentConfig = configs.twilio;
    handleConfigChange(
      'twilio',
      'toNumbers',
      currentConfig.toNumbers.filter((p) => p !== phone)
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Integrations</h1>
        <p className="text-gray-400">
          Set up and manage third-party notification services for your vault
        </p>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(['slack', 'discord', 'twilio', 'push'] as IntegrationType[]).map((type) => {
          const status = statuses[type];
          return (
            <div
              key={type}
              onClick={() => setActiveTab(type)}
              className={`p-4 rounded-lg border cursor-pointer transition ${
                status.enabled
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-gray-700 bg-gray-800/50'
              } ${activeTab === type ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{type}</span>
                {status.enabled && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-400">
                {status.configured ? 'Configured' : 'Not configured'}
              </p>
              {status.lastTest && (
                <p className="text-xs text-gray-500 mt-1">
                  Tested {new Date(status.lastTest).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Slack Configuration */}
      {activeTab === 'slack' && (
        <SlackConfig
          config={configs.slack}
          status={statuses.slack}
          testing={testing.slack}
          showSecret={showSecrets['slack']}
          onChange={(field, value) => handleConfigChange('slack', field, value)}
          onSave={() => handleSaveConfig('slack')}
          onTest={() => handleTestIntegration('slack')}
          onToggle={() => handleToggle('slack')}
          onCopy={handleCopy}
          onToggleSecret={() => toggleSecretVisibility('slack')}
        />
      )}

      {/* Discord Configuration */}
      {activeTab === 'discord' && (
        <DiscordConfig
          config={configs.discord}
          status={statuses.discord}
          testing={testing.discord}
          showSecret={showSecrets['discord']}
          onChange={(field, value) => handleConfigChange('discord', field, value)}
          onSave={() => handleSaveConfig('discord')}
          onTest={() => handleTestIntegration('discord')}
          onToggle={() => handleToggle('discord')}
          onCopy={handleCopy}
          onToggleSecret={() => toggleSecretVisibility('discord')}
        />
      )}

      {/* Twilio Configuration */}
      {activeTab === 'twilio' && (
        <TwilioConfig
          config={configs.twilio}
          status={statuses.twilio}
          testing={testing.twilio}
          showSecrets={showSecrets}
          newPhoneNumber={newPhoneNumber}
          onChange={(field, value) => handleConfigChange('twilio', field, value)}
          onSave={() => handleSaveConfig('twilio')}
          onTest={() => handleTestIntegration('twilio')}
          onToggle={() => handleToggle('twilio')}
          onCopy={handleCopy}
          onToggleSecret={(field) => toggleSecretVisibility(`twilio-${field}`)}
          onPhoneNumberChange={setNewPhoneNumber}
          onAddPhone={addPhoneNumber}
          onRemovePhone={removePhoneNumber}
        />
      )}

      {/* Push Configuration */}
      {activeTab === 'push' && (
        <PushConfig
          config={configs.push}
          status={statuses.push}
          testing={testing.push}
          onChange={(field, value) => handleConfigChange('push', field, value)}
          onSave={() => handleSaveConfig('push')}
          onTest={() => handleTestIntegration('push')}
          onToggle={() => handleToggle('push')}
        />
      )}
    </div>
  );
}

// Slack Configuration Component
function SlackConfig({
  config,
  status,
  testing,
  showSecret,
  onChange,
  onSave,
  onTest,
  onToggle,
  onCopy,
  onToggleSecret,
}: any) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Slack Integration
        </h2>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg transition ${
            status.enabled
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}
        >
          {status.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Webhook URL</label>
          <div className="flex gap-2">
            <input
              type={showSecret ? 'text' : 'password'}
              value={config.webhookUrl}
              onChange={(e) => onChange('webhookUrl', e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={onToggleSecret}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              {showSecret ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onCopy(config.webhookUrl)}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Get your webhook URL from Slack App Integrations
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Channel (Optional)</label>
          <input
            type="text"
            value={config.channel || ''}
            onChange={(e) => onChange('channel', e.target.value)}
            placeholder="#notifications"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.mentionOnCritical}
            onChange={(e) => onChange('mentionOnCritical', e.target.checked)}
            className="rounded"
          />
          <span>Mention @channel for critical alerts</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
        >
          Save Configuration
        </button>
        <button
          onClick={onTest}
          disabled={testing || !config.webhookUrl}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Send Test Message'}
        </button>
      </div>
    </div>
  );
}

// Discord Configuration Component
function DiscordConfig({
  config,
  status,
  testing,
  showSecret,
  onChange,
  onSave,
  onTest,
  onToggle,
  onCopy,
  onToggleSecret,
}: any) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" />
          Discord Integration
        </h2>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg transition ${
            status.enabled
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}
        >
          {status.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Webhook URL</label>
          <div className="flex gap-2">
            <input
              type={showSecret ? 'text' : 'password'}
              value={config.webhookUrl}
              onChange={(e) => onChange('webhookUrl', e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={onToggleSecret}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              {showSecret ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onCopy(config.webhookUrl)}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create a webhook from Server Settings → Integrations
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Role ID for Mentions (Optional)</label>
          <input
            type="text"
            value={config.roleId || ''}
            onChange={(e) => onChange('roleId', e.target.value)}
            placeholder="123456789"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: Role ID to mention for critical alerts (use @role ID)
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.mentionOnCritical}
            onChange={(e) => onChange('mentionOnCritical', e.target.checked)}
            className="rounded"
          />
          <span>Mention role for critical alerts</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
        >
          Save Configuration
        </button>
        <button
          onClick={onTest}
          disabled={testing || !config.webhookUrl}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Send Test Message'}
        </button>
      </div>
    </div>
  );
}

// Twilio Configuration Component
function TwilioConfig({
  config,
  status,
  testing,
  showSecrets,
  newPhoneNumber,
  onChange,
  onSave,
  onTest,
  onToggle,
  onCopy,
  onToggleSecret,
  onPhoneNumberChange,
  onAddPhone,
  onRemovePhone,
}: any) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-500" />
          Twilio SMS Integration
        </h2>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg transition ${
            status.enabled
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}
        >
          {status.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Account SID</label>
          <div className="flex gap-2">
            <input
              type={showSecrets['twilio-accountSid'] ? 'text' : 'password'}
              value={config.accountSid}
              onChange={(e) => onChange('accountSid', e.target.value)}
              placeholder="AC..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => onToggleSecret('accountSid')}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              {showSecrets['twilio-accountSid'] ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onCopy(config.accountSid)}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Auth Token</label>
          <div className="flex gap-2">
            <input
              type={showSecrets['twilio-authToken'] ? 'text' : 'password'}
              value={config.authToken}
              onChange={(e) => onChange('authToken', e.target.value)}
              placeholder="Token..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => onToggleSecret('authToken')}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              {showSecrets['twilio-authToken'] ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onCopy(config.authToken)}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">From Phone Number</label>
          <input
            type="tel"
            value={config.fromNumber}
            onChange={(e) => onChange('fromNumber', e.target.value)}
            placeholder="+1234567890"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your Twilio phone number (in E.164 format)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Recipient Phone Numbers ({config.toNumbers.length})
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="tel"
              value={newPhoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddPhone()}
              placeholder="+1234567890 or 1234567890"
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={onAddPhone}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {config.toNumbers.length > 0 && (
            <div className="space-y-2">
              {config.toNumbers.map((phone: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
                >
                  <span className="text-sm">{phone}</span>
                  <button
                    onClick={() => onRemovePhone(phone)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
        >
          Save Configuration
        </button>
        <button
          onClick={onTest}
          disabled={testing || !config.accountSid || !config.authToken || config.toNumbers.length === 0}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Send Test SMS'}
        </button>
      </div>
    </div>
  );
}

// Push Notification Configuration Component
function PushConfig({
  config,
  status,
  testing,
  onChange,
  onSave,
  onTest,
  onToggle,
}: any) {
  const [permissionStatus, setPermissionStatus] = React.useState<NotificationPermission>('default');

  React.useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-500" />
          Push Notifications
        </h2>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg transition ${
            status.enabled
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}
        >
          {status.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {permissionStatus === 'default' && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400 mb-2">Permission Required</p>
              <p className="text-sm text-yellow-300 mb-3">
                Push notifications require your permission to be enabled.
              </p>
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition font-medium text-sm"
              >
                Grant Permission
              </button>
            </div>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className="bg-red-500/10 border border-red-500/50 rounded p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">Permission Denied</p>
              <p className="text-sm text-red-300 mt-1">
                Push notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          </div>
        )}

        {permissionStatus === 'granted' && (
          <div className="bg-green-500/10 border border-green-500/50 rounded p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-400">Permission Granted</p>
              <p className="text-sm text-green-300 mt-1">
                Push notifications are enabled for this browser.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">App Name</label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => onChange('appName', e.target.value)}
            placeholder="Vault Guard"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            App name shown in push notifications
          </p>
        </div>

        <div className="bg-gray-700 rounded p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            What are Push Notifications?
          </h3>
          <p className="text-sm text-gray-300">
            Push notifications are delivered even when you're not actively using the app. They appear in your browser and on your device, allowing you to stay updated on critical vault events in real-time.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
        >
          Save Configuration
        </button>
        <button
          onClick={onTest}
          disabled={testing || permissionStatus !== 'granted'}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50"
        >
          {testing ? 'Sending...' : 'Send Test Notification'}
        </button>
      </div>
    </div>
  );
}
