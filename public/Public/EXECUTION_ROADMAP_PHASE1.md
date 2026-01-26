# 28-Commit Execution Roadmap

## How to Use This Guide

For **each commit**, you'll find:
- **What to add** - Exact files to create
- **Why it matters** - Business/technical value
- **How to structure it** - Code snippets or templates
- **Git command** - Exact commit message
- **Estimated time** - How long this takes
- **Dependencies** - Which other commits should come first

---

# PHASE 1: FOUNDATION (10 commits) - Days 1-2

## COMMIT 1: Complete Environment Variables Guide
**Time:** 15 minutes  
**Why:** Maintainers can't run the app without knowing what env vars are needed.

**Files to create:**
```
.env.example          ← NEW: Complete, documented environment file
docs/ENVIRONMENT.md   ← NEW: Setup instructions
```

**`.env.example` content:**
```dotenv
# Google Gemini AI Configuration
GOOGLE_API_KEY=your_gemini_api_key_here
# Get from: https://ai.google.dev/

# Smart Contract Addresses (Base Mainnet)
NEXT_PUBLIC_CHESS_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHESS_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHESS_ACADEMY_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHESS_COACH_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHESS_PUZZLES_ADDRESS=0x0000000000000000000000000000000000000000

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Contract Deployment
PRIVATE_KEY=your_private_key_here
# ⚠️ NEVER commit this to version control!

# Block Explorer API
BASESCAN_API_KEY=your_basescan_api_key

# Application Configuration
NEXT_PUBLIC_PROJECT_NAME=Base Chess
NEXT_PUBLIC_URL=http://localhost:3000
# Update to production URL when deployed

# Features (optional)
NEXT_PUBLIC_ENABLE_DAILY_LEADERBOARD=true
NEXT_PUBLIC_ENABLE_PUZZLE_TRAINING=true
NEXT_PUBLIC_ENABLE_AI_OPPONENT=true
```

**`docs/ENVIRONMENT.md` content:**
```markdown
# Environment Configuration

## Local Development Setup

### 1. Create .env.local
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 2. Fill in Required Variables

#### Google Gemini API Key (REQUIRED)
1. Visit https://ai.google.dev/
2. Click "Get API Key"
3. Create new API key
4. Add to `.env.local`:
```
GOOGLE_API_KEY=abc123def456
```

#### Smart Contract Addresses
After deploying contracts, update:
```
NEXT_PUBLIC_CHESS_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHESS_FACTORY_ADDRESS=0x...
```

#### For Testing on Base Sepolia
```
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_test_account_private_key
```

### 3. Start Development
```bash
npm run dev
```

## Environment Variables Reference

See `.env.example` for all available variables.
```

**Git command:**
```bash
git add .env.example docs/ENVIRONMENT.md
git commit -m "docs: Add comprehensive environment variables guide and example file"
```

---

## COMMIT 2: TypeScript Type Definitions - Core Types
**Time:** 30 minutes  
**Why:** Scattered TypeScript types make code hard to understand. Centralize them.

**Files to create:**
```
app/types/index.ts         ← NEW: Main type export
app/types/chess.ts         ← NEW: Chess game types
app/types/contracts.ts     ← NEW: Smart contract types
app/types/api.ts           ← NEW: API request/response types
```

**`app/types/chess.ts` content:**
```typescript
/**
 * Chess Game Types
 * Centralized type definitions for chess-related data structures
 */

export enum ChessPiece {
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
  Abandoned = 'abandoned',
}

export interface ChessMove {
  from: number;        // 0-63 (board square)
  to: number;          // 0-63 (board square)
  piece: ChessPiece;   // Moving piece
  captured?: ChessPiece;
  promotion?: ChessPiece;
  isCastling?: boolean;
  isEnPassant?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
  timestamp?: number;
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
  halfMoveClock: number;
  fullMoveNumber: number;
  moveHistory: ChessMove[];
  status: GameStatus;
  positionHistory: string[];
}

export interface Difficulty {
  level: 'easy' | 'medium' | 'hard';
  temperature: number;
  maxThinkingTime: number;
}

export type PieceColor = 'white' | 'black';
```

