/**
 * Auth Hooks
 * - useMetaMaskAuth
 * - useCurrentUser
 */

import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';

export function useMetaMaskAuth() {
  const [address, setAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      const result = await authService.signInWithMetaMask();
      setAddress(result?.address || null);
      setUserId(result?.userId || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect MetaMask');
    } finally {
      setLoading(false);
    }
  }, []);

  return { address, userId, connect, loading, error };
}

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/me', {
          headers: authService.getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  return { user, loading };
}
