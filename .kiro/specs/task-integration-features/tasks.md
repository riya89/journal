# Implementation Plan

- [x] 1. Implement post-journal task check system
  - Create task check API endpoint
  - Build post-journal check modal
  - Integrate with journal save flow
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Create post-save check endpoint
  - Create `GET /journal/post-save-check` endpoint
  - Fetch today's tasks from planner
  - Return task list with completion status
  - Calculate completion statistics
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Build quick complete endpoint
  - Create `POST /journal/quick-complete-tasks` endpoint
  - Accept array of task IDs to mark complete
  - Update planner completion data
  - Return success status and completion count
  - _Requirements: 1.4_

- [x] 1.3 Build PostJournalCheckModal component
  - Create `PostJournalCheckModal.jsx` with task list
  - Add checkboxes for each task
  - Implement task selection/deselection
  - Add "Mark all done" quick action
  - Add "Review tasks" navigation button
  - _Requirements: 1.2, 1.5_

- [x] 1.4 Integrate modal into journal save flow
  - Trigger modal after successful journal save
  - Skip modal if no tasks exist for the day
  - Skip modal if all tasks already completed
  - Handle modal dismiss and save actions
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.5 Connect to celebration system
  - Check if all tasks completed after modal save
  - Trigger celebration modal if all tasks done
  - Award appropriate badges/XP
  - _Requirements: 1.3_

- [-] 2. Build weekly progress summary
  - Implement summary calculation logic
  - Create summary API endpoint
  - Build summary UI component
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2.1 Create weekly summary endpoint
  - Create `GET /journal/summary/weekly` endpoint
  - Fetch journal entries for last 7 days
  - Fetch planner data for last 7 days
  - Calculate all statistics (entries, tasks, mood, words)
  - _Requirements: 3.1, 3.2_

- [ ] 2.2 Implement summary calculation logic
  - Calculate entries written and missed days
  - Calculate tasks completed vs planned
  - Calculate average mood and mood trend
  - Count perfect days (all tasks completed)
  - Calculate total words written
  - _Requirements: 3.2_

- [ ] 2.3 Generate summary highlights
  - Create highlight for mood improvement
  - Create highlight for task completion rate
  - Create highlight for journaling consistency
  - Use encouraging language
  - _Requirements: 3.2_

- [ ] 2.4 Identify best day and generate insights
  - Find day with highest mood + all tasks complete
  - Analyze mood trend for improvement message
  - Generate actionable suggestion based on patterns
  - _Requirements: 3.3, 3.5_

- [ ] 2.5 Build WeeklySummary component
  - Create `WeeklySummary.jsx` with stats grid
  - Display stat cards for key metrics
  - Show highlights section
  - Display best day card
  - Add insights and suggestions section
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2.6 Add category breakdown visualization
  - Show tasks completed by category
  - Display progress bars for each category
  - Calculate completion percentage per category
  - _Requirements: 3.2_

- [ ] 3. Implement mood-task correlation analysis
  - Build correlation calculation logic
  - Create correlation API endpoint
  - Build correlation visualization
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3.1 Create correlation analysis endpoint
  - Create `GET /journal/correlation/mood-tasks` endpoint
  - Fetch mood and task data for specified period (default 30 days)
  - Calculate correlation for each task category
  - Compare mood on days with vs without each category
  - _Requirements: 4.1_

- [ ] 3.2 Implement correlation calculation
  - Calculate average mood on days with specific task categories
  - Calculate average mood on days without those categories
  - Determine correlation strength (high/medium/low impact)
  - Calculate sample size for statistical validity
  - _Requirements: 4.1, 4.2_

- [ ] 3.3 Generate correlation insights
  - Identify highest impact categories
  - Create insight messages about correlations
  - Suggest prioritizing high-impact categories
  - _Requirements: 4.3, 4.4_

