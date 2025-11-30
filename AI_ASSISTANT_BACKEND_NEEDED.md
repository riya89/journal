# AI Assistant Enhancements - Backend Integration Guide

## Overview
The spec created several AI assistant features, but your current backend code is **MISSING** the required endpoints. Here's what you need to add.

---

## ✅ What's Already in Your Backend

Your current `backend/routes/journal.js` has:
- ✅ `/journal/assistant/reply` - Basic AI reply (no context)
- ✅ `/journal/assistant/speak` - Text-to-speech
- ✅ `/journal/assistant/speak-edge` - Edge TTS
- ✅ `/journal/assistant/speak-stream` - Streaming TTS
- ✅ `/journal/affirmation/daily` - Basic daily affirmation (NOT personalized)

---

## ❌ What's MISSING from Your Backend

### 1. **Conversation Memory Endpoint** (CRITICAL)
**Frontend calls:** `POST /journal/assistant/reply-with-context`
**Status:** ❌ NOT IMPLEMENTED
**Used by:** `src/pages/AIAssistant.jsx` (line 797)

```javascript
// Frontend is calling this:
const replyRes = await apiPost("http://localhost:8000/journal/assistant/reply-with-context", { 
  message: userText,
  sessionId: sessionId,
  includeHistory: true
});
```

**What it needs to do:**
- Accept `message`, `sessionId`, and `includeHistory` parameters
- Load last 10 messages from Firebase `aiSessions` collection
- Send conversation history to Gemini AI for context-aware responses
- Store new messages in the session
- Return AI reply with session info

**Implementation:** See `.kiro/specs/ai-assistant-enhancements/backend-conversation-memory.md`

---

### 2. **Conversation History Endpoints** (CRITICAL)
**Frontend calls:** 
- `GET /journal/assistant/history` 
- `GET /journal/assistant/history/:sessionId`

**Status:** ❌ NOT IMPLEMENTED
**Used by:** `src/components/HistoryPanel.jsx`

```javascript
// Frontend is calling these:
const response = await fetch(`/assistant/history?uid=${user.uid}`);
const response = await fetch(`/assistant/history/${sessionId}?uid=${user.uid}`);
```

**What they need to do:**
- List all past conversation sessions with pagination
- Retrieve full conversation for a specific session
- Mark sessions older than 90 days as archived
- Support search functionality

**Implementation:** See `.kiro/specs/ai-assistant-enhancements/backend-history-endpoints.md`

---

### 3. **Personalized Affirmations Endpoint** (OPTIONAL BUT RECOMMENDED)
**Frontend calls:** `GET /journal/affirmation/personalized`
**Status:** ❌ NOT IMPLEMENTED (you have `/affirmation/daily` but not personalized)
**Used by:** `src/components/AffirmationCard.jsx`

**Current vs Needed:**
- ❌ Current: `/journal/affirmation/daily` - Generic affirmations
- ✅ Needed: `/journal/affirmation/personalized` - Mood-based affirmations

**What it needs to do:**
- Fetch user's recent mood data from Raindrop
- Analyze recent journal entries for themes
- Generate personalized affirmation based on mood + themes
- Cache per user per day

**Implementation:** See `.kiro/specs/ai-assistant-enhancements/backend-affirmations.md`

---

### 4. **Task Suggestion Endpoint** (OPTIONAL)
**Frontend calls:** `POST /journal/analyze-for-tasks`
**Status:** ❌ NOT IMPLEMENTED
**Used by:** `src/components/TaskSuggestionModal.jsx`

**What it needs to do:**
- Analyze journal content for themes (stress, goals, etc.)
- Generate 2-3 relevant task suggestions using Gemini AI
- Return tasks with categories, time estimates, and reasons

**Implementation:** See `.kiro/specs/ai-assistant-enhancements/backend-task-suggestions.md`

---

## 🔥 Current UI Errors

### Error 1: AI Assistant Not Working Properly
**Location:** `src/pages/AIAssistant.jsx`
**Issue:** Frontend calls `/journal/assistant/reply-with-context` which doesn't exist
**Symptom:** AI responses don't have conversation memory, falls back to old endpoint

```javascript
// Line 797 - This endpoint doesn't exist in your backend
const replyRes = await apiPost("http://localhost:8000/journal/assistant/reply-with-context", { 
  message: userText,
  sessionId: sessionId,
  includeHistory: true
});

// Line 875 - Falls back to this (which works but has no context)
const fallbackRes = await apiPost("http://localhost:8000/journal/assistant/reply", { 
  message: userText 
});
```

**Fix:** Add the conversation memory endpoint to your backend

---

