import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// Health check for Base RPC
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const response = await axios.post(BASE_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'web3_clientVersion',
      params: []
    }, { headers: { 'Content-Type': 'application/json' } });

    res.json({
      success: true,
      rpcUrl: BASE_RPC_URL,
      clientVersion: response.data?.result || 'unknown'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      rpcUrl: BASE_RPC_URL,
      error: error.message || 'Failed to reach Base RPC'
    });
  }
});

// Get account balance on Base
router.get('/account/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  try {
    const balanceResponse = await axios.post(BASE_RPC_URL, {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { headers: { 'Content-Type': 'application/json' } });

    const balanceHex = balanceResponse.data?.result;
    if (!balanceHex) {
      return res.status(400).json({ success: false, error: 'Invalid balance response' });
    }

    const wei = BigInt(balanceHex);
    const eth = Number(wei) / 1e18;

    res.json({
      success: true,
      address,
      balance: eth.toFixed(4),
      balanceWei: wei.toString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch balance'
    });
  }
});

export default router;