**`app/types/contracts.ts` content:**
```typescript
/**
 * Smart Contract Types
 * Response types and data structures from blockchain interactions
 */

export interface GameInfo {
  gameId: number;
  whitePlayer: string;
  blackPlayer: string;
  board: number[];
  whiteTurn: boolean;
  state: GameState;
  wager: string;
  moveCount: number;
  startTime: number;
  lastMoveTime: number;
}

export enum GameState {
  Active = 0,
  WhiteWon = 1,
  BlackWon = 2,
  Draw = 3,
  Abandoned = 4,
}

export interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  puzzlesSolved: number;
  averageTime: number;
  lastUpdated: number;
}

export interface PuzzleData {
  id: number;
  rating: number;
  moves: number;
  completed: boolean;
  timeSpent: number;
}

export interface CoachProfile {
  address: string;
  name: string;
  rating: number;
  hourlyRate: string;
  specialty: string;
  bio: string;
}
```

**`app/types/api.ts` content:**
```typescript
/**
 * API Request/Response Types
 * Types for all API endpoints
 */

export interface AIMoveRequest {
  gameState: any;
  difficulty: 'easy' | 'medium' | 'hard';
  legalMoves?: number[];
}

export interface AIMoveResponse {
  move: {
    from: number;
    to: number;
  };
  reasoning?: string;
  thinkingTime?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}
```

**`app/types/index.ts` content:**
```typescript
// Export all types from submodules for easy access
export * from './chess';
export * from './contracts';
export * from './api';

// Common utility types
export type Optional<T> = T | null | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type Callback<T = void> = (data: T) => void;
```

**Git command:**
```bash
git add app/types/
git commit -m "feat: Centralize TypeScript type definitions into dedicated module"
```

---

## COMMIT 3: Application Constants
**Time:** 25 minutes  
**Why:** Magic numbers scattered everywhere. Extract to single source of truth.

**Files to create:**
```
app/lib/constants.ts      ← NEW: All application constants
docs/CONSTANTS.md         ← NEW: Constants reference guide
```

**`app/lib/constants.ts` content:**
```typescript
/**
 * Application Constants
 * Single source of truth for all application-wide values
 */

// ============================================================================
// CHESS GAME CONSTANTS
// ============================================================================

export const CHESS = {
  BOARD_SIZE: 8,
  BOARD_SQUARES: 64,
  
  // Piece values for evaluation
  PIECE_VALUES: {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0, // King is invaluable
  },

  // Move limits and timing
  MOVE_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  AI_RESPONSE_TIMEOUT_MS: 7000, // 7 seconds
  
  // Game rules
  FIFTY_MOVE_RULE: 50,
  THREEFOLD_REPETITION: 3,
} as const;

// ============================================================================
// API CONSTANTS
// ============================================================================

export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  TIMEOUT_MS: 7000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,

  ENDPOINTS: {
    AI_MOVE: '/api/ai-move',
  },
} as const;

// ============================================================================
// BLOCKCHAIN CONSTANTS
// ============================================================================

export const BLOCKCHAIN = {
  // Network IDs
  NETWORKS: {
    BASE_MAINNET: 8453,
    BASE_SEPOLIA: 84532,
  },

  // RPC URLs
  RPC_URLS: {
    base: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    baseSepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
  },

  // Contract Addresses
  ADDRESSES: {
    chess: process.env.NEXT_PUBLIC_CHESS_CONTRACT_ADDRESS || '',
    factory: process.env.NEXT_PUBLIC_CHESS_FACTORY_ADDRESS || '',
    academy: process.env.NEXT_PUBLIC_CHESS_ACADEMY_ADDRESS || '',
    coach: process.env.NEXT_PUBLIC_CHESS_COACH_ADDRESS || '',
    puzzles: process.env.NEXT_PUBLIC_CHESS_PUZZLES_ADDRESS || '',
  },
} as const;

// ============================================================================
// AI / DIFFICULTY SETTINGS
// ============================================================================

export const AI_CONFIG = {
  EASY: {
    temperature: 1.2,
    maxTokens: 200,
    description: 'Beginner level - Makes simple moves',
  },
  MEDIUM: {
    temperature: 0.7,
    maxTokens: 200,
    description: 'Intermediate - Balanced tactical play',
  },
  HARD: {
    temperature: 0.3,
    maxTokens: 200,
    description: 'Expert level - Deep strategic analysis',
  },
} as const;

// ============================================================================
// UI / DISPLAY CONSTANTS
// ============================================================================

export const UI = {
  BOARD_SIZE_PX: 400,
  SQUARE_SIZE_PX: 50,
  ANIMATION_DURATION_MS: 300,

  // Responsive breakpoints
  BREAKPOINTS: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  DAILY_LEADERBOARD: process.env.NEXT_PUBLIC_ENABLE_DAILY_LEADERBOARD !== 'false',
  PUZZLE_TRAINING: process.env.NEXT_PUBLIC_ENABLE_PUZZLE_TRAINING !== 'false',
  AI_OPPONENT: process.env.NEXT_PUBLIC_ENABLE_AI_OPPONENT !== 'false',
  COACH_MARKETPLACE: true,
  ONLINE_MULTIPLAYER: true,
} as const;
```

