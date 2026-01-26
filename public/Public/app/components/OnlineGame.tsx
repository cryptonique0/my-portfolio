"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import ChessBoard from './ChessBoardNew';
import { 
  createInitialState, 
  makeMove as applyLocalMove,
  GameState as LocalGameState,
  Move,
  GameStatus,
} from '../lib/chessEngine';
import { useChessContract, OnChainGameState, GameState as ContractGameState } from '../hooks/useChessContractNew';
import styles from './OnlineGame.module.css';

interface OnlineGameProps {
  gameId: number;
  onBack: () => void;
}

export default function OnlineGame({ gameId, onBack }: OnlineGameProps) {
  const { address, isConnected } = useAccount();
  const { 
    loading, 
    error, 
    getGameInfo, 
    makeMove: contractMakeMove,
    resign,
    offerDraw,
    claimTimeout,
  } = useChessContract();

  const [onChainState, setOnChainState] = useState<OnChainGameState | null>(null);
  const [localGameState, setLocalGameState] = useState<LocalGameState>(createInitialState());
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [isPlayerWhite, setIsPlayerWhite] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [pendingMove, setPendingMove] = useState<{ from: number; to: number } | null>(null);

  // Load game state from contract
  const loadGameState = useCallback(async () => {
    const state = await getGameInfo(gameId);
    if (state) {
      setOnChainState(state);
      
      // Convert on-chain board to local game state
      const newLocalState: LocalGameState = {
        ...createInitialState(),
        board: state.board,
        isWhiteTurn: state.whiteTurn,
        fullMoveNumber: Math.floor(state.moveCount / 2) + 1,
        status: convertContractStatus(state.state, state.whiteTurn, state.board),
        moveHistory: [], // We don't have move history from contract
      };
      setLocalGameState(newLocalState);
      
      // Determine player color
      if (address) {
        setIsPlayerWhite(state.whitePlayer.toLowerCase() === address.toLowerCase());
      }
    }
  }, [gameId, getGameInfo, address]);

  // Initial load
  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  // Poll for updates when it's opponent's turn
  useEffect(() => {
    if (!onChainState || !address) return;

    const isMyTurn = onChainState.whiteTurn === isPlayerWhite;
    
    if (!isMyTurn && onChainState.state === ContractGameState.Active) {
      // Start polling
      const interval = setInterval(loadGameState, 5000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [onChainState, address, isPlayerWhite, loadGameState, refreshInterval]);

  // Convert contract game state to local status
  const convertContractStatus = (
    contractState: ContractGameState, 
    _whiteTurn: boolean,
    _board: number[]
  ): GameStatus => {
    switch (contractState) {
      case ContractGameState.WhiteWon:
        return GameStatus.Checkmate;
      case ContractGameState.BlackWon:
        return GameStatus.Checkmate;
      case ContractGameState.Draw:
        return GameStatus.Draw;
      case ContractGameState.Abandoned:
        return GameStatus.Draw;
      default:
        // Check if in check
        // This is a simplified check - full implementation would need proper check detection
        return GameStatus.Active;
    }
  };

  // Handle move
  const handleMove = async (move: Move) => {
    if (!onChainState || loading) return;
    
    // Check if it's player's turn
    const isMyTurn = onChainState.whiteTurn === isPlayerWhite;
    if (!isMyTurn) return;

    setPendingMove({ from: move.from, to: move.to });
    
    // Make move on-chain
    const result = await contractMakeMove(
      gameId, 
      move.from, 
      move.to,
      move.promotion
    );

    if (result.success) {
      // Optimistically update local state
      const newLocalState = applyLocalMove(localGameState, move);
      setLocalGameState(newLocalState);
      setLastMove(move);
      
      // Refresh from chain
      await loadGameState();
    }
    
    setPendingMove(null);
  };

  // Handle resign
  const handleResign = async () => {
    if (window.confirm('Are you sure you want to resign?')) {
      await resign(gameId);
      await loadGameState();
    }
  };

  // Handle draw offer
  const handleOfferDraw = async () => {
    await offerDraw(gameId);
  };

  // Handle timeout claim
  const handleClaimTimeout = async () => {
    await claimTimeout(gameId);
    await loadGameState();
  };

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.connectPrompt}>
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to play on-chain chess</p>
          <button onClick={onBack} className={styles.backBtn}>
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!onChainState) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = onChainState.whiteTurn === isPlayerWhite;
  const isGameOver = onChainState.state !== ContractGameState.Active;
  const waitingForOpponent = onChainState.blackPlayer === '0x0000000000000000000000000000000000000000';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <h2 className={styles.title}>Game #{gameId}</h2>
        <div className={styles.wager}>
          💰 {onChainState.wager} ETH
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.gameLayout}>
        <div className={styles.playersSection}>
          <div className={`${styles.player} ${!onChainState.whiteTurn ? styles.active : ''}`}>
            <span className={styles.playerIcon}>♚</span>
            <div className={styles.playerInfo}>
              <span className={styles.playerLabel}>Black</span>
              <span className={styles.playerAddress}>
                {waitingForOpponent 
                  ? 'Waiting...' 
                  : formatAddress(onChainState.blackPlayer)}
              </span>
              {!isPlayerWhite && <span className={styles.youBadge}>You</span>}
            </div>
          </div>
        </div>

        <div className={styles.boardSection}>
          {waitingForOpponent && (
            <div className={styles.waitingOverlay}>
              <div className={styles.waitingContent}>
                <div className={styles.spinner}></div>
                <p>Waiting for opponent to join...</p>
                <p className={styles.hint}>Share the game ID: #{gameId}</p>
              </div>
            </div>
          )}

          {pendingMove && (
            <div className={styles.pendingOverlay}>
              <div className={styles.spinner}></div>
              <p>Confirming move on-chain...</p>
            </div>
          )}

          <ChessBoard
            gameState={localGameState}
            onMove={handleMove}
            isPlayerWhite={isPlayerWhite}
            disabled={!isMyTurn || isGameOver || waitingForOpponent || loading || !!pendingMove}
            lastMove={lastMove}
            highlightLegalMoves={true}
          />
        </div>

        <div className={styles.playersSection}>
          <div className={`${styles.player} ${onChainState.whiteTurn ? styles.active : ''}`}>
            <span className={styles.playerIcon}>♔</span>
            <div className={styles.playerInfo}>
              <span className={styles.playerLabel}>White</span>
              <span className={styles.playerAddress}>
                {formatAddress(onChainState.whitePlayer)}
              </span>
              {isPlayerWhite && <span className={styles.youBadge}>You</span>}
            </div>
          </div>
        </div>

        <div className={styles.statusSection}>
          <div className={styles.turnStatus}>
            {isGameOver ? (
              <span className={styles.gameOverStatus}>
                {getGameOverText(onChainState.state)}
              </span>
            ) : waitingForOpponent ? (
              <span>Waiting for opponent...</span>
            ) : isMyTurn ? (
              <span className={styles.yourTurn}>Your turn</span>
            ) : (
              <span className={styles.opponentTurn}>Opponent&apos;s turn</span>
            )}
          </div>

          <div className={styles.moveCount}>
            Move: {onChainState.moveCount}
          </div>
        </div>

        <div className={styles.actionsSection}>
          <button 
            className={styles.actionBtn}
            onClick={loadGameState}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          
          {!isGameOver && !waitingForOpponent && (
            <>
              <button 
                className={`${styles.actionBtn} ${styles.drawBtn}`}
                onClick={handleOfferDraw}
                disabled={loading}
              >
                🤝 Offer Draw
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.resignBtn}`}
                onClick={handleResign}
                disabled={loading}
              >
                🏳️ Resign
              </button>
              <button 
                className={styles.actionBtn}
                onClick={handleClaimTimeout}
                disabled={loading || isMyTurn}
              >
                ⏱️ Claim Timeout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatAddress(address: string): string {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return 'Unknown';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getGameOverText(state: ContractGameState): string {
  switch (state) {
    case ContractGameState.WhiteWon:
      return '♔ White Wins!';
    case ContractGameState.BlackWon:
      return '♚ Black Wins!';
    case ContractGameState.Draw:
      return '½-½ Draw';
    case ContractGameState.Abandoned:
      return 'Game Abandoned';
    default:
      return '';
  }
}
