# Requirements Document

## Introduction

This specification defines enhancements to the Monthly Planner feature in the journal application. The enhancements focus on three key areas: recurring tasks that automatically populate across days/weeks, time-based task management for better scheduling, and drag-and-drop reordering for intuitive task organization.

## Glossary

- **Planner System**: The monthly task tracking interface that displays tasks in a grid format with days as columns
- **Task**: A user-defined activity or habit to be tracked, associated with a category, name, and optional metadata
- **Recurrence Pattern**: A rule defining how often a task should repeat (daily, weekly, specific days of week)
- **Time Estimate**: An optional duration value indicating how long a task is expected to take
- **Task Order**: The vertical position of tasks in the planner grid, controlled by a sortOrder field
- **Drag Handle**: A UI element that allows users to click and drag to reorder tasks
- **Backend API**: The Node.js server at localhost:8000 that handles data persistence

## Requirements

### Requirement 1: Recurring Task Creation

**User Story:** As a journal user, I want to create tasks that automatically repeat on a schedule, so that I don't have to manually add the same task every day or week.

#### Acceptance Criteria

1. WHEN a user creates a new task, THE Planner System SHALL display recurrence options including "None", "Daily", and "Weekly (select days)"
2. WHERE the user selects "Weekly", THE Planner System SHALL display checkboxes for each day of the week (Monday through Sunday)
3. WHEN a user saves a task with a recurrence pattern, THE Backend API SHALL store the recurrence configuration with the task
4. WHEN the Planner System loads a month view, THE Planner System SHALL automatically populate recurring tasks on all applicable dates within that month
5. WHEN a user completes a recurring task on a specific date, THE Planner System SHALL mark only that date's instance as complete without affecting other dates

### Requirement 2: Time-Based Task Management

**User Story:** As a journal user, I want to add time estimates to my tasks, so that I can better plan my day and understand my time commitments.

#### Acceptance Criteria

1. WHEN a user creates or edits a task, THE Planner System SHALL provide an optional time estimate field accepting values in minutes
2. THE Planner System SHALL display time estimates next to task names in a compact format (e.g., "30m", "1h", "2h 30m")
3. WHEN a user views the planner grid, THE Planner System SHALL show the total estimated time for each day at the bottom of each column
4. WHERE a day's total time exceeds 8 hours, THE Planner System SHALL highlight the total in a warning color
5. WHEN calculating daily statistics, THE Backend API SHALL include total estimated time and total completed time in the response

### Requirement 3: Drag-and-Drop Task Reordering

**User Story:** As a journal user, I want to reorder my tasks by dragging them, so that I can prioritize and organize tasks in my preferred sequence.

#### Acceptance Criteria

1. WHEN a user hovers over a task row, THE Planner System SHALL display a drag handle icon on the left side of the task name
2. WHEN a user clicks and drags a task row, THE Planner System SHALL provide visual feedback showing the task being moved
3. WHILE dragging a task, THE Planner System SHALL show a drop indicator line between other tasks to indicate the new position
4. WHEN a user releases a dragged task, THE Planner System SHALL update the task order and persist the new sortOrder values to the Backend API
5. WHEN the Planner System loads tasks, THE Planner System SHALL display tasks in ascending sortOrder sequence

### Requirement 4: Recurring Task Editing and Deletion

**User Story:** As a journal user, I want to edit or delete recurring tasks, so that I can adjust my habits as my routine changes.

#### Acceptance Criteria

1. WHEN a user edits a recurring task, THE Planner System SHALL display options to "Update this task only" or "Update all future occurrences"
2. WHERE the user selects "Update all future occurrences", THE Backend API SHALL update the task template and regenerate future instances
3. WHEN a user deletes a recurring task, THE Planner System SHALL display options to "Delete this occurrence only" or "Delete all occurrences"
4. WHERE the user selects "Delete all occurrences", THE Backend API SHALL remove the task template and all associated completion records
5. WHEN a user modifies a single occurrence of a recurring task, THE Backend API SHALL store the modification as an exception without affecting the recurrence pattern

### Requirement 5: Task Template Management

**User Story:** As a journal user, I want to view and manage my recurring task templates, so that I can see all my active recurring tasks in one place.

#### Acceptance Criteria

1. WHEN a user opens the task creation modal, THE Planner System SHALL provide a "View Templates" button
2. WHEN the user clicks "View Templates", THE Planner System SHALL display a list of all recurring task templates with their recurrence patterns
3. THE Planner System SHALL allow users to edit or delete task templates from the templates view
4. WHEN a user creates a task with recurrence, THE Backend API SHALL store it as a template separate from individual date completions
5. WHEN the Planner System generates monthly tasks, THE Backend API SHALL reference templates to create task instances for applicable dates