**Git command:**
```bash
git add app/lib/constants.ts docs/CONSTANTS.md
git commit -m "feat: Extract application constants to centralized module"
```

---

## COMMIT 4: Global Type Enums
**Time:** 20 minutes  
**Why:** Enums are scattered across multiple files. Centralize for consistency.

**Files to create:**
```
app/lib/enums.ts      ← NEW: All application enums
```

**`app/lib/enums.ts` content:**
```typescript
/**
 * Application Enums
 * Centralized enumeration types for consistent type safety
 */

export enum ChessPiece {
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
  Abandoned = 'abandoned',
}

export enum GameResult {
  WhiteWon = 'whiteWon',
  BlackWon = 'blackWon',
  Draw = 'draw',
  Abandoned = 'abandoned',
}

export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export enum PlayerColor {
  White = 'white',
  Black = 'black',
}

export enum SquareColor {
  Light = 'light',
  Dark = 'dark',
}

export enum PieceType {
  Pawn = 'pawn',
  Knight = 'knight',
  Bishop = 'bishop',
  Rook = 'rook',
  Queen = 'queen',
  King = 'king',
}

export enum GameMode {
  SinglePlayer = 'singlePlayer',
  LocalMultiplayer = 'localMultiplayer',
  OnlineMultiplayer = 'onlineMultiplayer',
  PuzzleTraining = 'puzzleTraining',
  LearningPath = 'learningPath',
}

export enum ErrorCode {
  InvalidMove = 'INVALID_MOVE',
  GameNotFound = 'GAME_NOT_FOUND',
  NotYourTurn = 'NOT_YOUR_TURN',
  AIError = 'AI_ERROR',
  ContractError = 'CONTRACT_ERROR',
  NetworkError = 'NETWORK_ERROR',
  ValidationError = 'VALIDATION_ERROR',
}

export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum LeaderboardPeriod {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  AllTime = 'allTime',
}
```

**Git command:**
```bash
git add app/lib/enums.ts
git commit -m "feat: Centralize enums for game statuses and piece types"
```

---

## COMMIT 5: Error Handling Utilities
**Time:** 30 minutes  
**Why:** API has basic try/catch. Need structured, reusable error handling.

**Files to create:**
```
app/lib/errors.ts        ← NEW: Custom error classes
app/lib/errorHandler.ts  ← NEW: Error handling utilities
```

**`app/lib/errors.ts` content:**
```typescript
/**
 * Custom Error Classes
 * Structured error handling for different error scenarios
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class ChessError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CHESS_ERROR', 400, details);
    this.name = 'ChessError';
  }
}

export class AIError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'AI_ERROR', 500, details);
    this.name = 'AIError';
  }
}

export class ContractError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CONTRACT_ERROR', 500, details);
    this.name = 'ContractError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', 503, details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string) {
    super(`${operation} timed out`, 'TIMEOUT', 504);
    this.name = 'TimeoutError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
```

