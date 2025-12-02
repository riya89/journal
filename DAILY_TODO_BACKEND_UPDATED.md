# Daily To-Do System - Updated Backend Implementation

## Overview

Automatic daily task system that:
- Always visible on home page (todo.png background)
- AI analyzes journal and auto-adds tasks (no modal)
- Tasks expire after 24 hours
- When new tasks come, removes completed ones, keeps uncompleted

## Backend Endpoints

Replace your existing `/analyze-for-tasks` endpoint with this new one:

```javascript
/**
 * POST /journal/daily-todos/add
 * Add a single task to daily to-do list
 */
router.post("/daily-todos/add", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { name, category, timeEstimate, reason } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Task name is required" });
    }
    
    const userRef = db.collection("users").doc(userId);
    const todosRef = userRef.collection("dailyTodos");
    
    // Clean up old completed tasks (older than 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const oldCompletedSnapshot = await todosRef
      .where("completed", "==", true)
      .where("createdAt", "<", oneDayAgo)
      .get();
    
    const batch = db.batch();
    oldCompletedSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Add new task
    const now = new Date();
    const todoRef = todosRef.doc();
    const todo = {
      name,
      category: category || 'other',
      timeEstimate: timeEstimate || 30,
      reason: reason || '',
      completed: false,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    batch.set(todoRef, todo);
    await batch.commit();
    
    res.json({
      success: true,
      todo: { id: todoRef.id, ...todo }
    });
  } catch (err) {
    console.error("Error adding daily todo:", err);
    res.status(500).json({ error: "Failed to add todo" });
  }
});

/**
 * Keep your existing /analyze-for-tasks endpoint
 * This returns suggestions for the modal, doesn't add them automatically
 */
router.post("/analyze-for-tasks", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { journalText, mood, date } = req.body;

    // Validate input
    if (!journalText || journalText.trim().length < 20) {
      return res.json({ tasksAdded: 0, message: "Journal entry too short" });
    }

    // Build AI prompt
    const prompt = `You are a helpful task planning assistant. Analyze this journal entry and suggest 2-3 actionable tasks.

Journal Entry:
"${journalText}"

Mood: ${mood}/5

Based on the journal content, suggest 2-3 specific, actionable tasks that would help the person.

Requirements:
- Tasks should be concrete and achievable
- Match the person's current emotional state (mood: ${mood}/5)
- Address themes or challenges mentioned in the journal
- Each task should take 15-60 minutes

Respond in this EXACT JSON format:
{
  "tasks": [
    {
      "name": "Task name (under 50 characters)",
      "category": "one of: self-care, exercise, productivity, social, creative, personal-growth",
      "timeEstimate": 30,
      "reason": "Why this task would help (one sentence)"
    }
  ]
}

Generate 2-3 tasks now:`;

    // Call Gemini AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse JSON from AI response
    let suggestedTasks = [];
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestedTasks = parsed.tasks || [];
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr);
      return res.json({ tasksAdded: 0, message: "Could not parse task suggestions" });
    }

    // Validate tasks
    const validTasks = suggestedTasks
      .filter(task => task.name && task.category)
      .map(task => ({
        name: task.name.substring(0, 100),
        category: task.category,
        timeEstimate: task.timeEstimate || 30,
        reason: task.reason || "Suggested based on your journal entry"
      }))
      .slice(0, 3); // Max 3 tasks

    if (validTasks.length === 0) {
      return res.json({ tasksAdded: 0, message: "No valid tasks generated" });
    }

    // Get user's existing daily todos
    const userRef = db.collection("users").doc(userId);
    const todosRef = userRef.collection("dailyTodos");
    
    // Remove completed tasks older than 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const oldCompletedSnapshot = await todosRef
      .where("completed", "==", true)
      .where("createdAt", "<", oneDayAgo)
      .get();
    
    const batch = db.batch();
    oldCompletedSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Add new tasks
    const now = new Date();
    for (const task of validTasks) {
      const todoRef = todosRef.doc();
      batch.set(todoRef, {
        ...task,
        completed: false,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
    }

    await batch.commit();

    console.log(`✅ Added ${validTasks.length} daily tasks for user ${userId}`);

    res.json({
      tasksAdded: validTasks.length,
      message: `Added ${validTasks.length} task(s) to your daily to-do list`
    });
  } catch (err) {
    console.error("Task analysis error:", err);
    res.json({
      tasksAdded: 0,
      message: "Task analysis unavailable"
    });
  }
});

/**
 * GET /journal/daily-todos
 * Get all active daily todos (not expired, not older than 24h)
 */
router.get("/daily-todos", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const todosRef = userRef.collection("dailyTodos");
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get todos created in last 24 hours
    const snapshot = await todosRef
      .where("createdAt", ">", oneDayAgo)
      .orderBy("createdAt", "desc")
      .get();
    
    const todos = [];
    snapshot.forEach(doc => {
      const todo = { id: doc.id, ...doc.data() };
      
      // Convert Firestore Timestamp to ISO string
      if (todo.createdAt && todo.createdAt.toDate) {
        todo.createdAt = todo.createdAt.toDate().toISOString();
      }
      if (todo.expiresAt && todo.expiresAt.toDate) {
        todo.expiresAt = todo.expiresAt.toDate().toISOString();
      }
      
      todos.push(todo);
    });
    
    res.json({ todos });
  } catch (err) {
    console.error("Error fetching daily todos:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

/**
 * POST /journal/daily-todos/:todoId/toggle
 * Toggle completion status of a daily todo
 */
router.post("/daily-todos/:todoId/toggle", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { todoId } = req.params;
    const { completed } = req.body;
    
    const userRef = db.collection("users").doc(userId);
    const todoRef = userRef.collection("dailyTodos").doc(todoId);
    
    await todoRef.update({
      completed,
      completedAt: completed ? new Date() : null
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error toggling todo:", err);
    res.status(500).json({ error: "Failed to toggle todo" });
  }
});
```

## Database Structure

```
users/{userId}/dailyTodos/{todoId}
  - name: string
  - category: string
  - timeEstimate: number
  - reason: string
  - completed: boolean
  - createdAt: timestamp
  - expiresAt: timestamp (24 hours from creation)
  - completedAt: timestamp (nullable)
```

## How It Works

1. **User writes journal** → Backend analyzes with AI
2. **AI suggests 2-3 tasks** → Automatically added to dailyTodos
3. **Tasks appear on home page** → In todo.png component
4. **User checks off tasks** → Marked as completed
5. **After 24 hours** → Completed tasks removed, uncompleted stay
6. **New journal entry** → New tasks added, old completed removed

## Key Features

- ✅ No modal interruption - tasks added automatically
- ✅ Always visible on home page
- ✅ 24-hour lifecycle
- ✅ Smart cleanup - removes completed, keeps uncompleted
- ✅ AI-powered suggestions based on journal content and mood
