# Time Capsule Unlock Fix - Complete Guide

## Problem
Time capsules with short durations (like 1 minute) show `daysUntilUnlock: 0` but remain locked because the timezone conversion logic doesn't work properly for sub-day comparisons.

## Solution
Compare raw timestamps instead of timezone-converted dates.

---

## Change #1: `/timecapsule/list` endpoint

### Find this code:
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

      // ❌ OLD CODE - REMOVE THIS:
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
        // ❌ OLD CODE - REMOVE THIS:
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

### Replace with this:
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

      // ✅ NEW CODE - Compare raw timestamps
      const isUnlocked = now >= unlockDate || capsule.isUnlocked;

      if (isUnlocked) {
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          timezone: userTimezone
        });
      } else {
        // ✅ NEW CODE - Calculate time remaining properly
        const msUntilUnlock = unlockDate - now;
        const minutesUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60));
        const hoursUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60 * 60));
        const daysUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60 * 60 * 24));
        
        locked.push({
          capsuleId: capsule.capsuleId,
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          unlockDate: unlockDate.toISOString().split('T')[0],
          daysUntilUnlock,
          hoursUntilUnlock,
          minutesUntilUnlock,
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

---

## Change #2: `/timecapsule/:capsuleId` endpoint

### Find this code:
```javascript
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

    // ❌ OLD CODE - REMOVE THIS:
    const now = new Date();
    const nowInUserTZ = toZonedTime(now, userTimezone);
    const unlockInUserTZ = toZonedTime(unlockDate, userTimezone);
    const isLocked = nowInUserTZ < unlockInUserTZ && !capsule.isUnlocked;

    if (isLocked) {
      // ❌ OLD CODE - REMOVE THIS:
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

### Replace with this:
```javascript
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

    // ✅ NEW CODE - Compare raw timestamps
    const now = new Date();
    const isLocked = now < unlockDate && !capsule.isUnlocked;

    if (isLocked) {
      // ✅ NEW CODE - Calculate time remaining properly
      const msUntilUnlock = unlockDate - now;
      const minutesUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60));
      const hoursUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60 * 60));
      const daysUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60 * 60 * 24));
      
      return res.status(403).json({ 
        error: "Time capsule is still locked",
        unlockDate: unlockDate.toISOString().split('T')[0],
        daysUntilUnlock,
        hoursUntilUnlock,
        minutesUntilUnlock,
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

---

## Summary of Changes

### Both endpoints need these changes:

1. **Remove timezone conversion for unlock comparison**
   - OLD: `const nowInUserTZ = toZonedTime(now, userTimezone);`
   - NEW: Just use `now` directly

2. **Compare raw timestamps**
   - OLD: `nowInUserTZ >= unlockInUserTZ`
   - NEW: `now >= unlockDate`

3. **Fix time calculation**
   - OLD: `Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24))`
   - NEW: 
     ```javascript
     const msUntilUnlock = unlockDate - now;
     const minutesUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60));
     const hoursUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60 * 60));
     const daysUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60 * 60 * 24));
     ```

---

## Why This Works

1. **Timestamp comparison is timezone-agnostic**: When you store `unlockDate` in Firestore, it's stored as a UTC timestamp. When you compare `now >= unlockDate`, both are Date objects representing absolute points in time, so the comparison works correctly regardless of timezone.

2. **Math.ceil instead of Math.floor**: This ensures that even 0.1 days shows as "1 day" instead of "0 days", which is more user-friendly.

3. **Added minutes/hours**: For short-duration capsules (like 1 minute), you can now show "5 minutes remaining" instead of just "0 days".

---

---

## Change #3: `/timecapsule/create` endpoint (CRITICAL!)

### The Problem
Your create endpoint always sets unlock time to end of day (23:59:59), even for 1-minute capsules!

### Find this code:
```javascript
router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals, timezone } = req.body;
    
    if (!message || !unlockDate) {
      return res.status(400).json({ error: "Message and unlock date required" });
    }

    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc();
    
    // ❌ WRONG - Always sets to end of day!
    const unlockTimestamp = new Date(unlockDate);
    unlockTimestamp.setHours(23, 59, 59, 999);
    
    const now = new Date();
    const daysUntilUnlock = Math.ceil((unlockTimestamp - now) / (1000 * 60 * 60 * 24));

    await capsuleRef.set({
      capsuleId: capsuleRef.id,
      userId: req.uid,
      message,
      createdAt: new Date(),
      unlockDate: unlockTimestamp,
      timezone: timezone || 'UTC',
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

### Replace with this:
```javascript
router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals, timezone, durationType, durationValue } = req.body;
    
    if (!message || !unlockDate) {
      return res.status(400).json({ error: "Message and unlock date required" });
    }

    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc();
    const now = new Date();
    let unlockTimestamp;

    // ✅ NEW CODE - Handle different duration types
    if (durationType && durationValue) {
      // Short duration (minutes/hours) - use exact time
      switch (durationType) {
        case 'minutes':
          unlockTimestamp = new Date(now.getTime() + durationValue * 60 * 1000);
          break;
        case 'hours':
          unlockTimestamp = new Date(now.getTime() + durationValue * 60 * 60 * 1000);
          break;
        case 'days':
          unlockTimestamp = new Date(now.getTime() + durationValue * 24 * 60 * 60 * 1000);
          break;
        default:
          // Fallback to date-based
          unlockTimestamp = new Date(unlockDate);
          unlockTimestamp.setHours(23, 59, 59, 999);
      }
    } else {
      // Date-based capsule - set to end of day
      unlockTimestamp = new Date(unlockDate);
      unlockTimestamp.setHours(23, 59, 59, 999);
    }

    const msUntilUnlock = unlockTimestamp - now;
    const minutesUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60));
    const hoursUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60 * 60));
    const daysUntilUnlock = Math.ceil(msUntilUnlock / (1000 * 60 * 60 * 24));

    await capsuleRef.set({
      capsuleId: capsuleRef.id,
      userId: req.uid,
      message,
      createdAt: now,
      unlockDate: unlockTimestamp,
      timezone: timezone || 'UTC',
      durationType: durationType || 'date',
      durationValue: durationValue || null,
      currentMood: currentMood || null,
      currentGoals: currentGoals || [],
      isUnlocked: false,
      unlockedAt: null,
      notificationSent: false
    });

    res.json({
      capsuleId: capsuleRef.id,
      unlockDate: unlockTimestamp.toISOString(),
      daysUntilUnlock,
      hoursUntilUnlock,
      minutesUntilUnlock
    });
  } catch (err) {
    console.error("Error creating time capsule:", err);
    res.status(500).json({ error: "Failed to create time capsule" });
  }
});
```

---

## Testing

After making these changes:

1. Restart your backend server
2. The existing 1-minute capsule should immediately unlock (since it's already past the unlock time)
3. Create a new 1-minute capsule to test the countdown
4. It should unlock exactly 1 minute after creation

---

## Optional: Frontend Display Update

You can update your frontend to show more precise time remaining:

```javascript
// In your TimeCapsuleUI component
const getTimeRemaining = (capsule) => {
  if (capsule.minutesUntilUnlock <= 60) {
    return `${capsule.minutesUntilUnlock} minute${capsule.minutesUntilUnlock !== 1 ? 's' : ''}`;
  } else if (capsule.hoursUntilUnlock <= 48) {
    return `${capsule.hoursUntilUnlock} hour${capsule.hoursUntilUnlock !== 1 ? 's' : ''}`;
  } else {
    return `${capsule.daysUntilUnlock} day${capsule.daysUntilUnlock !== 1 ? 's' : ''}`;
  }
};
```
