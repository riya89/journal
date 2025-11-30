# Quest System Backend Implementation

## Overview
Add these endpoints to your existing `journal.js` router file in your backend repository.

---

## 1. Quest Templates (Add to top of file after imports)

```javascript
// ==========================================
// 📋 QUEST TEMPLATES
// ==========================================

const DAILY_QUEST_TEMPLATES = [
  {
    id: 'daily_write_100',
    title: 'Write 100 words',
    description: 'Express yourself with at least 100 words today',
    target: 100,
    reward: { xp: 10, badge: null },
    trackingType: 'word_count'
  },
  {
    id: 'daily_complete_3_tasks',
    title: 'Complete 3 tasks',
    description: 'Check off 3 tasks from your planner',
    target: 3,
    reward: { xp: 15, badge: null },
    trackingType: 'task_completion'
  },
  {
    id: 'daily_journal_entry',
    title: 'Write a journal entry',
    description: 'Create at least one journal entry today',
    target: 1,
    reward: { xp: 10, badge: null },
    trackingType: 'journal_entry'
  },
  {
    id: 'daily_mood_check',
    title: 'Log your mood',
    description: 'Record how you\'re feeling today',
    target: 1,
    reward: { xp: 5, badge: null },
    trackingType: 'mood_log'
  }
];

const WEEKLY_QUEST_TEMPLATES = [
  {
    id: 'weekly_journal_5_days',
    title: 'Journal 5 days this week',
    description: 'Write journal entries on 5 different days',
    target: 5,
    reward: { xp: 50, badge: null },
    trackingType: 'journal_days'
  },
  {
    id: 'weekly_maintain_streak',
    title: 'Maintain your streak',
    description: 'Don\'t miss a day of journaling this week',
    target: 7,
    reward: { xp: 75, badge: null },
    trackingType: 'streak_days'
  },
  {
    id: 'weekly_complete_20_tasks',
    title: 'Complete 20 tasks',
    description: 'Check off 20 tasks from your planner this week',
    target: 20,
    reward: { xp: 60, badge: null },
    trackingType: 'task_completion'
  },
  {
    id: 'weekly_try_3_categories',
    title: 'Try 3 task categories',
    description: 'Complete tasks from at least 3 different categories',
    target: 3,
    reward: { xp: 40, badge: null },
    trackingType: 'category_variety'
  }
];

const MONTHLY_QUEST_TEMPLATES = [
  {
    id: 'monthly_20_entries',
    title: 'Write 20 journal entries',
    description: 'Create 20 journal entries this month',
    target: 20,
    reward: { xp: 150, badge: null },
    trackingType: 'journal_entry'
  },
  {
    id: 'monthly_all_categories',
    title: 'Try all task categories',
    description: 'Complete tasks from every category',
    target: 6,
    reward: { xp: 100, badge: null },
    trackingType: 'category_variety'
  },
  {
    id: 'monthly_perfect_week',
    title: 'Achieve a perfect week',
    description: 'Complete all tasks for 7 consecutive days',
    target: 7,
    reward: { xp: 200, badge: 'perfect_week' },
    trackingType: 'perfect_days'
  },
  {
    id: 'monthly_5000_words',
    title: 'Write 5,000 words',
    description: 'Write a total of 5,000 words this month',
    target: 5000,
    reward: { xp: 175, badge: null },
    trackingType: 'word_count'
  }
];
```

---

## 2. Helper Functions (Add before endpoints)

