import React, { useState } from 'react';
import axios from 'axios';
import { useNotificationStore } from '../../store';

interface Props {
  nftId: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function OfferModal({ nftId }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('authToken');
  const addNotification = useNotificationStore((s) => s.addNotification);

  const submit = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/offers`, {
        nftId,
        amount: Number(amount),
        expiresAt: expiresAt || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setOpen(false);
      setAmount(''); setExpiresAt('');
      addNotification({ type: 'success', title: 'Offer Submitted', message: 'Your offer was created.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Offer Failed', message: 'Could not submit offer.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="w-full mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Make an Offer</button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Make an Offer</h3>
            <div className="space-y-3">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (STX)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} placeholder="Expires at (YYYY-MM-DDTHH:MM) optional" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={submit} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">Submit</button>
              <button onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
