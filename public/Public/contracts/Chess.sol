// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Chess
 * @dev On-chain chess game with full move validation
 */
contract Chess {
    // Piece representation: empty=0, white pawns=1-6, black pawns=7-12
    // 1=P, 2=N, 3=B, 4=R, 5=Q, 6=K (white)
    // 7=p, 8=n, 9=b, 10=r, 11=q, 12=k (black)
    
    enum GameState { Active, WhiteWon, BlackWon, Draw, Abandoned }
    enum PieceType { Empty, WPawn, WKnight, WBishop, WRook, WQueen, WKing, BPawn, BKnight, BBishop, BRook, BQueen, BKing }
    
    struct Game {
        address whitePlayer;
        address blackPlayer;
        uint8[64] board; // 8x8 board, index = row * 8 + col
        bool whiteTurn;
        GameState state;
        uint256 wager;
        uint256 startTime;
        uint256 lastMoveTime;
        bool whiteKingMoved;
        bool blackKingMoved;
        bool whiteRookA1Moved;
        bool whiteRookH1Moved;
        bool blackRookA8Moved;
        bool blackRookH8Moved;
        uint8 enPassantCol; // 255 = no en passant available
        uint256 moveCount;
    }
    
    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;
    uint256 public gameCounter;
    
    uint256 public constant MOVE_TIMEOUT = 24 hours;
    
    event GameCreated(uint256 indexed gameId, address indexed whitePlayer, address indexed blackPlayer, uint256 wager);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 fromPos, uint8 toPos);
    event GameEnded(uint256 indexed gameId, GameState result);
    event GameAbandoned(uint256 indexed gameId, address winner);
    
    modifier onlyPlayer(uint256 gameId) {
        require(
            msg.sender == games[gameId].whitePlayer || msg.sender == games[gameId].blackPlayer,
            "Not a player in this game"
        );
        _;
    }
    
    modifier gameActive(uint256 gameId) {
        require(games[gameId].state == GameState.Active, "Game is not active");
        _;
    }
    
    /**
     * @dev Create a new chess game
     * @param opponent Address of the opponent (address(0) for open game)
     */
    function createGame(address opponent) external payable returns (uint256) {
        require(opponent != msg.sender, "Cannot play against yourself");
        
        uint256 gameId = gameCounter++;
        Game storage game = games[gameId];
        
        game.whitePlayer = msg.sender;
        game.blackPlayer = opponent;
        game.whiteTurn = true;
        game.state = GameState.Active;
        game.wager = msg.value;
        game.startTime = block.timestamp;
        game.lastMoveTime = block.timestamp;
        game.enPassantCol = 255;
        
        // Initialize board
        initializeBoard(gameId);
        
        playerGames[msg.sender].push(gameId);
        if (opponent != address(0)) {
            playerGames[opponent].push(gameId);
        }
        
        emit GameCreated(gameId, msg.sender, opponent, msg.value);
        return gameId;
    }
    
    /**
     * @dev Join an open game
     */
    function joinGame(uint256 gameId) external payable {
        Game storage game = games[gameId];
        require(game.blackPlayer == address(0), "Game is not open");
        require(msg.value == game.wager, "Incorrect wager amount");
        require(msg.sender != game.whitePlayer, "Cannot play against yourself");
        
        game.blackPlayer = msg.sender;
        playerGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, game.whitePlayer, msg.sender, msg.value);
    }
    
    /**
     * @dev Initialize the chess board to starting position
     */
    function initializeBoard(uint256 gameId) private {
        Game storage game = games[gameId];
        
        // Black pieces (row 0-1)
        game.board[0] = uint8(PieceType.BRook);
        game.board[1] = uint8(PieceType.BKnight);
        game.board[2] = uint8(PieceType.BBishop);
        game.board[3] = uint8(PieceType.BQueen);
        game.board[4] = uint8(PieceType.BKing);
        game.board[5] = uint8(PieceType.BBishop);
        game.board[6] = uint8(PieceType.BKnight);
        game.board[7] = uint8(PieceType.BRook);
        
        for (uint8 i = 8; i < 16; i++) {
            game.board[i] = uint8(PieceType.BPawn);
        }
        
        // Empty squares (row 2-5)
        for (uint8 i = 16; i < 48; i++) {
            game.board[i] = uint8(PieceType.Empty);
        }
        
        // White pieces (row 6-7)
        for (uint8 i = 48; i < 56; i++) {
            game.board[i] = uint8(PieceType.WPawn);
        }
        
        game.board[56] = uint8(PieceType.WRook);
        game.board[57] = uint8(PieceType.WKnight);
        game.board[58] = uint8(PieceType.WBishop);
        game.board[59] = uint8(PieceType.WQueen);
        game.board[60] = uint8(PieceType.WKing);
        game.board[61] = uint8(PieceType.WBishop);
        game.board[62] = uint8(PieceType.WKnight);
        game.board[63] = uint8(PieceType.WRook);
    }
    
    /**
     * @dev Make a move
     * @param gameId The game ID
     * @param fromPos Position to move from (0-63)
     * @param toPos Position to move to (0-63)
     */
    function makeMove(uint256 gameId, uint8 fromPos, uint8 toPos) 
        external 
        onlyPlayer(gameId) 
        gameActive(gameId) 
    {
        Game storage game = games[gameId];
        require(game.blackPlayer != address(0), "Waiting for opponent");
        
        bool isWhite = msg.sender == game.whitePlayer;
        require(game.whiteTurn == isWhite, "Not your turn");
        
        require(fromPos < 64 && toPos < 64, "Invalid position");
        require(fromPos != toPos, "Must move to different square");
        
        uint8 piece = game.board[fromPos];
        require(piece != uint8(PieceType.Empty), "No piece at source");
        require(isWhitePiece(piece) == isWhite, "Not your piece");
        
        uint8 targetPiece = game.board[toPos];
        require(isWhitePiece(targetPiece) != isWhite || targetPiece == uint8(PieceType.Empty), "Cannot capture own piece");
        
        // Validate move based on piece type
        require(isValidMove(gameId, fromPos, toPos), "Invalid move");
        
        // Check if move puts/leaves own king in check
        require(!wouldBeInCheck(gameId, fromPos, toPos, isWhite), "Move would put king in check");
        
        // Execute move
        executeMove(gameId, fromPos, toPos);
        
        game.whiteTurn = !game.whiteTurn;
        game.lastMoveTime = block.timestamp;
        game.moveCount++;
        
        emit MoveMade(gameId, msg.sender, fromPos, toPos);
        
        // Check for checkmate or stalemate
        checkGameEnd(gameId);
    }
    
    /**
     * @dev Execute the move on the board
     */
    function executeMove(uint256 gameId, uint8 fromPos, uint8 toPos) private {
        Game storage game = games[gameId];
        uint8 piece = game.board[fromPos];
        
        // Handle special moves
        
        // Castling
        if (piece == uint8(PieceType.WKing) && fromPos == 60) {
            if (toPos == 62) { // Kingside
                game.board[63] = uint8(PieceType.Empty);
                game.board[61] = uint8(PieceType.WRook);
            } else if (toPos == 58) { // Queenside
                game.board[56] = uint8(PieceType.Empty);
                game.board[59] = uint8(PieceType.WRook);
            }
        } else if (piece == uint8(PieceType.BKing) && fromPos == 4) {
            if (toPos == 6) { // Kingside
                game.board[7] = uint8(PieceType.Empty);
                game.board[5] = uint8(PieceType.BRook);
            } else if (toPos == 2) { // Queenside
                game.board[0] = uint8(PieceType.Empty);
                game.board[3] = uint8(PieceType.BRook);
            }
        }
        
        // En passant
        if (piece == uint8(PieceType.WPawn) && game.enPassantCol != 255) {
            if (toPos == 16 + game.enPassantCol && fromPos / 8 == 3) {
                game.board[24 + game.enPassantCol] = uint8(PieceType.Empty);
            }
        } else if (piece == uint8(PieceType.BPawn) && game.enPassantCol != 255) {
            if (toPos == 40 + game.enPassantCol && fromPos / 8 == 4) {
                game.board[32 + game.enPassantCol] = uint8(PieceType.Empty);
            }
        }
        
        // Update en passant availability
        game.enPassantCol = 255;
        if (piece == uint8(PieceType.WPawn) && fromPos >= 48 && toPos < 32) {
            if (fromPos - toPos == 16) {
                game.enPassantCol = fromPos % 8;
            }
        } else if (piece == uint8(PieceType.BPawn) && fromPos < 16 && toPos >= 32) {
            if (toPos - fromPos == 16) {
                game.enPassantCol = fromPos % 8;
            }
        }
        
        // Pawn promotion (auto-promote to queen)
        if (piece == uint8(PieceType.WPawn) && toPos < 8) {
            piece = uint8(PieceType.WQueen);
        } else if (piece == uint8(PieceType.BPawn) && toPos >= 56) {
            piece = uint8(PieceType.BQueen);
        }
        
        // Update castling rights
        if (piece == uint8(PieceType.WKing)) game.whiteKingMoved = true;
        if (piece == uint8(PieceType.BKing)) game.blackKingMoved = true;
        if (fromPos == 56) game.whiteRookA1Moved = true;
        if (fromPos == 63) game.whiteRookH1Moved = true;
        if (fromPos == 0) game.blackRookA8Moved = true;
        if (fromPos == 7) game.blackRookH8Moved = true;
        
        // Make the move
        game.board[toPos] = piece;
        game.board[fromPos] = uint8(PieceType.Empty);
    }
    
    /**
     * @dev Check if a piece is white
     */
    function isWhitePiece(uint8 piece) private pure returns (bool) {
        return piece >= 1 && piece <= 6;
    }
    
    /**
     * @dev Validate move based on piece type
     */
    function isValidMove(uint256 gameId, uint8 fromPos, uint8 toPos) private view returns (bool) {
        Game storage game = games[gameId];
        uint8 piece = game.board[fromPos];
        
        uint8 fromRow = fromPos / 8;
        uint8 fromCol = fromPos % 8;
        uint8 toRow = toPos / 8;
        uint8 toCol = toPos % 8;
        
        int8 rowDiff = int8(toRow) - int8(fromRow);
        int8 colDiff = int8(toCol) - int8(fromCol);
        
        if (piece == uint8(PieceType.WPawn)) {
            return isValidPawnMove(gameId, fromPos, toPos, true, rowDiff, colDiff);
        } else if (piece == uint8(PieceType.BPawn)) {
            return isValidPawnMove(gameId, fromPos, toPos, false, rowDiff, colDiff);
        } else if (piece == uint8(PieceType.WKnight) || piece == uint8(PieceType.BKnight)) {
            return isValidKnightMove(rowDiff, colDiff);
        } else if (piece == uint8(PieceType.WBishop) || piece == uint8(PieceType.BBishop)) {
            return isValidBishopMove(gameId, fromPos, toPos, rowDiff, colDiff);
        } else if (piece == uint8(PieceType.WRook) || piece == uint8(PieceType.BRook)) {
            return isValidRookMove(gameId, fromPos, toPos, rowDiff, colDiff);
        } else if (piece == uint8(PieceType.WQueen) || piece == uint8(PieceType.BQueen)) {
            return isValidQueenMove(gameId, fromPos, toPos, rowDiff, colDiff);
        } else if (piece == uint8(PieceType.WKing) || piece == uint8(PieceType.BKing)) {
            return isValidKingMove(gameId, fromPos, toPos, rowDiff, colDiff, piece == uint8(PieceType.WKing));
        }
        
        return false;
    }
    
    function isValidPawnMove(uint256 gameId, uint8 fromPos, uint8 toPos, bool isWhite, int8 rowDiff, int8 colDiff) private view returns (bool) {
        Game storage game = games[gameId];
        uint8 targetPiece = game.board[toPos];
        
        if (isWhite) {
            // White pawns move up (decreasing row)
            if (colDiff == 0) {
                if (rowDiff == -1 && targetPiece == uint8(PieceType.Empty)) return true;
                if (rowDiff == -2 && fromPos / 8 == 6 && targetPiece == uint8(PieceType.Empty) && game.board[fromPos - 8] == uint8(PieceType.Empty)) return true;
            } else if (abs(colDiff) == 1 && rowDiff == -1) {
                // Capture
                if (targetPiece != uint8(PieceType.Empty) && !isWhitePiece(targetPiece)) return true;
                // En passant
                if (fromPos / 8 == 3 && game.enPassantCol == toPos % 8) return true;
            }
        } else {
            // Black pawns move down (increasing row)
            if (colDiff == 0) {
                if (rowDiff == 1 && targetPiece == uint8(PieceType.Empty)) return true;
                if (rowDiff == 2 && fromPos / 8 == 1 && targetPiece == uint8(PieceType.Empty) && game.board[fromPos + 8] == uint8(PieceType.Empty)) return true;
            } else if (abs(colDiff) == 1 && rowDiff == 1) {
                // Capture
                if (targetPiece != uint8(PieceType.Empty) && isWhitePiece(targetPiece)) return true;
                // En passant
                if (fromPos / 8 == 4 && game.enPassantCol == toPos % 8) return true;
            }
        }
        
        return false;
    }
    
    function isValidKnightMove(int8 rowDiff, int8 colDiff) private pure returns (bool) {
        int8 absRow = abs(rowDiff);
        int8 absCol = abs(colDiff);
        return (absRow == 2 && absCol == 1) || (absRow == 1 && absCol == 2);
    }
    
    function isValidBishopMove(uint256 gameId, uint8 fromPos, uint8 toPos, int8 rowDiff, int8 colDiff) private view returns (bool) {
        if (abs(rowDiff) != abs(colDiff)) return false;
        return isPathClear(gameId, fromPos, toPos);
    }
    
    function isValidRookMove(uint256 gameId, uint8 fromPos, uint8 toPos, int8 rowDiff, int8 colDiff) private view returns (bool) {
        if (rowDiff != 0 && colDiff != 0) return false;
        return isPathClear(gameId, fromPos, toPos);
    }
    
    function isValidQueenMove(uint256 gameId, uint8 fromPos, uint8 toPos, int8 rowDiff, int8 colDiff) private view returns (bool) {
        if (rowDiff != 0 && colDiff != 0 && abs(rowDiff) != abs(colDiff)) return false;
        return isPathClear(gameId, fromPos, toPos);
    }
    
    function isValidKingMove(uint256 gameId, uint8 fromPos, uint8 toPos, int8 rowDiff, int8 colDiff, bool isWhite) private view returns (bool) {
        Game storage game = games[gameId];
        
        // Normal king move
        if (abs(rowDiff) <= 1 && abs(colDiff) <= 1) return true;
        
        // Castling
        if (isWhite && fromPos == 60 && !game.whiteKingMoved) {
            // Kingside
            if (toPos == 62 && !game.whiteRookH1Moved && 
                game.board[61] == uint8(PieceType.Empty) && 
                game.board[62] == uint8(PieceType.Empty)) {
                return !isSquareAttacked(gameId, 60, false) && 
                       !isSquareAttacked(gameId, 61, false) && 
                       !isSquareAttacked(gameId, 62, false);
            }
            // Queenside
            if (toPos == 58 && !game.whiteRookA1Moved && 
                game.board[57] == uint8(PieceType.Empty) && 
                game.board[58] == uint8(PieceType.Empty) &&
                game.board[59] == uint8(PieceType.Empty)) {
                return !isSquareAttacked(gameId, 60, false) && 
                       !isSquareAttacked(gameId, 59, false) && 
                       !isSquareAttacked(gameId, 58, false);
            }
        } else if (!isWhite && fromPos == 4 && !game.blackKingMoved) {
            // Kingside
            if (toPos == 6 && !game.blackRookH8Moved && 
                game.board[5] == uint8(PieceType.Empty) && 
                game.board[6] == uint8(PieceType.Empty)) {
                return !isSquareAttacked(gameId, 4, true) && 
                       !isSquareAttacked(gameId, 5, true) && 
                       !isSquareAttacked(gameId, 6, true);
            }
            // Queenside
            if (toPos == 2 && !game.blackRookA8Moved && 
                game.board[1] == uint8(PieceType.Empty) && 
                game.board[2] == uint8(PieceType.Empty) &&
                game.board[3] == uint8(PieceType.Empty)) {
                return !isSquareAttacked(gameId, 4, true) && 
                       !isSquareAttacked(gameId, 3, true) && 
                       !isSquareAttacked(gameId, 2, true);
            }
        }
        
        return false;
    }
    
    function isPathClear(uint256 gameId, uint8 fromPos, uint8 toPos) private view returns (bool) {
        Game storage game = games[gameId];
        
        int8 fromRow = int8(fromPos / 8);
        int8 fromCol = int8(fromPos % 8);
        int8 toRow = int8(toPos / 8);
        int8 toCol = int8(toPos % 8);
        
        int8 rowStep = 0;
        int8 colStep = 0;
        
        if (toRow > fromRow) rowStep = 1;
        else if (toRow < fromRow) rowStep = -1;
        
        if (toCol > fromCol) colStep = 1;
        else if (toCol < fromCol) colStep = -1;
        
        int8 currentRow = fromRow + rowStep;
        int8 currentCol = fromCol + colStep;
        
        while (currentRow != toRow || currentCol != toCol) {
            uint8 pos = uint8(currentRow * 8 + currentCol);
            if (game.board[pos] != uint8(PieceType.Empty)) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }
    
    function wouldBeInCheck(uint256 gameId, uint8 fromPos, uint8 toPos, bool isWhite) private view returns (bool) {
        // Create a temporary board state
        Game storage game = games[gameId];
        uint8[64] memory tempBoard;
        for (uint8 i = 0; i < 64; i++) {
            tempBoard[i] = game.board[i];
        }
        
        // Make the move temporarily
        tempBoard[toPos] = tempBoard[fromPos];
        tempBoard[fromPos] = uint8(PieceType.Empty);
        
        // Find king position
        uint8 kingPos = 255;
        uint8 kingPiece = isWhite ? uint8(PieceType.WKing) : uint8(PieceType.BKing);
        for (uint8 i = 0; i < 64; i++) {
            if (tempBoard[i] == kingPiece) {
                kingPos = i;
                break;
            }
        }
        
        if (kingPos == 255) return true; // King not found, invalid state
        
        // Check if any opponent piece can attack the king
        for (uint8 i = 0; i < 64; i++) {
            uint8 piece = tempBoard[i];
            if (piece == uint8(PieceType.Empty)) continue;
            if (isWhitePiece(piece) == isWhite) continue;
            
            // Check if this piece can attack the king position
            if (canPieceAttack(tempBoard, i, kingPos, piece)) {
                return true;
            }
        }
        
        return false;
    }
    
    function isSquareAttacked(uint256 gameId, uint8 pos, bool byWhite) private view returns (bool) {
        Game storage game = games[gameId];
        
        for (uint8 i = 0; i < 64; i++) {
            uint8 piece = game.board[i];
            if (piece == uint8(PieceType.Empty)) continue;
            if (isWhitePiece(piece) != byWhite) continue;
            
            if (canPieceAttack(game.board, i, pos, piece)) {
                return true;
            }
        }
        
        return false;
    }
    
    function canPieceAttack(uint8[64] memory board, uint8 fromPos, uint8 toPos, uint8 piece) private pure returns (bool) {
        uint8 fromRow = fromPos / 8;
        uint8 fromCol = fromPos % 8;
        uint8 toRow = toPos / 8;
        uint8 toCol = toPos % 8;
        
        int8 rowDiff = int8(toRow) - int8(fromRow);
        int8 colDiff = int8(toCol) - int8(fromCol);
        
        if (piece == uint8(PieceType.WPawn)) {
            return abs(colDiff) == 1 && rowDiff == -1;
        } else if (piece == uint8(PieceType.BPawn)) {
            return abs(colDiff) == 1 && rowDiff == 1;
        } else if (piece == uint8(PieceType.WKnight) || piece == uint8(PieceType.BKnight)) {
            int8 absRow = abs(rowDiff);
            int8 absCol = abs(colDiff);
            return (absRow == 2 && absCol == 1) || (absRow == 1 && absCol == 2);
        } else if (piece == uint8(PieceType.WBishop) || piece == uint8(PieceType.BBishop)) {
            return abs(rowDiff) == abs(colDiff) && isPathClearArray(board, fromPos, toPos);
        } else if (piece == uint8(PieceType.WRook) || piece == uint8(PieceType.BRook)) {
            return (rowDiff == 0 || colDiff == 0) && isPathClearArray(board, fromPos, toPos);
        } else if (piece == uint8(PieceType.WQueen) || piece == uint8(PieceType.BQueen)) {
            return (rowDiff == 0 || colDiff == 0 || abs(rowDiff) == abs(colDiff)) && isPathClearArray(board, fromPos, toPos);
        } else if (piece == uint8(PieceType.WKing) || piece == uint8(PieceType.BKing)) {
            return abs(rowDiff) <= 1 && abs(colDiff) <= 1;
        }
        
        return false;
    }
    
    function isPathClearArray(uint8[64] memory board, uint8 fromPos, uint8 toPos) private pure returns (bool) {
        int8 fromRow = int8(fromPos / 8);
        int8 fromCol = int8(fromPos % 8);
        int8 toRow = int8(toPos / 8);
        int8 toCol = int8(toPos % 8);
        
        int8 rowStep = 0;
        int8 colStep = 0;
        
        if (toRow > fromRow) rowStep = 1;
        else if (toRow < fromRow) rowStep = -1;
        
        if (toCol > fromCol) colStep = 1;
        else if (toCol < fromCol) colStep = -1;
        
        int8 currentRow = fromRow + rowStep;
        int8 currentCol = fromCol + colStep;
        
        while (currentRow != toRow || currentCol != toCol) {
            uint8 pos = uint8(currentRow * 8 + currentCol);
            if (board[pos] != uint8(PieceType.Empty)) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }
    
    function checkGameEnd(uint256 gameId) private {
        Game storage game = games[gameId];
        
        bool isWhiteTurn = game.whiteTurn;
        bool hasLegalMove = false;
        
        // Check if current player has any legal moves
        for (uint8 from = 0; from < 64 && !hasLegalMove; from++) {
            uint8 piece = game.board[from];
            if (piece == uint8(PieceType.Empty)) continue;
            if (isWhitePiece(piece) != isWhiteTurn) continue;
            
            for (uint8 to = 0; to < 64 && !hasLegalMove; to++) {
                if (from == to) continue;
                
                uint8 targetPiece = game.board[to];
                if (targetPiece != uint8(PieceType.Empty) && isWhitePiece(targetPiece) == isWhiteTurn) continue;
                
                if (isValidMove(gameId, from, to) && !wouldBeInCheck(gameId, from, to, isWhiteTurn)) {
                    hasLegalMove = true;
                }
            }
        }
        
        if (!hasLegalMove) {
            // Check if in check (checkmate) or not (stalemate)
            uint8 kingPiece = isWhiteTurn ? uint8(PieceType.WKing) : uint8(PieceType.BKing);
            uint8 kingPos = 255;
            for (uint8 i = 0; i < 64; i++) {
                if (game.board[i] == kingPiece) {
                    kingPos = i;
                    break;
                }
            }
            
            if (isSquareAttacked(gameId, kingPos, !isWhiteTurn)) {
                // Checkmate
                game.state = isWhiteTurn ? GameState.BlackWon : GameState.WhiteWon;
                payoutWinner(gameId);
            } else {
                // Stalemate
                game.state = GameState.Draw;
                payoutDraw(gameId);
            }
            
            emit GameEnded(gameId, game.state);
        }
    }
    
    /**
     * @dev Claim win by timeout
     */
    function claimTimeout(uint256 gameId) external onlyPlayer(gameId) {
        Game storage game = games[gameId];
        require(game.state == GameState.Active, "Game is not active");
        require(block.timestamp - game.lastMoveTime >= MOVE_TIMEOUT, "Timeout period not reached");
        
        bool isWhite = msg.sender == game.whitePlayer;
        game.state = isWhite ? GameState.WhiteWon : GameState.BlackWon;
        
        payoutWinner(gameId);
        emit GameAbandoned(gameId, msg.sender);
    }
    
    /**
     * @dev Offer/accept draw
     */
    function offerDraw(uint256 gameId) external onlyPlayer(gameId) gameActive(gameId) {
        Game storage game = games[gameId];
        game.state = GameState.Draw;
        payoutDraw(gameId);
        emit GameEnded(gameId, GameState.Draw);
    }
    
    function payoutWinner(uint256 gameId) private {
        Game storage game = games[gameId];
        if (game.wager > 0) {
            address winner = game.state == GameState.WhiteWon ? game.whitePlayer : game.blackPlayer;
            uint256 payout = game.wager * 2;
            game.wager = 0;
            (bool success, ) = payable(winner).call{value: payout}("");
            require(success, "Payout failed");
        }
    }
    
    function payoutDraw(uint256 gameId) private {
        Game storage game = games[gameId];
        if (game.wager > 0) {
            uint256 refund = game.wager;
            game.wager = 0;
            (bool successWhite, ) = payable(game.whitePlayer).call{value: refund}("");
            require(successWhite, "White refund failed");
            (bool successBlack, ) = payable(game.blackPlayer).call{value: refund}("");
            require(successBlack, "Black refund failed");
        }
    }
    
    function abs(int8 x) private pure returns (int8) {
        return x >= 0 ? x : -x;
    }
    
    /**
     * @dev Get the current board state
     */
    function getBoard(uint256 gameId) external view returns (uint8[64] memory) {
        return games[gameId].board;
    }
    
    /**
     * @dev Get game info
     */
    function getGameInfo(uint256 gameId) external view returns (
        address whitePlayer,
        address blackPlayer,
        bool whiteTurn,
        GameState state,
        uint256 wager,
        uint256 moveCount
    ) {
        Game storage game = games[gameId];
        return (
            game.whitePlayer,
            game.blackPlayer,
            game.whiteTurn,
            game.state,
            game.wager,
            game.moveCount
        );
    }
    
    /**
     * @dev Get player's games
     */
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }
}
