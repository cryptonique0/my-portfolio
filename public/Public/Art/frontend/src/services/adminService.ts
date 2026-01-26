import { config } from '../config/env';

const API_BASE = config.apiUrl;

export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  getStats: async () => {
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('appToken')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  /**
   * Get all users
   */
  getAllUsers: async (limit = 50, offset = 0) => {
    const response = await fetch(`${API_BASE}/admin/users?limit=${limit}&offset=${offset}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('appToken')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  /**
   * Get user status (bans/suspensions)
   */
  getUserStatus: async (userId: string) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('appToken')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user status');
    return response.json();
  },

  /**
   * Ban a user
   */
  banUser: async (userId: string, reason: string) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('appToken')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to ban user');
    return response.json();
  },

  /**
   * Suspend a user
   */
  suspendUser: async (userId: string, reason: string, durationDays: number) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('appToken')}`
      },
      body: JSON.stringify({ reason, durationDays })
    });
    if (!response.ok) throw new Error('Failed to suspend user');
    return response.json();
  },

  /**
   * Unban a user
   */
  unbanUser: async (userId: string) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/unban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('appToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to unban user');
    return response.json();
  },

  /**
   * Get pending moderation cases
   */
  getModerationCases: async (limit = 50) => {
    const response = await fetch(`${API_BASE}/admin/moderation?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('appToken')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch moderation cases');
    return response.json();
  },

  /**
   * Moderate an NFT
   */
  moderateNFT: async (nftId: string, reason: string, description: string, actionTaken = 'none') => {
    const response = await fetch(`${API_BASE}/admin/moderation/${nftId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('appToken')}`
      },
      body: JSON.stringify({ reason, description, actionTaken })
    });
    if (!response.ok) throw new Error('Failed to moderate NFT');
    return response.json();
  },

  /**
   * Resolve a moderation case
   */
  resolveModerationCase: async (caseId: string, status: 'approved' | 'rejected', actionTaken?: string) => {
    const response = await fetch(`${API_BASE}/admin/moderation/${caseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('appToken')}`
      },
      body: JSON.stringify({ status, actionTaken })
    });
    if (!response.ok) throw new Error('Failed to resolve moderation case');
    return response.json();
  },

  /**
   * Get transaction summary
   */
  getTransactionSummary: async (hours = 24) => {
    const response = await fetch(`${API_BASE}/admin/transactions?hours=${hours}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('appToken')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  /**
   * Get system settings
   */
  getSettings: async () => {
    const response = await fetch(`${API_BASE}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('appToken')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  /**
   * Update a system setting
   */
  updateSetting: async (key: string, value: any) => {
    const response = await fetch(`${API_BASE}/admin/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('appToken')}`
      },
      body: JSON.stringify({ value })
    });
    if (!response.ok) throw new Error('Failed to update setting');
    return response.json();
  },

  /**
   * Get admin action history
   */
  getActionHistory: async (limit = 100) => {
    const response = await fetch(`${API_BASE}/admin/actions?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('appToken')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch action history');
    return response.json();
  }
};
