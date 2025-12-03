// ============================================
// QUEST TRACKING PATCHES FOR backend/routes/journal.js
// ============================================

// PATCH 1: Add streak tracking to journal save endpoint
// Location: After mood quest tracking (around line 2680)
// Add this code block:

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

// ============================================

// PATCH 2: Add category variety tracking to task toggle endpoint
// Location: In /planner/toggle endpoint, REPLACE the existing quest tracking section
// (around line 1450) with this enhanced version:

// ✨ UPDATE QUEST PROGRESS (only when completing, not uncompleting)
try {
  const questsRef = userRef.collection("quests");
  
  // 1. Task completion quest
  const taskQuestSnapshot = await questsRef
    .where("status", "==", "active")
    .where("trackingType", "==", "task_completion")
    .get();
  
  for (const questDoc of taskQuestSnapshot.docs) {
    const quest = questDoc.data();
    const newProgress = Math.min(quest.progress + 1, quest.target);
    const questCompleted = newProgress >= quest.target;
    
    await questDoc.ref.update({
      progress: newProgress,
      status: questCompleted ? "completed" : "active",
      completedAt: questCompleted ? new Date() : null
    });
    
    if (questCompleted && quest.status !== "completed") {
      const userDoc = await userRef.get();
      const userData = userDoc.exists ? userDoc.data() : { 
        totalXP: 0, 
        currentLevel: 1, 
        questsCompleted: 0 
      };
      const newTotalXP = (userData.totalXP || 0) + quest.reward.xp;
      const currentLevel = calculateLevel(newTotalXP);
      
      await userRef.set({
        totalXP: newTotalXP,
        currentLevel,
        questsCompleted: (userData.questsCompleted || 0) + 1
      }, { merge: true });
    }
  }
  
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
} catch (questErr) {
  console.error("Error updating task quest:", questErr);
}

// ============================================

// PATCH 3: Add perfect days quest tracking to daily status endpoint
// Location: In /planner/daily-status endpoint, AFTER the badge award code
// (around line 1330), ADD this code:

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

// ============================================

// PATCH 4: Update generateQuestsForPeriod function
// Location: REPLACE the existing generateQuestsForPeriod function
// (around line 1900) with this enhanced version:

async function generateQuestsForPeriod(userId, period, userTimezone = 'UTC') {
  const userRef = db.collection("users").doc(userId);
  const questsRef = userRef.collection("quests");
  const generatedQuests = [];
  const now = new Date();

  let templates;
  if (period === 'daily') {
    templates = selectRandomTemplates(DAILY_QUEST_TEMPLATES, 2);
  } else if (period === 'weekly') {
    templates = selectRandomTemplates(WEEKLY_QUEST_TEMPLATES, 2);
  } else if (period === 'monthly') {
    templates = selectRandomTemplates(MONTHLY_QUEST_TEMPLATES, 1);
  }

  const expiresAt = calculateExpirationDate(period, userTimezone);

  for (const template of templates) {
    const questRef = questsRef.doc();
    
    // ✅ Initialize proper metadata based on tracking type
    let progressMetadata = {};
    if (template.trackingType === 'journal_days' || template.trackingType === 'streak_days') {
      progressMetadata = { uniqueDays: [] };
    } else if (template.trackingType === 'category_variety') {
      progressMetadata = { uniqueCategories: [] };
    } else if (template.trackingType === 'perfect_days') {
      progressMetadata = { perfectDates: [] };
    }
    
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
      progressMetadata
    };

    await questRef.set(quest);
    generatedQuests.push({ id: questRef.id, ...quest });
  }

  return generatedQuests;
}

// ============================================
// END OF PATCHES
// ============================================

/*
INSTRUCTIONS FOR APPLYING PATCHES:

1. Open backend/routes/journal.js
2. Find each location mentioned in the patches
3. Add or replace code as indicated
4. Save the file
5. Restart your backend server
6. Test each quest type

TESTING:
- Test streak quest: Write journal entries for 7 consecutive days
- Test category quest: Complete tasks from 3+ different categories
- Test perfect days: Complete all tasks for a day
- Test journal days: Write entries on 5 different days in a week

After applying all patches, run:
POST /journal/quests/reset-all

This will regenerate all quests with proper metadata.
*/
