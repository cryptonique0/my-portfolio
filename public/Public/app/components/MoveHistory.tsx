"use client";
import { Move, GameState } from '../lib/chessEngine';
import styles from './MoveHistory.module.css';

interface MoveHistoryProps {
  gameState: GameState;
  onSelectMove?: (moveIndex: number) => void;
}



export default function MoveHistory({ gameState, onSelectMove }: MoveHistoryProps) {
  const { moveHistory } = gameState;
  
  if (moveHistory.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Move History</h3>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>♟</span>
          <p>No moves yet</p>
          <p className={styles.hint}>Make your first move!</p>
        </div>
      </div>
    );
  }

  // Group moves into pairs (white + black)
  const movePairs: { moveNumber: number; white?: string; black?: string }[] = [];
  
  for (let i = 0; i < moveHistory.length; i++) {
    const move = moveHistory[i];
    const notation = formatMove(move);
    const moveNumber = Math.floor(i / 2) + 1;
    
    if (i % 2 === 0) {
      movePairs.push({ moveNumber, white: notation });
    } else {
      movePairs[movePairs.length - 1].black = notation;
    }
  }

  function formatMove(move: Move): string {
    // Use algebraic notation with piece symbols
    let notation = '';
    
    // Castling
    if (move.isCastling) {
      return move.to > move.from ? 'O-O' : 'O-O-O';
    }
    
    const pieceSymbols: { [key: number]: string } = {
      2: 'N', 3: 'B', 4: 'R', 5: 'Q', 6: 'K',
      8: 'N', 9: 'B', 10: 'R', 11: 'Q', 12: 'K',
    };
    
    const files = 'abcdefgh';
    const ranks = '87654321';
    
    const fromFile = files[move.from % 8];
    const toFile = files[move.to % 8];
    const toRank = ranks[Math.floor(move.to / 8)];
    
    // Piece symbol (except pawns)
    if (pieceSymbols[move.piece]) {
      notation += pieceSymbols[move.piece];
    }
    
    // For pawns, show file if capturing
    if ((move.piece === 1 || move.piece === 7) && move.captured) {
      notation += fromFile;
    }
    
    // Capture
    if (move.captured) {
      notation += 'x';
    }
    
    // Destination
    notation += toFile + toRank;
    
    // Promotion
    if (move.promotion) {
      const promoSymbol = pieceSymbols[move.promotion] || 'Q';
      notation += '=' + promoSymbol;
    }
    
    // Check or checkmate
    if (move.isCheckmate) {
      notation += '#';
    } else if (move.isCheck) {
      notation += '+';
    }
    
    return notation;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Move History</h3>
      <div className={styles.moveList}>
        {movePairs.map((pair, index) => (
          <div key={index} className={styles.movePair}>
            <span className={styles.moveNumber}>{pair.moveNumber}.</span>
            <span 
              className={`${styles.move} ${styles.whiteMove}`}
              onClick={() => onSelectMove?.(index * 2)}
            >
              {pair.white}
            </span>
            {pair.black && (
              <span 
                className={`${styles.move} ${styles.blackMove}`}
                onClick={() => onSelectMove?.(index * 2 + 1)}
              >
                {pair.black}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
