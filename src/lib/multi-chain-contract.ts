import { useContractRead, useContractWrite, useAccount, useNetwork } from 'wagmi';
import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { ChainType, NETWORKS } from './web3-config';
import { getStacksNetwork, getStacksContracts } from './stacks-config';
import { ChainInfo, getChainInfo } from './chain-utils';

/**
 * Multi-Chain Contract Interaction Layer
 * Handles EVM and Stacks contract calls seamlessly
 */

export interface ContractCallConfig {
  chainId?: number | string;
  functionName: string;
  args?: any[];
  value?: string;
  gasLimit?: string;
}

export interface ContractWriteConfig extends ContractCallConfig {
  onSuccess?: (hash: string) => void;
  onError?: (error: Error) => void;
}

/**
 * EVM Contract Read Hook
 */
export function useEvmContractRead(
  contractAddress: string,
  abi: any[],
  config: ContractCallConfig
) {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { data, isLoading, error } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi,
    functionName: config.functionName,
    args: config.args,
    chainId: (config.chainId as number) || chain?.id,
    enabled: !!contractAddress && !!address,
  });

  return { data, isLoading, error };
}

/**
 * EVM Contract Write Hook
 */
export function useEvmContractWrite(
  contractAddress: string,
  abi: any[],
  config: ContractWriteConfig
) {
  const { write, isLoading, error, data: hash } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi,
    functionName: config.functionName,
    args: config.args,
  });

  const execute = useCallback(async () => {
    if (write) {
      write(
        {
          args: config.args,
          value: config.value ? ethers.parseEther(config.value) : undefined,
        },
        {
          onSuccess: (data) => {
            config.onSuccess?.(data.hash);
          },
          onError: (error) => {
            config.onError?.(error);
          },
        }
      );
    }
  }, [write, config]);

  return { execute, isLoading, error, hash };
}

/**
 * Stacks Contract Interaction Functions
 */
export const stacksContractCalls = {
  /**
   * Create profile on Stacks
   */
  createProfile: async (
    handle: string,
    ipfsHash: string,
    isTestnet: boolean = false
  ) => {
    const network = getStacksNetwork(isTestnet);
    const contracts = getStacksContracts(isTestnet);

    // This would use @stacks/transactions library
    // Return transaction for user to sign
    return {
      contractAddress: contracts.onChainResume,
      functionName: 'create-profile',
      args: [handle, ipfsHash],
      network,
    };
  },

  /**
   * Add credential on Stacks
   */
  addCredential: async (
    credentialType: string,
    issuer: string,
    issuedDate: number,
    expiryDate: number,
    proofUrl: string,
    isTestnet: boolean = false
  ) => {
    const network = getStacksNetwork(isTestnet);
    const contracts = getStacksContracts(isTestnet);

    return {
      contractAddress: contracts.onChainResume,
      functionName: 'add-credential',
      args: [
        credentialType,
        issuer,
        issuedDate.toString(),
        expiryDate.toString(),
        proofUrl,
      ],
      network,
    };
  },

  /**
   * Unlock achievement on Stacks
   */
  unlockAchievement: async (
    title: string,
    description: string,
    achievementType: string,
    points: number,
    isTestnet: boolean = false
  ) => {
    const network = getStacksNetwork(isTestnet);
    const contracts = getStacksContracts(isTestnet);

    return {
      contractAddress: contracts.onChainResume,
      functionName: 'unlock-achievement',
      args: [title, description, achievementType, points.toString()],
      network,
    };
  },

  /**
   * Verify credential on Stacks
   */
  verifyCredential: async (
    userAddress: string,
    credentialId: number,
    isTestnet: boolean = false
  ) => {
    const network = getStacksNetwork(isTestnet);
    const contracts = getStacksContracts(isTestnet);

    return {
      contractAddress: contracts.onChainResume,
      functionName: 'verify-credential',
      args: [userAddress, credentialId.toString()],
      network,
    };
  },

  /**
   * Get profile from Stacks
   */
  getProfile: async (userAddress: string, isTestnet: boolean = false) => {
    const network = getStacksNetwork(isTestnet);
    const contracts = getStacksContracts(isTestnet);

    return {
      contractAddress: contracts.onChainResume,
      functionName: 'get-profile',
      args: [userAddress],
      network,
      readOnly: true,
    };
  },

  /**
   * Get reputation from Stacks
   */
  getReputation: async (userAddress: string, isTestnet: boolean = false) => {
    const network = getStacksNetwork(isTestnet);
    const contracts = getStacksContracts(isTestnet);

    return {
      contractAddress: contracts.onChainResume,
      functionName: 'get-reputation',
      args: [userAddress],
      network,
      readOnly: true,
    };
  },
};

