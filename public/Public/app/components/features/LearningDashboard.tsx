import { useState, useEffect } from 'react';
import { useChessAcademy } from '../../hooks/useAdvancedContracts';
import { 
  LESSONS, 
  LEARNING_PATHS, 
  ACHIEVEMENTS,
  SKILL_CATEGORY_NAMES,
  type Lesson,
  type LearningPath,
  getLessonById,
  getLearningPathById,
  checkAchievementUnlocked
} from '../../lib/lessonData';
import styles from './LearningDashboard.module.css';

type ViewMode = 'dashboard' | 'lesson' | 'path';

interface LocalProgress {
  completedLessons: number[];
  gamesAnalyzed: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  skillLevels: Record<number, number>;
}

export default function LearningDashboard() {
  const { playerStats, skillLevels, completeLesson, isLoading } = useChessAcademy();
  
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<number>>(new Set());
  const [localProgress, setLocalProgress] = useState<LocalProgress>({
    completedLessons: [],
    gamesAnalyzed: 0,
    lessonsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    skillLevels: {}
  });

  // Load local progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('learningProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      setLocalProgress(progress);
      setCompletedLessons(new Set(progress.completedLessons));
    }
  }, []);

  // Parse player stats (use blockchain or local)
  const gamesAnalyzed = playerStats ? Number(playerStats[0]) : localProgress.gamesAnalyzed;
  const lessonsCompleted = playerStats ? Number(playerStats[1]) : localProgress.lessonsCompleted;
  const currentStreak = playerStats ? Number(playerStats[2]) : localProgress.currentStreak;
  const longestStreak = playerStats ? Number(playerStats[3]) : localProgress.longestStreak;

  // Check unlocked achievements
  useEffect(() => {
    const unlocked = new Set<number>();
    ACHIEVEMENTS.forEach(achievement => {
      const skillLevel = skillLevels 
        ? Number(skillLevels[achievement.category]) 
        : (localProgress.skillLevels[achievement.category] || 0);
      
      if (checkAchievementUnlocked(achievement, gamesAnalyzed, lessonsCompleted, skillLevel)) {
        unlocked.add(achievement.id);
      }
    });
    setUnlockedAchievements(unlocked);
  }, [playerStats, skillLevels, gamesAnalyzed, lessonsCompleted, localProgress]);

  const handleStartLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    setViewMode('lesson');
  };

  const handleStartPath = (pathId: number) => {
    setSelectedPathId(pathId);
    setViewMode('path');
  };

  const handleCompleteLesson = async (lessonId: number) => {
    // Update local progress
    const newProgress = {
      ...localProgress,
      completedLessons: [...localProgress.completedLessons, lessonId],
      lessonsCompleted: localProgress.lessonsCompleted + 1,
      currentStreak: localProgress.currentStreak + 1,
      longestStreak: Math.max(localProgress.longestStreak, localProgress.currentStreak + 1)
    };
    setLocalProgress(newProgress);
    localStorage.setItem('learningProgress', JSON.stringify(newProgress));
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    
    // Try blockchain submission (optional)
    try {
      if (completeLesson) {
        await completeLesson(lessonId);
      }
      setViewMode('dashboard');
      alert('🎉 Lesson completed! Skill points earned (saved locally & on-chain).');
    } catch (error) {
      console.log('Blockchain submission skipped:', error);
      setViewMode('dashboard');
      alert('✓ Lesson completed locally! Connect wallet to save on-chain.');
    }
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedLessonId(null);
    setSelectedPathId(null);
  };

  // Lesson View Component
  const LessonView = ({ lesson }: { lesson: Lesson }) => (
    <div className={styles.lessonView}>
      <button className={styles.backButton} onClick={handleBackToDashboard}>
        ← Back to Dashboard
      </button>
      
      <div className={styles.lessonHeader}>
        <h1>{lesson.title}</h1>
        <div className={styles.lessonMeta}>
          <span className={styles.badge}>{SKILL_CATEGORY_NAMES[lesson.category]}</span>
          <span className={styles.badge}>{'⭐'.repeat(lesson.difficulty)}</span>
          <span className={styles.badge}>+{lesson.skillPointsReward} points</span>
          <span className={styles.badge}>~{lesson.estimatedMinutes} min</span>
        </div>
        <p className={styles.description}>{lesson.description}</p>
      </div>

      <div className={styles.lessonContent}>
        <section className={styles.section}>
          <h2>Introduction</h2>
          <p>{lesson.content.introduction}</p>
        </section>

        <section className={styles.section}>
          <h2>Key Points</h2>
          <ul className={styles.keyPoints}>
            {lesson.content.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Examples</h2>
          <div className={styles.examples}>
            {lesson.content.examples.map((example, index) => (
              <div key={index} className={styles.example}>
                <code>{example}</code>
              </div>
            ))}
          </div>
        </section>

        {lesson.content.practice && (
          <section className={styles.section}>
            <h2>Practice Exercise</h2>
            <div className={styles.practice}>
              <p>{lesson.content.practice}</p>
            </div>
          </section>
        )}

        <div className={styles.lessonActions}>
          <button 
            className={styles.completeButton}
            onClick={() => handleCompleteLesson(lesson.id)}
            disabled={isLoading || completedLessons.has(lesson.id)}
          >
            {completedLessons.has(lesson.id) 
              ? '✓ Completed' 
              : isLoading 
                ? 'Processing...' 
                : 'Complete Lesson'}
          </button>
        </div>
      </div>
    </div>
  );

  // Learning Path View Component
  const PathView = ({ path }: { path: LearningPath }) => (
    <div className={styles.pathView}>
      <button className={styles.backButton} onClick={handleBackToDashboard}>
        ← Back to Dashboard
      </button>
      
      <div className={styles.pathHeader}>
        <h1>{path.emoji} {path.title}</h1>
        <div className={styles.pathMeta}>
          <span className={styles.badge}>{'⭐'.repeat(path.difficulty)}</span>
          <span className={styles.badge}>{path.lessonIds.length} lessons</span>
          <span className={styles.badge}>~{path.estimatedHours}h total</span>
        </div>
        <p className={styles.description}>{path.description}</p>
        
        <div className={styles.focusAreas}>
          <strong>Focus Areas:</strong>
          {path.focusAreas.map(area => (
            <span key={area} className={styles.focusTag}>
              {SKILL_CATEGORY_NAMES[area]}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.pathLessons}>
        <h2>Lessons in this Path</h2>
        {path.lessonIds.map((lessonId, index) => {
          const lesson = getLessonById(lessonId);
          if (!lesson) return null;
          
          const isCompleted = completedLessons.has(lessonId);
          
          return (
            <div key={lessonId} className={styles.pathLesson}>
              <div className={styles.lessonNumber}>{index + 1}</div>
              <div className={styles.lessonInfo}>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <div className={styles.lessonTags}>
                  <span>{'⭐'.repeat(lesson.difficulty)}</span>
                  <span>+{lesson.skillPointsReward} points</span>
                  <span>~{lesson.estimatedMinutes} min</span>
                </div>
              </div>
              <div className={styles.lessonAction}>
                {isCompleted ? (
                  <span className={styles.completedBadge}>✓ Done</span>
                ) : (
                  <button 
                    className={styles.startButton}
                    onClick={() => handleStartLesson(lessonId)}
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.pathProgress}>
        <div className={styles.progressInfo}>
          <span>Progress: {path.lessonIds.filter(id => completedLessons.has(id)).length}/{path.lessonIds.length}</span>
          <span>{Math.round((path.lessonIds.filter(id => completedLessons.has(id)).length / path.lessonIds.length) * 100)}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progress}
            style={{ 
              width: `${(path.lessonIds.filter(id => completedLessons.has(id)).length / path.lessonIds.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );

  // Dashboard View
  if (viewMode === 'lesson' && selectedLessonId !== null) {
    const lesson = getLessonById(selectedLessonId);
    if (lesson) return <LessonView lesson={lesson} />;
  }

  if (viewMode === 'path' && selectedPathId !== null) {
    const path = getLearningPathById(selectedPathId);
    if (path) return <PathView path={path} />;
  }

  return (
    <div className={styles.dashboard}>
      <h1>Chess Academy</h1>
      
      {/* Player Stats */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Games Analyzed</h3>
          <p className={styles.statValue}>{gamesAnalyzed}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Lessons Completed</h3>
          <p className={styles.statValue}>{lessonsCompleted}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Current Streak</h3>
          <p className={styles.statValue}>{currentStreak} days</p>
        </div>
        <div className={styles.statCard}>
          <h3>Longest Streak</h3>
          <p className={styles.statValue}>{longestStreak} days</p>
        </div>
      </div>

      {/* Skill Levels */}
      <div className={styles.skillsContainer}>
        <h2>Your Skills</h2>
        <div className={styles.skillBars}>
          {SKILL_CATEGORY_NAMES.map((category, index) => {
            const level = skillLevels ? Number(skillLevels[index]) : 0;
            const percentage = (level / 1000) * 100;
            
            return (
              <div key={category} className={styles.skillBar}>
                <div className={styles.skillHeader}>
                  <span className={styles.skillName}>{category}</span>
                  <span className={styles.skillValue}>{level}/1000</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progress}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Paths */}
      <div className={styles.learningPaths}>
        <h2>Learning Paths</h2>
        <div className={styles.pathsGrid}>
          {LEARNING_PATHS.map(path => {
            const completedCount = path.lessonIds.filter(id => completedLessons.has(id)).length;
            const progress = Math.round((completedCount / path.lessonIds.length) * 100);
            
            return (
              <div key={path.id} className={styles.pathCard}>
                <h3>{path.emoji} {path.title}</h3>
                <p>{path.description}</p>
                <div className={styles.pathMeta}>
                  <span>Difficulty: {'⭐'.repeat(path.difficulty)}</span>
                  <span>{path.estimatedHours} hours</span>
                </div>
                <div className={styles.pathProgress}>
                  <span className={styles.progressText}>{progress}% Complete</span>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progress}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <button 
                  className={styles.startButton}
                  onClick={() => handleStartPath(path.id)}
                >
                  {progress > 0 ? 'Continue Path' : 'Start Path'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className={styles.achievements}>
        <h2>🏆 Achievements</h2>
        <div className={styles.achievementsList}>
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = unlockedAchievements.has(achievement.id);
            
            return (
              <div 
                key={achievement.id} 
                className={`${styles.achievementBadge} ${isUnlocked ? styles.unlocked : styles.locked}`}
              >
                <span className={styles.badge}>{achievement.emoji}</span>
                <div className={styles.achievementInfo}>
                  <span className={styles.achievementName}>{achievement.name}</span>
                  <span className={styles.achievementDesc}>{achievement.description}</span>
                </div>
                {isUnlocked && <span className={styles.check}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Browse All Lessons */}
      <div className={styles.allLessons}>
        <h2>Browse All Lessons</h2>
        <div className={styles.lessonGrid}>
          {LESSONS.filter(l => l.isActive).map(lesson => {
            const isCompleted = completedLessons.has(lesson.id);
            
            return (
              <div key={lesson.id} className={styles.lessonCard}>
                <div className={styles.lessonCardHeader}>
                  <h3>{lesson.title}</h3>
                  {isCompleted && <span className={styles.completedBadge}>✓</span>}
                </div>
                <p>{lesson.description}</p>
                <div className={styles.lessonMeta}>
                  <span>{SKILL_CATEGORY_NAMES[lesson.category]}</span>
                  <span>{'⭐'.repeat(lesson.difficulty)}</span>
                  <span>+{lesson.skillPointsReward} pts</span>
                </div>
                <button 
                  className={styles.startButton}
                  onClick={() => handleStartLesson(lesson.id)}
                >
                  {isCompleted ? 'Review' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
