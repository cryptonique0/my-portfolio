"use client";
import { Difficulty } from '../../lib/genkitChessAI';
import { GameState, GameStatus } from '../../lib/chessEngine';
import styles from './GameControls.module.css';

interface GameControlsProps {
  gameState: GameState;
  onNewGame: () => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  onResign?: () => void;
  onOfferDraw?: () => void;
  difficulty?: Difficulty;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  isPlayerWhite: boolean;
  isSinglePlayer?: boolean;
  canUndo?: boolean;
}

export default function GameControls({
  gameState,
  onNewGame,
  onUndo,
  onFlipBoard,
  onResign,
  onOfferDraw,
  difficulty = 'medium',
  onDifficultyChange,
  isPlayerWhite,
  isSinglePlayer = true,
  canUndo = true,
}: GameControlsProps) {
  const { status, isWhiteTurn, moveHistory } = gameState;
  const isGameOver = status === GameStatus.Checkmate || status === GameStatus.Stalemate || status === GameStatus.Draw;
  
  const getStatusText = () => {
    switch (status) {
      case GameStatus.Checkmate:
        return isWhiteTurn ? '♚ Black Wins by Checkmate!' : '♔ White Wins by Checkmate!';
      case GameStatus.Stalemate:
        return '½-½ Stalemate - Draw';
      case GameStatus.Draw:
        return '½-½ Draw';
      case GameStatus.Check:
        return isWhiteTurn ? '♔ White is in Check!' : '♚ Black is in Check!';
      default:
        return isWhiteTurn ? "♔ White's Turn" : "♚ Black's Turn";
    }
  };

  const getStatusClass = () => {
    if (status === GameStatus.Checkmate) {
      return isWhiteTurn ? styles.blackWins : styles.whiteWins;
    }
    if (status === GameStatus.Check) {
      return styles.check;
    }
    if (status === GameStatus.Stalemate || status === GameStatus.Draw) {
      return styles.draw;
    }
    return '';
  };

  return (
    <div className={styles.container}>
      {/* Status Display */}
      <div className={`${styles.status} ${getStatusClass()}`}>
        {getStatusText()}
      </div>

      {/* Difficulty Selector (Single Player Only) */}
      {isSinglePlayer && onDifficultyChange && (
        <div className={styles.difficultySection}>
          <label className={styles.label}>AI Difficulty:</label>
          <div className={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
              <button
                key={level}
                className={`${styles.difficultyBtn} ${difficulty === level ? styles.active : ''}`}
                onClick={() => onDifficultyChange(level)}
                disabled={moveHistory.length > 0}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className={styles.controls}>
        <button 
          className={`${styles.controlBtn} ${styles.primary}`}
          onClick={onNewGame}
        >
          <span className={styles.btnIcon}>🔄</span>
          New Game
        </button>
        
        <button 
          className={styles.controlBtn}
          onClick={onUndo}
          disabled={!canUndo || moveHistory.length === 0 || isGameOver}
        >
          <span className={styles.btnIcon}>↩️</span>
          Undo
        </button>
        
        <button 
          className={styles.controlBtn}
          onClick={onFlipBoard}
        >
          <span className={styles.btnIcon}>🔃</span>
          Flip Board
        </button>

        {!isSinglePlayer && onResign && (
          <button 
            className={`${styles.controlBtn} ${styles.danger}`}
            onClick={onResign}
            disabled={isGameOver}
          >
            <span className={styles.btnIcon}>🏳️</span>
            Resign
          </button>
        )}

        {!isSinglePlayer && onOfferDraw && (
          <button 
            className={styles.controlBtn}
            onClick={onOfferDraw}
            disabled={isGameOver}
          >
            <span className={styles.btnIcon}>🤝</span>
            Draw
          </button>
        )}
      </div>

      {/* Game Info */}
      <div className={styles.gameInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Move:</span>
          <span className={styles.infoValue}>{gameState.fullMoveNumber}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Playing as:</span>
          <span className={styles.infoValue}>{isPlayerWhite ? '♔ White' : '♚ Black'}</span>
        </div>
      </div>
    </div>
  );
}