- [ ] 3.4 Build CorrelationChart component
  - Create `CorrelationChart.jsx` with comparison bars
  - Display mood with vs without tasks for each category
  - Show impact badges (high/medium/low)
  - Add insights section
  - Display sample size for transparency
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Build daily status widget
  - Create daily status endpoint
  - Build status widget component
  - Integrate into dashboard
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4.1 Create daily status endpoint
  - Create `GET /journal/planner/daily-status` endpoint
  - Fetch today's tasks and completions
  - Calculate completion percentage
  - Check for streak days
  - Determine if all tasks complete
  - _Requirements: 5.1, 5.2_

- [ ] 4.2 Build DailyStatusWidget component
  - Create `DailyStatusWidget.jsx` with circular progress
  - Display completion percentage
  - Show tasks completed vs planned
  - Display streak count if active
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 4.3 Add celebration banner
  - Show celebration message when all tasks complete
  - Display encouraging message when in progress
  - Use positive, non-pressuring language
  - _Requirements: 5.2, 5.5_

- [ ] 4.4 Implement auto-refresh
  - Refresh status every 5 minutes
  - Update when tasks are completed
  - Handle real-time updates
  - _Requirements: 5.1_

- [ ] 5. Enhance smart task suggestions (from AI assistant spec)
  - Integrate journal analysis for task suggestions
  - Build task suggestion modal
  - Connect to planner for adding tasks
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5.1 Implement time-aware suggestions
  - Check current time of day when generating suggestions
  - Prioritize relaxation tasks in evening
  - Prioritize energizing tasks in morning
  - Adjust task difficulty based on time
  - _Requirements: 6.1, 6.2_

- [ ] 5.2 Build energy level detection
  - Analyze journal content for energy indicators
  - Detect fatigue or high energy mentions
  - Adjust task suggestions accordingly
  - _Requirements: 6.4_

- [ ] 5.3 Implement learning from user patterns
  - Track which task types user completes at which times
  - Store completion patterns in user profile
  - Adapt suggestions based on historical patterns
  - _Requirements: 6.5_

- [ ] 5.4 Enhance TaskSuggestionModal
  - Add time-of-day indicator
  - Show energy level consideration
  - Display why each task is suggested at this time
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 6. Create task integration dashboard
  - Build central page for task integration features
  - Add navigation to all features
  - Implement responsive layout
  - _Requirements: 1.1, 3.1, 4.1, 5.1_

- [ ] 6.1 Create TaskIntegrationHub component
  - Build `TaskIntegrationHub.jsx` page
  - Integrate DailyStatusWidget
  - Add links to weekly summary
  - Add links to correlation analysis
  - Display recent task suggestions
  - _Requirements: 1.1, 3.1, 4.1, 5.1_

- [ ] 7. Add task integration to existing pages
  - Integrate daily status into main dashboard
  - Add weekly summary to planner page
  - Add correlation chart to mood dashboard
  - _Requirements: 3.1, 4.1, 5.1_

- [ ] 7.1 Update main dashboard
  - Add DailyStatusWidget to dashboard
  - Position prominently for visibility
  - Ensure responsive design
  - _Requirements: 4.1_

- [ ] 7.2 Update planner page
  - Add "View Weekly Summary" button
  - Show summary in modal or dedicated section
  - _Requirements: 3.1_

- [ ] 7.3 Update mood dashboard
  - Add "Task Impact" section
  - Integrate CorrelationChart
  - _Requirements: 4.1_

- [ ]* 8. Add error handling and loading states
  - Implement loading skeletons for all components
  - Handle API failures gracefully
  - Add retry logic for failed requests
  - _Requirements: 1.1, 3.1, 4.1_

- [ ]* 9. Optimize performance
  - Cache weekly summaries for 24 hours
  - Debounce daily status updates
  - Lazy load correlation charts
  - Optimize task queries with indexes
  - _Requirements: 3.1, 4.1, 5.1_

- [ ]* 10. Add analytics tracking
  - Track post-journal check usage
  - Track weekly summary views
  - Track correlation chart interactions
  - Monitor task suggestion acceptance rate
  - _Requirements: 1.1, 3.1, 4.1, 5.1_
