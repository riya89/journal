# Where to Add Backend Code - Step by Step

## Your Backend File Location

Your time capsule endpoints are in: **`backend/routes/journal.js`**

## Step-by-Step Instructions

### Step 1: Open Your Backend File

Open `backend/routes/journal.js` in your editor.

### Step 2: Find Your Existing Time Capsule Endpoints

Search for these lines in your file:
```javascript
router.get("/timecapsule/list"
```
or
```javascript
router.get("/timecapsule/:capsuleId"
```

### Step 3: Apply the Changes

Open the file `BACKEND_TIMECAPSULE_NOTIFICATION_ENDPOINTS.js` I just created.

It shows you:
1. **What to MODIFY** (existing endpoints)
2. **What to ADD** (new endpoint)
3. **Exact code** to use

### Step 4: Make These 3 Changes

#### Change 1: Update `/timecapsule/list` endpoint

**Find this in your backend:**
```javascript
router.get("/timecapsule/list", verifyToken, async (req, res) => {
  // ... your existing code
  res.json({ locked, unlocked });
});
```

**Change the response to:**
```javascript
res.json({ 
  locked, 
  unlocked,
  needsNotification: unlocked.filter(c => !c.notificationShown && !c.viewedAt)
});
```

#### Change 2: Add NEW endpoint (after `/timecapsule/list`)

**Add this entire new endpoint:**
```javascript
router.post("/timecapsule/:capsuleId/notification-shown", verifyToken, async (req, res) => {
  try {
    const { capsuleId } = req.params;
    const capsuleRef = db.collection("users").doc(req.uid)
      .collection("timeCapsules").doc(capsuleId);
    
    await capsuleRef.update({
      notificationShown: true,
      notificationShownAt: new Date()
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update" });
  }
});
```

#### Change 3: Update view capsule endpoint

**Find this in your backend:**
```javascript
router.get("/timecapsule/:capsuleId", verifyToken, async (req, res) => {
  // ... check if unlocked ...
  
  // ADD THIS LINE before sending response:
  await capsuleRef.update({
    viewedAt: new Date(),
    notificationShown: true  // ADD THIS LINE
  });
  
  res.json({ capsuleId, ...capsule });
});
```

### Step 5: Save and Restart Backend

```bash
# If using nodemon (auto-restart)
# Just save the file

# If not using nodemon
# Stop your backend (Ctrl+C)
# Start it again
npm start
```

### Step 6: Test

1. Create a capsule with 1-minute unlock
2. Wait for unlock
3. Stay on Home page
4. Notification should appear after up to 2 minutes
5. Click "Later" or "View Now"
6. Notification won't show again

## Quick Summary

**File to edit:** `backend/routes/journal.js`

**Changes:**
1. Modify `/timecapsule/list` - add `needsNotification` to response
2. Add new `/timecapsule/:id/notification-shown` endpoint
3. Modify `/timecapsule/:id` view endpoint - add `notificationShown: true`

**Result:** 
- Backend tracks which capsules need notifications
- No more localStorage conflicts
- Works across all devices
- Notification shows once per capsule

## If You Get Stuck

The complete code with all changes is in:
- `BACKEND_TIMECAPSULE_NOTIFICATION_ENDPOINTS.js`

Just copy the relevant sections to your `backend/routes/journal.js` file!
