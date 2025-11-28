# Implementation Plan

- [ ] 1. Implement conversation memory system
  - Create session management logic
  - Build context assembly for AI requests
  - Implement message persistence to Firebase
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.1 Create conversation context manager
  - Build `ConversationContext` class for session management
  - Implement message storage with 10-message limit
  - Add context formatting for AI API
  - Create session persistence to Firebase
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.2 Enhance AI assistant API endpoint
  - Modify `/assistant/reply` to `/assistant/reply-with-context`
  - Add session ID parameter
  - Include conversation history in AI prompts
  - Return session ID with responses
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 1.3 Update ChatInterface component
  - Modify `ChatInterface.jsx` to manage session IDs
  - Store session ID in sessionStorage
  - Load recent context on component mount
  - Display conversation history in UI
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 2. Build conversation history feature
  - Create Firebase collection for AI sessions
  - Implement history retrieval API
  - Build history panel UI
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.1 Create AI sessions collection
  - Set up `aiSessions` subcollection under users
  - Store messages, themes, and metadata
  - Add indexes for efficient querying
  - _Requirements: 2.1_

- [ ] 2.2 Implement history API endpoints
  - Create `GET /assistant/history` endpoint for session list
  - Create `GET /assistant/history/:sessionId` endpoint for full conversation
  - Add pagination support for large history
  - Implement search functionality
  - _Requirements: 2.2, 2.3, 2.5_

- [ ] 2.3 Build HistoryPanel component
  - Create `HistoryPanel.jsx` with session list view
  - Implement session detail view
  - Add date filtering and search
  - Display conversation themes as tags
  - _Requirements: 2.2, 2.3, 2.5_

- [ ] 2.4 Add session archival logic
  - Archive conversations older than 90 days
  - Keep archived sessions accessible
  - Implement archive retrieval
  - _Requirements: 2.4_

- [ ] 3. Implement personalized affirmations
  - Build affirmation generation with mood analysis
  - Create affirmation caching system
  - Integrate with existing affirmation endpoint
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.1 Enhance affirmation generation logic
  - Modify `/affirmation/daily` to `/affirmation/personalized`
  - Fetch user's recent mood data from Raindrop
  - Fetch recent journal entries for theme analysis
  - Build context for AI based on mood and themes
  - _Requirements: 3.1, 3.2_

- [ ] 3.2 Implement mood-based affirmation prompts
  - Create different AI prompts for low mood (supportive)
  - Create different AI prompts for positive mood (celebratory)
  - Create different AI prompts for mixed mood (balanced)
  - Adjust tone based on mood trends
  - _Requirements: 3.3, 3.4_

- [ ] 3.3 Add affirmation variety tracking
  - Store generated affirmations with dates
  - Check for duplicates within 14-day window
  - Regenerate if affirmation is too similar to recent ones
  - _Requirements: 3.5_

- [ ] 3.4 Update AffirmationCard component
  - Modify `AffirmationCard.jsx` to show personalized affirmations
  - Display context hint (based on mood trend)
  - Add refresh button for new affirmation
  - _Requirements: 3.1, 3.2_

- [ ] 4. Build follow-up suggestion system
  - Implement suggestion generation logic
  - Create suggestion UI component
  - Integrate with chat interface
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.1 Add follow-up generation to AI responses
  - Modify AI response endpoint to generate 2-3 follow-up prompts
  - Base suggestions on conversation context
  - Use different prompt types based on detected themes
  - _Requirements: 4.1, 4.2_

- [ ] 4.2 Implement theme-based suggestion logic
  - Detect stress/anxiety themes → suggest coping questions
  - Detect achievement themes → suggest reflection questions
  - Detect relationship themes → suggest exploration questions
  - _Requirements: 4.3, 4.4_

- [ ] 4.3 Build FollowUpSuggestions component
  - Create `FollowUpSuggestions.jsx` with chip-style buttons
  - Display suggestions below AI response
  - Handle suggestion selection to send as message
  - _Requirements: 4.5_

- [ ] 5. Implement pattern recognition across conversations
  - Build theme analysis logic
  - Create pattern detection system
  - Integrate insights into AI responses
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5.1 Build theme extraction logic
  - Analyze conversation history for recurring themes
  - Use AI to identify patterns (stress, work, relationships, etc.)
  - Store theme frequency in user profile
  - _Requirements: 5.1_

- [ ] 5.2 Implement pattern detection
  - Detect when same challenge discussed across multiple sessions
  - Track theme frequency over time
  - Identify improvement or decline in specific areas
  - _Requirements: 5.2, 5.3_

- [ ] 5.3 Enhance AI context with patterns
  - Include recurring themes in AI system prompt
  - Reference previous discussions when relevant
  - Compare current state with historical patterns
  - _Requirements: 5.3, 5.4_

- [ ] 5.4 Add privacy safeguards
  - Ensure sensitive details not exposed unnecessarily
  - Allow users to delete conversation history
  - Implement data retention policies
  - _Requirements: 5.5_

- [ ] 6. Build smart task suggestion system
  - Implement journal content analysis
  - Create task suggestion generation
  - Build task suggestion modal
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6.1 Create journal analysis endpoint
  - Create `POST /journal/analyze-for-tasks` endpoint
  - Use Gemini AI to analyze journal content
  - Detect themes (stress, goals, challenges)
  - Generate 2-3 relevant task suggestions
  - _Requirements: 6.1, 6.2_

- [ ] 6.2 Implement theme-based task mapping
  - Map stress themes → self-care tasks
  - Map goal themes → action tasks
  - Map challenge themes → problem-solving tasks
  - Include time estimates and reasons
  - _Requirements: 6.2, 6.3, 6.4_

- [ ] 6.3 Build TaskSuggestionModal component
  - Create `TaskSuggestionModal.jsx` with task cards
  - Allow multi-select of suggested tasks
  - Show task details (category, time, reason)
  - Implement "Add to Planner" functionality
  - _Requirements: 6.5_

- [ ] 6.4 Integrate task suggestions into journal save flow
  - Trigger analysis after journal entry saved
  - Show suggestion modal if relevant tasks found
  - Allow user to skip or add tasks to tomorrow's planner
  - _Requirements: 6.1, 6.5_

- [ ] 7. Add AI assistant enhancements to UI
  - Update AI Assistant page with new features
  - Add history access button
  - Integrate follow-up suggestions
  - _Requirements: 1.5, 2.2, 4.5_

- [ ] 7.1 Update AIAssistant page
  - Add history panel toggle button
  - Integrate FollowUpSuggestions component
  - Add session indicator in header
  - Improve overall layout and UX
  - _Requirements: 1.5, 2.2, 4.5_

- [ ]* 8. Add error handling and fallbacks
  - Implement fallback messages for AI failures
  - Add retry logic for failed requests
  - Handle context loading errors gracefully
  - _Requirements: 1.1, 3.1, 4.1_

- [ ]* 9. Add performance optimizations
  - Cache affirmations for 24 hours
  - Limit context to last 10 messages
  - Debounce follow-up generation
  - Lazy load conversation history
  - _Requirements: 1.3, 2.3, 3.5_