**`app/lib/errorHandler.ts` content:**
```typescript
/**
 * Error Handling Utilities
 * Standardized error handling across the application
 */

import { AppError, isAppError } from './errors';
import { logger } from './logger';

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  };
  timestamp: number;
}

export function handleError(error: unknown, context?: string): ErrorResponse {
  let appError: AppError;

  if (isAppError(error)) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(error.message, 'UNKNOWN_ERROR', 500);
  } else {
    appError = new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500);
  }

  // Log the error with context
  logger.error(appError.message, {
    code: appError.code,
    statusCode: appError.statusCode,
    details: appError.details,
    context,
  });

  return {
    success: false,
    error: {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      details: appError.details,
    },
    timestamp: Date.now(),
  };
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return 'An unknown error occurred';
  }
}

export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}

export function getStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
}
```

**Git command:**
```bash
git add app/lib/errors.ts app/lib/errorHandler.ts
git commit -m "feat: Add structured error handling with custom error classes"
```

---

## COMMIT 6: Logging Utilities
**Time:** 25 minutes  
**Why:** console.log scattered everywhere. Need structured, consistent logging.

**Files to create:**
```
app/lib/logger.ts     ← NEW: Logging utility
```

**`app/lib/logger.ts` content:**
```typescript
/**
 * Structured Logging Utility
 * Provides consistent, structured logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  duration?: number;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, duration } = entry;
    let log = `[${timestamp}] ${level.toUpperCase()} - ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      log += ` | ${JSON.stringify(context)}`;
    }
    
    if (duration !== undefined) {
      log += ` (${duration}ms)`;
    }
    
    return log;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, duration?: number) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      duration,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case 'debug':
        console.debug(formatted, context || '');
        break;
      case 'info':
        console.info(formatted, context || '');
        break;
      case 'warn':
        console.warn(formatted, context || '');
        break;
      case 'error':
        console.error(formatted, context || '');
        break;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  time(label: string) {
    return {
      end: (additionalContext?: Record<string, any>) => {
        const duration = Date.now() - startTime;
        const context = {
          ...additionalContext,
          duration,
        };
        this.info(`${label} completed`, context);
        return duration;
      },
    };
  }
}

const startTime = Date.now();

export const logger = new Logger();

// Export for testing
export { Logger };
```

**Git command:**
```bash
git add app/lib/logger.ts
git commit -m "feat: Add structured logging utility with multiple levels"
```

---

## COMMIT 7: API Response Standardization
**Time:** 20 minutes  
**Why:** Different routes return different formats. Standardize.

**Files to create:**
```
app/lib/apiResponse.ts    ← NEW: API response helpers
```

**`app/lib/apiResponse.ts` content:**
```typescript
/**
 * API Response Standardization
 * Standard response formats for all API endpoints
 */

import { logger } from './logger';

interface BaseResponse {
  success: boolean;
  timestamp: number;
}

interface SuccessResponse<T> extends BaseResponse {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function success<T>(
  data: T,
  message?: string
): SuccessResponse<T> {
  logger.info(`API Success: ${message || 'Request completed'}`);
  
  return {
    success: true,
    data,
    message,
    timestamp: Date.now(),
  };
}

export function error(
  code: string,
  message: string,
  details?: any
): ErrorResponse {
  logger.error(`API Error: ${code}`, { message, details });
  
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: Date.now(),
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  message?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    success: true,
    data,
    message,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
    },
    timestamp: Date.now(),
  };
}

