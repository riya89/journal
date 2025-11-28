# Deployment Checklist - Month Scope Delete Feature

## ✅ Frontend Changes (Complete)
All frontend changes are ready and working:

1. **DeleteConfirmModal.jsx** - Updated with three delete options:
   - "Delete this occurrence only" (when clicking date cell ✕)
   - "Delete all occurrences in this month" (default from Actions column)
   - "Delete all occurrences" (permanent deletion)

2. **MonthlyPlanner.jsx** - Updated to:
   - Show small ✕ button on hover for each date cell (recurring tasks only)
   - Pass `hasDateContext` prop to modal
   - Send `scope=month` parameter to backend

## 🔧 Backend Changes Required

Update your backend `journal.js` router with the enhanced delete endpoint from:
`.kiro/specs/planner-enhancements/backend-enhanced.js`

### Key Changes:
The delete endpoint now handles three scopes:

```javascript
if (scope === 'single' && date) {
  // Delete one occurrence
}
else if (scope === 'month') {
  // NEW: Delete all occurrences in this month
  const applicableDates = getApplicableDates(template, yearMonth);
  applicableDates.forEach(dateStr => {
    plannerData.exceptions[taskId][dateStr] = {
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };
  });
}
else {
  // Delete entire template (all months)
}
```

## Testing Steps

1. **Test Single Occurrence Delete:**
   - Create a daily recurring task
   - Hover over day 5, click the small ✕
   - Verify only day 5 is removed
   - Check other days still show the task

2. **Test Month Scope Delete:**
   - Create a weekly recurring task (e.g., Mon/Wed/Fri)
   - Click ✕ in Actions column
   - Select "Delete all occurrences in this month"
   - Verify all Mon/Wed/Fri instances are removed from current month
   - Switch to next month - task should still appear there

3. **Test All Occurrences Delete:**
   - Create a daily recurring task
   - Click ✕ in Actions column
   - Select "Delete all occurrences"
   - Verify task is removed from all months

## UI Improvements Made

- Changed "Delete all occurrences everywhere" → "Delete all occurrences" (more professional)
- Added hover effect to show ✕ button on date cells for recurring tasks
- Default selection is now "month" when deleting from Actions column (more useful)
- Added helpful hint when no date context is available
