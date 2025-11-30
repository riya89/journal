# Implementation Plan

- [x] 1. Implement extended mood history in Raindrop
  - Add new endpoint for extended periods
  - Calculate extended statistics
  - Implement trend analysis
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Create extended mood endpoint in Raindrop
  - Add `GET /analytics/mood/extended` endpoint with days parameter
  - Support 7, 30, 90, and 365-day periods
  - Query journal entries within date range
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Implement extended statistics calculation
  - Calculate average mood for period
  - Calculate mood variance
  - Determine trend direction (improving/declining/stable)
  - Identify best and worst days
  - _Requirements: 1.4_

- [x] 1.3 Build ExtendedMoodDashboard component
  - Create `ExtendedMoodDashboard.jsx` with period selector
  - Implement mood chart visualization
  - Display statistics cards (average, trend, days tracked)
  - Add insights section with highlights
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 1.4 Create MoodChart component
  - Build `MoodChart.jsx` using chart library (recharts or chart.js)
  - Display mood data as line or area chart
  - Add zoom functionality for extended periods
  - Implement hover tooltips with date and mood
  - _Requirements: 1.5_

- [x] 2. Build mood constellation visualization
  - Create constellation canvas rendering
  - Implement star positioning and coloring
  - Add connecting lines for consecutive days
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Create MoodConstellation component
  - Build `MoodConstellation.jsx` with canvas element
  - Fetch mood data for last 90 days
  - Set up night sky background
  - _Requirements: 2.1_

- [x] 2.2 Implement star rendering logic
  - Plot each mood entry as a star
  - Assign colors based on mood value (1-5 scale)
  - Size stars appropriately (larger for perfect days)
  - Add glow effect to stars
  - _Requirements: 2.2, 2.4_

- [x] 2.3 Add constellation connections
  - Draw lines between consecutive day entries
  - Check date differences to ensure consecutive days
  - Use subtle line styling for connections
  - _Requirements: 2.3_

- [x] 2.4 Implement shooting star animation
  - Detect perfect mood days (5/5)
  - Animate shooting star effect for perfect days
  - Add particle trail animation
  - _Requirements: 2.4_

- [x] 2.5 Add constellation interactivity
  - Implement hover tooltips showing date and mood
  - Add click to view journal entry for that day
  - Create legend explaining colors and symbols
  - _Requirements: 2.5_

- [x] 3. Implement time capsule feature
  - Create Firebase collection for time capsules
  - Build time capsule API endpoints
  - Implement unlock notification system
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.1 Create time capsule data structure
  - Set up `timeCapsules` subcollection under users
  - Define schema with message, unlock date, mood, goals
  - Add indexes for querying locked/unlocked capsules
  - _Requirements: 3.1, 3.2_

- [x] 3.2 Build time capsule API endpoints
  - Create `POST /journal/timecapsule/create` endpoint
  - Create `GET /journal/timecapsule/list` endpoint
  - Create `GET /journal/timecapsule/:capsuleId` endpoint
  - Add unlock date validation
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 3.3 Implement unlock notification system
  - Create scheduled job to check for unlocking capsules
  - Send notification when capsule unlocks
  - Mark capsule as unlocked in database
  - _Requirements: 3.3_

- [x] 3.4 Build CreateCapsuleModal component
  - Create `CreateCapsuleModal.jsx` with form
  - Add message textarea
  - Add unlock period selector (30/90/365 days)
  - Add current mood selector
  - Add goals input fields
  - _Requirements: 3.1, 3.2_

- [x] 3.5 Build TimeCapsuleUI component
  - Create `TimeCapsuleUI.jsx` main page
  - Display locked capsules with countdown
  - Display unlocked capsules with full content
  - Show comparison of past vs present mood/goals
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 3.6 Implement capsule comparison logic
  - Fetch current mood when capsule unlocks
  - Compare original goals with current state
  - Highlight achieved goals
  - Calculate mood change
  - _Requirements: 3.4_

