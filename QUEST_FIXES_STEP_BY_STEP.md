# Quest Fixes - Step-by-Step Guide

## 🎯 Simple Instructions

You need to add code in **4 specific places** in your `backend/routes/journal.js` file.

---

## ✅ FIX #1: Streak Tracking

### Where to add it:
Search for this text in your file:
```
} catch (questErr) {
  console.error("Error updating mood quest:", questErr);
}
```

### What to do:
**RIGHT AFTER** that closing brace `}`, add this code:

```javascript
// 4. ✅ Track streak days for weekly quest
if (date) {
  try {
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const userTimezone = userData.timezone || 'UTC';
    
    const streakResponse = await fetch(
      `${process.env.RAINDROP_URL}/analytics/streaks?uid=${req.uid}&timezone=${encodeURIComponent(userTimezone)}`
    );
    
    if (streakResponse.ok) {
      const streakData = await streakResponse.json();
      
      // Update weekly streak_days quest
      const streakQuestSnapshot = await userRef.collection("quests")
        .where("status", "==", "active")
        .where("trackingType", "==", "streak_days")
        .where("type", "==", "weekly")
        .get();
      
      for (const doc of streakQuestSnapshot.docs) {
        const quest = doc.data();
        const progressMetadata = quest.progressMetadata || { uniqueDays: [] };
        const todayString = date;
        
        // Only increment if this day hasn't been counted yet
        if (!progressMetadata.uniqueDays.includes(todayString)) {
          progressMetadata.uniqueDays.push(todayString);
          const newProgress = progressMetadata.uniqueDays.length;
          const completed = newProgress >= quest.target;
          
          await doc.ref.update({
            progress: newProgress,
            progressMetadata,
            status: completed ? "completed" : "active",
            completedAt: completed ? new Date() : null
          });
          
          // Award XP if completed
          if (completed && quest.status !== "completed") {
            await awardQuestXP(userRef, quest.reward.xp);
            console.log(`✅ Weekly streak quest completed! ${newProgress} days`);
          }
        }
      }
    }
  } catch (streakErr) {
    console.error("Error updating streak quest:", streakErr);
  }
}
```

---

## ✅ FIX #2: Category Variety Tracking

### Where to add it:
Search for this text in your file:
```javascript
// ✨ UPDATE QUEST PROGRESS (only when completing, not uncompleting)
try {
  const questsRef = userRef.collection("quests");
  const taskQuestSnapshot = await questsRef
```

You'll find a section that updates task completion quests. 

