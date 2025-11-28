# Backend Update Required: Month Scope for Delete

## Overview
The frontend now supports three delete scopes for recurring tasks:
1. **single** - Delete one specific occurrence (requires date parameter)
2. **month** - Delete all occurrences in the current month (NEW)
3. **all** - Delete the entire recurring task template and all occurrences

## Backend Changes Needed

Update the DELETE endpoint `/journal/planner/task/:yearMonth/:taskId` to handle the new "month" scope:

```javascript
router.delete("/planner/task/:yearMonth/:taskId", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskId } = req.params;
    const { scope, date } = req.query; // scope can be: "single", "month", or "all"
    
    const userRef = db.collection("users").doc(req.uid);
    
    // Find the task to check if it's recurring
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Planner not found" });
    }
    
    const data = doc.data();
    const task = data.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    // Handle different scopes
    if (task.isRecurring) {
      if (scope === "single" && date) {
        // Delete single occurrence by adding an exception
        if (!data.exceptions) {
          data.exceptions = {};
        }
        if (!data.exceptions[taskId]) {
          data.exceptions[taskId] = {};
        }
        data.exceptions[taskId][date] = {
          isDeleted: true,
          deletedAt: new Date().toISOString()
        };
        
        // Remove completion for this date
        if (data.completions[date]) {
          data.completions[date] = data.completions[date].filter(id => id !== taskId);
        }
        
        await plannerRef.set(data);
        return res.json({ success: true, scope: "single" });
        
      } else if (scope === "month") {
        // NEW: Delete all occurrences in this month
        // Add exceptions for all applicable dates in this month
        if (!data.exceptions) {
          data.exceptions = {};
        }
        if (!data.exceptions[taskId]) {
          data.exceptions[taskId] = {};
        }
        
        // Get all applicable dates for this task in this month
        const applicableDates = task.applicableDates || [];
        applicableDates.forEach(date => {
          if (date.startsWith(yearMonth)) {
            data.exceptions[taskId][date] = {
              isDeleted: true,
              deletedAt: new Date().toISOString()
            };
            
            // Remove completion for this date
            if (data.completions[date]) {
              data.completions[date] = data.completions[date].filter(id => id !== taskId);
            }
          }
        });
        
        await plannerRef.set(data);
        return res.json({ success: true, scope: "month" });
        
      } else if (scope === "all") {
        // Delete the entire recurring task template
        // This requires deleting from the templates collection and all month planners
        const templatesRef = userRef.collection("taskTemplates").doc(taskId);
        await templatesRef.delete();
        
        // Remove from current month's tasks
        data.tasks = data.tasks.filter(t => t.id !== taskId);
        
        // Remove all completions for this task
        Object.keys(data.completions).forEach(date => {
          data.completions[date] = data.completions[date].filter(id => id !== taskId);
        });
        
        // Remove all exceptions for this task
        if (data.exceptions && data.exceptions[taskId]) {
          delete data.exceptions[taskId];
        }
        
        await plannerRef.set(data);
        
        // TODO: Also remove from other months if needed
        // This might require querying all planner documents
        
        return res.json({ success: true, scope: "all" });
      }
    } else {
      // Non-recurring task - just delete it
      data.tasks = data.tasks.filter(t => t.id !== taskId);
      
      // Remove completions for this task
      Object.keys(data.completions).forEach(date => {
        data.completions[date] = data.completions[date].filter(id => id !== taskId);
      });
      
      await plannerRef.set(data);
      return res.json({ success: true });
    }
    
    res.status(400).json({ error: "Invalid scope or missing parameters" });
    
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});
```

## Frontend Changes (Already Implemented)

The frontend now:
1. Shows three options in the delete modal for recurring tasks
2. Defaults to "month" scope when deleting from the Actions column
3. Allows "single" scope when deleting from a specific date cell
4. Passes the appropriate scope parameter to the backend

## Testing

After implementing the backend changes:
1. Create a recurring task (daily or weekly)
2. Click the ✕ in the Actions column
3. Select "Delete all occurrences in this month"
4. Verify that all instances in the current month are removed
5. Verify that the task still appears in other months (if applicable)
