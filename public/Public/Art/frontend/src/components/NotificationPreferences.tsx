/**
 * NotificationPreferences Component
 * Manage notification settings and preferences
 */

import React, { useState } from 'react';
import { useNotificationPreferences } from '../hooks/useNotificationCenter';

export const NotificationPreferences: React.FC = () => {
  const {
    preferences,
    loading,
    error,
    updateChannel,
    updateFrequency,
    unsubscribeAll,
    resubscribe,
  } = useNotificationPreferences();

  const [saved, setSaved] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Failed to load preferences</p>
          {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const notificationTypes = [
    { key: 'sale', label: 'Sales', description: 'When your NFT is sold' },
    { key: 'offer', label: 'Offers', description: 'When you receive an offer' },
    { key: 'follow', label: 'Follows', description: 'When someone follows you' },
    { key: 'auction_bid', label: 'Auction Bids', description: 'When there\'s a new bid' },
    { key: 'message', label: 'Messages', description: 'Direct messages' },
  ];

  const channels = [
    { key: 'email', label: 'Email', icon: '📧' },
    { key: 'push', label: 'Push Notifications', icon: '📲' },
    { key: 'in_app', label: 'In-App', icon: '🔔' },
  ];

  const handleChannelChange = async (channel: string, type: string, checked: boolean) => {
    await updateChannel(channel as any, type, checked);
    setUnsaved(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFrequencyChange = async (frequency: any) => {
    await updateFrequency(frequency);
    setUnsaved(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUnsubscribe = async () => {
    if (confirm('Are you sure you want to unsubscribe from all notifications? You can resubscribe anytime.')) {
      await unsubscribeAll();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleResubscribe = async () => {
    await resubscribe();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-3">⚙️ Notification Preferences</h1>
          <p className="text-blue-100">
            Customize how and when you receive notifications
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            ✓ Preferences saved successfully
          </div>
        )}

        {/* Unsubscribe Status */}
        {preferences.unsubscribe_all && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  You're unsubscribed from all notifications
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  You won't receive any notifications until you resubscribe
                </p>
              </div>
              <button
                onClick={handleResubscribe}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex-shrink-0"
              >
                Resubscribe
              </button>
            </div>
          </div>
        )}

        {/* Notification Types Grid */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📋 Notification Types
          </h2>

          <div className="space-y-6">
            {notificationTypes.map(type => (
              <div
                key={type.key}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {type.description}
                  </p>
                </div>

                {/* Channel Toggles */}
                <div className="space-y-3">
                  {channels.map(channel => (
                    <label
                      key={`${type.key}-${channel.key}`}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          preferences[
                            `${channel.key}_on_${type.key}` as keyof typeof preferences
                          ] as boolean
                        }
                        onChange={e =>
                          handleChannelChange(channel.key, type.key, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        <span className="mr-2">{channel.icon}</span>
                        {channel.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notification Frequency */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ⏰ Notification Frequency
          </h2>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              How often would you like to receive notifications?
            </p>

            <div className="space-y-3">
              {[
                {
                  value: 'instant',
                  label: 'Instant',
                  description: 'Get notified immediately',
                },
                {
                  value: 'daily',
                  label: 'Daily Digest',
                  description: 'Receive a daily summary',
                },
                {
                  value: 'weekly',
                  label: 'Weekly Digest',
                  description: 'Receive a weekly summary',
                },
                {
                  value: 'never',
                  label: 'Never',
                  description: 'Turn off all notifications',
                },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={preferences.notify_frequency === option.value}
                    onChange={e => handleFrequencyChange(e.target.value)}
                    className="w-4 h-4 mt-1 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ⚠️ Danger Zone
          </h2>

          <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Unsubscribe from All Notifications
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mb-4">
              You will stop receiving all notifications. You can resubscribe at any time.
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={preferences.unsubscribe_all}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Unsubscribe from All
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Your Notification Summary
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p>
              • <strong>Status:</strong> {preferences.unsubscribe_all ? 'Unsubscribed' : 'Subscribed'}
            </p>
            <p>
              • <strong>Frequency:</strong>{' '}
              {preferences.notify_frequency.charAt(0).toUpperCase() +
                preferences.notify_frequency.slice(1)}
            </p>
            <p>
              • <strong>Last updated:</strong>{' '}
              {new Date(preferences.updated_at).toLocaleDateString()}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
