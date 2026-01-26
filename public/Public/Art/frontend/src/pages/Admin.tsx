import React, { useState } from 'react';
import PlatformAnalytics from '../components/admin/PlatformAnalytics';
import UserManagement from '../components/admin/UserManagement';
import ModerateNFT from '../components/admin/ModerateNFT';
import TransactionMonitor from '../components/admin/TransactionMonitor';
import SystemSettings from '../components/admin/SystemSettings';
import VerificationManagement from '../components/admin/VerificationManagement';

interface TabConfig {
  id: string;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'verification', label: 'Verification', icon: '✅' },
  { id: 'moderation', label: 'Moderation', icon: '🖼️' },
  { id: 'transactions', label: 'Transactions', icon: '💰' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleUserAction = (userId: string, action: string) => {
    setNotification({
      message: `User ${userId.slice(0, 8)} ${action}ned successfully`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleModerate = (nftId: string) => {
    setNotification({
      message: `NFT ${nftId.slice(0, 8)} moderation resolved`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Platform management & moderation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analytics' && <PlatformAnalytics />}
        {activeTab === 'users' && <UserManagement onUserAction={handleUserAction} />}
        {activeTab === 'verification' && <VerificationManagement />}
        {activeTab === 'moderation' && <ModerateNFT onModerate={handleModerate} />}
        {activeTab === 'transactions' && <TransactionMonitor />}
        {activeTab === 'settings' && <SystemSettings />}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-gray-500 text-center">
            All admin actions are logged and auditable. Use with care.
          </p>
        </div>
      </div>
    </div>
  );
}
