# Implementation Plan

- [x] 1. Backend API implementation (COMPLETED)
  - Backend code is ready in `.kiro/specs/planner-enhancements/backend-enhanced.js`
  - Copy this file to your backend routes to replace existing planner endpoints
  - Uses Firebase/Firestore with `taskTemplates` collection for recurring tasks
  - Supports all features: recurring tasks, time estimates, reordering, exceptions
  - _Requirements: All backend requirements_

- [x] 2. Create TaskModal component
  - [x] 2.1 Create base TaskModal component structure
    - Create `src/components/TaskModal.jsx` file
    - Implement modal overlay and container with theme support
    - Add close button and backdrop click handling
    - Set up props interface (isOpen, onClose, onSave, theme, editingTask, yearMonth)
    - _Requirements: 1.1_

  - [x] 2.2 Implement task name and category inputs
    - Add controlled input for task name
    - Add category dropdown with icons from TASK_CATEGORIES
    - Apply theme-appropriate styling
    - _Requirements: 1.1_

  - [x] 2.3 Add time estimate input field
    - Create number input for minutes
    - Add helper text showing hours conversion (e.g., "30 = 30m, 90 = 1h 30m")
    - Make field optional with clear placeholder
    - _Requirements: 2.1_

  - [x] 2.4 Implement recurrence selector UI
    - Add dropdown with options: None, Daily, Weekly
    - Show day-of-week checkboxes when Weekly is selected
    - Store selected days as array of numbers (0-6 for Sun-Sat)
    - Hide recurrence options when editing non-recurring task
    - _Requirements: 1.1, 1.2_

  - [x] 2.5 Add edit scope selector for recurring tasks
    - Show radio buttons when editing existing recurring task
    - Options: "This occurrence only" and "All future occurrences"
    - Pass editScope to onSave callback
    - _Requirements: 4.1, 4.2_

  - [x] 2.6 Implement form validation and submission
    - Validate task name is not empty
    - Validate at least one day selected for weekly recurrence
    - Validate time estimate is positive integer if provided
    - Call onSave with complete task data object
    - Show loading state during save
    - _Requirements: 1.1, 1.2, 2.1_

- [x] 3. Integrate TaskModal into MonthlyPlanner
  - [x] 3.1 Replace inline modal with TaskModal component
    - Import TaskModal component
    - Replace existing modal JSX with TaskModal component
    - Pass appropriate props (theme, yearMonth, etc.)
    - _Requirements: 1.1_

  - [x] 3.2 Update handleAddTask to support new fields
    - Modify API call to include recurrence and time fields
    - Handle response with affectedDates
    - Refresh planner data after successful save
    - Show success/error toast notifications
    - _Requirements: 1.3, 2.1_

  - [x] 3.3 Implement task editing functionality
    - Add edit button to each task row
    - Open TaskModal with editingTask prop populated
    - Handle edit scope selection for recurring tasks
    - Update task list after successful edit
    - _Requirements: 4.1, 4.2_

