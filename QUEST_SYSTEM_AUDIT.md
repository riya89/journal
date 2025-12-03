# Quest System Audit - All Mismatches Found

## Summary
After analyzing the backend code, I found **several critical mismatches** between quest templates and their tracking logic.

---

## ✅ QUEST TEMPLATES DEFINED

### Daily Quests
1. **daily_write_100** - `trackingType: 'word_count'`, target: 100
2. **daily_complete_3_tasks** - `trackingType: 'task_completion'`, target: 3
3. **daily_journal_entry** - `trackingType: 'journal_entry'`, target: 1
4. **daily_mood_check** - `trackingType: 'mood_log'`, target: 1

### Weekly Quests
1. **weekly_journal_5_days** - `trackingType: 'journal_days'`, target: 5
2. **weekly_maintain_streak** - `trackingType: 'streak_days'`, target: 7
3. **weekly_complete_20_tasks** - `trackingType: 'task_completion'`, target: 20
4. **weekly_try_3_categories** - `trackingType: 'category_variety'`, target: 3

### Monthly Quests
1. **monthly_20_entries** - `trackingType: 'journal_entry'`, target: 20
2. **monthly_all_categories** - `trackingType: 'category_variety'`, target: 6
3. **monthly_perfect_week** - `trackingType: 'perfect_days'`, target: 7
4. **monthly_5000_words** - `trackingType: 'word_count'`, target: 5000

---

## 🔴 CRITICAL ISSUES FOUND

### Issue 1: Daily Word Count Quest Not Tracked ❌
**Quest:** "Write 100 words" (daily)
**Template:** `trackingType: 'word_count'`, target: 100
**Problem:** Journal save endpoint ONLY updates monthly word count quests
**Location:** `router.post("/add", ...)` - Section 2

**Current Code:**
```javascript
// Only updates MONTHLY word count quest
await updateMonthlyWordCountQuest(userRef);
```

**Missing:** Check for daily word count quests

**Impact:** Daily "Write 100 words" quest never completes even when writing 100+ words

---

### Issue 2: Weekly Journal Days Quest - Potential Double Counting ⚠️
**Quest:** "Journal 5 days this week" (weekly)
**Template:** `trackingType: 'journal_days'`, target: 5
**Problem:** Uses `progressMetadata.uniqueDays` but journal save endpoint doesn't call quest progress for this

**Current Implementation:**
- Journal save endpoint updates `journal_entry` quests (increments by 1)
- But `journal_days` needs unique day tracking
- The `/quests/progress` endpoint has logic for unique days, but journal save doesn't call it for `journal_days`

**Impact:** This quest might not track correctly or might count multiple entries on same day

---

### Issue 3: Streak Days Quest - No Tracking ❌
**Quest:** "Maintain your streak" (weekly)
**Template:** `trackingType: 'streak_days'`, target: 7
**Problem:** NO CODE tracks `streak_days` anywhere in the backend

**Missing:** 
- No endpoint updates streak_days quests
- Journal save doesn't check for streak_days
- No integration with streak tracking system

**Impact:** "Maintain your streak" quest never progresses

---

### Issue 4: Category Variety Quest - No Tracking ❌
**Quest:** "Try 3 task categories" (weekly) & "Try all task categories" (monthly)
**Template:** `trackingType: 'category_variety'`
**Problem:** NO CODE tracks category variety anywhere

**Missing:**
- Task completion doesn't track which categories were used
- No logic to count unique categories
- No metadata to store category history

**Impact:** Category variety quests never progress

---

### Issue 5: Perfect Days Quest - No Tracking ❌
**Quest:** "Achieve a perfect week" (monthly)
**Template:** `trackingType: 'perfect_days'`, target: 7
**Problem:** NO CODE tracks perfect days for quests

**Note:** There IS a "Perfect Day" badge system in `/planner/daily-status`, but it doesn't update quests

**Missing:**
- Quest progress update when a perfect day is achieved
- No connection between badge system and quest system

