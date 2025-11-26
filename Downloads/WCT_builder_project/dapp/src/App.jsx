import React, { useState } from 'react'
import './App.css'
import { useAccount, useDisconnect, useSignMessage, useConnect } from 'wagmi'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const [sig, setSig] = useState(null)

  async function onSign() {
    try {
      const message = 'Sign this message to prove you own the wallet.'
      const signature = await signMessageAsync({ message })
      setSig(signature)
    } catch (err) {
      console.error(err)
      setSig(null)
    }
  }

  const wcConnector = connectors.find((c) => c instanceof WalletConnectConnector)

  const connectorsReady = connectors && connectors.length > 0

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>WCT DApp (WalletConnect on Celo Alfajores)</h1>

      <div style={{ marginTop: 12 }}>
        {isConnected ? (
          <div>
            <div>Connected address: {address}</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => disconnect()}>Disconnect</button>
              <button onClick={onSign} style={{ marginLeft: 8 }}>
                Sign message
              </button>
            </div>
            {sig && (
              <pre style={{ marginTop: 12, maxWidth: 800, whiteSpace: 'break-spaces' }}>{sig}</pre>
            )}
          </div>
        ) : (
          <div>
            <p>No wallet connected.</p>
            <div>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={!connector.ready || isLoading}
                  style={{ marginRight: 8 }}
                >
                  {connector.name}
                  {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
                </button>
              ))}
            </div>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error.message}</div>}
            <div style={{ marginTop: 8 }}>
              <small>Tip: Use a WalletConnect-compatible wallet and choose the WalletConnect option.</small>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
