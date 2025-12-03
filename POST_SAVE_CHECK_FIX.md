# Post-Save Check Endpoint Fix

## Problem
The `/journal/post-save-check` endpoint returns `hasTasks: false` and empty `todaysTasks` array even when tasks exist in the planner.

## Root Cause Analysis

Looking at the backend code in `router.get('/post-save-check', ...)`:

```javascript
// Filter tasks that apply to this specific date
const todaysTasks = tasks.filter(task => {
  if (!task.isRecurring) {
    // Non-recurring tasks apply to all dates in their month
    return true;  // ❌ THIS IS WRONG!
  }
  
  // For recurring tasks, check applicableDates
  if (!task.applicableDates || !Array.isArray(task.applicableDates)) {
    return false;
  }
  
  // Check if date is in applicableDates
  if (!task.applicableDates.includes(date)) {
    return false;
  }
  
  // Check for exceptions (deleted occurrences)
  const taskExceptions = exceptions[task.id];
  if (taskExceptions && taskExceptions[date] && taskExceptions[date].isDeleted) {
    return false;
  }
  
  return true;
});
```

### The Issues:

1. **Non-recurring tasks without `specificDate`** - The code returns `true` for ALL non-recurring tasks, meaning they would apply to every day of the month. This is incorrect.

2. **Missing logic for `specificDate`** - Tasks with `specificDate` field should only apply on that specific date, but this isn't checked.

3. **Recurring tasks need template lookup** - The code checks `task.applicableDates`, but regular tasks in the planner don't have this field. Only templates do.

## The Fix

Replace the task filtering logic in `/journal/post-save-check` endpoint:

```javascript
// Get recurring task templates
const templatesRef = userRef.collection("taskTemplates");
const templatesSnapshot = await templatesRef.get();
const templates = [];
templatesSnapshot.forEach(doc => {
  templates.push({ id: doc.id, ...doc.data() });
});

// Filter tasks that apply to this specific date
const todaysTasks = [];

// 1. Check regular tasks (non-recurring, stored in planner)
tasks.forEach(task => {
  if (task.specificDate) {
    // Task with specific date - only applies on that date
    if (task.specificDate === date) {
      todaysTasks.push(task);
    }
  } else if (!task.isRecurring) {
    // ❌ REMOVE THIS - non-recurring tasks without specificDate shouldn't apply
    // They should have a specificDate set when created
    // Don't add them to todaysTasks
  }
});

// 2. Check recurring tasks (templates)
templates.forEach(template => {
  if (template.isRecurring) {
    const applicableDates = getApplicableDates(template, yearMonth);
    
    if (applicableDates.includes(date)) {
      // Check for exceptions (deleted occurrences)
      const exception = exceptions[template.id]?.[date];
      
      if (!exception || !exception.isDeleted) {
        todaysTasks.push(template);
      }
    }
  }
});
```

## Complete Fixed Endpoint

Here's the complete fixed version:

```javascript
router.get('/post-save-check', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const uid = req.uid;
    
    if (!date) {
      return res.status(400).json({ error: 'Missing date parameter' });
    }

    // Extract year-month from date (YYYY-MM-DD -> YYYY-MM)
    const yearMonth = date.substring(0, 7);

    // Get planner data for the month
    const userRef = db.collection('users').doc(uid);
    const plannerRef = userRef.collection('planners').doc(yearMonth);
    const plannerDoc = await plannerRef.get();

    if (!plannerDoc.exists) {
      return res.json({
        hasTasks: false,
        todaysTasks: [],
        completionStats: { total: 0, completed: 0, percentage: 0 }
      });
    }

    const plannerData = plannerDoc.data();
    const tasks = plannerData.tasks || [];
    const completions = plannerData.completions || {};
    const exceptions = plannerData.exceptions || {};

    // Get recurring task templates
    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();
    const templates = [];
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });

    // ✅ FIXED: Filter tasks that apply to this specific date
    const todaysTasks = [];

    // 1. Check regular tasks with specificDate
    tasks.forEach(task => {
      if (task.specificDate && task.specificDate === date) {
        todaysTasks.push(task);
      }
    });

    // 2. Check recurring tasks (templates)
    templates.forEach(template => {
      if (template.isRecurring) {
        const applicableDates = getApplicableDates(template, yearMonth);
        
        if (applicableDates.includes(date)) {
          // Check for exceptions (deleted occurrences)
          const exception = exceptions[template.id]?.[date];
          
          if (!exception || !exception.isDeleted) {
            todaysTasks.push(template);
          }
        }
      }
    });

    // Check completion status for each task
    const dateCompletions = completions[date] || [];
    const tasksWithStatus = todaysTasks.map(task => ({
      id: task.id,
      name: task.name,
      category: task.category,
      timeEstimate: task.timeEstimate,
      completed: dateCompletions.includes(task.id)
    }));

    // Calculate statistics
    const total = tasksWithStatus.length;
    const completed = tasksWithStatus.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    console.log(`📊 Post-save check for ${date}:`, {
      total,
      completed,
      taskIds: todaysTasks.map(t => t.id)
    });

    res.json({
      hasTasks: total > 0,
      todaysTasks: tasksWithStatus,
      completionStats: {
        total,
        completed,
        percentage
      }
    });
  } catch (error) {
    console.error('Error fetching post-save check:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});
```

## Why This Happens

The issue is in your planner system design:

1. **Recurring tasks** are stored as templates in `taskTemplates` collection
2. **One-time tasks** should have a `specificDate` field
3. The old code assumed non-recurring tasks apply to all days, which is wrong

## Testing

After applying the fix:

1. Create a recurring task (e.g., "Daily Exercise")
   - Should appear on all applicable days
   
2. Create a one-time task for today
   - Should only appear on today
   
3. Save a journal entry
   - Post-save check should show your tasks for today

## Additional Fix Needed

You also need to ensure that when creating non-recurring tasks, they have a `specificDate` field:

In `/planner/task` endpoint, when creating non-recurring tasks:

```javascript
if (!isRecurring) {
  // ✅ Ensure specificDate is set
  if (!specificDate) {
    return res.status(400).json({ 
      error: "specificDate required for non-recurring tasks" 
    });
  }
  
  const newTask = {
    id: `task_${Date.now()}`,
    name,
    category,
    isRecurring: false,
    specificDate,  // ✅ Must be set
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

## Summary

The endpoint was returning empty tasks because:
1. It was looking for non-recurring tasks without checking `specificDate`
2. It wasn't loading recurring task templates
3. The filter logic was incorrect

Apply the fix above to properly filter tasks for the specific date.