**Impact:** "Achieve a perfect week" quest never progresses

---

## ✅ WORKING CORRECTLY

### 1. Journal Entry Quests ✓
- **Daily:** "Write a journal entry" - Works correctly
- **Monthly:** "Write 20 journal entries" - Works correctly
- Tracked in journal save endpoint, section 1

### 2. Mood Log Quests ✓
- **Daily:** "Log your mood" - Works correctly
- Tracked in journal save endpoint, section 3

### 3. Task Completion Quests ✓
- **Daily:** "Complete 3 tasks" - Works correctly
- **Weekly:** "Complete 20 tasks" - Works correctly
- Tracked in `/planner/toggle` endpoint

---

## 🔧 FIXES NEEDED

### Fix 1: Daily Word Count Quest (CRITICAL)
**File:** `backend/routes/journal.js`
**Function:** `router.post("/add", ...)`
**Section:** Word count quest (section 2)

Add this code:
```javascript
// Check for DAILY word count quest
const dailyWordQuestSnapshot = await userRef.collection("quests")
  .where("status", "==", "active")
  .where("trackingType", "==", "word_count")
  .where("type", "==", "daily")
  .get();

for (const doc of dailyWordQuestSnapshot.docs) {
  const quest = doc.data();
  
  if (wordCount >= quest.target) {
    await doc.ref.update({
      progress: quest.target,
      status: "completed",
      completedAt: new Date()
    });
    
    if (quest.status !== "completed") {
      await awardQuestXP(userRef, quest.reward.xp);
    }
  }
}
```

---

### Fix 2: Weekly Journal Days Quest
**File:** `backend/routes/journal.js`
**Function:** `router.post("/add", ...)`

Add after journal entry quest update:
```javascript
// Update journal_days quest (weekly)
try {
  const journalDaysQuestSnapshot = await userRef.collection("quests")
    .where("status", "==", "active")
    .where("trackingType", "==", "journal_days")
    .get();
  
  for (const doc of journalDaysQuestSnapshot.docs) {
    const quest = doc.data();
    const progressMetadata = quest.progressMetadata || { uniqueDays: [] };
    const todayString = date; // Already in YYYY-MM-DD format
    
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
      
      if (completed && quest.status !== "completed") {
        await awardQuestXP(userRef, quest.reward.xp);
      }
    }
  }
} catch (questErr) {
  console.error("Error updating journal_days quest:", questErr);
}
```

---

### Fix 3: Streak Days Quest
**File:** `backend/routes/journal.js`
**Function:** `router.post("/add", ...)`

Add integration with streak system:
```javascript
// Update streak_days quest (weekly)
try {
  // Fetch current streak from Raindrop or calculate from journals
  const streakResponse = await fetch(`${process.env.RAINDROP_URL}/analytics/streaks?uid=${req.uid}`);
  
  if (streakResponse.ok) {
    const streakData = await streakResponse.json();
    const currentStreak = streakData.currentStreak || 0;
    
    const streakQuestSnapshot = await userRef.collection("quests")
      .where("status", "==", "active")
      .where("trackingType", "==", "streak_days")
      .get();
    
    for (const doc of streakQuestSnapshot.docs) {
      const quest = doc.data();
      const completed = currentStreak >= quest.target;
      
      await doc.ref.update({
        progress: currentStreak,
        status: completed ? "completed" : "active",
        completedAt: completed ? new Date() : null
      });
      
      if (completed && quest.status !== "completed") {
        await awardQuestXP(userRef, quest.reward.xp);
      }
    }
  }
} catch (questErr) {
  console.error("Error updating streak_days quest:", questErr);
}
```

---

### Fix 4: Category Variety Quest
**File:** `backend/routes/journal.js`
**Function:** `router.post("/planner/toggle", ...)`