### Error 2: History Panel Not Working
**Location:** `src/components/HistoryPanel.jsx`
**Issue:** Frontend calls `/assistant/history` which doesn't exist
**Symptom:** History panel shows empty or errors

```javascript
// This endpoint doesn't exist
const response = await fetch(`/assistant/history?uid=${user.uid}`);
```

**Fix:** Add the history endpoints to your backend

---

### Error 3: Affirmations Not Personalized
**Location:** `src/components/AffirmationCard.jsx`
**Issue:** You have `/affirmation/daily` but frontend might expect personalized version
**Symptom:** Affirmations are generic, not based on mood/journal content

**Fix:** Either:
1. Add `/affirmation/personalized` endpoint (recommended)
2. OR update frontend to use `/affirmation/daily`

---

## 📋 Quick Integration Checklist

### Priority 1: Critical Features (AI won't work without these)
- [ ] Add `POST /journal/assistant/reply-with-context` endpoint
- [ ] Add `GET /journal/assistant/history` endpoint
- [ ] Add `GET /journal/assistant/history/:sessionId` endpoint
- [ ] Test conversation memory in AI Assistant page

### Priority 2: Enhanced Features (Nice to have)
- [ ] Add `GET /journal/affirmation/personalized` endpoint
- [ ] Add `POST /journal/analyze-for-tasks` endpoint
- [ ] Add `DELETE /journal/assistant/history/:sessionId` endpoint

### Priority 3: Testing
- [ ] Test AI conversation with context
- [ ] Test history panel loading
- [ ] Test affirmation generation
- [ ] Test task suggestions after journal save

---

## 🚀 Quick Start: Add Missing Endpoints

### Step 1: Add Conversation Memory
Open your `backend/routes/journal.js` and add:

```javascript
// Add this endpoint after your existing /assistant/reply endpoint
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
    context.push({ role: "user", content: message });

    // Build messages for Gemini
    const messages = [
      {
        role: "system",
        content: `You are a soft-spoken, gentle emotional companion.
Respond in under 2 sentences.
Tone: calming, validating, grounding.`
      },
      ...context.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }))
    ];

    // Call Gemini AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map(m => ({
            parts: [{ text: m.content }]
          }))
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here with you. Tell me more 🌿";

    // Save to session
    context.push({ role: "assistant", content: reply, timestamp: new Date() });
    
    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    await sessionRef.set({
      sessionId,
      messages: context.slice(-10), // Keep only last 10
      updatedAt: new Date()
    }, { merge: true });

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

### Step 2: Add History Endpoints
```javascript
// Get conversation history list
router.get("/assistant/history", verifyToken, async (req, res) => {
  try {
    const sessionsRef = db.collection("users").doc(req.uid).collection("aiSessions");
    const snapshot = await sessionsRef.orderBy("updatedAt", "desc").limit(20).get();
    
    const sessions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      sessions.push({
        sessionId: doc.id,
        startedAt: data.messages?.[0]?.timestamp || data.updatedAt,
        endedAt: data.updatedAt,
        messageCount: data.messages?.length || 0,
        preview: data.messages?.[0]?.content?.substring(0, 100) || "",
        themes: []
      });
    });

    res.json({ sessions, total: sessions.length });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get specific conversation
router.get("/assistant/history/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: "Session not found" });
    }

    const data = sessionDoc.data();
    res.json({
      sessionId: sessionDoc.id,
      messages: data.messages || [],
      themes: [],
      startedAt: data.messages?.[0]?.timestamp || data.updatedAt,
      messageCount: data.messages?.length || 0
    });
  } catch (err) {
    console.error("Error fetching session:", err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});
```

---

## 📁 Where to Find Full Implementation

All detailed implementations are in:
- `.kiro/specs/ai-assistant-enhancements/backend-conversation-memory.md`
- `.kiro/specs/ai-assistant-enhancements/backend-history-endpoints.md`
- `.kiro/specs/ai-assistant-enhancements/backend-affirmations.md`
- `.kiro/specs/ai-assistant-enhancements/backend-task-suggestions.md`

---

## 🧪 Testing After Integration

```bash
# Test conversation memory
curl -X POST http://localhost:8000/journal/assistant/reply-with-context \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel stressed",
    "sessionId": "test_session_123",
    "includeHistory": true
  }'

# Test history
curl -X GET http://localhost:8000/journal/assistant/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Summary

**Your backend is missing 3 critical endpoints:**
1. `/journal/assistant/reply-with-context` - For conversation memory
2. `/journal/assistant/history` - For history list
3. `/journal/assistant/history/:sessionId` - For specific conversation

**Without these, the AI Assistant features won't work properly.**

Add the endpoints from the spec files, test them, and your UI errors should be resolved! 🎉
