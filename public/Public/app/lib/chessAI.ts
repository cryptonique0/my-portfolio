// Simple Chess AI with Minimax and Alpha-Beta Pruning
import {
  GameState,
  Move,
  generateLegalMoves,
  makeMove,
  isWhitePiece,
  getRow,
  getCol,
  Piece,
  isPawn,
  isKnight,
  isBishop,
  isRook,
  isQueen,
  isKing,
  GameStatus,
} from './chessEngine';

export type Difficulty = 'easy' | 'medium' | 'hard';

// Piece-square tables for positional evaluation
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
  0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDDLE_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

const KING_END_TABLE = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50
];

// Get piece-square table value
function getPieceSquareValue(piece: number, pos: number, isEndgame: boolean): number {
  const isWhite = isWhitePiece(piece);
  // Mirror position for black pieces
  const tablePos = isWhite ? pos : (7 - getRow(pos)) * 8 + getCol(pos);
  
  let value = 0;
  
  if (isPawn(piece)) {
    value = PAWN_TABLE[tablePos];
  } else if (isKnight(piece)) {
    value = KNIGHT_TABLE[tablePos];
  } else if (isBishop(piece)) {
    value = BISHOP_TABLE[tablePos];
  } else if (isRook(piece)) {
    value = ROOK_TABLE[tablePos];
  } else if (isQueen(piece)) {
    value = QUEEN_TABLE[tablePos];
  } else if (isKing(piece)) {
    value = isEndgame ? KING_END_TABLE[tablePos] : KING_MIDDLE_TABLE[tablePos];
  }
  
  return isWhite ? value : -value;
}

// Check if in endgame
function isEndgame(board: number[]): boolean {
  let queenCount = 0;
  let minorPieceCount = 0;
  
  for (const piece of board) {
    if (isQueen(piece)) queenCount++;
    if (isKnight(piece) || isBishop(piece) || isRook(piece)) minorPieceCount++;
  }
  
  return queenCount === 0 || (queenCount <= 2 && minorPieceCount <= 4);
}

// Advanced evaluation function
function advancedEvaluate(state: GameState): number {
  const { board, status } = state;
  
  // Check for game-ending states
  if (status === GameStatus.Checkmate) {
    return state.isWhiteTurn ? -100000 : 100000;
  }
  if (status === GameStatus.Stalemate || status === GameStatus.Draw) {
    return 0;
  }
  
  let score = 0;
  const endgame = isEndgame(board);
  
  // Material and positional evaluation
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece === 0) continue;
    
    // Material value
    const pieceValues: { [key: number]: number } = {
      [Piece.WPawn]: 100, [Piece.BPawn]: -100,
      [Piece.WKnight]: 320, [Piece.BKnight]: -320,
      [Piece.WBishop]: 330, [Piece.BBishop]: -330,
      [Piece.WRook]: 500, [Piece.BRook]: -500,
      [Piece.WQueen]: 900, [Piece.BQueen]: -900,
      [Piece.WKing]: 20000, [Piece.BKing]: -20000,
    };
    
    score += pieceValues[piece] || 0;
    
    // Positional value
    score += getPieceSquareValue(piece, i, endgame);
  }
  
  // Mobility bonus
  const currentMoves = generateLegalMoves(state);
  const mobilityBonus = currentMoves.length * 2;
  score += state.isWhiteTurn ? mobilityBonus : -mobilityBonus;
  
  return score;
}

// Order moves for better alpha-beta pruning
function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    // Prioritize captures
    const aCapture = a.captured ? 1000 + (a.captured % 6) * 10 : 0;
    const bCapture = b.captured ? 1000 + (b.captured % 6) * 10 : 0;
    
    // Prioritize promotions
    const aPromo = a.promotion ? 800 : 0;
    const bPromo = b.promotion ? 800 : 0;
    
    // Prioritize checks
    const aCheck = a.isCheck ? 500 : 0;
    const bCheck = b.isCheck ? 500 : 0;
    
    return (bCapture + bPromo + bCheck) - (aCapture + aPromo + aCheck);
  });
}

// Minimax with Alpha-Beta Pruning
function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || state.status === GameStatus.Checkmate || 
      state.status === GameStatus.Stalemate || state.status === GameStatus.Draw) {
    return advancedEvaluate(state);
  }
  
  const moves = orderMoves(generateLegalMoves(state));
  
  if (moves.length === 0) {
    return advancedEvaluate(state);
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = makeMove(state, move);
      const evaluation = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = makeMove(state, move);
      const evaluation = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Get search depth based on difficulty
function getSearchDepth(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    default: return 2;
  }
}

// Add some randomness for easier difficulties
function addRandomness(moves: { move: Move; score: number }[], difficulty: Difficulty): { move: Move; score: number }[] {
  if (difficulty === 'hard') return moves;
  
  const randomFactor = difficulty === 'easy' ? 200 : 100;
  
  return moves.map(m => ({
    move: m.move,
    score: m.score + (Math.random() - 0.5) * randomFactor
  }));
}

// Main AI function to get the best move
export function getBestMove(state: GameState, difficulty: Difficulty = 'medium'): Move | null {
  const moves = generateLegalMoves(state);
  
  if (moves.length === 0) return null;
  
  const depth = getSearchDepth(difficulty);
  const isMaximizing = state.isWhiteTurn;
  
  let scoredMoves = moves.map(move => {
    const newState = makeMove(state, move);
    const score = minimax(newState, depth - 1, -Infinity, Infinity, !isMaximizing);
    return { move, score };
  });
  
  // Add randomness for easier difficulties
  scoredMoves = addRandomness(scoredMoves, difficulty);
  
  // Sort by score
  scoredMoves.sort((a, b) => isMaximizing ? b.score - a.score : a.score - b.score);
  
  // For easy mode, sometimes pick a suboptimal move
  if (difficulty === 'easy' && scoredMoves.length > 3 && Math.random() < 0.3) {
    const randomIndex = Math.floor(Math.random() * Math.min(5, scoredMoves.length));
    return scoredMoves[randomIndex].move;
  }
  
  return scoredMoves[0].move;
}

// Get a random move (for testing)
export function getRandomMove(state: GameState): Move | null {
  const moves = generateLegalMoves(state);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Analyze position and get top moves with evaluations
export function analyzePosition(state: GameState, numMoves: number = 3): { move: Move; score: number }[] {
  const moves = generateLegalMoves(state);
  
  const scoredMoves = moves.map(move => {
    const newState = makeMove(state, move);
    const score = minimax(newState, 2, -Infinity, Infinity, !state.isWhiteTurn);
    return { move, score };
  });
  
  scoredMoves.sort((a, b) => state.isWhiteTurn ? b.score - a.score : a.score - b.score);
  
  return scoredMoves.slice(0, numMoves);
}
