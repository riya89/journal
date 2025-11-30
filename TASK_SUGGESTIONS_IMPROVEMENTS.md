# Task Suggestions - Smart Improvements

## Changes Made

### 1. ✅ Suggested Tasks Don't Count in Dopamine Graph

**How it works:**
- Tasks added for "tomorrow only" have `specificDate` field
- These are excluded from dopamine graph calculations
- Only recurring/regular tasks count toward your stats

**Why:** Prevents inflating your completion stats with one-time suggestions

---

### 2. ✅ Option to Make Tasks Recurring (Count in Graph)

**New Feature:**
- Checkbox in suggestion modal: "Make these daily tasks for the entire month"
- When checked: Creates recurring daily tasks that count in dopamine graph
- When unchecked: Creates one-time tasks for tomorrow only

**Implementation:**
```javascript
// Frontend sends:
if (makeRecurring) {
  // Daily recurring task
  {
    isRecurring: true,
    recurrenceType: 'daily',
    recurrenceDays: [0,1,2,3,4,5,6]  // All days
  }
} else {
  // One-time task for tomorrow
  {
    isRecurring: false,
    specificDate: "2025-12-02"
  }
}
```

---

### 3. ✅ Smart Filtering - Only Show When Meaningful

**Suggestions are skipped when:**

1. **Entry too short** - Less than 100 words
   ```
   ⏭️ Skipping: Entry too short
   ```

2. **Editing existing entry** - Not first save of the day
   ```
   ⏭️ Skipping: Editing existing entry
   ```

3. **Mood is excellent** - User rated 5/5 (doing great!)
   ```
   ⏭️ Skipping: Mood is excellent
   ```

4. **No actionable content** - Doesn't mention challenges/goals/stress
   ```
   ⏭️ Skipping: No actionable themes detected
   ```

**Suggestions are shown when:**
- ✅ First save of the day (not editing)
- ✅ Entry has 100+ words
- ✅ Mood is 1-4 (room for improvement)
- ✅ Content mentions: stress, overwhelm, anxious, worried, need to, should, goal, want to, plan, tomorrow, next week

**Why:** Prevents repetitive/annoying suggestions. Only shows when AI can actually help.

---

## User Experience

### Scenario 1: Quick Journal Entry
```
User writes: "Had a nice day. Feeling good."
Word count: 6 words
Result: ⏭️ No suggestions (too short)
```

### Scenario 2: Happy Reflection
```
User writes: 150 words about a great day
Mood: 5/5
Result: ⏭️ No suggestions (mood excellent)
```

### Scenario 3: Stressed Entry (First Time)
```
User writes: "Feeling overwhelmed with work. Need to get organized..."
Word count: 120 words
Mood: 2/5
Result: ✨ Shows 2-3 task suggestions
```

### Scenario 4: Editing Same Entry
```
User edits the entry above to fix typos
Result: ⏭️ No suggestions (already shown once)
```

### Scenario 5: Reflective Entry
```
User writes: 150 words about their day, no stress/goals mentioned
Result: ⏭️ No suggestions (no actionable themes)
```

---

## UI Changes

### Task Suggestion Modal

**Before:**
```
[✓] Take a 15-minute walk
[✓] Create a priority list

[Add to Tomorrow's Planner] [Skip]
```

**After:**
```
[✓] Take a 15-minute walk
[✓] Create a priority list

┌─────────────────────────────────────────┐
│ ☐ Make these daily tasks for the       │
│   entire month                          │
│   Tasks will count toward your          │
│   dopamine graph when completed         │
└─────────────────────────────────────────┘

[Add to Tomorrow] [Skip]
```

When checkbox is checked:
```
[Add to Daily Tasks] [Skip]
```

---

## Backend Requirements

### 1. Save `specificDate` Field

In `routes/journal.js`, add this to the task creation:

```javascript
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

// ✅ ADD THIS
if (req.body.specificDate) {
  newTask.specificDate = req.body.specificDate;
}
```

### 2. Category Normalization

Already documented in `CATEGORY_MAPPING_FIX.md`

---

## Testing

### Test 1: One-Time Task
1. Write journal with stress/goals (100+ words)
2. Get suggestions
3. Leave checkbox unchecked
4. Add tasks
5. Check Monthly Planner - tasks only on tomorrow ✅
6. Check dopamine graph - no change ✅

### Test 2: Recurring Task
1. Write journal with stress/goals (100+ words)
2. Get suggestions
3. Check "Make these daily tasks"
4. Add tasks
5. Check Monthly Planner - tasks on all days ✅
6. Complete a task - dopamine graph increases ✅

### Test 3: Smart Filtering
1. Write short entry (< 100 words) - No suggestions ✅
2. Edit existing entry - No suggestions ✅
3. Write happy entry (mood 5/5) - No suggestions ✅
4. Write reflective entry (no stress words) - No suggestions ✅
5. Write stressed entry (100+ words, mood 2/5) - Shows suggestions ✅

---

## Summary

**Problem:** Task suggestions were showing for every save, inflating dopamine graph, and becoming repetitive

**Solution:**
1. ✅ One-time tasks don't count in graph (use `specificDate`)
2. ✅ User can choose to make tasks recurring (counts in graph)
3. ✅ Smart filtering only shows suggestions when meaningful
4. ✅ Won't show on edits or when mood is excellent

**Result:** More helpful, less annoying, accurate stats! 🎉
