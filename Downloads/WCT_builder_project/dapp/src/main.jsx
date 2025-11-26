import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import {
  WagmiConfig,
  createConfig,
  configureChains,
} from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const chains = [mainnet]

const { publicClient } = configureChains(chains, [w3mProvider({ projectId }), publicProvider()])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

createRoot(document.getElementById('root')).render(
  <WagmiConfig config={wagmiConfig}>
    <App />
    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
  </WagmiConfig>
)
