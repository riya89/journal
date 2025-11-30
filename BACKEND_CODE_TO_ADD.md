# Exact Backend Code to Add

## Instructions

Open your `backend/routes/journal.js` file and add these endpoints **after** your existing AI assistant endpoints (around line 450, after the `/assistant/speak-edge` endpoint).

---

## 1. Conversation Memory Endpoint (CRITICAL)

Add this right after your existing `/assistant/reply` endpoint:

```javascript
// -----------------------------------------
// 🤖 AI ASSISTANT — Conversation Memory
// -----------------------------------------
router.post("/assistant/reply-with-context", verifyToken, async (req, res) => {
  const { message, sessionId, includeHistory } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "I'm here, tell me what's on your mind 🌿" });
  }

  try {
    let context = [];
    
    // Load conversation history if requested
    if (includeHistory && sessionId) {
      const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
      const sessionDoc = await sessionRef.get();
      
      if (sessionDoc.exists) {
        const sessionData = sessionDoc.data();
        context = sessionData.messages?.slice(-10) || []; // Last 10 messages
      }
    }

    // Add current message to context
    context.push({ role: "user", content: message, timestamp: new Date().toISOString() });

    // Build prompt with context
    let contextPrompt = `You are a soft-spoken, gentle emotional companion.
Respond in under 2 sentences.
Tone: calming, validating, grounding.

`;

    // Add conversation history to prompt
    if (context.length > 1) {
      contextPrompt += "Previous conversation:\n";
      context.slice(0, -1).forEach(msg => {
        contextPrompt += `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}\n`;
      });
      contextPrompt += "\n";
    }

    contextPrompt += `User said: "${message}"

Reply like:
- "I'm here with you…"
- "That sounds heavy…"
- "You're doing the best you can."

Avoid:
- Questions unless needed
- Long paragraphs
- Overly formal tone`;

    // Call Gemini AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: contextPrompt }]
          }]
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here with you. Tell me more 🌿";

    // Save to session (async, don't wait)
    context.push({ role: "assistant", content: reply, timestamp: new Date().toISOString() });
    
    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    sessionRef.set({
      sessionId,
      messages: context.slice(-10), // Keep only last 10
      updatedAt: new Date(),
      lastMessage: reply.substring(0, 100)
    }, { merge: true }).catch(err => {
      console.error('Error saving session:', err);
    });

    res.json({
      reply,
      sessionId,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("AI Assistant Error:", err);
    res.json({ reply: "I'm here for you… even if my mind is a little foggy right now 🌫️" });
  }
});
```

---

## 2. Conversation History Endpoints (CRITICAL)

Add these after the conversation memory endpoint:

```javascript
// -----------------------------------------
// 📚 CONVERSATION HISTORY
// -----------------------------------------

// Get list of conversation sessions
router.get("/assistant/history", verifyToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0, search = '' } = req.query;
    const sessionsRef = db.collection("users").doc(req.uid).collection("aiSessions");
    
    let query = sessionsRef.orderBy("updatedAt", "desc");
    
    // Apply pagination
    const snapshot = await query.limit(parseInt(limit)).get();
    
    const sessions = [];
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    snapshot.forEach(doc => {
      const data = doc.data();
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
      const isArchived = updatedAt < ninetyDaysAgo;
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        const hasMatch = data.messages?.some(msg => 
          msg.content?.toLowerCase().includes(searchLower)
        );
        if (!hasMatch) return;
      }

      sessions.push({
        sessionId: doc.id,
        startedAt: data.messages?.[0]?.timestamp || (data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt),
        endedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        messageCount: data.messages?.length || 0,
        preview: data.messages?.[0]?.content?.substring(0, 100) || "",
        themes: data.themes || [],
        isArchived
      });
    });

    res.json({ sessions, total: sessions.length });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get specific conversation session
router.get("/assistant/history/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: "Session not found" });
    }

    const data = sessionDoc.data();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const isArchived = updatedAt < ninetyDaysAgo;

    res.json({
      sessionId: sessionDoc.id,
      messages: data.messages || [],
      themes: data.themes || [],
      startedAt: data.messages?.[0]?.timestamp || (data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt),
      endedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      messageCount: data.messages?.length || 0,
      isArchived
    });
  } catch (err) {
    console.error("Error fetching session:", err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Delete conversation session
router.delete("/assistant/history/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    
    await sessionRef.delete();
    
    res.json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});
```

