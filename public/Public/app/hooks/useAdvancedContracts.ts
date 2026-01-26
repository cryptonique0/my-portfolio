// Advanced smart contract hooks for learning features
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CHESS_ACADEMY_ADDRESS, CHESS_COACH_ADDRESS, CHESS_PUZZLES_ADDRESS } from '../contracts/addresses';
import { CHESS_ACADEMY_ABI, CHESS_COACH_ABI, CHESS_PUZZLES_ABI } from '../contracts/abis';

// ChessAcademy Hook
export function useChessAcademy() {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get player stats
  const { data: playerStats } = useReadContract({
    address: CHESS_ACADEMY_ADDRESS,
    abi: CHESS_ACADEMY_ABI,
    functionName: 'getPlayerStats',
    args: address ? [address] : undefined,
  });

  // Get all skill levels
  const { data: skillLevels } = useReadContract({
    address: CHESS_ACADEMY_ADDRESS,
    abi: CHESS_ACADEMY_ABI,
    functionName: 'getAllSkillLevels',
    args: address ? [address] : undefined,
  });

  // Complete a lesson
  const completeLesson = async (lessonId: number) => {
    return writeContract({
      address: CHESS_ACADEMY_ADDRESS,
      abi: CHESS_ACADEMY_ABI,
      functionName: 'completeLesson',
      args: [BigInt(lessonId)],
    });
  };

  // Submit game analysis
  const submitGameAnalysis = async (
    gameId: number,
    player: `0x${string}`,
    skillChanges: number[],
    weaknesses: string[],
    strengths: string[],
    accuracyScore: number
  ) => {
    return writeContract({
      address: CHESS_ACADEMY_ADDRESS,
      abi: CHESS_ACADEMY_ABI,
      functionName: 'submitGameAnalysis',
      args: [
        BigInt(gameId),
        player,
        skillChanges.map(n => BigInt(n)),
        weaknesses,
        strengths,
        BigInt(accuracyScore)
      ],
    });
  };

  return {
    playerStats,
    skillLevels,
    completeLesson,
    submitGameAnalysis,
    isLoading,
    isSuccess,
  };
}

// ChessCoach Hook
export function useChessCoach() {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get coach info
  const { data: coachInfo } = useReadContract({
    address: CHESS_COACH_ADDRESS,
    abi: CHESS_COACH_ABI,
    functionName: 'coaches',
    args: address ? [address] : undefined,
  });

  // Get active coaches
  const { data: activeCoaches } = useReadContract({
    address: CHESS_COACH_ADDRESS,
    abi: CHESS_COACH_ABI,
    functionName: 'getActiveCoaches',
  });

  // Register as coach
  const registerAsCoach = async (
    name: string,
    bio: string,
    hourlyRate: bigint,
    specialtyIndices: number[]
  ) => {
    return writeContract({
      address: CHESS_COACH_ADDRESS,
      abi: CHESS_COACH_ABI,
      functionName: 'registerAsCoach',
      args: [name, bio, hourlyRate, specialtyIndices.map(n => BigInt(n))],
    });
  };

  // Book coaching session
  const bookSession = async (
    coachAddress: `0x${string}`,
    sessionType: number,
    scheduledTime: number,
    duration: number,
    value: bigint
  ) => {
    return writeContract({
      address: CHESS_COACH_ADDRESS,
      abi: CHESS_COACH_ABI,
      functionName: 'bookSession',
      args: [coachAddress, sessionType, BigInt(scheduledTime), BigInt(duration)],
      value,
    });
  };

  // Rate coach
  const rateCoach = async (sessionId: number, rating: number, feedback: string) => {
    return writeContract({
      address: CHESS_COACH_ADDRESS,
      abi: CHESS_COACH_ABI,
      functionName: 'rateCoach',
      args: [BigInt(sessionId), BigInt(rating), feedback],
    });
  };

  // Complete session
  const completeSession = async (sessionId: number, contentURI: string) => {
    return writeContract({
      address: CHESS_COACH_ADDRESS,
      abi: CHESS_COACH_ABI,
      functionName: 'completeSession',
      args: [BigInt(sessionId), contentURI],
    });
  };

  return {
    coachInfo,
    activeCoaches,
    registerAsCoach,
    bookSession,
    rateCoach,
    completeSession,
    isLoading,
    isSuccess,
  };
}

