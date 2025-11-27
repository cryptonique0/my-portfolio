#!/usr/bin/env node
/**
 * Batch transaction helper for demos.
 * Usage: set env vars RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEYS (comma-separated), then run
 * node scripts/batchTxs.js
 */
import dotenv from 'dotenv'
dotenv.config()
import { ethers } from 'ethers'
import { rewardsAbi } from '../abi/rewards.js'

const RPC = process.env.RPC_URL
const CONTRACT = process.env.CONTRACT_ADDRESS
const PRIV_KEYS = (process.env.PRIVATE_KEYS || '').split(',').filter(Boolean)

if (!RPC || !CONTRACT || PRIV_KEYS.length === 0) {
  console.error('Please set RPC_URL, CONTRACT_ADDRESS and PRIVATE_KEYS (comma-separated)')
  process.exit(1)
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC)

  for (const pk of PRIV_KEYS) {
    try {
      const wallet = new ethers.Wallet(pk, provider)
      const address = await wallet.getAddress()
      console.log('\nRunning demo txs for', address)

      const contract = new ethers.Contract(CONTRACT, rewardsAbi, wallet)

      // Try to call claim() if available
      try {
        const tx = await contract.claim()
        console.log('Claim tx sent:', tx.hash)
        await tx.wait()
        console.log('Claim tx confirmed')
      } catch (e) {
        console.log('claim() failed or not available:', e.message)
      }

      // Try to transfer a small amount to a random address (demo)
      try {
        const recipient = ethers.getAddress(address) // send to self as demo
        const tx2 = await contract.transfer(recipient, ethers.parseUnits('0.001', 18))
        console.log('Transfer tx sent:', tx2.hash)
        await tx2.wait()
        console.log('Transfer tx confirmed')
      } catch (e) {
        console.log('transfer() failed:', e.message)
      }
    } catch (err) {
      console.error('Wallet error:', err.message)
    }
  }
}

main().catch((e) => {
  console.error('Error running batch txs', e)
  process.exit(1)
})
