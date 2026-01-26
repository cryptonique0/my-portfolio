'use client';

import { useState, useEffect } from 'react';
import { useChessPuzzles } from '../../hooks/useAdvancedContracts';
import PuzzleBoard from '../chess/PuzzleBoard';
import { 
  GameState, 
  Move, 
  makeMove, 
  createStateFromFEN,
  moveToUCI 
} from '../../lib/chessEngine';
import { 
  ChessPuzzle, 
  getRandomPuzzle, 
  getPuzzleByRating,
  PUZZLE_THEMES, 
  PUZZLE_DIFFICULTIES 
} from '../../lib/puzzleData';
import styles from './PuzzleTraining.module.css';

interface DailyScore {
  player: string;
  score: number;
  puzzlesSolved: number;
  avgTime: number;
}

export default function PuzzleTraining() {
  const { 
    puzzleStats, 
    attemptPuzzle,
    today,
    leaderboardPrizePool,
    getDailyRankings,
    getPlayerDailyScore,
    addPlayerToLeaderboard
  } = useChessPuzzles();
  
  const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [isSolved, setIsSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [playerRating, setPlayerRating] = useState(1500);
  const [localStats, setLocalStats] = useState({ solved: 0, attempted: 0, streak: 0 });
  const [dailyRankings, setDailyRankings] = useState<DailyScore[]>([]);
  const [playerDailyScore, setPlayerDailyScore] = useState({ score: 0, puzzles: 0, avgTime: 0 });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Use hook data directly for today and prize pool
  const currentDay = today ? Number(today) : 0;
  const currentPrizePool = leaderboardPrizePool ? leaderboardPrizePool.toString() : '0';


  // Load local stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('puzzleStats');
    if (saved) {
      setLocalStats(JSON.parse(saved));
    }
  }, []);

  // Load player rating from stats (blockchain or local)
  useEffect(() => {
    if (puzzleStats && puzzleStats[4]) {
      setPlayerRating(Number(puzzleStats[4]) || 1500);
    }
  }, [puzzleStats]);

  // Load initial puzzle
  useEffect(() => {
    loadNewPuzzle();
    loadDailyLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load daily leaderboard
  const loadDailyLeaderboard = async () => {
    try {
      if (currentDay > 0) {
        const rankings = getDailyRankings(currentDay);
        if (rankings && Array.isArray(rankings)) {
          const formattedRankings = rankings.map((r: any) => ({
            player: r.player,
            score: Number(r.score),
            puzzlesSolved: Number(r.puzzlesSolved),
            avgTime: Number(r.avgTime)
          }));
          setDailyRankings(formattedRankings);
        }
        
        const score = getPlayerDailyScore(currentDay);
        if (score && Array.isArray(score)) {
          setPlayerDailyScore({
            score: Number(score[0]),
            puzzles: Number(score[1]),
            avgTime: Number(score[2])
          });
        }
      }
    } catch (error) {
      console.log('Could not load leaderboard:', error);
    }
  };

  const loadNewPuzzle = () => {
    let puzzle: ChessPuzzle | undefined;
    
    // Try to get puzzle matching player rating
    puzzle = getPuzzleByRating(playerRating - 200, playerRating + 200);
    
    // Fallback to random puzzle
    if (!puzzle) {
      puzzle = getRandomPuzzle();
    }
    
    setCurrentPuzzle(puzzle);
    setGameState(createStateFromFEN(puzzle.fen));
    setMoveIndex(0);
    setFeedback('');
    setFeedbackType('info');
    setIsSolved(false);
    setStartTime(Date.now());
    setAttempts(0);
  };

  const handleMove = (move: Move) => {
    if (!currentPuzzle || !gameState || isSolved) return;

    const uciMove = moveToUCI(move);
    const expectedMove = currentPuzzle.moves[moveIndex];

    // Check if the move is correct
    if (uciMove === expectedMove) {
      // Correct move!
      const newState = makeMove(gameState, move);
      setGameState(newState);
      setMoveIndex(moveIndex + 1);
      setAttempts(attempts + 1);

      // Check if puzzle is complete
      if (moveIndex + 1 >= currentPuzzle.moves.length) {
        handlePuzzleSolved();
      } else {
        setFeedback(`✓ Correct! Move ${moveIndex + 1}/${currentPuzzle.moves.length}`);
        setFeedbackType('success');
        
        // Auto-play opponent's response if there is one
        if (moveIndex + 1 < currentPuzzle.moves.length) {
          setTimeout(() => playOpponentMove(), 500);
        }
      }
    } else {
      // Wrong move
      setFeedback('✗ Not the best move. Try again!');
      setFeedbackType('error');
      setAttempts(attempts + 1);
      
      // Reset to puzzle start after wrong move
      setTimeout(() => {
        setGameState(createStateFromFEN(currentPuzzle.fen));
        setMoveIndex(0);
        setFeedback('Puzzle reset. Try again!');
        setFeedbackType('info');
      }, 1500);
    }
  };

  const playOpponentMove = () => {
    if (!currentPuzzle || !gameState) return;

    const opponentMoveUCI = currentPuzzle.moves[moveIndex];
    const move = uciToMove(opponentMoveUCI, gameState);
    
    if (move) {
      const newState = makeMove(gameState, move);
      setGameState(newState);
      setMoveIndex(moveIndex + 1);
      
      if (moveIndex + 1 < currentPuzzle.moves.length) {
        setFeedback('Opponent played. Your turn!');
        setFeedbackType('info');
      }
    }
  };

  const uciToMove = (uci: string, state: GameState): Move | null => {
    const from = (8 - parseInt(uci[1])) * 8 + (uci.charCodeAt(0) - 97);
    const to = (8 - parseInt(uci[3])) * 8 + (uci.charCodeAt(2) - 97);
    
    return {
      from,
      to,
      piece: state.board[from],
      capturedPiece: state.board[to]
    };
  };

  const handlePuzzleSolved = async () => {
    setIsSolved(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    setFeedback('🎉 Puzzle solved! Excellent!');
    setFeedbackType('success');

    // Update local stats
    const newStats = {
      solved: localStats.solved + 1,
      attempted: localStats.attempted + 1,
      streak: localStats.streak + 1
    };
    setLocalStats(newStats);
    localStorage.setItem('puzzleStats', JSON.stringify(newStats));

    // Try to submit to blockchain (optional)
    try {
      if (currentPuzzle && attemptPuzzle) {
        await attemptPuzzle(
          currentPuzzle.id, 
          currentPuzzle.moves, 
          timeSpent
        );
        
        // Update player on leaderboard after solving
        if (addPlayerToLeaderboard && currentDay) {
          await addPlayerToLeaderboard(currentDay);
        }
        
        // Reload leaderboard
        loadDailyLeaderboard();
      }
    } catch (error) {
      console.log('Blockchain submission skipped:', error);
      // Continue anyway - puzzle solving works offline
    }
  };

  const showHint = () => {
    if (!currentPuzzle || isSolved) return;
    
    const nextMove = currentPuzzle.moves[moveIndex];
    const fromSquare = nextMove.slice(0, 2);
    const toSquare = nextMove.slice(2, 4);
    
    setFeedback(`💡 Hint: Move from ${fromSquare} to ${toSquare}`);
    setFeedbackType('info');
  };

  const skipPuzzle = () => {
    loadNewPuzzle();
    setFeedback('Puzzle skipped. Try this one!');
    setFeedbackType('info');
  };

  if (!currentPuzzle || !gameState) {
    return <div className={styles.loading}>Loading puzzle...</div>;
  }

  const playerColor = gameState.isWhiteTurn ? 'white' : 'black';

  return (
    <div className={styles.puzzleTraining}>
      <div className={styles.header}>
        <h1>Puzzle Training</h1>
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Rating</span>
            <span className={styles.statValue}>{playerRating}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Solved</span>
            <span className={styles.statValue}>
              {puzzleStats ? Number(puzzleStats[1]) : localStats.solved}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Streak</span>
            <span className={styles.statValue}>
              {puzzleStats ? Number(puzzleStats[2]) : localStats.streak}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.puzzleContainer}>
        <div className={styles.puzzleInfo}>
          <div className={styles.infoBadge}>
            <span className={styles.theme}>{PUZZLE_THEMES[currentPuzzle.theme]}</span>
            <span className={styles.difficulty}>{PUZZLE_DIFFICULTIES[currentPuzzle.difficulty]}</span>
            <span className={styles.rating}>⚡ {currentPuzzle.rating}</span>
          </div>
          
          <div className={styles.instructions}>
            <h3>{currentPuzzle.description}</h3>
            <p className={styles.turnIndicator}>
              {playerColor === 'white' ? '♔' : '♚'} {playerColor === 'white' ? 'White' : 'Black'} to move
            </p>
            <p className={styles.progress}>
              Move {moveIndex + 1} of {currentPuzzle.moves.length}
            </p>
          </div>
        </div>

        <div className={styles.boardContainer}>
          <PuzzleBoard
            gameState={gameState}
            onMove={handleMove}
            disabled={isSolved}
            highlightLegalMoves={true}
            playerColor={playerColor}
          />
        </div>

        <div className={styles.controls}>
          {feedback && (
            <div className={`${styles.feedback} ${styles[feedbackType]}`}>
              {feedback}
            </div>
          )}

          <div className={styles.actions}>
            <button 
              className={styles.hintButton} 
              onClick={showHint}
              disabled={isSolved}
            >
              💡 Hint
            </button>
            <button 
              className={styles.skipButton} 
              onClick={skipPuzzle}
            >
              Skip Puzzle
            </button>
            <button 
              className={styles.nextButton} 
              onClick={loadNewPuzzle}
              disabled={!isSolved}
            >
              Next Puzzle →
            </button>
          </div>

          <div className={styles.stats}>
            <span>Attempts: {attempts}</span>
            <span>Time: {Math.floor((Date.now() - startTime) / 1000)}s</span>
          </div>
        </div>
      </div>

      <div className={styles.dailyChallenge}>
        <div className={styles.challengeHeader}>
          <h2>🏆 Daily Leaderboard</h2>
          <button 
            className={styles.toggleButton}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            {showLeaderboard ? '▼' : '▶'} {showLeaderboard ? 'Hide' : 'Show'}
          </button>
        </div>
        
        <div className={styles.prizeInfo}>
          <div className={styles.prizePool}>
            Daily Prize Pool: <strong>{(parseFloat(currentPrizePool) / 1e18).toFixed(4)} ETH</strong>
          </div>
          <div className={styles.playerScore}>
            Your Score Today: <strong>{playerDailyScore.score}</strong> 
            ({playerDailyScore.puzzles} puzzles)
          </div>
        </div>

        {showLeaderboard && (
          <div className={styles.leaderboard}>
            <div className={styles.rewardDistribution}>
              <h4>Reward Distribution (Top 10)</h4>
              <div className={styles.distribution}>
                🥇 1st: 30% | 🥈 2nd: 20% | 🥉 3rd: 15% | 4th: 10% | 5th: 8% | 6th-10th: 2-6%
              </div>
            </div>
            
            <table className={styles.rankingsTable}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Puzzles</th>
                  <th>Avg Time</th>
                  <th>Reward</th>
                </tr>
              </thead>
              <tbody>
                {dailyRankings.length > 0 ? (
                  dailyRankings.slice(0, 10).map((ranking, index) => {
                    const rewardPercent = [30, 20, 15, 10, 8, 6, 4, 3, 2, 2][index] || 0;
                    const rewardAmount = (parseFloat(currentPrizePool) / 1e18) * (rewardPercent / 100);
                    
                    return (
                      <tr key={index} className={index < 3 ? styles.topThree : ''}>
                        <td>
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </td>
                        <td className={styles.playerAddress}>
                          {ranking.player.slice(0, 6)}...{ranking.player.slice(-4)}
                        </td>
                        <td><strong>{ranking.score}</strong></td>
                        <td>{ranking.puzzlesSolved}</td>
                        <td>{ranking.avgTime}s</td>
                        <td className={styles.reward}>
                          {rewardAmount.toFixed(4)} ETH
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className={styles.noData}>
                      No rankings yet today. Solve puzzles to get on the leaderboard!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div className={styles.leaderboardActions}>
              <button 
                className={styles.refreshButton}
                onClick={loadDailyLeaderboard}
              >
                🔄 Refresh Leaderboard
              </button>
            </div>
          </div>
        )}
        
        <p className={styles.note}>
          Solve puzzles to earn points! The top 10 players each day share the 0.1 ETH prize pool.
        </p>
      </div>
    </div>
  );
}
