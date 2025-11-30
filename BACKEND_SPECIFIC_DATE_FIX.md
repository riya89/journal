# Backend Fix: Support specificDate for Tasks

## The Problem

When adding AI-suggested tasks for a specific date (tomorrow), the frontend sends `specificDate`, but the backend doesn't save it. This causes tasks to show on all dates in the month instead of just the specific date.

## The Fix

Update your backend `routes/journal.js` in the `/planner/task` endpoint.

### Find this code (around line 1100):

```javascript
} else {
  // Create regular non-recurring task
  if (!yearMonth) {
    return res.status(400).json({ error: "yearMonth required for non-recurring tasks" });
  }

  const plannerRef = userRef.collection("planners").doc(yearMonth);
  const doc = await plannerRef.get();
  const data = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };

  const newTask = {
    id: `task_${Date.now()}`,
    name,
    category,
    isRecurring: false,
    timeEstimate,
    sortOrder: data.tasks.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.tasks.push(newTask);
  await plannerRef.set(data);
  res.json({ success: true, task: newTask });
}
```

### Replace with this:

```javascript
} else {
  // Create regular non-recurring task
  if (!yearMonth) {
    return res.status(400).json({ error: "yearMonth required for non-recurring tasks" });
  }

  const plannerRef = userRef.collection("planners").doc(yearMonth);
  const doc = await plannerRef.get();
  const data = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };

  const newTask = {
    id: `task_${Date.now()}`,
    name,
    category,
    isRecurring: false,
    timeEstimate,
    sortOrder: data.tasks.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // ✅ ADD THIS: Save specificDate if provided
  if (req.body.specificDate) {
    newTask.specificDate = req.body.specificDate;
  }

  data.tasks.push(newTask);
  await plannerRef.set(data);
  res.json({ success: true, task: newTask });
}
```

## What Changed

Added these 3 lines before pushing the task:

```javascript
// ✅ ADD THIS: Save specificDate if provided
if (req.body.specificDate) {
  newTask.specificDate = req.body.specificDate;
}
```

This saves the `specificDate` field from the frontend request into the task object.

## Testing

After updating the backend:

1. Restart your backend server
2. Save a journal entry with meaningful content
3. Get AI task suggestions
4. Add tasks to tomorrow's planner
5. Check the Monthly Planner - tasks should only show on tomorrow's date ✅

## How It Works

**Frontend sends:**
```javascript
{
  yearMonth: "2025-12",
  name: "Take a 15-minute walk",
  category: "health",
  timeEstimate: 15,
  isRecurring: false,
  specificDate: "2025-12-02"  // ✅ Only show on Dec 2
}
```

**Backend saves:**
```javascript
{
  id: "task_1234567890",
  name: "Take a 15-minute walk",
  category: "health",
  timeEstimate: 15,
  isRecurring: false,
  specificDate: "2025-12-02",  // ✅ Saved!
  sortOrder: 0,
  createdAt: "2025-12-01T10:00:00.000Z",
  updatedAt: "2025-12-01T10:00:00.000Z"
}
```

**Frontend renders:**
- Checks `task.specificDate === "2025-12-02"`
- Only shows checkbox on December 2nd ✅

---

That's it! After this fix, AI-suggested tasks will only appear on the specific date you chose (tomorrow).
