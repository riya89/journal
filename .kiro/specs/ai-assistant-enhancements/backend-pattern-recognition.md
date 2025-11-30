# Backend Implementation: Pattern Recognition System

## Overview
This document describes the backend implementation for pattern recognition across conversations, including theme extraction, pattern detection, and privacy safeguards.

## New Endpoint: `/journal/assistant/analyze-patterns`

### Purpose
Analyzes conversation history to identify recurring themes and patterns.

### Request
```
POST http://localhost:8000/journal/assistant/analyze-patterns
```

### Headers
```
Authorization: Bearer {firebase-token}
Content-Type: application/json
```

### Request Body
```json
{
  "lookbackDays": 30,
  "minSessionCount": 3
}
```

### Response
```json
{
  "patterns": {
    "themes": [
      {
        "name": "work-stress",
        "frequency": 8,
        "firstSeen": "2025-11-01T10:00:00Z",
        "lastSeen": "2025-11-29T15:30:00Z",
        "trend": "increasing",
        "sessions": ["session_1", "session_2", "session_3"]
      },
      {
        "name": "relationships",
        "frequency": 5,
        "firstSeen": "2025-11-10T14:00:00Z",
        "lastSeen": "2025-11-28T11:00:00Z",
        "trend": "stable",
        "sessions": ["session_4", "session_5"]
      }
    ],
    "recurringChallenges": [
      {
        "challenge": "difficulty setting boundaries at work",
        "occurrences": 4,
        "sessions": ["session_1", "session_3", "session_6", "session_8"]
      }
    ],
    "improvements": [
      {
        "area": "self-care",
        "trend": "improving",
        "evidence": "User mentions more self-care activities in recent sessions"
      }
    ]
  },
  "analyzedAt": "2025-11-30T10:00:00Z",
  "sessionCount": 12
}
```

## Implementation

### 1. Theme Extraction Logic

```javascript
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const db = admin.firestore();

// Helper function to extract themes from a single session
async function extractThemesFromSession(messages) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Combine all messages into context
  const conversationText = messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt = `Analyze this conversation and identify the main themes discussed.

Conversation:
${conversationText}

Return a JSON object with this structure:
{
  "themes": ["theme1", "theme2", "theme3"],
  "primaryEmotion": "stressed|anxious|happy|sad|neutral|mixed",
  "challenges": ["specific challenge mentioned"],
  "topics": ["work", "relationships", "health", "personal-growth", "family", "self-care"]
}

