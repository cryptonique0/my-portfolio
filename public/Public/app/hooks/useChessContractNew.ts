"use client";
import { useState, useCallback } from 'react';
import { 
  useAccount, 
  usePublicClient, 
  useWalletClient,
  useChainId 
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CHESS_ABI, CHESS_FACTORY_ABI } from '../contracts/abis';
import { getContractAddresses } from '../contracts/addresses';

// Game state enum matching the contract
export enum GameState {
  Active = 0,
  WhiteWon = 1,
  BlackWon = 2,
  Draw = 3,
  Abandoned = 4,
}

export interface OnChainGameState {
  whitePlayer: string;
  blackPlayer: string;
  board: number[];
  whiteTurn: boolean;
  state: GameState;
  wager: string;
  moveCount: number;
  startTime?: number;
  lastMoveTime?: number;
}

export interface OpenGame {
  gameId: number;
  creator: string;
  wager: string;
  timestamp: number;
  filled: boolean;
}

interface ContractError extends Error {
  message: string;
  shortMessage?: string;
}

export function useChessContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const getAddresses = useCallback(() => {
    return getContractAddresses(chainId || 84532);
  }, [chainId]);

  // Create a new open game (anyone can join)
  const createOpenGame = useCallback(async (wagerEth: string = '0') => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const addresses = getAddresses();
      const wagerWei = parseEther(wagerEth);

      const hash = await walletClient.writeContract({
        address: addresses.chessFactory,
        abi: CHESS_FACTORY_ABI,
        functionName: 'createOpenGame',
        value: wagerWei,
      });

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      
      // Extract gameId from event logs (for future use if needed)
      const _gameCreatedEvent = receipt?.logs.find(log => {
        try {
          return log.topics[0] === '0x' + 'GameListingCreated'.padStart(64, '0');
        } catch {
          return false;
        }
      });

      // For now, return the transaction hash - we'd need to parse logs for actual gameId
      return {
        success: true,
        txHash: hash,
        message: 'Game created successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      const errorMessage = contractError.shortMessage || contractError.message || 'Failed to create game';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, publicClient, getAddresses]);

  // Create a private game with specific opponent
  const createPrivateGame = useCallback(async (opponent: string, wagerEth: string = '0') => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const addresses = getAddresses();
      const wagerWei = parseEther(wagerEth);

      const hash = await walletClient.writeContract({
        address: addresses.chessFactory,
        abi: CHESS_FACTORY_ABI,
        functionName: 'createPrivateGame',
        args: [opponent as `0x${string}`],
        value: wagerWei,
      });

      await publicClient?.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        message: 'Private game created successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      const errorMessage = contractError.shortMessage || contractError.message || 'Failed to create game';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, publicClient, getAddresses]);

  // Join an open game
  const joinGame = useCallback(async (gameId: number, wagerEth: string) => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const addresses = getAddresses();
      const wagerWei = parseEther(wagerEth);

      const hash = await walletClient.writeContract({
        address: addresses.chessFactory,
        abi: CHESS_FACTORY_ABI,
        functionName: 'joinOpenGame',
        args: [BigInt(gameId)],
        value: wagerWei,
      });

      await publicClient?.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        message: 'Joined game successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      const errorMessage = contractError.shortMessage || contractError.message || 'Failed to join game';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, publicClient, getAddresses]);

  // Make a move on-chain
  const makeMove = useCallback(async (gameId: number, fromPos: number, toPos: number, promotionPiece?: number) => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const addresses = getAddresses();

      let hash;
      if (promotionPiece !== undefined) {
        hash = await walletClient.writeContract({
          address: addresses.chess,
          abi: CHESS_ABI,
          functionName: 'makeMoveProm',
          args: [BigInt(gameId), fromPos, toPos, promotionPiece],
        });
      } else {
        hash = await walletClient.writeContract({
          address: addresses.chess,
          abi: CHESS_ABI,
          functionName: 'makeMove',
          args: [BigInt(gameId), fromPos, toPos],
        });
      }

      await publicClient?.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        message: 'Move made successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      const errorMessage = contractError.shortMessage || contractError.message || 'Failed to make move';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, publicClient, getAddresses]);

  // Get game state from contract
  const getGameInfo = useCallback(async (gameId: number): Promise<OnChainGameState | null> => {
    if (!publicClient) {
      return null;
    }

    try {
      const addresses = getAddresses();
      
      // Check if contract address is valid (not zero address)
      if (addresses.chess === '0x0000000000000000000000000000000000000000') {
        throw new Error('Chess contract not deployed. Please configure contract environment variables.');
      }

      const result = await publicClient.readContract({
        address: addresses.chess,
        abi: CHESS_ABI,
        functionName: 'getGameState',
        args: [BigInt(gameId)],
      }) as unknown as [string, string, readonly number[], boolean, number, bigint, bigint];

      const [whitePlayer, blackPlayer, board, whiteTurn, state, wager, moveCount] = result;

      return {
        whitePlayer,
        blackPlayer,
        board: [...board],
        whiteTurn,
        state: state as GameState,
        wager: formatEther(wager),
        moveCount: Number(moveCount),
      };
    } catch (err: unknown) {
      console.error('Failed to get game info:', err);
      return null;
    }
  }, [publicClient, getAddresses]);

  // Get board state
  const getBoard = useCallback(async (gameId: number): Promise<number[] | null> => {
    if (!publicClient) {
      return null;
    }

    try {
      const addresses = getAddresses();
      
      // Check if contract address is valid (not zero address)
      if (addresses.chess === '0x0000000000000000000000000000000000000000') {
        throw new Error('Chess contract not deployed. Please configure contract environment variables.');
      }

      const board = await publicClient.readContract({
        address: addresses.chess,
        abi: CHESS_ABI,
        functionName: 'getBoard',
        args: [BigInt(gameId)],
      }) as readonly number[];

      return [...board];
    } catch (err: unknown) {
      console.error('Failed to get board:', err);
      return null;
    }
  }, [publicClient, getAddresses]);

  // Get all open games
  const getOpenGames = useCallback(async (): Promise<OpenGame[]> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    try {
      const addresses = getAddresses();
      
      // Check if contract address is valid (not zero address)
      if (addresses.chessFactory === '0x0000000000000000000000000000000000000000') {
        throw new Error('Chess Factory contract not deployed. Please configure NEXT_PUBLIC_CHESS_FACTORY_ADDRESS_SEPOLIA environment variable.');
      }

      const games = await Promise.race([
        publicClient.readContract({
          address: addresses.chessFactory,
          abi: CHESS_FACTORY_ABI,
          functionName: 'getOpenGames',
        }) as Promise<readonly { gameId: bigint; creator: string; wager: bigint; timestamp: bigint; filled: boolean }[]>,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Contract call timed out')), 5000)
        )
      ]);

      return games.map(game => ({
        gameId: Number(game.gameId),
        creator: game.creator,
        wager: formatEther(game.wager),
        timestamp: Number(game.timestamp),
        filled: game.filled,
      }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get open games';
      console.error('Failed to get open games:', errorMsg);
      throw err;
    }
  }, [publicClient, getAddresses]);

  // Get player's games
  const getPlayerGames = useCallback(async (playerAddress?: string): Promise<number[]> => {
    if (!publicClient) {
      return [];
    }

    const targetAddress = playerAddress || address;
    if (!targetAddress) {
      return [];
    }

    try {
      const addresses = getAddresses();
      
      // Check if contract address is valid (not zero address)
      if (addresses.chess === '0x0000000000000000000000000000000000000000') {
        throw new Error('Chess contract not deployed. Please configure contract environment variables.');
      }

      const gameIds = await publicClient.readContract({
        address: addresses.chess,
        abi: CHESS_ABI,
        functionName: 'getPlayerGames',
        args: [targetAddress as `0x${string}`],
      }) as readonly bigint[];

      return gameIds.map(id => Number(id));
    } catch (err: unknown) {
      console.error('Failed to get player games:', err);
      return [];
    }
  }, [publicClient, address, getAddresses]);

  // Claim timeout win
  const claimTimeout = useCallback(async (gameId: number) => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const addresses = getAddresses();

      const hash = await walletClient.writeContract({
        address: addresses.chess,
        abi: CHESS_ABI,
        functionName: 'claimTimeout',
        args: [BigInt(gameId)],
      });

      await publicClient?.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        message: 'Timeout claimed successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      const errorMessage = contractError.shortMessage || contractError.message || 'Failed to claim timeout';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, publicClient, getAddresses]);

  // Offer draw
  const offerDraw = useCallback(async (gameId: number) => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const addresses = getAddresses();

      const hash = await walletClient.writeContract({
        address: addresses.chess,
        abi: CHESS_ABI,
        functionName: 'offerDraw',
        args: [BigInt(gameId)],
      });

      await publicClient?.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        message: 'Draw offered successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      const errorMessage = contractError.shortMessage || contractError.message || 'Failed to offer draw';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, publicClient, getAddresses]);

  // Accept draw
  const acceptDraw = useCallback(async (gameId: number) => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const addresses = getAddresses();

      const hash = await walletClient.writeContract({
        address: addresses.chess,
        abi: CHESS_ABI,
        functionName: 'acceptDraw',
        args: [BigInt(gameId)],
      });

      await publicClient?.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        message: 'Draw accepted'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      const errorMessage = contractError.shortMessage || contractError.message || 'Failed to accept draw';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, publicClient, getAddresses]);

  // Resign game
  const resign = useCallback(async (gameId: number) => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const addresses = getAddresses();

      const hash = await walletClient.writeContract({
        address: addresses.chess,
        abi: CHESS_ABI,
        functionName: 'resign',
        args: [BigInt(gameId)],
      });

      await publicClient?.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        message: 'Resigned from game'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      const errorMessage = contractError.shortMessage || contractError.message || 'Failed to resign';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, publicClient, getAddresses]);

  return {
    // State
    loading,
    error,
    isConnected,
    address,
    chainId,
    
    // Game creation
    createOpenGame,
    createPrivateGame,
    joinGame,
    
    // Game actions
    makeMove,
    claimTimeout,
    offerDraw,
    acceptDraw,
    resign,
    
    // Read functions
    getGameInfo,
    getBoard,
    getOpenGames,
    getPlayerGames,
    
    // Contract addresses
    getContractAddresses: getAddresses,
  };
}
