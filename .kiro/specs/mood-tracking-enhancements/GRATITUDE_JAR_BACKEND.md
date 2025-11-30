# Gratitude Jar Backend Implementation

## Overview
This document contains the backend code for the Gratitude Jar feature, including Firebase data structure and API endpoints.

## Firebase Data Structure

### Collection Path
```
users/{userId}/gratitudeEntries/{gratitudeId}
```

### Schema
```javascript
{
  gratitudeId: "grat_abc123",
  userId: "user123",
  gratitudeText: "I'm grateful for my morning coffee and quiet time",
  date: "2025-11-29",
  mood: 4,
  createdAt: Timestamp
}
```

### Indexes
Create composite indexes in Firebase Console:
- Collection: `gratitudeEntries`
- Fields: `userId` (Ascending), `date` (Descending)
- Fields: `userId` (Ascending), `mood` (Ascending)

## Backend API Endpoints

Add these endpoints to your Node.js backend (e.g., `server.js` or journal routes):

```javascript
// ============================================
// GRATITUDE JAR ENDPOINTS
// ============================================

// POST /journal/gratitude/add
router.post("/gratitude/add", verifyToken, async (req, res) => {
  try {
    const { gratitudeText, mood } = req.body;
    
    if (!gratitudeText || !gratitudeText.trim()) {
      return res.status(400).json({ error: "Gratitude text is required" });
    }
    
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: "Mood must be between 1 and 5" });
    }
    
    const gratitudeRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries")
      .doc();
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    await gratitudeRef.set({
      gratitudeId: gratitudeRef.id,
      userId: req.uid,
      gratitudeText: gratitudeText.trim(),
      date: dateStr,
      mood,
      createdAt: now
    });
    
    res.json({
      gratitudeId: gratitudeRef.id,
      success: true
    });
  } catch (err) {
    console.error("Error adding gratitude:", err);
    res.status(500).json({ error: "Failed to add gratitude entry" });
  }
});

// GET /journal/gratitude/random
router.get("/gratitude/random", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries");
    
    const snapshot = await gratitudesRef.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: "No gratitude entries found" });
    }
    
    // Get random entry
    const entries = [];
    snapshot.forEach(doc => {
      entries.push(doc.data());
    });
    
    const randomEntry = entries[Math.floor(Math.random() * entries.length)];
    
    res.json({
      gratitudeId: randomEntry.gratitudeId,
      gratitudeText: randomEntry.gratitudeText,
      date: randomEntry.date,
      mood: randomEntry.mood
    });
  } catch (err) {
    console.error("Error fetching random gratitude:", err);
    res.status(500).json({ error: "Failed to fetch random gratitude" });
  }
});

// GET /journal/gratitude/all
router.get("/gratitude/all", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, mood } = req.query;
    
    let gratitudesRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries")
      .orderBy("date", "desc");
    
    // Apply filters if provided
    if (startDate) {
      gratitudesRef = gratitudesRef.where("date", ">=", startDate);
    }
    if (endDate) {
      gratitudesRef = gratitudesRef.where("date", "<=", endDate);
    }
    if (mood) {
      gratitudesRef = gratitudesRef.where("mood", "==", parseInt(mood));
    }
    
    const snapshot = await gratitudesRef.get();
    
    const gratitudes = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      gratitudes.push({
        gratitudeId: data.gratitudeId,
        gratitudeText: data.gratitudeText,
        date: data.date,
        mood: data.mood
      });
    });
    
    res.json({
      gratitudes,
      total: gratitudes.length
    });
  } catch (err) {
    console.error("Error fetching gratitudes:", err);
    res.status(500).json({ error: "Failed to fetch gratitude entries" });
  }
});
```

## Testing the Endpoints

### 1. Add Gratitude Entry
```bash
curl -X POST http://localhost:8000/journal/gratitude/add \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gratitudeText": "I am grateful for my supportive friends",
    "mood": 4
  }'
```

Expected Response:
```json
{
  "gratitudeId": "grat_abc123",
  "success": true
}
```

### 2. Get Random Gratitude
```bash
curl -X GET http://localhost:8000/journal/gratitude/random \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Expected Response:
```json
{
  "gratitudeId": "grat_abc123",
  "gratitudeText": "I am grateful for my supportive friends",
  "date": "2025-11-29",
  "mood": 4
}
```

### 3. Get All Gratitudes
```bash
curl -X GET http://localhost:8000/journal/gratitude/all \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Expected Response:
```json
{
  "gratitudes": [
    {
      "gratitudeId": "grat_abc123",
      "gratitudeText": "I am grateful for my supportive friends",
      "date": "2025-11-29",
      "mood": 4
    }
  ],
  "total": 1
}
```

### 4. Get Filtered Gratitudes
```bash
# Filter by mood
curl -X GET "http://localhost:8000/journal/gratitude/all?mood=5" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Filter by date range
curl -X GET "http://localhost:8000/journal/gratitude/all?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## Integration Notes

1. **Authentication**: All endpoints require the `verifyToken` middleware to authenticate users
2. **Error Handling**: Each endpoint includes try-catch blocks with appropriate error responses
3. **Validation**: Input validation ensures data integrity
4. **Date Format**: Dates are stored in ISO format (YYYY-MM-DD)
5. **Firestore**: Uses Firestore subcollections under each user document

## Next Steps

After implementing these endpoints:
1. Test each endpoint with curl or Postman
2. Verify data is correctly stored in Firebase Console
3. Implement the frontend components (GratitudeJar.jsx, AddGratitudeModal.jsx)
4. Connect frontend to these API endpoints
