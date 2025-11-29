import React, { useState, useEffect } from 'react'
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { useToast } from './Toast'

// Simple Governance ABI (placeholder)
const governanceAbi = [
  { inputs: [], name: 'proposalCount', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }], name: 'getProposal', outputs: [{ internalType: 'string', name: 'description', type: 'string' }, { internalType: 'uint256', name: 'yesVotes', type: 'uint256' }, { internalType: 'uint256', name: 'noVotes', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'string', name: 'description', type: 'string' }], name: 'propose', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }, { internalType: 'bool', name: 'support', type: 'bool' }], name: 'vote', outputs: [], stateMutability: 'nonpayable', type: 'function' },
]

export default function GovernanceDashboard({ governanceContractAddress }) {
  const { address, isConnected } = useAccount()
  const toast = useToast()
  const [proposals, setProposals] = useState([])
  const [newProposal, setNewProposal] = useState('')

  // Read proposal count
  const { data: proposalCount } = useContractRead({
    address: governanceContractAddress,
    abi: governanceAbi,
    functionName: 'proposalCount',
    enabled: !!governanceContractAddress,
  })

  // Load proposals
  useEffect(() => {
    if (proposalCount) {
      const loadProposals = async () => {
        const props = []
        for (let i = 1; i <= Number(proposalCount); i++) {
          try {
            const [desc, yes, no] = await publicClient.readContract({
              address: governanceContractAddress,
              abi: governanceAbi,
              functionName: 'getProposal',
              args: [i],
            })
            props.push({ id: i, description: desc, yesVotes: Number(yes), noVotes: Number(no) })
          } catch (e) {
            console.error(e)
          }
        }
        setProposals(props)
      }
      loadProposals()
    }
  }, [proposalCount, governanceContractAddress])

  // Propose
  const { write: writePropose, data: proposeTx } = useContractWrite({
    address: governanceContractAddress,
    abi: governanceAbi,
    functionName: 'propose',
    args: [newProposal],
    enabled: isConnected && !!governanceContractAddress && newProposal,
  })
  const { isLoading: proposing } = useWaitForTransaction({ hash: proposeTx?.hash })

  // Vote
  const vote = (id, support) => {
    // Placeholder for vote function
    toast.info(`Voted ${support ? 'Yes' : 'No'} on proposal ${id}`)
  }

  if (!isConnected || !governanceContractAddress) return null

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3>Governance & Voting Dashboard</h3>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={newProposal}
          onChange={(e) => setNewProposal(e.target.value)}
          placeholder="New proposal description"
          style={{ padding: 8, borderRadius: 4, marginRight: 8, width: '60%' }}
        />
        <button onClick={() => writePropose?.()} disabled={proposing || !newProposal} style={{ padding: '8px 16px', borderRadius: 4 }}>
          {proposing ? 'Proposing...' : 'Propose'}
        </button>
      </div>
      <div>
        {proposals.map((prop) => (
          <div key={prop.id} style={{ marginBottom: 8, padding: 8, border: '1px solid #e5e7eb', borderRadius: 4 }}>
            <p><strong>Proposal {prop.id}:</strong> {prop.description}</p>
            <p>Yes: {prop.yesVotes} | No: {prop.noVotes}</p>
            <button onClick={() => vote(prop.id, true)} style={{ marginRight: 8, padding: '4px 8px' }}>Vote Yes</button>
            <button onClick={() => vote(prop.id, false)} style={{ padding: '4px 8px' }}>Vote No</button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Note: Requires deployed governance contract. Voting logic is placeholder.
      </p>
    </div>
  )
}