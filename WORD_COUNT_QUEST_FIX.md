# Word Count Quest Fix

## Problem
The "Write 100 words" daily quest is not completing even when writing 129 words because the backend only checks for **monthly** word count quests, not **daily** ones.

## Root Cause
In `backend/routes/journal.js`, the journal save endpoint (`router.post("/add", ...)`) has this code:

```javascript
// 2. ✅ FIXED: Word count quest
if (content) {
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount > 0) {
    try {
      await userRef.collection("dailyWordCounts").doc(date).set({
        date,
        wordCount,
        lastUpdated: new Date()
      });
      
      // ✅ Recalculate monthly total
      await updateMonthlyWordCountQuest(userRef);  // ❌ ONLY UPDATES MONTHLY!
    } catch (questErr) {
      console.error("Error updating word count quest:", questErr);
    }
  }
}
```

This only updates **monthly** word count quests, but the "Write 100 words" quest is a **daily** quest!

## Solution

Replace the word count quest section (section 2) in the journal save endpoint with this:

```javascript
// 2. Word count quests (BOTH daily and monthly)
if (content) {
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  
  if (wordCount > 0) {
    try {
      // ✅ CHECK FOR DAILY WORD COUNT QUEST (Write 100 words)
      const dailyWordQuestSnapshot = await userRef.collection("quests")
        .where("status", "==", "active")
        .where("trackingType", "==", "word_count")
        .where("type", "==", "daily")
        .get();
      
      for (const doc of dailyWordQuestSnapshot.docs) {
        const quest = doc.data();
        
        // For daily quest, check if TODAY's entry meets the target
        if (wordCount >= quest.target) {
          const completed = true;
          
          await doc.ref.update({
            progress: quest.target,
            status: "completed",
            completedAt: new Date()
          });
          
          // Award XP if just completed
          if (quest.status !== "completed") {
            await awardQuestXP(userRef, quest.reward.xp);
            console.log(`✅ Daily word count quest completed! ${wordCount} words written.`);
          }
        } else {
          // Update progress but don't complete
          await doc.ref.update({
            progress: wordCount
          });
        }
      }
      
      // ✅ Store daily word count for monthly tracking
      await userRef.collection("dailyWordCounts").doc(date).set({
        date,
        wordCount,
        lastUpdated: new Date()
      });
      
      // ✅ Update monthly word count quest
      await updateMonthlyWordCountQuest(userRef);
      
    } catch (questErr) {
      console.error("Error updating word count quest:", questErr);
    }
  }
}
```

## What This Does

1. **Checks for daily word count quests** - Looks for active quests with `trackingType: 'word_count'` and `type: 'daily'`
2. **Completes the quest if word count >= target** - If you write 100+ words, it marks the quest as completed
3. **Awards XP** - Gives you the reward XP when completed
4. **Still tracks monthly** - Continues to update monthly word count quests as before

## Testing

After applying this fix:

1. Write a journal entry with 100+ words
2. Check the Growth Garden - the "Write 100 words" quest should show as completed
3. You should receive 10 XP

## Location to Update

File: `backend/routes/journal.js`
Function: `router.post("/add", verifyToken, async (req, res) => { ... })`
Section: Around line 3500-3550 (the word count quest section)
          .where("type", "==", "daily")
          .where("target", "==", 100)
          .get();
        
        for (const doc of dailyWordQuestSnapshot.docs) {
          await doc.ref.update({
            progress: 100,
            status: "completed",
            completedAt: new Date()
          });
          
          const quest = doc.data();
          if (quest.status !== "completed") {
            await awardQuestXP(userRef, quest.reward.xp);
          }
        }
