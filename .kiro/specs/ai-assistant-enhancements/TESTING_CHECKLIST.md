# Conversation Memory System - Testing Checklist

## Pre-Testing Setup

- [ ] Backend server running on `localhost:8000`
- [ ] Firebase configured and accessible
- [ ] User authenticated in the app
- [ ] Browser console open for debugging

## Frontend Tests

### Basic Functionality

- [ ] **Test 1: New Session Creation**
  - Open AI Assistant page
  - Check console for "🆕 Starting new conversation session"
  - Verify sessionId in sessionStorage
  - Confirm session indicator shows "New conversation"

- [ ] **Test 2: Send First Message**
  - Type and send a message
  - Verify message appears in UI
  - Check console for context persistence log
  - Confirm message count updates to "2 messages in this conversation"

- [ ] **Test 3: Multi-Turn Conversation**
  - Send 3-4 messages back and forth
  - Verify all messages display correctly
  - Check message count increases
  - Confirm AI responses are contextual

- [ ] **Test 4: Context Persistence**
  - Have a conversation with 5+ messages
  - Refresh the page (F5)
  - Verify all messages reload
  - Check console for "📚 Loaded conversation context"
  - Confirm message count is correct

- [ ] **Test 5: New Chat Button**
  - Click "New Chat" button
  - Verify messages clear
  - Check console for "🆕 Started new conversation"
  - Confirm new sessionId in sessionStorage
  - Send a message to verify fresh session works

### Edge Cases

- [ ] **Test 6: Long Conversation (10+ messages)**
  - Send 12+ messages
  - Verify only last 10 are kept in context
  - Check Firebase document has max 10 messages
  - Confirm older messages still visible in UI

- [ ] **Test 7: Page Refresh During Conversation**
  - Start conversation
  - Send 2 messages
  - Refresh page mid-conversation
  - Verify conversation continues seamlessly

- [ ] **Test 8: Multiple Browser Tabs**
  - Open AI Assistant in two tabs
  - Send message in Tab 1
  - Refresh Tab 2
  - Verify Tab 2 loads the message from Tab 1

- [ ] **Test 9: Session Expiry**
  - Close browser completely
  - Reopen and navigate to AI Assistant
  - Verify new session starts (sessionStorage cleared)

### Error Handling

- [ ] **Test 10: Backend Unavailable**
  - Stop backend server
  - Try sending a message
  - Verify fallback message appears
  - Check console for fallback logs

- [ ] **Test 11: Firebase Error**
  - Disconnect from internet briefly
  - Send a message
  - Verify message still appears in UI
  - Check console for persistence error (non-blocking)

- [ ] **Test 12: Invalid Session ID**
  - Manually set invalid sessionId in sessionStorage
  - Refresh page
  - Verify new session starts gracefully

## Backend Tests

### Endpoint Testing

- [ ] **Test 13: New Endpoint - First Message**
  ```bash
  curl -X POST http://localhost:8000/journal/assistant/reply-with-context \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "message": "Hello, I need someone to talk to",
      "sessionId": "session_test_001",
      "includeHistory": true
    }'
  ```
  - Verify response contains `reply`, `sessionId`, `messageId`
  - Check Firebase for new session document

- [ ] **Test 14: New Endpoint - With Context**
  ```bash
  # Send second message to same session
  curl -X POST http://localhost:8000/journal/assistant/reply-with-context \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "message": "I am feeling stressed about work",
      "sessionId": "session_test_001",
      "includeHistory": true
    }'
  ```
  - Verify AI response references previous message
  - Check Firebase document updated with both messages

- [ ] **Test 15: Context Retrieval**
  ```bash
  curl -X GET "http://localhost:8000/journal/assistant/context?sessionId=session_test_001" \
    -H "Authorization: Bearer $TOKEN"
  ```
  - Verify returns message array
  - Check messageCount is correct
  - Confirm sessionStarted timestamp present

