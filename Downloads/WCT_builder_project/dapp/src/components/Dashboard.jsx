import React, { useState, useEffect } from 'react'
import { useAccount, useBalance, usePublicClient } from 'wagmi'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const publicClient = usePublicClient()
  
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulTx: 0,
    totalGasSpent: '0',
    favoriteToken: 'N/A',
    lastActivity: null
  })

  useEffect(() => {
    if (!address) return

    // Load stats from localStorage
    const txHistory = localStorage.getItem(`txHistory_${address}`)
    if (txHistory) {
      const transactions = JSON.parse(txHistory)
      const successful = transactions.filter(tx => tx.status === 'confirmed').length
      
      setStats({
        totalTransactions: transactions.length,
        successfulTx: successful,
        totalGasSpent: '0.0234', // Placeholder - calculate from tx receipts
        favoriteToken: 'WCTD',
        lastActivity: transactions[0]?.timestamp || null
      })
    }
  }, [address])

  if (!isConnected) {
    return (
      <div style={{
        padding: 32,
        textAlign: 'center',
        border: '2px dashed #e5e7eb',
        borderRadius: 12,
        margin: '24px 0'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔌</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>Connect Your Wallet</h3>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Connect your wallet to view your dashboard
        </p>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Transactions', value: stats.totalTransactions, icon: '📊', color: '#3b82f6' },
    { label: 'Successful', value: stats.successfulTx, icon: '✅', color: '#10b981' },
    { label: 'Gas Spent', value: `${stats.totalGasSpent} ETH`, icon: '⛽', color: '#f59e0b' },
    { label: 'Balance', value: balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '...', icon: '💰', color: '#8b5cf6' }
  ]

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Dashboard</h2>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {statCards.map((stat, i) => (
          <div
            key={i}
            style={{
              padding: 20,
              borderRadius: 12,
              background: '#fff',
              border: `2px solid ${stat.color}20`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
              </div>
              <div style={{ fontSize: 32, opacity: 0.6 }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: 20,
        borderRadius: 12,
        background: '#f9fafb',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <ActionButton icon="🎁" label="Claim Tokens" />
          <ActionButton icon="📤" label="Send" />
          <ActionButton icon="📥" label="Receive" />
          <ActionButton icon="📜" label="History" />
          <ActionButton icon="⚙️" label="Settings" />
        </div>
      </div>

      {/* Last Activity */}
      {stats.lastActivity && (
        <div style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 8,
          background: '#fff',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
            Last Activity
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            {new Date(stats.lastActivity).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

function ActionButton({ icon, label }) {
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        background: '#fff',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#f9fafb'
        e.currentTarget.style.borderColor = '#3b82f6'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = '#fff'
        e.currentTarget.style.borderColor = '#e5e7eb'
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  )
}
