import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useToast } from './Toast'

export default function TransactionSimulator({ txData }) {
  const { address } = useAccount()
  const toast = useToast()
  const [simulationResult, setSimulationResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const simulate = async () => {
    if (!txData) return
    setLoading(true)
    try {
      // Placeholder for Tenderly API call
      const response = await fetch('https://api.tenderly.co/api/v1/account/project/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': process.env.VITE_TENDERLY_ACCESS_KEY, // Add to env
        },
        body: JSON.stringify({
          network_id: '1', // Example: Ethereum mainnet
          from: address,
          to: txData.to,
          input: txData.data,
          value: txData.value || '0x0',
          save: false,
        }),
      })
      const result = await response.json()
      setSimulationResult(result)
      toast.success('Simulation complete')
    } catch (error) {
      toast.error('Simulation failed: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3>Transaction Simulator</h3>
      <button onClick={simulate} disabled={loading || !txData} style={{ padding: '8px 16px', borderRadius: 4 }}>
        {loading ? 'Simulating...' : 'Simulate Transaction'}
      </button>
      {simulationResult && (
        <pre style={{ marginTop: 8, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify(simulationResult, null, 2)}
        </pre>
      )}
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Note: Requires Tenderly API key. Add VITE_TENDERLY_ACCESS_KEY to .env.
      </p>
    </div>
  )
}