- [ ] **Test 16: Without History Flag**
  ```bash
  curl -X POST http://localhost:8000/journal/assistant/reply-with-context \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "message": "Test message",
      "sessionId": "session_test_002",
      "includeHistory": false
    }'
  ```
  - Verify works without loading context
  - Confirm response is generic (no context)

### Firebase Verification

- [ ] **Test 17: Document Structure**
  - Open Firebase Console
  - Navigate to `users/{uid}/aiSessions`
  - Verify session documents exist
  - Check document structure matches spec:
    - sessionId
    - userId
    - messages array
    - messageCount
    - startedAt
    - updatedAt
    - lastMessage

- [ ] **Test 18: Message Limiting**
  - Create session with 15 messages
  - Check Firebase document
  - Verify only last 10 messages stored

- [ ] **Test 19: Timestamp Accuracy**
  - Send message
  - Check Firebase document
  - Verify timestamps are ISO format
  - Confirm updatedAt is recent

## Integration Tests

### Full Flow

- [ ] **Test 20: Complete User Journey**
  1. User opens AI Assistant
  2. Sends first message
  3. Receives contextual response
  4. Continues conversation (5+ messages)
  5. Refreshes page
  6. Conversation persists
  7. Clicks "New Chat"
  8. Starts fresh conversation
  9. Previous conversation saved in Firebase

- [ ] **Test 21: Context Quality**
  - Have conversation about specific topic (e.g., work stress)
  - After 3-4 messages, ask "What did I mention earlier?"
  - Verify AI references previous messages
  - Confirm context is being used effectively

- [ ] **Test 22: Cross-Session Isolation**
  - Start conversation in Session A
  - Click "New Chat" to start Session B
  - Verify Session B doesn't reference Session A
  - Check Firebase has separate documents

## Performance Tests

- [ ] **Test 23: Load Time**
  - Measure time to load existing conversation
  - Should be < 1 second for 10 messages
  - Check network tab for Firebase query time

- [ ] **Test 24: Persistence Speed**
  - Send message
  - Measure time until Firebase write completes
  - Should not block UI (async)
  - Verify message appears immediately

- [ ] **Test 25: Memory Usage**
  - Have long conversation (20+ messages)
  - Check browser memory usage
  - Verify no memory leaks
  - Confirm old messages are garbage collected

## UI/UX Tests

- [ ] **Test 26: Visual Indicators**
  - Verify "New Chat" button appears when messages exist
  - Check session indicator updates correctly
  - Confirm message count is accurate
  - Verify button hover states work

- [ ] **Test 27: Responsive Design**
  - Test on mobile viewport
  - Verify buttons don't overlap
  - Check session indicator is readable
  - Confirm messages display correctly

- [ ] **Test 28: Accessibility**
  - Tab through interface
  - Verify "New Chat" button is keyboard accessible
  - Check screen reader compatibility
  - Confirm focus states are visible

## Security Tests

- [ ] **Test 29: Authentication Required**
  - Try accessing without auth token
  - Verify 401 Unauthorized response
  - Confirm no data leakage

- [ ] **Test 30: User Isolation**
  - User A creates session
  - User B tries to access User A's session
  - Verify access denied
  - Check Firestore security rules

## Regression Tests

- [ ] **Test 31: Existing Features Still Work**
  - Voice input (microphone button)
  - Voice output (AI speaking)
  - Text streaming animation
  - Orb animation during speaking
  - Back button navigation

- [ ] **Test 32: Fallback to Old Endpoint**
  - Temporarily rename new endpoint
  - Send message
  - Verify falls back to old endpoint
  - Confirm conversation still works

## Test Results Template

```
Date: ___________
Tester: ___________
Environment: ___________

Passed: ___ / 32
Failed: ___ / 32

Failed Tests:
- Test #: _____ - Reason: _____________________
- Test #: _____ - Reason: _____________________

Notes:
_________________________________________________
_________________________________________________
```

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Smooth user experience
- ✅ Data persists correctly
- ✅ Context is used by AI
- ✅ No performance degradation
- ✅ Backward compatibility maintained

## Known Issues / Limitations

Document any issues found during testing:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

