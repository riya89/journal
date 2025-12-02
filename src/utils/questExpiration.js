import { apiPost, apiGet } from './api';
import { API_BASE_URL } from '../config/api';

/**
 * Quest Expiration Utility
 * Handles checking and rotating expired quests
 */

/**
 * Check for expired quests and generate new ones
 * Should be called on user login/app load
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of expiration check
 */
export const checkAndRotateQuests = async (userId) => {
  try {
    console.log('🔄 Checking for expired quests...');
    
    const response = await apiPost(`${API_BASE_URL}/quests/check-expiration`, {
      uid: userId
    });

    if (!response.ok) {
      throw new Error('Failed to check quest expiration');
    }

    const data = await response.json();
    
    if (data.expiredQuests && data.expiredQuests.length > 0) {
      console.log(`✅ Expired ${data.expiredQuests.length} quest(s) and generated new ones`);
    } else {
      console.log('✅ No expired quests found');
    }

    return {
      success: true,
      expiredCount: data.expiredQuests?.length || 0,
      newQuests: data.newQuests || [],
      message: data.message
    };
  } catch (error) {
    console.error('❌ Failed to check quest expiration:', error);
    // Don't throw - quest expiration should not block app loading
    return {
      success: false,
      expiredCount: 0,
      newQuests: [],
      error: error.message
    };
  }
};

/**
 * Get the last quest generation timestamps
 * Used to determine if new quests should be generated
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Last generation timestamps
 */
export const getLastQuestGeneration = async (userId) => {
  try {
    const response = await apiGet(`${API_BASE_URL}/quests/last-generation?uid=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to get last quest generation');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to get last quest generation:', error);
    return {
      daily: null,
      weekly: null,
      monthly: null
    };
  }
};

/**
 * Manually trigger quest rotation for a specific period
 * Useful for testing or admin purposes
 * @param {string} userId - User ID
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {Promise<Object>} Result of rotation
 */
export const rotateQuestsForPeriod = async (userId, period) => {
  try {
    const response = await apiPost(`${API_BASE_URL}/quests/rotate`, {
      uid: userId,
      period
    });

    if (!response.ok) {
      throw new Error(`Failed to rotate ${period} quests`);
    }

    const data = await response.json();
    console.log(`✅ Rotated ${period} quests successfully`);
    
    return {
      success: true,
      newQuests: data.newQuests || [],
      message: data.message
    };
  } catch (error) {
    console.error(`❌ Failed to rotate ${period} quests:`, error);
    return {
      success: false,
      newQuests: [],
      error: error.message
    };
  }
};

/**
 * Check if a quest period has expired
 * @param {Date} lastGeneration - Last generation timestamp
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {boolean} True if period has expired
 */
export const isPeriodExpired = (lastGeneration, period) => {
  if (!lastGeneration) return true;

  const now = new Date();
  const lastGen = new Date(lastGeneration);

  switch (period) {
    case 'daily':
      // Check if it's a new day
      return now.toDateString() !== lastGen.toDateString();
    
    case 'weekly':
      // Check if it's a new week (assuming week starts on Sunday)
      const nowWeekStart = new Date(now);
      nowWeekStart.setDate(now.getDate() - now.getDay());
      nowWeekStart.setHours(0, 0, 0, 0);
      
      const lastWeekStart = new Date(lastGen);
      lastWeekStart.setDate(lastGen.getDate() - lastGen.getDay());
      lastWeekStart.setHours(0, 0, 0, 0);
      
      return nowWeekStart.getTime() > lastWeekStart.getTime();
    
    case 'monthly':
      // Check if it's a new month
      return now.getMonth() !== lastGen.getMonth() || now.getFullYear() !== lastGen.getFullYear();
    
    default:
      return false;
  }
};
