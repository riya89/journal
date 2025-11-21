# Planner Enhancements - Implementation Guide

## 🚀 Quick Start

### Step 1: Update Backend (5 minutes)

1. **Copy the enhanced backend code:**
   - Open `.kiro/specs/planner-enhancements/backend-enhanced.js`
   - Copy all the code
   - Replace your existing planner routes in your backend

2. **Key changes in the backend:**
   - Uses Firebase `taskTemplates` collection for recurring tasks
   - Regular tasks stay in `planners/{yearMonth}` documents
   - Exceptions stored in `planners/{yearMonth}.exceptions` field
   - All 7 endpoints are ready to use

3. **Test the backend:**
   ```bash
   # Start your backend server
   # Test with existing planner functionality first
   # New features will work once frontend is updated
   ```

### Step 2: Implement Frontend (Follow tasks.md)

Open `.kiro/specs/planner-enhancements/tasks.md` and work through the tasks sequentially:

1. ✅ **Backend** - Already done! Just copy the code.
2. **TaskModal Component** - Create the new modal with recurrence & time options
3. **Integration** - Connect TaskModal to MonthlyPlanner
4. **Drag & Drop** - Add @dnd-kit for reordering
5. **Time Display** - Show estimates and daily totals
6. **Recurring Tasks** - Handle display and completions
7. **Templates Modal** - Manage recurring task templates
8. **Delete Confirmations** - Handle single vs all deletions
9. **Polish** - Loading states, mobile, dark theme, accessibility

## 📋 Backend API Reference

### Data Structure

**Regular Task (in planners/{yearMonth}):**
```javascript
{
  id: "task_1234567890",
  name: "Exercise",
  category: "health",
  isRecurring: false,
  timeEstimate: 30,
  sortOrder: 0,
  createdAt: "2024-11-21T10:00:00Z",
  updatedAt: "2024-11-21T10:00:00Z"
}
```

**Recurring Task Template (in taskTemplates collection):**
```javascript
{
  id: "template_abc123",
  name: "Morning meditation",
  category: "mindfulness",
  isRecurring: true,
  recurrenceType: "weekly",
  recurrenceDays: [1, 3, 5], // Mon, Wed, Fri (0=Sun, 6=Sat)
  timeEstimate: 15,
  sortOrder: 1,
  createdAt: "2024-11-21T10:00:00Z",
  updatedAt: "2024-11-21T10:00:00Z"
}
```

**Exception (in planners/{yearMonth}.exceptions):**
```javascript
{
  "template_abc123": {
    "2024-11-15": {
      isDeleted: true,
      deletedAt: "2024-11-21T10:00:00Z"
    },
    "2024-11-17": {
      timeEstimateOverride: 20,
      updatedAt: "2024-11-21T10:00:00Z"
    }
  }
}
```

### API Endpoints

#### 1. GET /journal/planner/:yearMonth
Fetches all tasks (regular + recurring) for a month.

**Response:**
```javascript
{
  yearMonth: "2024-11",
  tasks: [
    {
      id: "task_123",
      name: "Exercise",
      category: "health",
      isRecurring: false,
      timeEstimate: 30,
      sortOrder: 0
    },
    {
      id: "template_abc",
      name: "Meditation",
      category: "mindfulness",
      isRecurring: true,
      recurrenceType: "daily",
      timeEstimate: 15,
      sortOrder: 1,
      applicableDates: ["2024-11-01", "2024-11-02", ...] // All dates in month
    }
  ],
  completions: {
    "2024-11-01": ["task_123", "template_abc"],
    "2024-11-02": ["template_abc"]
  },
  exceptions: {
    "template_abc": {
      "2024-11-15": { isDeleted: true }
    }
  }
}
```

#### 2. POST /journal/planner/task
Create or update a task.

**Create Regular Task:**
```javascript
{
  yearMonth: "2024-11",
  name: "Gym session",
  category: "health",
  timeEstimate: 60
}
```

**Create Recurring Task:**
```javascript
{
  name: "Morning run",
  category: "health",
  isRecurring: true,
  recurrenceType: "weekly",
  recurrenceDays: [1, 3, 5], // Mon, Wed, Fri
  timeEstimate: 30
}
```

**Edit Single Occurrence:**
```javascript
{
  taskId: "template_abc",
  name: "Extended meditation",
  category: "mindfulness",
  timeEstimate: 30,
  editScope: "single",
  specificDate: "2024-11-15",
  yearMonth: "2024-11"
}
```

