# Mood Tracking Backend Code - Copy & Paste

## Instructions

Open your `backend/routes/journal.js` file and paste this code **after** your existing endpoints (around line 600, after the gratitude endpoints if they exist, or after the streak recovery endpoint).

---

## Code to Add

```javascript
// ===========================================
// 🕰️ TIME CAPSULE FEATURE
// ===========================================

// Create time capsule
router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals } = req.body;
    
    if (!message || !unlockDate) {
      return res.status(400).json({ error: "Message and unlock date required" });
    }
    
    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc();
    const unlockTimestamp = new Date(unlockDate);
    const now = new Date();
    const daysUntilUnlock = Math.floor((unlockTimestamp - now) / (1000 * 60 * 60 * 24));
    
    await capsuleRef.set({
      capsuleId: capsuleRef.id,
      userId: req.uid,
      message,
      createdAt: new Date(),
      unlockDate: unlockTimestamp,
      currentMood: currentMood || null,
      currentGoals: currentGoals || [],
      isUnlocked: false,
      unlockedAt: null,
      notificationSent: false
    });
    
    res.json({
      capsuleId: capsuleRef.id,
      unlockDate,
      daysUntilUnlock
    });
  } catch (err) {
    console.error("Error creating time capsule:", err);
    res.status(500).json({ error: "Failed to create time capsule" });
  }
});

// List time capsules (locked and unlocked)
router.get("/timecapsule/list", verifyToken, async (req, res) => {
  try {
    const capsulesRef = db.collection("users").doc(req.uid).collection("timeCapsules");
    const snapshot = await capsulesRef.orderBy("createdAt", "desc").get();
    
    const locked = [];
    const unlocked = [];
    const now = new Date();
    
    snapshot.forEach(doc => {
      const capsule = doc.data();
      const unlockDate = capsule.unlockDate.toDate();
      
      if (unlockDate <= now || capsule.isUnlocked) {
        // Capsule is unlocked
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0]
        });
      } else {
        // Capsule is still locked
        const daysUntilUnlock = Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24));
        locked.push({
          capsuleId: capsule.capsuleId,
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          unlockDate: unlockDate.toISOString().split('T')[0],
          daysUntilUnlock
        });
      }
    });
    
    res.json({ locked, unlocked });
  } catch (err) {
    console.error("Error fetching time capsules:", err);
    res.status(500).json({ error: "Failed to fetch time capsules" });
  }
});

// Get specific time capsule (only if unlocked)
router.get("/timecapsule/:capsuleId", verifyToken, async (req, res) => {
  try {
    const { capsuleId } = req.params;
    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc(capsuleId);
    const capsuleDoc = await capsuleRef.get();
    
    if (!capsuleDoc.exists) {
      return res.status(404).json({ error: "Time capsule not found" });
    }
    
    const capsule = capsuleDoc.data();
    const unlockDate = capsule.unlockDate.toDate();
    const now = new Date();
    
    // Check if capsule is still locked
    if (unlockDate > now && !capsule.isUnlocked) {
      return res.status(403).json({ 
        error: "Time capsule is still locked",
        unlockDate: unlockDate.toISOString().split('T')[0],
        daysUntilUnlock: Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24))
      });
    }
    
    // Mark as unlocked if it wasn't already
    if (!capsule.isUnlocked) {
      await capsuleRef.update({
        isUnlocked: true,
        unlockedAt: new Date()
      });
    }
    
    res.json({
      ...capsule,
      unlockDate: unlockDate.toISOString().split('T')[0],
      createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
      unlockedAt: capsule.unlockedAt ? capsule.unlockedAt.toDate().toISOString().split('T')[0] : null
    });
  } catch (err) {
    console.error("Error fetching time capsule:", err);
    res.status(500).json({ error: "Failed to fetch time capsule" });
  }
});

// ===========================================
// 🙏 GRATITUDE JAR FEATURE
// ===========================================

// Add gratitude entry
router.post("/gratitude/add", verifyToken, async (req, res) => {
  try {
    const { gratitudeText, mood } = req.body;
    
    if (!gratitudeText || !gratitudeText.trim()) {
      return res.status(400).json({ error: "Gratitude text required" });
    }
    
    const gratitudeRef = db.collection("users").doc(req.uid).collection("gratitudeEntries").doc();
    
    await gratitudeRef.set({
      gratitudeId: gratitudeRef.id,
      userId: req.uid,
      gratitudeText: gratitudeText.trim(),
      date: new Date().toISOString().split('T')[0],
      mood: mood || null,
      createdAt: new Date()
    });
    
    res.json({
      gratitudeId: gratitudeRef.id,
      success: true
    });
  } catch (err) {
    console.error("Error adding gratitude:", err);
    res.status(500).json({ error: "Failed to add gratitude" });
  }
});

// Get random gratitude entry
router.get("/gratitude/random", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users").doc(req.uid).collection("gratitudeEntries");
    const snapshot = await gratitudesRef.get();
    
    if (snapshot.empty) {
      return res.json({ gratitude: null });
    }
    
    const gratitudes = [];
    snapshot.forEach(doc => gratitudes.push(doc.data()));
    
    // Pick random gratitude
    const random = gratitudes[Math.floor(Math.random() * gratitudes.length)];
    
    res.json({
      gratitudeId: random.gratitudeId,
      gratitudeText: random.gratitudeText,
      date: random.date,
      mood: random.mood
    });
  } catch (err) {
    console.error("Error fetching random gratitude:", err);
    res.status(500).json({ error: "Failed to fetch gratitude" });
  }
});

// Get all gratitude entries
router.get("/gratitude/all", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users").doc(req.uid).collection("gratitudeEntries");
    const snapshot = await gratitudesRef.orderBy("createdAt", "desc").get();
    
    const gratitudes = [];
    snapshot.forEach(doc => gratitudes.push(doc.data()));
    
    res.json({
      gratitudes,
      total: gratitudes.length
    });
  } catch (err) {
    console.error("Error fetching gratitudes:", err);
    res.status(500).json({ error: "Failed to fetch gratitudes" });
  }
});
```

