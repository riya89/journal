# Backend Changes Summary

This document outlines all backend changes needed across your Raindrop and Node.js backends to support the four new feature areas.

## Raindrop Backend Changes (TypeScript)

### 1. Extended Mood History Endpoint

Add to your existing Raindrop service:

```typescript
// Add to router in fetch() method
if (path === "/analytics/mood/extended" && method === "GET") {
  const uid = url.searchParams.get("uid");
  const days = parseInt(url.searchParams.get("days") || "30");
  if (!uid) return this.json({ error: "uid required" }, 400);
  return this.getMoodExtended(uid, days);
}

// Add new method
async getMoodExtended(uid: string, days: number): Promise<Response> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    const rows = await this.env.JOURNALDB.prepare(`
      SELECT entry_date, mood
      FROM journal_entries
      WHERE uid = ?
      AND mood IS NOT NULL
      AND entry_date >= ?
      ORDER BY entry_date ASC
    `).bind(uid, cutoffStr).all<{ entry_date: string; mood: number }>();
    
    const moodData = rows.results.map(r => ({ 
      date: r.entry_date, 
      mood: r.mood 
    }));
    
    // Calculate stats
    const moods = moodData.map(m => m.mood);
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length || 0;
    
    // Calculate variance
    const variance = moods.length > 0 
      ? moods.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moods.length
      : 0;
    
    // Calculate trend
    let trend = "stable";
    if (moods.length >= 3) {
      const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
      const secondHalf = moods.slice(Math.floor(moods.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.3) trend = "improving";
      else if (secondAvg < firstAvg - 0.3) trend = "declining";
    }
    
    const bestDay = moodData.reduce((best, curr) => 
      curr.mood > best.mood ? curr : best, 
      { date: "", mood: 0 }
    );
    const worstDay = moodData.reduce((worst, curr) => 
      curr.mood < worst.mood ? curr : worst,
      { date: "", mood: 5 }
    );
    
    return this.json({
      uid,
      period: `${days} days`,
      moodData,
      stats: {
        averageMood: Math.round(avgMood * 10) / 10,
        moodVariance: Math.round(variance * 10) / 10,
        trend,
        bestDay,
        worstDay,
        daysTracked: moodData.length,
        missedDays: days - moodData.length
      }
    });
  } catch (e: unknown) {
    return this.json({ error: "extended mood fetch failed", details: String(e) }, 500);
  }
}
```

### 2. Enhanced Streak Detection

Modify your existing `getStreaks()` method to include additional fields:

```typescript
// In your existing getStreaks() method, enhance the return to include:
return this.json({
  uid,
  currentStreak,
  longestStreak,
  lastEntryDate,
  totalEntries: dates.length,
  newlyEarned,
  isStreakActive,
  // ADD THESE NEW FIELDS:
  streakBroken: !isStreakActive && dates.length > 0,
  missedDays: !isStreakActive && dates.length > 0 
    ? Math.floor((today.getTime() - new Date(lastEntryDate).getTime()) / 86400000) - 1
    : 0,
  previousStreak: !isStreakActive ? longestStreak : 0
});
```

## Node.js Backend Changes (Express)

### 1. Quest System Endpoints

Add to your `journal.js` routes:

