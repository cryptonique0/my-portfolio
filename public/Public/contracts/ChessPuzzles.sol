// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChessPuzzles
 * @dev On-chain chess puzzle platform with ratings and rewards
 */
contract ChessPuzzles {
    
    enum PuzzleTheme { Checkmate, Tactics, Endgame, Opening, Middlegame, Trapped, Fork, Pin, Skewer, Discovery }
    enum Difficulty { Beginner, Intermediate, Advanced, Expert, Master }
    
    struct Puzzle {
        uint256 puzzleId;
        string fen; // Starting position
        string[] solution; // Sequence of moves (UCI format)
        PuzzleTheme theme;
        Difficulty difficulty;
        uint256 rating; // ELO-style rating 1000-3000
        address creator;
        uint256 createdTimestamp;
        uint256 totalAttempts;
        uint256 totalSolved;
        bool isActive;
        uint256 rewardPool; // ETH reward for solving
    }
    
    struct PlayerPuzzleStats {
        uint256 totalAttempts;
        uint256 totalSolved;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 puzzleRating; // Player's puzzle rating
        uint256 totalRewardsEarned;
        mapping(uint256 => bool) solvedPuzzles;
        mapping(uint256 => uint256) attemptCounts; // Attempts per puzzle
        mapping(PuzzleTheme => uint256) themeRatings;
    }
    
    struct Attempt {
        uint256 puzzleId;
        address player;
        uint256 timestamp;
        string[] moveSequence;
        bool isSolved;
        uint256 timeSpent; // seconds
        uint256 ratingChange;
    }
    
    struct DailyChallenge {
        uint256 puzzleId;
        uint256 date; // Unix timestamp of day
        uint256 participantCount;
        mapping(address => bool) hasCompleted;
        address[] solvers;
        uint256 prizePool;
    }
    
    struct DailyScore {
        address player;
        uint256 score;
        uint256 puzzlesSolved;
        uint256 avgTime;
    }
    
    struct DailyLeaderboard {
        uint256 day;
        DailyScore[] rankings;
        mapping(address => uint256) playerScores;
        mapping(address => uint256) playerPuzzleCount;
        mapping(address => uint256) playerTotalTime;
        bool rewardsDistributed;
        uint256 prizePool;
    }
    
    // State variables
    mapping(uint256 => Puzzle) public puzzles;
    mapping(address => PlayerPuzzleStats) private playerStats;
    mapping(uint256 => Attempt[]) public puzzleAttempts;
    mapping(uint256 => DailyChallenge) public dailyChallenges;
    mapping(uint256 => DailyLeaderboard) public dailyLeaderboards;
    
    uint256 public puzzleCounter;
    uint256 public attemptCounter;
    address public admin;
    uint256 public constant DAILY_PRIZE_POOL = 0.1 ether;
    uint256 public leaderboardPrizePool;
    
    // Top 10 players get rewards
    uint256[] public rewardDistribution = [30, 20, 15, 10, 8, 6, 4, 3, 2, 2]; // Percentage distribution
    
    // Rating constants
    uint256 constant K_FACTOR = 32; // ELO K-factor
    uint256 constant INITIAL_RATING = 1500;
    
    // Events
    event PuzzleCreated(uint256 indexed puzzleId, address indexed creator, Difficulty difficulty, PuzzleTheme theme);
    event PuzzleAttempted(uint256 indexed puzzleId, address indexed player, bool solved);
    event PuzzleSolved(uint256 indexed puzzleId, address indexed player, uint256 newRating, uint256 reward);
    event RatingUpdated(address indexed player, uint256 newRating, int256 change);
    event StreakUpdated(address indexed player, uint256 newStreak);
    event DailyChallengeCreated(uint256 indexed challengeId, uint256 indexed puzzleId, uint256 prizePool);
    event DailyChallengeCompleted(uint256 indexed challengeId, address indexed player);
    event RewardClaimed(uint256 indexed puzzleId, address indexed player, uint256 amount);
    event DailyScoreUpdated(uint256 indexed day, address indexed player, uint256 score);
    event DailyRewardsDistributed(uint256 indexed day, uint256 totalRewards);
    event LeaderboardPrizePoolFunded(uint256 amount, uint256 newTotal);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Create a new puzzle
     */
    function createPuzzle(
        string memory fen,
        string[] memory solution,
        PuzzleTheme theme,
        Difficulty difficulty,
        uint256 estimatedRating
    ) external payable returns (uint256) {
        require(solution.length > 0, "Solution required");
        require(estimatedRating >= 1000 && estimatedRating <= 3000, "Invalid rating");
        
        uint256 puzzleId = puzzleCounter++;
        Puzzle storage puzzle = puzzles[puzzleId];
        
        puzzle.puzzleId = puzzleId;
        puzzle.fen = fen;
        puzzle.solution = solution;
        puzzle.theme = theme;
        puzzle.difficulty = difficulty;
        puzzle.rating = estimatedRating;
        puzzle.creator = msg.sender;
        puzzle.createdTimestamp = block.timestamp;
        puzzle.isActive = true;
        puzzle.rewardPool = msg.value;
        
        emit PuzzleCreated(puzzleId, msg.sender, difficulty, theme);
        return puzzleId;
    }
    
    /**
     * @dev Submit puzzle solution attempt
     */
    function attemptPuzzle(
        uint256 puzzleId,
        string[] memory moveSequence,
        uint256 timeSpent
    ) external returns (bool) {
        require(puzzles[puzzleId].isActive, "Puzzle not active");
        require(moveSequence.length > 0, "Moves required");
        
        Puzzle storage puzzle = puzzles[puzzleId];
        PlayerPuzzleStats storage stats = playerStats[msg.sender];
        
        // Check if solution is correct
        bool isSolved = checkSolution(puzzleId, moveSequence);
        
        // Record attempt
        Attempt memory attempt = Attempt({
            puzzleId: puzzleId,
            player: msg.sender,
            timestamp: block.timestamp,
            moveSequence: moveSequence,
            isSolved: isSolved,
            timeSpent: timeSpent,
            ratingChange: 0
        });
        
        puzzleAttempts[puzzleId].push(attempt);
        puzzle.totalAttempts++;
        stats.totalAttempts++;
        stats.attemptCounts[puzzleId]++;
        
        // Initialize player rating if first attempt
        if (stats.puzzleRating == 0) {
            stats.puzzleRating = INITIAL_RATING;
        }
        
        emit PuzzleAttempted(puzzleId, msg.sender, isSolved);
        
        if (isSolved && !stats.solvedPuzzles[puzzleId]) {
            handlePuzzleSolved(puzzleId, timeSpent);
        } else if (!isSolved) {
            // Failed attempt - small rating decrease
            updatePlayerRating(msg.sender, puzzleId, false);
        }
        
        return isSolved;
    }
    
    /**
     * @dev Handle successful puzzle solution
     */
    function handlePuzzleSolved(uint256 puzzleId, uint256 timeSpent) internal {
        Puzzle storage puzzle = puzzles[puzzleId];
        PlayerPuzzleStats storage stats = playerStats[msg.sender];
        
        require(!stats.solvedPuzzles[puzzleId], "Already solved");
        
        stats.solvedPuzzles[puzzleId] = true;
        stats.totalSolved++;
        puzzle.totalSolved++;
        
        // Update rating
        updatePlayerRating(msg.sender, puzzleId, true);
        
        // Update theme rating
        uint256 currentThemeRating = stats.themeRatings[puzzle.theme];
        if (currentThemeRating == 0) currentThemeRating = INITIAL_RATING;
        stats.themeRatings[puzzle.theme] = currentThemeRating + 10;
        
        // Update streak
        updateStreak(msg.sender);
        
        // Update daily score
        updateDailyScore(puzzleId, timeSpent);
        
        // Calculate and distribute reward
        uint256 reward = calculateReward(puzzleId, timeSpent, stats.attemptCounts[puzzleId]);
        if (reward > 0 && puzzle.rewardPool >= reward) {
            puzzle.rewardPool -= reward;
            stats.totalRewardsEarned += reward;
            payable(msg.sender).transfer(reward);
            emit RewardClaimed(puzzleId, msg.sender, reward);
        }
        
        emit PuzzleSolved(puzzleId, msg.sender, stats.puzzleRating, reward);
    }
    
    /**
     * @dev Check if submitted solution matches puzzle solution
     */
    function checkSolution(uint256 puzzleId, string[] memory moveSequence) internal view returns (bool) {
        Puzzle storage puzzle = puzzles[puzzleId];
        
        if (moveSequence.length != puzzle.solution.length) {
            return false;
        }
        
        for (uint256 i = 0; i < moveSequence.length; i++) {
            if (keccak256(bytes(moveSequence[i])) != keccak256(bytes(puzzle.solution[i]))) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Update player rating using ELO algorithm
     */
    function updatePlayerRating(address player, uint256 puzzleId, bool won) internal {
        PlayerPuzzleStats storage stats = playerStats[player];
        Puzzle storage puzzle = puzzles[puzzleId];
        
        uint256 playerRating = stats.puzzleRating;
        uint256 puzzleRating = puzzle.rating;
        
        // Calculate expected score
        int256 ratingDiff = int256(puzzleRating) - int256(playerRating);
        uint256 expectedScore = 1000000 / (1 + (10 ** (uint256(ratingDiff) / 400)));
        
        // Calculate actual score (1 for win, 0 for loss)
        uint256 actualScore = won ? 1000000 : 0;
        
        // Calculate rating change
        int256 ratingChange = int256((K_FACTOR * (actualScore - expectedScore)) / 1000000);
        
        // Update player rating
        if (ratingChange >= 0) {
            stats.puzzleRating = playerRating + uint256(ratingChange);
        } else {
            uint256 decrease = uint256(-ratingChange);
            stats.puzzleRating = playerRating > decrease ? playerRating - decrease : playerRating;
        }
        
        // Update puzzle rating slightly based on solve rate
        if (puzzle.totalAttempts > 10) {
            uint256 solveRate = (puzzle.totalSolved * 100) / puzzle.totalAttempts;
            if (solveRate > 70 && puzzle.rating > 1000) {
                puzzle.rating -= 5; // Too easy, decrease rating
            } else if (solveRate < 30 && puzzle.rating < 3000) {
                puzzle.rating += 5; // Too hard, increase rating
            }
        }
        
        emit RatingUpdated(player, stats.puzzleRating, ratingChange);
    }
    
    /**
     * @dev Calculate reward for solving puzzle
     */
    function calculateReward(
        uint256 puzzleId,
        uint256 timeSpent,
        uint256 attempts
    ) internal view returns (uint256) {
        Puzzle storage puzzle = puzzles[puzzleId];
        
        if (puzzle.rewardPool == 0) return 0;
        
        // Base reward from pool
        uint256 baseReward = puzzle.rewardPool / 10; // Max 10% of pool per solve
        
        // Time bonus (faster = more reward)
        uint256 timeBonus = 100;
        if (timeSpent < 30) timeBonus = 150;
        else if (timeSpent < 60) timeBonus = 125;
        else if (timeSpent > 300) timeBonus = 80;
        
        // Attempt penalty (more attempts = less reward)
        uint256 attemptPenalty = 100;
        if (attempts == 1) attemptPenalty = 150;
        else if (attempts == 2) attemptPenalty = 125;
        else if (attempts > 5) attemptPenalty = 50;
        
        uint256 reward = (baseReward * timeBonus * attemptPenalty) / 10000;
        
        return reward > puzzle.rewardPool ? puzzle.rewardPool : reward;
    }
    
    /**
     * @dev Update player's solving streak
     */
    function updateStreak(address player) internal {
        PlayerPuzzleStats storage stats = playerStats[player];
        stats.currentStreak++;
        
        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }
        
        emit StreakUpdated(player, stats.currentStreak);
    }
    
    /**
     * @dev Create daily challenge
     */
    function createDailyChallenge(uint256 puzzleId) external payable onlyAdmin {
        require(puzzles[puzzleId].isActive, "Invalid puzzle");
        
        uint256 today = block.timestamp / 1 days;
        DailyChallenge storage challenge = dailyChallenges[today];
        
        require(challenge.puzzleId == 0, "Challenge already exists");
        
        challenge.puzzleId = puzzleId;
        challenge.date = today;
        challenge.prizePool = msg.value;
        
        emit DailyChallengeCreated(today, puzzleId, msg.value);
    }
    
    /**
     * @dev Complete daily challenge
     */
    function completeDailyChallenge(string[] memory moveSequence) external {
        uint256 today = block.timestamp / 1 days;
        DailyChallenge storage challenge = dailyChallenges[today];
        
        require(challenge.puzzleId != 0, "No challenge today");
        require(!challenge.hasCompleted[msg.sender], "Already completed");
        
        bool solved = checkSolution(challenge.puzzleId, moveSequence);
        require(solved, "Incorrect solution");
        
        challenge.hasCompleted[msg.sender] = true;
        challenge.solvers.push(msg.sender);
        challenge.participantCount++;
        
        emit DailyChallengeCompleted(today, msg.sender);
    }
    
    /**
     * @dev Distribute daily challenge rewards (called after day ends)
     */
    function distributeDailyChallengeRewards(uint256 day) external onlyAdmin {
        DailyChallenge storage challenge = dailyChallenges[day];
        require(challenge.prizePool > 0, "No prize pool");
        require(challenge.participantCount > 0, "No participants");
        
        uint256 rewardPerSolver = challenge.prizePool / challenge.participantCount;
        
        for (uint256 i = 0; i < challenge.solvers.length; i++) {
            address solver = challenge.solvers[i];
            playerStats[solver].totalRewardsEarned += rewardPerSolver;
            payable(solver).transfer(rewardPerSolver);
        }
        
        challenge.prizePool = 0;
    }
    
    /**
     * @dev Get player stats
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalAttempts,
        uint256 totalSolved,
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 rating,
        uint256 totalRewards
    ) {
        PlayerPuzzleStats storage stats = playerStats[player];
        return (
            stats.totalAttempts,
            stats.totalSolved,
            stats.currentStreak,
            stats.longestStreak,
            stats.puzzleRating,
            stats.totalRewardsEarned
        );
    }
    
    /**
     * @dev Check if player solved puzzle
     */
    function hasSolvedPuzzle(address player, uint256 puzzleId) external view returns (bool) {
        return playerStats[player].solvedPuzzles[puzzleId];
    }
    
    /**
     * @dev Get puzzle solution
     */
    function getPuzzleSolution(uint256 puzzleId) external view returns (string[] memory) {
        return puzzles[puzzleId].solution;
    }
    
    /**
     * @dev Get player theme rating
     */
    function getThemeRating(address player, PuzzleTheme theme) external view returns (uint256) {
        uint256 rating = playerStats[player].themeRatings[theme];
        return rating == 0 ? INITIAL_RATING : rating;
    }
    
    /**
     * @dev Get puzzle attempts
     */
    function getPuzzleAttempts(uint256 puzzleId) external view returns (Attempt[] memory) {
        return puzzleAttempts[puzzleId];
    }
    
    /**
     * @dev Get daily challenge solvers
     */
    function getDailyChallengeSolvers(uint256 day) external view returns (address[] memory) {
        return dailyChallenges[day].solvers;
    }
    
    /**
     * @dev Add funds to puzzle reward pool
     */
    function addPuzzleReward(uint256 puzzleId) external payable {
        require(puzzles[puzzleId].isActive, "Puzzle not active");
        puzzles[puzzleId].rewardPool += msg.value;
    }
    
    /**
     * @dev Deactivate puzzle (admin only)
     */
    function deactivatePuzzle(uint256 puzzleId) external onlyAdmin {
        puzzles[puzzleId].isActive = false;
    }
    
    /**
     * @dev Update daily score for player
     */
    function updateDailyScore(uint256 puzzleId, uint256 timeSpent) internal {
        uint256 today = block.timestamp / 1 days;
        DailyLeaderboard storage leaderboard = dailyLeaderboards[today];
        
        if (leaderboard.day == 0) {
            leaderboard.day = today;
            leaderboard.prizePool = DAILY_PRIZE_POOL;
        }
        
        Puzzle storage puzzle = puzzles[puzzleId];
        
        // Calculate score based on puzzle difficulty and time
        uint256 baseScore = puzzle.rating / 10; // Use puzzle rating as base
        uint256 timeBonus = 0;
        
        if (timeSpent < 30) timeBonus = 100;
        else if (timeSpent < 60) timeBonus = 75;
        else if (timeSpent < 120) timeBonus = 50;
        else if (timeSpent < 300) timeBonus = 25;
        
        uint256 score = baseScore + timeBonus;
        
        leaderboard.playerScores[msg.sender] += score;
        leaderboard.playerPuzzleCount[msg.sender]++;
        leaderboard.playerTotalTime[msg.sender] += timeSpent;
        
        emit DailyScoreUpdated(today, msg.sender, leaderboard.playerScores[msg.sender]);
    }
    
    /**
     * @dev Build daily rankings (should be called periodically)
     */
    function updateDailyRankings(uint256 day) external {
        DailyLeaderboard storage leaderboard = dailyLeaderboards[day];
        require(leaderboard.day == day, "No leaderboard for this day");
        
        // Clear existing rankings
        delete leaderboard.rankings;
        
        // This would need an off-chain component to track all players
        // For now, we'll just update when called with known players
    }
    
    /**
     * @dev Add player to daily leaderboard (can be called by anyone to update rankings)
     */
    function addPlayerToLeaderboard(uint256 day, address player) external {
        DailyLeaderboard storage leaderboard = dailyLeaderboards[day];
        require(leaderboard.day == day, "Invalid day");
        require(leaderboard.playerScores[player] > 0, "Player has no score");
        
        uint256 playerCount = leaderboard.playerPuzzleCount[player];
        uint256 avgTime = playerCount > 0 ? leaderboard.playerTotalTime[player] / playerCount : 0;
        
        DailyScore memory newScore = DailyScore({
            player: player,
            score: leaderboard.playerScores[player],
            puzzlesSolved: playerCount,
            avgTime: avgTime
        });
        
        // Insert into rankings (sorted by score)
        bool inserted = false;
        for (uint256 i = 0; i < leaderboard.rankings.length; i++) {
            if (newScore.score > leaderboard.rankings[i].score) {
                // Shift elements and insert
                leaderboard.rankings.push(leaderboard.rankings[leaderboard.rankings.length - 1]);
                for (uint256 j = leaderboard.rankings.length - 1; j > i; j--) {
                    leaderboard.rankings[j] = leaderboard.rankings[j - 1];
                }
                leaderboard.rankings[i] = newScore;
                inserted = true;
                break;
            }
        }
        
        if (!inserted && leaderboard.rankings.length < 100) {
            leaderboard.rankings.push(newScore);
        }
    }
    
    /**
     * @dev Distribute daily rewards to top 10 players
     */
    function distributeDailyRewards(uint256 day) external {
        DailyLeaderboard storage leaderboard = dailyLeaderboards[day];
        require(leaderboard.day == day, "Invalid day");
        require(!leaderboard.rewardsDistributed, "Rewards already distributed");
        require(block.timestamp / 1 days > day, "Day not ended");
        require(leaderboard.prizePool > 0 || leaderboardPrizePool >= DAILY_PRIZE_POOL, "Insufficient prize pool");
        
        uint256 prizePool = leaderboard.prizePool > 0 ? leaderboard.prizePool : DAILY_PRIZE_POOL;
        
        // Use available prize pool from contract
        if (leaderboardPrizePool >= prizePool) {
            leaderboardPrizePool -= prizePool;
        } else {
            prizePool = leaderboardPrizePool;
            leaderboardPrizePool = 0;
        }
        
        uint256 topPlayersCount = leaderboard.rankings.length < 10 ? leaderboard.rankings.length : 10;
        uint256 totalDistributed = 0;
        
        for (uint256 i = 0; i < topPlayersCount; i++) {
            address player = leaderboard.rankings[i].player;
            uint256 reward = (prizePool * rewardDistribution[i]) / 100;
            
            playerStats[player].totalRewardsEarned += reward;
            payable(player).transfer(reward);
            totalDistributed += reward;
        }
        
        leaderboard.rewardsDistributed = true;
        
        emit DailyRewardsDistributed(day, totalDistributed);
    }
    
    /**
     * @dev Fund the leaderboard prize pool
     */
    function fundLeaderboardPrizePool() external payable {
        require(msg.value > 0, "Must send ETH");
        leaderboardPrizePool += msg.value;
        
        emit LeaderboardPrizePoolFunded(msg.value, leaderboardPrizePool);
    }
    
    /**
     * @dev Get daily leaderboard rankings
     */
    function getDailyRankings(uint256 day) external view returns (DailyScore[] memory) {
        return dailyLeaderboards[day].rankings;
    }
    
    /**
     * @dev Get player's daily score
     */
    function getPlayerDailyScore(uint256 day, address player) external view returns (
        uint256 score,
        uint256 puzzlesSolved,
        uint256 avgTime
    ) {
        DailyLeaderboard storage leaderboard = dailyLeaderboards[day];
        uint256 count = leaderboard.playerPuzzleCount[player];
        uint256 avg = count > 0 ? leaderboard.playerTotalTime[player] / count : 0;
        
        return (
            leaderboard.playerScores[player],
            count,
            avg
        );
    }
    
    /**
     * @dev Get today's day number
     */
    function getToday() external view returns (uint256) {
        return block.timestamp / 1 days;
    }
    
    /**
     * @dev Get leaderboard prize pool balance
     */
    function getLeaderboardPrizePool() external view returns (uint256) {
        return leaderboardPrizePool;
    }
}
