'use client';

import { useState } from 'react';
import { Bell, Mail, Settings } from 'lucide-react';
import { useNotificationsContext } from './NotificationsContext';

export function NotificationPreferences() {
    const { preferences, updatePreferences } = useNotificationsContext();
    const [saved, setSaved] = useState(false);

    const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
        updatePreferences({ [key]: value });
        setSaved(false);
    };

    const handleSave = () => {
        // In a real app, save to database/localStorage
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* In-App Notifications */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Bell size={20} className="text-primary" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        In-App Notifications
                    </h3>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={preferences.withdrawalRequests}
                            onChange={(e) =>
                                handlePreferenceChange('withdrawalRequests', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                Withdrawal Requests
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Get notified when a withdrawal request is submitted
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={preferences.approvals}
                            onChange={(e) => handlePreferenceChange('approvals', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                Approvals & Rejections
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Notify when guardians approve or reject requests
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={preferences.guardianActions}
                            onChange={(e) =>
                                handlePreferenceChange('guardianActions', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                Guardian Actions
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Notify on guardian voting, freeze/unfreeze votes
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={preferences.emergencyAlerts}
                            onChange={(e) =>
                                handlePreferenceChange('emergencyAlerts', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                Emergency Alerts
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Critical alerts for vault freezes and security events
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={preferences.systemUpdates}
                            onChange={(e) =>
                                handlePreferenceChange('systemUpdates', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                System Updates
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Maintenance, feature releases, and general announcements
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Email Notifications */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Mail size={20} className="text-primary" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Email Notifications
                    </h3>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) =>
                            handlePreferenceChange('emailNotifications', e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                    />
                    <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            Send email digests
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Receive important notifications via email in addition to in-app alerts
                        </p>
                    </div>
                </label>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Save Preferences
                </button>
                {saved && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
                        <span className="text-sm text-green-900 dark:text-green-300">✓ Saved successfully</span>
                    </div>
                )}
            </div>
        </div>
    );
}