```javascript
// Quest endpoints
router.get("/quests/active", verifyToken, async (req, res) => {
  try {
    const userRef = db.collection("users").doc(req.uid);
    const questsRef = userRef.collection("quests");
    
    const now = new Date();
    const snapshot = await questsRef
      .where("status", "==", "active")
      .where("expiresAt", ">", now)
      .get();
    
    const quests = { daily: [], weekly: [], monthly: [] };
    snapshot.forEach(doc => {
      const quest = { id: doc.id, ...doc.data() };
      quests[quest.type].push(quest);
    });
    
    res.json(quests);
  } catch (err) {
    console.error("Error fetching quests:", err);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

router.post("/quests/progress", verifyToken, async (req, res) => {
  try {
    const { questId, progress } = req.body;
    const questRef = db.collection("users").doc(req.uid).collection("quests").doc(questId);
    const quest = await questRef.get();
    
    if (!quest.exists) {
      return res.status(404).json({ error: "Quest not found" });
    }
    
    const questData = quest.data();
    const completed = progress >= questData.target;
    
    await questRef.update({
      progress,
      status: completed ? "completed" : "active",
      completedAt: completed ? new Date() : null
    });
    
    let newLevel = null;
    if (completed) {
      // Award XP
      const userRef = db.collection("users").doc(req.uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data() || { totalXP: 0, currentLevel: 1 };
      
      const newXP = userData.totalXP + questData.reward.xp;
      const levelThreshold = userData.currentLevel * 100;
      
      if (newXP >= levelThreshold) {
        newLevel = userData.currentLevel + 1;
        await userRef.update({
          totalXP: newXP,
          currentLevel: newLevel
        });
      } else {
        await userRef.update({ totalXP: newXP });
      }
    }
    
    res.json({
      completed,
      reward: completed ? questData.reward : null,
      newLevel
    });
  } catch (err) {
    console.error("Error updating quest progress:", err);
    res.status(500).json({ error: "Failed to update quest progress" });
  }
});

router.get("/user/xp", verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.uid).get();
    const userData = userDoc.data() || { totalXP: 0, currentLevel: 1 };
    
    const xpForNextLevel = userData.currentLevel * 100;
    
    res.json({
      totalXP: userData.totalXP,
      currentLevel: userData.currentLevel,
      xpForNextLevel,
      xpProgress: userData.totalXP,
      levelUpThreshold: xpForNextLevel
    });
  } catch (err) {
    console.error("Error fetching XP:", err);
    res.status(500).json({ error: "Failed to fetch XP" });
  }
});
```

### 2. Streak Recovery Message

```javascript
router.get("/streak/recovery-message", verifyToken, async (req, res) => {
  try {
    // Fetch streak data from Raindrop
    const streakResponse = await fetch(
      `${process.env.RAINDROP_URL}/analytics/streaks?uid=${req.uid}`
    );
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
```

### 3. Post-Journal Task Check

```javascript
router.get("/post-save-check", verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const yearMonth = date.substring(0, 7);
    
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const plannerDoc = await plannerRef.get();
    
    if (!plannerDoc.exists) {
      return res.json({ hasTasks: false, todaysTasks: [] });
    }
    
    const plannerData = plannerDoc.data();
    const todaysTasks = plannerData.tasks.filter(task => {
      // Filter tasks for today (handle recurring tasks too)
      return true; // Simplified - implement your task filtering logic
    });
    
    const completions = plannerData.completions[date] || [];
    const tasksWithStatus = todaysTasks.map(task => ({
      ...task,
      completed: completions.includes(task.id)
    }));
    
    res.json({
      hasTasks: todaysTasks.length > 0,
      todaysTasks: tasksWithStatus,
      completionStats: {
        completed: completions.length,
        total: todaysTasks.length,
        percentage: Math.round((completions.length / todaysTasks.length) * 100)
      }
    });
  } catch (err) {
    console.error("Error fetching post-save check:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/quick-complete-tasks", verifyToken, async (req, res) => {
  try {
    const { date, taskIds } = req.body;
    const yearMonth = date.substring(0, 7);
    
    const plannerRef = db.collection("users").doc(req.uid).collection("planners").doc(yearMonth);
    const plannerDoc = await plannerRef.get();
    const plannerData = plannerDoc.data();
    
    if (!plannerData.completions[date]) {
      plannerData.completions[date] = [];
    }
    
    // Add task IDs to completions (avoid duplicates)
    taskIds.forEach(id => {
      if (!plannerData.completions[date].includes(id)) {
        plannerData.completions[date].push(id);
      }
    });
    
    await plannerRef.set(plannerData);
    
    const allTasksComplete = plannerData.tasks.length === plannerData.completions[date].length;
    
    res.json({
      success: true,
      completedCount: taskIds.length,
      allTasksComplete
    });
  } catch (err) {
    console.error("Error completing tasks:", err);
    res.status(500).json({ error: "Failed to complete tasks" });
  }
});
```

### 4. Weekly Summary