- [x] 4. Build gratitude jar feature
  - Create Firebase collection for gratitude entries
  - Implement gratitude API endpoints
  - Build gratitude jar UI
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.1 Create gratitude data structure
  - Set up `gratitudeEntries` subcollection under users
  - Define schema with text, date, mood
  - Add indexes for efficient querying
  - _Requirements: 4.1_

- [x] 4.2 Build gratitude API endpoints
  - Create `POST /journal/gratitude/add` endpoint
  - Create `GET /journal/gratitude/random` endpoint
  - Create `GET /journal/gratitude/all` endpoint
  - Add filtering by date range and mood
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [x] 4.3 Build GratitudeJar component
  - Create `GratitudeJar.jsx` with visual jar SVG
  - Implement jar fill animation based on entry count
  - Add "Read Random" button
  - Add "Add Gratitude" button
  - _Requirements: 4.2, 4.3_

- [x] 4.4 Create jar visual representation
  - Design SVG jar that fills as entries are added
  - Animate fill level changes
  - Add gratitude "notes" as visual elements in jar
  - _Requirements: 4.2_

- [x] 4.5 Build AddGratitudeModal component
  - Create `AddGratitudeModal.jsx` with form
  - Add gratitude text input
  - Add mood selector
  - Implement save functionality
  - _Requirements: 4.1_

- [x] 4.6 Display random gratitude feature
  - Show random gratitude in card format
  - Display original date and mood
  - Add "Read Another" button
  - _Requirements: 4.3, 4.4_

- [x] 5. Implement mood insights and comparisons
  - Build period comparison logic
  - Generate actionable insights
  - Create insights display component
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.1 Implement period comparison calculations
  - Compare mood between different time periods
  - Calculate improvement/decline percentages
  - Identify pattern changes
  - _Requirements: 5.1_

- [x] 5.2 Build insight generation logic
  - Identify best and worst days with context
  - Detect recurring positive/negative trends
  - Generate actionable suggestions based on patterns
  - Use encouraging language focused on growth
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 5.3 Add insights to ExtendedMoodDashboard
  - Display comparison insights
  - Show pattern highlights
  - Present actionable suggestions
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6. Implement data export functionality
  - Build export API endpoints
  - Create export UI components
  - Support multiple export formats
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6.1 Create mood data export endpoint
  - Create `GET /journal/export/mood` endpoint
  - Generate CSV or JSON file with all mood entries
  - Include metadata (date ranges, averages)
  - _Requirements: 6.1, 6.3_

- [ ] 6.2 Implement constellation image export
  - Add export button to MoodConstellation
  - Convert canvas to image file (PNG)
  - Trigger download with proper filename
  - _Requirements: 6.2_

- [ ] 6.3 Add time capsule export
  - Include unlocked capsules in export
  - Exclude locked capsules for privacy
  - Format as readable document
  - _Requirements: 6.3, 6.4_

- [ ] 6.4 Implement gratitude export
  - Create `GET /journal/export/gratitude` endpoint
  - Format gratitude entries as document
  - Include dates and moods
  - _Requirements: 6.5_

- [ ] 6.5 Build export UI
  - Add export buttons to relevant pages
  - Show export options modal
  - Handle download triggers
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Create mood tracking enhancements page
  - Build central page for all mood features
  - Add navigation between features
  - Implement responsive layout
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 7.1 Create MoodTrackingHub component
  - Build `MoodTrackingHub.jsx` page
  - Add feature cards for constellation, time capsule, gratitude jar
  - Integrate extended history dashboard
  - Implement navigation to detailed views
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ]* 8. Add error handling and loading states
  - Implement loading skeletons for all components
  - Add error boundaries
  - Handle API failures gracefully
  - _Requirements: 1.3, 2.1, 3.1, 4.1_

- [ ]* 9. Optimize performance
  - Cache constellation rendering
  - Lazy load unlocked time capsules
  - Paginate extended history for 365-day view
  - Optimize gratitude jar queries
  - _Requirements: 1.5, 2.1, 4.5_
