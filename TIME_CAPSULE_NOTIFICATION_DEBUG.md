# Time Capsule Global Notification - Debug Guide

## Issue
The notification only shows when visiting the Time Capsule page, not globally.

## Root Cause
Both `TimeCapsuleUI.jsx` and `TimeCapsuleUnlockNotification.jsx` were using the same localStorage key (`seenUnlockedCapsules`). When you visited the Time Capsule page first, it marked the capsule as seen, preventing the global notification from showing.

## Fix Applied
Changed the global notification to use a separate localStorage key: `globalSeenUnlockedCapsules`

## Testing Steps

### 1. Clear Old Data
Open browser console and run:
```javascript
localStorage.removeItem('seenUnlockedCapsules');
localStorage.removeItem('globalSeenUnlockedCapsules');
```

### 2. Create a Test Capsule
1. Go to Mood Tracking Hub
2. Create a time capsule with 1-minute unlock time
3. Note the current time

### 3. Test Global Notification
1. **Stay on Home page** (or any page except Time Capsule)
2. Wait for 1 minute for the capsule to unlock
3. Wait up to 2 more minutes (the check runs every 2 minutes)
4. The notification should appear in the top-right corner

### 4. Check Console Logs
You should see these logs:
```
TimeCapsuleUnlockNotification mounted for user: [your-uid]
Global notification check - unlocked capsules: [array]
New unlock found: [capsule object]
Showing global notification for capsule: [capsule-id]
```

### 5. Test Navigation
1. Click "View Now" button
2. Should navigate to `/mood-tracking-hub`
3. Should see the Time Capsule section

### 6. Test Dismissal
1. Create another test capsule
2. Wait for it to unlock
3. Click "Later" button
4. Notification should disappear
5. Should not reappear (marked as seen)

## Troubleshooting

### Notification Not Appearing?

**Check 1: Component Mounted?**
```javascript
// In browser console, check if component is in the DOM
document.querySelector('.fixed.top-20.right-4')
```

**Check 2: API Response**
```javascript
// Check what the API returns
fetch('/api/timecapsule/list', {
  headers: { Authorization: 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(d => console.log('Capsules:', d))
```

**Check 3: localStorage**
```javascript
// Check what's stored
console.log('Global seen:', localStorage.getItem('globalSeenUnlockedCapsules'));
console.log('Page seen:', localStorage.getItem('seenUnlockedCapsules'));
```

### Still Not Working?

**Option 1: Force Immediate Check**
Change the interval to check more frequently (for testing):
```javascript
// In TimeCapsuleUnlockNotification.jsx
const interval = setInterval(checkForUnlockedCapsules, 10 * 1000); // Check every 10 seconds
```

**Option 2: Manual Trigger**
Add a test button to manually trigger the check:
```javascript
// Add to your Home page temporarily
<button onClick={() => {
  localStorage.removeItem('globalSeenUnlockedCapsules');
  window.location.reload();
}}>
  Reset Capsule Notifications
</button>
```

## How It Works Now

### Two Separate Tracking Systems:

1. **Global Notification** (`globalSeenUnlockedCapsules`)
   - Tracks capsules shown in the floating notification
   - Appears on ANY page
   - Checks every 2 minutes
   - Shows once per capsule

2. **Page Notification** (`seenUnlockedCapsules`)
   - Tracks capsules shown on the Time Capsule page
   - Only appears when visiting that page
   - Shows immediately when page loads
   - Independent from global notification

### Flow:
1. User creates capsule with 1-minute unlock
2. User stays on Home page
3. After 1 minute, capsule unlocks in backend
4. Within 2 minutes, global notification checks and finds it
5. Notification appears in top-right corner
6. User can click "View Now" or "Later"
7. Capsule ID is saved to `globalSeenUnlockedCapsules`
8. Notification won't show again for that capsule

## Production Considerations

### Adjust Check Interval
For production, you might want to adjust the check frequency:
```javascript
// More frequent (every 1 minute)
const interval = setInterval(checkForUnlockedCapsules, 60 * 1000);

// Less frequent (every 5 minutes)
const interval = setInterval(checkForUnlockedCapsules, 5 * 60 * 1000);
```

### Add User Preference
Allow users to disable notifications:
```javascript
const notificationsEnabled = localStorage.getItem('capsuleNotificationsEnabled') !== 'false';
if (!notificationsEnabled) return;
```

### Add Sound/Badge
Enhance the notification:
```javascript
if (newUnlock) {
  // Play sound
  new Audio('/notification.mp3').play();
  
  // Update page title
  document.title = '🎁 Time Capsule Unlocked!';
  
  // Show notification
  setShowNotification(true);
}
```
