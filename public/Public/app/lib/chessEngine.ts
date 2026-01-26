// Chess Engine - Complete implementation with all rules
// Piece values: 1=WPawn, 2=WKnight, 3=WBishop, 4=WRook, 5=WQueen, 6=WKing
//              7=BPawn, 8=BKnight, 9=BBishop, 10=BRook, 11=BQueen, 12=BKing, 0=Empty

export enum Piece {
  Empty = 0,
  WPawn = 1,
  WKnight = 2,
  WBishop = 3,
  WRook = 4,
  WQueen = 5,
  WKing = 6,
  BPawn = 7,
  BKnight = 8,
  BBishop = 9,
  BRook = 10,
  BQueen = 11,
  BKing = 12,
}

export enum GameStatus {
  Active = 'active',
  Check = 'check',
  Checkmate = 'checkmate',
  Stalemate = 'stalemate',
  Draw = 'draw',
}

export interface Move {
  from: number;
  to: number;
  piece: number;
  captured?: number;
  promotion?: number;
  isCastling?: boolean;
  isEnPassant?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
  capturedPiece?: number;
}

export interface GameState {
  board: number[];
  isWhiteTurn: boolean;
  castlingRights: {
    whiteKingside: boolean;
    whiteQueenside: boolean;
    blackKingside: boolean;
    blackQueenside: boolean;
  };
  enPassantSquare: number | null;
  halfMoveClock: number; // For 50-move rule
  fullMoveNumber: number;
  moveHistory: Move[];
  status: GameStatus;
  positionHistory: string[]; // For threefold repetition
}

// Helper functions
export function isWhitePiece(piece: number): boolean {
  return piece >= 1 && piece <= 6;
}

export function isBlackPiece(piece: number): boolean {
  return piece >= 7 && piece <= 12;
}

export function isPawn(piece: number): boolean {
  return piece === Piece.WPawn || piece === Piece.BPawn;
}

export function isKnight(piece: number): boolean {
  return piece === Piece.WKnight || piece === Piece.BKnight;
}

export function isBishop(piece: number): boolean {
  return piece === Piece.WBishop || piece === Piece.BBishop;
}

export function isRook(piece: number): boolean {
  return piece === Piece.WRook || piece === Piece.BRook;
}

export function isQueen(piece: number): boolean {
  return piece === Piece.WQueen || piece === Piece.BQueen;
}

export function isKing(piece: number): boolean {
  return piece === Piece.WKing || piece === Piece.BKing;
}

export function getRow(pos: number): number {
  return Math.floor(pos / 8);
}

export function getCol(pos: number): number {
  return pos % 8;
}

export function posFromRowCol(row: number, col: number): number {
  return row * 8 + col;
}

export function isValidPos(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Create initial board state
export function createInitialState(): GameState {
  const board = new Array(64).fill(0);
  
  // Black pieces (row 0-1)
  board[0] = Piece.BRook;
  board[1] = Piece.BKnight;
  board[2] = Piece.BBishop;
  board[3] = Piece.BQueen;
  board[4] = Piece.BKing;
  board[5] = Piece.BBishop;
  board[6] = Piece.BKnight;
  board[7] = Piece.BRook;
  
  for (let i = 8; i < 16; i++) {
    board[i] = Piece.BPawn;
  }
  
  // White pieces (row 6-7)
  for (let i = 48; i < 56; i++) {
    board[i] = Piece.WPawn;
  }
  
  board[56] = Piece.WRook;
  board[57] = Piece.WKnight;
  board[58] = Piece.WBishop;
  board[59] = Piece.WQueen;
  board[60] = Piece.WKing;
  board[61] = Piece.WBishop;
  board[62] = Piece.WKnight;
  board[63] = Piece.WRook;
  
  const state: GameState = {
    board,
    isWhiteTurn: true,
    castlingRights: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    },
    enPassantSquare: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    moveHistory: [],
    status: GameStatus.Active,
    positionHistory: [],
  };
  
  state.positionHistory.push(getBoardHash(state));
  
  return state;
}

