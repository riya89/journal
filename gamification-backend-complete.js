// ==========================================
// 🎮 COMPLETE GAMIFICATION SYSTEM BACKEND
// ==========================================
// Add these sections to your existing journal.js router

import express from "express";
import { db, auth } from "../firebase.js";

const router = express.Router();

// 🔐 Middleware (you already have this)
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

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

// ==========================================
// 🎮 HELPER FUNCTIONS
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
 * Calculate expiration date for quest period
 */
function calculateExpirationDate(period) {
  const now = new Date();
  
  switch (period) {
    case 'daily':
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay;
    
    case 'weekly':
      const endOfWeek = new Date(now);
      const daysUntilSaturday = 6 - now.getDay();
      endOfWeek.setDate(now.getDate() + daysUntilSaturday);
      endOfWeek.setHours(23, 59, 59, 999);
      return endOfWeek;
    
    case 'monthly':
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return endOfMonth;
    
    default:
      return now;
  }
}

/**
 * Check if new quests should be generated for a period
 */
function shouldGenerateNewQuests(lastGeneration, period) {
  if (!lastGeneration) return true;

  const now = new Date();
  const lastGen = new Date(lastGeneration);

  switch (period) {
    case 'daily':
      return now.toDateString() !== lastGen.toDateString();
    
    case 'weekly':
      const nowWeekStart = new Date(now);
      nowWeekStart.setDate(now.getDate() - now.getDay());
      nowWeekStart.setHours(0, 0, 0, 0);
      
      const lastWeekStart = new Date(lastGen);
      lastWeekStart.setDate(lastGen.getDate() - lastGen.getDay());
      lastWeekStart.setHours(0, 0, 0, 0);
      
      return nowWeekStart.getTime() > lastWeekStart.getTime();
    
    case 'monthly':
      return now.getMonth() !== lastGen.getMonth() || 
             now.getFullYear() !== lastGen.getFullYear();
    
    default:
      return false;
  }
}

/**
 * Generate quests for a specific period
 */
async function generateQuestsForPeriod(userId, period) {
  const userRef = db.collection("users").doc(userId);
  const questsRef = userRef.collection("quests");
  const generatedQuests = [];
  const now = new Date();

  let templates, count;
  
  if (period === 'daily') {
    templates = selectRandomTemplates(DAILY_QUEST_TEMPLATES, 2);
    count = 2;
  } else if (period === 'weekly') {
    templates = selectRandomTemplates(WEEKLY_QUEST_TEMPLATES, 2);
    count = 2;
  } else if (period === 'monthly') {
    templates = selectRandomTemplates(MONTHLY_QUEST_TEMPLATES, 1);
    count = 1;
  }

  const expiresAt = calculateExpirationDate(period);

  for (const template of templates) {
    const questRef = questsRef.doc();
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
      expiredAt: null
    };

    await questRef.set(quest);
    generatedQuests.push({ id: questRef.id, ...quest });
  }

  return generatedQuests;
}

/**
 * Check and generate new quests if needed
 */
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

// ==========================================
// 🎯 QUEST ENDPOINTS
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
    const { questType, progress, date, metadata } = req.body;

    if (!questType || progress === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");
    
    // Find active quest of this type
    const snapshot = await questsRef
      .where("status", "==", "active")
      .where("trackingType", "==", questType)
      .get();

    if (snapshot.empty) {
      return res.json({ message: "No active quest found for this type" });
    }

    const completedQuests = [];

    for (const doc of snapshot.docs) {
      const quest = doc.data();
      const questRef = questsRef.doc(doc.id);

      // Check if quest is expired
      const expiresAt = quest.expiresAt.toDate ? quest.expiresAt.toDate() : new Date(quest.expiresAt);
      if (expiresAt < new Date()) {
        continue;
      }

      // Update progress
      const newProgress = Math.min(quest.progress + progress, quest.target);
      const completed = newProgress >= quest.target;

      await questRef.update({
        progress: newProgress,
        status: completed ? "completed" : "active",
        completedAt: completed ? new Date() : null
      });

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

        await userRef.set({
          totalXP: newTotalXP,
          currentLevel,
          questsCompleted: (userData.questsCompleted || 0) + 1
        }, { merge: true });

        completedQuests.push({
          id: doc.id,
          title: quest.title,
          reward: quest.reward,
          leveledUp,
          newLevel: leveledUp ? currentLevel : null
        });
      }
    }

    res.json({
      success: true,
      completedQuests
    });
  } catch (err) {
    console.error("Error updating quest progress:", err);
    res.status(500).json({ error: "Failed to update quest progress" });
  }
});

