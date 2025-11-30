# Backend History Endpoints Implementation

## Overview
These endpoints need to be added to the backend server (running on localhost:8000) to support conversation history features.

## Endpoints to Add

### 1. GET /journal/assistant/history
Get list of conversation sessions with pagination and search support.

```javascript
// Add this to your backend router
router.get("/assistant/history", verifyToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0, search = '' } = req.query;
    const sessionsRef = db.collection("users").doc(req.uid).collection("aiSessions");
    
    let query = sessionsRef.orderBy("updatedAt", "desc");
    
    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));
    
    const snapshot = await query.get();
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
```

### 2. GET /journal/assistant/history/:sessionId
Get full conversation for a specific session.

```javascript
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
```

### 3. DELETE /journal/assistant/history/:sessionId
Delete a specific conversation session.

```javascript
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

## Testing

Test these endpoints with curl:

```bash
# Get Firebase token
TOKEN="your-firebase-token"

# Get history list
curl -X GET "http://localhost:8000/journal/assistant/history?limit=20&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# Get specific session
curl -X GET "http://localhost:8000/journal/assistant/history/session_123" \
  -H "Authorization: Bearer $TOKEN"

# Search history
curl -X GET "http://localhost:8000/journal/assistant/history?search=stress" \
  -H "Authorization: Bearer $TOKEN"

# Delete session
curl -X DELETE "http://localhost:8000/journal/assistant/history/session_123" \
  -H "Authorization: Bearer $TOKEN"
```

## Notes

- The `aiSessions` subcollection is already being created by the conversation context system
- Sessions older than 90 days are marked as `isArchived` but remain accessible
- Search functionality filters messages by content
- Pagination supports large history lists
