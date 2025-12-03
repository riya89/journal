# Time Capsule Notification - Backend Solution

## Problem
Using localStorage to track notifications causes issues:
- Two different components showing notifications
- localStorage is client-side only (doesn't sync across devices)
- Backend doesn't know if notification was shown
- Visiting Time Capsule page marks capsules as "seen" before global notification can show

## Solution: Backend-Tracked Notifications

Add a `notificationShown` field to time capsules in the backend.

### Backend Changes

#### 1. Add field to time capsule schema

When a capsule is created or unlocked, add:
```javascript
{
  capsuleId: "...",
  content: "...",
  unlockDate: "...",
  unlockedAt: "...",
  notificationShown: false,  // NEW FIELD
  viewedAt: null             // When user actually opened/viewed it
}
```

#### 2. Create new endpoint: Mark notification as shown

```javascript
// POST /timecapsule/:capsuleId/notification-shown
router.post("/timecapsule/:capsuleId/notification-shown", verifyToken, async (req, res) => {
  try {
    const { capsuleId } = req.params;
    const uid = req.uid;
    
    // Update in Firestore
    const capsuleRef = db.collection("users").doc(uid)
      .collection("timeCapsules").doc(capsuleId);
    
    await capsuleRef.update({
      notificationShown: true,
      notificationShownAt: new Date()
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notification as shown:", err);
    res.status(500).json({ error: "Failed to update notification status" });
  }
});
```

#### 3. Update /timecapsule/list endpoint

Modify the response to only include capsules where `notificationShown === false`:

```javascript
router.get("/timecapsule/list", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;
    const capsulesRef = db.collection("users").doc(uid).collection("timeCapsules");
    const snapshot = await capsulesRef.get();
    
    const now = new Date();
    const locked = [];
    const unlocked = [];
    const needsNotification = []; // NEW
    
    snapshot.forEach(doc => {
      const capsule = { capsuleId: doc.id, ...doc.data() };
      const unlockDate = new Date(capsule.unlockDate);
      
      if (now >= unlockDate) {
        unlocked.push(capsule);
        
        // Check if notification needs to be shown
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
      needsNotification // NEW - only capsules that need notification
    });
  } catch (err) {
    console.error("Error fetching capsules:", err);
    res.status(500).json({ error: "Failed to fetch capsules" });
  }
});
```

#### 4. Update view capsule endpoint

When user views a capsule, mark it:

```javascript
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
    
    // Mark as viewed
    await capsuleRef.update({
      viewedAt: new Date(),
      notificationShown: true // Also mark notification as shown
    });
    
    res.json({ capsuleId, ...capsule });
  } catch (err) {
    console.error("Error viewing capsule:", err);
    res.status(500).json({ error: "Failed to load capsule" });
  }
});
```

### Frontend Changes

#### Update TimeCapsuleUnlockNotification.jsx

```javascript
const checkForUnlockedCapsules = async () => {
  try {
    const response = await apiGet(`${API_BASE_URL}/timecapsule/list`);
    
    if (!response.ok) return;
    
    const data = await response.json();
    
    // Use backend's needsNotification array
    const newUnlock = data.needsNotification?.[0]; // Get first one
    
    if (newUnlock) {
      setUnlockedCapsule(newUnlock);
      setShowNotification(true);
      
      // Mark as shown in backend
      await apiPost(`${API_BASE_URL}/timecapsule/${newUnlock.capsuleId}/notification-shown`, {});
    }
  } catch (err) {
    console.error('Error checking for unlocked capsules:', err);
  }
};
```

#### Remove localStorage completely

No more `localStorage.getItem('seenUnlockedCapsules')` or `globalSeenUnlockedCapsules`.

#### Update TimeCapsuleUI.jsx

Remove the notification logic from this component entirely. It should only show the list of capsules, not notifications.

```javascript
// Remove this entire section:
const seenCapsules = JSON.parse(localStorage.getItem('seenUnlockedCapsules') || '[]');
const newUnlock = data.unlocked.find(c => !seenCapsules.includes(c.capsuleId));
// ... etc
```

### Benefits

1. **Single source of truth**: Backend tracks notification status
2. **Cross-device sync**: Works across all devices
3. **No duplicates**: Only one notification per capsule
4. **Proper separation**: 
   - Global notification = floating popup (shown once)
   - Time Capsule page = list view (always visible)
5. **Reliable**: Doesn't depend on localStorage which can be cleared

### Migration

For existing capsules without the `notificationShown` field:

```javascript
// Run once to migrate existing capsules
async function migrateCapsules() {
  const usersSnapshot = await db.collection("users").get();
  
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
      }
    }
  }
}
```

### Testing

1. Create a capsule with 1-minute unlock
2. Stay on Home page
3. After unlock, global notification should appear
4. Click "View Now" or "Later"
5. Notification should not appear again
6. Visit Time Capsule page - capsule should be in unlocked list
7. Open capsule - should work normally
8. Refresh page - no notification (already shown)
9. Test on different device - no notification (synced via backend)
