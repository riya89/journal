import { checkEarnedBadges, getBadgeById } from '../constants/badges';
import { apiGet, apiPost } from './api';
import { API_BASE_URL } from '../config/api';

/**
 * Fetch user's earned badges from the backend
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of earned badge IDs
 */
export async function fetchUserBadges(userId) {
  try {
    const response = await apiGet(`${API_BASE_URL}/user/stats`);
    
    if (response.ok) {
      const data = await response.json();
      return data.earnedBadges || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

/**
 * Check if user has earned any new badges based on their stats
 * @param {Object} userStats - User statistics object
 * @returns {Array} Array of newly earned badge IDs
 */
export function checkForNewBadges(userStats) {
  const newBadges = checkEarnedBadges(userStats);
  return newBadges;
}

/**
 * Award a badge to the user
 * @param {string} badgeId - The badge ID to award
 * @returns {Promise<Object>} Response with success status and badge data
 */
export async function awardBadge(badgeId) {
  try {
    const badge = getBadgeById(badgeId);
    
    if (!badge) {
      throw new Error(`Badge ${badgeId} not found`);
    }

    // In a real implementation, this would call a backend endpoint
    // For now, we'll simulate the award
    const response = await apiPost(`${API_BASE_URL}/user/badge/award`, {
      badgeId
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        badge,
        ...data
      };
    }

    throw new Error('Failed to award badge');
  } catch (error) {
    console.error('Error awarding badge:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check and award badges after a user action
 * This should be called after significant user actions like:
 * - Completing all tasks for the day
 * - Completing a quest
 * - Leveling up
 * - Achieving a streak milestone
 * 
 * @param {Object} userStats - Current user statistics
 * @param {Array} existingBadges - Array of already earned badge IDs
 * @returns {Promise<Array>} Array of newly awarded badge objects
 */
export async function checkAndAwardBadges(userStats, existingBadges = []) {
  try {
    // Check which badges should be earned
    const newBadgeIds = checkEarnedBadges({
      ...userStats,
      earnedBadges: existingBadges
    });

    // Award each new badge
    const awardedBadges = [];
    
    for (const badgeId of newBadgeIds) {
      const result = await awardBadge(badgeId);
      
      if (result.success) {
        awardedBadges.push(result.badge);
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    return [];
  }
}

/**
 * Get badge progress for a specific badge
 * @param {string} badgeId - The badge ID
 * @param {Object} userStats - User statistics object
 * @returns {Object} Progress information
 */
export function getBadgeProgress(badgeId, userStats) {
  const badge = getBadgeById(badgeId);
  
  if (!badge) {
    return null;
  }

  let current = 0;
  let target = badge.threshold;

  switch (badge.category) {
    case 'perfect_day':
      current = userStats.perfectDays || 0;
      break;
    case 'quest_completion':
      current = userStats.questsCompleted || 0;
      break;
    case 'level':
      current = userStats.currentLevel || 1;
      break;
    case 'streak':
      current = userStats.longestStreak || 0;
      break;
    default:
      current = 0;
  }

  const progress = Math.min((current / target) * 100, 100);
  const isEarned = current >= target;

  return {
    badge,
    current,
    target,
    progress,
    isEarned
  };
}

/**
 * Store badge notification in localStorage to show on next render
 * This is useful when a badge is earned but we want to show the modal
 * after navigation or page reload
 * 
 * @param {string} badgeId - The badge ID to show notification for
 */
export function queueBadgeNotification(badgeId) {
  try {
    const queue = JSON.parse(localStorage.getItem('badgeNotificationQueue') || '[]');
    
    if (!queue.includes(badgeId)) {
      queue.push(badgeId);
      localStorage.setItem('badgeNotificationQueue', JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Error queueing badge notification:', error);
  }
}

/**
 * Get and clear the next badge notification from the queue
 * @returns {string|null} Badge ID or null if queue is empty
 */
export function dequeueNextBadgeNotification() {
  try {
    const queue = JSON.parse(localStorage.getItem('badgeNotificationQueue') || '[]');
    
    if (queue.length === 0) {
      return null;
    }

    const badgeId = queue.shift();
    localStorage.setItem('badgeNotificationQueue', JSON.stringify(queue));
    
    return badgeId;
  } catch (error) {
    console.error('Error dequeuing badge notification:', error);
    return null;
  }
}

/**
 * Clear all badge notifications from the queue
 */
export function clearBadgeNotificationQueue() {
  try {
    localStorage.removeItem('badgeNotificationQueue');
  } catch (error) {
    console.error('Error clearing badge notification queue:', error);
  }
}