```javascript
router.get("/summary/weekly", verifyToken, async (req, res) => {
  try {
    const { endDate } = req.query;
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    
    // Fetch journals
    const journalsRef = db.collection("users").doc(req.uid).collection("journals");
    const journalsSnapshot = await journalsRef
      .where("date", ">=", start.toISOString().split('T')[0])
      .where("date", "<=", endDate)
      .get();
    
    const journals = [];
    journalsSnapshot.forEach(doc => journals.push(doc.data()));
    
    // Fetch planner data
    const yearMonth = endDate.substring(0, 7);
    const plannerDoc = await db.collection("users")
      .doc(req.uid)
      .collection("planners")
      .doc(yearMonth)
      .get();
    
    const plannerData = plannerDoc.exists ? plannerDoc.data() : { tasks: [], completions: {} };
    
    // Calculate stats
    const entriesWritten = journals.length;
    const moods = journals.map(j => j.mood).filter(m => m);
    const averageMood = moods.reduce((a, b) => a + b, 0) / moods.length || 0;
    const totalWords = journals.reduce((sum, j) => {
      return sum + (j.content || "").split(/\s+/).length;
    }, 0);
    
    let tasksCompleted = 0;
    let tasksPlanned = 0;
    let perfectDays = 0;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = plannerData.tasks; // Simplified
      const dayCompletions = plannerData.completions[dateStr] || [];
      
      tasksPlanned += dayTasks.length;
      tasksCompleted += dayCompletions.length;
      
      if (dayTasks.length > 0 && dayCompletions.length === dayTasks.length) {
        perfectDays++;
      }
    }
    
    const completionRate = tasksPlanned > 0 ? (tasksCompleted / tasksPlanned * 100) : 0;
    
    const highlights = [];
    if (completionRate >= 80) {
      highlights.push(`You completed ${Math.round(completionRate)}% of your planned tasks`);
    }
    if (entriesWritten === 7) {
      highlights.push("You wrote every day this week! 🔥");
    }
    
    res.json({
      week: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.getDate()}`,
      stats: {
        entriesWritten,
        tasksCompleted,
        tasksPlanned,
        completionRate: Math.round(completionRate),
        averageMood: Math.round(averageMood * 10) / 10,
        totalWords,
        streakMaintained: entriesWritten >= 6,
        perfectDays
      },
      highlights,
      insights: {
        bestDay: journals[0] || null,
        improvement: "Keep up the great work!",
        suggestion: "Try adding a morning routine task"
      }
    });
  } catch (err) {
    console.error("Error generating weekly summary:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});
```

### 5. Time Capsule Endpoints

```javascript
router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals } = req.body;
    
    const capsuleRef = db.collection("users")
      .doc(req.uid)
      .collection("timeCapsules")
      .doc();
    
    const unlockTimestamp = new Date(unlockDate);
    const daysUntilUnlock = Math.floor(
      (unlockTimestamp - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    await capsuleRef.set({
      capsuleId: capsuleRef.id,
      userId: req.uid,
      message,
      createdAt: new Date(),
      unlockDate: unlockTimestamp,
      currentMood,
      currentGoals,
      isUnlocked: false,
      unlockedAt: null,
      notificationSent: false
    });
    
    res.json({
      capsuleId: capsuleRef.id,
      unlockDate,
      daysUntilUnlock
    });
  } catch (err) {
    console.error("Error creating time capsule:", err);
    res.status(500).json({ error: "Failed to create time capsule" });
  }
});

router.get("/timecapsule/list", verifyToken, async (req, res) => {
  try {
    const capsulesRef = db.collection("users").doc(req.uid).collection("timeCapsules");
    const snapshot = await capsulesRef.orderBy("createdAt", "desc").get();
    
    const locked = [];
    const unlocked = [];
    const now = new Date();
    
    snapshot.forEach(doc => {
      const capsule = doc.data();
      const unlockDate = capsule.unlockDate.toDate();
      
      if (unlockDate <= now || capsule.isUnlocked) {
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0]
        });
      } else {
        const daysUntilUnlock = Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24));
        locked.push({
          capsuleId: capsule.capsuleId,
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          unlockDate: unlockDate.toISOString().split('T')[0],
          daysUntilUnlock
        });
      }
    });
    
    res.json({ locked, unlocked });
  } catch (err) {
    console.error("Error fetching time capsules:", err);
    res.status(500).json({ error: "Failed to fetch time capsules" });
  }
});
```

### 6. Gratitude Jar Endpoints

```javascript
router.post("/gratitude/add", verifyToken, async (req, res) => {
  try {
    const { gratitudeText, mood } = req.body;
    
    const gratitudeRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries")
      .doc();
    
    await gratitudeRef.set({
      gratitudeId: gratitudeRef.id,
      userId: req.uid,
      gratitudeText,
      date: new Date().toISOString().split('T')[0],
      mood,
      createdAt: new Date()
    });
    
    res.json({
      gratitudeId: gratitudeRef.id,
      success: true
    });
  } catch (err) {
    console.error("Error adding gratitude:", err);
    res.status(500).json({ error: "Failed to add gratitude" });
  }
});

