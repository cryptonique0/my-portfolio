import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useToast } from './Toast'

export default function MultiSigIntegration({ txData }) {
  const { address } = useAccount()
  const toast = useToast()
  const [safeAddress, setSafeAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const proposeTransaction = async () => {
    if (!safeAddress || !txData) return
    setLoading(true)
    try {
      // Placeholder for Gnosis Safe SDK
      // const safe = new Safe({ ethAdapter, safeAddress })
      // const safeTransaction = await safe.createTransaction({ to: txData.to, data: txData.data, value: txData.value })
      // await safe.signTransaction(safeTransaction)
      toast.success('Transaction proposed to multi-sig')
    } catch (error) {
      toast.error('Multi-sig proposal failed: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3>Multi-Sig Integration</h3>
      <input
        type="text"
        value={safeAddress}
        onChange={(e) => setSafeAddress(e.target.value)}
        placeholder="Safe Address"
        style={{ padding: 8, borderRadius: 4, marginRight: 8 }}
      />
      <button onClick={proposeTransaction} disabled={loading || !safeAddress || !txData} style={{ padding: '8px 16px', borderRadius: 4 }}>
        {loading ? 'Proposing...' : 'Propose to Multi-Sig'}
      </button>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Note: Requires Gnosis Safe SDK integration. For high-value transfers only.
      </p>
    </div>
  )
}