---

## Testing Commands

After adding the code and restarting your backend, test with these curl commands:

### Test Time Capsule Creation
```bash
curl -X POST http://localhost:8000/journal/timecapsule/create \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Dear future me, I hope you are doing well and have achieved your goals!",
    "unlockDate": "2026-11-30",
    "currentMood": 4,
    "currentGoals": ["exercise 3x per week", "read 12 books"]
  }'
```

### Test List Time Capsules
```bash
curl -X GET http://localhost:8000/journal/timecapsule/list \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Test Add Gratitude
```bash
curl -X POST http://localhost:8000/journal/gratitude/add \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gratitudeText": "I am grateful for my morning coffee and quiet time to reflect",
    "mood": 5
  }'
```

### Test Random Gratitude
```bash
curl -X GET http://localhost:8000/journal/gratitude/random \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Test All Gratitudes
```bash
curl -X GET http://localhost:8000/journal/gratitude/all \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

---

## Expected Responses

### Time Capsule Creation
```json
{
  "capsuleId": "abc123xyz",
  "unlockDate": "2026-11-30",
  "daysUntilUnlock": 365
}
```

### List Time Capsules
```json
{
  "locked": [
    {
      "capsuleId": "abc123",
      "createdAt": "2025-11-30",
      "unlockDate": "2026-11-30",
      "daysUntilUnlock": 365
    }
  ],
  "unlocked": []
}
```

### Add Gratitude
```json
{
  "gratitudeId": "grat_abc123",
  "success": true
}
```

### Random Gratitude
```json
{
  "gratitudeId": "grat_abc123",
  "gratitudeText": "I am grateful for...",
  "date": "2025-11-30",
  "mood": 5
}
```

---

## Firebase Structure

After using these endpoints, your Firestore will have:

```
users/
  {userId}/
    timeCapsules/
      {capsuleId}/
        - capsuleId: string
        - userId: string
        - message: string
        - createdAt: Timestamp
        - unlockDate: Timestamp
        - currentMood: number | null
        - currentGoals: string[]
        - isUnlocked: boolean
        - unlockedAt: Timestamp | null
        - notificationSent: boolean
    
    gratitudeEntries/
      {gratitudeId}/
        - gratitudeId: string
        - userId: string
        - gratitudeText: string
        - date: string (YYYY-MM-DD)
        - mood: number | null
        - createdAt: Timestamp
```

---

## Summary

**Lines of code:** ~200 lines
**Endpoints added:** 6 total
- 3 for Time Capsules
- 3 for Gratitude Jar

**Time to add:** 5 minutes (copy-paste)
**Time to test:** 5 minutes

Just copy the code above, paste it into your `backend/routes/journal.js`, restart your server, and test! 🚀