### What to do:
Find this part (it's inside the task toggle endpoint):
```javascript
// Award XP if quest completed
if (completed && quest.status !== "completed") {
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : { totalXP: 0, currentLevel: 1, questsCompleted: 0 };
  const newTotalXP = (userData.totalXP || 0) + quest.reward.xp;
  const currentLevel = calculateLevel(newTotalXP);

  await userRef.set({
    totalXP: newTotalXP,
    currentLevel,
    questsCompleted: (userData.questsCompleted || 0) + 1
  }, { merge: true });
}
```

**RIGHT AFTER** the closing brace `}` of the `for` loop (after the task completion quest code), add this:

```javascript
// 2. ✅ Category variety quest
// Get the task that was just completed to find its category
const plannerDoc = await plannerRef.get();
const plannerData = plannerDoc.exists ? plannerDoc.data() : {};

// Find the completed task
let completedTaskCategory = null;

// Check regular tasks
const regularTask = plannerData.tasks?.find(t => t.id === taskId);
if (regularTask) {
  completedTaskCategory = regularTask.category;
} else {
  // Check templates
  const templateRef = userRef.collection("taskTemplates").doc(taskId);
  const templateDoc = await templateRef.get();
  if (templateDoc.exists) {
    completedTaskCategory = templateDoc.data().category;
  }
}

if (completedTaskCategory) {
  // Update category variety quest
  const categoryQuestSnapshot = await questsRef
    .where("status", "==", "active")
    .where("trackingType", "==", "category_variety")
    .get();
  
  for (const questDoc of categoryQuestSnapshot.docs) {
    const quest = questDoc.data();
    const progressMetadata = quest.progressMetadata || { uniqueCategories: [] };
    
    // Add category if not already tracked
    if (!progressMetadata.uniqueCategories.includes(completedTaskCategory)) {
      progressMetadata.uniqueCategories.push(completedTaskCategory);
      const newProgress = progressMetadata.uniqueCategories.length;
      const questCompleted = newProgress >= quest.target;
      
      await questDoc.ref.update({
        progress: newProgress,
        progressMetadata,
        status: questCompleted ? "completed" : "active",
        completedAt: questCompleted ? new Date() : null
      });
      
      // Award XP if completed
      if (questCompleted && quest.status !== "completed") {
        await awardQuestXP(userRef, quest.reward.xp);
        console.log(`✅ Category variety quest completed! ${newProgress} categories`);
      }
    }
  }
}
```

---

## ✅ FIX #3: Perfect Days Quest

### Where to add it:
Search for this text in your file:
```javascript
await userRef.set({
  earnedBadges,
  stats: {
    ...userData.stats,
    perfectDays: currentPerfectDays + 1
  }
}, { merge: true });
```

This is in the `/planner/daily-status` endpoint where it awards the perfect day badge.

### What to do:
**RIGHT AFTER** that `await userRef.set(...)` statement, add this:

```javascript
// ✅ Update perfect_days quest progress
try {
  const questsRef = userRef.collection("quests");
  const perfectDaysQuestSnapshot = await questsRef
    .where("status", "==", "active")
    .where("trackingType", "==", "perfect_days")
    .get();
  
  for (const doc of perfectDaysQuestSnapshot.docs) {
    const quest = doc.data();
    const progressMetadata = quest.progressMetadata || { perfectDates: [] };
    
    // Only count if this date hasn't been counted yet
    if (!progressMetadata.perfectDates.includes(dateStr)) {
      progressMetadata.perfectDates.push(dateStr);
      const newProgress = progressMetadata.perfectDates.length;
      const completed = newProgress >= quest.target;
      
      await doc.ref.update({
        progress: newProgress,
        progressMetadata,
        status: completed ? "completed" : "active",
        completedAt: completed ? new Date() : null
      });
      
      // Award XP if completed
      if (completed && quest.status !== "completed") {
        await awardQuestXP(userRef, quest.reward.xp);
        console.log(`✅ Perfect days quest completed! ${newProgress} perfect days`);
      }
    }
  }
} catch (questErr) {
  console.error("Error updating perfect days quest:", questErr);
}
```

---

## ✅ FIX #4: Initialize Quest Metadata Properly

### Where to find it:
Search for this function:
```javascript
async function generateQuestsForPeriod(userId, period, userTimezone = 'UTC') {
```

### What to do:
Find this part inside that function:
```javascript
const quest = {
  userId,
  type: period,
  title: template.title,
  description: template.description,
  target: template.target,
  progress: 0,
  reward: template.reward,
  status: 'active',
  trackingType: template.trackingType,
  createdAt: now,
  expiresAt,
  completedAt: null,
  expiredAt: null,
  lastProgressDate: now,
  progressMetadata: { uniqueDays: [] }  // ← This line exists
};
```

**REPLACE** the line `progressMetadata: { uniqueDays: [] }` with this smarter version:

```javascript
const quest = {
  userId,
  type: period,
  title: template.title,
  description: template.description,
  target: template.target,
  progress: 0,
  reward: template.reward,
  status: 'active',
  trackingType: template.trackingType,
  createdAt: now,
  expiresAt,
  completedAt: null,
  expiredAt: null,
  lastProgressDate: now,
  progressMetadata: (() => {
    // ✅ Initialize proper metadata based on tracking type
    if (template.trackingType === 'journal_days' || template.trackingType === 'streak_days') {
      return { uniqueDays: [] };
    } else if (template.trackingType === 'category_variety') {
      return { uniqueCategories: [] };
    } else if (template.trackingType === 'perfect_days') {
      return { perfectDates: [] };
    }
    return {};
  })()
};
```

---

## 🎉 After Adding All 4 Fixes

1. **Save** the file
2. **Restart** your backend server
3. **Reset quests** by calling this endpoint:
   ```
   POST http://localhost:5001/journal/quests/reset-all
   ```
4. **Test** each quest type

---

## 📍 Quick Reference - What Goes Where

| Fix | Search For | Add After |
|-----|-----------|-----------|
| #1 Streak | `Error updating mood quest` | After the closing `}` |
| #2 Category | Task completion quest code | After the `for` loop ends |
| #3 Perfect Days | `perfectDays: currentPerfectDays + 1` | After the `await userRef.set(...)` |
| #4 Metadata | `progressMetadata: { uniqueDays: [] }` | Replace this line |

---

## ❓ Still Confused?

If you're still not sure where to add something, paste the code around that area and I'll tell you exactly where to insert it!
