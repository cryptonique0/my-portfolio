// Lesson database for ChessAcademy
export enum SkillCategory {
  Opening = 0,
  Middlegame = 1,
  Endgame = 2,
  Tactics = 3,
  Strategy = 4,
  Calculate = 5
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  category: SkillCategory;
  difficulty: number; // 1-5
  skillPointsReward: number;
  estimatedMinutes: number;
  content: {
    introduction: string;
    keyPoints: string[];
    examples: string[];
    practice?: string;
  };
  isActive: boolean;
}

export interface LearningPath {
  id: number;
  title: string;
  description: string;
  lessonIds: number[];
  difficulty: number; // 1-5
  focusAreas: SkillCategory[];
  estimatedHours: number;
  emoji: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  emoji: string;
  requiredGames: number;
  requiredLessons: number;
  category: SkillCategory;
  minSkillLevel: number;
}

// Sample Lessons
export const LESSONS: Lesson[] = [
  // Opening Lessons (0-9)
  {
    id: 0,
    title: "Basic Opening Principles",
    description: "Learn the fundamental rules of chess openings",
    category: SkillCategory.Opening,
    difficulty: 1,
    skillPointsReward: 50,
    estimatedMinutes: 15,
    content: {
      introduction: "The opening is the first phase of the game. Your goal is to develop your pieces quickly and control the center.",
      keyPoints: [
        "Control the center with pawns (e4, d4, e5, d5)",
        "Develop knights before bishops",
        "Castle early for king safety",
        "Don't move the same piece twice",
        "Don't bring your queen out too early"
      ],
      examples: [
        "1.e4 e5 2.Nf3 Nc6 - Good development",
        "1.e4 e5 2.Qh5?? - Premature queen move",
      ],
      practice: "Try opening with 1.e4 and develop all pieces before move 10"
    },
    isActive: true
  },
  {
    id: 1,
    title: "Italian Game Basics",
    description: "Master one of the oldest and most reliable openings",
    category: SkillCategory.Opening,
    difficulty: 2,
    skillPointsReward: 75,
    estimatedMinutes: 20,
    content: {
      introduction: "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) is a classical opening focusing on rapid development.",
      keyPoints: [
        "Bc4 attacks f7, the weakest square",
        "Plan to castle kingside quickly",
        "Control the center with d3 or c3",
        "Develop smoothly without weaknesses"
      ],
      examples: [
        "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 - Central attack",
        "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 - Quiet development"
      ]
    },
    isActive: true
  },
  {
    id: 2,
    title: "Defending Against 1.e4",
    description: "Learn solid defensive setups against King's Pawn openings",
    category: SkillCategory.Opening,
    difficulty: 2,
    skillPointsReward: 75,
    estimatedMinutes: 20,
    content: {
      introduction: "When facing 1.e4, you have many defensive options. Learn the most popular responses.",
      keyPoints: [
        "1...e5 (Open games) - Classical and sharp",
        "1...c5 (Sicilian) - Fighting for advantage",
        "1...e6 (French) - Solid but cramped",
        "1...c6 (Caro-Kann) - Reliable and safe"
      ],
      examples: [
        "1.e4 e5 - Symmetrical center control",
        "1.e4 c5 - Sicilian: most popular at all levels"
      ]
    },
    isActive: true
  },

  // Middlegame Lessons (10-19)
  {
    id: 10,
    title: "Piece Coordination",
    description: "Learn how to make your pieces work together",
    category: SkillCategory.Middlegame,
    difficulty: 2,
    skillPointsReward: 80,
    estimatedMinutes: 25,
    content: {
      introduction: "Strong players coordinate their pieces to work toward a common goal.",
      keyPoints: [
        "Aim multiple pieces at key squares",
        "Support your attacking pieces with defenders",
        "Create threats that are hard to defend",
        "Trade when you have the initiative"
      ],
      examples: [
        "Battery: Queen and bishop on the same diagonal",
        "Doubled rooks on an open file"
      ]
    },
    isActive: true
  },
  {
    id: 11,
    title: "Pawn Structures",
    description: "Understanding pawn formations and their implications",
    category: SkillCategory.Middlegame,
    difficulty: 3,
    skillPointsReward: 100,
    estimatedMinutes: 30,
    content: {
      introduction: "Pawn structure determines the character of the position and your long-term plans.",
      keyPoints: [
        "Isolated pawns: Weak but active pieces",
        "Doubled pawns: Usually weak, sometimes strong",
        "Passed pawns: Strong endgame assets",
        "Pawn chains: Attack the base"
      ],
      examples: [
        "d4-e5 pawn chain: Attack with ...c5 or ...f6",
        "Isolated d4 pawn: Blockade on d5"
      ]
    },
    isActive: true
  },

  // Endgame Lessons (20-29)
  {
    id: 20,
    title: "King and Pawn Endgames",
    description: "Master the most fundamental endgame",
    category: SkillCategory.Endgame,
    difficulty: 2,
    skillPointsReward: 90,
    estimatedMinutes: 30,
    content: {
      introduction: "King and pawn endgames are the foundation of all endgame knowledge.",
      keyPoints: [
        "Opposition: Key squares face to face",
        "Triangulation: Zugzwang technique",
        "Rule of the square: Can king catch pawn?",
        "Key squares: Control to promote"
      ],
      examples: [
        "King opposition decides the winner",
        "Outside passed pawn is powerful"
      ]
    },
    isActive: true
  },
  {
    id: 21,
    title: "Rook Endgames",
    description: "The most common endgame type",
    category: SkillCategory.Endgame,
    difficulty: 3,
    skillPointsReward: 100,
    estimatedMinutes: 35,
    content: {
      introduction: "Rook endgames appear in ~50% of all games. Mastery is essential.",
      keyPoints: [
        "Lucena position: Win with rook and pawn",
        "Philidor position: Drawing technique",
        "Activate the rook - 7th rank invasion",
        "Cut off the enemy king"
      ],
      examples: [
        "Lucena: Building a bridge to promote",
        "Philidor: Passive defense draws"
      ]
    },
    isActive: true
  },

  // Tactics Lessons (30-39)
  {
    id: 30,
    title: "Pin Tactics",
    description: "Use pins to win material and gain advantages",
    category: SkillCategory.Tactics,
    difficulty: 2,
    skillPointsReward: 70,
    estimatedMinutes: 20,
    content: {
      introduction: "A pin restricts a piece's movement because moving would expose a more valuable piece.",
      keyPoints: [
        "Absolute pin: Against the king (illegal to move)",
        "Relative pin: Against valuable piece",
        "Exploit pins: Attack the pinned piece",
        "Break pins: Move the valuable piece away"
      ],
      examples: [
        "Bg5 pinning knight to queen",
        "Bb5 pinning knight to king"
      ]
    },
    isActive: true
  },
  {
    id: 31,
    title: "Fork Tactics",
    description: "Attack two pieces simultaneously",
    category: SkillCategory.Tactics,
    difficulty: 1,
    skillPointsReward: 60,
    estimatedMinutes: 15,
    content: {
      introduction: "A fork attacks two or more pieces at once, winning material.",
      keyPoints: [
        "Knight forks: Most common and deadly",
        "Pawn forks: Simple but effective",
        "Queen forks: Powerful combinations",
        "Look for royal fork: King and queen"
      ],
      examples: [
        "Nf3-e5-c6 forking king and rook",
        "d4-d5 forking two knights"
      ]
    },
    isActive: true
  },
  {
    id: 32,
    title: "Skewer Tactics",
    description: "Force a valuable piece to move, exposing another",
    category: SkillCategory.Tactics,
    difficulty: 2,
    skillPointsReward: 70,
    estimatedMinutes: 18,
    content: {
      introduction: "A skewer is like a reverse pin - attack the more valuable piece first.",
      keyPoints: [
        "Force king to move, win the rook behind",
        "Use bishops and rooks on lines",
        "Check first, win material after",
        "Often appears in endgames"
      ],
      examples: [
        "Bc4+ forcing Kf8, then Bxa2",
        "Re1+ winning the queen on e8"
      ]
    },
    isActive: true
  },

  // Strategy Lessons (40-49)
  {
    id: 40,
    title: "Understanding the Initiative",
    description: "Learn to seize and maintain the initiative",
    category: SkillCategory.Strategy,
    difficulty: 3,
    skillPointsReward: 90,
    estimatedMinutes: 25,
    content: {
      introduction: "The initiative means your threats dictate the flow of the game.",
      keyPoints: [
        "Create threats before defending",
        "Make opponent react to you",
        "Don't give up initiative cheaply",
        "Sometimes sacrifice material for initiative"
      ],
      examples: [
        "Rapid development seizes initiative",
        "Attacking moves maintain pressure"
      ]
    },
    isActive: true
  },
  {
    id: 41,
    title: "Weak Squares and Outposts",
    description: "Identify and exploit weak squares in your opponent's position",
    category: SkillCategory.Strategy,
    difficulty: 3,
    skillPointsReward: 95,
    estimatedMinutes: 28,
    content: {
      introduction: "Weak squares cannot be defended by pawns. Place pieces there to dominate.",
      keyPoints: [
        "Look for holes in pawn structure",
        "Knights love outposts",
        "Blockade weak pawns",
        "Create weaknesses with pawn advances"
      ],
      examples: [
        "Nd5 on a weak d5 square",
        "Ne5 blockading an isolated d6 pawn"
      ]
    },
    isActive: true
  },

  // Calculation Lessons (50-59)
  {
    id: 50,
    title: "Calculating Forced Sequences",
    description: "Improve your ability to calculate checks, captures, and threats",
    category: SkillCategory.Calculate,
    difficulty: 2,
    skillPointsReward: 80,
    estimatedMinutes: 25,
    content: {
      introduction: "Forced sequences (checks, captures) are easier to calculate because options are limited.",
      keyPoints: [
        "Start with checks (most forcing)",
        "Then captures (still forcing)",
        "Then threats (less forcing)",
        "Calculate all forcing moves first"
      ],
      examples: [
        "Calculate all checks before other moves",
        "Don't miss quiet winning moves"
      ]
    },
    isActive: true
  },
  {
    id: 51,
    title: "Visualization Training",
    description: "Strengthen your ability to see the board mentally",
    category: SkillCategory.Calculate,
    difficulty: 3,
    skillPointsReward: 100,
    estimatedMinutes: 30,
    content: {
      introduction: "Strong players can see several moves ahead without moving pieces.",
      keyPoints: [
        "Start by calculating 1-2 moves ahead",
        "Gradually increase depth",
        "Visualize piece positions clearly",
        "Practice blindfold exercises"
      ],
      examples: [
        "Calculate a 3-move combination",
        "Find mate in 3 without touching pieces"
      ]
    },
    isActive: true
  }
];

