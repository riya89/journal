# Design Document

## Overview

This design extends the existing Monthly Planner with three major enhancements: recurring task automation, time-based task management, and drag-and-drop reordering. The design maintains the current visual aesthetic while adding new UI controls and backend data structures to support these features.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MonthlyPlanner.jsx                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Task Modal   │  │ Planner Grid │  │ Templates    │     │
│  │ (Enhanced)   │  │ (DnD Support)│  │ Modal        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Routes                        │
│  • POST /planner/task (enhanced with recurrence)            │
│  • GET /planner/:yearMonth (generates recurring instances)  │
│  • PUT /planner/task/:id/order (update sortOrder)           │
│  • PUT /planner/task/:id (edit single/all occurrences)      │
│  • DELETE /planner/task/:id (delete single/all)             │
│  • GET /planner/templates (list recurring templates)        │
└─────────────────────────────────────────────────────────────┐
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Schema                         │
│  • tasks table (enhanced with recurrence fields)            │
│  • task_completions table (date-specific completions)       │
│  • task_exceptions table (modified recurring instances)     │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Enhanced Task Modal

**Location:** `src/components/TaskModal.jsx` (new component)

**Purpose:** Replaces the inline modal in MonthlyPlanner with a dedicated component for creating/editing tasks with recurrence and time options.

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSave: (taskData) => void,
  theme: string,
  editingTask: Task | null,
  yearMonth: string
}
```

**UI Elements:**
- Task name input (existing)
- Category selector (existing)
- **NEW:** Recurrence selector dropdown (None, Daily, Weekly)
- **NEW:** Day-of-week checkboxes (shown when Weekly selected)
- **NEW:** Time estimate input (minutes, with helper text showing hours conversion)
- **NEW:** "Edit scope" radio buttons (shown when editing recurring task)
  - "This occurrence only"
  - "All future occurrences"

**Visual Design:**
```
┌─────────────────────────────────────────────────┐
│  Add New Task                              [X]  │
├─────────────────────────────────────────────────┤
│  Task Name: [_________________________]         │
│                                                  │
│  Category:  [Health ▼]  🏃                      │
│                                                  │
│  ⏰ Time Estimate (optional):                   │
│     [___] minutes  (e.g., 30 = 30m, 90 = 1h 30m)│
│                                                  │
│  🔁 Repeat:  [None ▼]                           │
│     ○ None                                       │
│     ○ Daily                                      │
│     ○ Weekly on:                                │
│        ☐ Mon ☐ Tue ☐ Wed ☐ Thu                 │
│        ☐ Fri ☐ Sat ☐ Sun                       │
│                                                  │
│  [Cancel]              [Save Task]              │
└─────────────────────────────────────────────────┘
```

### 2. Drag-and-Drop Planner Grid

**Location:** `src/pages/MonthlyPlanner.jsx` (enhanced)

**Library:** `react-beautiful-dnd` or `@dnd-kit/core` (recommended: @dnd-kit for better performance)

**Implementation:**
- Wrap task rows in draggable components
- Add drag handle icon (⋮⋮) to the left of task name
- Show visual feedback during drag (opacity, shadow)
- Update sortOrder on drop
- Persist new order to backend immediately

**Visual Changes:**
```
Before:
┌────────────────────────────────────────┐
│ 🏃 Exercise for 30 mins                │
└────────────────────────────────────────┘

After (with drag handle):
┌────────────────────────────────────────┐
│ ⋮⋮ 🏃 Exercise for 30 mins (30m)       │
└────────────────────────────────────────┘
     ↑                           ↑
  drag handle              time estimate
