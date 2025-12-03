# Deployment Error Fix - userRef is not defined

## Error
```
ReferenceError: userRef is not defined
at file:///opt/render/project/src/routes/journal.js:695:22
```

## Cause
The code `const templatesRef = userRef.collection("taskTemplates");` is placed **outside** of the endpoint function, where `userRef` doesn't exist.

## Solution

Make sure the code is **inside** the `/post-save-check` endpoint function. Here's the correct structure:

```javascript
// ✅ CORRECT - Inside the endpoint function
router.get('/post-save-check', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const uid = req.uid; // From verifyToken middleware
    
    if (!date) {
      return res.status(400).json({ error: 'Missing date parameter' });
    }

    // Extract year-month from date (YYYY-MM-DD -> YYYY-MM)
    const yearMonth = date.substring(0, 7);

    // ✅ Define userRef HERE, inside the function
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

    // ✅ NOW you can use userRef to get templates
    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();
    const templates = [];
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });

    // Rest of the code...
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
          const exception = exceptions[template.id]?.[date];
          
          if (!exception || !exception.isDeleted) {
            todaysTasks.push(template);
          }
        }
      }
    });

    // Check completion status
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

## What Went Wrong

You likely copied the code and accidentally placed it **outside** the function, like this:

```javascript
// ❌ WRONG - Outside the function
router.get('/post-save-check', verifyToken, async (req, res) => {
  // ... some code ...
}); // Function ends here

// ❌ This is OUTSIDE the function - userRef doesn't exist here!
const templatesRef = userRef.collection("taskTemplates");
const templatesSnapshot = await templatesRef.get();
```

## How to Fix

1. **Find line 695** in your `routes/journal.js` file
2. **Check if it's inside** the `router.get('/post-save-check', ...)` function
3. **Move it inside** if it's outside
4. Make sure `userRef` is defined **before** you try to use it

## Quick Check

Look for this pattern in your code:

```javascript
router.get('/post-save-check', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const uid = req.uid;
    
    // ... more code ...
    
    const userRef = db.collection('users').doc(uid);  // ✅ Define it first
    
    // ... more code ...
    
    const templatesRef = userRef.collection("taskTemplates");  // ✅ Then use it
    
    // ... rest of code ...
    
  } catch (error) {
    // error handling
  }
}); // ✅ Make sure your new code is BEFORE this closing bracket
```

## Alternative: Check Your Existing Endpoint

If you already have a working `/post-save-check` endpoint, you might have accidentally added duplicate code. Check if you have:

1. Two `/post-save-check` endpoints (remove the duplicate)
2. Code placed after the endpoint closes (move it inside)
3. Missing `const userRef = db.collection('users').doc(uid);` line

## After Fixing

1. Save the file
2. Commit and push to trigger redeployment
3. The error should be gone

The key is: **All code that uses `userRef` must be inside the function where `userRef` is defined!**
