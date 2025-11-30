# Badge System Implementation

## Overview

The badge system has been fully implemented with badge definitions, UI components, and notification system. This document provides a summary of what was created and how to use it.

## Files Created

### 1. Badge Definitions (`src/constants/badges.js`)

Defines all available badges with metadata:
- **Badge Categories**: Perfect Day, Quest Master, Level, Streak, Special
- **Rarities**: Common, Rare, Legendary
- **15 Total Badges** including:
  - Perfect Day badges (1, 7, 30 days)
  - Quest Master badges (10, 25, 50 quests)
  - Level badges (5, 10, 20)
  - Streak badges (7, 30, 100 days)
  - Special badges (Perfect Week, Early Bird, Night Owl)

**Key Functions**:
- `getBadgeById(badgeId)` - Get badge definition
- `getBadgesByCategory(category)` - Filter by category
- `checkEarnedBadges(userStats)` - Check which badges user has earned

### 2. Badge Gallery Component (`src/components/BadgeGallery.jsx`)

A comprehensive UI component to display all badges:
- **Grid Layout**: Responsive grid showing all badges
- **Filter Options**: All, Earned, Locked
- **Category Grouping**: Badges organized by category
- **Visual States**:
  - Earned badges: Full color with rarity gradient
  - Locked badges: Grayscale with lock icon
- **Rarity Indicators**: Color-coded borders and text
- **Detail Modal**: Click any badge to see details
- **Theme Support**: Light and dark mode

### 3. Badge Unlock Modal (`src/components/BadgeUnlockModal.jsx`)

Celebration modal shown when a badge is earned:
- **Confetti Animation**: Different patterns based on rarity
  - Legendary: Epic multi-source confetti
  - Rare: Moderate confetti from sides
  - Common: Simple confetti burst
- **Badge Display**: Large icon with animation
- **Rarity Styling**: Gradient backgrounds and glows
- **Badge Details**: Name, description, requirement
- **Theme Support**: Light and dark mode

### 4. Badge Manager Utility (`src/utils/badgeManager.js`)

Helper functions for badge management:
- `fetchUserBadges(userId)` - Fetch earned badges from backend
- `checkForNewBadges(userStats)` - Check for newly earned badges
- `awardBadge(badgeId)` - Award a badge to user
- `checkAndAwardBadges(userStats, existingBadges)` - Check and award all eligible badges
- `getBadgeProgress(badgeId, userStats)` - Get progress toward a badge
- `queueBadgeNotification(badgeId)` - Queue badge for later display
- `dequeueNextBadgeNotification()` - Get next queued badge
- `clearBadgeNotificationQueue()` - Clear all queued badges

### 5. CSS Animations (`src/index.css`)

Added animations for badge unlock modal:
- `scaleIn` - Modal entrance animation
- `bounce-slow` - Badge icon bounce effect

### 6. Example Integration (`src/components/BadgeSystem.example.jsx`)

Complete example showing how to integrate the badge system with:
- Loading user badges
- Checking for new badges after actions
- Showing unlock notifications
- Handling multiple badge unlocks

## Integration Points

### 1. Display Badge Gallery

```jsx
import BadgeGallery from './components/BadgeGallery';

function Dashboard() {
  const [earnedBadges, setEarnedBadges] = useState([]);
  
  useEffect(() => {
    // Load user badges
    fetchUserBadges().then(badges => setEarnedBadges(badges));
  }, []);
  
  return (
    <BadgeGallery earnedBadges={earnedBadges} theme={theme} />
  );
}
```

### 2. Award Badges After Task Completion

```jsx
import { checkAndAwardBadges } from './utils/badgeManager';
import BadgeUnlockModal from './components/BadgeUnlockModal';

function CelebrationModal({ onClose }) {
  const [newBadge, setNewBadge] = useState(null);
  
  useEffect(() => {
    // After showing celebration, check for badges
    const checkBadges = async () => {
      const userStats = {
        perfectDays: 1, // Increment this
        questsCompleted: 10,
        currentLevel: 5,
        longestStreak: 7,
        earnedBadges: [] // Existing badges
      };
      
      const newBadges = await checkAndAwardBadges(userStats, []);
      if (newBadges.length > 0) {
        setNewBadge(newBadges[0].id);
      }
    };
    
    checkBadges();
  }, []);
  
  return (
    <>
      {/* Celebration content */}
      {newBadge && (
        <BadgeUnlockModal
          badgeId={newBadge}
          onClose={() => setNewBadge(null)}
          theme={theme}
        />
      )}
    </>
  );
}
```

### 3. Award Badges After Quest Completion

