import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  nftId: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PriceAlertForm({ nftId }: Props) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [type, setType] = useState<'below_price' | 'percent_drop'>('below_price');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentDrop, setPercentDrop] = useState('');
  const token = localStorage.getItem('authToken');

  const fetchAlerts = async () => {
    const res = await axios.get(`${API_URL}/api/alerts`, { headers: { Authorization: `Bearer ${token}` } });
    setAlerts(res.data.data || []);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const createAlert = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/alerts`, {
        nftId,
        alertType: type,
        targetPrice: type === 'below_price' ? Number(targetPrice) : undefined,
        percentDrop: type === 'percent_drop' ? Number(percentDrop) : undefined
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAlerts([res.data.data, ...alerts]);
      setTargetPrice(''); setPercentDrop('');
    } catch (err) {
      alert('Failed to create alert');
    }
  };

  const removeAlert = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/alerts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete alert');
    }
  };

  const runCheck = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/alerts/check`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.data?.length) {
        alert(`Alerts triggered: ${res.data.data.length}`);
      } else {
        alert('No alerts triggered');
      }
    } catch (err) {
      alert('Failed to check alerts');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Drop Alerts</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option value="below_price">Below Price</option>
          <option value="percent_drop">Percent Drop</option>
        </select>

        {type === 'below_price' ? (
          <input value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="Target price (STX)" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        ) : (
          <input value={percentDrop} onChange={(e) => setPercentDrop(e.target.value)} placeholder="Percent drop (%)" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        )}

        <button onClick={createAlert} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Create Alert</button>
      </div>

      <div className="flex gap-2">
        <button onClick={runCheck} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Check Alerts Now</button>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Your Alerts</h4>
        {alerts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No alerts yet</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {alerts.map(a => (
              <li key={a.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-900 dark:text-white">
                  {a.alert_type === 'below_price' ? `Below ${a.target_price} STX` : `Drop ≥ ${a.percent_drop}%`} (NFT: {a.nft_id.slice(0,8)}...)
                </span>
                <button onClick={() => removeAlert(a.id)} className="text-red-600 hover:underline">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
