import React, { useState } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { alfajores, sepolia, polygon, arbitrum } from '../config/chains'

const chains = [alfajores, sepolia, polygon, arbitrum]

export default function SwitchNetwork() {
  const { chain } = useNetwork()
  const { switchNetworkAsync, isLoading, error, pendingChainId } = useSwitchNetwork()
  const [selectedChain, setSelectedChain] = useState(alfajores.id)

  async function onSwitch() {
    try {
      await switchNetworkAsync?.(selectedChain)
    } catch (e) {
      // ignored; error is handled via hook state
    }
  }

  const bridgingHint = chain ? `For cross-chain bridging, consider using bridges like Polygon Bridge or Arbitrum Bridge.` : ''

  return (
    <div style={{ marginTop: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
      <div style={{ marginBottom: 8 }}>Current network: {chain?.name || 'None'}</div>
      <select value={selectedChain} onChange={(e) => setSelectedChain(Number(e.target.value))} style={{ marginRight: 8 }}>
        {chains.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button onClick={onSwitch} disabled={isLoading || pendingChainId === selectedChain}>
        {isLoading ? 'Switching…' : 'Switch Network'}
      </button>
      {error && <div style={{ color: '#b91c1c', marginTop: 8 }}>Error: {error.message}</div>}
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>{bridgingHint}</div>
    </div>
  )
}
