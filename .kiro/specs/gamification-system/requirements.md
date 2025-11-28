# Requirements Document

## Introduction

This specification defines a gamification system for the journaling application that encourages consistent engagement through quests, celebrations, and compassionate streak recovery. The system aims to motivate users while maintaining the app's gentle, supportive tone.

## Glossary

- **Journal System**: The core application that manages user journal entries, moods, and tasks
- **Quest System**: A feature that provides daily, weekly, and monthly challenges to users
- **Streak Recovery System**: A compassionate feature that handles missed journaling days with encouragement
- **Celebration System**: A reward mechanism that acknowledges user achievements
- **XP (Experience Points)**: Virtual points earned by completing quests and tasks
- **Badge**: A visual reward earned for achieving specific milestones
- **Quest**: A time-bound challenge with specific completion criteria

## Requirements

### Requirement 1

**User Story:** As a journal user, I want to receive daily, weekly, and monthly quests, so that I stay motivated to journal and complete tasks regularly.

#### Acceptance Criteria

1. WHEN THE Journal System loads the user dashboard, THE Quest System SHALL retrieve and display all active quests for the current day, week, and month
2. WHEN a user completes a quest objective, THE Quest System SHALL update the quest progress in real-time
3. WHEN a quest expires without completion, THE Quest System SHALL remove it from active quests and generate new quests for the next period
4. WHERE a quest is completed, THE Quest System SHALL award the specified XP reward to the user
5. WHILE a quest is active, THE Quest System SHALL display progress percentage and time remaining until expiration

### Requirement 2

**User Story:** As a journal user, I want to see celebrations when I complete all my tasks, so that I feel accomplished and motivated.

#### Acceptance Criteria

1. WHEN a user completes all planned tasks for a day, THE Celebration System SHALL display a congratulatory modal with completion statistics
2. WHEN all tasks are completed, THE Celebration System SHALL trigger a visual animation (confetti or similar effect)
3. WHERE a user achieves a perfect day (all tasks completed), THE Celebration System SHALL award a special badge
4. WHEN displaying celebrations, THE Celebration System SHALL show total time spent, number of tasks completed, and current streak days
5. WHILE the celebration modal is displayed, THE Celebration System SHALL provide options to dismiss or share the achievement

### Requirement 3

**User Story:** As a journal user, I want gentle encouragement when I miss a journaling day, so that I feel supported rather than guilty about breaking my streak.

#### Acceptance Criteria

1. WHEN a user opens the app after missing one or more days, THE Streak Recovery System SHALL detect the broken streak
2. WHEN a streak is broken, THE Streak Recovery System SHALL display a compassionate message emphasizing that life happens
3. WHEN showing the recovery message, THE Streak Recovery System SHALL highlight the previous streak achievement rather than the failure
4. WHERE a streak is broken, THE Streak Recovery System SHALL provide a one-click option to start journaling immediately
5. WHILE displaying the recovery message, THE Streak Recovery System SHALL use soft, comforting colors (not red or alarming tones)

### Requirement 4

**User Story:** As a journal user, I want to track my XP and level progression, so that I can see my long-term engagement with the app.

#### Acceptance Criteria

1. WHEN a user earns XP from any source, THE Quest System SHALL update the user's total XP immediately
2. WHEN XP reaches a level threshold, THE Quest System SHALL trigger a level-up notification
3. THE Quest System SHALL persist XP and level data across sessions
4. WHEN displaying user profile, THE Quest System SHALL show current level, total XP, and progress to next level
5. WHERE multiple XP sources trigger simultaneously, THE Quest System SHALL aggregate the total and display a single notification

### Requirement 5

**User Story:** As a journal user, I want to earn badges for various achievements, so that I have visual representations of my progress.

#### Acceptance Criteria

1. WHEN a user achieves a badge-worthy milestone, THE Quest System SHALL award the corresponding badge
2. WHEN a new badge is earned, THE Quest System SHALL display a modal showing the badge with its name and rarity
3. THE Quest System SHALL store all earned badges in the user's profile
4. WHEN viewing badges, THE Quest System SHALL display both earned and locked (not yet earned) badges
5. WHERE a badge has rarity levels, THE Quest System SHALL visually distinguish between common, rare, and legendary badges

### Requirement 6

**User Story:** As a journal user, I want quest variety across different time periods, so that I have both short-term and long-term goals.

#### Acceptance Criteria

1. THE Quest System SHALL generate at least two daily quests that expire within 24 hours
2. THE Quest System SHALL generate at least two weekly quests that expire within 7 days
3. THE Quest System SHALL generate at least one monthly quest that expires within 30 days
4. WHEN a time period ends, THE Quest System SHALL automatically generate new quests for the next period
5. WHERE quest generation occurs, THE Quest System SHALL ensure quest variety (not repeating the same quest consecutively)
