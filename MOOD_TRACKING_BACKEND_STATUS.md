# Mood Tracking Enhancements - Backend Status

## Overview

Checking the mood-tracking-enhancements spec against your Raindrop backend to identify what needs to be added.

---

## ✅ Already Implemented in Raindrop

Your Raindrop backend **already has** most of what's needed!

### 1. Extended Mood History ✅
**Endpoint:** `GET /analytics/mood/extended?uid={userId}&days={days}`
**Status:** ✅ **FULLY IMPLEMENTED**

```typescript
// Lines 150-220 in your Raindrop code
async getMoodExtended(uid: string, days: number): Promise<Response> {
  // ✅ Fetches mood data for specified period
  // ✅ Calculates average mood
  // ✅ Calculates variance
  // ✅ Determines trend (improving/declining/stable)
  // ✅ Identifies best and worst days
  // ✅ Counts days tracked and missed days
}
```

**What it returns:**
```json
{
  "uid": "user123",
  "period": "30 days",
  "moodData": [
    { "date": "2025-11-01", "mood": 3 },
    { "date": "2025-11-02", "mood": 4 }
  ],
  "stats": {
    "averageMood": 3.7,
    "moodVariance": 0.8,
    "trend": "improving",
    "bestDay": { "date": "2025-11-15", "mood": 5 },
    "worstDay": { "date": "2025-11-03", "mood": 2 },
    "daysTracked": 28,
    "missedDays": 2
  }
}
```

**Perfect for:**
- ✅ Extended mood dashboard
- ✅ Mood constellation data
- ✅ Period comparisons
- ✅ Trend analysis

---

### 2. Streak Recovery Data ✅
**Endpoint:** `GET /analytics/streaks?uid={userId}`
**Status:** ✅ **ENHANCED WITH RECOVERY DATA**

```typescript
// Lines 220-320 in your Raindrop code
async getStreaks(uid: string): Promise<Response> {
  // ✅ Returns streak data
  // ✅ NEW: streakBroken flag
  // ✅ NEW: missedDays count
  // ✅ NEW: previousStreak value
}
```

**What it returns:**
```json
{
  "uid": "user123",
  "currentStreak": 5,
  "longestStreak": 14,
  "lastEntryDate": "2025-11-29",
  "totalEntries": 45,
  "isStreakActive": true,
  "streakBroken": false,
  "missedDays": 0,
  "previousStreak": 0
}
```

**Perfect for:**
- ✅ Streak recovery modal
- ✅ Motivation messages
- ✅ Progress tracking

---

### 3. Basic Mood Data ✅
**Endpoint:** `GET /analytics/mood?uid={userId}`
**Status:** ✅ **IMPLEMENTED**

Returns last 7 days of mood data (used by MoodDashboard).

---

### 4. Insights ✅
**Endpoint:** `GET /analytics/insights?uid={userId}`
**Status:** ✅ **IMPLEMENTED**

Returns AI-generated insights with daily caching.

---

### 5. Badges ✅
**Endpoint:** `GET /analytics/badges?uid={userId}`
**Status:** ✅ **IMPLEMENTED**

Returns earned badges based on streaks.

---

## ❌ Missing from Raindrop (Need Node.js Backend)

These features require Firebase Firestore and should be added to your **Node.js backend** (not Raindrop):

### 1. Time Capsule Endpoints ❌
**Status:** ❌ **NOT IMPLEMENTED**
**Where to add:** Node.js backend (`backend/routes/journal.js`)

**Endpoints needed:**
```javascript
POST   /journal/timecapsule/create
GET    /journal/timecapsule/list
GET    /journal/timecapsule/:capsuleId
```

**Why Node.js backend:**
- Needs Firebase Firestore for storage
- Requires user authentication
- Needs notification scheduling

---

### 2. Gratitude Jar Endpoints ❌
**Status:** ❌ **NOT IMPLEMENTED**
**Where to add:** Node.js backend (`backend/routes/journal.js`)

**Endpoints needed:**
```javascript
POST   /journal/gratitude/add
GET    /journal/gratitude/random
GET    /journal/gratitude/all
```

**Why Node.js backend:**
- Needs Firebase Firestore for storage
- Requires user authentication
- Simple CRUD operations

---

## 📋 What You Need to Add

### To Node.js Backend (`backend/routes/journal.js`)

Add these 6 endpoints:

#### 1. Time Capsule Endpoints (3 endpoints)

