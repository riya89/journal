# Monthly Planner - Backend Endpoints

Add these endpoints to your `journal.js` router file:

```javascript
// ==========================================
// 📋 MONTHLY PLANNER ENDPOINTS
// ==========================================

// 1. Get planner data for a specific month
router.get("/planner/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params; // Format: "2024-11"
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    
    const doc = await plannerRef.get();
    
    if (doc.exists) {
      res.json(doc.data());
    } else {
      // Return empty planner structure
      res.json({
        yearMonth,
        tasks: [],
        completions: {}
      });
    }
  } catch (err) {
    console.error("Error fetching planner:", err);
    res.status(500).json({ error: "Failed to fetch planner" });
  }
});

// 2. Add new task
router.post("/planner/task", verifyToken, async (req, res) => {
  try {
    const { yearMonth, name, category } = req.body;
    
    if (!yearMonth || !name || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    
    const doc = await plannerRef.get();
    const data = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {} };
    
    // Create new task
    const newTask = {
      id: `task_${Date.now()}`,
      name,
      category,
      createdAt: new Date().toISOString(),
      order: data.tasks.length
    };
    
    data.tasks.push(newTask);
    
    await plannerRef.set(data);
    
    res.json({ success: true, task: newTask });
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// 3. Delete task
router.delete("/planner/task/:yearMonth/:taskId", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskId } = req.params;
    
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    
    const doc = await plannerRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Planner not found" });
    }
    
    const data = doc.data();
    data.tasks = data.tasks.filter(t => t.id !== taskId);
    
    // Remove completions for this task
    Object.keys(data.completions).forEach(date => {
      data.completions[date] = data.completions[date].filter(id => id !== taskId);
    });
    
    await plannerRef.set(data);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// 4. Toggle task completion
router.post("/planner/toggle", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskId, date, completed } = req.body;
    
    if (!yearMonth || !taskId || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    
    const doc = await plannerRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Planner not found" });
    }
    
    const data = doc.data();
    
    if (!data.completions[date]) {
      data.completions[date] = [];
    }
    
    if (completed) {
      // Add task to completions if not already there
      if (!data.completions[date].includes(taskId)) {
        data.completions[date].push(taskId);
      }
    } else {
      // Remove task from completions
      data.completions[date] = data.completions[date].filter(id => id !== taskId);
    }
    
    await plannerRef.set(data);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error toggling task:", err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

// 5. Get stats for dopamine graph
router.get("/planner/stats/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    
    const doc = await plannerRef.get();
    
    if (!doc.exists) {
      return res.json({ dailyStats: [] });
    }
    
    const data = doc.data();
    const totalTasks = data.tasks.length;
    
    // Calculate stats for each day
    const dailyStats = [];
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${yearMonth}-${String(day).padStart(2, '0')}`;
      const completed = data.completions[date]?.length || 0;
      
      dailyStats.push({
        date,
        day,
        planned: totalTasks,
        completed
      });
    }
    
    res.json({ dailyStats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
```

## Firestore Structure

```
users/{uid}/
  └── planners/{yearMonth}/  // e.g., "2024-11"
        ├── yearMonth: "2024-11"
        ├── tasks: [
        │     {
        │       id: "task_1234567890",
        │       name: "Exercise",
        │       category: "health",
        │       createdAt: "2024-11-21T10:00:00Z",
        │       order: 0
        │     }
        │   ]
        └── completions: {
              "2024-11-01": ["task_1234567890", "task_9876543210"],
              "2024-11-02": ["task_1234567890"],
              ...
            }
```

## Testing

1. Add these endpoints to your `journal.js` file
2. Restart your backend server
3. Navigate to `/monthly-planner` in your app
4. Try adding tasks, checking them off, and viewing the dopamine graph!
