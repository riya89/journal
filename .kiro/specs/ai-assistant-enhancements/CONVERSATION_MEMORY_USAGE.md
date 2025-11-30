# Conversation Memory System - Usage Guide

## Quick Start

The conversation memory system is now active in the AI Assistant. Here's how it works:

## For Users

### Starting a Conversation
1. Open the AI Assistant page
2. A new session is automatically created
3. Start chatting - your conversation is remembered!

### Continuing a Conversation
- Your conversation persists during your browser session
- Refresh the page - your messages are still there
- The AI remembers what you talked about

### Starting Fresh
- Click the "New Chat" button in the top-right corner
- This starts a completely new conversation
- Previous conversation is saved in Firebase

### Session Indicator
- Look for the message count at the top center
- Shows how many messages in current conversation
- Helps you track conversation length

## For Developers

### Using ConversationContext

```javascript
import ConversationContext from '../utils/conversationContext';

// Create a new context
const context = new ConversationContext(sessionId, userId);

// Add messages
context.addMessage('user', 'Hello!');
context.addMessage('assistant', 'Hi there!');

// Get formatted context for AI
const aiContext = context.getContextForAI();
// Returns: [{ role: 'user', content: 'Hello!' }, ...]

// Persist to Firebase
await context.persist();

// Load existing context
const loaded = await ConversationContext.load(userId, sessionId);
```

### API Integration

#### Send Message with Context
```javascript
const response = await apiPost(
  'http://localhost:8000/journal/assistant/reply-with-context',
  {
    message: userText,
    sessionId: sessionId,
    includeHistory: true
  }
);
```

#### Response Format
```json
{
  "reply": "AI response text",
  "sessionId": "session_1234567890_abc",
  "messageId": "msg_xyz789",
  "timestamp": "2025-11-30T10:30:00Z"
}
```

### Session Management

#### Generate Session ID
```javascript
const sessionId = ConversationContext.generateSessionId();
// Returns: "session_1733000000000_abc123"
```

#### Store in SessionStorage
```javascript
sessionStorage.setItem('aiSessionId', sessionId);
const storedId = sessionStorage.getItem('aiSessionId');
```

#### Clear Session
```javascript
sessionStorage.removeItem('aiSessionId');
```

## Configuration

### Message Limit
Default: 10 messages (last 5 exchanges)

To change:
```javascript
const context = new ConversationContext(sessionId, userId, 20); // 20 messages
```

### Context Window
The system keeps the last N messages to:
- Maintain relevant context
- Prevent token overflow
- Optimize AI response quality

## Firebase Structure

### Collection Path
```
users/{uid}/aiSessions/{sessionId}
```

### Document Structure
```javascript
{
  sessionId: "session_1733000000000_abc",
  userId: "user123",
  messages: [
    {
      role: "user",
      content: "I'm feeling stressed",
      timestamp: "2025-11-30T10:00:00Z"
    },
    {
      role: "assistant",
      content: "I hear you...",
      timestamp: "2025-11-30T10:00:05Z"
    }
  ],
  messageCount: 12,
  startedAt: Timestamp,
  updatedAt: Timestamp,
  lastMessage: "I hear you..."
}
```

## Best Practices

### 1. Always Check for User Auth
```javascript
if (!auth.currentUser) {
  console.error('User not authenticated');
  return;
}
```

### 2. Handle Loading States
```javascript
const [contextLoaded, setContextLoaded] = useState(false);

// Show loading indicator until context is loaded
if (!contextLoaded) {
  return <LoadingSpinner />;
}
```

### 3. Graceful Error Handling
```javascript
try {
  await context.persist();
} catch (error) {
  console.error('Failed to persist:', error);
  // Continue without persistence
}
```

### 4. Async Persistence
```javascript
// Don't wait for persistence
context.persist().catch(err => console.error(err));

// Continue with UI updates
setMessages([...messages, newMessage]);
```

## Troubleshooting

### Messages Not Persisting
1. Check Firebase authentication
2. Verify Firestore rules allow writes
3. Check browser console for errors
4. Ensure sessionId is valid

### Context Not Loading
1. Check sessionStorage for sessionId
2. Verify Firebase document exists
3. Check network tab for API calls
4. Ensure user is authenticated

### AI Not Using Context
1. Verify backend endpoint is `/reply-with-context`
2. Check `includeHistory: true` is set
3. Verify sessionId is being sent
4. Check backend logs for context loading

### Session Lost on Refresh
1. SessionStorage should persist during browser session
2. Check if sessionId is being stored correctly
3. Verify context loading logic runs on mount
4. Check for JavaScript errors on page load

## Performance Considerations

### Message Limiting
- Keeps only last 10 messages
- Prevents token overflow
- Maintains conversation quality

### Async Persistence
- Non-blocking Firebase writes
- Doesn't slow down UI
- Queued for background processing

### Context Loading
- Loads only once on mount
- Cached in component state
- No repeated Firebase reads

## Security

### Authentication
- All Firebase operations require auth
- Token verified on backend
- User can only access own sessions

### Data Privacy
- Sessions stored per user
- No cross-user access
- Firestore security rules enforced

## Future Enhancements

Potential improvements:
1. Session history list (view past conversations)
2. Search within conversations
3. Export conversation transcripts
4. Session expiration (auto-delete old sessions)
5. Conversation themes/tags
6. Multi-device sync

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase configuration
3. Test backend endpoints with curl
4. Review implementation summary document

