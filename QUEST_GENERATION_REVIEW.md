# Quest Generation Code Review

## Your Current Code

```javascript
async function checkAndGenerateQuests(userId) {
  const now = new Date();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};
  const lastGen = userData.lastQuestGeneration || {};
  const newQuests = [];

  // Check daily
  if (shouldGenerateNewQuests(lastGen.daily, 'daily')) {
    const dailyQuests = await generateQuestsForPeriod(userId, 'daily');
    newQuests.push(...dailyQuests);
    lastGen.daily = now.toISOString();
  }

  // Check weekly
  if (shouldGenerateNewQuests(lastGen.weekly, 'weekly')) {
    const weeklyQuests = await generateQuestsForPeriod(userId, 'weekly');
    newQuests.push(...weeklyQuests);
    lastGen.weekly = now.toISOString();
  }

  // Check monthly
  if (shouldGenerateNewQuests(lastGen.monthly, 'monthly')) {
    const monthlyQuests = await generateQuestsForPeriod(userId, 'monthly');
    newQuests.push(...monthlyQuests);
    lastGen.monthly = now.toISOString();
  }

  // Update last generation timestamps
  if (newQuests.length > 0) {
    await userRef.set({
      lastQuestGeneration: lastGen
    }, { merge: true });
  }

  return newQuests;
}
```

---

## Analysis

### ✅ What's Good

1. **Proper structure** - Checks each period separately
2. **Tracks last generation** - Prevents duplicate generation
3. **Returns new quests** - Good for notifications
4. **Uses merge** - Won't overwrite other user data

### ⚠️ Potential Issues

#### 1. Missing Expired Quest Cleanup

**Problem**: Your code generates new quests but doesn't clean up expired ones.

**Impact**: 
- Old expired quests stay in database
- User might see expired quests in UI
- Database grows unnecessarily

**Fix**: Add cleanup before generating new quests

```javascript
async function checkAndGenerateQuests(userId) {
  const now = new Date();
  const userRef = db.collection("users").doc(userId);
  
  // ✅ ADD THIS: Clean up expired quests first
  await cleanupExpiredQuests(userId, now);
  
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};
  const lastGen = userData.lastQuestGeneration || {};
  const newQuests = [];

  // ... rest of your code
}

// Helper function to clean up expired quests
async function cleanupExpiredQuests(userId, now) {
  const questsRef = db.collection("users").doc(userId).collection("quests");
  
  // Find all expired quests
  const expiredSnapshot = await questsRef
    .where("expiresAt", "<", now)
    .where("status", "==", "active")
    .get();
  
  // Mark them as expired
  const batch = db.batch();
  expiredSnapshot.forEach(doc => {
    batch.update(doc.ref, {
      status: 'expired',
      expiredAt: now
    });
  });
  
  await batch.commit();
  
  console.log(`Cleaned up ${expiredSnapshot.size} expired quests for user ${userId}`);
}
```

#### 2. Race Condition Risk

**Problem**: If `checkAndGenerateQuests` is called multiple times quickly (e.g., user refreshes page), it might generate duplicate quests.

**Current Protection**: `lastQuestGeneration` timestamp helps, but there's a small window between checking and updating.

**Better Fix**: Use Firestore transactions

```javascript
async function checkAndGenerateQuests(userId) {
  const userRef = db.collection("users").doc(userId);
  
  // Use transaction to prevent race conditions
  const result = await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const userData = userDoc.exists ? userDoc.data() : {};
    const lastGen = userData.lastQuestGeneration || {};
    const now = new Date();
    const newQuests = [];

    // Check and generate quests
    if (shouldGenerateNewQuests(lastGen.daily, 'daily')) {
      const dailyQuests = await generateQuestsForPeriod(userId, 'daily');
      newQuests.push(...dailyQuests);
      lastGen.daily = now.toISOString();
    }

    if (shouldGenerateNewQuests(lastGen.weekly, 'weekly')) {
      const weeklyQuests = await generateQuestsForPeriod(userId, 'weekly');
      newQuests.push(...weeklyQuests);
      lastGen.weekly = now.toISOString();
    }

    if (shouldGenerateNewQuests(lastGen.monthly, 'monthly')) {
      const monthlyQuests = await generateQuestsForPeriod(userId, 'monthly');
      newQuests.push(...monthlyQuests);
      lastGen.monthly = now.toISOString();
    }

    // Update timestamp in transaction
    if (newQuests.length > 0) {
      transaction.set(userRef, {
        lastQuestGeneration: lastGen
      }, { merge: true });
    }

    return newQuests;
  });

  return result;
}
```