---

## 3. Get Session Context (Helper Endpoint)

Add this helper endpoint:

```javascript
// Get conversation context for a session
router.get("/assistant/context", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
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
      sessionStarted: sessionData.updatedAt
    });

  } catch (error) {
    console.error("Error fetching context:", error);
    res.status(500).json({ error: "Failed to fetch context" });
  }
});
```

---

## 4. Testing Your New Endpoints

After adding the code, restart your backend server and test:

### Test 1: Conversation Memory
```bash
# Get your Firebase token from browser localStorage
TOKEN="your-firebase-token-here"

# Send a message with context
curl -X POST http://localhost:8000/journal/assistant/reply-with-context \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel stressed about work",
    "sessionId": "test_session_123",
    "includeHistory": true
  }'

# Expected response:
# {
#   "reply": "I hear you... work stress can feel so heavy. What's weighing on you most?",
#   "sessionId": "test_session_123",
#   "messageId": "msg_1234567890",
#   "timestamp": "2025-11-30T..."
# }
```

### Test 2: Get History
```bash
# Get conversation history
curl -X GET "http://localhost:8000/journal/assistant/history" \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "sessions": [
#     {
#       "sessionId": "test_session_123",
#       "startedAt": "2025-11-30T...",
#       "messageCount": 2,
#       "preview": "I feel stressed about work",
#       ...
#     }
#   ],
#   "total": 1
# }
```

### Test 3: Get Specific Session
```bash
# Get specific conversation
curl -X GET "http://localhost:8000/journal/assistant/history/test_session_123" \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "sessionId": "test_session_123",
#   "messages": [
#     { "role": "user", "content": "I feel stressed about work", ... },
#     { "role": "assistant", "content": "I hear you...", ... }
#   ],
#   "messageCount": 2,
#   ...
# }
```

---

## 5. Verify in Frontend

After adding these endpoints:

1. **Start your backend:** `npm start` (in backend folder)
2. **Start your frontend:** `npm start` (in frontend folder)
3. **Open AI Assistant page**
4. **Send a message** - should work with context now
5. **Send another message** - AI should remember the first message
6. **Click "View History"** - should show your conversation
7. **Refresh page** - conversation should persist

---

## 6. Firestore Structure

Your Firebase will now have this structure:

```
users/
  {userId}/
    aiSessions/
      {sessionId}/
        - sessionId: "session_123"
        - messages: [
            { role: "user", content: "...", timestamp: "..." },
            { role: "assistant", content: "...", timestamp: "..." }
          ]
        - updatedAt: Timestamp
        - lastMessage: "..."
```

---

## 7. Environment Variables

Make sure your `.env` file has:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

---

## 8. Troubleshooting

### Error: "Cannot read property 'uid' of undefined"
**Fix:** Make sure `verifyToken` middleware is working and setting `req.uid`

### Error: "db is not defined"
**Fix:** Make sure you have `const db = admin.firestore();` at the top of your file

### Error: "GEMINI_API_KEY is not defined"
**Fix:** Add `GEMINI_API_KEY` to your `.env` file and restart the server

### Sessions not saving
**Fix:** Check Firebase console → Firestore → users → {userId} → aiSessions
If collection doesn't exist, check Firestore security rules

---

## Summary

**Add these 4 endpoints to your backend:**
1. `POST /journal/assistant/reply-with-context` - Conversation memory
2. `GET /journal/assistant/history` - List conversations
3. `GET /journal/assistant/history/:sessionId` - Get specific conversation
4. `GET /journal/assistant/context` - Get session context (helper)

**Total lines of code:** ~200 lines
**Time to add:** ~5 minutes
**Impact:** Fixes all AI Assistant conversation memory and history features! 🎉

Copy the code above, paste it into your `backend/routes/journal.js`, restart your server, and test!
