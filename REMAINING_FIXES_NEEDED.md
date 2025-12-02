# Remaining Fixes Needed

## ✅ Already Fixed:
1. Removed "Current Streak" from celebration modal
2. Removed "Share" button
3. Removed 3 streak badges (Week Streak, Month Streak, Century Streak)

## ❌ Still Need to Fix:

### 1. **Quest Timezone Issue**
**Problem:** Quests showing yesterday's quests (timezone mismatch)

**Backend Fix Needed:**
Your backend uses server timezone (likely UTC). You need to use user's local timezone.

**Option A - Quick Fix (Frontend):**
Pass timezone offset from frontend when checking quests:
```javascript
// In frontend when fetching quests
const timezoneOffset = new Date().getTimezoneOffset();
await fetch(`/quests/active?timezone=${timezoneOffset}`);
```

**Option B - Backend Fix:**
Update quest expiration logic to use a specific timezone (e.g., your local timezone).

### 2. **Badge Unlocking Issue**
**Problem:** You have 7 perfect days but "Week Warrior" badge shows as locked

**Root Cause:** Badge checking logic isn't being called with your user stats.

**Fix:** The `BadgeGallery` component needs to:
1. Fetch user stats (`perfectDays`, `questsCompleted`, `currentLevel`, `longestStreak`)
2. Call `checkEarnedBadges(userStats)` to determine which badges should be unlocked
3. Combine the result with `earnedBadges` array from backend

**Where to fix:** Wherever `BadgeGallery` is rendered (likely in `GrowthGarden.jsx` or `Home.jsx`), you need to:

```javascript
import { checkEarnedBadges } from '../constants/badges';

// Fetch user stats
const [userStats, setUserStats] = useState(null);

useEffect(() => {
  async function fetchStats() {
    const response = await apiGet('/user/stats');
    const data = await response.json();
    setUserStats(data);
  }
  fetchStats();
}, []);

// Calculate which badges should be unlocked
const unlockedBadges = userStats ? checkEarnedBadges(userStats) : [];

// Pass to BadgeGallery
<BadgeGallery 
  earnedBadges={unlockedBadges} 
  theme={theme} 
/>
```

## Summary:

1. **Timezone:** Backend needs to handle user timezone or frontend needs to pass it
2. **Badges:** Frontend needs to call `checkEarnedBadges()` with user stats before passing to `BadgeGallery`

The badge system logic is correct - it just needs the stats to check against!
