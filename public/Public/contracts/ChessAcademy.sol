// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChessAcademy
 * @dev Learning platform with skill tracking, achievements, and NFT certificates
 */
contract ChessAcademy {
    
    // Skill levels for different aspects of chess
    enum SkillCategory { Opening, Middlegame, Endgame, Tactics, Strategy, Calculate }
    
    struct PlayerProfile {
        uint256 totalGamesAnalyzed;
        uint256 totalLessonsCompleted;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastActivityTimestamp;
        mapping(SkillCategory => uint256) skillLevels; // 0-1000 rating per category
        mapping(uint256 => bool) earnedAchievements;
        uint256[] learningPathProgress; // Percentage completion of each path
    }
    
    struct Achievement {
        string name;
        string description;
        string badgeURI; // IPFS URI for badge NFT
        uint256 requiredGames;
        uint256 requiredLessons;
        SkillCategory category;
        uint256 minSkillLevel;
        bool isActive;
    }
    
    struct LearningPath {
        string title;
        string description;
        uint256[] lessonIds;
        uint256 difficulty; // 1-10
        SkillCategory[] focusAreas;
        uint256 estimatedHours;
        bool isActive;
    }
    
    struct Lesson {
        string title;
        string contentURI; // IPFS URI for lesson content
        SkillCategory category;
        uint256 difficulty;
        uint256 skillPointsReward;
        uint256 completionCount;
        address creator;
        bool isActive;
    }
    
    struct GameAnalysis {
        uint256 gameId;
        address player;
        uint256 timestamp;
        mapping(SkillCategory => int256) skillChanges; // Positive or negative
        string[] weaknesses; // Areas to improve
        string[] strengths; // Good moves
        uint256 accuracyScore; // 0-100
    }
    
    // State variables
    mapping(address => PlayerProfile) public playerProfiles;
    mapping(uint256 => Achievement) public achievements;
    mapping(uint256 => LearningPath) public learningPaths;
    mapping(uint256 => Lesson) public lessons;
    mapping(uint256 => GameAnalysis) private gameAnalyses;
    
    uint256 public achievementCounter;
    uint256 public learningPathCounter;
    uint256 public lessonCounter;
    uint256 public analysisCounter;
    
    address public admin;
    mapping(address => bool) public authorizedCoaches;
    
    // Events
    event AchievementUnlocked(address indexed player, uint256 indexed achievementId, string name);
    event SkillLevelUpdated(address indexed player, SkillCategory category, uint256 newLevel);
    event LessonCompleted(address indexed player, uint256 indexed lessonId, uint256 skillPointsEarned);
    event GameAnalyzed(address indexed player, uint256 indexed analysisId, uint256 accuracyScore);
    event StreakUpdated(address indexed player, uint256 newStreak);
    event LearningPathCreated(uint256 indexed pathId, string title);
    event AchievementCreated(uint256 indexed achievementId, string name);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyAuthorizedCoach() {
        require(authorizedCoaches[msg.sender] || msg.sender == admin, "Not authorized coach");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorizedCoaches[msg.sender] = true;
    }
    
    /**
     * @dev Create a new achievement
     */
    function createAchievement(
        string memory name,
        string memory description,
        string memory badgeURI,
        uint256 requiredGames,
        uint256 requiredLessons,
        SkillCategory category,
        uint256 minSkillLevel
    ) external onlyAdmin returns (uint256) {
        uint256 achievementId = achievementCounter++;
        Achievement storage achievement = achievements[achievementId];
        
        achievement.name = name;
        achievement.description = description;
        achievement.badgeURI = badgeURI;
        achievement.requiredGames = requiredGames;
        achievement.requiredLessons = requiredLessons;
        achievement.category = category;
        achievement.minSkillLevel = minSkillLevel;
        achievement.isActive = true;
        
        emit AchievementCreated(achievementId, name);
        return achievementId;
    }
    
    /**
     * @dev Create a new learning path
     */
    function createLearningPath(
        string memory title,
        string memory description,
        uint256[] memory lessonIds,
        uint256 difficulty,
        SkillCategory[] memory focusAreas,
        uint256 estimatedHours
    ) external onlyAuthorizedCoach returns (uint256) {
        uint256 pathId = learningPathCounter++;
        LearningPath storage path = learningPaths[pathId];
        
        path.title = title;
        path.description = description;
        path.lessonIds = lessonIds;
        path.difficulty = difficulty;
        path.focusAreas = focusAreas;
        path.estimatedHours = estimatedHours;
        path.isActive = true;
        
        emit LearningPathCreated(pathId, title);
        return pathId;
    }
    
    /**
     * @dev Create a new lesson
     */
    function createLesson(
        string memory title,
        string memory contentURI,
        SkillCategory category,
        uint256 difficulty,
        uint256 skillPointsReward
    ) external onlyAuthorizedCoach returns (uint256) {
        uint256 lessonId = lessonCounter++;
        Lesson storage lesson = lessons[lessonId];
        
        lesson.title = title;
        lesson.contentURI = contentURI;
        lesson.category = category;
        lesson.difficulty = difficulty;
        lesson.skillPointsReward = skillPointsReward;
        lesson.creator = msg.sender;
        lesson.isActive = true;
        
        return lessonId;
    }
    
    /**
     * @dev Record lesson completion
     */
    function completeLesson(uint256 lessonId) external {
        require(lessons[lessonId].isActive, "Lesson not active");
        
        Lesson storage lesson = lessons[lessonId];
        PlayerProfile storage profile = playerProfiles[msg.sender];
        
        // Update skill level
        uint256 currentSkill = profile.skillLevels[lesson.category];
        uint256 newSkill = currentSkill + lesson.skillPointsReward;
        if (newSkill > 1000) newSkill = 1000; // Cap at 1000
        
        profile.skillLevels[lesson.category] = newSkill;
        profile.totalLessonsCompleted++;
        lesson.completionCount++;
        
        // Update streak
        updateStreak(msg.sender);
        
        emit LessonCompleted(msg.sender, lessonId, lesson.skillPointsReward);
        emit SkillLevelUpdated(msg.sender, lesson.category, newSkill);
        
        // Check for achievements
        checkAndUnlockAchievements(msg.sender);
    }
    
    /**
     * @dev Submit game analysis (called by authorized coach or AI oracle)
     */
    function submitGameAnalysis(
        uint256 gameId,
        address player,
        int256[] memory skillChanges, // Matches SkillCategory enum order
        string[] memory weaknesses,
        string[] memory strengths,
        uint256 accuracyScore
    ) external onlyAuthorizedCoach returns (uint256) {
        require(skillChanges.length == 6, "Must provide all 6 skill categories");
        require(accuracyScore <= 100, "Accuracy must be 0-100");
        
        uint256 analysisId = analysisCounter++;
        GameAnalysis storage analysis = gameAnalyses[analysisId];
        
        analysis.gameId = gameId;
        analysis.player = player;
        analysis.timestamp = block.timestamp;
        analysis.weaknesses = weaknesses;
        analysis.strengths = strengths;
        analysis.accuracyScore = accuracyScore;
        
        PlayerProfile storage profile = playerProfiles[player];
        profile.totalGamesAnalyzed++;
        
        // Update skill levels based on analysis
        for (uint256 i = 0; i < 6; i++) {
            SkillCategory category = SkillCategory(i);
            int256 change = skillChanges[i];
            
            uint256 currentLevel = profile.skillLevels[category];
            uint256 newLevel;
            
            if (change >= 0) {
                newLevel = currentLevel + uint256(change);
                if (newLevel > 1000) newLevel = 1000;
            } else {
                uint256 decrease = uint256(-change);
                newLevel = currentLevel > decrease ? currentLevel - decrease : 0;
            }
            
            profile.skillLevels[category] = newLevel;
            analysis.skillChanges[category] = change;
            
            emit SkillLevelUpdated(player, category, newLevel);
        }
        
        emit GameAnalyzed(player, analysisId, accuracyScore);
        checkAndUnlockAchievements(player);
        
        return analysisId;
    }
    
    /**
     * @dev Update player's daily streak
     */
    function updateStreak(address player) internal {
        PlayerProfile storage profile = playerProfiles[player];
        uint256 lastActivity = profile.lastActivityTimestamp;
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastDay = lastActivity / 1 days;
        
        if (currentDay == lastDay) {
            // Same day, no change
            return;
        } else if (currentDay == lastDay + 1) {
            // Consecutive day
            profile.currentStreak++;
            if (profile.currentStreak > profile.longestStreak) {
                profile.longestStreak = profile.currentStreak;
            }
        } else {
            // Streak broken
            profile.currentStreak = 1;
        }
        
        profile.lastActivityTimestamp = block.timestamp;
        emit StreakUpdated(player, profile.currentStreak);
    }
    
    /**
     * @dev Check and unlock achievements for a player
     */
    function checkAndUnlockAchievements(address player) internal {
        PlayerProfile storage profile = playerProfiles[player];
        
        for (uint256 i = 0; i < achievementCounter; i++) {
            if (!achievements[i].isActive) continue;
            if (profile.earnedAchievements[i]) continue;
            
            Achievement storage achievement = achievements[i];
            
            // Check requirements
            bool meetsRequirements = true;
            
            if (profile.totalGamesAnalyzed < achievement.requiredGames) {
                meetsRequirements = false;
            }
            
            if (profile.totalLessonsCompleted < achievement.requiredLessons) {
                meetsRequirements = false;
            }
            
            if (profile.skillLevels[achievement.category] < achievement.minSkillLevel) {
                meetsRequirements = false;
            }
            
            if (meetsRequirements) {
                profile.earnedAchievements[i] = true;
                emit AchievementUnlocked(player, i, achievement.name);
            }
        }
    }
    
    /**
     * @dev Get player's skill level for a category
     */
    function getSkillLevel(address player, SkillCategory category) external view returns (uint256) {
        return playerProfiles[player].skillLevels[category];
    }
    
    /**
     * @dev Get all skill levels for a player
     */
    function getAllSkillLevels(address player) external view returns (uint256[6] memory) {
        uint256[6] memory skills;
        for (uint256 i = 0; i < 6; i++) {
            skills[i] = playerProfiles[player].skillLevels[SkillCategory(i)];
        }
        return skills;
    }
    
    /**
     * @dev Check if player has earned an achievement
     */
    function hasAchievement(address player, uint256 achievementId) external view returns (bool) {
        return playerProfiles[player].earnedAchievements[achievementId];
    }
    
    /**
     * @dev Get player stats
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalGamesAnalyzed,
        uint256 totalLessons,
        uint256 currentStreak,
        uint256 longestStreak
    ) {
        PlayerProfile storage profile = playerProfiles[player];
        return (
            profile.totalGamesAnalyzed,
            profile.totalLessonsCompleted,
            profile.currentStreak,
            profile.longestStreak
        );
    }
    
    /**
     * @dev Get game analysis details
     */
    function getGameAnalysis(uint256 analysisId) external view returns (
        uint256 gameId,
        address player,
        uint256 timestamp,
        string[] memory weaknesses,
        string[] memory strengths,
        uint256 accuracyScore
    ) {
        GameAnalysis storage analysis = gameAnalyses[analysisId];
        return (
            analysis.gameId,
            analysis.player,
            analysis.timestamp,
            analysis.weaknesses,
            analysis.strengths,
            analysis.accuracyScore
        );
    }
    
    /**
     * @dev Get skill changes from game analysis
     */
    function getAnalysisSkillChanges(uint256 analysisId) external view returns (int256[6] memory) {
        int256[6] memory changes;
        GameAnalysis storage analysis = gameAnalyses[analysisId];
        for (uint256 i = 0; i < 6; i++) {
            changes[i] = analysis.skillChanges[SkillCategory(i)];
        }
        return changes;
    }
    
    /**
     * @dev Authorize a coach
     */
    function authorizeCoach(address coach) external onlyAdmin {
        authorizedCoaches[coach] = true;
    }
    
    /**
     * @dev Revoke coach authorization
     */
    function revokeCoach(address coach) external onlyAdmin {
        authorizedCoaches[coach] = false;
    }
    
    /**
     * @dev Get learning path lesson IDs
     */
    function getLearningPathLessons(uint256 pathId) external view returns (uint256[] memory) {
        return learningPaths[pathId].lessonIds;
    }
    
    /**
     * @dev Get learning path focus areas
     */
    function getLearningPathFocusAreas(uint256 pathId) external view returns (SkillCategory[] memory) {
        return learningPaths[pathId].focusAreas;
    }
}