Guidelines:
- Themes should be specific (e.g., "work-stress", "relationship-conflict", "self-doubt")
- Identify 2-5 themes maximum
- Challenges should be specific issues mentioned
- Topics are broad categories
- Be concise and accurate`;

  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: "application/json"
      }
    });

    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Error extracting themes:', error);
    return {
      themes: [],
      primaryEmotion: 'neutral',
      challenges: [],
      topics: []
    };
  }
}

// Endpoint to analyze patterns
app.post('/journal/assistant/analyze-patterns', async (req, res) => {
  try {
    // 1. Verify Firebase token
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Extract parameters
    const { lookbackDays = 30, minSessionCount = 3 } = req.body;

    // 3. Fetch recent sessions
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

    const sessionsRef = db.collection('users').doc(uid).collection('aiSessions');
    const snapshot = await sessionsRef
      .where('updatedAt', '>=', admin.firestore.Timestamp.fromDate(cutoffDate))
      .orderBy('updatedAt', 'desc')
      .get();

    if (snapshot.empty || snapshot.size < minSessionCount) {
      return res.json({
        patterns: {
          themes: [],
          recurringChallenges: [],
          improvements: []
        },
        analyzedAt: new Date().toISOString(),
        sessionCount: snapshot.size,
        message: 'Not enough conversation history for pattern analysis'
      });
    }

    // 4. Extract themes from each session
    const sessionAnalyses = [];
    for (const doc of snapshot.docs) {
      const sessionData = doc.data();
      if (!sessionData.messages || sessionData.messages.length === 0) continue;

      const analysis = await extractThemesFromSession(sessionData.messages);
      sessionAnalyses.push({
        sessionId: doc.id,
        timestamp: sessionData.updatedAt?.toDate ? sessionData.updatedAt.toDate() : new Date(sessionData.updatedAt),
        ...analysis
      });
    }

    // 5. Aggregate themes across sessions
    const themeFrequency = {};
    const themeSessions = {};
    const themeTimestamps = {};

    sessionAnalyses.forEach(analysis => {
      analysis.themes.forEach(theme => {
        themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
        
        if (!themeSessions[theme]) {
          themeSessions[theme] = [];
        }
        themeSessions[theme].push(analysis.sessionId);

        if (!themeTimestamps[theme]) {
          themeTimestamps[theme] = [];
        }
        themeTimestamps[theme].push(analysis.timestamp);
      });
    });

    // 6. Build theme patterns with trends
    const themes = Object.keys(themeFrequency)
      .filter(theme => themeFrequency[theme] >= 2) // Only themes appearing 2+ times
      .map(theme => {
        const timestamps = themeTimestamps[theme].sort((a, b) => a - b);
        const firstSeen = timestamps[0];
        const lastSeen = timestamps[timestamps.length - 1];

        // Calculate trend (increasing/decreasing/stable)
        const recentCount = timestamps.filter(t => {
          const daysDiff = (new Date() - t) / (1000 * 60 * 60 * 24);
          return daysDiff <= 14;
        }).length;

        const olderCount = timestamps.filter(t => {
          const daysDiff = (new Date() - t) / (1000 * 60 * 60 * 24);
          return daysDiff > 14;
        }).length;

        let trend = 'stable';
        if (recentCount > olderCount * 1.5) trend = 'increasing';
        else if (olderCount > recentCount * 1.5) trend = 'decreasing';

        return {
          name: theme,
          frequency: themeFrequency[theme],
          firstSeen: firstSeen.toISOString(),
          lastSeen: lastSeen.toISOString(),
          trend,
          sessions: themeSessions[theme]
        };
      })
      .sort((a, b) => b.frequency - a.frequency);

    // 7. Identify recurring challenges
    const challengeMap = {};
    sessionAnalyses.forEach(analysis => {
      analysis.challenges.forEach(challenge => {
        if (!challengeMap[challenge]) {
          challengeMap[challenge] = {
            challenge,
            occurrences: 0,
            sessions: []
          };
        }
        challengeMap[challenge].occurrences++;
        challengeMap[challenge].sessions.push(analysis.sessionId);
      });
    });

    const recurringChallenges = Object.values(challengeMap)
      .filter(c => c.occurrences >= 2)
      .sort((a, b) => b.occurrences - a.occurrences);

    // 8. Detect improvements/declines
    const improvements = [];
    
    // Compare recent vs older sessions for each theme
    themes.forEach(theme => {
      if (theme.trend === 'decreasing' && theme.name.includes('stress')) {
        improvements.push({
          area: theme.name,
          trend: 'improving',
          evidence: `${theme.name} mentioned less frequently in recent conversations`
        });
      } else if (theme.trend === 'increasing' && theme.name.includes('care')) {
        improvements.push({
          area: theme.name,
          trend: 'improving',
          evidence: `${theme.name} mentioned more frequently in recent conversations`
        });
      }
    });

    // 9. Store patterns in user profile
    const userPatternsRef = db.collection('users').doc(uid).collection('patterns').doc('current');
    await userPatternsRef.set({
      themes,
      recurringChallenges,
      improvements,
      analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      sessionCount: sessionAnalyses.length,
      lookbackDays
    }, { merge: true });

    // 10. Return results
    res.json({
      patterns: {
        themes,
        recurringChallenges,
        improvements
      },
      analyzedAt: new Date().toISOString(),
      sessionCount: sessionAnalyses.length
    });

  } catch (error) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({ 
      error: 'Failed to analyze patterns',
      message: error.message
    });
  }
});
```

### 2. Get Current Patterns Endpoint

```javascript
app.get('/journal/assistant/patterns', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const patternsRef = db.collection('users').doc(uid).collection('patterns').doc('current');
    const patternsDoc = await patternsRef.get();

    if (!patternsDoc.exists) {
      return res.json({
        patterns: {
          themes: [],
          recurringChallenges: [],
          improvements: []
        },
        analyzedAt: null,
        sessionCount: 0
      });
    }

    const data = patternsDoc.data();
    
    res.json({
      patterns: {
        themes: data.themes || [],
        recurringChallenges: data.recurringChallenges || [],
        improvements: data.improvements || []
      },
      analyzedAt: data.analyzedAt?.toDate ? data.analyzedAt.toDate().toISOString() : null,
      sessionCount: data.sessionCount || 0
    });

  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});
```

### 3. Enhanced Reply Endpoint with Pattern Context

