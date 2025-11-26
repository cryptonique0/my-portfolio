import React, { useState } from 'react'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
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

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>WCT DApp (WalletConnect)</h1>

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
            <p>No wallet connected. Click Connect to open WalletConnect modal.</p>
            <button
              onClick={() => {
                // Opening the modal is handled by the Web3Modal UI automatically when connectors are used.
                // Using Wagmi/Connect UI or a custom button that calls connect would be alternative.
                // We can simulate by triggering window.dispatchEvent for the web3modal open event, but
                // the Web3Modal UI is automatically available via the Web3Modal component in main.jsx.
                alert('Open the browser WalletConnect modal via the Connect UI in the top-right provided by Web3Modal.')
              }}
            >
              Connect (open modal)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
