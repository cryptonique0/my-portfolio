import React, { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { rewardsAbi } from '../../abi/rewards'
import { parseUnits, formatUnits } from 'viem'
import { useToast } from './Toast'

export default function StakingDashboard({ tokenAddress }) {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const toast = useToast()
  const [decimals, setDecimals] = useState(18)
  const [symbol, setSymbol] = useState('')
  const [claimable, setClaimable] = useState('0')
  const [stakeAmount, setStakeAmount] = useState('0')

  // Read token info
  useEffect(() => {
    async function load() {
      if (!tokenAddress) return
      try {
        const [sym, dec] = await Promise.all([
          publicClient.readContract({ address: tokenAddress, abi: rewardsAbi, functionName: 'symbol' }),
          publicClient.readContract({ address: tokenAddress, abi: rewardsAbi, functionName: 'decimals' }),
        ])
        setSymbol(sym)
        setDecimals(Number(dec))
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [tokenAddress, publicClient])

  // Read claimable rewards (assuming a view function; placeholder)
  const { data: claimableData } = useContractRead({
    address: tokenAddress,
    abi: rewardsAbi,
    functionName: 'claimable', // Placeholder; add to contract if needed
    args: [address],
    enabled: isConnected && !!tokenAddress && !!address,
  })

  useEffect(() => {
    if (claimableData) setClaimable(formatUnits(claimableData, decimals))
  }, [claimableData, decimals])

  // Claim rewards
  const { config: claimConfig } = useContractRead({
    address: tokenAddress,
    abi: rewardsAbi,
    functionName: 'claim',
    enabled: isConnected && !!tokenAddress,
  })
  const { write: writeClaim, data: claimTx } = useContractWrite(claimConfig)
  const { isLoading: claimMining } = useWaitForTransaction({ hash: claimTx?.hash })

  // Stake (placeholder; add to contract)
  const { config: stakeConfig } = useContractRead({
    address: tokenAddress,
    abi: rewardsAbi,
    functionName: 'stake',
    args: [parseUnits(stakeAmount || '0', decimals)],
    enabled: isConnected && !!tokenAddress && stakeAmount > 0,
  })
  const { write: writeStake, data: stakeTx } = useContractWrite(stakeConfig)
  const { isLoading: stakeMining } = useWaitForTransaction({ hash: stakeTx?.hash })

  if (!isConnected || !tokenAddress) return null

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3>Staking & Rewards Dashboard ({symbol})</h3>
      <div style={{ marginBottom: 12 }}>
        <strong>Claimable Rewards:</strong> {claimable} {symbol}
        <button
          onClick={() => writeClaim?.()}
          disabled={!writeClaim || claimMining}
          style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 4 }}
        >
          {claimMining ? 'Claiming...' : 'Claim'}
        </button>
      </div>
      <div>
        <strong>Stake Tokens:</strong>
        <input
          type="text"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="Amount to stake"
          style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
        />
        <button
          onClick={() => writeStake?.()}
          disabled={!writeStake || stakeMining}
          style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 4 }}
        >
          {stakeMining ? 'Staking...' : 'Stake'}
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Note: Staking and claimable functions are placeholders. Update Rewards.sol for full integration.
      </p>
    </div>
  )
}