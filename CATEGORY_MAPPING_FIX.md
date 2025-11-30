# Category Mapping Fix

## The Problem

The AI task suggestion endpoint was returning categories like "Work", "Personal", "Health" (capitalized), but your frontend expects lowercase keys like "work", "health", "other".

This caused the error:
```
Cannot read properties of undefined (reading 'color')
```

## The Fix

### 1. Backend Fix (in your journal.js route)

Update the `/journal/analyze-for-tasks` endpoint to normalize categories:

```javascript
// Add this mapping before validating tasks
const categoryMap = {
  'Work': 'work',
  'Personal': 'other',
  'Health': 'health',
  'Social': 'social',
  'Creative': 'creative',
  'Learning': 'learning',
  'Mindfulness': 'mindfulness'
};

// Then in the validation:
const validTasks = suggestedTasks
  .filter(task => task.name && task.category)
  .map(task => {
    // Normalize category to lowercase frontend format
    const normalizedCategory = categoryMap[task.category] || task.category.toLowerCase();
    
    return {
      name: task.name.substring(0, 100),
      category: normalizedCategory,  // ✅ Now lowercase
      timeEstimate: task.timeEstimate || 30,
      reason: task.reason || "Suggested based on your journal entry"
    };
  })
  .slice(0, 3);
```

### 2. Frontend Safety Fix (Already Applied)

Added a fallback in `MonthlyPlanner.jsx`:

```javascript
const category = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.other;
```

This prevents crashes if an unknown category somehow gets through.

## Category Mapping

| AI Returns | Frontend Expects |
|------------|------------------|
| Work       | work             |
| Personal   | other            |
| Health     | health           |
| Social     | social           |
| Creative   | creative         |
| Learning   | learning         |
| Mindfulness| mindfulness      |

## What to Do

1. Update your backend `/journal/analyze-for-tasks` endpoint with the category mapping code above
2. The frontend fix is already applied ✅
3. Restart your backend server
4. Test by saving a journal entry and adding suggested tasks

The error should be gone! 🎉
