"use client";
import { useState, useCallback } from 'react';

// Mock contract addresses - replace with actual deployed addresses
const CHESS_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHESS_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CHESS_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CHESS_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000';

interface GameState {
  whitePlayer: string;
  blackPlayer: string;
  board: number[];
  whiteTurn: boolean;
  state: number; // 0=Active, 1=WhiteWon, 2=BlackWon, 3=Draw, 4=Abandoned
  wager: string;
  moveCount: number;
}

interface ContractError extends Error {
  message: string;
}

export function useChessContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = useCallback(async (opponent: string = '0x0000000000000000000000000000000000000000', wager: string = '0') => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual contract call
      // For now, return mock data
      console.log('Creating game with opponent:', opponent, 'wager:', wager);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        gameId: Math.floor(Math.random() * 1000),
        message: 'Game created successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      setError(contractError.message || 'Failed to create game');
      return { success: false, error: contractError.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const joinGame = useCallback(async (gameId: number, wager: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual contract call
      console.log('Joining game:', gameId, 'with wager:', wager);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Joined game successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      setError(contractError.message || 'Failed to join game');
      return { success: false, error: contractError.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const makeMove = useCallback(async (gameId: number, fromPos: number, toPos: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual contract call
      console.log('Making move in game:', gameId, 'from:', fromPos, 'to:', toPos);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: 'Move made successfully'
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      setError(contractError.message || 'Failed to make move');
      return { success: false, error: contractError.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getGameInfo = useCallback(async (gameId: number): Promise<GameState | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual contract call
      console.log('Getting game info for:', gameId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock game state
      return {
        whitePlayer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        blackPlayer: '0x1234567890123456789012345678901234567890',
        board: getInitialBoard(),
        whiteTurn: true,
        state: 0,
        wager: '0.01',
        moveCount: 0
      };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      setError(contractError.message || 'Failed to get game info');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOpenGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual contract call
      console.log('Getting open games');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock open games
      return [
        {
          gameId: 1,
          creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          wager: '0.01',
          timestamp: Math.floor(Date.now() / 1000) - 300
        },
        {
          gameId: 2,
          creator: '0x1234567890123456789012345678901234567890',
          wager: '0.05',
          timestamp: Math.floor(Date.now() / 1000) - 600
        }
      ];
    } catch (err: unknown) {
      const contractError = err as ContractError;
      setError(contractError.message || 'Failed to get open games');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const claimTimeout = useCallback(async (gameId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Claiming timeout for game:', gameId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: 'Timeout claimed successfully' };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      setError(contractError.message || 'Failed to claim timeout');
      return { success: false, error: contractError.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const offerDraw = useCallback(async (gameId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Offering draw for game:', gameId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: 'Draw offered successfully' };
    } catch (err: unknown) {
      const contractError = err as ContractError;
      setError(contractError.message || 'Failed to offer draw');
      return { success: false, error: contractError.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createGame,
    joinGame,
    makeMove,
    getGameInfo,
    getOpenGames,
    claimTimeout,
    offerDraw,
    contractAddress: CHESS_CONTRACT_ADDRESS,
    factoryAddress: CHESS_FACTORY_ADDRESS
  };
}

// Helper function to get initial chess board state
function getInitialBoard(): number[] {
  const board = new Array(64).fill(0);
  
  // Black pieces (row 0-1)
  board[0] = 10; // BRook
  board[1] = 8;  // BKnight
  board[2] = 9;  // BBishop
  board[3] = 11; // BQueen
  board[4] = 12; // BKing
  board[5] = 9;  // BBishop
  board[6] = 8;  // BKnight
  board[7] = 10; // BRook
  
  for (let i = 8; i < 16; i++) {
    board[i] = 7; // BPawn
  }
  
  // White pieces (row 6-7)
  for (let i = 48; i < 56; i++) {
    board[i] = 1; // WPawn
  }
  
  board[56] = 4; // WRook
  board[57] = 2; // WKnight
  board[58] = 3; // WBishop
  board[59] = 5; // WQueen
  board[60] = 6; // WKing
  board[61] = 3; // WBishop
  board[62] = 2; // WKnight
  board[63] = 4; // WRook
  
  return board;
}