/**
 * POST /journal/quests/check-completions
 * Check for completed quests and return rewards
 */
router.post("/quests/check-completions", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");

    // Get all completed quests that haven't been acknowledged
    const snapshot = await questsRef
      .where("status", "==", "completed")
      .get();

    const completedQuests = [];
    let totalXP = 0;

    snapshot.forEach(doc => {
      const quest = doc.data();
      completedQuests.push({
        id: doc.id,
        title: quest.title,
        reward: quest.reward
      });
      totalXP += quest.reward.xp;
    });

    res.json({
      completedQuests,
      xpAwarded: totalXP,
      leveledUp: false // This would be calculated based on XP
    });
  } catch (err) {
    console.error("Error checking quest completions:", err);
    res.status(500).json({ error: "Failed to check completions" });
  }
});

/**
 * POST /journal/quests/check-expiration
 * Check for expired quests and generate new ones
 */
router.post("/quests/check-expiration", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const now = new Date();
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");

    // Find all active quests
    const activeQuests = await questsRef
      .where("status", "==", "active")
      .get();

    const expiredQuests = [];

    // Check each quest for expiration
    for (const doc of activeQuests.docs) {
      const quest = doc.data();
      const expiresAt = quest.expiresAt.toDate ? quest.expiresAt.toDate() : new Date(quest.expiresAt);
      
      if (now > expiresAt) {
        // Mark quest as expired
        await questsRef.doc(doc.id).update({
          status: 'expired',
          expiredAt: now
        });
        
        expiredQuests.push({
          id: doc.id,
          type: quest.type,
          title: quest.title,
          status: 'expired'
        });
      }
    }

    // Generate new quests if needed
    const newQuests = await checkAndGenerateQuests(userId);

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

/**
 * GET /journal/quests/last-generation
 * Get last quest generation timestamps
 */
router.get("/quests/last-generation", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const lastGeneration = userData.lastQuestGeneration || {};
    
    res.json({
      daily: lastGeneration.daily || null,
      weekly: lastGeneration.weekly || null,
      monthly: lastGeneration.monthly || null
    });
  } catch (err) {
    console.error("Error fetching last generation:", err);
    res.status(500).json({ error: "Failed to fetch last generation" });
  }
});

/**
 * POST /journal/quests/rotate
 * Manually rotate quests for a specific period (testing)
 */
router.post("/quests/rotate", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { period } = req.body;

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: "Invalid period" });
    }

    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");

    // Mark all active quests of this period as expired
    const activeQuests = await questsRef
      .where("type", "==", period)
      .where("status", "==", "active")
      .get();

    const batch = db.batch();
    activeQuests.forEach(doc => {
      batch.update(doc.ref, {
        status: 'expired',
        expiredAt: new Date()
      });
    });
    await batch.commit();

    // Generate new quests
    const newQuests = await generateQuestsForPeriod(userId, period);

    // Update last generation timestamp
    await userRef.set({
      lastQuestGeneration: {
        [period]: new Date().toISOString()
      }
    }, { merge: true });

    res.json({
      success: true,
      newQuests,
      message: `Generated ${newQuests.length} new ${period} quest(s)`
    });
  } catch (err) {
    console.error("Error rotating quests:", err);
    res.status(500).json({ error: "Failed to rotate quests" });
  }
});

// ==========================================
// 💎 XP AND LEVELING ENDPOINTS
// ==========================================

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
        earnedBadges: [],
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
      earnedBadges: userData.earnedBadges || [],
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

// ==========================================
// 🏆 BADGE ENDPOINTS
// ==========================================

/**
 * POST /journal/user/badge/award
 * Award a badge to a user
 */
