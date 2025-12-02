import { apiPost } from './api';
import { API_BASE_URL } from '../config/api';

/**
 * Quest Progress Tracking Utility
 * Provides functions to update quest progress based on user actions
 */

/**
 * Update quest progress after journal save
 * Tracks word count and daily entry quests
 * @param {string} userId - User ID
 * @param {string} content - Journal content
 * @param {string} date - Journal date
 */
export const updateJournalQuests = async (userId, content, date) => {
  try {
    // Calculate word count
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

    // Update word count quest progress
    await apiPost(`${API_BASE_URL}/quests/progress`, {
      uid: userId,
      questType: 'word_count',
      progress: wordCount,
      date
    });

    // Update daily entry quest progress
    await apiPost(`${API_BASE_URL}/quests/progress`, {
      uid: userId,
      questType: 'daily_entry',
      progress: 1,
      date
    });

    console.log('✅ Quest progress updated for journal save');
  } catch (error) {
    console.error('❌ Failed to update journal quest progress:', error);
    // Don't throw - quest updates should not block journal saves
  }
};

/**
 * Update quest progress after task completion
 * Tracks task completion and category-specific quests
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {string} category - Task category
 * @param {string} date - Completion date
 * @param {boolean} completed - Whether task was completed or uncompleted
 */
export const updateTaskQuests = async (userId, taskId, category, date, completed) => {
  try {
    if (!completed) {
      // If task was uncompleted, we don't update quest progress
      return;
    }

    // Update task completion quest progress
    await apiPost(`${API_BASE_URL}/quests/progress`, {
      uid: userId,
      questType: 'task_completion',
      progress: 1,
      date,
      metadata: {
        taskId,
        category
      }
    });

    // Update category-specific quest progress if applicable
    if (category) {
      await apiPost(`${API_BASE_URL}/quests/progress`, {
        uid: userId,
        questType: 'category_task',
        progress: 1,
        date,
        metadata: {
          category
        }
      });
    }

    console.log('✅ Quest progress updated for task completion');
  } catch (error) {
    console.error('❌ Failed to update task quest progress:', error);
    // Don't throw - quest updates should not block task operations
  }
};

/**
 * Update quest progress for streak-related quests
 * Called when streak data is calculated
 * @param {string} userId - User ID
 * @param {number} currentStreak - Current streak count
 * @param {string} date - Current date
 */
export const updateStreakQuests = async (userId, currentStreak, date) => {
  try {
    await apiPost(`${API_BASE_URL}/quests/progress`, {
      uid: userId,
      questType: 'streak',
      progress: currentStreak,
      date
    });

    console.log('✅ Quest progress updated for streak');
  } catch (error) {
    console.error('❌ Failed to update streak quest progress:', error);
    // Don't throw - quest updates should not block other operations
  }
};

/**
 * Check for quest completions and trigger rewards
 * Should be called after any quest progress update
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Completion data including XP rewards and level ups
 */
export const checkQuestCompletions = async (userId) => {
  try {
    const response = await apiPost(`${API_BASE_URL}/quests/check-completions`, {
      uid: userId
    });

    if (!response.ok) {
      throw new Error('Failed to check quest completions');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to check quest completions:', error);
    return { completedQuests: [], xpAwarded: 0, leveledUp: false };
  }
};