---

## Recommended Complete Implementation

```javascript
// Main function with cleanup and transaction
async function checkAndGenerateQuests(userId) {
  const now = new Date();
  
  // Step 1: Clean up expired quests
  await cleanupExpiredQuests(userId, now);
  
  // Step 2: Generate new quests (with transaction to prevent duplicates)
  const userRef = db.collection("users").doc(userId);
  
  const newQuests = await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const userData = userDoc.exists ? userDoc.data() : {};
    const lastGen = userData.lastQuestGeneration || {};
    const quests = [];

    // Check daily
    if (shouldGenerateNewQuests(lastGen.daily, 'daily')) {
      const dailyQuests = await generateQuestsForPeriod(userId, 'daily');
      quests.push(...dailyQuests);
      lastGen.daily = now.toISOString();
    }

    // Check weekly
    if (shouldGenerateNewQuests(lastGen.weekly, 'weekly')) {
      const weeklyQuests = await generateQuestsForPeriod(userId, 'weekly');
      quests.push(...weeklyQuests);
      lastGen.weekly = now.toISOString();
    }

    // Check monthly
    if (shouldGenerateNewQuests(lastGen.monthly, 'monthly')) {
      const monthlyQuests = await generateQuestsForPeriod(userId, 'monthly');
      quests.push(...monthlyQuests);
      lastGen.monthly = now.toISOString();
    }

    // Update timestamps
    if (quests.length > 0) {
      transaction.set(userRef, {
        lastQuestGeneration: lastGen
      }, { merge: true });
    }

    return quests;
  });

  return newQuests;
}

// Helper: Clean up expired quests
async function cleanupExpiredQuests(userId, now) {
  const questsRef = db.collection("users").doc(userId).collection("quests");
  
  const expiredSnapshot = await questsRef
    .where("expiresAt", "<", now)
    .where("status", "==", "active")
    .get();
  
  if (expiredSnapshot.empty) return;
  
  const batch = db.batch();
  expiredSnapshot.forEach(doc => {
    batch.update(doc.ref, {
      status: 'expired',
      expiredAt: now
    });
  });
  
  await batch.commit();
  console.log(`Expired ${expiredSnapshot.size} quests for user ${userId}`);
}

// Helper: Check if new quests should be generated
function shouldGenerateNewQuests(lastGenTime, period) {
  if (!lastGenTime) return true;
  
  const lastGen = new Date(lastGenTime);
  const now = new Date();
  
  if (period === 'daily') {
    // Generate if it's a new day
    return lastGen.toDateString() !== now.toDateString();
  } else if (period === 'weekly') {
    // Generate if it's a new week (Monday)
    const lastWeek = getWeekNumber(lastGen);
    const currentWeek = getWeekNumber(now);
    return lastWeek !== currentWeek;
  } else if (period === 'monthly') {
    // Generate if it's a new month
    return lastGen.getMonth() !== now.getMonth() || 
           lastGen.getFullYear() !== now.getFullYear();
  }
  
  return false;
}

// Helper: Get week number
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
```

---

## Summary

### Your Current Code
- ✅ Structure is good
- ✅ Tracks generation timestamps
- ⚠️ Missing expired quest cleanup
- ⚠️ Potential race condition

### Recommended Changes
1. **Add `cleanupExpiredQuests()`** before generating new quests
2. **Use Firestore transaction** to prevent race conditions
3. **Keep your existing logic** - it's mostly correct!

### Priority
- **High**: Add expired quest cleanup
- **Medium**: Add transaction (if you have high traffic)
- **Low**: Everything else is fine

Your code is 90% there - just needs cleanup logic! 👍