```

### 3. Templates Management Modal

**Location:** `src/components/TemplatesModal.jsx` (new component)

**Purpose:** Display and manage all recurring task templates.

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  theme: string,
  onEdit: (template) => void,
  onDelete: (templateId) => void
}
```

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│  Recurring Task Templates                  [X]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  🏃 Exercise for 30 mins                        │
│     Daily • 30 minutes                          │
│     [Edit] [Delete]                             │
│                                                  │
│  📚 Read before bed                             │
│     Weekly: Mon, Wed, Fri • 20 minutes          │
│     [Edit] [Delete]                             │
│                                                  │
│  🧘 Morning meditation                          │
│     Daily • 15 minutes                          │
│     [Edit] [Delete]                             │
│                                                  │
│                                    [Close]       │
└─────────────────────────────────────────────────┘
```

### 4. Enhanced Planner Grid Display

**Changes to existing grid:**

1. **Time estimates in task names:**
   - Display format: "Task Name (30m)" or "Task Name (1h 30m)"
   - Gray color, smaller font size

2. **Daily time totals:**
   - Add row at bottom of each day column
   - Show total estimated time for that day
   - Color coding:
     - Green: 0-6 hours
     - Yellow: 6-8 hours
     - Red: 8+ hours

3. **Drag handle visibility:**
   - Show on hover over task row
   - Always visible on mobile/touch devices

**Updated Grid Layout:**
```
┌──────────┬────────┬────────┬────────┬─────────┐
│ Task     │   1    │   2    │   3    │ Actions │
├──────────┼────────┼────────┼────────┼─────────┤
│ ⋮⋮ 🏃 Ex │   ☑    │   ☐    │   ☑    │    ✕    │
│   (30m)  │        │        │        │         │
├──────────┼────────┼────────┼────────┼─────────┤
│ ⋮⋮ 📚 Re │   ☐    │   ☑    │   ☐    │    ✕    │
│   (20m)  │        │        │        │         │
├──────────┼────────┼────────┼────────┼─────────┤
│ Total    │  30m   │  20m   │  30m   │         │
│          │  🟢    │  🟢    │  🟢    │         │
└──────────┴────────┴────────┴────────┴─────────┘
```

## Data Models

### Enhanced Task Schema

```javascript
{
  id: string,              // unique task ID
  name: string,            // task name
  category: string,        // health, mindfulness, etc.
  yearMonth: string,       // "2024-11" (for non-recurring) or null (for templates)
  sortOrder: number,       // position in list (0, 1, 2, ...)
  
  // NEW FIELDS
  isRecurring: boolean,    // true if this is a template
  recurrenceType: string,  // "none" | "daily" | "weekly"
  recurrenceDays: number[], // [0,1,2,3,4,5,6] for Sun-Sat, empty for daily
  timeEstimate: number,    // minutes, null if not set
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Task Completions Schema

```javascript
{
  id: string,
  taskId: string,          // references task.id
  date: string,            // "2024-11-15"
  completed: boolean,
  yearMonth: string,       // "2024-11" for indexing
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Task Exceptions Schema (NEW)

```javascript
{
  id: string,
  taskId: string,          // references recurring task template
  date: string,            // "2024-11-15"
  
  // Override fields (null = use template value)
  nameOverride: string | null,
  categoryOverride: string | null,
  timeEstimateOverride: number | null,
  isDeleted: boolean,      // true if this occurrence was deleted
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Backend API Endpoints

### 1. Create/Update Task (Enhanced)

**Endpoint:** `POST /journal/planner/task`

**Request Body:**
```javascript
{
  yearMonth: "2024-11",
  name: "Exercise",
  category: "health",
  isRecurring: true,
  recurrenceType: "weekly",
  recurrenceDays: [1, 3, 5], // Mon, Wed, Fri
  timeEstimate: 30,
  editScope: "all" | "single", // for editing existing recurring tasks
  specificDate: "2024-11-15"   // required if editScope = "single"
}
```

**Response:**
```javascript
{
  success: true,
  task: { /* task object */ },
  affectedDates: ["2024-11-01", "2024-11-03", ...] // dates where task appears
}
```

**Logic:**
- If `isRecurring = true`, create task template with `yearMonth = null`
- If editing with `editScope = "single"`, create exception record
- If editing with `editScope = "all"`, update template and clear future exceptions
- Calculate and return all dates in current month where task will appear

### 2. Get Planner Data (Enhanced)

**Endpoint:** `GET /journal/planner/:yearMonth`

**Response:**
```javascript
{
  tasks: [
    {
      id: "task-123",
      name: "Exercise",
      category: "health",
      sortOrder: 0,
      isRecurring: true,
      recurrenceType: "weekly",
      recurrenceDays: [1, 3, 5],
      timeEstimate: 30,
      applicableDates: ["2024-11-01", "2024-11-03", "2024-11-05", ...]
    },
    // ... more tasks
  ],
  completions: {
    "2024-11-01": ["task-123", "task-456"],
    "2024-11-03": ["task-123"],
    // ... more dates
  },
  exceptions: {
    "task-123": {
      "2024-11-15": { isDeleted: true },
      "2024-11-17": { timeEstimateOverride: 45 }
    }
  }
}
```

**Logic:**
- Fetch all non-recurring tasks for the yearMonth
- Fetch all recurring task templates
- For each template, calculate which dates in the month it applies to
- Apply any exceptions (deletions, modifications)
- Return combined list with applicableDates array for recurring tasks

### 3. Update Task Order

**Endpoint:** `PUT /journal/planner/task/reorder`

**Request Body:**
```javascript
{
  yearMonth: "2024-11",
  taskOrders: [
    { taskId: "task-123", sortOrder: 0 },
    { taskId: "task-456", sortOrder: 1 },
    { taskId: "task-789", sortOrder: 2 }
  ]
}
```

**Response:**
```javascript
{
  success: true
}
```

**Logic:**
- Update sortOrder for all provided tasks in a single transaction
- Ensures consistent ordering across all users

### 4. Get Templates

**Endpoint:** `GET /journal/planner/templates`

**Response:**
```javascript
{
  templates: [
    {
      id: "task-123",
      name: "Exercise",
      category: "health",
      recurrenceType: "daily",
      recurrenceDays: [],
      timeEstimate: 30,
      sortOrder: 0
    },
    // ... more templates
  ]
}
```

### 5. Delete Task (Enhanced)

**Endpoint:** `DELETE /journal/planner/task/:yearMonth/:taskId`

**Query Parameters:**
- `scope`: "single" | "all"
- `date`: "2024-11-15" (required if scope = "single")

**Logic:**
- If `scope = "single"` and task is recurring, create exception with `isDeleted = true`
- If `scope = "all"`, delete task template and all completions
- If task is non-recurring, delete task and completions

## Recurrence Logic

### Calculating Applicable Dates

**Algorithm for generating recurring task instances:**

```javascript
function getApplicableDates(task, yearMonth) {
  if (!task.isRecurring) {
    return []; // Non-recurring tasks don't have applicableDates
  }
  
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const applicableDates = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (task.recurrenceType === 'daily') {
      applicableDates.push(formatDate(date));
    } else if (task.recurrenceType === 'weekly') {
      if (task.recurrenceDays.includes(dayOfWeek)) {
        applicableDates.push(formatDate(date));
      }
    }
  }
  
  // Filter out dates with deletion exceptions
  return applicableDates.filter(date => {
    const exception = getException(task.id, date);
    return !exception || !exception.isDeleted;
  });
}
```

### Handling Exceptions

When displaying a recurring task on a specific date:

1. Check if exception exists for that date
2. If exception has `isDeleted = true`, don't show task
3. If exception has override fields, use those instead of template values
4. Otherwise, use template values

## Error Handling

### Frontend Validation

1. **Task name required:** Show error if name is empty
2. **Weekly recurrence validation:** Require at least one day selected
3. **Time estimate validation:** Must be positive integer if provided
4. **Drag-and-drop errors:** Show toast notification if reorder fails

### Backend Validation

1. **Invalid recurrence pattern:** Return 400 error
2. **Task not found:** Return 404 error
3. **Database errors:** Return 500 error with generic message
4. **Concurrent modification:** Use optimistic locking or last-write-wins

### User Feedback

- Show loading spinner during save operations
- Display success toast: "Task saved successfully"
- Display error toast: "Failed to save task. Please try again."
- Confirm before deleting: "Delete this task? This action cannot be undone."
- For recurring tasks: "Delete only this occurrence or all future occurrences?"

## Testing Strategy

### Unit Tests

1. **Recurrence calculation logic:**
   - Test daily recurrence generates correct dates
   - Test weekly recurrence with various day combinations
   - Test month boundaries (28, 29, 30, 31 days)
   - Test exception filtering

2. **Time formatting:**
   - Test minutes to hours conversion (30m, 1h, 1h 30m)
   - Test daily total calculations
   - Test color coding thresholds

3. **Drag-and-drop:**
   - Test sortOrder updates
   - Test reordering with multiple tasks
   - Test edge cases (first, last position)

### Integration Tests

1. **Create recurring task:**
   - Verify task appears on correct dates
   - Verify completions work independently per date
   - Verify time totals include recurring tasks

2. **Edit recurring task:**
   - Test "single occurrence" edit creates exception
   - Test "all occurrences" edit updates template
   - Verify changes reflect correctly in UI

3. **Delete recurring task:**
   - Test "single occurrence" delete creates exception
   - Test "all occurrences" delete removes template
   - Verify completions are handled correctly

4. **Drag-and-drop:**
   - Test reordering persists after page reload
   - Test reordering with mix of recurring and non-recurring tasks
   - Test concurrent reordering by multiple users

### Manual Testing Checklist

- [ ] Create daily recurring task, verify it appears every day
- [ ] Create weekly recurring task (Mon/Wed/Fri), verify correct days
- [ ] Add time estimates, verify daily totals calculate correctly
- [ ] Verify color coding (green/yellow/red) for daily totals
- [ ] Drag task to new position, verify order persists
- [ ] Edit single occurrence of recurring task
- [ ] Edit all occurrences of recurring task
- [ ] Delete single occurrence of recurring task
- [ ] Delete all occurrences of recurring task
- [ ] View templates modal, verify all recurring tasks listed
- [ ] Test on mobile (touch drag-and-drop)
- [ ] Test with dark theme
- [ ] Test month navigation with recurring tasks

## Performance Considerations

### Frontend Optimization

1. **Memoization:** Use `useMemo` for calculating applicable dates
2. **Virtualization:** Consider virtual scrolling if task list grows large
3. **Debouncing:** Debounce drag-and-drop reorder API calls
4. **Optimistic updates:** Update UI immediately, sync to backend asynchronously

### Backend Optimization

1. **Caching:** Cache recurring task calculations for frequently accessed months
2. **Batch operations:** Update multiple sortOrder values in single query
3. **Indexing:** Add database indexes on yearMonth, taskId, date fields
4. **Query optimization:** Use JOINs to fetch tasks, completions, exceptions in single query

### Database Considerations

- Recurring tasks stored once as templates (saves space)
- Completions stored per date (allows independent tracking)
- Exceptions stored only when needed (minimal overhead)
- Consider archiving old completions after 1 year

## Migration Strategy

### Database Migration

```sql
-- Add new columns to existing tasks table
ALTER TABLE tasks ADD COLUMN isRecurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN recurrenceType VARCHAR(20) DEFAULT 'none';
ALTER TABLE tasks ADD COLUMN recurrenceDays TEXT; -- JSON array
ALTER TABLE tasks ADD COLUMN timeEstimate INTEGER;
ALTER TABLE tasks ADD COLUMN sortOrder INTEGER DEFAULT 0;

-- Create task_exceptions table
CREATE TABLE task_exceptions (
  id VARCHAR(255) PRIMARY KEY,
  taskId VARCHAR(255) NOT NULL,
  date VARCHAR(10) NOT NULL,
  nameOverride VARCHAR(255),
  categoryOverride VARCHAR(50),
  timeEstimateOverride INTEGER,
  isDeleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_task_date (taskId, date)
);

-- Update existing tasks with sortOrder
UPDATE tasks SET sortOrder = (
  SELECT COUNT(*) FROM tasks t2 
  WHERE t2.yearMonth = tasks.yearMonth 
  AND t2.createdAt < tasks.createdAt
);
```

### Backward Compatibility

- Existing tasks will have `isRecurring = false` by default
- Existing functionality continues to work unchanged
- New features are additive, not breaking changes
- API endpoints maintain backward compatibility with optional new fields

## UI/UX Considerations

### Visual Hierarchy

1. **Drag handles:** Subtle, only visible on hover (desktop) or always visible (mobile)
2. **Time estimates:** Gray text, smaller font, in parentheses
3. **Daily totals:** Bottom of each column, color-coded for quick scanning
4. **Recurrence indicators:** Small icon (🔁) next to recurring task names

### Accessibility

1. **Keyboard navigation:** Support Tab, Enter, Escape for modals
2. **Screen readers:** Add ARIA labels for drag handles, time estimates
3. **Focus management:** Return focus to trigger element after modal closes
4. **Color contrast:** Ensure time total colors meet WCAG AA standards

### Mobile Responsiveness

1. **Touch drag-and-drop:** Use touch events, larger drag handles
2. **Modal sizing:** Full-screen modals on small screens
3. **Time totals:** Stack vertically on narrow screens
4. **Horizontal scroll:** Maintain for month grid on mobile

## Future Enhancements

Potential features to consider after initial implementation:

1. **Task templates library:** Pre-defined common habits users can add
2. **Streak tracking:** Show consecutive days completed for recurring tasks
3. **Notifications:** Remind users of tasks at specific times
4. **Task dependencies:** Mark tasks that must be completed before others
5. **Bulk operations:** Select multiple tasks to edit/delete at once
6. **Import/Export:** Export planner data as CSV or JSON
7. **Sharing:** Share planner with accountability partners
8. **Analytics:** Show trends, completion rates, time spent over weeks/months
