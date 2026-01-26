import React, { useState } from 'react';
import { useAdminUsers, useUserStatus, useAdminActions } from '../../hooks/useAdmin';

interface UserManagementProps {
  onUserAction?: (userId: string, action: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onUserAction }) => {
  const { users, loading, refetch } = useAdminUsers(50, 0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showBanForm, setShowBanForm] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);

  const handleBan = async () => {
    if (!selectedUserId || !banReason) return;
    try {
      await useAdminActions.banUser(selectedUserId, banReason);
      setShowBanForm(false);
      setBanReason('');
      setSelectedUserId(null);
      refetch();
      onUserAction?.(selectedUserId, 'ban');
    } catch (error) {
      console.error('Ban failed:', error);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUserId || !suspendReason) return;
    try {
      await useAdminActions.suspendUser(selectedUserId, suspendReason, suspendDays);
      setShowSuspendForm(false);
      setSuspendReason('');
      setSelectedUserId(null);
      refetch();
      onUserAction?.(selectedUserId, 'suspend');
    } catch (error) {
      console.error('Suspend failed:', error);
    }
  };

  if (loading) return <div className="p-4">Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <button onClick={() => refetch()} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="border p-2 font-mono text-xs">{user.id.slice(0, 8)}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="border p-2">
                  <div className="text-xs space-y-1">
                    {user.banned && <span className="block px-2 py-1 bg-red-100 text-red-800 rounded">🚫 Banned</span>}
                    {user.suspended && <span className="block px-2 py-1 bg-yellow-100 text-yellow-800 rounded">⏸ Suspended</span>}
                    {!user.banned && !user.suspended && <span className="text-gray-500">Active</span>}
                  </div>
                </td>
                <td className="border p-2 text-center">
                  <div className="flex gap-1 justify-center flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setShowBanForm(true);
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Ban
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setShowSuspendForm(true);
                      }}
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                    >
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ban Modal */}
      {showBanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Ban User</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter reason for ban..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBan}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Ban User
                </button>
                <button
                  onClick={() => {
                    setShowBanForm(false);
                    setBanReason('');
                    setSelectedUserId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Suspend User</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter reason for suspension..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSuspend}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Suspend User
                </button>
                <button
                  onClick={() => {
                    setShowSuspendForm(false);
                    setSuspendReason('');
                    setSelectedUserId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
