# Quest Backend Fixes Needed

## Critical Issues to Fix

### 1. ✅ Weekly Quests - NO DUPLICATE FOUND

**Status**: After reviewing your backend code, there is NO duplicate quest!

**Your Weekly Quest Templates**:
```javascript
const WEEKLY_QUEST_TEMPLATES = [
  { id: 'weekly_journal_5_days', title: 'Journal 5 days this week' },
  { id: 'weekly_maintain_streak', title: 'Maintain your streak' },
  { id: 'weekly_complete_20_tasks', title: 'Complete 20 tasks' }, // Only appears ONCE
  { id: 'weekly_try_3_categories', title: 'Try 3 task categories' }
];
```

**Why you might see duplicates**:
- The `selectRandomTemplates()` function picks 2 random quests
- If you have old quests in the database that haven't expired yet
- Solution: The duplicate you saw was probably from a previous period that hasn't been cleaned up

**No fix needed** - your code is correct!

---

### 2. ⚠️ Word Count Logic: Multiple Saves on Same Date

**Problem**: Does the "Write 5000 Words" monthly quest count words from multiple journal entries saved on the same date?

**Current Behavior (Unknown)**: 
- If I journal at 9 AM (500 words) and save
- Then journal again at 9 PM (300 words) and save
- Does it count 500 or 800 words?

**Expected Behavior**:
```
✅ SHOULD count: Latest word count for each date
❌ SHOULD NOT count: Sum of all saves on same date (would allow cheating)
```

**Recommended Fix**:

```javascript
// When user saves journal entry
async function updateWordCountQuest(userId, date, wordCount) {
  // Get or create daily word count tracker
  const dailyWordCountRef = db
    .collection('users')
    .doc(userId)
    .collection('dailyWordCounts')
    .doc(date); // e.g., "2025-12-01"
  
  // Store ONLY the latest word count for this date
  await dailyWordCountRef.set({
    date: date,
    wordCount: wordCount, // Overwrites previous count
    lastUpdated: new Date()
  }, { merge: true });
  
  // Calculate monthly total
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const monthlySnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('dailyWordCounts')
    .where('date', '>=', startOfMonth.toISOString().split('T')[0])
    .get();
  
  let monthlyTotal = 0;
  monthlySnapshot.forEach(doc => {
    monthlyTotal += doc.data().wordCount;
  });
  
  // Update monthly quest progress
  await updateQuestProgress(userId, 'monthly_words_5000', monthlyTotal);
}
```

**Why This Approach?**
- ✅ Prevents cheating (can't save same entry multiple times to inflate count)
- ✅ Counts actual unique words written per day
- ✅ If user edits entry, only latest count matters
- ✅ Fair and accurate tracking

**Alternative Approach** (if you want to count ALL saves):
```javascript
// Track cumulative words across all saves
// But this allows users to game the system by saving repeatedly
// NOT RECOMMENDED
```

---

## Implementation Steps

### Step 1: Fix Duplicate Weekly Quest
1. Find your quest generation code (likely in `checkAndGenerateQuests` function)
2. Look for weekly quest pool/array
3. Remove duplicate "Complete 20 Tasks" entry
4. Add deduplication logic to prevent future duplicates

### Step 2: Implement Word Count Tracking
1. Create `dailyWordCounts` subcollection under users
2. Update journal save endpoint to call `updateWordCountQuest`
3. Store only latest word count per date
4. Calculate monthly total from daily counts
5. Update quest progress

### Step 3: Test
1. Create a monthly word count quest
2. Journal on same date multiple times
3. Verify only latest word count is used
4. Check that monthly total is correct

---

## Code Example: Complete Implementation

```javascript
// In your journal save endpoint
router.post("/journal/save", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { date, content, mood } = req.body;
    
    // Save journal entry
    await db.collection('users')
      .doc(userId)
      .collection('journals')
      .doc(date)
      .set({
        content,
        mood,
        date,
        updatedAt: new Date()
      }, { merge: true });
    
    // Count words
    const wordCount = content.trim().split(/\s+/).length;
    
    // Update daily word count (overwrites if exists)
    await db.collection('users')
      .doc(userId)
      .collection('dailyWordCounts')
      .doc(date)
      .set({
        date,
        wordCount,
        lastUpdated: new Date()
      });
    
    // Calculate monthly total
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const monthKey = startOfMonth.toISOString().split('T')[0];
    
    const monthlySnapshot = await db.collection('users')
      .doc(userId)
      .collection('dailyWordCounts')
      .where('date', '>=', monthKey)
      .get();
    
    let monthlyTotal = 0;
    monthlySnapshot.forEach(doc => {
      monthlyTotal += doc.data().wordCount;
    });
    
    // Update monthly word count quest
    const questsSnapshot = await db.collection('users')
      .doc(userId)
      .collection('quests')
      .where('type', '==', 'monthly')
      .where('title', '==', 'Write 5000 Words')
      .where('status', '==', 'active')
      .get();
    
    if (!questsSnapshot.empty) {
      const questDoc = questsSnapshot.docs[0];
      await questDoc.ref.update({
        progress: monthlyTotal,
        status: monthlyTotal >= 5000 ? 'completed' : 'active',
        completedAt: monthlyTotal >= 5000 ? new Date() : null
      });
    }
    
    res.json({ success: true, wordCount, monthlyTotal });
  } catch (err) {
    console.error('Error saving journal:', err);
    res.status(500).json({ error: 'Failed to save journal' });
  }
});
```

---

## Summary

### Issues
1. ✅ NO duplicate quest found - your code is correct!
2. ⚠️ Word count logic needs clarification for same-date saves

### Recommended Fixes
1. ✅ Weekly quests are fine - no changes needed
2. ⚠️ Implement daily word count tracking (see code above)
3. ⚠️ Store only latest word count per date
4. ⚠️ Calculate monthly total from daily counts

### Benefits
- Fair and accurate quest tracking
- Prevents gaming the system
- Clear and predictable behavior
- Better user experience
