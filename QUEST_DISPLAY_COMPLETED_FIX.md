# Quest Display - Show Completed Quests

## Problem
Daily quests disappear completely after being completed, making it unclear if the user has finished their daily tasks.

## Solution Implemented

### Frontend Changes

**QuestPanel.jsx:**
- Changed API endpoint from `/quests/active` to `/quests/all` to fetch both active and completed quests
- Added sorting logic to show incomplete quests first, then completed ones
- Completed quests are now visible with special styling

**QuestCard.jsx:**
- Completed quests now have:
  - Green border (`border-[#7A916C]`)
  - Green background tint
  - Large checkmark badge in top-right corner
  - Full opacity (no longer faded out)
  - Reward badge highlighted in green

### Backend Changes Needed

✅ **See `QUEST_ALL_ENDPOINT.js` for the complete backend code**

Create a new endpoint: `GET /journal/quests/all?uid={userId}`

This endpoint should return ALL quests for the current period (including completed ones):

```javascript
// Example response structure
{
  "daily": [
    {
      "id": "quest_123",
      "title": "Morning Journal",
      "description": "Write your morning journal entry",
      "type": "daily",
      "target": 1,
      "progress": 1,
      "status": "completed",
      "reward": { "xp": 50 },
      "expiresAt": "2025-12-02T00:00:00Z"
    },
    {
      "id": "quest_124",
      "title": "Complete 3 Tasks",
      "description": "Mark 3 tasks as complete",
      "type": "daily",
      "target": 3,
      "progress": 1,
      "status": "active",
      "reward": { "xp": 30 },
      "expiresAt": "2025-12-02T00:00:00Z"
    }
  ],
  "weekly": [...],
  "monthly": [...]
}
```

**Key Points:**
- Include quests with `status: "completed"` for the current day/week/month
- Don't include expired quests from previous periods
- Sort is handled on frontend (incomplete first, then completed)

### UI Improvements Added

**Compact Mode:**
- Added `compact` prop to QuestPanel and QuestCard
- Smaller padding, text sizes, and spacing for dashboard display
- Hides quest descriptions in compact mode
- Reduced max height for better fit

**Visual Enhancements:**
- Completed quests have green border and background
- Large checkmark badge on completed quests
- Incomplete quests shown first, completed ones below
- Progress bar with animated shine effect
- Reward badges highlighted in green when completed

## Benefits

✅ Users can see what they've accomplished today
✅ Clear visual feedback with green checkmark and border
✅ Completed quests stay visible until the period resets
✅ Better sense of progress and achievement
✅ No confusion about whether daily quests are available
✅ Compact mode works great in dashboard layouts

## Alternative Approach (if backend can't be changed)

If the backend can't add a new endpoint, modify the existing `/quests/active` endpoint to include a query parameter:

```
GET /journal/quests/active?uid={userId}&includeCompleted=true
```

This would be backward compatible with existing code.