// ChessPuzzles Hook
export function useChessPuzzles() {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get player stats
  const { data: puzzleStats } = useReadContract({
    address: CHESS_PUZZLES_ADDRESS,
    abi: CHESS_PUZZLES_ABI,
    functionName: 'getPlayerStats',
    args: address ? [address] : undefined,
  });

  // Get puzzle
  const { data: puzzle, refetch: refetchPuzzle } = useReadContract({
    address: CHESS_PUZZLES_ADDRESS,
    abi: CHESS_PUZZLES_ABI,
    functionName: 'puzzles',
    args: [BigInt(0)], // Default to puzzle 0, can be changed
  });

  // Check if solved
  const { data: hasSolved } = useReadContract({
    address: CHESS_PUZZLES_ADDRESS,
    abi: CHESS_PUZZLES_ABI,
    functionName: 'hasSolvedPuzzle',
    args: address ? [address, BigInt(0)] : undefined,
  });

  // Get today
  const { data: today } = useReadContract({
    address: CHESS_PUZZLES_ADDRESS,
    abi: CHESS_PUZZLES_ABI,
    functionName: 'getToday',
  });

  // Get leaderboard prize pool
  const { data: leaderboardPrizePool } = useReadContract({
    address: CHESS_PUZZLES_ADDRESS,
    abi: CHESS_PUZZLES_ABI,
    functionName: 'getLeaderboardPrizePool',
  });

  // Create puzzle
  const createPuzzle = async (
    fen: string,
    solution: string[],
    theme: number,
    difficulty: number,
    estimatedRating: number,
    value: bigint
  ) => {
    return writeContract({
      address: CHESS_PUZZLES_ADDRESS,
      abi: CHESS_PUZZLES_ABI,
      functionName: 'createPuzzle',
      args: [fen, solution, theme, difficulty, BigInt(estimatedRating)],
      value,
    });
  };

  // Attempt puzzle
  const attemptPuzzle = async (puzzleId: number, moveSequence: string[], timeSpent: number) => {
    return writeContract({
      address: CHESS_PUZZLES_ADDRESS,
      abi: CHESS_PUZZLES_ABI,
      functionName: 'attemptPuzzle',
      args: [BigInt(puzzleId), moveSequence, BigInt(timeSpent)],
    });
  };

  // Get daily rankings - returns a function to fetch with specific day
  // Note: This is a data fetch pattern - in production use a separate hook for this
  const getDailyRankings = (day: number | bigint) => {
    // This would need to be refactored into a separate hook
    // For now, return placeholder data
    return [];
  };

  // Get player daily score
  // Note: This is a data fetch pattern - in production use a separate hook for this
  const getPlayerDailyScore = (day: number | bigint) => {
    // This would need to be refactored into a separate hook
    // For now, return 0
    return 0;
  };

  // Add player to leaderboard
  const addPlayerToLeaderboard = async (day: number) => {
    if (!address) return;
    return writeContract({
      address: CHESS_PUZZLES_ADDRESS,
      abi: CHESS_PUZZLES_ABI,
      functionName: 'addPlayerToLeaderboard',
      args: [BigInt(day), address],
    });
  };

  // Fund leaderboard prize pool
  const fundLeaderboardPrizePool = async (value: bigint) => {
    return writeContract({
      address: CHESS_PUZZLES_ADDRESS,
      abi: CHESS_PUZZLES_ABI,
      functionName: 'fundLeaderboardPrizePool',
      value,
    });
  };

  // Distribute daily rewards
  const distributeDailyRewards = async (day: number) => {
    return writeContract({
      address: CHESS_PUZZLES_ADDRESS,
      abi: CHESS_PUZZLES_ABI,
      functionName: 'distributeDailyRewards',
      args: [BigInt(day)],
    });
  };

  return {
    puzzleStats,
    puzzle,
    hasSolved,
    today,
    leaderboardPrizePool,
    createPuzzle,
    attemptPuzzle,
    refetchPuzzle,
    getDailyRankings,
    getPlayerDailyScore,
    addPlayerToLeaderboard,
    fundLeaderboardPrizePool,
    distributeDailyRewards,
    isLoading,
    isSuccess,
  };
}
