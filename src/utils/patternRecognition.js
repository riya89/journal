/**
 * Pattern Recognition Utility
 * Handles theme extraction, pattern detection, and insights across conversations
 */

import { getAuth } from 'firebase/auth';
import { API_BASE_URL } from '../config/api';

const ROOT_URL = API_BASE_URL.replace('/journal', '');

/**
 * Analyze conversation patterns for the current user
 * @param {number} lookbackDays - Number of days to look back (default: 30)
 * @param {number} minSessionCount - Minimum sessions required for analysis (default: 3)
 * @returns {Promise<Object>} Pattern analysis results
 */
export async function analyzePatterns(lookbackDays = 30, minSessionCount = 3) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${ROOT_URL}/journal/assistant/analyze-patterns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lookbackDays,
        minSessionCount
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze patterns');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    throw error;
  }
}

/**
 * Get current stored patterns for the user
 * @returns {Promise<Object>} Current pattern data
 */
export async function getCurrentPatterns() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${ROOT_URL}/journal/assistant/patterns`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch patterns');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return {
      patterns: {
        themes: [],
        recurringChallenges: [],
        improvements: []
      },
      analyzedAt: null,
      sessionCount: 0
    };
  }
}

/**
 * Send a message with pattern context included
 * @param {string} message - User message
 * @param {string} sessionId - Current session ID
 * @param {boolean} includeHistory - Include conversation history
 * @param {boolean} includePatterns - Include pattern analysis in context
 * @returns {Promise<Object>} AI response with message ID and timestamp
 */
export async function sendMessageWithPatterns(message, sessionId, includeHistory = true, includePatterns = true) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${ROOT_URL}/journal/assistant/reply-with-patterns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        sessionId,
        includeHistory,
        includePatterns
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message with patterns:', error);
    throw error;
  }
}

/**
 * Delete conversation history
 * @param {number} olderThanDays - Optional: Delete only conversations older than X days
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteHistory(olderThanDays = null) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const url = olderThanDays 
      ? `${ROOT_URL}/journal/assistant/history?olderThanDays=${olderThanDays}`
      : `${ROOT_URL}/journal/assistant/history`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting history:', error);
    throw error;
  }
}