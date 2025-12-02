/**
 * Badge System Integration Example
 * 
 * This file demonstrates how to integrate the badge system into your application.
 * It shows how to:
 * 1. Display the BadgeGallery component
 * 2. Check for and award new badges
 * 3. Show badge unlock notifications
 * 4. Integrate with existing celebration flows
 */

import { useState, useEffect } from 'react';
import BadgeGallery from './BadgeGallery';
import BadgeUnlockModal from './BadgeUnlockModal';
import { 
  fetchUserBadges, 
  checkAndAwardBadges, 
  dequeueNextBadgeNotification,
  queueBadgeNotification 
} from '../utils/badgeManager';
import { apiGet } from '../utils/api';

export default function BadgeSystemExample({ theme = 'light' }) {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(null);

  // Load user badges and stats on mount
  useEffect(() => {
    loadUserData();
    
    // Check for queued badge notifications
    const queuedBadge = dequeueNextBadgeNotification();
    if (queuedBadge) {
      setShowBadgeUnlock(queuedBadge);
    }
  }, []);

  const loadUserData = async () => {
    try {
      // Fetch user stats from backend
      const response = await apiGet('https://journal-6xfj.onrender.com/journal/user/stats');
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
        setEarnedBadges(data.earnedBadges || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Example: Check for new badges after completing all tasks
  const handleTasksCompleted = async () => {
    if (!userStats) return;

    // Update stats with new perfect day count
    const updatedStats = {
      ...userStats,
      perfectDays: (userStats.perfectDays || 0) + 1
    };

    // Check for newly earned badges
    const newBadges = await checkAndAwardBadges(updatedStats, earnedBadges);

    if (newBadges.length > 0) {
      // Show the first badge unlock modal
      setShowBadgeUnlock(newBadges[0].id);
      
      // Queue remaining badges for later
      newBadges.slice(1).forEach(badge => {
        queueBadgeNotification(badge.id);
      });

      // Update earned badges list
      setEarnedBadges([...earnedBadges, ...newBadges.map(b => b.id)]);
    }
  };

  // Example: Check for new badges after completing a quest
  const handleQuestCompleted = async () => {
    if (!userStats) return;

    // Update stats with new quest completion count
    const updatedStats = {
      ...userStats,
      questsCompleted: (userStats.questsCompleted || 0) + 1
    };

    // Check for newly earned badges
    const newBadges = await checkAndAwardBadges(updatedStats, earnedBadges);

    if (newBadges.length > 0) {
      setShowBadgeUnlock(newBadges[0].id);
      newBadges.slice(1).forEach(badge => {
        queueBadgeNotification(badge.id);
      });
      setEarnedBadges([...earnedBadges, ...newBadges.map(b => b.id)]);
    }
  };

  // Example: Check for new badges after leveling up
  const handleLevelUp = async (newLevel) => {
    if (!userStats) return;

    // Update stats with new level
    const updatedStats = {
      ...userStats,
      currentLevel: newLevel
    };

    // Check for newly earned badges
    const newBadges = await checkAndAwardBadges(updatedStats, earnedBadges);

    if (newBadges.length > 0) {
      setShowBadgeUnlock(newBadges[0].id);
      newBadges.slice(1).forEach(badge => {
        queueBadgeNotification(badge.id);
      });
      setEarnedBadges([...earnedBadges, ...newBadges.map(b => b.id)]);
    }
  };

  const handleBadgeUnlockClose = () => {
    setShowBadgeUnlock(null);
    
    // Check if there are more badges in the queue
    const nextBadge = dequeueNextBadgeNotification();
    if (nextBadge) {
      // Show next badge after a short delay
      setTimeout(() => {
        setShowBadgeUnlock(nextBadge);
      }, 500);
    }
  };

  return (
    <div className="badge-system-example p-6">
      <h1 className="text-3xl font-bold mb-6">Badge System Example</h1>

      {/* Example action buttons */}
      <div className="mb-8 space-x-4">
        <button
          onClick={handleTasksCompleted}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Simulate Tasks Completed
        </button>
        <button
          onClick={handleQuestCompleted}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Simulate Quest Completed
        </button>
        <button
          onClick={() => handleLevelUp((userStats?.currentLevel || 1) + 1)}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Simulate Level Up
        </button>
      </div>

      {/* Badge Gallery */}
      <BadgeGallery earnedBadges={earnedBadges} theme={theme} />

      {/* Badge Unlock Modal */}
      {showBadgeUnlock && (
        <BadgeUnlockModal
          badgeId={showBadgeUnlock}
          onClose={handleBadgeUnlockClose}
          theme={theme}
        />
      )}
    </div>
  );
}

/**
 * Integration Guide:
 * 
 * 1. In your Home/Dashboard component:
 *    - Import BadgeGallery and display it in a dedicated section
 *    - Load user badges on mount using fetchUserBadges()
 * 
 * 2. In your CelebrationModal (when all tasks completed):
 *    - After showing celebration, check for new badges
 *    - Call checkAndAwardBadges() with updated perfectDays count
 *    - Show BadgeUnlockModal if new badges earned
 * 
 * 3. In your QuestPanel (when quest completed):
 *    - After quest completion, check for new badges
 *    - Call checkAndAwardBadges() with updated questsCompleted count
 *    - Show BadgeUnlockModal if new badges earned
 * 
 * 4. In your XPBar (when level up occurs):
 *    - After level up, check for new badges
 *    - Call checkAndAwardBadges() with updated currentLevel
 *    - Show BadgeUnlockModal if new badges earned
 * 
 * 5. Backend Integration:
 *    - Add endpoint: GET /journal/user/stats
 *      Returns: { totalXP, currentLevel, questsCompleted, earnedBadges, stats: { perfectDays, longestStreak, ... } }
 *    
 *    - Add endpoint: POST /journal/user/badge/award
 *      Body: { badgeId }
 *      Returns: { success, badge }
 *    
 *    - Update user stats when:
 *      * All tasks completed for a day (increment perfectDays)
 *      * Quest completed (increment questsCompleted)
 *      * Level up (update currentLevel)
 *      * Streak milestone reached (update longestStreak)
 */