```javascript
// ==========================================
// 🎮 QUEST HELPER FUNCTIONS
// ==========================================

/**
 * Calculate user level based on total XP
 */
function calculateLevel(totalXP) {
  const levels = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000, 26000, 33000, 41000, 50000];
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i]) {
      return i + 1;
    }
  }
  
  return 1;
}

/**
 * Calculate XP required for next level
 */
function calculateXPForNextLevel(currentLevel) {
  const levels = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000, 26000, 33000, 41000, 50000];
  
  if (currentLevel >= levels.length) {
    return levels[levels.length - 1] + (currentLevel - levels.length + 1) * 10000;
  }
  
  return levels[currentLevel];
}

/**
 * Select random templates ensuring variety
 */
function selectRandomTemplates(templates, count) {
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate quests for a user
 */
async function generateQuests(userId, now, type) {
  const userRef = db.collection("users").doc(userId);
  const questsRef = userRef.collection("quests");
  const generatedQuests = [];

  if (type === 'daily') {
    const templates = selectRandomTemplates(DAILY_QUEST_TEMPLATES, 2);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    for (const template of templates) {
      const questRef = questsRef.doc();
      const quest = {
        userId,
        type: 'daily',
        title: template.title,
        description: template.description,
        target: template.target,
        progress: 0,
        reward: template.reward,
        status: 'active',
        trackingType: template.trackingType,
        createdAt: now,
        expiresAt: endOfDay,
        completedAt: null
      };

      await questRef.set(quest);
      generatedQuests.push({ id: questRef.id, ...quest });
    }
  } else if (type === 'weekly') {
    const templates = selectRandomTemplates(WEEKLY_QUEST_TEMPLATES, 2);
    const endOfWeek = new Date(now);
    const daysUntilSunday = 7 - now.getDay();
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);

    for (const template of templates) {
      const questRef = questsRef.doc();
      const quest = {
        userId,
        type: 'weekly',
        title: template.title,
        description: template.description,
        target: template.target,
        progress: 0,
        reward: template.reward,
        status: 'active',
        trackingType: template.trackingType,
        createdAt: now,
        expiresAt: endOfWeek,
        completedAt: null
      };

      await questRef.set(quest);
      generatedQuests.push({ id: questRef.id, ...quest });
    }
  } else if (type === 'monthly') {
    const templates = selectRandomTemplates(MONTHLY_QUEST_TEMPLATES, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    for (const template of templates) {
      const questRef = questsRef.doc();
      const quest = {
        userId,
        type: 'monthly',
        title: template.title,
        description: template.description,
        target: template.target,
        progress: 0,
        reward: template.reward,
        status: 'active',
        trackingType: template.trackingType,
        createdAt: now,
        expiresAt: endOfMonth,
        completedAt: null
      };

      await questRef.set(quest);
      generatedQuests.push({ id: questRef.id, ...quest });
    }
  }

  return generatedQuests;
}

/**
 * Check if user needs new quest generation
 */
async function checkAndGenerateQuests(userId) {
  const now = new Date();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};
  
  const lastGen = userData.lastQuestGeneration || {};
  const nowDate = now.toISOString().split('T')[0];
  
  const newQuests = [];

  // Check daily
  if (!lastGen.daily || lastGen.daily.split('T')[0] !== nowDate) {
    const dailyQuests = await generateQuests(userId, now, 'daily');
    newQuests.push(...dailyQuests);
    lastGen.daily = now.toISOString();
  }

  // Check weekly (Monday)
  const nowDay = now.getDay();
  const lastWeeklyDate = lastGen.weekly ? new Date(lastGen.weekly) : null;
  if (!lastWeeklyDate || (nowDay === 1 && now - lastWeeklyDate > 7 * 24 * 60 * 60 * 1000)) {
    const weeklyQuests = await generateQuests(userId, now, 'weekly');
    newQuests.push(...weeklyQuests);
    lastGen.weekly = now.toISOString();
  }

  // Check monthly (1st of month)
  const lastMonthlyDate = lastGen.monthly ? new Date(lastGen.monthly) : null;
  if (!lastMonthlyDate || (now.getDate() === 1 && (!lastMonthlyDate || lastMonthlyDate.getMonth() !== now.getMonth()))) {
    const monthlyQuests = await generateQuests(userId, now, 'monthly');
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

## 3. Quest Endpoints (Add to your router)

```javascript
// ==========================================
// 🎮 QUEST SYSTEM ENDPOINTS
// ==========================================

/**
 * GET /journal/quests/active
 * Get all active quests for a user
 */
router.get("/quests/active", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const now = new Date();

    // Check and generate new quests if needed
    await checkAndGenerateQuests(userId);

    // Get active quests
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");
    const snapshot = await questsRef
      .where("status", "==", "active")
      .where("expiresAt", ">", now)
      .get();

    const quests = { daily: [], weekly: [], monthly: [] };

    snapshot.forEach(doc => {
      const quest = { id: doc.id, ...doc.data() };
      // Convert Firestore Timestamp to ISO string
      if (quest.createdAt && quest.createdAt.toDate) {
        quest.createdAt = quest.createdAt.toDate().toISOString();
      }
      if (quest.expiresAt && quest.expiresAt.toDate) {
        quest.expiresAt = quest.expiresAt.toDate().toISOString();
      }
      if (quest.completedAt && quest.completedAt.toDate) {
        quest.completedAt = quest.completedAt.toDate().toISOString();
      }
      quests[quest.type].push(quest);
    });

    res.json(quests);
  } catch (err) {
    console.error("Error fetching active quests:", err);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

/**
 * POST /journal/quests/progress
 * Update progress for a specific quest
 */
router.post("/quests/progress", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { questId, progress } = req.body;

    if (!questId || progress === undefined) {
      return res.status(400).json({ error: "Missing required fields: questId, progress" });
    }

    const userRef = db.collection("users").doc(userId);
    const questRef = userRef.collection("quests").doc(questId);
    const questDoc = await questRef.get();

    if (!questDoc.exists) {
      return res.status(404).json({ error: "Quest not found" });
    }

    const quest = questDoc.data();

    // Check if quest is expired
    const expiresAt = quest.expiresAt.toDate ? quest.expiresAt.toDate() : new Date(quest.expiresAt);
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: "Quest has expired" });
    }

    // Update progress
    const newProgress = Math.min(progress, quest.target);
    const completed = newProgress >= quest.target;

    await questRef.update({
      progress: newProgress,
      status: completed ? "completed" : "active",
      completedAt: completed ? new Date() : null
    });

    let newLevel = null;

    // Award XP if completed
    if (completed && quest.status !== "completed") {
      const userDoc = await userRef.get();
      const userData = userDoc.exists ? userDoc.data() : {
        totalXP: 0,
        currentLevel: 1,
        questsCompleted: 0
      };

      const newTotalXP = (userData.totalXP || 0) + quest.reward.xp;
      const currentLevel = calculateLevel(newTotalXP);
      const leveledUp = currentLevel > (userData.currentLevel || 1);

      if (leveledUp) {
        newLevel = currentLevel;
      }

      await userRef.set({
        totalXP: newTotalXP,
        currentLevel,
        questsCompleted: (userData.questsCompleted || 0) + 1
      }, { merge: true });
    }

    res.json({
      completed,
      reward: completed ? quest.reward : null,
      newLevel
    });
  } catch (err) {
    console.error("Error updating quest progress:", err);
    res.status(500).json({ error: "Failed to update quest progress" });
  }
});