Add after task completion quest update:
```javascript
// Update category_variety quest
try {
  const categoryQuestSnapshot = await userRef.collection("quests")
    .where("status", "==", "active")
    .where("trackingType", "==", "category_variety")
    .get();
  
  for (const questDoc of categoryQuestSnapshot.docs) {
    const quest = questDoc.data();
    const progressMetadata = quest.progressMetadata || { uniqueCategories: [] };
    
    // Get the task that was just completed
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const plannerDoc = await plannerRef.get();
    const plannerData = plannerDoc.data();
    const task = plannerData.tasks.find(t => t.id === taskId);
    
    if (task && task.category && !progressMetadata.uniqueCategories.includes(task.category)) {
      progressMetadata.uniqueCategories.push(task.category);
      const newProgress = progressMetadata.uniqueCategories.length;
      const completed = newProgress >= quest.target;
      
      await questDoc.ref.update({
        progress: newProgress,
        progressMetadata,
        status: completed ? "completed" : "active",
        completedAt: completed ? new Date() : null
      });
      
      if (completed && quest.status !== "completed") {
        await awardQuestXP(userRef, quest.reward.xp);
      }
    }
  }
} catch (questErr) {
  console.error("Error updating category_variety quest:", questErr);
}
```

---

### Fix 5: Perfect Days Quest
**File:** `backend/routes/journal.js`
**Function:** `router.get("/planner/daily-status", ...)`

Add after Perfect Day badge award:
```javascript
// Update perfect_days quest
if (allTasksComplete) {
  try {
    const perfectDaysQuestSnapshot = await userRef.collection("quests")
      .where("status", "==", "active")
      .where("trackingType", "==", "perfect_days")
      .get();
    
    for (const doc of perfectDaysQuestSnapshot.docs) {
      const quest = doc.data();
      const progressMetadata = quest.progressMetadata || { perfectDates: [] };
      
      // Only count if not already counted
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
        
        if (completed && quest.status !== "completed") {
          await awardQuestXP(userRef, quest.reward.xp);
        }
      }
    }
  } catch (questErr) {
    console.error("Error updating perfect_days quest:", questErr);
  }
}
```

---

## 📊 PRIORITY ORDER

1. **CRITICAL** - Fix 1: Daily Word Count Quest (user reported this)
2. **HIGH** - Fix 2: Weekly Journal Days Quest
3. **HIGH** - Fix 3: Streak Days Quest
4. **MEDIUM** - Fix 4: Category Variety Quest
5. **MEDIUM** - Fix 5: Perfect Days Quest

---

## 🧪 TESTING CHECKLIST

After applying fixes, test each quest:

### Daily Quests
- [ ] Write 100 words - Write 100+ word entry, check completion
- [ ] Complete 3 tasks - Complete 3 tasks, check completion
- [ ] Write a journal entry - Write entry, check completion
- [ ] Log your mood - Add mood, check completion

### Weekly Quests
- [ ] Journal 5 days - Write entries on 5 different days
- [ ] Maintain streak - Keep 7-day streak
- [ ] Complete 20 tasks - Complete 20 tasks in a week
- [ ] Try 3 categories - Complete tasks from 3 different categories

### Monthly Quests
- [ ] Write 20 entries - Write 20 entries in a month
- [ ] Try all categories - Complete tasks from all 6 categories
- [ ] Achieve perfect week - Complete all tasks for 7 consecutive days
- [ ] Write 5,000 words - Write 5,000 total words in a month

---

## 💡 RECOMMENDATIONS

1. **Add Quest Tracking Logs** - Add console.log statements to track quest progress updates
2. **Create Quest Debug Endpoint** - Add endpoint to manually trigger quest checks
3. **Add Quest Progress API** - Create unified API for updating quest progress
4. **Refactor Quest Logic** - Move quest update logic to separate helper functions
5. **Add Unit Tests** - Test each quest type independently

---

## 📝 NOTES

- The quest system has good structure but incomplete implementation
- Most quest templates are defined but not all have tracking logic
- The `/quests/progress` endpoint has some logic but isn't called for all quest types
- Need to ensure all quest types are tracked when relevant actions occur
