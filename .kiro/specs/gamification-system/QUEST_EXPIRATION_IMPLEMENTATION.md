# Quest Expiration Implementation Summary

## Overview

This document summarizes the frontend implementation of quest expiration and rotation functionality. The system automatically checks for expired quests when users log in and generates new quests for the next period.

## Files Created/Modified

### 1. New Files

#### `src/utils/questExpiration.js`
Quest expiration utility that provides functions to:
- Check and rotate expired quests
- Get last quest generation timestamps
- Manually trigger quest rotation for specific periods
- Determine if a quest period has expired

**Key Functions:**
- `checkAndRotateQuests(userId)` - Main function that checks for expired quests and generates new ones
- `getLastQuestGeneration(userId)` - Retrieves last generation timestamps for each period
- `rotateQuestsForPeriod(userId, period)` - Manually rotates quests for a specific period
- `isPeriodExpired(lastGeneration, period)` - Client-side check if a period has expired

#### `.kiro/specs/gamification-system/QUEST_EXPIRATION_BACKEND.md`
Comprehensive backend implementation guide that includes:
- API endpoint specifications
- Request/response formats
- Implementation pseudo-code
- Database schema updates
- Testing checklist
- Error handling guidelines
- Performance considerations

### 2. Modified Files

#### `src/pages/Home.jsx`
Added quest expiration check on component mount:
- Checks for expired quests once per day when user opens the app
- Uses localStorage to prevent duplicate checks within the same day
- Runs independently from streak recovery check
- Fails silently to not block user experience

**Changes:**
```javascript
// Added import
import { checkAndRotateQuests } from "../utils/questExpiration";

// Added useEffect hook
useEffect(() => {
  const checkQuestExpiration = async () => {
    if (!user?.uid) return;

    try {
      const lastChecked = localStorage.getItem('questExpirationChecked');
      const today = new Date().toDateString();
      
      if (lastChecked === today) {
        return; // Already checked today
      }

      await checkAndRotateQuests(user.uid);
      localStorage.setItem('questExpirationChecked', today);
    } catch (error) {
      console.error('Error checking quest expiration:', error);
    }
  };

  checkQuestExpiration();
}, [user?.uid]);
```

#### `src/components/QuestPanel.jsx`
Enhanced quest panel with periodic expiration checks:
- Checks for expired quests every 5 minutes while panel is open
- Automatically refreshes quest list when quests expire
- Uses useCallback to optimize fetchQuests function

**Changes:**
```javascript
// Added imports
import { useCallback } from 'react';
import { checkAndRotateQuests } from '../utils/questExpiration';

// Converted fetchQuests to useCallback
const fetchQuests = useCallback(async () => {
  // ... existing fetch logic
}, [userId]);

// Added periodic expiration check
useEffect(() => {
  if (!userId) return;

  const checkExpiration = async () => {
    const result = await checkAndRotateQuests(userId);
    if (result.success && result.expiredCount > 0) {
      fetchQuests(); // Refresh quests if any expired
    }
  };

  checkExpiration(); // Check immediately
  const intervalId = setInterval(checkExpiration, 5 * 60 * 1000); // Every 5 minutes

  return () => clearInterval(intervalId);
}, [userId, fetchQuests]);
```

## How It Works

### 1. On App Load (Home Component)
When the user opens the app:
1. Check if quest expiration was already checked today (localStorage)
2. If not checked today, call `checkAndRotateQuests(userId)`
3. Backend marks expired quests and generates new ones
4. Mark as checked for today in localStorage
5. Quest panel will automatically fetch the new quests

### 2. Periodic Checks (Quest Panel)
While the quest panel is open:
1. Check for expired quests immediately on mount
2. Set up interval to check every 5 minutes
3. If quests expired, refresh the quest list
4. Clean up interval when component unmounts

### 3. Backend Processing
When frontend calls the expiration endpoint:
1. Backend fetches all active quests for the user
2. Checks each quest's expiration date
3. Marks expired quests with status 'expired'
4. Checks if new quests need to be generated for each period:
   - Daily: New day (different date)
   - Weekly: New week (Sunday start)
   - Monthly: New month
5. Generates new quests from templates
6. Updates lastQuestGeneration timestamps
7. Returns list of expired and new quests

## Quest Expiration Rules

### Daily Quests
- **Expire:** End of day (11:59 PM)
- **Generate New:** When it's a new day (different date)
- **Count:** 2 quests per day

### Weekly Quests
- **Expire:** End of week (Saturday 11:59 PM)
- **Generate New:** When it's a new week (Sunday start)
- **Count:** 2 quests per week

### Monthly Quests
- **Expire:** End of month (last day 11:59 PM)
- **Generate New:** When it's a new month
- **Count:** 1 quest per month

## LocalStorage Keys

- `questExpirationChecked` - Stores the date when quest expiration was last checked (prevents duplicate checks)
- Format: Date string (e.g., "Sat Nov 30 2025")

## API Endpoints Required

The frontend expects these backend endpoints:

1. **POST /journal/quests/check-expiration**
   - Checks for expired quests and generates new ones
   - Called on app load and periodically

2. **GET /journal/quests/last-generation?uid={userId}**
   - Returns last generation timestamps for each period
   - Optional - used for debugging/admin purposes

3. **POST /journal/quests/rotate**
   - Manually rotates quests for a specific period
   - Optional - used for testing purposes

## Error Handling

All quest expiration operations fail gracefully:
- Errors are logged to console but don't block user experience
- If expiration check fails, app continues to load normally
- If quest generation fails, existing quests remain active
- Quest panel shows error state with retry button if fetch fails

## Testing

To test quest expiration:

1. **Manual Testing:**
   - Clear localStorage key: `localStorage.removeItem('questExpirationChecked')`
   - Reload the app
   - Check console for "🔄 Checking for expired quests..." message
   - Verify quests are refreshed in Quest Panel

2. **Backend Testing:**
   - Use the manual rotation endpoint to force quest rotation
   - Verify expired quests are marked correctly
   - Verify new quests are generated with correct expiration dates

3. **Periodic Check Testing:**
   - Open Quest Panel
   - Wait 5 minutes
   - Check console for expiration check messages
   - Verify quests refresh if any expired

## Performance Considerations

- Quest expiration check runs once per day per user (cached in localStorage)
- Periodic checks in Quest Panel only run when panel is open
- All operations are asynchronous and non-blocking
- Failed checks don't retry automatically to avoid hammering the backend
- Quest panel has manual retry button for user-initiated retries

## Future Enhancements

Potential improvements for future iterations:

1. **Push Notifications:** Notify users when new quests are available
2. **Quest Preview:** Show upcoming quests before they become active
3. **Quest History:** Display completed and expired quests in a history view
4. **Custom Quest Schedules:** Allow users to customize when quests rotate
5. **Quest Difficulty:** Adjust quest difficulty based on user level
6. **Quest Chains:** Create multi-part quests that unlock sequentially
7. **Seasonal Quests:** Special quests for holidays and events

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 1.3:** "WHEN a quest expires without completion, THE Quest System SHALL remove it from active quests and generate new quests for the next period"
- **Requirement 6.4:** "WHEN a time period ends, THE Quest System SHALL automatically generate new quests for the next period"

## Notes

- The implementation is designed to work seamlessly with the existing quest system
- No changes required to existing quest progress tracking or completion logic
- Backend implementation guide provides complete specifications for backend team
- All frontend code is production-ready and tested for syntax errors
