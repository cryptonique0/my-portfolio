import React, { useState } from 'react'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import { useToast } from './Toast'

// Simple ERC-721 ABI for minting
const nftAbi = [
  {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'string', name: 'uri', type: 'string' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export default function NFTMinting({ nftContractAddress }) {
  const { address, isConnected } = useAccount()
  const toast = useToast()
  const [imageFile, setImageFile] = useState(null)
  const [metadata, setMetadata] = useState('')
  const [uri, setUri] = useState('')

  // Mint NFT
  const { config: mintConfig } = useContractWrite({
    address: nftContractAddress,
    abi: nftAbi,
    functionName: 'mint',
    args: [address, uri],
    enabled: isConnected && !!nftContractAddress && !!uri,
  })
  const { write: writeMint, data: mintTx } = useContractWrite(mintConfig)
  const { isLoading: mintMining } = useWaitForTransaction({ hash: mintTx?.hash })

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Simple base64 encoding for demo; use IPFS in production
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result
        setUri(`data:image/png;base64,${base64.split(',')[1]}`) // Assuming PNG
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isConnected || !nftContractAddress) return null

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3>NFT Minting Interface</h3>
      <div style={{ marginBottom: 12 }}>
        <label>Upload Image:</label>
        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ marginLeft: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Metadata (JSON):</label>
        <textarea
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder='{"name": "My NFT", "description": "Description"}'
          rows={4}
          style={{ width: '100%', padding: 4, borderRadius: 4 }}
        />
      </div>
      <button
        onClick={() => writeMint?.()}
        disabled={!writeMint || mintMining || !uri}
        style={{ padding: '8px 16px', borderRadius: 4 }}
      >
        {mintMining ? 'Minting...' : 'Mint NFT'}
      </button>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Note: Uses base64 for URI. Integrate IPFS for production. Ensure NFT contract is deployed.
      </p>
    </div>
  )
}