/**
 * Multi-Chain Contract Manager
 * Handles both EVM and Stacks interactions
 */
export class MultiChainContractManager {
  private evmAbi: any[];
  private stacksContracts: any;

  constructor(evmAbi: any[], stacksContracts: any) {
    this.evmAbi = evmAbi;
    this.stacksContracts = stacksContracts;
  }

  /**
   * Execute contract call based on chain type
   */
  async executeCall(
    chainId: number | string,
    config: ContractCallConfig
  ): Promise<any> {
    const chainInfo = getChainInfo(chainId);

    if (!chainInfo) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    if (chainInfo.type === ChainType.EVM) {
      return this.executeEvmCall(chainId as number, config);
    } else if (chainInfo.type === ChainType.STACKS) {
      return this.executeStacksCall(config);
    }

    throw new Error(`Unknown chain type for chain ${chainId}`);
  }

  /**
   * Execute EVM contract call
   */
  private async executeEvmCall(
    chainId: number,
    config: ContractCallConfig
  ): Promise<any> {
    // Implementation depends on contract address setup
    // This is a template for actual implementation
    return {
      status: 'pending',
      message: 'EVM call would be executed here',
      chainId,
      config,
    };
  }

  /**
   * Execute Stacks contract call
   */
  private async executeStacksCall(config: ContractCallConfig): Promise<any> {
    // Implementation depends on Stacks wallet integration
    // This is a template for actual implementation
    return {
      status: 'pending',
      message: 'Stacks call would be executed here',
      config,
    };
  }

  /**
   * Sync profile across multiple chains
   */
  async syncProfileAcrossChains(
    userAddress: string,
    profileData: any,
    chainIds: (number | string)[]
  ): Promise<any[]> {
    const results = [];

    for (const chainId of chainIds) {
      try {
        const result = await this.executeCall(chainId, {
          functionName: 'updateProfile',
          args: [profileData.ipfsHash],
        });
        results.push({
          chainId,
          status: 'success',
          data: result,
        });
      } catch (error) {
        results.push({
          chainId,
          status: 'error',
          error: (error as Error).message,
        });
      }
    }

    return results;
  }

  /**
   * Get profile from all chains
   */
  async getProfileFromAllChains(userAddress: string): Promise<any> {
    const chainProfiles: Record<string, any> = {};

    const chainIds = Object.values(NETWORKS).map((net) => net.id);

    for (const chainId of chainIds) {
      try {
        const profile = await this.executeCall(chainId, {
          functionName: 'getProfile',
          args: [userAddress],
        });
        chainProfiles[chainId.toString()] = profile;
      } catch (error) {
        chainProfiles[chainId.toString()] = {
          error: (error as Error).message,
        };
      }
    }

    return chainProfiles;
  }

  /**
   * Get aggregated reputation across chains
   */
  async getAggregatedReputation(userAddress: string): Promise<{
    totalReputation: number;
    byChain: Record<string, number>;
  }> {
    const byChain: Record<string, number> = {};
    let totalReputation = 0;

    const chainIds = Object.values(NETWORKS).map((net) => net.id);

    for (const chainId of chainIds) {
      try {
        const reputation = await this.executeCall(chainId, {
          functionName: 'getReputation',
          args: [userAddress],
        });
        const score = typeof reputation === 'number' ? reputation : 0;
        byChain[chainId.toString()] = score;
        totalReputation += score;
      } catch (error) {
        byChain[chainId.toString()] = 0;
      }
    }

    return {
      totalReputation,
      byChain,
    };
  }
}

/**
 * Hook for multi-chain contract interaction
 */
export function useMultiChainContract(evmAbi: any[], stacksContracts: any) {
  const manager = new MultiChainContractManager(evmAbi, stacksContracts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeCall = useCallback(
    async (chainId: number | string, config: ContractCallConfig) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await manager.executeCall(chainId, config);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [manager]
  );

  const syncProfileAcrossChains = useCallback(
    async (
      userAddress: string,
      profileData: any,
      chainIds: (number | string)[]
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await manager.syncProfileAcrossChains(
          userAddress,
          profileData,
          chainIds
        );
        return results;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [manager]
  );

  const getAggregatedReputation = useCallback(
    async (userAddress: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const reputation = await manager.getAggregatedReputation(userAddress);
        return reputation;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [manager]
  );

  return {
    executeCall,
    syncProfileAcrossChains,
    getAggregatedReputation,
    isLoading,
    error,
  };
}
