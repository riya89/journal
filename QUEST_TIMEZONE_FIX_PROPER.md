# Proper Quest Timezone Fix

## The Problem

Your quest expiration is returning 0 expired quests because the timezone conversion logic is flawed. Using `toLocaleString()` and then creating a new Date from it doesn't preserve timezone information correctly.

## The Solution

Use the `date-fns-tz` library for proper timezone handling.

### Step 1: Install Required Package

```bash
npm install date-fns date-fns-tz
```

### Step 2: Add Imports at Top of Backend File

Add these imports at the top of your `journal.js` file (with your other imports):

```javascript
import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import { endOfDay, endOfWeek, endOfMonth, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
```

Note: `date-fns-tz` v3.x uses `toZonedTime` and `fromZonedTime` instead of the old names.

### Step 3: Replace Timezone Functions in Backend

Replace your `calculateExpirationDate` and `shouldGenerateNewQuests` functions with these:

/**
 * Calculate expiration date for quest period based on user's timezone
 * Returns UTC timestamp that represents end of period in user's timezone
 */
function calculateExpirationDate(period, userTimezone = 'UTC') {
  // Get current time in user's timezone
  const nowInUserTZ = toZonedTime(new Date(), userTimezone);
  
  let endTime;
  
  switch (period) {
    case 'daily':
      // End of day in user's timezone
      endTime = endOfDay(nowInUserTZ);
      break;
      
    case 'weekly':
      // End of week (Saturday) in user's timezone
      endTime = endOfWeek(nowInUserTZ, { weekStartsOn: 0 }); // Sunday = 0
      break;
      
    case 'monthly':
      // End of month in user's timezone
      endTime = endOfMonth(nowInUserTZ);
      break;
      
    default:
      endTime = nowInUserTZ;
  }
  
  // Convert back to UTC for storage
  return fromZonedTime(endTime, userTimezone);
}

/**
 * Check if new quests should be generated for a period
 */
function shouldGenerateNewQuests(lastGeneration, period, userTimezone = 'UTC') {
  if (!lastGeneration) return true;
  
  const now = new Date();
  const lastGen = new Date(lastGeneration);
  
  // Convert both to user's timezone
  const nowInUserTZ = toZonedTime(now, userTimezone);
  const lastGenInUserTZ = toZonedTime(lastGen, userTimezone);
  
  switch (period) {
    case 'daily':
      return !isSameDay(nowInUserTZ, lastGenInUserTZ);
      
    case 'weekly':
      return !isSameWeek(nowInUserTZ, lastGenInUserTZ, { weekStartsOn: 0 });
      
    case 'monthly':
      return !isSameMonth(nowInUserTZ, lastGenInUserTZ);
      
    default:
      return false;
  }
}
```

### Step 4: Fix Quest Expiration Check Endpoint

Update your `/quests/check-expiration` endpoint:

```javascript
/**
 * POST /journal/quests/check-expiration
 * Check for expired quests and generate new ones
 */
router.post("/quests/check-expiration", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    // Get user's timezone
    const userTimezone = userData.timezone || 'UTC';
    const now = new Date();
    
    // Get current time in user's timezone for logging
    const nowInUserTZ = toZonedTime(now, userTimezone);
    console.log(`🕐 Checking expiration for user ${userId} at ${format(nowInUserTZ, 'yyyy-MM-dd HH:mm:ss zzz', { timeZone: userTimezone })}`);
    
    // Find expired quests
    const questsRef = userRef.collection("quests");
    const activeQuests = await questsRef
      .where("status", "==", "active")
      .get();
    
    const expiredQuests = [];
    const batch = db.batch();
    
    activeQuests.forEach(doc => {
      const quest = doc.data();
      const expiresAt = quest.expiresAt.toDate ? quest.expiresAt.toDate() : new Date(quest.expiresAt);
      
      // Check if quest has expired (expiresAt is in UTC)
      if (expiresAt <= now) {
        console.log(`⏰ Quest expired: ${quest.title} (expired at ${expiresAt.toISOString()})`);
        batch.update(doc.ref, {
          status: 'expired',
          expiredAt: now
        });
        expiredQuests.push({ id: doc.id, ...quest });
      }
    });
    
    await batch.commit();
    
    // Generate new quests if needed
    const newQuests = await checkAndGenerateQuests(userId);
    
    console.log(`✅ Expired ${expiredQuests.length} quest(s), generated ${newQuests.length} new quest(s)`);
    
    res.json({
      success: true,
      expiredQuests,
      newQuests,
      message: `Expired ${expiredQuests.length} quest(s) and generated ${newQuests.length} new quest(s)`
    });
  } catch (err) {
    console.error("Error checking quest expiration:", err);
    res.status(500).json({ error: "Failed to check quest expiration" });
  }
});
```

## Why This Works

1. **date-fns-tz** properly handles timezone conversions
2. **toZonedTime** converts UTC timestamps to user's local time
3. **fromZonedTime** converts user's local time back to UTC for storage
4. **isSameDay/Week/Month** correctly compares dates in the user's timezone
5. All dates are stored in UTC in the database, but calculations happen in user's timezone

## Testing

After implementing, test with:
1. User in different timezone (e.g., Asia/Kolkata = UTC+5:30)
2. Create a daily quest
3. Wait for it to expire (or manually set expiresAt to past date)
4. Call `/quests/check-expiration`
5. Should see quest marked as expired and new quest generated
