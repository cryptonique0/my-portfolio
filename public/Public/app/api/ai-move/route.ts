import { NextRequest, NextResponse } from 'next/server';
import { getGeminiMove } from '@/app/lib/genkitChessAI';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[AI API] Request received');

  try {
    const body = await request.json();
    const { gameState, difficulty } = body;

    if (!gameState) {
      console.error('[AI API] Missing game state');
      return NextResponse.json(
        { error: 'Game state is required' },
        { status: 400 }
      );
    }

    // Get the best move from Gemini with a timeout to avoid long hangs
    console.log('[AI API] Calling getGeminiMove with difficulty:', difficulty);
    const TIMEOUT_MS = 7000;
    const result = await Promise.race([
      getGeminiMove(gameState, difficulty || 'medium'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), TIMEOUT_MS)),
    ]);
    const elapsed = Date.now() - startTime;
    console.log('[AI API] Success', { elapsed: `${elapsed}ms`, from: result.from, to: result.to });

    return NextResponse.json({
      move: {
        from: result.from,
        to: result.to,
      },
      reasoning: result.reasoning,
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error('[AI API] Error after', `${elapsed}ms`, error);
    return NextResponse.json(
      { error: 'Failed to generate AI move', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