/**
 * POST /journal/quests/complete
 * Mark a quest as completed
 */
router.post("/quests/complete", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { questId } = req.body;

    if (!questId) {
      return res.status(400).json({ error: "Missing required field: questId" });
    }

    const userRef = db.collection("users").doc(userId);
    const questRef = userRef.collection("quests").doc(questId);
    const questDoc = await questRef.get();

    if (!questDoc.exists) {
      return res.status(404).json({ error: "Quest not found" });
    }

    const quest = questDoc.data();

    // Update quest to completed
    await questRef.update({
      progress: quest.target,
      status: "completed",
      completedAt: new Date()
    });

    // Award XP
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {
      totalXP: 0,
      currentLevel: 1,
      questsCompleted: 0
    };

    const newTotalXP = (userData.totalXP || 0) + quest.reward.xp;
    const currentLevel = calculateLevel(newTotalXP);
    const leveledUp = currentLevel > (userData.currentLevel || 1);

    await userRef.set({
      totalXP: newTotalXP,
      currentLevel,
      questsCompleted: (userData.questsCompleted || 0) + 1
    }, { merge: true });

    res.json({
      completed: true,
      reward: quest.reward,
      newLevel: leveledUp ? currentLevel : null
    });
  } catch (err) {
    console.error("Error completing quest:", err);
    res.status(500).json({ error: "Failed to complete quest" });
  }
});

/**
 * GET /journal/user/xp
 * Get user's XP and level information
 */
router.get("/user/xp", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    const userData = userDoc.exists ? userDoc.data() : {
      totalXP: 0,
      currentLevel: 1
    };

    const totalXP = userData.totalXP || 0;
    const currentLevel = userData.currentLevel || 1;
    const xpForNextLevel = calculateXPForNextLevel(currentLevel);

    res.json({
      totalXP,
      currentLevel,
      xpForNextLevel,
      xpProgress: totalXP,
      levelUpThreshold: xpForNextLevel
    });
  } catch (err) {
    console.error("Error fetching user XP:", err);
    res.status(500).json({ error: "Failed to fetch user XP" });
  }
});

/**
 * GET /journal/user/stats
 * Get detailed user statistics
 */
router.get("/user/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.json({
        totalXP: 0,
        currentLevel: 1,
        questsCompleted: 0,
        stats: {
          totalJournalEntries: 0,
          totalTasksCompleted: 0,
          longestStreak: 0,
          perfectDays: 0
        }
      });
    }

    const userData = userDoc.data();
    res.json({
      totalXP: userData.totalXP || 0,
      currentLevel: userData.currentLevel || 1,
      questsCompleted: userData.questsCompleted || 0,
      stats: userData.stats || {
        totalJournalEntries: 0,
        totalTasksCompleted: 0,
        longestStreak: 0,
        perfectDays: 0
      }
    });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});
```

---

## 4. Firestore Collection Structure

The quest system uses the following Firestore structure:

```
users/{uid}/
  ├── totalXP: number
  ├── currentLevel: number
  ├── questsCompleted: number
  ├── lastQuestGeneration: {
  │     daily: timestamp,
  │     weekly: timestamp,
  │     monthly: timestamp
  │   }
  └── quests/{questId}/
        ├── userId: string
        ├── type: "daily" | "weekly" | "monthly"
        ├── title: string
        ├── description: string
        ├── target: number
        ├── progress: number
        ├── reward: { xp: number, badge: string | null }
        ├── status: "active" | "completed" | "expired"
        ├── trackingType: string
        ├── createdAt: timestamp
        ├── expiresAt: timestamp
        └── completedAt: timestamp | null
```

---

## 5. Testing the Endpoints

After adding the code, test with:

```bash
# Get active quests
GET http://localhost:8000/journal/quests/active
Authorization: Bearer {token}

# Update quest progress
POST http://localhost:8000/journal/quests/progress
Authorization: Bearer {token}
{
  "questId": "quest_123",
  "progress": 50
}

# Complete quest
POST http://localhost:8000/journal/quests/complete
Authorization: Bearer {token}
{
  "questId": "quest_123"
}

# Get user XP
GET http://localhost:8000/journal/user/xp
Authorization: Bearer {token}

# Get user stats
GET http://localhost:8000/journal/user/stats
Authorization: Bearer {token}
```

---

## Implementation Complete ✅

All quest system endpoints are now ready to be added to your backend!
