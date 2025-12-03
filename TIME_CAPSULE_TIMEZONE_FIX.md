# Time Capsule Timezone Fix

## Problem
The time capsule unlock check currently uses UTC time, which means:
- A capsule set to unlock on "Dec 5, 2025" will unlock at midnight UTC
- For users in different timezones, this could be Dec 4th or Dec 5th depending on their location
- This is inconsistent with user expectations

## Current Code Issue
```javascript
const unlockDate = capsule.unlockDate.toDate();
const now = new Date();

// This compares UTC times, not user's local time
if (unlockDate > now && !capsule.isUnlocked) {
  return res.status(403).json({ error: "Time capsule is still locked" });
}
```

## Solution
We need to:
1. Store user's timezone when creating the capsule
2. Compare dates in the user's timezone, not UTC

## Fixed Code

### 1. Update Create Endpoint
```javascript
router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals, timezone } = req.body;
    
    if (!message || !unlockDate) {
      return res.status(400).json({ error: "Message and unlock date required" });
    }

    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc();
    
    // Store unlock date as end of day in user's timezone
    const unlockTimestamp = new Date(unlockDate);
    unlockTimestamp.setHours(23, 59, 59, 999); // End of day
    
    const now = new Date();
    const daysUntilUnlock = Math.floor((unlockTimestamp - now) / (1000 * 60 * 60 * 24));

    await capsuleRef.set({
      capsuleId: capsuleRef.id,
      userId: req.uid,
      message,
      createdAt: new Date(),
      unlockDate: unlockTimestamp,
      timezone: timezone || 'UTC', // ✅ Store user's timezone
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
```

### 2. Update Get Endpoint (Timezone-Aware)
```javascript
import { toZonedTime } from 'date-fns-tz';

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
    const userTimezone = capsule.timezone || 'UTC';
    
    // ✅ Get current time in user's timezone
    const now = new Date();
    const nowInUserTZ = toZonedTime(now, userTimezone);
    const unlockInUserTZ = toZonedTime(unlockDate, userTimezone);
    
    // ✅ Compare dates in user's timezone
    const isLocked = nowInUserTZ < unlockInUserTZ && !capsule.isUnlocked;

    if (isLocked) {
      const daysUntilUnlock = Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24));
      return res.status(403).json({ 
        error: "Time capsule is still locked",
        unlockDate: unlockDate.toISOString().split('T')[0],
        daysUntilUnlock,
        timezone: userTimezone
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
      unlockedAt: capsule.unlockedAt ? capsule.unlockedAt.toDate().toISOString().split('T')[0] : null,
      timezone: userTimezone
    });
  } catch (err) {
    console.error("Error fetching time capsule:", err);
    res.status(500).json({ error: "Failed to fetch time capsule" });
  }
});
```

### 3. Update List Endpoint (Timezone-Aware)
```javascript
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
      const userTimezone = capsule.timezone || 'UTC';
      
      // ✅ Compare in user's timezone
      const nowInUserTZ = toZonedTime(now, userTimezone);
      const unlockInUserTZ = toZonedTime(unlockDate, userTimezone);
      
      const isUnlocked = nowInUserTZ >= unlockInUserTZ || capsule.isUnlocked;

      if (isUnlocked) {
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          timezone: userTimezone
        });
      } else {
        const daysUntilUnlock = Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24));
        locked.push({
          capsuleId: capsule.capsuleId,
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          unlockDate: unlockDate.toISOString().split('T')[0],
          daysUntilUnlock,
          timezone: userTimezone
        });
      }
    });

    res.json({ locked, unlocked });
  } catch (err) {
    console.error("Error fetching time capsules:", err);
    res.status(500).json({ error: "Failed to fetch time capsules" });
  }
});
```

## Frontend Changes Needed

Update the CreateCapsuleModal to send timezone:

```javascript
const handleSubmit = async () => {
  // Get user's timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const response = await apiPost(`${API_BASE_URL}/timecapsule/create`, {
    message,
    unlockDate,
    currentMood: mood,
    currentGoals: goals,
    timezone // ✅ Send timezone
  });
};
```

## Summary

**Before**: Time capsules unlock at midnight UTC regardless of user location
**After**: Time capsules unlock at midnight in the user's timezone

This ensures users get their capsules at the expected local time!