// Learning Paths
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 0,
    title: "Beginner Fundamentals",
    description: "Master the basics of chess - openings, tactics, and essential endgames",
    lessonIds: [0, 31, 20, 30],
    difficulty: 1,
    focusAreas: [SkillCategory.Opening, SkillCategory.Tactics, SkillCategory.Endgame],
    estimatedHours: 3,
    emoji: "🎯"
  },
  {
    id: 1,
    title: "Tactical Training",
    description: "Sharpen your tactical vision with pins, forks, skewers and more",
    lessonIds: [30, 31, 32, 50],
    difficulty: 2,
    focusAreas: [SkillCategory.Tactics, SkillCategory.Calculate],
    estimatedHours: 4,
    emoji: "⚔️"
  },
  {
    id: 2,
    title: "Endgame Mastery",
    description: "Learn essential endgame techniques and winning methods",
    lessonIds: [20, 21],
    difficulty: 3,
    focusAreas: [SkillCategory.Endgame],
    estimatedHours: 5,
    emoji: "👑"
  },
  {
    id: 3,
    title: "Opening Repertoire",
    description: "Build a complete opening system for White and Black",
    lessonIds: [0, 1, 2],
    difficulty: 2,
    focusAreas: [SkillCategory.Opening],
    estimatedHours: 4,
    emoji: "📚"
  },
  {
    id: 4,
    title: "Strategic Mastery",
    description: "Understand deep positional concepts and long-term planning",
    lessonIds: [11, 40, 41, 10],
    difficulty: 4,
    focusAreas: [SkillCategory.Strategy, SkillCategory.Middlegame],
    estimatedHours: 6,
    emoji: "🧠"
  },
  {
    id: 5,
    title: "Calculation Excellence",
    description: "Master the art of calculating variations and combinations",
    lessonIds: [50, 51],
    difficulty: 4,
    focusAreas: [SkillCategory.Calculate],
    estimatedHours: 5,
    emoji: "🔮"
  }
];

// Achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 0,
    name: "First Steps",
    description: "Complete your first lesson",
    emoji: "🎓",
    requiredGames: 0,
    requiredLessons: 1,
    category: SkillCategory.Opening,
    minSkillLevel: 0
  },
  {
    id: 1,
    name: "Tactical Vision",
    description: "Complete 5 tactics lessons",
    emoji: "⚡",
    requiredGames: 0,
    requiredLessons: 5,
    category: SkillCategory.Tactics,
    minSkillLevel: 300
  },
  {
    id: 2,
    name: "Endgame Expert",
    description: "Master endgame techniques",
    emoji: "♔",
    requiredGames: 0,
    requiredLessons: 3,
    category: SkillCategory.Endgame,
    minSkillLevel: 500
  },
  {
    id: 3,
    name: "Opening Master",
    description: "Reach level 500 in openings",
    emoji: "📖",
    requiredGames: 0,
    requiredLessons: 0,
    category: SkillCategory.Opening,
    minSkillLevel: 500
  },
  {
    id: 4,
    name: "Dedication",
    description: "Maintain a 7-day streak",
    emoji: "🔥",
    requiredGames: 0,
    requiredLessons: 7,
    category: SkillCategory.Strategy,
    minSkillLevel: 0
  },
  {
    id: 5,
    name: "Analyst",
    description: "Analyze 10 games",
    emoji: "🔍",
    requiredGames: 10,
    requiredLessons: 0,
    category: SkillCategory.Strategy,
    minSkillLevel: 0
  },
  {
    id: 6,
    name: "Positional Player",
    description: "Reach level 600 in strategy",
    emoji: "🧩",
    requiredGames: 0,
    requiredLessons: 0,
    category: SkillCategory.Strategy,
    minSkillLevel: 600
  },
  {
    id: 7,
    name: "Calculator",
    description: "Reach level 700 in calculation",
    emoji: "🎯",
    requiredGames: 0,
    requiredLessons: 0,
    category: SkillCategory.Calculate,
    minSkillLevel: 700
  }
];

// Helper functions
export function getLessonById(id: number): Lesson | undefined {
  return LESSONS.find(lesson => lesson.id === id);
}

export function getLessonsByCategory(category: SkillCategory): Lesson[] {
  return LESSONS.filter(lesson => lesson.category === category && lesson.isActive);
}

export function getLearningPathById(id: number): LearningPath | undefined {
  return LEARNING_PATHS.find(path => path.id === id);
}

export function getAchievementById(id: number): Achievement | undefined {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
}

export function checkAchievementUnlocked(
  achievement: Achievement,
  gamesAnalyzed: number,
  lessonsCompleted: number,
  skillLevel: number
): boolean {
  return (
    gamesAnalyzed >= achievement.requiredGames &&
    lessonsCompleted >= achievement.requiredLessons &&
    skillLevel >= achievement.minSkillLevel
  );
}

export const SKILL_CATEGORY_NAMES = [
  'Opening',
  'Middlegame',
  'Endgame',
  'Tactics',
  'Strategy',
  'Calculation'
];