- [x] 4. Implement drag-and-drop reordering
  - [x] 4.1 Install and configure @dnd-kit library
    - Run `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
    - Import necessary components and hooks
    - _Requirements: 3.1_

  - [x] 4.2 Wrap task rows with draggable components
    - Use SortableContext to wrap task list
    - Use useSortable hook for each task row
    - Add drag handle icon (⋮⋮) to left of task name
    - Show drag handle on hover (desktop) or always (mobile)
    - _Requirements: 3.1, 3.2_

  - [x] 4.3 Implement drag visual feedback
    - Add opacity change during drag
    - Show drop indicator line between tasks
    - Apply transform styles for smooth animation
    - _Requirements: 3.2, 3.3_

  - [x] 4.4 Handle drop and persist new order
    - Implement onDragEnd handler
    - Calculate new sortOrder values for affected tasks
    - Call PUT /journal/planner/task/reorder endpoint
    - Update local state optimistically
    - Show error toast if API call fails
    - _Requirements: 3.4, 3.5_

- [x] 5. Display time estimates and daily totals
  - [x] 5.1 Show time estimates next to task names
    - Format time as "30m", "1h", "1h 30m"
    - Display in gray text, smaller font, in parentheses
    - Only show if timeEstimate is set
    - _Requirements: 2.2_

  - [x] 5.2 Calculate and display daily time totals
    - Add total row at bottom of each day column
    - Sum time estimates for all tasks on that day
    - Format total time consistently
    - _Requirements: 2.3_

  - [x] 5.3 Implement color coding for daily totals
    - Green for 0-6 hours
    - Yellow for 6-8 hours
    - Red for 8+ hours
    - Apply color to total text or background
    - _Requirements: 2.4_

- [x] 6. Handle recurring task completions
  - [x] 6.1 Update task grid to show recurring tasks on applicable dates
    - Use applicableDates array from API response
    - Render checkbox for each applicable date
    - Apply exceptions (hide if isDeleted, show overrides)
    - _Requirements: 1.4_

  - [x] 6.2 Ensure completions work independently per date
    - Verify handleToggleTask works with recurring tasks
    - Store completions with date-specific keys
    - Test that completing one date doesn't affect others
    - _Requirements: 1.5_

- [x] 7. Create TemplatesModal component
  - [x] 7.1 Create TemplatesModal component structure
    - Create `src/components/TemplatesModal.jsx` file
    - Implement modal overlay with theme support
    - Add close button and backdrop handling
    - Set up props (isOpen, onClose, theme, onEdit, onDelete)
    - _Requirements: 5.1_

  - [x] 7.2 Fetch and display recurring task templates
    - Call GET /journal/planner/templates on mount
    - Display list of templates with name, category icon, recurrence pattern
    - Show time estimate if set
    - Format recurrence pattern as readable text (e.g., "Daily", "Weekly: Mon, Wed, Fri")
    - _Requirements: 5.2, 5.4_

  - [x] 7.3 Add edit and delete buttons for each template
    - Add Edit button that calls onEdit callback
    - Add Delete button that calls onDelete callback
    - Show confirmation dialog before delete
    - Refresh template list after edit/delete
    - _Requirements: 5.3_

  - [x] 7.4 Add "View Templates" button to MonthlyPlanner
    - Add button near "Add Task" button
    - Open TemplatesModal when clicked
    - Handle edit callback (open TaskModal with template data)
    - Handle delete callback (call API and refresh planner)
    - _Requirements: 5.1_

- [x] 8. Implement delete confirmation for recurring tasks
  - [x] 8.1 Create delete confirmation modal
    - Show modal when user clicks delete on recurring task
    - Display options: "Delete this occurrence only" and "Delete all occurrences"
    - Add cancel button
    - _Requirements: 4.3_

  - [x] 8.2 Handle delete scope selection
    - Pass scope parameter to DELETE endpoint
    - Pass date parameter for single occurrence delete
    - Refresh planner data after successful delete
    - Show success/error toast
    - _Requirements: 4.3, 4.4_

- [ ] 9. Polish and testing
  - [ ] 9.1 Add loading states and error handling
    - Show loading spinner during API calls
    - Display toast notifications for success/error
    - Handle network errors gracefully
    - Add retry logic for failed requests
    - _Requirements: All_

  - [ ] 9.2 Ensure responsive design and mobile support
    - Test drag-and-drop on touch devices
    - Ensure modals are full-screen on small screens
    - Test horizontal scroll on mobile
    - Verify time totals display correctly on narrow screens
    - _Requirements: 3.1, 3.2_

  - [ ] 9.3 Test dark theme compatibility
    - Verify all new components work with dark theme
    - Check color contrast for time totals
    - Test drag-and-drop visual feedback in dark mode
    - _Requirements: All_

  - [ ] 9.4 Add accessibility features
    - Add ARIA labels for drag handles
    - Ensure keyboard navigation works for modals
    - Test with screen reader
    - Verify focus management
    - _Requirements: All_

  - [ ]* 9.5 Write integration tests
    - Test creating recurring task and verifying it appears on correct dates
    - Test editing single occurrence vs all occurrences
    - Test deleting single occurrence vs all occurrences
    - Test drag-and-drop reordering persists
    - Test time totals calculate correctly
    - _Requirements: All_