export function errorResponse(statusCode: number, message: string, details?: any) {
  const codeMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    500: 'INTERNAL_ERROR',
    503: 'SERVICE_UNAVAILABLE',
  };

  const code = codeMap[statusCode] || 'ERROR';
  return error(code, message, details);
}
```

**Git command:**
```bash
git add app/lib/apiResponse.ts
git commit -m "feat: Standardize API response formats across all routes"
```

---

## COMMIT 8: Validation Schemas with Zod
**Time:** 35 minutes  
**Why:** Zod is installed but not used. Add comprehensive input validation.

**Files to create:**
```
app/lib/validation.ts     ← NEW: Zod validation schemas
docs/VALIDATION.md        ← NEW: Validation guide
```

**`app/lib/validation.ts` content:**
```typescript
/**
 * Validation Schemas
 * Zod schemas for all API inputs and user data
 */

import { z } from 'zod';

// ============================================================================
// CHESS MOVE VALIDATION
// ============================================================================

export const MoveSchema = z.object({
  from: z.number().min(0).max(63).describe('Starting square (0-63)'),
  to: z.number().min(0).max(63).describe('Destination square (0-63)'),
  promotion: z.enum(['knight', 'bishop', 'rook', 'queen']).optional(),
});

export type Move = z.infer<typeof MoveSchema>;

// ============================================================================
// AI MOVE REQUEST VALIDATION
// ============================================================================

export const AIMoveRequestSchema = z.object({
  gameState: z.object({
    board: z.array(z.number()).length(64),
    isWhiteTurn: z.boolean(),
    castlingRights: z.object({
      whiteKingside: z.boolean(),
      whiteQueenside: z.boolean(),
      blackKingside: z.boolean(),
      blackQueenside: z.boolean(),
    }),
    enPassantSquare: z.number().nullable(),
    halfMoveClock: z.number().non-negative(),
    fullMoveNumber: z.number().positive(),
    moveHistory: z.array(MoveSchema),
    status: z.string(),
    positionHistory: z.array(z.string()),
  }),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  legalMoves: z.array(MoveSchema).optional(),
});

export type AIMoveRequest = z.infer<typeof AIMoveRequestSchema>;

// ============================================================================
// GAME CREATION VALIDATION
// ============================================================================

export const CreateGameSchema = z.object({
  opponent: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  wager: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  gameMode: z.enum(['singlePlayer', 'localMultiplayer', 'onlineMultiplayer']),
});

export type CreateGameInput = z.infer<typeof CreateGameSchema>;

// ============================================================================
// PUZZLE SOLVING VALIDATION
// ============================================================================

export const SolvePuzzleSchema = z.object({
  puzzleId: z.number().positive(),
  moves: z.array(MoveSchema),
  timeTaken: z.number().positive(),
});

export type SolvePuzzleInput = z.infer<typeof SolvePuzzleSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function validateMove(data: unknown) {
  return MoveSchema.safeParse(data);
}

export function validateAIMoveRequest(data: unknown) {
  return AIMoveRequestSchema.safeParse(data);
}

export function validateGameCreation(data: unknown) {
  return CreateGameSchema.safeParse(data);
}

export function validatePuzzleSolve(data: unknown) {
  return SolvePuzzleSchema.safeParse(data);
}

// Square validation helpers
export function isValidSquare(square: number): boolean {
  return square >= 0 && square <= 63;
}

export function isValidMove(from: number, to: number): boolean {
  return isValidSquare(from) && isValidSquare(to) && from !== to;
}
```

**Git command:**
```bash
git add app/lib/validation.ts docs/VALIDATION.md
git commit -m "feat: Add Zod validation schemas for all API inputs"
```

---

## COMMIT 9: API Documentation
**Time:** 40 minutes  
**Why:** `/api/ai-move` exists but is undocumented. Document all endpoints.

**Files to create:**
```
docs/API.md                    ← NEW: Complete API reference
docs/api/ai-move.md           ← NEW: AI move endpoint details
docs/api/ENDPOINTS.md         ← NEW: All endpoints summary
```

**`docs/API.md` content:**
```markdown
# API Documentation

## Overview

Base Chess provides a RESTful API for AI move generation and game management.

## Base URL

```
Development:  http://localhost:3000
Production:   https://your-domain.com
```

## Authentication

Currently, no authentication required. In the future, consider adding:
- API key authentication
- JWT tokens
- Wallet signature verification

## Response Format

