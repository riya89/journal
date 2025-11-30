# Final Stats Fix - Exclude One-Time Tasks from Graph Line

## The Goal

- **Y-axis max:** Based on recurring tasks only (consistent baseline)
- **Graph line:** Only shows recurring task completions (not one-time tasks)
- **One-time tasks:** Can be completed but don't affect the graph

## Backend Fix

Replace your `/planner/stats/:yearMonth` endpoint with this:

```javascript
router.get("/planner/stats/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);

    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();

    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();

    const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    const templates = [];
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });

    const dailyStats = [];
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${yearMonth}-${String(day).padStart(2, '0')}`;

      // Get ONLY recurring/regular tasks (exclude specificDate tasks)
      const recurringTasks = monthData.tasks.filter(task => !task.specificDate);
      
      templates.forEach(template => {
        const applicableDates = getApplicableDates(template, yearMonth);
        if (applicableDates.includes(date)) {
          const exception = monthData.exceptions?.[template.id]?.[date];
          if (!exception || !exception.isDeleted) {
            recurringTasks.push(template);
          }
        }
      });

      // Count completions ONLY for recurring tasks
      const completedRecurringTasks = recurringTasks.filter(task => 
        monthData.completions[date]?.includes(task.id)
      );

      const totalEstimatedTime = recurringTasks.reduce((sum, task) => {
        return sum + (task.timeEstimate || 0);
      }, 0);

      const completedTime = completedRecurringTasks.reduce((sum, task) => 
        sum + (task.timeEstimate || 0), 0
      );

      dailyStats.push({
        date,
        day,
        planned: recurringTasks.length,  // Only recurring tasks
        completed: completedRecurringTasks.length,  // Only recurring completions
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

**Before:**
```javascript
const dayTasks = monthData.tasks.filter(task => {
  if (task.specificDate && task.specificDate !== date) {
    return false;
  }
  return true;
});
// This included specificDate tasks on their date
```

**After:**
```javascript
const recurringTasks = monthData.tasks.filter(task => !task.specificDate);
// This COMPLETELY excludes all specificDate tasks
```

## Result

**Recurring tasks:** 4 tasks
- Y-axis max: 4
- Graph line tracks: 0/4, 1/4, 2/4, 3/4, 4/4

**One-time task on Dec 5:**
- Shows in planner ✅
- Can be checked off ✅
- Doesn't affect graph ✅
- Y-axis stays at 4 ✅
- Graph line stays based on recurring tasks only ✅

## Summary

Now the dopamine graph is a true measure of your **consistent daily habits**, not inflated by one-time bonus tasks!
