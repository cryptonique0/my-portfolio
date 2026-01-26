# Chess Smart Contracts

Fully on-chain chess game implementation for Base network.

## Features

- ✅ Complete chess rule validation (all piece movements, castling, en passant, pawn promotion)
- ✅ Check and checkmate detection
- ✅ Wager system with automatic payouts
- ✅ Timeout mechanism for abandoned games
- ✅ Open and private game modes
- ✅ Factory contract for game management

## Smart Contracts

### Chess.sol
Main game contract with:
- Full chess logic and move validation
- Game state management
- Wager handling
- Timeout claims
- Draw offers

### ChessFactory.sol
Factory contract for:
- Creating open games (matchmaking)
- Creating private games (invite-only)
- Listing available games
- Managing game lifecycle

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your configuration to `.env`:
- `PRIVATE_KEY`: Your wallet private key
- `BASESCAN_API_KEY`: For contract verification
- `BASE_SEPOLIA_RPC_URL`: RPC endpoint (optional)

## Compilation

```bash
npm run compile
```

## Testing

```bash
npm run test
```

## Deployment

Deploy to Base Sepolia testnet:
```bash
npm run deploy:baseSepolia
```

Deploy to Base mainnet:
```bash
npm run deploy:base
```

## Game Flow

1. **Create Game**: Player creates game with optional wager
2. **Join Game**: Opponent joins (must match wager)
3. **Make Moves**: Players alternate making moves
4. **Game End**: Checkmate, stalemate, draw, or timeout

## Move Notation

Positions are numbered 0-63:
- 0-7: Black back rank (a8-h8)
- 8-15: Black pawns (a7-h7)
- 48-55: White pawns (a2-h2)
- 56-63: White back rank (a1-h1)

Example: Moving white pawn from e2 to e4:
```javascript
chess.makeMove(gameId, 52, 36)
```

## Piece Encoding

- 0: Empty
- 1-6: White pieces (Pawn, Knight, Bishop, Rook, Queen, King)
- 7-12: Black pieces (Pawn, Knight, Bishop, Rook, Queen, King)

## Gas Optimization

The contracts are optimized for gas efficiency:
- Minimal storage operations
- Efficient board representation
- Optimized move validation

## Security

- Move validation prevents illegal moves
- Check detection prevents invalid positions
- Reentrancy protection on payouts
- Timeout mechanism prevents griefing

## License

MIT