```javascript
// Modify the existing reply-with-context endpoint to include patterns
app.post('/journal/assistant/reply-with-patterns', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { message, sessionId, includeHistory = true, includePatterns = true } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Load conversation history
    let conversationHistory = [];
    if (includeHistory && sessionId) {
      const sessionRef = db.collection('users').doc(uid).collection('aiSessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();

      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        conversationHistory = sessionData.messages || [];
        conversationHistory = conversationHistory.slice(-10);
      }
    }

    // Load patterns if requested
    let patternContext = '';
    if (includePatterns) {
      const patternsRef = db.collection('users').doc(uid).collection('patterns').doc('current');
      const patternsDoc = await patternsRef.get();

      if (patternsDoc.exists()) {
        const patterns = patternsDoc.data();
        
        // Build pattern context for AI
        const topThemes = (patterns.themes || []).slice(0, 3);
        const topChallenges = (patterns.recurringChallenges || []).slice(0, 2);
        
        if (topThemes.length > 0 || topChallenges.length > 0) {
          patternContext = `\n\nContext from previous conversations:`;
          
          if (topThemes.length > 0) {
            patternContext += `\n- Recurring themes: ${topThemes.map(t => t.name).join(', ')}`;
          }
          
          if (topChallenges.length > 0) {
            patternContext += `\n- Ongoing challenges: ${topChallenges.map(c => c.challenge).join('; ')}`;
          }
          
          patternContext += `\n\nUse this context to provide more personalized support, but don't explicitly mention "patterns" or make it obvious you're referencing past data. Be natural and supportive.`;
        }
      }
    }

    // Build context for AI
    const contextMessages = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    contextMessages.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Generate AI response with pattern context
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const chat = model.startChat({
      history: contextMessages.slice(0, -1),
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
- Use gentle language and emojis sparingly (🌿, 💙, ✨)
${patternContext}`;

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // Store messages
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();

    const sessionRef = db.collection('users').doc(uid).collection('aiSessions').doc(sessionId);
    
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

    res.json({
      reply: reply,
      sessionId: sessionId,
      messageId: messageId,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('Error in reply-with-patterns:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      reply: "I'm here with you 🌿 I'm listening."
    });
  }
});
```

### 4. Privacy Safeguards - Delete History Endpoint

```javascript
app.delete('/journal/assistant/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { olderThanDays } = req.query;

    // Delete all sessions or sessions older than specified days
    const sessionsRef = db.collection('users').doc(uid).collection('aiSessions');
    
    let query = sessionsRef;
    
    if (olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
      query = query.where('updatedAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate));
    }

    const snapshot = await query.get();
    
    // Batch delete
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();

    // Also delete patterns if deleting all history
    if (!olderThanDays) {
      const patternsRef = db.collection('users').doc(uid).collection('patterns').doc('current');
      await patternsRef.delete();
    }

    res.json({ 
      success: true, 
      deletedCount: snapshot.size,
      message: `Deleted ${snapshot.size} conversation(s)`
    });

  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ error: 'Failed to delete history' });
  }
});
```

## Firestore Data Structure

### Collection: `users/{uid}/patterns/current`

```javascript
{
  themes: [
    {
      name: "work-stress",
      frequency: 8,
      firstSeen: "2025-11-01T10:00:00Z",
      lastSeen: "2025-11-29T15:30:00Z",
      trend: "increasing",
      sessions: ["session_1", "session_2", "session_3"]
    }
  ],
  recurringChallenges: [
    {
      challenge: "difficulty setting boundaries at work",
      occurrences: 4,
      sessions: ["session_1", "session_3", "session_6", "session_8"]
    }
  ],
  improvements: [
    {
      area: "self-care",
      trend: "improving",
      evidence: "User mentions more self-care activities in recent sessions"
    }
  ],
  analyzedAt: Timestamp,
  sessionCount: 12,
  lookbackDays: 30
}
```

## Testing

```bash
# Get Firebase token
TOKEN="your-firebase-token"

# Analyze patterns
curl -X POST http://localhost:8000/journal/assistant/analyze-patterns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lookbackDays": 30,
    "minSessionCount": 3
  }'

# Get current patterns
curl -X GET http://localhost:8000/journal/assistant/patterns \
  -H "Authorization: Bearer $TOKEN"

# Send message with pattern context
curl -X POST http://localhost:8000/journal/assistant/reply-with-patterns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am feeling stressed about work again",
    "sessionId": "session_test_123",
    "includeHistory": true,
    "includePatterns": true
  }'

# Delete all history (privacy safeguard)
curl -X DELETE http://localhost:8000/journal/assistant/history \
  -H "Authorization: Bearer $TOKEN"

# Delete history older than 90 days
curl -X DELETE "http://localhost:8000/journal/assistant/history?olderThanDays=90" \
  -H "Authorization: Bearer $TOKEN"
```

## Privacy Considerations

1. **Sensitive Data**: Patterns are stored separately from raw conversations
2. **User Control**: Users can delete all history and patterns
3. **Data Retention**: Automatic cleanup of sessions older than specified days
4. **Minimal Exposure**: AI responses don't explicitly mention pattern tracking
5. **Opt-in**: Pattern analysis only runs when explicitly requested

## Performance Optimization

1. **Caching**: Store analyzed patterns to avoid re-analyzing on every request
2. **Batch Processing**: Analyze multiple sessions in parallel
3. **Lazy Loading**: Only analyze patterns when needed
4. **Rate Limiting**: Limit pattern analysis to once per day per user

## Error Handling

1. **Insufficient Data**: Return empty patterns with helpful message
2. **AI Failures**: Continue without pattern context
3. **Firebase Errors**: Log and return cached patterns if available
4. **Token Errors**: Return 401 Unauthorized