router.post("/user/badge/award", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { badgeId } = req.body;

    if (!badgeId) {
      return res.status(400).json({ error: "Missing badgeId" });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { earnedBadges: [] };

    // Check if badge already earned
    if (userData.earnedBadges && userData.earnedBadges.includes(badgeId)) {
      return res.json({
        success: false,
        message: "Badge already earned"
      });
    }

    // Add badge to user's earned badges
    const earnedBadges = userData.earnedBadges || [];
    earnedBadges.push(badgeId);

    await userRef.set({
      earnedBadges
    }, { merge: true });

    res.json({
      success: true,
      badge: {
        id: badgeId,
        earnedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("Error awarding badge:", err);
    res.status(500).json({ error: "Failed to award badge" });
  }
});

// ==========================================
// 🎉 CELEBRATION ENDPOINT
// ==========================================

/**
 * GET /journal/planner/daily-status
 * Check if all tasks are completed for a specific day
 */
router.get("/planner/daily-status", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const dateParam = req.query.date;
    const yearMonth = dateParam ? dateParam.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const dateStr = dateParam || new Date().toISOString().split('T')[0];

    const userRef = db.collection("users").doc(userId);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const plannerDoc = await plannerRef.get();

    if (!plannerDoc.exists) {
      return res.json({
        allTasksComplete: false,
        stats: {
          totalTime: "0h 0m",
          tasksCompleted: 0,
          totalTasks: 0,
          streakDays: 0
        },
        reward: null
      });
    }

    const plannerData = plannerDoc.data();
    const dayTasks = plannerData.tasks || [];
    const dayCompletions = plannerData.completions?.[dateStr] || [];

    const totalTasks = dayTasks.length;
    const completedTasks = dayCompletions.length;
    const allTasksComplete = totalTasks > 0 && completedTasks === totalTasks;

    // Calculate total time
    let totalMinutes = 0;
    dayTasks.forEach(task => {
      if (dayCompletions.includes(task.id)) {
        totalMinutes += task.timeEstimate || 0;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Get streak from user data
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const streakDays = userData.currentStreak || 0;

    // Award Perfect Day badge if all tasks complete
    let reward = null;
    if (allTasksComplete) {
      const earnedBadges = userData.earnedBadges || [];
      const perfectDayBadgeId = `perfect_day_${dateStr}`;
      
      if (!earnedBadges.includes(perfectDayBadgeId)) {
        reward = {
          type: "badge",
          name: "Perfect Day",
          icon: "⭐",
          rarity: "rare"
        };

        earnedBadges.push(perfectDayBadgeId);
        const currentPerfectDays = userData.stats?.perfectDays || 0;

        await userRef.set({
          earnedBadges,
          stats: {
            ...userData.stats,
            perfectDays: currentPerfectDays + 1
          }
        }, { merge: true });
      }
    }

    res.json({
      allTasksComplete,
      stats: {
        totalTime,
        tasksCompleted: completedTasks,
        totalTasks,
        streakDays
      },
      reward
    });
  } catch (err) {
    console.error("Error checking daily status:", err);
    res.status(500).json({ error: "Failed to check daily status" });
  }
});

// ==========================================
// 💙 STREAK RECOVERY ENDPOINT
// ==========================================

/**
 * GET /journal/streak/recovery-message
 * Get compassionate message for broken streak
 */
router.get("/streak/recovery-message", verifyToken, async (req, res) => {
  try {
    // Fetch streak data from Raindrop
    const streakResponse = await fetch(`${process.env.RAINDROP_URL}/analytics/streaks?uid=${req.uid}`);
    
    if (!streakResponse.ok) {
      throw new Error('Failed to fetch streak data');
    }

    const streakData = await streakResponse.json();

    if (!streakData.streakBroken) {
      return res.json({ message: null });
    }

    const messages = {
      title: "Hey, are you okay? 💙",
      body: "We noticed you missed yesterday. Life happens, and that's completely okay.",
      encouragement: `Your ${streakData.previousStreak}-day streak was amazing! Ready to start fresh today?`,
      previousStreak: streakData.previousStreak
    };

    res.json(messages);
  } catch (err) {
    console.error("Error generating recovery message:", err);
    res.status(500).json({ error: "Failed to generate recovery message" });
  }
});

export default router;