// Generate board hash for repetition detection
function getBoardHash(state: GameState): string {
  return state.board.join(',') + '|' + state.isWhiteTurn + '|' + 
    JSON.stringify(state.castlingRights) + '|' + state.enPassantSquare;
}

// Find king position
export function findKing(board: number[], isWhite: boolean): number {
  const king = isWhite ? Piece.WKing : Piece.BKing;
  for (let i = 0; i < 64; i++) {
    if (board[i] === king) return i;
  }
  return -1;
}

// Check if a square is attacked by the opponent
export function isSquareAttacked(board: number[], pos: number, byWhite: boolean): boolean {
  const row = getRow(pos);
  const col = getCol(pos);
  
  // Check pawn attacks
  const pawn = byWhite ? Piece.WPawn : Piece.BPawn;
  const pawnDir = byWhite ? 1 : -1;
  const pawnRow = row + pawnDir;
  if (isValidPos(pawnRow, col - 1) && board[posFromRowCol(pawnRow, col - 1)] === pawn) return true;
  if (isValidPos(pawnRow, col + 1) && board[posFromRowCol(pawnRow, col + 1)] === pawn) return true;
  
  // Check knight attacks
  const knight = byWhite ? Piece.WKnight : Piece.BKnight;
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightMoves) {
    const nr = row + dr;
    const nc = col + dc;
    if (isValidPos(nr, nc) && board[posFromRowCol(nr, nc)] === knight) return true;
  }
  
  // Check king attacks
  const king = byWhite ? Piece.WKing : Piece.BKing;
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  for (const [dr, dc] of kingMoves) {
    const nr = row + dr;
    const nc = col + dc;
    if (isValidPos(nr, nc) && board[posFromRowCol(nr, nc)] === king) return true;
  }
  
  // Check sliding pieces (bishop, rook, queen)
  const bishop = byWhite ? Piece.WBishop : Piece.BBishop;
  const rook = byWhite ? Piece.WRook : Piece.BRook;
  const queen = byWhite ? Piece.WQueen : Piece.BQueen;
  
  // Diagonal directions (bishop, queen)
  const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diagonals) {
    let nr = row + dr;
    let nc = col + dc;
    while (isValidPos(nr, nc)) {
      const piece = board[posFromRowCol(nr, nc)];
      if (piece !== 0) {
        if (piece === bishop || piece === queen) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }
  
  // Straight directions (rook, queen)
  const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of straights) {
    let nr = row + dr;
    let nc = col + dc;
    while (isValidPos(nr, nc)) {
      const piece = board[posFromRowCol(nr, nc)];
      if (piece !== 0) {
        if (piece === rook || piece === queen) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }
  
  return false;
}

// Check if current player is in check
export function isInCheck(board: number[], isWhiteTurn: boolean): boolean {
  const kingPos = findKing(board, isWhiteTurn);
  return isSquareAttacked(board, kingPos, !isWhiteTurn);
}

// Generate pseudo-legal moves for a piece (doesn't check if leaves king in check)
function generatePseudoLegalMoves(state: GameState, pos: number): Move[] {
  const { board, isWhiteTurn, enPassantSquare, castlingRights } = state;
  const piece = board[pos];
  const moves: Move[] = [];
  
  if (piece === 0) return moves;
  
  const isWhite = isWhitePiece(piece);
  if (isWhite !== isWhiteTurn) return moves;
  
  const row = getRow(pos);
  const col = getCol(pos);
  
  const canCapture = (targetPiece: number): boolean => {
    if (targetPiece === 0) return false;
    return isWhite ? isBlackPiece(targetPiece) : isWhitePiece(targetPiece);
  };
  
  const addMove = (to: number, promotion?: number, isCastling?: boolean, isEnPassant?: boolean): void => {
    const captured = isEnPassant ? (isWhite ? Piece.BPawn : Piece.WPawn) : board[to];
    moves.push({
      from: pos,
      to,
      piece,
      captured: captured || undefined,
      promotion,
      isCastling,
      isEnPassant,
    });
  };
  
  // Pawn moves
  if (isPawn(piece)) {
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const promotionRow = isWhite ? 0 : 7;
    
    // Forward move
    const oneStep = pos + direction * 8;
    if (board[oneStep] === 0) {
      if (getRow(oneStep) === promotionRow) {
        // Promotion
        const promotions = isWhite 
          ? [Piece.WQueen, Piece.WRook, Piece.WBishop, Piece.WKnight]
          : [Piece.BQueen, Piece.BRook, Piece.BBishop, Piece.BKnight];
        for (const promo of promotions) {
          addMove(oneStep, promo);
        }
      } else {
        addMove(oneStep);
        
        // Two-step move from starting position
        if (row === startRow) {
          const twoStep = pos + direction * 16;
          if (board[twoStep] === 0) {
            addMove(twoStep);
          }
        }
      }
    }
    
    // Captures
    const captureTargets = [oneStep - 1, oneStep + 1];
    for (const target of captureTargets) {
      if (!isValidPos(getRow(target), getCol(target))) continue;
      if (Math.abs(getCol(target) - col) !== 1) continue;
      
      if (canCapture(board[target])) {
        if (getRow(target) === promotionRow) {
          const promotions = isWhite 
            ? [Piece.WQueen, Piece.WRook, Piece.WBishop, Piece.WKnight]
            : [Piece.BQueen, Piece.BRook, Piece.BBishop, Piece.BKnight];
          for (const promo of promotions) {
            addMove(target, promo);
          }
        } else {
          addMove(target);
        }
      }
      
      // En passant
      if (target === enPassantSquare) {
        addMove(target, undefined, false, true);
      }
    }
  }
  
  // Knight moves
  if (isKnight(piece)) {
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
      const nr = row + dr;
      const nc = col + dc;
      if (!isValidPos(nr, nc)) continue;
      const target = posFromRowCol(nr, nc);
      const targetPiece = board[target];
      if (targetPiece === 0 || canCapture(targetPiece)) {
        addMove(target);
      }
    }
  }
  
  // Bishop moves
  if (isBishop(piece) || isQueen(piece)) {
    const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagonals) {
      let nr = row + dr;
      let nc = col + dc;
      while (isValidPos(nr, nc)) {
        const target = posFromRowCol(nr, nc);
        const targetPiece = board[target];
        if (targetPiece === 0) {
          addMove(target);
        } else if (canCapture(targetPiece)) {
          addMove(target);
          break;
        } else {
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  }
  
  // Rook moves
  if (isRook(piece) || isQueen(piece)) {
    const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straights) {
      let nr = row + dr;
      let nc = col + dc;
      while (isValidPos(nr, nc)) {
        const target = posFromRowCol(nr, nc);
        const targetPiece = board[target];
        if (targetPiece === 0) {
          addMove(target);
        } else if (canCapture(targetPiece)) {
          addMove(target);
          break;
        } else {
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  }
  
  // King moves
  if (isKing(piece)) {
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    for (const [dr, dc] of kingMoves) {
      const nr = row + dr;
      const nc = col + dc;
      if (!isValidPos(nr, nc)) continue;
      const target = posFromRowCol(nr, nc);
      const targetPiece = board[target];
      if (targetPiece === 0 || canCapture(targetPiece)) {
        addMove(target);
      }
    }
    
    // Castling
    const inCheck = isSquareAttacked(board, pos, !isWhite);
    if (!inCheck) {
      // Kingside castling
      const canCastleKingside = isWhite ? castlingRights.whiteKingside : castlingRights.blackKingside;
      if (canCastleKingside) {
        const rookPos = isWhite ? 63 : 7;
        if (board[rookPos] === (isWhite ? Piece.WRook : Piece.BRook)) {
          const f = pos + 1;
          const g = pos + 2;
          if (board[f] === 0 && board[g] === 0) {
            if (!isSquareAttacked(board, f, !isWhite) && !isSquareAttacked(board, g, !isWhite)) {
              addMove(g, undefined, true);
            }
          }
        }
      }
      
      // Queenside castling
      const canCastleQueenside = isWhite ? castlingRights.whiteQueenside : castlingRights.blackQueenside;
      if (canCastleQueenside) {
        const rookPos = isWhite ? 56 : 0;
        if (board[rookPos] === (isWhite ? Piece.WRook : Piece.BRook)) {
          const d = pos - 1;
          const c = pos - 2;
          const b = pos - 3;
          if (board[d] === 0 && board[c] === 0 && board[b] === 0) {
            if (!isSquareAttacked(board, d, !isWhite) && !isSquareAttacked(board, c, !isWhite)) {
              addMove(c, undefined, true);
            }
          }
        }
      }
    }
  }
  
  return moves;
}

// Generate all legal moves for current player
export function generateLegalMoves(state: GameState): Move[] {
  const { board, isWhiteTurn } = state;
  const allMoves: Move[] = [];
  
  for (let pos = 0; pos < 64; pos++) {
    const piece = board[pos];
    if (piece === 0) continue;
    if (isWhiteTurn !== isWhitePiece(piece)) continue;
    
    const moves = generatePseudoLegalMoves(state, pos);
    
    // Filter moves that leave king in check
    for (const move of moves) {
      const newBoard = applyMoveToBoard(board, move);
      if (!isInCheck(newBoard, isWhiteTurn)) {
        // Check if move causes check or checkmate
        const opponentInCheck = isInCheck(newBoard, !isWhiteTurn);
        if (opponentInCheck) {
          move.isCheck = true;
          // Check for checkmate
          const tempState = { ...state, board: newBoard, isWhiteTurn: !isWhiteTurn };
          const opponentMoves = generateLegalMovesWithoutCheckmate(tempState);
          if (opponentMoves.length === 0) {
            move.isCheckmate = true;
          }
        }
        allMoves.push(move);
      }
    }
  }
  
  return allMoves;
}

// Generate legal moves without checking for checkmate (to avoid infinite recursion)
function generateLegalMovesWithoutCheckmate(state: GameState): Move[] {
  const { board, isWhiteTurn } = state;
  const allMoves: Move[] = [];
  
  for (let pos = 0; pos < 64; pos++) {
    const piece = board[pos];
    if (piece === 0) continue;
    if (isWhiteTurn !== isWhitePiece(piece)) continue;
    
    const moves = generatePseudoLegalMoves(state, pos);
    
    for (const move of moves) {
      const newBoard = applyMoveToBoard(board, move);
      if (!isInCheck(newBoard, isWhiteTurn)) {
        allMoves.push(move);
      }
    }
  }
  
  return allMoves;
}

// Get legal moves for a specific square
export function getLegalMovesForSquare(state: GameState, pos: number): Move[] {
  const moves = generatePseudoLegalMoves(state, pos);
  const { board, isWhiteTurn } = state;
  
  return moves.filter(move => {
    const newBoard = applyMoveToBoard(board, move);
    return !isInCheck(newBoard, isWhiteTurn);
  });
}

// Apply a move to a board (returns new board)
function applyMoveToBoard(board: number[], move: Move): number[] {
  const newBoard = [...board];
  const { from, to, piece, promotion, isCastling, isEnPassant } = move;
  
  // Move the piece
  newBoard[from] = 0;
  newBoard[to] = promotion || piece;
  
  // Handle en passant capture
  if (isEnPassant) {
    const capturedPawnPos = isWhitePiece(piece) ? to + 8 : to - 8;
    newBoard[capturedPawnPos] = 0;
  }
  
  // Handle castling
  if (isCastling) {
    if (to > from) {
      // Kingside castling
      const rookFrom = from + 3;
      const rookTo = from + 1;
      newBoard[rookFrom] = 0;
      newBoard[rookTo] = newBoard[from] === 0 ? (isWhitePiece(piece) ? Piece.WRook : Piece.BRook) : board[rookFrom];
    } else {
      // Queenside castling
      const rookFrom = from - 4;
      const rookTo = from - 1;
      newBoard[rookFrom] = 0;
      newBoard[rookTo] = isWhitePiece(piece) ? Piece.WRook : Piece.BRook;
    }
  }
  
  return newBoard;
}

// Make a move and return new game state
export function makeMove(state: GameState, move: Move): GameState {
  const newBoard = applyMoveToBoard(state.board, move);
  const isWhite = isWhitePiece(move.piece);
  
  // Update castling rights
  const newCastlingRights = { ...state.castlingRights };
  
  // King moves
  if (isKing(move.piece)) {
    if (isWhite) {
      newCastlingRights.whiteKingside = false;
      newCastlingRights.whiteQueenside = false;
    } else {
      newCastlingRights.blackKingside = false;
      newCastlingRights.blackQueenside = false;
    }
  }
  
  // Rook moves or captures
  if (move.from === 63 || move.to === 63) newCastlingRights.whiteKingside = false;
  if (move.from === 56 || move.to === 56) newCastlingRights.whiteQueenside = false;
  if (move.from === 7 || move.to === 7) newCastlingRights.blackKingside = false;
  if (move.from === 0 || move.to === 0) newCastlingRights.blackQueenside = false;
  
  // Update en passant square
  let newEnPassantSquare: number | null = null;
  if (isPawn(move.piece) && Math.abs(move.to - move.from) === 16) {
    newEnPassantSquare = (move.from + move.to) / 2;
  }
  
  // Update half-move clock (reset on pawn move or capture)
  const newHalfMoveClock = (isPawn(move.piece) || move.captured) ? 0 : state.halfMoveClock + 1;
  
  // Update full move number
  const newFullMoveNumber = state.isWhiteTurn ? state.fullMoveNumber : state.fullMoveNumber + 1;
  
  const newState: GameState = {
    board: newBoard,
    isWhiteTurn: !state.isWhiteTurn,
    castlingRights: newCastlingRights,
    enPassantSquare: newEnPassantSquare,
    halfMoveClock: newHalfMoveClock,
    fullMoveNumber: newFullMoveNumber,
    moveHistory: [...state.moveHistory, move],
    status: GameStatus.Active,
    positionHistory: [...state.positionHistory],
  };
  
  // Add position to history
  const posHash = getBoardHash(newState);
  newState.positionHistory.push(posHash);
  
  // Check game status
  newState.status = getGameStatus(newState);
  
  return newState;
}

// Get game status
export function getGameStatus(state: GameState): GameStatus {
  const { board, isWhiteTurn, halfMoveClock, positionHistory } = state;
  
  // Check for checkmate or stalemate
  const legalMoves = generateLegalMovesWithoutCheckmate(state);
  const inCheck = isInCheck(board, isWhiteTurn);
  
  if (legalMoves.length === 0) {
    if (inCheck) {
      return GameStatus.Checkmate;
    }
    return GameStatus.Stalemate;
  }
  
  if (inCheck) {
    return GameStatus.Check;
  }
  
  // 50-move rule
  if (halfMoveClock >= 100) {
    return GameStatus.Draw;
  }
  
  // Threefold repetition
  const posHash = getBoardHash(state);
  const repetitions = positionHistory.filter(h => h === posHash).length;
  if (repetitions >= 3) {
    return GameStatus.Draw;
  }
  
  // Insufficient material
  if (isInsufficientMaterial(board)) {
    return GameStatus.Draw;
  }
  
  return GameStatus.Active;
}

// Check for insufficient material
function isInsufficientMaterial(board: number[]): boolean {
  const pieces: number[] = [];
  
  for (const piece of board) {
    if (piece !== 0 && !isKing(piece)) {
      pieces.push(piece);
    }
  }
  
  // King vs King
  if (pieces.length === 0) return true;
  
  // King + Bishop/Knight vs King
  if (pieces.length === 1 && (isBishop(pieces[0]) || isKnight(pieces[0]))) return true;
  
  // King + Bishop vs King + Bishop (same color bishops)
  if (pieces.length === 2 && isBishop(pieces[0]) && isBishop(pieces[1])) {
    // Check if bishops are on same color squares
    let bishop1Pos = -1, bishop2Pos = -1;
    for (let i = 0; i < 64; i++) {
      if (isBishop(board[i])) {
        if (bishop1Pos === -1) bishop1Pos = i;
        else bishop2Pos = i;
      }
    }
    if (bishop1Pos !== -1 && bishop2Pos !== -1) {
      const square1Color = (getRow(bishop1Pos) + getCol(bishop1Pos)) % 2;
      const square2Color = (getRow(bishop2Pos) + getCol(bishop2Pos)) % 2;
      if (square1Color === square2Color) return true;
    }
  }
  
  return false;
}

// Undo the last move
export function undoMove(state: GameState): GameState {
  if (state.moveHistory.length === 0) return state;
  
  // For simplicity, we'll recreate the state from the beginning
  // In a production app, we'd store full state history
  let newState = createInitialState();
  const movesToReplay = state.moveHistory.slice(0, -1);
  
  for (const move of movesToReplay) {
    newState = makeMove(newState, move);
  }
  
  return newState;
}

// Convert move to algebraic notation
export function moveToAlgebraic(move: Move, _board: number[]): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  const fromFile = files[getCol(move.from)];
  const toFile = files[getCol(move.to)];
  const toRank = ranks[getRow(move.to)];
  
  // Castling
  if (move.isCastling) {
    return move.to > move.from ? 'O-O' : 'O-O-O';
  }
  
  let notation = '';
  
  // Piece symbol
  const pieceSymbols: { [key: number]: string } = {
    [Piece.WKnight]: 'N', [Piece.BKnight]: 'N',
    [Piece.WBishop]: 'B', [Piece.BBishop]: 'B',
    [Piece.WRook]: 'R', [Piece.BRook]: 'R',
    [Piece.WQueen]: 'Q', [Piece.BQueen]: 'Q',
    [Piece.WKing]: 'K', [Piece.BKing]: 'K',
  };
  
  if (!isPawn(move.piece)) {
    notation += pieceSymbols[move.piece] || '';
  }
  
  // For pawns, include file if capturing
  if (isPawn(move.piece) && move.captured) {
    notation += fromFile;
  }
  
  // Capture symbol
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

// Parse algebraic notation to find a move
export function parseAlgebraic(notation: string, state: GameState): Move | null {
  const legalMoves = generateLegalMoves(state);
  
  // Handle castling
  if (notation === 'O-O' || notation === '0-0') {
    return legalMoves.find(m => m.isCastling && m.to > m.from) || null;
  }
  if (notation === 'O-O-O' || notation === '0-0-0') {
    return legalMoves.find(m => m.isCastling && m.to < m.from) || null;
  }
  
  // Remove check/checkmate symbols
  notation = notation.replace(/[+#]/, '');
  
  // Try to match the notation to a legal move
  for (const move of legalMoves) {
    if (moveToAlgebraic(move, state.board).replace(/[+#]/, '') === notation) {
      return move;
    }
  }
  
  return null;
}

// Evaluate board position (simple material count)
export function evaluateBoard(board: number[]): number {
  const pieceValues: { [key: number]: number } = {
    [Piece.WPawn]: 100, [Piece.BPawn]: -100,
    [Piece.WKnight]: 320, [Piece.BKnight]: -320,
    [Piece.WBishop]: 330, [Piece.BBishop]: -330,
    [Piece.WRook]: 500, [Piece.BRook]: -500,
    [Piece.WQueen]: 900, [Piece.BQueen]: -900,
    [Piece.WKing]: 20000, [Piece.BKing]: -20000,
  };
  
  let score = 0;
  for (const piece of board) {
    score += pieceValues[piece] || 0;
  }
  
  return score;
}

// Create game state from FEN notation
export function createStateFromFEN(fen: string): GameState {
  const parts = fen.split(' ');
  const position = parts[0];
  const turn = parts[1] || 'w';
  const castling = parts[2] || '-';
  const enPassant = parts[3] || '-';
  const halfMove = parseInt(parts[4] || '0');
  const fullMove = parseInt(parts[5] || '1');

  const board: number[] = new Array(64).fill(0);
  
  // Parse position
  const rows = position.split('/');
  let square = 0;
  
  for (const row of rows) {
    for (const char of row) {
      if (char >= '1' && char <= '8') {
        square += parseInt(char);
      } else {
        const piece = fenCharToPiece(char);
        board[square] = piece;
        square++;
      }
    }
  }

  // Parse castling rights
  const castlingRights = {
    whiteKingside: castling.includes('K'),
    whiteQueenside: castling.includes('Q'),
    blackKingside: castling.includes('k'),
    blackQueenside: castling.includes('q'),
  };

  // Parse en passant
  let enPassantSquare: number | null = null;
  if (enPassant !== '-') {
    const file = enPassant.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = 8 - parseInt(enPassant[1]);
    enPassantSquare = rank * 8 + file;
  }

  return {
    board,
    isWhiteTurn: turn === 'w',
    castlingRights,
    enPassantSquare,
    halfMoveClock: halfMove,
    fullMoveNumber: fullMove,
    moveHistory: [],
    status: GameStatus.Active,
    positionHistory: [],
  };
}

// Convert FEN character to piece number
function fenCharToPiece(char: string): number {
  const pieces: { [key: string]: number } = {
    'P': Piece.WPawn, 'N': Piece.WKnight, 'B': Piece.WBishop,
    'R': Piece.WRook, 'Q': Piece.WQueen, 'K': Piece.WKing,
    'p': Piece.BPawn, 'n': Piece.BKnight, 'b': Piece.BBishop,
    'r': Piece.BRook, 'q': Piece.BQueen, 'k': Piece.BKing,
  };
  return pieces[char] || 0;
}

// Convert move to UCI notation (e.g., "e2e4")
export function moveToUCI(move: Move): string {
  const fromFile = String.fromCharCode(97 + (move.from % 8));
  const fromRank = 8 - Math.floor(move.from / 8);
  const toFile = String.fromCharCode(97 + (move.to % 8));
  const toRank = 8 - Math.floor(move.to / 8);
  
  let uci = `${fromFile}${fromRank}${toFile}${toRank}`;
  
  // Add promotion piece if applicable
  if (move.promotion) {
    const promotionPieces: { [key: number]: string } = {
      [Piece.WQueen]: 'q', [Piece.BQueen]: 'q',
      [Piece.WRook]: 'r', [Piece.BRook]: 'r',
      [Piece.WBishop]: 'b', [Piece.BBishop]: 'b',
      [Piece.WKnight]: 'n', [Piece.BKnight]: 'n',
    };
    uci += promotionPieces[move.promotion] || 'q';
  }
  
  return uci;
}

// Parse UCI notation to move (requires game state for context)
export function uciToMove(uci: string, state: GameState): Move | null {
  if (uci.length < 4) return null;
  
  const fromFile = uci.charCodeAt(0) - 97;
  const fromRank = 8 - parseInt(uci[1]);
  const toFile = uci.charCodeAt(2) - 97;
  const toRank = 8 - parseInt(uci[3]);
  
  const from = fromRank * 8 + fromFile;
  const to = toRank * 8 + toFile;
  
  const piece = state.board[from];
  const capturedPiece = state.board[to];
  
  const move: Move = {
    from,
    to,
    piece,
    capturedPiece,
  };
  
  // Check for promotion
  if (uci.length === 5) {
    const promotionChar = uci[4];
    const isWhite = isWhitePiece(piece);
    const promotionPieces: { [key: string]: number } = {
      'q': isWhite ? Piece.WQueen : Piece.BQueen,
      'r': isWhite ? Piece.WRook : Piece.BRook,
      'b': isWhite ? Piece.WBishop : Piece.BBishop,
      'n': isWhite ? Piece.WKnight : Piece.BKnight,
    };
    move.promotion = promotionPieces[promotionChar];
  }
  
  return move;
}

// Export PieceType for backward compatibility
export const PieceType = Piece;
