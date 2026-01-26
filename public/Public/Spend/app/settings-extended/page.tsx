'use client';

/**
 * Extended Settings Page with Integrations Tab
 * Include in app/settings/page.tsx or create separate route
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileJson,
  FileText,
  Lock,
  LogOut,
  Moon,
  Plus,
  Settings,
  Shield,
  Sun,
  Trash2,
  Zap,
} from 'lucide-react';
import NotificationIntegrations from '@/components/vault-setup/notification-integrations';
import TransactionExport from '@/components/vault-setup/transaction-export';

type SettingsTab =
  | 'general'
  | 'security'
  | 'notifications'
  | 'integrations'
  | 'export'
  | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your vault preferences and integrations</p>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-2">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'integrations', label: 'Integrations', icon: Zap },
              { id: 'export', label: 'Transaction Export', icon: Download },
              { id: 'data', label: 'Data & Privacy', icon: Lock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">General Settings</h2>

                <div className="space-y-4">
                  {/* Theme Toggle */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Dark Mode</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Enable dark theme for all interfaces
                        </p>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative w-14 h-8 rounded-full transition ${
                          darkMode ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                            darkMode ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        >
                          {darkMode ? (
                            <Moon className="w-4 h-4 m-1" />
                          ) : (
                            <Sun className="w-4 h-4 m-1" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <label className="block font-medium mb-2">Language</label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Chinese</option>
                    </select>
                  </div>

                  {/* Currency */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <label className="block font-medium mb-2">
                      Currency Conversion
                    </label>
                    <div className="flex gap-2">
                      <select className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>JPY</option>
                      </select>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Enable conversions</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Security Settings</h2>

                <div className="space-y-4">
                  {/* Two-Factor Authentication */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Require 2FA for sensitive operations
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        Enabled
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm">
                      Disable 2FA
                    </button>
                  </div>

                  {/* Password */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Password</h3>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                      Change Password
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Last changed: 45 days ago
                    </p>
                  </div>

                  {/* Session Management */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Active Sessions</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">Chrome on Linux</p>
                          <p className="text-xs text-gray-400">
                            192.168.1.1 • Current session
                          </p>
                        </div>
                      </div>
                      <button className="text-sm text-red-400 hover:text-red-300">
                        Sign out all other sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { name: 'Critical Alerts', enabled: true, description: 'Security events and critical transactions' },
                  { name: 'Transaction Updates', enabled: true, description: 'Transaction status changes' },
                  { name: 'Guardian Actions', enabled: false, description: 'When guardians perform actions' },
                  { name: 'System Updates', enabled: true, description: 'Vault system notifications' },
                ].map((pref) => (
                  <div
                    key={pref.name}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium">{pref.name}</h3>
                      <p className="text-sm text-gray-400">{pref.description}</p>
                    </div>
                    <label className="relative w-12 h-6 rounded-full cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={pref.enabled}
                        className="opacity-0 w-0 h-0"
                      />
                      <div
                        className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition ${
                          pref.enabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition transform ${
                            pref.enabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Third-Party Integrations */}
          {activeTab === 'integrations' && <NotificationIntegrations />}

          {/* Transaction Export */}
          {activeTab === 'export' && <TransactionExport />}

          {/* Data & Privacy */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Data & Privacy</h2>

                <div className="space-y-4">
                  {/* Data Collection */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Data Collection</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      We collect minimal data necessary for vault operation. You can review and manage what we collect.
                    </p>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm">
                      View Privacy Policy
                    </button>
                  </div>

                  {/* Export Data */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Export Your Data</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Download all your vault data in JSON format
                    </p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      This action is permanent and cannot be undone. All vault data will be deleted.
                    </p>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
