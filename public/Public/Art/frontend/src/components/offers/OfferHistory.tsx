import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useWallet } from '../../hooks/useWallet';
import { useNotificationStore } from '../../store';

interface Props {
  nftId: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function OfferHistory({ nftId }: Props) {
  const { user } = useWallet();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [counterAmount, setCounterAmount] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'open'|'accepted'|'rejected'|'expired'|'countered'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const token = localStorage.getItem('authToken');
  const addNotification = useNotificationStore((s) => s.addNotification);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/offers/nft/${nftId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(res.data.data || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [nftId]);

  const accept = async (id: string) => {
    try {
      setActionLoading(`accept-${id}`);
      await axios.post(`${API_URL}/api/offers/${id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchOffers();
      addNotification({ type: 'success', title: 'Offer Accepted', message: 'You accepted the offer.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Accept Failed', message: 'Could not accept the offer.' });
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (id: string) => {
    try {
      setActionLoading(`reject-${id}`);
      await axios.post(`${API_URL}/api/offers/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchOffers();
      addNotification({ type: 'success', title: 'Offer Rejected', message: 'You rejected the offer.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Reject Failed', message: 'Could not reject the offer.' });
    } finally {
      setActionLoading(null);
    }
  };

  const counter = async (id: string) => {
    if (!counterAmount) return;
    try {
      setActionLoading(`counter-${id}`);
      await axios.post(`${API_URL}/api/offers/${id}/counter`, { amount: Number(counterAmount) }, { headers: { Authorization: `Bearer ${token}` } });
      setCounterAmount('');
      fetchOffers();
      addNotification({ type: 'success', title: 'Counter Sent', message: 'Your counter-offer was sent.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Counter Failed', message: 'Could not send counter-offer.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOffers = useMemo(() => {
    if (statusFilter === 'all') return offers;
    return offers.filter((o) => o.status === statusFilter);
  }, [offers, statusFilter]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4 mt-12">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Offer History</h3>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-2 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="countered">Countered</option>
          </select>
          <button onClick={fetchOffers} className="px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Refresh</button>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      ) : offers.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No offers yet</p>
      ) : (
        <div className="space-y-2">
          {filteredOffers.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-sm text-gray-900 dark:text-white">
                <span className="font-semibold">{o.amount} {o.currency}</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">from {String(o.buyer_address || '').slice(0,8)}...</span>
                {o.expires_at && (
                  <span className="ml-2 text-gray-600 dark:text-gray-400">expires {new Date(o.expires_at).toLocaleString()}</span>
                )}
                <span className="ml-2">[{o.status}]</span>
                {o.status === 'expired' && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Expired</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {user.address && o.status === 'open' && (
                  <>
                    <button onClick={() => accept(o.id)} disabled={actionLoading === `accept-${o.id}`} className="text-green-600 hover:underline text-sm disabled:opacity-50">{actionLoading === `accept-${o.id}` ? '...' : 'Accept'}</button>
                    <button onClick={() => reject(o.id)} disabled={actionLoading === `reject-${o.id}`} className="text-red-600 hover:underline text-sm disabled:opacity-50">{actionLoading === `reject-${o.id}` ? '...' : 'Reject'}</button>
                    <input value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)} placeholder="Counter" className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded" />
                    <button onClick={() => counter(o.id)} disabled={actionLoading === `counter-${o.id}`} className="text-blue-600 hover:underline text-sm disabled:opacity-50">{actionLoading === `counter-${o.id}` ? '...' : 'Counter'}</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
