# Backend Implementation: Conversation Memory API

## Overview
This document describes the backend API endpoints needed for the AI Assistant conversation memory feature.

## New Endpoint: `/journal/assistant/reply-with-context`

### Purpose
Enhanced version of `/journal/assistant/reply` that includes conversation history context.

### Request
```
POST http://localhost:8000/journal/assistant/reply-with-context
```

### Headers
```
Authorization: Bearer {firebase-token}
Content-Type: application/json
```

### Request Body
```json
{
  "message": "I'm feeling overwhelmed with work",
  "sessionId": "session_1234567890_abc123",
  "includeHistory": true
}
```

### Response
```json
{
  "reply": "I hear you... that sounds really heavy. What aspect of work feels most overwhelming right now?",
  "sessionId": "session_1234567890_abc123",
  "messageId": "msg_xyz789",
  "timestamp": "2025-11-30T10:30:00Z"
}
```

## Implementation Guide

### 1. Dependencies
```javascript
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const db = admin.firestore();
```

### 2. Endpoint Handler

```javascript
app.post('/journal/assistant/reply-with-context', async (req, res) => {
  try {
    // 1. Verify Firebase token
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Extract request data
    const { message, sessionId, includeHistory = true } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 3. Load conversation history if requested
    let conversationHistory = [];
    if (includeHistory && sessionId) {
      const sessionRef = db.collection('users').doc(uid).collection('aiSessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();

      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        conversationHistory = sessionData.messages || [];
        
        // Keep only last 10 messages for context
        conversationHistory = conversationHistory.slice(-10);
      }
    }

    // 4. Build context for AI
    const contextMessages = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add current user message
    contextMessages.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // 5. Generate AI response with context
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const chat = model.startChat({
      history: contextMessages.slice(0, -1), // All except current message
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 500,
      },
    });

    const systemPrompt = `You are Michelle, a gentle, compassionate AI companion for a journaling app called Raindrop. 
Your role is to provide emotional support, active listening, and gentle guidance.

Guidelines:
- Be warm, empathetic, and validating
- Use a conversational, supportive tone
- Ask thoughtful follow-up questions
- Reference previous parts of the conversation when relevant
- Keep responses concise (2-3 sentences)
- Focus on emotional support, not problem-solving
- Use gentle language and emojis sparingly (🌿, 💙, ✨)`;

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // 6. Store messages in Firebase (async, don't wait)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Update session in background
    const sessionRef = db.collection('users').doc(uid).collection('aiSessions').doc(sessionId);
    
    // Add both user message and AI response
    const updatedMessages = [
      ...conversationHistory,
      {
        role: 'user',
        content: message,
        timestamp: timestamp
      },
      {
        role: 'assistant',
        content: reply,
        timestamp: timestamp,
        messageId: messageId
      }
    ];

    // Keep only last 10 messages
    const messagesToStore = updatedMessages.slice(-10);

    sessionRef.set({
      sessionId: sessionId,
      userId: uid,
      messages: messagesToStore,
      messageCount: messagesToStore.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: reply.substring(0, 100)
    }, { merge: true }).catch(err => {
      console.error('Error storing session:', err);
    });

    // 7. Return response
    res.json({
      reply: reply,
      sessionId: sessionId,
      messageId: messageId,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('Error in reply-with-context:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      reply: "I'm here with you 🌿 I'm listening."
    });
  }
});
```

### 3. Helper Endpoint: Get Session Context

```javascript
app.get('/journal/assistant/context', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const sessionRef = db.collection('users').doc(uid).collection('aiSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists()) {
      return res.json({
        messages: [],
        messageCount: 0,
        sessionStarted: null
      });
    }

    const sessionData = sessionDoc.data();

    res.json({
      messages: sessionData.messages || [],
      messageCount: sessionData.messageCount || 0,
      sessionStarted: sessionData.startedAt || sessionData.updatedAt
    });

  } catch (error) {
    console.error('Error fetching context:', error);
    res.status(500).json({ error: 'Failed to fetch context' });
  }
});
```

## Firestore Data Structure

### Collection: `users/{uid}/aiSessions/{sessionId}`

```javascript
{
  sessionId: "session_1234567890_abc123",
  userId: "user123",
  messages: [
    {
      role: "user",
      content: "I'm feeling overwhelmed",
      timestamp: "2025-11-30T10:00:00Z"
    },
    {
      role: "assistant",
      content: "I hear you... that sounds really heavy.",
      timestamp: "2025-11-30T10:00:05Z",
      messageId: "msg_xyz789"
    }
  ],
  messageCount: 12,
  startedAt: Timestamp,
  updatedAt: Timestamp,
  lastMessage: "I hear you... that sounds really heavy."
}
```

## Testing

### Test with curl
```bash
# Get Firebase token first
TOKEN="your-firebase-token"

# Send message with context
curl -X POST http://localhost:8000/journal/assistant/reply-with-context \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I had a stressful day at work",
    "sessionId": "session_test_123",
    "includeHistory": true
  }'

# Get session context
curl -X GET "http://localhost:8000/journal/assistant/context?sessionId=session_test_123" \
  -H "Authorization: Bearer $TOKEN"
```

## Migration Notes

### Backward Compatibility
- Keep existing `/journal/assistant/reply` endpoint for backward compatibility
- Frontend can gradually migrate to new endpoint
- Old endpoint can internally call new endpoint with `includeHistory: false`

### Environment Variables
```
GEMINI_API_KEY=your-gemini-api-key
```

## Error Handling

1. **Invalid Session ID**: Return empty context, start fresh
2. **Firebase Error**: Log error, continue with empty context
3. **AI Generation Error**: Return fallback message
4. **Token Verification Error**: Return 401 Unauthorized

## Performance Considerations

1. **Message Limit**: Store only last 10 messages per session
2. **Async Storage**: Don't wait for Firebase write before responding
3. **Context Size**: Limit context to prevent token overflow
4. **Caching**: Consider caching recent sessions in memory

## Security

1. **Authentication**: Always verify Firebase token
2. **Authorization**: Ensure user can only access their own sessions
3. **Input Validation**: Sanitize message content
4. **Rate Limiting**: Consider adding rate limits per user

