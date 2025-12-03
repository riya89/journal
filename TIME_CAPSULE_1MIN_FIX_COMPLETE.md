# Time Capsule 1-Minute Fix - Complete Solution

## The Problem

When you set a 1-minute time capsule, it was showing **469 minutes (8 hours)** remaining instead of 1 minute. This happened because:

1. **Frontend Issue**: The value `0.0007` days was being used with `setDate()`, which doesn't handle fractional days properly
2. **Backend Issue**: The create endpoint always set unlock time to **end of day (23:59:59)**, even for short durations

## The Solution

### Frontend Changes (CreateCapsuleModal.jsx) ✅ DONE

Changed the unlock period format from fractional days to a string format like `"1m"`, `"5m"`, `"1h"`, `"30d"`:

**Key Changes:**
1. Changed `unlockPeriod` state from number to string format
2. Added proper parsing for minutes (m), hours (h), and days (d)
3. Calculate exact unlock timestamp based on current time + duration
4. Send `durationType` and `durationValue` to backend

**New Options:**
- `"1m"` = 1 minute
- `"5m"` = 5 minutes  
- `"1h"` = 1 hour
- `"24h"` = 24 hours
- `"30d"` = 30 days
- `"90d"` = 90 days
- `"365d"` = 365 days

### Backend Changes Needed

You need to update **3 endpoints** in your backend:

#### 1. `/timecapsule/create` - Handle short durations

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

    // ✅ Handle different duration types
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

#### 2. `/timecapsule/list` - Fix unlock comparison

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

      // ✅ Compare raw timestamps
      const isUnlocked = now >= unlockDate || capsule.isUnlocked;

      if (isUnlocked) {
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          timezone: userTimezone
        });
      } else {
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

#### 3. `/timecapsule/:capsuleId` - Fix unlock check

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

    // ✅ Compare raw timestamps
    const now = new Date();
    const isLocked = now < unlockDate && !capsule.isUnlocked;

    if (isLocked) {
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

## Testing Steps

1. **Apply frontend changes** ✅ (Already done)
2. **Apply backend changes** (Update your 3 endpoints)
3. **Restart backend server**
4. **Delete old test capsules** (they have wrong unlock times)
5. **Create new 1-minute capsule**
6. **Wait 1 minute**
7. **Refresh the page** - capsule should be unlocked!

## Expected Behavior

### Before Fix:
- 1-minute capsule shows "469 minutes remaining" (8 hours)
- Unlocks at 11:59 PM instead of 1 minute later

### After Fix:
- 1-minute capsule shows "1 minute remaining"
- Unlocks exactly 1 minute after creation
- 5-minute capsule shows "5 minutes remaining"
- Hour/day capsules work correctly too

## Why This Works

1. **Frontend**: Sends exact unlock timestamp calculated from current time + duration
2. **Backend**: Uses the exact timestamp provided, no more "end of day" for short durations
3. **Comparison**: Compares raw timestamps (`now >= unlockDate`), which is timezone-agnostic and works for any duration

## Optional: Frontend Display Enhancement

You can update your TimeCapsuleUI to show more precise time:

```javascript
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

This will show:
- "1 minute" for < 1 hour
- "5 hours" for < 48 hours  
- "30 days" for longer durations
