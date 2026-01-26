# Gemini AI Chess Integration

This project now uses Google's Gemini AI to power the chess AI opponent!

## 🎯 Features

- **AI-Powered Chess Moves**: Uses Gemini 1.5 Flash for intelligent move generation
- **Three Difficulty Levels**:
  - **Easy**: Beginner-level play with occasional suboptimal moves
  - **Medium**: Intermediate play with tactical awareness
  - **Hard**: Expert-level analysis with deep strategic thinking
- **Natural Language Reasoning**: The AI explains its moves (visible in console)
- **Fallback Support**: Automatically falls back to local minimax AI if API fails

## 🚀 Setup Instructions

### 1. Get Google AI API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use an existing one

### 2. Configure Environment Variables

Add your API key to `.env.local`:

```bash
GOOGLE_API_KEY=your_actual_api_key_here
```

⚠️ **Important**: Never commit your API key to version control. The `.env.local` file is already in `.gitignore`.

### 3. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install
```

### 4. Run the Application

Start the Next.js development server:

```bash
npm run dev
```

Visit `http://localhost:3000` and play against the Gemini-powered AI!

## � Project Structure

```
app/
├── lib/
│   ├── genkitChessAI.ts      # Gemini-powered AI
│   └── chessAI.ts             # Fallback minimax AI
├── api/
│   └── ai-move/
│       └── route.ts           # API endpoint for AI moves
└── page.tsx                   # Updated to use Gemini API

.env.local                     # Environment variables (API keys)
```

## 🎮 How It Works

1. **Player Makes Move**: User moves a piece on the board
2. **API Call**: Frontend calls `/api/ai-move` with current game state
3. **Gemini Analysis**: 
   - Backend calls Gemini 1.5 Flash with structured prompt
   - Includes board position, legal moves, and difficulty-based strategy
   - Gemini returns move as JSON with reasoning
4. **Move Validation**: Server validates the move is legal
5. **Board Update**: Move is applied and displayed

## 🧠 AI Prompting Strategy

The AI receives:
- Current board position (visual representation)
- All legal moves with square indices
- Game status (check, castling rights, etc.)
- Difficulty-specific strategy instructions
- Structured output schema for reliable parsing

### Difficulty Strategies

**Easy**: "Make simple, straightforward moves. You can occasionally make suboptimal moves..."

**Medium**: "Balance piece development with tactical opportunities. Look for simple tactical patterns..."

**Hard**: "Analyze deeply and look for the best move. Consider tactics, positional advantages, king safety..."

## 🔄 Fallback Mechanism

If the Gemini API fails (network issues, rate limits, etc.), the app automatically falls back to the local minimax chess engine to ensure uninterrupted gameplay.

## 💡 Tips

- **API Costs**: Gemini 1.5 Flash is very cost-effective, but monitor your usage
- **Rate Limits**: Free tier has generous limits, but heavy use may require a paid plan
- **Response Time**: AI moves typically take 1-3 seconds
- **Console Logs**: Check the browser console to see AI's reasoning for each move

## 🐛 Troubleshooting

### "Failed to generate AI move" Error

1. Check that `GOOGLE_API_KEY` is set in `.env.local`
2. Verify API key is valid at [Google AI Studio](https://ai.google.dev/)
3. Check browser console for detailed error messages
4. The app will automatically fall back to local AI

### AI Makes Invalid Moves

The system has built-in validation and fallbacks. If you see this:
1. Check console for "AI suggestion was invalid" warnings
2. Report the game state/board position for debugging

### Slow Response Times

- Gemini 1.5 Flash is optimized for speed
- Check your internet connection
- Rate limiting may cause delays (wait a moment and try again)

## 📚 Learn More

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google Generative AI SDK](https://github.com/google/generative-ai-js)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 🎉 Enjoy!

You now have a chess game powered by one of the world's most advanced AI models. Have fun playing!
