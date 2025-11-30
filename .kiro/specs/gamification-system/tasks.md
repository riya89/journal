# Implementation Plan

- [x] 1. Set up quest system database and API endpoints
  - Create Firebase collection structure for quests and user progress
  - Implement Node.js API endpoints for quest management
  - Add quest generation logic with daily/weekly/monthly templates
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Create Firebase collections for quest data
  - Create `quests` collection with quest templates
  - Create `userProgress` collection for XP and level tracking
  - Set up indexes for efficient querying
  - _Requirements: 1.1, 4.1, 4.3_

- [x] 1.2 Implement quest API endpoints
  - Create `GET /journal/quests/active` endpoint
  - Create `POST /journal/quests/progress` endpoint
  - Create `POST /journal/quests/complete` endpoint
  - Add quest expiration logic
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.3 Build quest generation system
  - Implement daily quest templates (write 100 words, complete 3 tasks, etc.)
  - Implement weekly quest templates (journal 5 days, maintain streak, etc.)
  - Implement monthly quest templates (reach 20 entries, try all categories, etc.)
  - Add quest rotation logic to ensure variety
  - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2. Implement XP and leveling system
  - Create XP calculation and award logic
  - Implement level-up detection and thresholds
  - Build XP persistence across sessions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2.1 Create XP management API
  - Create `GET /journal/user/xp` endpoint
  - Create `POST /journal/user/xp/add` endpoint
  - Implement level calculation based on XP thresholds
  - Add level-up notification logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2.2 Build XP Bar component
  - Create `XPBar.jsx` component with progress visualization
  - Add level badge display
  - Implement smooth progress animations
  - Show XP progress text (current/next level)
  - _Requirements: 4.4_

- [x] 3. Create quest panel UI
  - Build quest display component with tabs
  - Implement quest progress tracking
  - Add quest completion animations
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 3.1 Build QuestPanel component
  - Create `QuestPanel.jsx` with daily/weekly/monthly tabs
  - Implement `QuestCard.jsx` for individual quest display
  - Add progress bars and time remaining indicators
  - Integrate with quest API endpoints
  - _Requirements: 1.1, 1.5_

- [x] 3.2 Add quest progress tracking
  - Hook into journal save events to update word count quests
  - Hook into task completion events to update task quests
  - Hook into streak calculations to update streak quests
  - Implement real-time progress updates
  - _Requirements: 1.2, 1.4_

- [x] 4. Implement celebration system
  - Create celebration modal component
  - Add confetti animation library
  - Build celebration trigger logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.1 Build CelebrationModal component
  - Create `CelebrationModal.jsx` with stats display
  - Integrate confetti animation (canvas-confetti library)
  - Add reward badge display
  - Implement modal dismiss and share options
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [x] 4.2 Create daily status check endpoint
  - Create `GET /journal/planner/daily-status` endpoint
  - Check if all tasks are completed for the day
  - Calculate completion stats (time, tasks, streak)
  - Determine if special badge should be awarded
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 4.3 Integrate celebration triggers
  - Trigger celebration modal when all tasks completed
  - Award "Perfect Day" badge for complete days
  - Track perfect day count in user stats
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 5. Build streak recovery system
  - Enhance Raindrop streak detection
  - Create recovery message generation
  - Build compassionate recovery modal
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5.1 Enhance Raindrop streak endpoint
  - Modify existing `/analytics/streaks` to include `streakBroken` flag
  - Add `missedDays` calculation
  - Return `previousStreak` value for broken streaks
  - _Requirements: 3.1_

- [x] 5.2 Create recovery message endpoint
  - Create `GET /journal/streak/recovery-message` endpoint
  - Generate compassionate messages based on previous streak
  - Use encouraging language focusing on progress
  - _Requirements: 3.2, 3.3_

- [x] 5.3 Build StreakRecoveryModal component
  - Create `StreakRecoveryModal.jsx` with soft color scheme
  - Display previous streak achievement prominently
  - Add "Start Writing" CTA button
  - Implement modal trigger on app open after missed day
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 6. Implement badge system
  - Extend existing badge logic in Raindrop
  - Create badge gallery UI
  - Add new badge types (Perfect Day, Quest Master, etc.)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.1 Add new badge definitions
  - Add Perfect Day badge (all tasks completed)
  - Add Quest Master badges (10, 25, 50 quests completed)
  - Add Level badges (reach level 5, 10, 20)
  - Store badge metadata (name, icon, rarity, requirement)
  - _Requirements: 5.1, 5.5_

- [x] 6.2 Build BadgeGallery component
  - Create `BadgeGallery.jsx` with grid layout
  - Display earned badges with full color
  - Show locked badges with grayscale and unlock conditions
  - Add rarity indicators (common, rare, legendary)
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 6.3 Implement badge award notifications
  - Create badge unlock modal/toast
  - Show badge with animation when earned
  - Display badge name and rarity
  - _Requirements: 5.2_

- [x] 7. Add quest progress hooks throughout app
  - Integrate quest updates in journal save flow
  - Integrate quest updates in task completion flow
  - Add quest completion checks after user actions
  - _Requirements: 1.2, 1.4_

- [x] 7.1 Hook journal save events
  - Update word count quests when journal saved
  - Update daily entry quests
  - Check for quest completions and award XP
  - _Requirements: 1.2, 1.4_

- [x] 7.2 Hook task completion events
  - Update task completion quests when tasks marked done
  - Update category-specific quests
  - Check for quest completions and award XP
  - _Requirements: 1.2, 1.4_

- [x] 8. Implement quest expiration and rotation
  - Create scheduled job for quest expiration
  - Generate new quests when periods end
  - Clean up expired quests
  - _Requirements: 1.3, 6.4_

- [x] 8.1 Build quest expiration logic
  - Check quest expiration on user login
  - Mark expired quests as inactive
  - Generate replacement quests for new period
  - _Requirements: 1.3, 6.4_

- [x] 9. Add gamification dashboard page
  - Create central page showing all gamification features
  - Display XP, level, quests, and badges
  - Add navigation to detailed views
  - _Requirements: 1.1, 4.4, 5.4_

- [x] 9.1 Create GamificationDashboard component
  - Build `GamificationDashboard.jsx` page
  - Integrate XPBar, QuestPanel, and BadgeGallery
  - Add stats overview section
  - Implement responsive layout
  - _Requirements: 1.1, 4.4, 5.4_

- [ ]* 10. Add analytics and tracking
  - Track quest completion rates
  - Track celebration trigger frequency
  - Monitor streak recovery effectiveness
  - _Requirements: 1.2, 2.1, 3.1_
