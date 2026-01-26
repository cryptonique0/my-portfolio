// Chess Contract ABI - Generated from Chess.sol
export const CHESS_ABI = [
  // Events
  {
    type: "event",
    name: "GameCreated",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "whitePlayer", type: "address", indexed: true },
      { name: "blackPlayer", type: "address", indexed: true },
      { name: "wager", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "MoveMade",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "fromPos", type: "uint8", indexed: false },
      { name: "toPos", type: "uint8", indexed: false }
    ]
  },
  {
    type: "event",
    name: "GameEnded",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "result", type: "uint8", indexed: false }
    ]
  },
  {
    type: "event",
    name: "GameAbandoned",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: false }
    ]
  },

  // State Variables
  {
    type: "function",
    name: "gameCounter",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "MOVE_TIMEOUT",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "games",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [
      { name: "whitePlayer", type: "address" },
      { name: "blackPlayer", type: "address" },
      { name: "whiteTurn", type: "bool" },
      { name: "state", type: "uint8" },
      { name: "wager", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "lastMoveTime", type: "uint256" },
      { name: "whiteKingMoved", type: "bool" },
      { name: "blackKingMoved", type: "bool" },
      { name: "whiteRookA1Moved", type: "bool" },
      { name: "whiteRookH1Moved", type: "bool" },
      { name: "blackRookA8Moved", type: "bool" },
      { name: "blackRookH8Moved", type: "bool" },
      { name: "enPassantCol", type: "uint8" },
      { name: "moveCount", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "playerGames",
    inputs: [
      { name: "player", type: "address" },
      { name: "index", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },

  // Functions
  {
    type: "function",
    name: "createGame",
    inputs: [{ name: "opponent", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "joinGame",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "makeMove",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "fromPos", type: "uint8" },
      { name: "toPos", type: "uint8" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "makeMoveProm",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "fromPos", type: "uint8" },
      { name: "toPos", type: "uint8" },
      { name: "promotionPiece", type: "uint8" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "claimTimeout",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "offerDraw",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "acceptDraw",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "resign",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getBoard",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8[64]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getGameState",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [
      { name: "whitePlayer", type: "address" },
      { name: "blackPlayer", type: "address" },
      { name: "board", type: "uint8[64]" },
      { name: "whiteTurn", type: "bool" },
      { name: "state", type: "uint8" },
      { name: "wager", type: "uint256" },
      { name: "moveCount", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getPlayerGames",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view"
  }
] as const;

// ChessFactory Contract ABI
export const CHESS_FACTORY_ABI = [
  // Events
  {
    type: "event",
    name: "GameListingCreated",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "wager", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "GameListingFilled",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "joiner", type: "address", indexed: true }
    ]
  },

  // Constructor
  {
    type: "constructor",
    inputs: [{ name: "_chessContract", type: "address" }],
    stateMutability: "nonpayable"
  },

  // State Variables
  {
    type: "function",
    name: "chessContract",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "openGames",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [
      { name: "gameId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "wager", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "filled", type: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "gameIdToListingIndex",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },

  // Functions
  {
    type: "function",
    name: "createOpenGame",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "joinOpenGame",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "getOpenGames",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "gameId", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "wager", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "filled", type: "bool" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "createPrivateGame",
    inputs: [{ name: "opponent", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  }
] as const;

// ChessAcademy Contract ABI
export const CHESS_ACADEMY_ABI = [
  {
    type: "function",
    name: "getPlayerStats",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "totalGamesAnalyzed", type: "uint256" },
      { name: "totalLessons", type: "uint256" },
      { name: "currentStreak", type: "uint256" },
      { name: "longestStreak", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAllSkillLevels",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ name: "", type: "uint256[6]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "completeLesson",
    inputs: [{ name: "lessonId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "submitGameAnalysis",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "player", type: "address" },
      { name: "skillChanges", type: "int256[]" },
      { name: "weaknesses", type: "string[]" },
      { name: "strengths", type: "string[]" },
      { name: "accuracyScore", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getSkillLevel",
    inputs: [
      { name: "player", type: "address" },
      { name: "category", type: "uint8" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "hasAchievement",
    inputs: [
      { name: "player", type: "address" },
      { name: "achievementId", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  }
] as const;

// ChessCoach Contract ABI
export const CHESS_COACH_ABI = [
  {
    type: "function",
    name: "coaches",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "wallet", type: "address" },
      { name: "name", type: "string" },
      { name: "bio", type: "string" },
      { name: "certificationURI", type: "string" },
      { name: "hourlyRate", type: "uint256" },
      { name: "rating", type: "uint256" },
      { name: "totalSessions", type: "uint256" },
      { name: "totalStudents", type: "uint256" },
      { name: "totalEarnings", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "isCertified", type: "bool" },
      { name: "joinedTimestamp", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getActiveCoaches",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "registerAsCoach",
    inputs: [
      { name: "name", type: "string" },
      { name: "bio", type: "string" },
      { name: "hourlyRate", type: "uint256" },
      { name: "specialtyIndices", type: "uint256[]" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "bookSession",
    inputs: [
      { name: "coachAddress", type: "address" },
      { name: "sessionType", type: "uint8" },
      { name: "scheduledTime", type: "uint256" },
      { name: "duration", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "rateCoach",
    inputs: [
      { name: "sessionId", type: "uint256" },
      { name: "rating", type: "uint256" },
      { name: "feedback", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "completeSession",
    inputs: [
      { name: "sessionId", type: "uint256" },
      { name: "contentURI", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;

// ChessPuzzles Contract ABI
export const CHESS_PUZZLES_ABI = [
  {
    type: "function",
    name: "puzzles",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "puzzleId", type: "uint256" },
      { name: "fen", type: "string" },
      { name: "theme", type: "uint8" },
      { name: "difficulty", type: "uint8" },
      { name: "rating", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "createdTimestamp", type: "uint256" },
      { name: "totalAttempts", type: "uint256" },
      { name: "totalSolved", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "rewardPool", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getPlayerStats",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "totalAttempts", type: "uint256" },
      { name: "totalSolved", type: "uint256" },
      { name: "currentStreak", type: "uint256" },
      { name: "longestStreak", type: "uint256" },
      { name: "rating", type: "uint256" },
      { name: "totalRewards", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "createPuzzle",
    inputs: [
      { name: "fen", type: "string" },
      { name: "solution", type: "string[]" },
      { name: "theme", type: "uint8" },
      { name: "difficulty", type: "uint8" },
      { name: "estimatedRating", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "attemptPuzzle",
    inputs: [
      { name: "puzzleId", type: "uint256" },
      { name: "moveSequence", type: "string[]" },
      { name: "timeSpent", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "hasSolvedPuzzle",
    inputs: [
      { name: "player", type: "address" },
      { name: "puzzleId", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getDailyRankings",
    inputs: [{ name: "day", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "player", type: "address" },
          { name: "score", type: "uint256" },
          { name: "puzzlesSolved", type: "uint256" },
          { name: "avgTime", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getPlayerDailyScore",
    inputs: [
      { name: "day", type: "uint256" },
      { name: "player", type: "address" }
    ],
    outputs: [
      { name: "score", type: "uint256" },
      { name: "puzzlesSolved", type: "uint256" },
      { name: "avgTime", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getToday",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getLeaderboardPrizePool",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "addPlayerToLeaderboard",
    inputs: [
      { name: "day", type: "uint256" },
      { name: "player", type: "address" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "fundLeaderboardPrizePool",
    inputs: [],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "distributeDailyRewards",
    inputs: [{ name: "day", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "DailyScoreUpdated",
    inputs: [
      { name: "day", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "score", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "DailyRewardsDistributed",
    inputs: [
      { name: "day", type: "uint256", indexed: true },
      { name: "totalRewards", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "LeaderboardPrizePoolFunded",
    inputs: [
      { name: "amount", type: "uint256", indexed: false },
      { name: "newTotal", type: "uint256", indexed: false }
    ]
  }
] as const;
