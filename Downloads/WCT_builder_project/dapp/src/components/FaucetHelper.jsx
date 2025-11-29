import React, { useState } from 'react'
import { useNetwork, useAccount } from 'wagmi'

const FAUCETS = {
  1: [
    { name: 'Alchemy Faucet', url: 'https://www.alchemy.com/faucets/ethereum-sepolia', network: 'Sepolia' },
    { name: 'Infura Faucet', url: 'https://www.infura.io/faucet/sepolia', network: 'Sepolia' }
  ],
  11155111: [
    { name: 'Sepolia PoW Faucet', url: 'https://sepolia-faucet.pk910.de/', network: 'Sepolia' },
    { name: 'QuickNode Faucet', url: 'https://faucet.quicknode.com/ethereum/sepolia', network: 'Sepolia' }
  ],
  137: [
    { name: 'Polygon Faucet', url: 'https://faucet.polygon.technology/', network: 'Polygon' },
    { name: 'Alchemy Polygon', url: 'https://mumbaifaucet.com/', network: 'Mumbai' }
  ],
  42161: [
    { name: 'Arbitrum Faucet', url: 'https://faucet.triangleplatform.com/arbitrum/sepolia', network: 'Arbitrum Sepolia' }
  ],
  10: [
    { name: 'Optimism Faucet', url: 'https://app.optimism.io/faucet', network: 'Optimism' }
  ]
}

export default function FaucetHelper() {
  const { chain } = useNetwork()
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const currentFaucets = chain ? FAUCETS[chain.id] || [] : []

  return (
    <div style={{
      padding: 24,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 12,
      color: '#fff',
      marginTop: 24
    }}>
      <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
        💧 Need Test Tokens?
      </h2>
      <p style={{ margin: 0, marginBottom: 16, opacity: 0.9 }}>
        Get free testnet tokens from these faucets
      </p>

      {isConnected && (
        <div style={{
          padding: 12,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Your Address</div>
            <div style={{ fontSize: 14, fontFamily: 'monospace' }}>
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </div>
          </div>
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 16px',
              background: copied ? '#10b981' : '#fff',
              color: copied ? '#fff' : '#667eea',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      )}

      {currentFaucets.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentFaucets.map((faucet, idx) => (
            <a
              key={idx}
              href={faucet.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: 16,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.2s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{faucet.name}</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>{faucet.network}</div>
              </div>
              <div style={{ fontSize: 20 }}>→</div>
            </a>
          ))}
        </div>
      ) : (
        <div style={{
          padding: 20,
          textAlign: 'center',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 8
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔌</div>
          <div>Connect your wallet to see available faucets</div>
        </div>
      )}

      <div style={{
        marginTop: 16,
        padding: 12,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        fontSize: 13,
        opacity: 0.9
      }}>
        💡 <strong>Tip:</strong> Most faucets require you to paste your address. Use the copy button above!
      </div>
    </div>
  )
}