**Edit All Occurrences:**
```javascript
{
  taskId: "template_abc",
  name: "Updated meditation",
  category: "mindfulness",
  timeEstimate: 20,
  editScope: "all"
}
```

#### 3. DELETE /journal/planner/task/:yearMonth/:taskId?scope=single&date=2024-11-15
Delete a task or occurrence.

**Query Parameters:**
- `scope`: "single" or "all" (default: "all")
- `date`: Required if scope="single"

#### 4. PUT /journal/planner/task/reorder
Update task order.

**Request:**
```javascript
{
  yearMonth: "2024-11",
  taskOrders: [
    { taskId: "task_123", sortOrder: 0 },
    { taskId: "template_abc", sortOrder: 1 },
    { taskId: "task_456", sortOrder: 2 }
  ]
}
```

#### 5. GET /journal/planner/templates
Get all recurring task templates.

**Response:**
```javascript
{
  templates: [
    {
      id: "template_abc",
      name: "Meditation",
      category: "mindfulness",
      isRecurring: true,
      recurrenceType: "daily",
      timeEstimate: 15,
      sortOrder: 0
    }
  ]
}
```

#### 6. POST /journal/planner/toggle
Toggle task completion (unchanged).

#### 7. GET /journal/planner/stats/:yearMonth
Get daily stats with time estimates.

**Response:**
```javascript
{
  dailyStats: [
    {
      date: "2024-11-01",
      day: 1,
      planned: 5,
      completed: 3,
      totalEstimatedTime: 120, // minutes
      completedTime: 75 // minutes
    }
  ]
}
```

## 🎨 UI Components to Build

### 1. TaskModal Component
- Recurrence selector (None/Daily/Weekly)
- Day-of-week checkboxes for weekly
- Time estimate input
- Edit scope selector for recurring tasks

### 2. Drag Handle
- Show ⋮⋮ icon on hover
- Use @dnd-kit for smooth dragging

### 3. Time Display
- Format: "30m", "1h", "1h 30m"
- Daily totals with color coding

### 4. Templates Modal
- List all recurring tasks
- Edit/delete buttons
- Readable recurrence patterns

### 5. Delete Confirmation
- "This occurrence only" vs "All occurrences"
- Clear warning messages

## 💡 Implementation Tips

1. **Start with TaskModal** - Get the UI working before connecting to backend
2. **Test with regular tasks first** - Make sure existing functionality still works
3. **Add recurring tasks gradually** - Start with daily, then add weekly
4. **Use optimistic updates** - Update UI immediately, sync to backend async
5. **Handle errors gracefully** - Show toast notifications for failures
6. **Test edge cases:**
   - Months with 28, 29, 30, 31 days
   - Deleting last occurrence of recurring task
   - Reordering mix of regular and recurring tasks
   - Editing recurring task that spans multiple months

## 🐛 Common Issues & Solutions

**Issue:** Recurring tasks not showing up
- Check that `applicableDates` array is populated
- Verify `getApplicableDates()` function is working
- Check for deletion exceptions

**Issue:** Drag-and-drop not working
- Ensure @dnd-kit is installed
- Check that sortOrder is being updated
- Verify reorder API endpoint is called

**Issue:** Time totals incorrect
- Check that timeEstimate is a number, not string
- Verify recurring tasks are included in calculation
- Check for exceptions that modify time estimates

**Issue:** Completions not working for recurring tasks
- Ensure taskId matches template ID
- Check that date format is consistent
- Verify completions are stored per date

## 📚 Resources

- **@dnd-kit docs:** https://docs.dndkit.com/
- **Design reference:** `.kiro/specs/planner-enhancements/design.md`
- **Requirements:** `.kiro/specs/planner-enhancements/requirements.md`
- **Tasks:** `.kiro/specs/planner-enhancements/tasks.md`

## ✅ Testing Checklist

- [ ] Create regular task with time estimate
- [ ] Create daily recurring task
- [ ] Create weekly recurring task (Mon/Wed/Fri)
- [ ] Complete recurring task on different dates independently
- [ ] Edit single occurrence of recurring task
- [ ] Edit all occurrences of recurring task
- [ ] Delete single occurrence of recurring task
- [ ] Delete all occurrences of recurring task
- [ ] Drag-and-drop to reorder tasks
- [ ] Verify time totals calculate correctly
- [ ] Check color coding (green/yellow/red)
- [ ] Test on mobile (touch drag)
- [ ] Test with dark theme
- [ ] Navigate between months with recurring tasks

Good luck! 🚀
