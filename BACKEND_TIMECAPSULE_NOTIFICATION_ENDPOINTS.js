// ============================================
// TIME CAPSULE NOTIFICATION BACKEND ENDPOINTS
// ============================================
// Add these to your backend/routes/journal.js file
// (or wherever your time capsule endpoints are)

// ============================================
// 1. UPDATE EXISTING /timecapsule/list ENDPOINT
// ============================================
// FIND your existing endpoint that looks like:
// router.get("/timecapsule/list", verifyToken, async (req, res) => { ... })
//
// REPLACE IT WITH THIS:

router.get("/timecapsule/list", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;
    const capsulesRef = db.collection("users").doc(uid).collection("timeCapsules");
    const snapshot = await capsulesRef.get();
    
    const now = new Date();
    const locked = [];
    const unlocked = [];
    const needsNotification = []; // ✅ NEW ARRAY
    
    snapshot.forEach(doc => {
      const capsule = { capsuleId: doc.id, ...doc.data() };
      const unlockDate = new Date(capsule.unlockDate);
      
      if (now >= unlockDate) {
        unlocked.push(capsule);
        
        // ✅ NEW: Check if notification needs to be shown
        // Show notification if:
        // 1. notificationShown is false (or doesn't exist)
        // 2. User hasn't viewed it yet
        if (!capsule.notificationShown && !capsule.viewedAt) {
          needsNotification.push(capsule);
        }
      } else {
        locked.push(capsule);
      }
    });
    
    res.json({ 
      locked, 
      unlocked,
      needsNotification // ✅ NEW FIELD - frontend will use this
    });
  } catch (err) {
    console.error("Error fetching capsules:", err);
    res.status(500).json({ error: "Failed to fetch capsules" });
  }
});

// ============================================
// 2. ADD NEW ENDPOINT - Mark Notification as Shown
// ============================================
// ADD THIS NEW ENDPOINT (place it after /timecapsule/list):

router.post("/timecapsule/:capsuleId/notification-shown", verifyToken, async (req, res) => {
  try {
    const { capsuleId } = req.params;
    const uid = req.uid;
    
    // Update in Firestore
    const capsuleRef = db.collection("users").doc(uid)
      .collection("timeCapsules").doc(capsuleId);
    
    const capsuleDoc = await capsuleRef.get();
    if (!capsuleDoc.exists) {
      return res.status(404).json({ error: "Capsule not found" });
    }
    
    // Mark notification as shown
    await capsuleRef.update({
      notificationShown: true,
      notificationShownAt: new Date()
    });
    
    console.log(`✅ Marked notification as shown for capsule ${capsuleId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notification as shown:", err);
    res.status(500).json({ error: "Failed to update notification status" });
  }
});

// ============================================
// 3. UPDATE EXISTING VIEW CAPSULE ENDPOINT
// ============================================
// FIND your existing endpoint that looks like:
// router.get("/timecapsule/:capsuleId", verifyToken, async (req, res) => { ... })
//
// ADD THESE LINES when user views a capsule:

router.get("/timecapsule/:capsuleId", verifyToken, async (req, res) => {
  try {
    const { capsuleId } = req.params;
    const uid = req.uid;
    
    const capsuleRef = db.collection("users").doc(uid)
      .collection("timeCapsules").doc(capsuleId);
    const doc = await capsuleRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Capsule not found" });
    }
    
    const capsule = doc.data();
    const unlockDate = new Date(capsule.unlockDate);
    const now = new Date();
    
    if (now < unlockDate) {
      return res.status(403).json({ 
        error: "Capsule is still locked",
        unlockDate: capsule.unlockDate 
      });
    }
    
    // ✅ NEW: Mark as viewed AND notification as shown
    await capsuleRef.update({
      viewedAt: new Date(),
      notificationShown: true // Also mark notification as shown when viewed
    });
    
    res.json({ capsuleId, ...capsule });
  } catch (err) {
    console.error("Error viewing capsule:", err);
    res.status(500).json({ error: "Failed to load capsule" });
  }
});

// ============================================
// MIGRATION SCRIPT (OPTIONAL)
// ============================================
// Run this ONCE to add the notificationShown field to existing capsules
// You can create a separate endpoint or run this manually

async function migrateCapsules() {
  try {
    const usersSnapshot = await db.collection("users").get();
    let updated = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const capsulesSnapshot = await userDoc.ref.collection("timeCapsules").get();
      
      for (const capsuleDoc of capsulesSnapshot.docs) {
        const capsule = capsuleDoc.data();
        
        // If capsule doesn't have the field, add it
        if (capsule.notificationShown === undefined) {
          await capsuleDoc.ref.update({
            notificationShown: capsule.viewedAt ? true : false,
            notificationShownAt: capsule.viewedAt || null
          });
          updated++;
        }
      }
    }
    
    console.log(`✅ Migrated ${updated} capsules`);
  } catch (err) {
    console.error("Migration error:", err);
  }
}

// To run migration, add this temporary endpoint:
router.post("/timecapsule/migrate", verifyToken, async (req, res) => {
  // Only allow admin users or remove after running once
  await migrateCapsules();
  res.json({ success: true, message: "Migration complete" });
});

// ============================================
// SUMMARY OF CHANGES
// ============================================
/*
1. MODIFIED /timecapsule/list
   - Added needsNotification array
   - Returns capsules that need notification shown

2. ADDED /timecapsule/:id/notification-shown
   - Marks notification as shown when user sees it
   - Called by frontend after showing notification

3. MODIFIED /timecapsule/:id (view endpoint)
   - Marks notificationShown when user views capsule
   - Prevents notification from showing again

4. OPTIONAL: Migration script
   - Adds notificationShown field to existing capsules
   - Run once after deploying

TESTING:
1. Create a capsule with 1-minute unlock
2. Wait for unlock
3. Check /timecapsule/list - should have needsNotification array
4. Frontend shows notification
5. Frontend calls /timecapsule/:id/notification-shown
6. Check /timecapsule/list again - needsNotification should be empty
*/
