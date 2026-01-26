"use client";
import { useState } from 'react';
import styles from './ChessBoard.module.css';

const PIECE_SYMBOLS = {
  1: '♙', 2: '♘', 3: '♗', 4: '♖', 5: '♕', 6: '♔',
  7: '♟', 8: '♞', 9: '♝', 10: '♜', 11: '♛', 12: '♚'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface ChessBoardProps {
  board: number[];
  onMove: (from: number, to: number) => void;
  isWhiteTurn: boolean;
  isPlayerWhite: boolean;
  disabled?: boolean;
  lastMove?: { from: number; to: number };
}

export default function ChessBoard({
  board,
  onMove,
  isWhiteTurn,
  isPlayerWhite,
  disabled = false,
  lastMove
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [legalMoves, setLegalMoves] = useState<number[]>([]);

  const isMyTurn = isWhiteTurn === isPlayerWhite;

  const handleSquareClick = (position: number) => {
    if (disabled || !isMyTurn) return;

    const piece = board[position];
    
    // If a square is already selected
    if (selectedSquare !== null) {
      // If clicking the same square, deselect
      if (selectedSquare === position) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If clicking a legal move, make the move
      if (legalMoves.includes(position)) {
        onMove(selectedSquare, position);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If clicking another piece of the same color, select it instead
      const isWhitePiece = piece >= 1 && piece <= 6;
      if ((isPlayerWhite && isWhitePiece) || (!isPlayerWhite && piece >= 7 && piece <= 12)) {
        setSelectedSquare(position);
        // In a real implementation, calculate legal moves here
        setLegalMoves([]);
        return;
      }

      // Otherwise, deselect
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      // No square selected, try to select this one
      if (piece === 0) return; // Empty square

      const isWhitePiece = piece >= 1 && piece <= 6;
      if ((isPlayerWhite && isWhitePiece) || (!isPlayerWhite && piece >= 7 && piece <= 12)) {
        setSelectedSquare(position);
        // In a real implementation, calculate legal moves here
        setLegalMoves([]);
      }
    }
  };

  const renderSquare = (position: number, row: number, col: number) => {
    const piece = board[position];
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare === position;
    const isLegalMove = legalMoves.includes(position);
    const isLastMove = lastMove && (lastMove.from === position || lastMove.to === position);

    const squareClasses = [
      styles.square,
      isLight ? styles.light : styles.dark,
      isSelected && styles.selected,
      isLegalMove && styles.legalMove,
      isLastMove && styles.lastMove
    ].filter(Boolean).join(' ');

    return (
      <div
        key={position}
        className={squareClasses}
        onClick={() => handleSquareClick(position)}
        data-position={position}
      >
        {piece !== 0 && (
          <div className={`${styles.piece} ${piece <= 6 ? styles.white : styles.black}`}>
            {PIECE_SYMBOLS[piece as keyof typeof PIECE_SYMBOLS]}
          </div>
        )}
        {isLegalMove && <div className={styles.moveIndicator} />}
      </div>
    );
  };

  const renderBoard = () => {
    const squares = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const position = row * 8 + col;
        squares.push(renderSquare(position, row, col));
      }
    }

    // Flip board if player is black
    return isPlayerWhite ? squares : squares.reverse();
  };

  return (
    <div className={styles.container}>
      <div className={styles.boardWrapper}>
        {/* File labels (a-h) */}
        <div className={styles.fileLabels}>
          {(isPlayerWhite ? FILES : [...FILES].reverse()).map(file => (
            <div key={file} className={styles.fileLabel}>{file}</div>
          ))}
        </div>

        <div className={styles.boardRow}>
          {/* Rank labels (1-8) */}
          <div className={styles.rankLabels}>
            {(isPlayerWhite ? RANKS : [...RANKS].reverse()).map(rank => (
              <div key={rank} className={styles.rankLabel}>{rank}</div>
            ))}
          </div>

          {/* Chess board */}
          <div className={styles.board}>
            {renderBoard()}
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <div className={styles.turnIndicator}>
        {disabled ? (
          <span className={styles.gameOver}>Game Over</span>
        ) : isMyTurn ? (
          <span className={styles.yourTurn}>Your Turn</span>
        ) : (
          <span className={styles.opponentTurn}>Opponent&apos;s Turn</span>
        )}
      </div>
    </div>
  );
}
