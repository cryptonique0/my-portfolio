"use client";
import { useState, useEffect, useCallback } from 'react';
import styles from './ChessBoard.module.css';
import { 
  GameState, 
  Move, 
  getLegalMovesForSquare, 
  isWhitePiece, 
  isPawn, 
  Piece,
  getRow 
} from '../lib/chessEngine';

const PIECE_SYMBOLS: { [key: number]: string } = {
  1: '♙', 2: '♘', 3: '♗', 4: '♖', 5: '♕', 6: '♔',
  7: '♟', 8: '♞', 9: '♝', 10: '♜', 11: '♛', 12: '♚'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface ChessBoardProps {
  gameState: GameState;
  onMove: (move: Move) => void;
  isPlayerWhite: boolean;
  disabled?: boolean;
  lastMove?: Move | null;
  showCoordinates?: boolean;
  highlightLegalMoves?: boolean;
}

export default function ChessBoard({
  gameState,
  onMove,
  isPlayerWhite,
  disabled = false,
  lastMove = null,
  showCoordinates = true,
  highlightLegalMoves = true,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [promotionMove, setPromotionMove] = useState<{ from: number; to: number } | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const { board, isWhiteTurn } = gameState;
  const isMyTurn = isWhiteTurn === isPlayerWhite;

  // Reset selection when turn changes
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [isWhiteTurn]);

  const handleSquareClick = useCallback((position: number) => {
    if (disabled || !isMyTurn) return;

    const piece = board[position];
    
    // If promotion dialog is open, ignore clicks
    if (promotionMove) return;

    // If a square is already selected
    if (selectedSquare !== null) {
      // If clicking the same square, deselect
      if (selectedSquare === position) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Check if this is a legal move
      const move = legalMoves.find(m => m.to === position);
      if (move) {
        // Check if this is a pawn promotion
        const movingPiece = board[selectedSquare];
        if (isPawn(movingPiece)) {
          const targetRow = getRow(position);
          if ((isWhitePiece(movingPiece) && targetRow === 0) || 
              (!isWhitePiece(movingPiece) && targetRow === 7)) {
            // Open promotion dialog
            setPromotionMove({ from: selectedSquare, to: position });
            return;
          }
        }
        
        onMove(move);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If clicking another piece of the same color, select it instead
      if (piece !== 0) {
        const clickedIsWhite = isWhitePiece(piece);
        if (clickedIsWhite === isPlayerWhite) {
          setSelectedSquare(position);
          const moves = getLegalMovesForSquare(gameState, position);
          setLegalMoves(moves);
          return;
        }
      }

      // Otherwise, deselect
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      // No square selected, try to select this one
      if (piece === 0) return; // Empty square

      const pieceIsWhite = isWhitePiece(piece);
      if (pieceIsWhite === isPlayerWhite) {
        setSelectedSquare(position);
        const moves = getLegalMovesForSquare(gameState, position);
        setLegalMoves(moves);
      }
    }
  }, [disabled, isMyTurn, board, selectedSquare, legalMoves, promotionMove, isPlayerWhite, gameState, onMove]);

  const handlePromotion = (pieceType: number) => {
    if (!promotionMove) return;
    
    const move = legalMoves.find(m => 
      m.from === promotionMove.from && 
      m.to === promotionMove.to && 
      m.promotion === pieceType
    );
    
    if (move) {
      onMove(move);
    }
    
    setPromotionMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleDragStart = (e: React.DragEvent, position: number) => {
    if (disabled || !isMyTurn) {
      e.preventDefault();
      return;
    }
    
    const piece = board[position];
    if (piece === 0) {
      e.preventDefault();
      return;
    }
    
    const pieceIsWhite = isWhitePiece(piece);
    if (pieceIsWhite !== isPlayerWhite) {
      e.preventDefault();
      return;
    }
    
    setDraggedPiece(position);
    setSelectedSquare(position);
    const moves = getLegalMovesForSquare(gameState, position);
    setLegalMoves(moves);
    
    // Set drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX && e.clientY) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    setDragPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    if (draggedPiece === null) return;
    
    handleSquareClick(position);
    setDraggedPiece(null);
    setDragPosition(null);
  };

  const renderSquare = (position: number, row: number, col: number) => {
    const piece = board[position];
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare === position;
    const legalMove = legalMoves.find(m => m.to === position);
    const isLegalMove = !!legalMove && highlightLegalMoves;
    const isLastMoveSquare = lastMove && (lastMove.from === position || lastMove.to === position);
    const isDragging = draggedPiece === position;
    const isCapture = isLegalMove && legalMove.captured;

    const squareClasses = [
      styles.square,
      isLight ? styles.light : styles.dark,
      isSelected && styles.selected,
      isLegalMove && styles.legalMove,
      isLastMoveSquare && styles.lastMove,
      isDragging && styles.dragging,
    ].filter(Boolean).join(' ');

    return (
      <div
        key={position}
        className={squareClasses}
        onClick={() => handleSquareClick(position)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, position)}
        data-position={position}
      >
        {piece !== 0 && !isDragging && (
          <div 
            className={`${styles.piece} ${piece <= 6 ? styles.white : styles.black}`}
            draggable={isMyTurn && !disabled && isWhitePiece(piece) === isPlayerWhite}
            onDragStart={(e) => handleDragStart(e as React.DragEvent<HTMLDivElement>, position)}
            onDrag={(e) => handleDrag(e as React.DragEvent<HTMLDivElement>)}
            onDragEnd={handleDragEnd}
          >
            {PIECE_SYMBOLS[piece]}
          </div>
        )}
        {isLegalMove && !isCapture && <div className={styles.moveIndicator} />}
        {isLegalMove && isCapture && <div className={styles.captureIndicator} />}
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

  const renderPromotionDialog = () => {
    if (!promotionMove) return null;
    
    const pieces = isPlayerWhite 
      ? [Piece.WQueen, Piece.WRook, Piece.WBishop, Piece.WKnight]
      : [Piece.BQueen, Piece.BRook, Piece.BBishop, Piece.BKnight];
    
    return (
      <div className={styles.promotionOverlay}>
        <div className={styles.promotionDialog}>
          <h3>Promote Pawn</h3>
          <div className={styles.promotionOptions}>
            {pieces.map(piece => (
              <button
                key={piece}
                className={`${styles.promotionPiece} ${piece <= 6 ? styles.white : styles.black}`}
                onClick={() => handlePromotion(piece)}
              >
                {PIECE_SYMBOLS[piece]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDraggedPiece = () => {
    if (draggedPiece === null || !dragPosition) return null;
    
    const piece = board[draggedPiece];
    
    return (
      <div 
        className={styles.draggedPiece}
        style={{
          left: dragPosition.x,
          top: dragPosition.y,
        }}
      >
        <span className={`${styles.piece} ${piece <= 6 ? styles.white : styles.black}`}>
          {PIECE_SYMBOLS[piece]}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.boardWrapper}>
        {showCoordinates && (
          <div className={styles.fileLabels}>
            {(isPlayerWhite ? FILES : [...FILES].reverse()).map(file => (
              <div key={file} className={styles.fileLabel}>{file}</div>
            ))}
          </div>
        )}

        <div className={styles.boardRow}>
          {showCoordinates && (
            <div className={styles.rankLabels}>
              {(isPlayerWhite ? RANKS : [...RANKS].reverse()).map(rank => (
                <div key={rank} className={styles.rankLabel}>{rank}</div>
              ))}
            </div>
          )}

          <div className={styles.board}>
            {renderBoard()}
          </div>
        </div>
      </div>

      {renderPromotionDialog()}
      {renderDraggedPiece()}
    </div>
  );
}
