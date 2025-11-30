import { apiGet } from './api';

/**
 * Check if all tasks are completed for a specific date and return celebration data
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} - Celebration data if all tasks complete, null otherwise
 */
export const checkCelebrationTrigger = async (date) => {
  try {
    const response = await apiGet(
      `http://localhost:8000/journal/planner/daily-status?date=${date}`
    );
    
    if (!response.ok) {
      console.error('Failed to check daily status:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // Return celebration data only if all tasks are complete
    if (data.allTasksComplete) {
      return {
        stats: data.stats,
        reward: data.reward
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking celebration trigger:', error);
    return null;
  }
};

/**
 * Check if celebration should trigger for today
 * @returns {Promise<Object|null>} - Celebration data if all tasks complete, null otherwise
 */
export const checkTodayCelebration = async () => {
  const today = new Date().toISOString().split('T')[0];
  return checkCelebrationTrigger(today);
};
