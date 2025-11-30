# Session Archival Logic

## Overview
Conversations older than 90 days are automatically marked as archived but remain accessible to users. This provides a clean separation between recent and old conversations while preserving history.

## Implementation

### Backend Logic
The archival logic is implemented in the history endpoints:

```javascript
const now = new Date();
const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

// Check if session is archived
const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
const isArchived = updatedAt < ninetyDaysAgo;
```

### Frontend Display
The HistoryPanel component:
- Shows recent conversations by default
- Provides a toggle to view archived conversations
- Displays an "Archived" badge on old conversations
- Allows searching through both recent and archived conversations

### Key Features

1. **Automatic Archival**: Sessions are automatically marked as archived based on their `updatedAt` timestamp
2. **No Data Loss**: Archived sessions remain fully accessible and can be viewed, loaded, or deleted
3. **Visual Distinction**: Archived conversations are clearly marked with a yellow "Archived" badge
4. **Filter Toggle**: Users can easily switch between viewing recent and archived conversations
5. **Search Across All**: Search functionality works across both recent and archived conversations

### Data Retention Policy

- **Recent Conversations** (< 90 days): Displayed by default in the history panel
- **Archived Conversations** (≥ 90 days): Accessible via the "Show Archived" filter
- **No Automatic Deletion**: Conversations are never automatically deleted
- **User Control**: Users can manually delete any conversation (recent or archived) at any time

### Archive Retrieval

Users can access archived conversations by:
1. Opening the History Panel
2. Clicking the "Show Archived" button
3. Selecting any archived conversation to view full details
4. Optionally loading an archived conversation to continue it

### Technical Details

#### Database Structure
```javascript
{
  sessionId: "session_abc123",
  userId: "user123",
  messages: [...],
  updatedAt: Timestamp, // Used to calculate if archived
  // No explicit 'isArchived' field - calculated on-the-fly
}
```

#### Calculation
```javascript
// In backend endpoint
const isArchived = (new Date() - updatedAt) > (90 * 24 * 60 * 60 * 1000);
```

#### Frontend Filtering
```javascript
// In HistoryPanel component
const filteredSessions = filterArchived
  ? sessions.filter(s => s.isArchived)
  : sessions.filter(s => !s.isArchived);
```

## Benefits

1. **Clean UI**: Recent conversations are prioritized without cluttering the interface
2. **Complete History**: Users never lose access to old conversations
3. **Performance**: Filtering reduces the initial load of conversations
4. **Flexibility**: Users can easily access archived conversations when needed
5. **No Maintenance**: Archival happens automatically without user intervention

## Future Enhancements

Potential improvements for the archival system:
- Add date range filters (last week, last month, last year)
- Export archived conversations to JSON/PDF
- Bulk operations on archived conversations
- Configurable archival threshold (user preference)
- Archive statistics (total archived, oldest conversation, etc.)