All API responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed",
  "timestamp": 1705425600000
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "timestamp": 1705425600000
}
```

## Endpoints

See individual endpoint documentation:
- [POST /api/ai-move](./api/ai-move.md) - Generate AI move
- [POST /api/auth](./api/auth.md) - User authentication
- [POST /api/game](./api/game.md) - Game operations

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | Invalid request format |
| `UNAUTHORIZED` | 401 | Missing or invalid credentials |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `AI_ERROR` | 500 | AI service error |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

Currently unlimited. Future considerations:
- 100 requests per minute per IP
- 1000 requests per hour per API key

## Versioning

API is currently v1. Breaking changes will increment version.

Future: `v2/api/ai-move`
```

**`docs/api/ai-move.md` content:**
```markdown
# POST /api/ai-move

Generate the best chess move using AI (Gemini 1.5 Flash).

## Request

```bash
curl -X POST http://localhost:3000/api/ai-move \
  -H "Content-Type: application/json" \
  -d '{
    "gameState": { ... },
    "difficulty": "medium"
  }'
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `gameState` | object | Yes | Current game state |
| `gameState.board` | number[] | Yes | 64-element board array |
| `gameState.isWhiteTurn` | boolean | Yes | Whose turn it is |
| `gameState.castlingRights` | object | Yes | Castling availability |
| `gameState.enPassantSquare` | number\|null | Yes | En passant target |
| `gameState.halfMoveClock` | number | Yes | 50-move rule counter |
| `gameState.fullMoveNumber` | number | Yes | Current move number |
| `gameState.moveHistory` | object[] | Yes | Past moves |
| `gameState.status` | string | Yes | Game status |
| `gameState.positionHistory` | string[] | Yes | Position history |
| `difficulty` | string | No | `easy`, `medium`, or `hard` (default: `medium`) |

### Response

```json
{
  "success": true,
  "data": {
    "move": {
      "from": 52,
      "to": 36
    },
    "reasoning": "Advancing central pawn for control"
  },
  "timestamp": 1705425600000
}
```

## Difficulty Levels

| Level | Temperature | Description |
|-------|-------------|-------------|
| `easy` | 1.2 | Beginner - Makes simple moves |
| `medium` | 0.7 | Intermediate - Balanced play |
| `hard` | 0.3 | Expert - Deep analysis |

## Square Numbering

Board squares are 0-63, ordered left-to-right, top-to-bottom:

```
 0  1  2  3  4  5  6  7
 8  9 10 11 12 13 14 15
16 17 18 19 20 21 22 23
24 25 26 27 28 29 30 31
32 33 34 35 36 37 38 39
40 41 42 43 44 45 46 47
48 49 50 51 52 53 54 55
56 57 58 59 60 61 62 63
```

## Examples

### Moving a pawn (e2 to e4)

```json
{
  "gameState": { ... },
  "difficulty": "medium",
  "move": {
    "from": 52,
    "to": 36
  }
}
```

## Error Handling

### Timeout (AI takes too long)

```json
{
  "success": false,
  "error": {
    "code": "TIMEOUT",
    "message": "AI move generation timed out after 7000ms"
  }
}
```

### Invalid Game State

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid game state",
    "details": { "issues": [...] }
  }
}
```

## Performance

- Response time: 500-3000ms (Gemini API dependent)
- Timeout: 7000ms
- Max payload: 1MB
```

**Git command:**
```bash
git add docs/API.md docs/api/
git commit -m "docs: Add comprehensive API documentation with examples"
```

---

## COMMIT 10: Contributing Guidelines
**Time:** 30 minutes  
**Why:** No CONTRIBUTING.md. New contributors don't know how to help.

**Files to create:**
```
CONTRIBUTING.md                       ← NEW: How to contribute
CODE_OF_CONDUCT.md                   ← NEW: Community standards
.github/ISSUE_TEMPLATE/bug_report.md ← NEW: Bug report template
.github/ISSUE_TEMPLATE/feature_request.md ← NEW: Feature request template
.github/pull_request_template.md     ← NEW: PR template
```

