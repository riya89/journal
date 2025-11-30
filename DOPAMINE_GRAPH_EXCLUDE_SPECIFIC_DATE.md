# Dopamine Graph - Exclude Specific Date Tasks

## The Problem

Tasks with `specificDate` (one-time tasks for tomorrow) are currently counted in the dopamine graph, which inflates your completion stats.

## The Solution

Update the backend `/journal/planner/stats/:yearMonth` endpoint to exclude tasks with `specificDate` from the graph calculations.

## Backend Fix

In your `routes/journal.js` file, find the stats endpoint (around line 1400):

### Find this code:

```javascript
router.get("/planner/stats/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);

    // Get month planner
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();

    // Get templates
    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();

    const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    const templates = [];
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });

    // Calculate stats for each day
    const dailyStats = [];
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${yearMonth}-${String(day).padStart(2, '0')}`;

      // Get all tasks for this day (regular + recurring)
      const dayTasks = [...monthData.tasks];
      
      templates.forEach(template => {
        const applicableDates = getApplicableDates(template, yearMonth);
        if (applicableDates.includes(date)) {
          // Check if not deleted via exception
          const exception = monthData.exceptions?.[template.id]?.[date];
          if (!exception || !exception.isDeleted) {
            dayTasks.push(template);
          }
        }
      });

      const completed = monthData.completions[date]?.length || 0;

      // Calculate time estimates
      const totalEstimatedTime = dayTasks.reduce((sum, task) => {
        return sum + (task.timeEstimate || 0);
      }, 0);

      const completedTime = dayTasks
        .filter(task => monthData.completions[date]?.includes(task.id))
        .reduce((sum, task) => sum + (task.timeEstimate || 0), 0);

      dailyStats.push({
        date,
        day,
        planned: dayTasks.length,
        completed,
        totalEstimatedTime,
        completedTime
      });
    }

    res.json({ dailyStats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
```

### Replace with this:

```javascript
router.get("/planner/stats/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);

    // Get month planner
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();

    // Get templates
    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();

    const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    const templates = [];
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });

    // Calculate stats for each day
    const dailyStats = [];
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${yearMonth}-${String(day).padStart(2, '0')}`;

      // Get all tasks for this day (regular + recurring)
      // ✅ EXCLUDE tasks with specificDate (one-time suggestions)
      const dayTasks = monthData.tasks.filter(task => {
        // Exclude tasks that have a specificDate and it's not today
        if (task.specificDate && task.specificDate !== date) {
          return false;
        }
        return true;
      });
      
      templates.forEach(template => {
        const applicableDates = getApplicableDates(template, yearMonth);
        if (applicableDates.includes(date)) {
          // Check if not deleted via exception
          const exception = monthData.exceptions?.[template.id]?.[date];
          if (!exception || !exception.isDeleted) {
            dayTasks.push(template);
          }
        }
      });

      const completed = monthData.completions[date]?.length || 0;

      // Calculate time estimates
      const totalEstimatedTime = dayTasks.reduce((sum, task) => {
        return sum + (task.timeEstimate || 0);
      }, 0);

      const completedTime = dayTasks
        .filter(task => monthData.completions[date]?.includes(task.id))
        .reduce((sum, task) => sum + (task.timeEstimate || 0), 0);

      dailyStats.push({
        date,
        day,
        planned: dayTasks.length,
        completed,
        totalEstimatedTime,
        completedTime
      });
    }

    res.json({ dailyStats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
```

## What Changed

Added this filter when collecting tasks:

```javascript
// ✅ EXCLUDE tasks with specificDate (one-time suggestions)
const dayTasks = monthData.tasks.filter(task => {
  // Exclude tasks that have a specificDate and it's not today
  if (task.specificDate && task.specificDate !== date) {
    return false;
  }
  return true;
});
```

This ensures:
- Tasks with `specificDate` only count on their specific date
- Tasks without `specificDate` count on all days (normal behavior)
- Recurring tasks count on their applicable days (normal behavior)

## Result

**Before:**
- Add task for tomorrow → Shows on all days in graph ❌
- Inflates your completion stats

**After:**
- Add task for tomorrow → Only shows on tomorrow in graph ✅
- Accurate completion stats
- Only recurring tasks count across multiple days

---

That's it! After this fix, your dopamine graph will only show accurate stats for recurring/regular tasks, not one-time suggestions.
