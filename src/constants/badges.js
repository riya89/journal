// Badge definitions for the gamification system
// Each badge has metadata including name, icon, rarity, and unlock requirements

export const BADGE_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  LEGENDARY: 'legendary'
};

export const BADGE_DEFINITIONS = [
  // Perfect Day Badges
  {
    id: 'perfect_day_1',
    name: 'First Perfect Day',
    description: 'Complete all tasks in a single day',
    icon: '⭐',
    rarity: BADGE_RARITIES.COMMON,
    requirement: 'Complete all tasks for 1 day',
    category: 'perfect_day',
    threshold: 1
  },
  {
    id: 'perfect_day_7',
    name: 'Week Warrior',
    description: 'Achieve 7 perfect days',
    icon: '🌟',
    rarity: BADGE_RARITIES.RARE,
    requirement: 'Complete all tasks for 7 days',
    category: 'perfect_day',
    threshold: 7
  },
  {
    id: 'perfect_day_30',
    name: 'Month Master',
    description: 'Achieve 30 perfect days',
    icon: '✨',
    rarity: BADGE_RARITIES.LEGENDARY,
    requirement: 'Complete all tasks for 30 days',
    category: 'perfect_day',
    threshold: 30
  },

  // Quest Master Badges
  {
    id: 'quest_master_10',
    name: 'Quest Novice',
    description: 'Complete 10 quests',
    icon: '🎯',
    rarity: BADGE_RARITIES.COMMON,
    requirement: 'Complete 10 quests',
    category: 'quest_completion',
    threshold: 10
  },
  {
    id: 'quest_master_25',
    name: 'Quest Expert',
    description: 'Complete 25 quests',
    icon: '🏆',
    rarity: BADGE_RARITIES.RARE,
    requirement: 'Complete 25 quests',
    category: 'quest_completion',
    threshold: 25
  },
  {
    id: 'quest_master_50',
    name: 'Quest Legend',
    description: 'Complete 50 quests',
    icon: '👑',
    rarity: BADGE_RARITIES.LEGENDARY,
    requirement: 'Complete 50 quests',
    category: 'quest_completion',
    threshold: 50
  },

  // Level Badges
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '🌱',
    rarity: BADGE_RARITIES.COMMON,
    requirement: 'Reach level 5',
    category: 'level',
    threshold: 5
  },
  {
    id: 'level_10',
    name: 'Seasoned Journaler',
    description: 'Reach level 10',
    icon: '🌿',
    rarity: BADGE_RARITIES.RARE,
    requirement: 'Reach level 10',
    category: 'level',
    threshold: 10
  },
  {
    id: 'level_20',
    name: 'Master Journaler',
    description: 'Reach level 20',
    icon: '🌳',
    rarity: BADGE_RARITIES.LEGENDARY,
    requirement: 'Reach level 20',
    category: 'level',
    threshold: 20
  },

  // Special Badges
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all tasks for 7 consecutive days',
    icon: '💎',
    rarity: BADGE_RARITIES.RARE,
    requirement: 'Complete all tasks for 7 consecutive days',
    category: 'special',
    threshold: 1
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Journal before 8 AM',
    icon: '🌅',
    rarity: BADGE_RARITIES.COMMON,
    requirement: 'Create a journal entry before 8 AM',
    category: 'special',
    threshold: 1
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Journal after 10 PM',
    icon: '🦉',
    rarity: BADGE_RARITIES.COMMON,
    requirement: 'Create a journal entry after 10 PM',
    category: 'special',
    threshold: 1
  }
];

/**
 * Get badge definition by ID
 * @param {string} badgeId - The badge ID
 * @returns {Object|null} Badge definition or null if not found
 */
export function getBadgeById(badgeId) {
  return BADGE_DEFINITIONS.find(badge => badge.id === badgeId) || null;
}

/**
 * Get all badges in a specific category
 * @param {string} category - The badge category
 * @returns {Array} Array of badge definitions
 */
export function getBadgesByCategory(category) {
  return BADGE_DEFINITIONS.filter(badge => badge.category === category);
}

/**
 * Get all badges of a specific rarity
 * @param {string} rarity - The badge rarity
 * @returns {Array} Array of badge definitions
 */
export function getBadgesByRarity(rarity) {
  return BADGE_DEFINITIONS.filter(badge => badge.rarity === rarity);
}

/**
 * Check which badges a user has earned based on their stats
 * @param {Object} userStats - User statistics object
 * @returns {Array} Array of earned badge IDs
 */
export function checkEarnedBadges(userStats) {
  const earnedBadges = [];
  const {
    perfectDays = 0,
    questsCompleted = 0,
    currentLevel = 1,
    longestStreak = 0,
    earnedBadges: existingBadges = []
  } = userStats;

  BADGE_DEFINITIONS.forEach(badge => {
    // Skip if already earned
    if (existingBadges.includes(badge.id)) {
      return;
    }

    let earned = false;

    switch (badge.category) {
      case 'perfect_day':
        earned = perfectDays >= badge.threshold;
        break;
      case 'quest_completion':
        earned = questsCompleted >= badge.threshold;
        break;
      case 'level':
        earned = currentLevel >= badge.threshold;
        break;
      case 'streak':
        earned = longestStreak >= badge.threshold;
        break;
      case 'special':
        // Special badges are awarded by backend logic
        earned = false;
        break;
      default:
        earned = false;
    }

    if (earned) {
      earnedBadges.push(badge.id);
    }
  });

  return earnedBadges;
}
