import React from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { formatAddress } from '../lib/format'

export default function StatusBar() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  return (
    <div style={{
      marginTop: 16,
      padding: 8,
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      background: '#f9fafb',
    }}>
      {isConnected ? (
        <div>
          <strong>Status:</strong> Connected to {chain?.name} as {formatAddress(address)}
        </div>
      ) : (
        <div>
          <strong>Status:</strong> Not connected
        </div>
      )}
    </div>
  )
}
