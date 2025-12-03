// ============================================
// QUICK FIX FOR TIME CAPSULE TIMEZONE
// Paste this into your backend/routes/journal.js
// ============================================

// STEP 1: Add this import at the top of your file (if not already there)
import { toZonedTime } from 'date-fns-tz';

// STEP 2: REPLACE your /timecapsule/list endpoint with this:

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
      
      // ✅ Check if unlocked (compare actual Date objects, not just dates)
      const isUnlocked = nowInUserTZ >= unlockInUserTZ || capsule.isUnlocked;

      if (isUnlocked) {
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          timezone: userTimezone
        });
      } else {
        const daysUntilUnlock = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24));
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

// STEP 3: REPLACE your /timecapsule/:capsuleId endpoint with this:

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
      const daysUntilUnlock = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24));
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

// STEP 4: UPDATE your /timecapsule/create endpoint to store timezone:

router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals, timezone } = req.body;
    
    if (!message || !unlockDate) {
      return res.status(400).json({ error: "Message and unlock date required" });
    }

    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc();
    
    // Parse the unlock date and set to end of day
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
      timezone: timezone || 'UTC', // ✅ Store timezone
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

// ============================================
// INSTALLATION INSTRUCTIONS
// ============================================

/*
1. Make sure you have date-fns-tz installed:
   npm install date-fns-tz

2. Add the import at the top of backend/routes/journal.js:
   import { toZonedTime } from 'date-fns-tz';

3. Replace the three endpoints above

4. Restart your backend server

5. Test by creating a new 1-minute capsule

6. The capsule should unlock after 1 minute in YOUR timezone!
*/
