import { useState } from 'react';
import { GameState, Move, PieceType, generateLegalMoves } from '../lib/chessEngine';
import styles from './ChessBoard.module.css';

interface PuzzleBoardProps {
  gameState: GameState;
  onMove: (move: Move) => void;
  disabled?: boolean;
  lastMove?: Move | null;
  highlightLegalMoves?: boolean;
  playerColor: 'white' | 'black';
}

const PIECE_SYMBOLS: Record<number, string> = {
  [PieceType.WPawn]: '♙',
  [PieceType.WKnight]: '♘',
  [PieceType.WBishop]: '♗',
  [PieceType.WRook]: '♖',
  [PieceType.WQueen]: '♕',
  [PieceType.WKing]: '♔',
  [PieceType.BPawn]: '♟',
  [PieceType.BKnight]: '♞',
  [PieceType.BBishop]: '♝',
  [PieceType.BRook]: '♜',
  [PieceType.BQueen]: '♛',
  [PieceType.BKing]: '♚',
};

export default function PuzzleBoard({ 
  gameState, 
  onMove, 
  disabled = false,
  lastMove,
  highlightLegalMoves = true,
  playerColor
}: PuzzleBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);

  const handleSquareClick = (index: number) => {
    if (disabled) return;

    const piece = gameState.board[index];
    const isWhitePiece = piece >= PieceType.WPawn && piece <= PieceType.WKing;
    const isBlackPiece = piece >= PieceType.BPawn && piece <= PieceType.BKing;
    const isPlayerPiece = (playerColor === 'white' && isWhitePiece) || 
                          (playerColor === 'black' && isBlackPiece);
    const isPlayerTurn = (playerColor === 'white' && gameState.isWhiteTurn) ||
                         (playerColor === 'black' && !gameState.isWhiteTurn);

    // If no piece is selected
    if (selectedSquare === null) {
      if (piece !== PieceType.Empty && isPlayerPiece && isPlayerTurn) {
        setSelectedSquare(index);
        const moves = generateLegalMoves(gameState).filter(m => m.from === index);
        setLegalMoves(moves);
      }
      return;
    }

    // If clicking the same square, deselect
    if (selectedSquare === index) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Try to make a move
    const move = legalMoves.find(m => m.to === index);
    if (move) {
      onMove(move);
      setSelectedSquare(null);
      setLegalMoves([]);
    } else if (piece !== PieceType.Empty && isPlayerPiece && isPlayerTurn) {
      // Select new piece
      setSelectedSquare(index);
      const moves = generateLegalMoves(gameState).filter(m => m.from === index);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const renderSquare = (index: number) => {
    const _row = Math.floor(index / 8);
    const _col = index % 8;
    
    // Flip board if player is black
    const displayIndex = playerColor === 'black' ? 63 - index : index;
    const displayRow = Math.floor(displayIndex / 8);
    const displayCol = displayIndex % 8;
    
    const isLight = (displayRow + displayCol) % 2 === 0;
    const piece = gameState.board[index];
    const isSelected = selectedSquare === index;
    const isLegalMove = legalMoves.some(m => m.to === index);
    const isLastMove = lastMove && (lastMove.from === index || lastMove.to === index);

    const squareClasses = [
      styles.square,
      isLight ? styles.light : styles.dark,
      isSelected ? styles.selected : '',
      isLegalMove ? styles.legalMove : '',
      isLastMove ? styles.lastMove : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={index}
        className={squareClasses}
        onClick={() => handleSquareClick(index)}
      >
        {highlightLegalMoves && isLegalMove && piece === PieceType.Empty && (
          <div className={styles.moveIndicator}></div>
        )}
        {highlightLegalMoves && isLegalMove && piece !== PieceType.Empty && (
          <div className={styles.captureIndicator}></div>
        )}
        {piece !== PieceType.Empty && (
          <div className={`${styles.piece} ${piece >= PieceType.WPawn && piece <= PieceType.WKing ? styles.white : styles.black}`}>
            {PIECE_SYMBOLS[piece]}
          </div>
        )}
        {(displayCol === 0) && (
          <div className={styles.rankLabel}>{8 - displayRow}</div>
        )}
        {(displayRow === 7) && (
          <div className={styles.fileLabel}>
            {String.fromCharCode(97 + displayCol)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.board}>
      <div className={styles.boardGrid}>
        {Array.from({ length: 64 }, (_, i) => {
          // Flip the rendering order if player is black
          const actualIndex = playerColor === 'black' ? 63 - i : i;
          return renderSquare(actualIndex);
        })}
      </div>
    </div>
  );
}
