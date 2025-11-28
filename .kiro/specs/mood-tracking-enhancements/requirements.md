# Requirements Document

## Introduction

This specification defines enhancements to mood tracking capabilities, including extended history views, a visual mood constellation feature, a time capsule for future self-reflection, and a gratitude jar. These features aim to provide deeper insights into emotional patterns and create meaningful ways to track personal growth.

## Glossary

- **Mood Dashboard**: The interface displaying mood trends and analytics
- **Mood Constellation**: A visual representation of mood entries as stars forming a personal constellation
- **Time Capsule**: A feature allowing users to write messages to their future selves with scheduled unlock dates
- **Gratitude Jar**: A collection of gratitude entries that can be revisited for emotional support
- **Extended History**: Mood data visualization spanning 30, 90, or 365 days
- **Mood Entry**: A recorded mood value (1-5 scale) associated with a journal entry
- **Unlock Date**: The future date when a time capsule message becomes accessible

## Requirements

### Requirement 1

**User Story:** As a journal user, I want to view my mood history over extended periods (30/90/365 days), so that I can identify long-term emotional patterns.

#### Acceptance Criteria

1. WHEN a user accesses the Mood Dashboard, THE Mood Dashboard SHALL provide options to view 7, 30, 90, or 365-day periods
2. WHEN a time period is selected, THE Mood Dashboard SHALL retrieve and display all mood entries within that range
3. WHERE insufficient data exists for a period, THE Mood Dashboard SHALL display available data with a note about the limited range
4. WHEN displaying extended history, THE Mood Dashboard SHALL calculate and show average mood, mood variance, and trend direction
5. WHILE viewing extended periods, THE Mood Dashboard SHALL allow users to zoom into specific date ranges for detailed analysis

### Requirement 2

**User Story:** As a journal user, I want to see my mood entries visualized as a constellation of stars, so that I have a beautiful and meaningful representation of my emotional journey.

#### Acceptance Criteria

1. WHEN a user views the Mood Constellation, THE Mood Constellation SHALL display each journal entry as a star on a night sky background
2. WHEN rendering stars, THE Mood Constellation SHALL assign colors based on mood values (warm colors for positive, cool colors for lower moods)
3. WHERE entries exist on consecutive days, THE Mood Constellation SHALL draw connecting lines between stars
4. WHERE a user achieves a perfect mood score (5/5), THE Mood Constellation SHALL display that entry as a shooting star with animation
5. WHEN a user interacts with a star, THE Mood Constellation SHALL display the date and mood value for that entry

### Requirement 3

**User Story:** As a journal user, I want to write letters to my future self that unlock after a set period, so that I can reflect on my growth and compare past and present perspectives.

#### Acceptance Criteria

1. WHEN creating a time capsule, THE Time Capsule SHALL allow users to write a message and select an unlock date (30, 90, or 365 days in the future)
2. WHEN saving a time capsule, THE Time Capsule SHALL record the current mood and any specified goals
3. WHERE the unlock date arrives, THE Time Capsule SHALL send a notification to the user
4. WHEN a time capsule unlocks, THE Time Capsule SHALL display the original message alongside current mood and goals for comparison
5. WHILE a time capsule is locked, THE Time Capsule SHALL prevent the user from viewing or editing the message

### Requirement 4

**User Story:** As a journal user, I want to collect gratitude entries in a virtual jar, so that I can revisit positive moments when I need emotional support.

#### Acceptance Criteria

1. WHEN a user creates a gratitude entry, THE Gratitude Jar SHALL store it with the date and associated mood
2. WHEN viewing the Gratitude Jar, THE Gratitude Jar SHALL display a visual representation that fills as more entries are added
3. WHERE a user requests a random gratitude, THE Gratitude Jar SHALL retrieve and display a random past entry
4. WHEN displaying gratitude entries, THE Gratitude Jar SHALL show the text, date, and mood from when it was written
5. WHILE the jar contains entries, THE Gratitude Jar SHALL provide filtering options by date range or mood level

### Requirement 5

**User Story:** As a journal user, I want to see insights comparing different time periods, so that I can understand how my emotional state has evolved.

#### Acceptance Criteria

1. WHEN viewing extended history, THE Mood Dashboard SHALL calculate mood improvement or decline percentages between periods
2. WHEN comparing periods, THE Mood Dashboard SHALL identify the best and worst days with context
3. WHERE patterns emerge, THE Mood Dashboard SHALL highlight recurring positive or negative trends
4. WHEN generating insights, THE Mood Dashboard SHALL provide actionable suggestions based on what correlates with better moods
5. WHILE displaying comparisons, THE Mood Dashboard SHALL use encouraging language that focuses on progress and growth

### Requirement 6

**User Story:** As a journal user, I want to export my mood data and visualizations, so that I can share them with therapists or keep personal records.

#### Acceptance Criteria

1. WHEN a user requests data export, THE Mood Dashboard SHALL generate a downloadable file containing all mood entries
2. WHERE constellation visualization is requested, THE Mood Dashboard SHALL export the constellation as an image file
3. WHEN exporting, THE Mood Dashboard SHALL include metadata (date ranges, averages, insights)
4. WHERE time capsules exist, THE Mood Dashboard SHALL include unlocked capsules in exports (locked ones remain private)
5. WHEN exporting gratitude entries, THE Gratitude Jar SHALL format them as a readable document with dates and moods