router.get("/gratitude/random", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users").doc(req.uid).collection("gratitudeEntries");
    const snapshot = await gratitudesRef.get();
    
    if (snapshot.empty) {
      return res.json({ gratitude: null });
    }
    
    const gratitudes = [];
    snapshot.forEach(doc => gratitudes.push(doc.data()));
    
    const random = gratitudes[Math.floor(Math.random() * gratitudes.length)];
    
    res.json({
      gratitudeId: random.gratitudeId,
      gratitudeText: random.gratitudeText,
      date: random.date,
      mood: random.mood
    });
  } catch (err) {
    console.error("Error fetching random gratitude:", err);
    res.status(500).json({ error: "Failed to fetch gratitude" });
  }
});

router.get("/gratitude/all", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users").doc(req.uid).collection("gratitudeEntries");
    const snapshot = await gratitudesRef.orderBy("createdAt", "desc").get();
    
    const gratitudes = [];
    snapshot.forEach(doc => gratitudes.push(doc.data()));
    
    res.json({
      gratitudes,
      total: gratitudes.length
    });
  } catch (err) {
    console.error("Error fetching gratitudes:", err);
    res.status(500).json({ error: "Failed to fetch gratitudes" });
  }
});
```

### 7. AI Assistant Enhancements

```javascript
// Enhance existing /assistant/reply endpoint
router.post("/assistant/reply-with-context", verifyToken, async (req, res) => {
  const { message, sessionId, includeHistory } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "I'm here, tell me what's on your mind 🌿" });
  }
  
  try {
    let context = [];
    
    if (includeHistory && sessionId) {
      // Fetch recent conversation history
      const sessionRef = db.collection("users")
        .doc(req.uid)
        .collection("aiSessions")
        .doc(sessionId);
      
      const sessionDoc = await sessionRef.get();
      if (sessionDoc.exists) {
        const sessionData = sessionDoc.data();
        context = sessionData.messages.slice(-10); // Last 10 messages
      }
    }
    
    // Add current message to context
    context.push({ role: "user", content: message });
    
    // Build messages for Gemini
    const messages = [
      {
        role: "system",
        content: `You are a soft-spoken, gentle emotional companion.
Respond in under 2 sentences.
Tone: calming, validating, grounding.`
      },
      ...context.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }))
    ];
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map(m => ({
            parts: [{ text: m.content }]
          }))
        })
      }
    );
    
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                  "I'm here with you. Tell me more 🌿";
    
    // Save to session
    context.push({ role: "assistant", content: reply, timestamp: new Date() });
    
    const sessionRef = db.collection("users")
      .doc(req.uid)
      .collection("aiSessions")
      .doc(sessionId);
    
    await sessionRef.set({
      sessionId,
      messages: context,
      updatedAt: new Date()
    }, { merge: true });
    
    // Generate follow-up suggestions (simplified)
    const followUpSuggestions = [
      "Tell me more about that",
      "How does that make you feel?",
      "What would help right now?"
    ];
    
    res.json({
      reply,
      sessionId,
      messageId: `msg_${Date.now()}`,
      followUpSuggestions
    });
  } catch (err) {
    console.error("AI Assistant Error:", err);
    res.json({ reply: "I'm here for you… even if my mind is a little foggy right now 🌫️" });
  }
});

// Conversation history
router.get("/assistant/history", verifyToken, async (req, res) => {
  try {
    const sessionsRef = db.collection("users").doc(req.uid).collection("aiSessions");
    const snapshot = await sessionsRef.orderBy("updatedAt", "desc").limit(20).get();
    
    const sessions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      sessions.push({
        sessionId: doc.id,
        startedAt: data.messages[0]?.timestamp || data.updatedAt,
        endedAt: data.updatedAt,
        messageCount: data.messages.length,
        preview: data.messages[0]?.content.substring(0, 100) || "",
        themes: [] // Implement theme extraction
      });
    });
    
    res.json({ sessions, total: sessions.length });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});
```

## Summary

**Raindrop Changes:**
- Add `/analytics/mood/extended` endpoint
- Enhance `/analytics/streaks` response with `streakBroken`, `missedDays`, `previousStreak`

**Node.js Changes:**
- Add quest system endpoints (active, progress, XP)
- Add streak recovery message endpoint
- Add post-journal task check endpoints
- Add weekly summary endpoint
- Add time capsule endpoints (create, list)
- Add gratitude jar endpoints (add, random, all)
- Enhance AI assistant with context and history

All endpoints follow your existing patterns and integrate with Firebase Firestore.