```javascript
// -----------------------------------------
// 🕰️ TIME CAPSULE FEATURE
// -----------------------------------------

// Create time capsule
router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals } = req.body;
    
    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc();
    const unlockTimestamp = new Date(unlockDate);
    const daysUntilUnlock = Math.floor((unlockTimestamp - new Date()) / (1000 * 60 * 60 * 24));
    
    await capsuleRef.set({
      capsuleId: capsuleRef.id,
      userId: req.uid,
      message,
      createdAt: new Date(),
      unlockDate: unlockTimestamp,
      currentMood,
      currentGoals,
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

// List time capsules
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
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0]
        });
      } else {
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
    
    if (unlockDate > now && !capsule.isUnlocked) {
      return res.status(403).json({ error: "Time capsule is still locked" });
    }
    
    res.json({
      ...capsule,
      unlockDate: unlockDate.toISOString().split('T')[0],
      createdAt: capsule.createdAt.toDate().toISOString().split('T')[0]
    });
  } catch (err) {
    console.error("Error fetching time capsule:", err);
    res.status(500).json({ error: "Failed to fetch time capsule" });
  }
});
```

#### 2. Gratitude Jar Endpoints (3 endpoints)

```javascript
// -----------------------------------------
// 🙏 GRATITUDE JAR FEATURE
// -----------------------------------------

// Add gratitude entry
router.post("/gratitude/add", verifyToken, async (req, res) => {
  try {
    const { gratitudeText, mood } = req.body;
    
    const gratitudeRef = db.collection("users").doc(req.uid).collection("gratitudeEntries").doc();
    
    await gratitudeRef.set({
      gratitudeId: gratitudeRef.id,
      userId: req.uid,
      gratitudeText,
      date: new Date().toISOString().split('T')[0],
      mood,
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

// Get random gratitude
router.get("/gratitude/random", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users").doc(req.uid).collection("gratitudeEntries");
    const snapshot = await gratitudesRef.get();
    
    if (snapshot.empty) {
      return res.json({ gratitude: null });
    }
    
    const gratitudes = [];
    snapshot.forEach(doc => gratitudes.push(doc.data()));
    
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

// Get all gratitudes
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

## 📊 Summary Table

| Feature | Endpoint | Backend | Status |
|---------|----------|---------|--------|
| Extended Mood History | `GET /analytics/mood/extended` | Raindrop | ✅ Done |
| Mood Data (7 days) | `GET /analytics/mood` | Raindrop | ✅ Done |
| Streaks | `GET /analytics/streaks` | Raindrop | ✅ Done |
| Insights | `GET /analytics/insights` | Raindrop | ✅ Done |
| Badges | `GET /analytics/badges` | Raindrop | ✅ Done |
| **Create Time Capsule** | `POST /journal/timecapsule/create` | Node.js | ❌ **Need to add** |
| **List Time Capsules** | `GET /journal/timecapsule/list` | Node.js | ❌ **Need to add** |
| **Get Time Capsule** | `GET /journal/timecapsule/:id` | Node.js | ❌ **Need to add** |
| **Add Gratitude** | `POST /journal/gratitude/add` | Node.js | ❌ **Need to add** |
| **Random Gratitude** | `GET /journal/gratitude/random` | Node.js | ❌ **Need to add** |
| **All Gratitudes** | `GET /journal/gratitude/all` | Node.js | ❌ **Need to add** |

---

## 🎯 Action Items

### 1. Add to Node.js Backend
Copy the 6 endpoints above into your `backend/routes/journal.js` file.

**Location:** After your existing journal endpoints (around line 600)

### 2. No Changes Needed to Raindrop
Your Raindrop backend is **complete** for mood tracking! ✅

### 3. Frontend Implementation
The frontend components can now be built using:
- ✅ Raindrop endpoints for mood data
- ✅ Node.js endpoints for time capsules and gratitude

---

## 🧪 Testing

After adding the endpoints, test:

```bash
# Test time capsule creation
curl -X POST http://localhost:8000/journal/timecapsule/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Dear future me...",
    "unlockDate": "2026-11-30",
    "currentMood": 4,
    "currentGoals": ["exercise more"]
  }'

# Test gratitude addition
curl -X POST http://localhost:8000/journal/gratitude/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gratitudeText": "I am grateful for...",
    "mood": 5
  }'

# Test random gratitude
curl -X GET http://localhost:8000/journal/gratitude/random \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 File Structure

After adding endpoints, your Firebase will have:

```
users/
  {userId}/
    journals/          (existing)
    aiSessions/        (existing)
    timeCapsules/      (NEW)
      {capsuleId}/
        - message
        - unlockDate
        - currentMood
        - currentGoals
    gratitudeEntries/  (NEW)
      {gratitudeId}/
        - gratitudeText
        - date
        - mood
```

---

## Summary

**Raindrop Backend:** ✅ Complete! No changes needed.

**Node.js Backend:** ❌ Need to add 6 endpoints:
- 3 for Time Capsules
- 3 for Gratitude Jar

**Total code to add:** ~150 lines (copy-paste ready above)

**Time estimate:** 5-10 minutes to add and test

Your Raindrop backend is already doing the heavy lifting for mood analytics! You just need to add the simple CRUD endpoints for time capsules and gratitude to your Node.js backend. 🎉
