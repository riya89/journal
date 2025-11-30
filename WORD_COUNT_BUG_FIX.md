# Word Count Bug Fix - URGENT

## 🐛 The Bug

**Problem**: When you edit and save a journal entry on the same date, the word count is ADDED again instead of REPLACED.

**Example**:
1. Write journal on Dec 1: "Hello world" (2 words) → Quest progress: 2/5000
2. Edit same entry: "Hello world today" (3 words) → Quest progress: 5/5000 ❌ WRONG!
3. Should be: 3/5000 ✅

**Impact**: Users can cheat by editing the same entry repeatedly to complete the quest.

---

## 🔍 Root Cause

Your current code probably does this:

```javascript
// ❌ WRONG: Adds word count every time
router.post("/journal/save", async (req, res) => {
  const { date, content } = req.body;
  const wordCount = content.split(/\s+/).length;
  
  // This ADDS to the quest progress
  await updateQuestProgress(userId, 'monthly_words_5000', wordCount); // ❌ Adds!
});
```

---

## ✅ The Fix

You need to:
1. **Store word count per date** (not per save)
2. **Replace** the word count when editing
3. **Recalculate** monthly total from all dates

### Step 1: Store Daily Word Count

```javascript
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
    
    // Count words in this entry
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    // ✅ STORE word count for THIS DATE (overwrites if exists)
    await db.collection('users')
      .doc(userId)
      .collection('dailyWordCounts')
      .doc(date)
      .set({
        date,
        wordCount,
        lastUpdated: new Date()
      }); // No merge - we want to REPLACE
    
    // ✅ RECALCULATE monthly total from ALL dates
    await updateMonthlyWordCountQuest(userId);
    
    res.json({ success: true, wordCount });
  } catch (err) {
    console.error('Error saving journal:', err);
    res.status(500).json({ error: 'Failed to save journal' });
  }
});
```

### Step 2: Recalculate Monthly Total

```javascript
async function updateMonthlyWordCountQuest(userId) {
  // Get start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthKey = startOfMonth.toISOString().split('T')[0];
  
  // Get ALL daily word counts for this month
  const dailyCountsSnapshot = await db.collection('users')
    .doc(userId)
    .collection('dailyWordCounts')
    .where('date', '>=', monthKey)
    .get();
  
  // Sum up all daily word counts
  let monthlyTotal = 0;
  dailyCountsSnapshot.forEach(doc => {
    monthlyTotal += doc.data().wordCount || 0;
  });
  
  console.log(`User ${userId} monthly word count: ${monthlyTotal}`);
  
  // Find active monthly word count quest
  const questsSnapshot = await db.collection('users')
    .doc(userId)
    .collection('quests')
    .where('type', '==', 'monthly')
    .where('trackingType', '==', 'word_count')
    .where('status', '==', 'active')
    .get();
  
  if (questsSnapshot.empty) {
    console.log('No active word count quest found');
    return;
  }
  
  // Update quest progress with TOTAL (not adding)
  const questDoc = questsSnapshot.docs[0];
  const isCompleted = monthlyTotal >= questDoc.data().target;
  
  await questDoc.ref.update({
    progress: monthlyTotal, // ✅ SET to total, don't add
    status: isCompleted ? 'completed' : 'active',
    completedAt: isCompleted ? new Date() : null
  });
  
  console.log(`Updated quest progress to ${monthlyTotal}/${questDoc.data().target}`);
}
```

---

## 📊 Database Structure

```
users/{userId}/
  ├── journals/{date}/
  │   ├── content: "Hello world today"
  │   ├── mood: 4
  │   └── date: "2025-12-01"
  │
  ├── dailyWordCounts/{date}/  ← NEW COLLECTION
  │   ├── date: "2025-12-01"
  │   ├── wordCount: 3          ← Latest count for this date
  │   └── lastUpdated: timestamp
  │
  └── quests/{questId}/
      ├── type: "monthly"
      ├── trackingType: "word_count"
      ├── progress: 3             ← Sum of all daily counts
      └── target: 5000
```

---

## 🧪 Testing

### Test Case 1: New Entry
```
1. Write journal on Dec 1: "Hello world" (2 words)
   → dailyWordCounts/2025-12-01: { wordCount: 2 }
   → Quest progress: 2/5000 ✅

2. Write journal on Dec 2: "Good morning" (2 words)
   → dailyWordCounts/2025-12-02: { wordCount: 2 }
   → Quest progress: 4/5000 ✅
```

### Test Case 2: Edit Existing Entry
```
1. Write journal on Dec 1: "Hello world" (2 words)
   → Quest progress: 2/5000 ✅

2. Edit Dec 1 entry: "Hello world today" (3 words)
   → dailyWordCounts/2025-12-01: { wordCount: 3 } (REPLACED)
   → Quest progress: 3/5000 ✅ (not 5!)
```

### Test Case 3: Multiple Edits
```
1. Write: "Hello" (1 word) → Progress: 1/5000
2. Edit: "Hello world" (2 words) → Progress: 2/5000
3. Edit: "Hello world today" (3 words) → Progress: 3/5000
4. Edit: "Hi" (1 word) → Progress: 1/5000

Always uses LATEST word count for that date ✅
```

---

## 🚀 Implementation Checklist

- [ ] Create `dailyWordCounts` subcollection
- [ ] Update journal save endpoint to store daily word count
- [ ] Create `updateMonthlyWordCountQuest()` function
- [ ] Call it after saving journal
- [ ] Test with new entry
- [ ] Test with editing existing entry
- [ ] Test with multiple edits
- [ ] Verify quest progress is correct

---

## 📝 Summary

**Current Behavior**: ❌ Adds word count every save (allows cheating)
**Fixed Behavior**: ✅ Stores latest word count per date (fair tracking)

**Key Changes**:
1. Store word count per DATE (not per save)
2. REPLACE word count when editing (don't add)
3. RECALCULATE monthly total from all dates
4. UPDATE quest progress with total (don't increment)

This ensures fair and accurate word count tracking! 🎯
