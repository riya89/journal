# Suggested To-Do List - Backend Implementation

## Overview

Changed task suggestions from adding to planner to displaying as a sticky note to-do list on the home page.

## Backend Endpoints Needed

Add these endpoints to your `journal.js` backend file:

```javascript
// ==========================================
// 📝 SUGGESTED TO-DO LIST ENDPOINTS
// ==========================================

/**
 * GET /journal/suggested-todos
 * Get all suggested todos for the current user
 */
router.get("/suggested-todos", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const todosRef = userRef.collection("suggestedTodos");
    
    const snapshot = await todosRef
      .orderBy("createdAt", "desc")
      .get();
    
    const todos = [];
    snapshot.forEach(doc => {
      const todo = { id: doc.id, ...doc.data() };
      
      // Convert Firestore Timestamp to ISO string
      if (todo.createdAt && todo.createdAt.toDate) {
        todo.createdAt = todo.createdAt.toDate().toISOString();
      }
      
      todos.push(todo);
    });
    
    res.json({ todos });
  } catch (err) {
    console.error("Error fetching suggested todos:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

/**
 * POST /journal/suggested-todos
 * Add a new suggested todo
 */
router.post("/suggested-todos", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { name, category, timeEstimate, reason } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Task name is required" });
    }
    
    const userRef = db.collection("users").doc(userId);
    const todosRef = userRef.collection("suggestedTodos");
    const todoRef = todosRef.doc();
    
    const todo = {
      name,
      category: category || 'other',
      timeEstimate: timeEstimate || 30,
      reason: reason || '',
      completed: false,
      createdAt: new Date()
    };
    
    await todoRef.set(todo);
    
    res.json({
      success: true,
      todo: { id: todoRef.id, ...todo }
    });
  } catch (err) {
    console.error("Error adding suggested todo:", err);
    res.status(500).json({ error: "Failed to add todo" });
  }
});

/**
 * POST /journal/suggested-todos/:todoId/toggle
 * Toggle completion status of a todo
 */
router.post("/suggested-todos/:todoId/toggle", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { todoId } = req.params;
    const { completed } = req.body;
    
    const userRef = db.collection("users").doc(userId);
    const todoRef = userRef.collection("suggestedTodos").doc(todoId);
    
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

/**
 * DELETE /journal/suggested-todos/:todoId
 * Delete a suggested todo
 */
router.delete("/suggested-todos/:todoId", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { todoId } = req.params;
    
    const userRef = db.collection("users").doc(userId);
    const todoRef = userRef.collection("suggestedTodos").doc(todoId);
    
    await todoRef.delete();
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});
```

## Database Structure

### Firestore Collection Structure
```
users/{userId}/suggestedTodos/{todoId}
  - name: string (task name)
  - category: string (task category)
  - timeEstimate: number (minutes)
  - reason: string (why this task was suggested)
  - completed: boolean
  - createdAt: timestamp
  - completedAt: timestamp (nullable)
```

## Frontend Changes Made

1. **Created `SuggestedTodoList.jsx`**: Sticky note component that displays todos
2. **Updated `TaskSuggestionModal.jsx`**: Removed date picker and recurring options
3. **Updated `JournalModal.jsx`**: Changed `handleAddSuggestedTasks` to save to todos instead of planner
4. **Updated `Home.jsx`**: Added SuggestedTodoList component in top-left corner

## Features

- ✅ Sticky note UI matching app theme
- ✅ Check off tasks directly from home page
- ✅ Delete tasks individually
- ✅ Shows category icons and time estimates
- ✅ Shows reason why task was suggested
- ✅ Auto-hides when no todos
- ✅ Scrollable if many tasks
- ✅ Shows count of remaining tasks

## User Flow

1. User writes journal entry
2. AI analyzes and suggests tasks
3. User selects tasks from modal
4. Tasks appear as sticky note on home page
5. User can check off or delete tasks
6. Completed tasks stay visible but grayed out
7. User can delete tasks when done
