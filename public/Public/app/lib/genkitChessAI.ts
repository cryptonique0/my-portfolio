// Gemini-powered Chess AI using Google Generative AI
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GameState,
  Move,
  generateLegalMoves,
} from './chessEngine';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface MoveData {
  from: number;
  to: number;
  reasoning?: string;
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function getGeminiMove(
  gameState: GameState,
  difficulty: Difficulty = 'medium'
): Promise<{ from: number; to: number; reasoning?: string }> {
  console.log('[Gemini] Starting move generation', { difficulty, moveNum: gameState.fullMoveNumber });
  const startTime = Date.now();
  const legalMoves = generateLegalMoves(gameState);

  if (legalMoves.length === 0) {
    throw new Error('No legal moves available');
  }

  // Generate prompt based on difficulty
  const prompt = buildPrompt(gameState, legalMoves, difficulty);

  try {
    // Get the model based on difficulty (adjust temperature)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: difficulty === 'easy' ? 1.2 : difficulty === 'medium' ? 0.7 : 0.3,
        maxOutputTokens: 200,
        responseMimeType: 'application/json',
      },
    });

    // Call Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = typeof response?.text === 'function' ? await response.text() : String(response ?? '');
    console.log('[Gemini] Response received', { elapsed: `${Date.now() - startTime}ms` });

    // Parse JSON response (robust to extra text)
    let moveData: MoveData;
    try {
      moveData = JSON.parse(text);
    } catch {
      // Try to extract JSON substring if model added extraneous text
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonSubstring = text.slice(firstBrace, lastBrace + 1);
        try {
          moveData = JSON.parse(jsonSubstring);
        } catch {
          throw new Error('Failed to parse Gemini JSON response');
        }
      } else {
        throw new Error('Failed to parse Gemini JSON response');
      }
    }

    // Validate the move is legal
    const selectedMove = legalMoves.find(
      (m) => m.from === moveData.from && m.to === moveData.to
    );

    if (!selectedMove) {
      // Fallback to a random legal move if Gemini suggests an illegal move
      console.warn('[Gemini] Illegal move suggested, selecting random legal move', { suggested: moveData, elapsed: `${Date.now() - startTime}ms` });
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        reasoning: 'Random move (AI suggestion was invalid)',
      };
    }

    console.log('[Gemini] Valid move selected', { elapsed: `${Date.now() - startTime}ms` });

    return {
      from: selectedMove.from,
      to: selectedMove.to,
      reasoning: moveData.reasoning,
    };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error('[Gemini] Error', { elapsed: `${elapsed}ms`, error });
    // Fallback to random move
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      from: randomMove.from,
      to: randomMove.to,
      reasoning: 'Fallback move due to error',
    };
  }
}

function buildPrompt(gameState: GameState, legalMoves: Move[], difficulty: Difficulty): string {
  const boardRepresentation = formatBoardForAI(gameState);
  const movesText = formatLegalMoves(legalMoves);
  const playerColor = gameState.isWhiteTurn ? 'White' : 'Black';

  let skillLevel = '';
  let strategy = '';

  switch (difficulty) {
    case 'easy':
      skillLevel = 'a beginner chess player';
      strategy = 'Make simple, straightforward moves. You can occasionally make suboptimal moves or miss tactical opportunities. Focus on basic piece development and material equality.';
      break;
    case 'medium':
      skillLevel = 'an intermediate chess player';
      strategy = 'Balance piece development with tactical opportunities. Look for simple tactical patterns like forks, pins, and discovered attacks. Consider basic positional factors.';
      break;
    case 'hard':
      skillLevel = 'an expert chess player';
      strategy = 'Analyze deeply and look for the best move. Consider tactics, positional advantages, king safety, pawn structure, and long-term strategic plans. Calculate variations thoroughly.';
      break;
  }

  return `You are ${skillLevel} playing chess as ${playerColor}.

Current Board Position (8x8, from White's perspective):
${boardRepresentation}

Game Status:
- Turn: ${playerColor}
- Move number: ${gameState.fullMoveNumber}
- Status: ${gameState.status}
${gameState.castlingRights.whiteKingside || gameState.castlingRights.whiteQueenside || gameState.castlingRights.blackKingside || gameState.castlingRights.blackQueenside ? `- Castling available: ${getCastlingRights(gameState)}` : ''}

Strategy: ${strategy}

Available Legal Moves (showing from-to square indices):
${movesText}

Choose the best move based on your skill level. Return your response as a JSON object with these exact fields:
{
  "from": <number 0-63>,
  "to": <number 0-63>,
  "reasoning": "<your brief 1-2 sentence explanation>"
}

Remember: You MUST choose from the legal moves provided above. Square indices go from 0-63 where:
- Row 0 (indices 0-7): a8-h8 (Black's back rank)
- Row 7 (indices 56-63): a1-h1 (White's back rank)

Return ONLY the JSON object, no other text.`;
}

function formatBoardForAI(gameState: GameState): string {
  const { board } = gameState;
  let boardStr = '  a b c d e f g h\n';

  for (let row = 0; row < 8; row++) {
    boardStr += `${8 - row} `;
    for (let col = 0; col < 8; col++) {
      const index = row * 8 + col;
      const piece = board[index];
      boardStr += (piece || '.') + ' ';
    }
    boardStr += `${8 - row}\n`;
  }

  boardStr += '  a b c d e f g h';
  return boardStr;
}

function formatLegalMoves(moves: Move[]): string {
  return moves
    .map((move, i) => {
      const fromSquare = indexToSquare(move.from);
      const toSquare = indexToSquare(move.to);
      return `${i + 1}. ${fromSquare} → ${toSquare} (from: ${move.from}, to: ${move.to})`;
    })
    .join('\n');
}

function indexToSquare(index: number): string {
  const files = 'abcdefgh';
  const row = Math.floor(index / 8);
  const col = index % 8;
  const rank = 8 - row;
  const file = files[col];
  return `${file}${rank}`;
}

function getCastlingRights(gameState: GameState): string {
  const rights: string[] = [];
  if (gameState.castlingRights.whiteKingside) rights.push('White O-O');
  if (gameState.castlingRights.whiteQueenside) rights.push('White O-O-O');
  if (gameState.castlingRights.blackKingside) rights.push('Black O-O');
  if (gameState.castlingRights.blackQueenside) rights.push('Black O-O-O');
  return rights.join(', ') || 'None';
}

// Client-side function to get best move (if running client-side)
export async function getBestMoveWithGemini(
  gameState: GameState,
  difficulty: Difficulty = 'medium'
): Promise<Move | null> {
  try {
    // This would be called via API route in production
    // For now, fallback to the API endpoint
    const response = await fetch('/api/ai-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameState, difficulty }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const legalMoves = generateLegalMoves(gameState);
    const selectedMove = legalMoves.find(
      (m) => m.from === data.move.from && m.to === data.move.to
    );

    if (selectedMove) {
      console.log('AI Move:', data.reasoning || 'No reasoning provided');
      return selectedMove;
    }

    return legalMoves[0] || null;
  } catch (error) {
    console.error('Error getting AI move:', error);
    const legalMoves = generateLegalMoves(gameState);
    return legalMoves[0] || null;
  }
}
