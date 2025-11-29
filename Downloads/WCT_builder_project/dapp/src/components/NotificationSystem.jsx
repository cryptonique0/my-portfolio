import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useToast } from './Toast'

export default function NotificationSystem() {
  const { address } = useAccount()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Request permission for browser notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Placeholder for event listeners (e.g., transaction confirmations)
    const handleTransaction = (event) => {
      const msg = `Transaction confirmed: ${event.hash}`
      useToast().success(msg)
      if (Notification.permission === 'granted') {
        new Notification('WCT DApp', { body: msg })
      }
      setNotifications((prev) => [...prev, { id: Date.now(), message: msg, type: 'success' }])
    }

    // Simulate event (replace with actual event listeners)
    window.addEventListener('transactionConfirmed', handleTransaction)

    return () => window.removeEventListener('transactionConfirmed', handleTransaction)
  }, [])

  const clearNotifications = () => setNotifications([])

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3>Real-Time Notifications</h3>
      <button onClick={clearNotifications} style={{ padding: '4px 8px', borderRadius: 4 }}>
        Clear All
      </button>
      <div style={{ marginTop: 8 }}>
        {notifications.map((notif) => (
          <div key={notif.id} style={{ padding: 8, marginBottom: 4, borderRadius: 4, background: notif.type === 'success' ? '#d1fae5' : '#fee2e2' }}>
            {notif.message}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Note: Integrates with browser notifications and in-app toasts. Add event listeners for real transactions.
      </p>
    </div>
  )
}