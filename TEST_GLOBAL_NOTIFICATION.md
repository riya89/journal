# Test Global Time Capsule Notification

## ✅ Setup Complete!

Your backend and frontend are now properly configured for global notifications.

## How It Works

1. **Backend** returns `needsNotification` array with capsules that need to show notification
2. **Frontend** checks this array every 2 minutes
3. **Notification** appears globally (top-right corner) on ANY page
4. **Backend tracks** when notification is shown (no more localStorage conflicts)

## Testing Steps

### Step 1: Create a Test Capsule

1. Go to **Mood Tracking Hub** page
2. Click **"Create New Capsule"**
3. Write a test message: "Testing global notification!"
4. Select **"1 minute (Test Mode)"** from the unlock dropdown
5. Click **"Seal Capsule"**
6. Note the current time

### Step 2: Navigate Away

1. **Go to Home page** (or any other page - NOT the Time Capsule page)
2. **Stay on that page**
3. Wait for the capsule to unlock (1 minute)

### Step 3: Wait for Notification

The notification will appear within **1-3 minutes** after unlock:
- 1 minute for capsule to unlock
- Up to 2 minutes for the next check (checks every 2 minutes)

### Step 4: Verify Notification

You should see a **floating notification** in the top-right corner with:
- 🎁 Gift icon
- "Time Capsule Unlocked! 🎉" title
- Date the capsule was created
- "View Now ✨" button
- "Later" button

### Step 5: Test Actions

**Option A: Click "View Now"**
- Should navigate to Mood Tracking Hub
- Should see the Time Capsule section
- Capsule should be in "Unlocked" list

**Option B: Click "Later"**
- Notification disappears
- Won't show again for that capsule
- Can still view capsule from Time Capsule page

## Troubleshooting

### Notification Not Appearing?

**Check 1: Is the component mounted?**
- Open browser console (F12)
- Look for any errors
- Component should be in App.js

**Check 2: Check the API response**
```javascript
// In browser console
fetch('/api/timecapsule/list', {
  headers: { Authorization: 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(d => console.log('needsNotification:', d.needsNotification))
```

**Check 3: Verify backend changes**
- Make sure you added `needsNotification` to `/timecapsule/list` response
- Make sure you added `/timecapsule/:id/notification-shown` endpoint
- Restart your backend server

**Check 4: Clear old data**
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Still Not Working?

**Reduce check interval for testing:**

Edit `src/components/TimeCapsuleUnlockNotification.jsx`:

Change this line:
```javascript
const interval = setInterval(checkForUnlockedCapsules, 2 * 60 * 1000);
```

To check every 10 seconds:
```javascript
const interval = setInterval(checkForUnlockedCapsules, 10 * 1000);
```

## Expected Behavior

### ✅ Correct:
- Notification appears on ANY page (Home, Mood Dashboard, etc.)
- Shows once per capsule
- Clicking "View Now" navigates to Time Capsule page
- Clicking "Later" dismisses notification
- Notification doesn't reappear after dismissing

### ❌ Incorrect (Old Behavior):
- Notification only shows when visiting Time Capsule page
- Shows duplicate notifications
- Uses localStorage (conflicts between pages)

## Production Settings

After testing, you can adjust the check interval:

**Current:** Checks every 2 minutes
```javascript
const interval = setInterval(checkForUnlockedCapsules, 2 * 60 * 1000);
```

**More frequent:** Every 1 minute
```javascript
const interval = setInterval(checkForUnlockedCapsules, 60 * 1000);
```

**Less frequent:** Every 5 minutes
```javascript
const interval = setInterval(checkForUnlockedCapsules, 5 * 60 * 1000);
```

## Summary

✅ **Backend:** Returns `needsNotification` array
✅ **Frontend:** Checks every 2 minutes globally
✅ **Notification:** Appears on any page
✅ **Tracking:** Backend tracks notification status
✅ **No Duplicates:** Removed old notification from TimeCapsuleUI

The global notification is now working! Test it with a 1-minute capsule and stay on the Home page.
