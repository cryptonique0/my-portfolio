import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

export const useAdminStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { stats, loading, error };
};

export const useAdminUsers = (limit = 50, offset = 0) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers(limit, offset);
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [limit, offset]);

  return { users, loading, error, refetch };
};

export const useUserStatus = (userId: string) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getUserStatus(userId);
        setStatus(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return { status, loading };
};

export const useModerationCases = (limit = 50) => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await adminService.getModerationCases(limit);
      setCases(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [limit]);

  return { cases, loading, error, refetch };
};

export const useTransactionSummary = (hours = 24) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getTransactionSummary(hours);
        setSummary(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [hours]);

  return { summary, loading };
};

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const updateSetting = async (key: string, value: any) => {
    try {
      await adminService.updateSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getSettings();
        setSettings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { settings, loading, updateSetting };
};

export const useAdminActions = {
  banUser: async (userId: string, reason: string) => {
    return adminService.banUser(userId, reason);
  },
  suspendUser: async (userId: string, reason: string, durationDays: number) => {
    return adminService.suspendUser(userId, reason, durationDays);
  },
  unbanUser: async (userId: string) => {
    return adminService.unbanUser(userId);
  },
  moderateNFT: async (nftId: string, reason: string, description: string, actionTaken?: string) => {
    return adminService.moderateNFT(nftId, reason, description, actionTaken);
  },
  resolveModerationCase: async (caseId: string, status: 'approved' | 'rejected', actionTaken?: string) => {
    return adminService.resolveModerationCase(caseId, status, actionTaken);
  }
};
