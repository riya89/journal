// 📝 FIXED: Save or update journal entry
router.post("/add", verifyToken, async (req, res) => {
  const { title, content, mood, date, prompts = [], answers = [], photoURL = null } = req.body;
  
  if (!date) return res.status(400).json({ error: "Missing date field" });

  try {
    const userRef = db.collection("users").doc(req.uid);
    const journalRef = userRef.collection("journals").doc(date);

    // Save journal entry
    await journalRef.set({
      title,
      content,
      mood,
      date,
      prompts,
      answers,
      photoURL,
      updatedAt: new Date(),
    });

    // ✨ UPDATE QUEST PROGRESS

    // 1. Journal entry quest
    try {
      const questsRef = userRef.collection("quests");
      const journalQuestSnapshot = await questsRef
        .where("status", "==", "active")
        .where("trackingType", "==", "journal_entry")
        .get();

      for (const doc of journalQuestSnapshot.docs) {
        const quest = doc.data();
        const newProgress = Math.min(quest.progress + 1, quest.target);
        const completed = newProgress >= quest.target;

        await doc.ref.update({
          progress: newProgress,
          status: completed ? "completed" : "active",
          completedAt: completed ? new Date() : null
        });

        // Award XP if completed
        if (completed && quest.status !== "completed") {
          await awardQuestXP(userRef, quest.reward.xp);
        }
      }
    } catch (questErr) {
      console.error("Error updating journal quest:", questErr);
    }

    // 2. ✅ FIXED: Word count quest
    if (content) {
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      if (wordCount > 0) {
        try {
          // ✅ Store daily word count (replaces if exists)
          await userRef.collection("dailyWordCounts").doc(date).set({
            date,
            wordCount,
            lastUpdated: new Date()
          }); // No merge - we want to REPLACE

          // ✅ Recalculate monthly total
          await updateMonthlyWordCountQuest(userRef);
          
        } catch (questErr) {
          console.error("Error updating word count quest:", questErr);
        }
      }
    }

    // 3. Mood log quest
    if (mood) {
      try {
        const moodQuestSnapshot = await userRef.collection("quests")
          .where("status", "==", "active")
          .where("trackingType", "==", "mood_log")
          .get();

        for (const doc of moodQuestSnapshot.docs) {
          const quest = doc.data();
          const newProgress = Math.min(quest.progress + 1, quest.target);
          const completed = newProgress >= quest.target;

          await doc.ref.update({
            progress: newProgress,
            status: completed ? "completed" : "active",
            completedAt: completed ? new Date() : null
          });

          // Award XP if completed
          if (completed && quest.status !== "completed") {
            await awardQuestXP(userRef, quest.reward.xp);
          }
        }
      } catch (questErr) {
        console.error("Error updating mood quest:", questErr);
      }
    }

    // Update user stats
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    await userRef.set({
      stats: {
        ...userData.stats,
        totalJournalEntries: (userData.stats?.totalJournalEntries || 0) + 1
      }
    }, { merge: true });

    res.json({ message: "Journal saved successfully ✅", date });
  } catch (err) {
    console.error("Error saving journal:", err);
    res.status(500).json({ error: "Failed to save journal" });
  }
});

// ✅ NEW: Helper function to update monthly word count quest
async function updateMonthlyWordCountQuest(userRef) {
  try {
    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthKey = startOfMonth.toISOString().split('T')[0];
    
    // Get ALL daily word counts for this month
    const dailyCountsSnapshot = await userRef
      .collection('dailyWordCounts')
      .where('date', '>=', monthKey)
      .get();
    
    // Sum up all daily word counts
    let monthlyTotal = 0;
    dailyCountsSnapshot.forEach(doc => {
      monthlyTotal += doc.data().wordCount || 0;
    });
    
    console.log(`Monthly word count total: ${monthlyTotal}`);
    
    // Find active monthly word count quest
    const questsSnapshot = await userRef
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
    for (const doc of questsSnapshot.docs) {
      const quest = doc.data();
      const isCompleted = monthlyTotal >= quest.target;
      const wasCompleted = quest.status === 'completed';
      
      await doc.ref.update({
        progress: monthlyTotal, // ✅ SET to total, don't add
        status: isCompleted ? 'completed' : 'active',
        completedAt: isCompleted ? new Date() : null
      });
      
      // Award XP if just completed (not already completed)
      if (isCompleted && !wasCompleted) {
        await awardQuestXP(userRef, quest.reward.xp);
      }
      
      console.log(`Updated word count quest: ${monthlyTotal}/${quest.target}`);
    }
  } catch (err) {
    console.error('Error updating monthly word count quest:', err);
  }
}

// ✅ NEW: Helper function to award XP (reduces code duplication)
async function awardQuestXP(userRef, xpAmount) {
  try {
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { 
      totalXP: 0, 
      currentLevel: 1, 
      questsCompleted: 0 
    };
    
    const newTotalXP = (userData.totalXP || 0) + xpAmount;
    const currentLevel = calculateLevel(newTotalXP);
    
    await userRef.set({
      totalXP: newTotalXP,
      currentLevel,
      questsCompleted: (userData.questsCompleted || 0) + 1
    }, { merge: true });
    
    console.log(`Awarded ${xpAmount} XP. New total: ${newTotalXP}`);
  } catch (err) {
    console.error('Error awarding XP:', err);
  }
}

// Keep your existing checkAndGenerateQuests function
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
