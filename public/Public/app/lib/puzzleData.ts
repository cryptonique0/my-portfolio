// Chess Puzzles Database
export interface ChessPuzzle {
  id: number;
  fen: string;
  moves: string[]; // UCI format moves
  theme: number; // 0-9 matching contract enum
  difficulty: number; // 0-4 matching contract enum
  rating: number;
  description: string;
}

export const PUZZLE_THEMES = [
  'Checkmate',
  'Tactics',
  'Endgame',
  'Opening',
  'Middlegame',
  'Trapped Piece',
  'Fork',
  'Pin',
  'Skewer',
  'Discovery'
];

export const PUZZLE_DIFFICULTIES = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master'
];

// Curated puzzle collection
export const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['f3g5', 'd7d5', 'g5f7', 'e8f7', 'd1f3'], // Fried Liver Attack
    theme: 1, // Tactics
    difficulty: 1, // Intermediate
    rating: 1400,
    description: 'White to move. Win material with a knight sacrifice.'
  },
  {
    id: 2,
    fen: 'r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    moves: ['f3g5', 'c6e7', 'c4f7'], // Scholar's Mate variation
    theme: 0, // Checkmate
    difficulty: 0, // Beginner
    rating: 1200,
    description: 'White to move. Find the checkmate pattern.'
  },
  {
    id: 3,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    moves: ['f1c4', 'f8c5', 'c2c3', 'd8e7', 'd2d4'], // Italian Game
    theme: 3, // Opening
    difficulty: 1, // Intermediate  
    rating: 1500,
    description: 'White to move. Develop with tempo and control the center.'
  },
  {
    id: 4,
    fen: '8/8/8/4k3/8/3K4/6R1/8 w - - 0 1',
    moves: ['g2g5', 'e5f6', 'g5g6', 'f6e7', 'd3e3'], // Rook endgame
    theme: 2, // Endgame
    difficulty: 2, // Advanced
    rating: 1700,
    description: 'White to move. Cut off the king and win.'
  },
  {
    id: 5,
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8',
    moves: ['c3d5', 'f6d5', 'c4d5'], // Knight fork
    theme: 6, // Fork
    difficulty: 1, // Intermediate
    rating: 1450,
    description: 'White to move. Win a piece with a knight fork.'
  },
  {
    id: 6,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4',
    moves: ['f6g4', 'e1g1', 'g4e3'], // Traxler Counterattack
    theme: 1, // Tactics
    difficulty: 2, // Advanced
    rating: 1650,
    description: 'Black to move. Sacrifice a knight for a powerful attack.'
  },
  {
    id: 7,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6',
    moves: ['c1g5', 'h7h6', 'g5h4', 'g7g5', 'f3g5'], // Pin
    theme: 7, // Pin
    difficulty: 1, // Intermediate
    rating: 1400,
    description: 'White to move. Exploit the pin on the knight.'
  },
  {
    id: 8,
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    moves: ['c6d4', 'f3d4', 'd8g5'], // Traxler
    theme: 1, // Tactics
    difficulty: 1, // Intermediate
    rating: 1500,
    description: 'Black to move. Win the game with tactical blows.'
  },
  {
    id: 9,
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    moves: ['e1e8', 'g8h7', 'e8e7'], // Back rank mate threat
    theme: 0, // Checkmate
    difficulty: 0, // Beginner
    rating: 1100,
    description: 'White to move. Invade the back rank.'
  },
  {
    id: 10,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 0 5',
    moves: ['f1c4', 'f8c5', 'e1g1', 'd7d6', 'c2c3'], // Italian opening
    theme: 3, // Opening
    difficulty: 1, // Intermediate
    rating: 1450,
    description: 'White to move. Continue developing smoothly.'
  },
  {
    id: 11,
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    moves: ['f3e5', 'd7d6', 'e5f3', 'f6e4'], // Petrov Defense
    theme: 3, // Opening
    difficulty: 2, // Advanced
    rating: 1600,
    description: 'White to move. Find the key defensive resource.'
  },
  {
    id: 12,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 5',
    moves: ['c6d4', 'f3d4', 'c5d4'], // Discovered attack
    theme: 9, // Discovery
    difficulty: 1, // Intermediate
    rating: 1500,
    description: 'Black to move. Use a discovered attack to win material.'
  },
  {
    id: 13,
    fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P1b1/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 7',
    moves: ['c4f7', 'e8f7', 'c3e4'], // Skewer
    theme: 8, // Skewer
    difficulty: 2, // Advanced
    rating: 1650,
    description: 'White to move. Win the queen with a skewer.'
  },
  {
    id: 14,
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 5',
    moves: ['c4f7', 'e8f7', 'f3e5'], // Trapped piece
    theme: 5, // Trapped Piece
    difficulty: 1, // Intermediate
    rating: 1400,
    description: 'White to move. The black knight is trapped.'
  },
  {
    id: 15,
    fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
    moves: ['e1f2', 'e8d7', 'f2f3', 'd7e7', 'f3g4'], // King and pawn endgame
    theme: 2, // Endgame
    difficulty: 0, // Beginner
    rating: 1000,
    description: 'White to move. Support your pawn to promotion.'
  },
  {
    id: 16,
    fen: 'r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 5',
    moves: ['d7d5', 'e4d5', 'c6d4'], // Middlegame tactics
    theme: 4, // Middlegame
    difficulty: 2, // Advanced
    rating: 1700,
    description: 'Black to move. Break open the center.'
  },
  {
    id: 17,
    fen: '2kr3r/ppp2ppp/2n5/3q4/3P4/2N5/PPP2PPP/R3R1K1 w - - 0 15',
    moves: ['e1e8', 'd8d1', 'e8d8'], // Back rank checkmate
    theme: 0, // Checkmate
    difficulty: 1, // Intermediate
    rating: 1500,
    description: 'White to move. Force checkmate on the back rank.'
  },
  {
    id: 18,
    fen: 'r1b1kb1r/pppp1ppp/2n2q2/4p3/2B1n3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 2 6',
    moves: ['d1d2', 'e4f2', 'e1f2'], // Defensive tactics
    theme: 1, // Tactics
    difficulty: 2, // Advanced
    rating: 1750,
    description: 'White to move. Defend against the threats accurately.'
  },
  {
    id: 19,
    fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP1QPPP/R4RK1 w - - 0 11',
    moves: ['g5f6', 'e7f6', 'c4f7'], // Removing the defender
    theme: 1, // Tactics
    difficulty: 3, // Expert
    rating: 1900,
    description: 'White to move. Remove the defender and win.'
  },
  {
    id: 20,
    fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    moves: ['b4h4', 'h5h4', 'b5b6'], // Rook endgame
    theme: 2, // Endgame
    difficulty: 3, // Expert
    rating: 2000,
    description: 'White to move. Trade rooks and push the passed pawn.'
  }
];

// Get puzzle by ID
export function getPuzzleById(id: number): ChessPuzzle | undefined {
  return CHESS_PUZZLES.find(p => p.id === id);
}

// Get puzzles by theme
export function getPuzzlesByTheme(theme: number): ChessPuzzle[] {
  return CHESS_PUZZLES.filter(p => p.theme === theme);
}

// Get puzzles by difficulty
export function getPuzzlesByDifficulty(difficulty: number): ChessPuzzle[] {
  return CHESS_PUZZLES.filter(p => p.difficulty === difficulty);
}

// Get random puzzle
export function getRandomPuzzle(): ChessPuzzle {
  return CHESS_PUZZLES[Math.floor(Math.random() * CHESS_PUZZLES.length)];
}

// Get random puzzle by rating range
export function getPuzzleByRating(minRating: number, maxRating: number): ChessPuzzle | undefined {
  const filtered = CHESS_PUZZLES.filter(p => p.rating >= minRating && p.rating <= maxRating);
  return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : undefined;
}