**`CONTRIBUTING.md` content:**
```markdown
# Contributing to Base Chess

Thank you for your interest in contributing! This guide explains how to participate.

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) first.

## Getting Started

### 1. Fork the Repository
```bash
# Click "Fork" on GitHub
git clone https://github.com/YOUR_USERNAME/base_chess.git
cd base_chess
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Set Up Development Environment
```bash
npm install
npm run dev
```

## Development Workflow

### Before Starting

1. Check [Issues](https://github.com/base-org/base_chess/issues) for existing work
2. Create an issue if your feature doesn't exist
3. Comment that you're working on it

### Writing Code

1. **Follow Code Standards** - See [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md)
2. **Add Tests** - All features need tests (see [docs/TESTING.md](docs/TESTING.md))
3. **Add Types** - Use TypeScript for all new code
4. **Add Comments** - Explain complex logic
5. **Run Linting** - `npm run lint` should pass
6. **Format Code** - `npm run format` for Prettier

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- ChessBoard.test.tsx

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Fix a bug
docs: Update documentation
test: Add tests
chore: Maintenance
refactor: Code restructuring (avoid if possible)
style: Formatting changes
```

Examples:
```
feat: Add puzzle difficulty levels
fix: Correct castling validation
docs: Add API documentation
test: Add ChessBoard component tests
```

## Submitting a Pull Request

### Before Submitting

1. **Update your branch:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a PR** on GitHub

### PR Requirements

- [ ] Tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] TypeScript compiles: `npm run build`
- [ ] Code follows standards
- [ ] PR description is clear
- [ ] No breaking changes (discuss first if needed)

### PR Description Template

See [.github/pull_request_template.md](.github/pull_request_template.md)

## Review Process

1. **Automatic Checks** - CI/CD pipeline must pass
2. **Manual Review** - Team reviews code
3. **Revisions** - We may request changes
4. **Approval** - Maintainer approves
5. **Merge** - Code is merged to main

## Common Issues

### Build Fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests Fail
```bash
# Run single test
npm test -- GameControls.test.tsx

# Update snapshots if needed
npm test -- -u
```

### Type Errors
```bash
# Check types
npx tsc --noEmit

# Check in VS Code
# Should show errors in Problems panel
```

## Project Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for directory layout.

## Need Help?

- **Questions?** Open a [Discussion](https://github.com/base-org/base_chess/discussions)
- **Found a bug?** Create a [Bug Report](https://github.com/base-org/base_chess/issues/new?template=bug_report.md)
- **Want a feature?** Create a [Feature Request](https://github.com/base-org/base_chess/issues/new?template=feature_request.md)

## Recognition

Contributors will be recognized in:
- CHANGELOG.md
- Release notes
- GitHub contributors page

Thank you for contributing! 🎉
```

**`.github/pull_request_template.md` content:**
```markdown
## Description

Brief description of what this PR does.

## Related Issue

Fixes #(issue number)

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?

Describe the tests you ran and how to reproduce them.

```bash
npm test
```

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] New and existing unit tests passed locally
- [ ] I have updated the documentation

## Screenshots (if applicable)

Add screenshots for UI changes.

## Additional Context

Any other context about the PR.
```

**Git command:**
```bash
git add CONTRIBUTING.md CODE_OF_CONDUCT.md .github/
git commit -m "docs: Add contributing guidelines and GitHub templates"
```

---

## END OF PHASE 1 ✅

You now have **10 foundational commits** that establish:
- ✅ Clear environment setup
- ✅ Centralized types and constants
- ✅ Error handling infrastructure
- ✅ Logging system
- ✅ API documentation
- ✅ Contribution guidelines

**Time spent: ~4-5 hours**  
**Commits: 10/28**  
**Progress: 36%**

---

# PHASE 2: INFRASTRUCTURE (8 commits) - Days 2-3

_(Continuing in next section due to length)_

Would you like me to continue with Phase 2 (Testing, CI/CD, Pre-commit hooks) and Phase 3 (Documentation, Helpers, Polish)?

---

