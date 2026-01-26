import axios from 'axios';

interface StacksApiConfig {
  baseUrl: string;
  network: string;
}

class StacksApiService {
  private baseUrl: string;
  private network: string;

  constructor(config: StacksApiConfig) {
    this.baseUrl = config.baseUrl;
    this.network = config.network;
  }

  /**
   * Get account information from Stacks API
   * @param address - Stacks address
   */
  async getAccount(address: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/extended/v1/address/${address}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  /**
   * Get account transactions
   * @param address - Stacks address
   * @param limit - Number of transactions to fetch
   */
  async getAccountTransactions(address: string, limit: number = 50) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/extended/v1/address/${address}/transactions`,
        { params: { limit } }
      );
      return response.data.results;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get token balances for an address
   * @param address - Stacks address
   */
  async getTokenBalances(address: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/extended/v1/address/${address}/balances`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching balances:', error);
      throw error;
    }
  }

  /**
   * Submit transaction to Stacks network
   * @param tx - Signed transaction
   */
  async submitTransaction(tx: Buffer) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/transactions`,
        tx,
        {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   * @param txId - Transaction ID
   */
  async getTransaction(txId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/extended/v1/tx/${txId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Get contract information
   * @param contractId - Contract ID (address.contract-name)
   */
  async getContract(contractId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/extended/v1/contract/${contractId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  }

  /**
   * Call read-only contract function
   * @param contractId - Contract ID
   * @param functionName - Function name
   * @param functionArgs - Function arguments
   */
  async callReadOnlyFunction(
    contractId: string,
    functionName: string,
    functionArgs: any[]
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/contracts/call-read/${contractId}/${functionName}`,
        { arguments: functionArgs }
      );
      return response.data;
    } catch (error) {
      console.error('Error calling read-only function:', error);
      throw error;
    }
  }

  /**
   * Get current network fee information
   */
  async getFeeInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/fees/transfer`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fee info:', error);
      throw error;
    }
  }

  /**
   * Get microblock info
   */
  async getMicroblockInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/blocks/microblock`);
      return response.data;
    } catch (error) {
      console.error('Error fetching microblock info:', error);
      throw error;
    }
  }
}

// Initialize Stacks API service with typed config
import { getConfig } from '../config/env';

const config = getConfig();
const stacksApi = new StacksApiService({
  baseUrl: config.stacks.apiUrl,
  network: config.network
});

export default stacksApi;

// Lightweight placeholder for Base provider integration
export function getBaseProvider() {
  // In production this would return an ethers.js/json-rpc provider instance
  return null;
}