```jsx
// In QuestPanel or quest completion handler
const handleQuestComplete = async (questId) => {
  // Complete the quest
  await completeQuest(questId);
  
  // Check for new badges
  const userStats = await fetchUserStats();
  const newBadges = await checkAndAwardBadges(userStats, userStats.earnedBadges);
  
  if (newBadges.length > 0) {
    setShowBadgeUnlock(newBadges[0].id);
  }
};
```

### 4. Award Badges After Level Up

```jsx
// In XPBar or level up handler
const handleLevelUp = async (newLevel) => {
  const userStats = {
    ...currentStats,
    currentLevel: newLevel
  };
  
  const newBadges = await checkAndAwardBadges(userStats, earnedBadges);
  
  if (newBadges.length > 0) {
    setShowBadgeUnlock(newBadges[0].id);
  }
};
```

## Backend Requirements

The badge system requires the following backend endpoints:

### 1. Get User Stats
```
GET /journal/user/stats
Authorization: Bearer {token}

Response:
{
  "totalXP": 450,
  "currentLevel": 5,
  "questsCompleted": 23,
  "earnedBadges": ["perfect_day_1", "quest_master_10", "level_5"],
  "stats": {
    "totalJournalEntries": 45,
    "totalTasksCompleted": 120,
    "longestStreak": 14,
    "perfectDays": 3
  }
}
```

### 2. Award Badge
```
POST /journal/user/badge/award
Authorization: Bearer {token}
Body: {
  "badgeId": "perfect_day_1"
}

Response:
{
  "success": true,
  "badge": {
    "id": "perfect_day_1",
    "name": "First Perfect Day",
    "earnedAt": "2025-11-30T12:00:00Z"
  }
}
```

### 3. Update User Stats

The backend should automatically update user stats when:
- All tasks completed for a day → increment `perfectDays`
- Quest completed → increment `questsCompleted`
- XP added and level up occurs → update `currentLevel`
- Streak milestone reached → update `longestStreak`

## Badge Award Logic

Badges are automatically checked and awarded based on user stats:

1. **Perfect Day Badges**: Awarded when `perfectDays` reaches threshold (1, 7, 30)
2. **Quest Master Badges**: Awarded when `questsCompleted` reaches threshold (10, 25, 50)
3. **Level Badges**: Awarded when `currentLevel` reaches threshold (5, 10, 20)
4. **Streak Badges**: Awarded when `longestStreak` reaches threshold (7, 30, 100)
5. **Special Badges**: Awarded by backend logic for specific achievements

## Notification Queue

The badge system includes a notification queue to handle multiple badge unlocks:

1. When multiple badges are earned at once, show the first one immediately
2. Queue remaining badges using `queueBadgeNotification(badgeId)`
3. When first modal closes, check queue with `dequeueNextBadgeNotification()`
4. Show next badge after a short delay
5. Continue until queue is empty

This prevents overwhelming the user with multiple modals at once.

## Styling and Theming

All components support light and dark themes:
- Light theme: Uses `#7A916C` (leaf green) and white backgrounds
- Dark theme: Uses `#EBDDBF` (cream) text on `#2b241c` backgrounds
- Rarity colors are consistent across themes
- Animations and confetti adapt to badge rarity

## Testing

To test the badge system:

1. **Display Gallery**: Add `<BadgeGallery earnedBadges={[]} theme="light" />` to any page
2. **Test Unlock Modal**: Add `<BadgeUnlockModal badgeId="perfect_day_1" onClose={() => {}} theme="light" />`
3. **Test Badge Checking**: Use `checkEarnedBadges()` with mock user stats
4. **Test Notification Queue**: Queue multiple badges and verify they show sequentially

## Next Steps

To fully integrate the badge system:

1. ✅ Add badge definitions (completed)
2. ✅ Create BadgeGallery component (completed)
3. ✅ Create BadgeUnlockModal component (completed)
4. ✅ Create badge management utilities (completed)
5. ⏳ Add backend endpoints for badge management
6. ⏳ Integrate badge checking into CelebrationModal
7. ⏳ Integrate badge checking into QuestPanel
8. ⏳ Integrate badge checking into XPBar
9. ⏳ Add badge gallery to user profile or dashboard
10. ⏳ Test end-to-end badge earning flow

## Summary

The badge system is now fully implemented on the frontend with:
- 15 badges across 5 categories
- Beautiful UI components with animations
- Comprehensive utility functions
- Theme support
- Notification queue for multiple unlocks
- Complete integration examples

The system is ready to be integrated into the application once the backend endpoints are available.
