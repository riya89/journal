# Allow Unticking Tasks on Future Dates

## Problem
Currently, you can only tick/untick tasks for today's date. You did some testing and ticked tasks on future dates, but now you can't untick them.

## Solution
Modify the backend to allow unticking (but not ticking) tasks on future dates.

## Backend Change

Find your `/planner/toggle` endpoint in your backend (likely in `backend/routes/journal.js` or similar).

### Current Code (Restrictive)
```javascript
router.post("/planner/toggle", verifyToken, async (req, res) => {
  try {
    const { taskId, date } = req.body;
    
    // Check if date is today
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) {
      return res.status(400).json({ 
        error: "Can only toggle tasks for today" 
      });
    }
    
    // ... rest of code
  }
});
```

### New Code (Allow Unticking Future Dates)
```javascript
router.post("/planner/toggle", verifyToken, async (req, res) => {
  try {
    const { taskId, date, completed } = req.body;
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const taskDate = new Date(date);
    const todayDate = new Date(today);
    
    // Check if trying to tick (complete) a future task
    if (taskDate > todayDate && completed === true) {
      return res.status(400).json({ 
        error: "Cannot complete tasks for future dates" 
      });
    }
    
    // Allow unticking any date (for testing/corrections)
    // Allow ticking only today or past dates
    
    // ... rest of your toggle code
  }
});
```

## Complete Example

Here's the complete endpoint with the fix:

```javascript
router.post("/planner/toggle", verifyToken, async (req, res) => {
  try {
    const { taskId, date, completed } = req.body;
    const uid = req.uid;
    
    if (!taskId || !date) {
      return res.status(400).json({ error: "Missing taskId or date" });
    }
    
    // ✅ NEW: Date validation
    const today = new Date().toISOString().split('T')[0];
    const taskDate = new Date(date);
    const todayDate = new Date(today);
    
    // Prevent completing future tasks (but allow uncompleting)
    if (taskDate > todayDate && completed === true) {
      return res.status(400).json({ 
        error: "Cannot complete tasks for future dates. You can only complete today's or past tasks." 
      });
    }
    
    // Allow unticking any date (for corrections)
    console.log(`✅ Allowing toggle for ${date} (completed: ${completed})`);
    
    const plannerRef = db.collection("users").doc(uid).collection("planner").doc(date);
    const plannerDoc = await plannerRef.get();
    
    if (!plannerDoc.exists) {
      return res.status(404).json({ error: "Planner not found for this date" });
    }
    
    const plannerData = plannerDoc.data();
    const tasks = plannerData.tasks || [];
    
    // Find and toggle the task
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    // Toggle completion
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    
    // Update in Firestore
    await plannerRef.update({ tasks });
    
    // ✨ UPDATE QUEST PROGRESS (only when completing, not uncompleting)
    if (tasks[taskIndex].completed) {
      // ... your quest tracking code
    }
    
    res.json({ 
      success: true, 
      task: tasks[taskIndex],
      message: tasks[taskIndex].completed ? "Task completed!" : "Task uncompleted"
    });
    
  } catch (err) {
    console.error("Error toggling task:", err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});
```

## What This Does

### ✅ Allowed:
- Tick tasks for today ✓
- Tick tasks for past dates ✓
- **Untick tasks for ANY date** ✓ (including future)

### ❌ Blocked:
- Tick tasks for future dates ✗

## Alternative: Allow Everything (For Testing)

If you want to allow ticking future dates too (for testing), use this simpler version:

```javascript
router.post("/planner/toggle", verifyToken, async (req, res) => {
  try {
    const { taskId, date } = req.body;
    const uid = req.uid;
    
    // ✅ NO DATE RESTRICTIONS - Allow everything
    console.log(`✅ Toggling task ${taskId} for ${date}`);
    
    const plannerRef = db.collection("users").doc(uid).collection("planner").doc(date);
    const plannerDoc = await plannerRef.get();
    
    if (!plannerDoc.exists) {
      return res.status(404).json({ error: "Planner not found for this date" });
    }
    
    const plannerData = plannerDoc.data();
    const tasks = plannerData.tasks || [];
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    
    await plannerRef.update({ tasks });
    
    res.json({ 
      success: true, 
      task: tasks[taskIndex]
    });
    
  } catch (err) {
    console.error("Error toggling task:", err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});
```

## Where to Add This

1. Open your backend file (probably `backend/routes/journal.js`)
2. Find the `/planner/toggle` endpoint
3. Replace the date validation logic with one of the versions above
4. Save and restart your backend

## Testing

1. Go to a future date in your planner
2. Try to untick a task - should work ✅
3. Try to tick a new task - should be blocked ❌ (or allowed if using version 2)

## Recommendation

Use **Version 1** (allow unticking only) for production - this prevents users from "cheating" by completing future tasks while still allowing corrections.

Use **Version 2** (allow everything) only for testing/development.

---

**Send me your backend code** and I'll show you exactly where to make the change!
