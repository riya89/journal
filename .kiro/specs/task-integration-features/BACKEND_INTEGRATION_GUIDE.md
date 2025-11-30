# Weekly Summary Backend Integration Guide

This guide explains how to integrate the weekly summary endpoint into your Node.js/Express backend.

## Files Created

- `backend-weekly-summary.js` - Contains the weekly summary endpoint implementation

## Integration Steps

### 1. Add to Your Main Server File

In your main server file (e.g., `server.js`, `app.js`, or `index.js`), import and use the router:

```javascript
const weeklySummaryRouter = require('./routes/backend-weekly-summary');

// Add this with your other routes
app.use('/api', weeklySummaryRouter);
```

### 2. Ensure Firebase Admin is Initialized

Make sure Firebase Admin SDK is initialized before the routes are loaded:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already done)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // or use a service account key
  // credential: admin.credential.cert(serviceAccount)
});
```

### 3. Install Required Dependencies

Ensure you have the necessary packages installed:

```bash
npm install express firebase-admin
```

## API Endpoint

### GET /api/journal/summary/weekly

**Query Parameters:**
- `uid` (required): User ID
- `endDate` (optional): End date in YYYY-MM-DD format (defaults to today)

**Example Request:**
```
GET /api/journal/summary/weekly?uid=user123&endDate=2025-11-29
```

**Example Response:**
```json
{
  "week": "Nov 23-29",
  "stats": {
    "entriesWritten": 6,
    "tasksCompleted": 28,
    "tasksPlanned": 35,
    "completionRate": 80,
    "averageMood": 3.8,
    "totalWords": 1850,
    "streakMaintained": true,
    "perfectDays": 2
  },
  "highlights": [
    "Your mood improved by 25% this week! 📈",
    "You completed 80% of your planned tasks",
    "You wrote 6 out of 7 days"
  ],
  "insights": {
    "bestDay": {
      "date": "2025-11-27",
      "mood": 5,
      "tasksCompleted": 5,
      "tasksPlanned": 5
    },
    "improvement": "Your mood is trending upward",
    "suggestion": "Keep up the great work! You're building strong habits"
  },
  "moodTrend": "improving",
  "tasksByCategory": {
    "self-care": { "completed": 8, "planned": 10 },
    "exercise": { "completed": 5, "planned": 7 },
    "personal-growth": { "completed": 10, "planned": 12 }
  }
}
```

## Data Structure Requirements

### Firestore Collections

The endpoint expects the following Firestore structure:

```
users/{uid}/journals/{journalId}
  - date: "YYYY-MM-DD"
  - content: "Journal text..."
  - mood: 1-5 (number)
  - timestamp: Firestore Timestamp

users/{uid}/planners/{YYYY-MM}
  - tasks: [
      {
        id: "task_123",
        name: "Task name",
        category: "self-care",
        date: "YYYY-MM-DD",
        recurring: false,
        recurringDays: [0, 1, 2] // optional, for recurring tasks
      }
    ]
  - completions: {
      "YYYY-MM-DD": ["task_123", "task_456"]
    }
```

## Features Implemented

### Statistics Calculated
- ✅ Entries written in the week
- ✅ Tasks completed vs planned
- ✅ Average mood for the week
- ✅ Total words written
- ✅ Streak maintenance (6+ days)
- ✅ Perfect days (all tasks completed)
- ✅ Completion rate percentage

### Highlights Generated
- ✅ Mood improvement percentage
- ✅ Task completion achievements
- ✅ Journaling consistency
- ✅ Perfect days celebration
- ✅ Words written milestone

### Insights Provided
- ✅ Best day identification (highest mood + all tasks done)
- ✅ Mood trend analysis (improving/stable/declining)
- ✅ Actionable suggestions based on patterns
- ✅ Category-specific recommendations

### Category Breakdown
- ✅ Tasks completed by category
- ✅ Completion percentage per category
- ✅ Identifies struggling categories

## Error Handling

The endpoint includes comprehensive error handling:
- Missing user ID validation
- Graceful handling of missing data
- Fallback values for empty datasets
- Detailed error messages in responses

## Testing the Endpoint

### Using cURL:
```bash
curl "http://localhost:3000/api/journal/summary/weekly?uid=YOUR_USER_ID&endDate=2025-11-29"
```

### Using Postman:
1. Create a GET request
2. URL: `http://localhost:3000/api/journal/summary/weekly`
3. Add query parameters:
   - `uid`: Your test user ID
   - `endDate`: 2025-11-29 (optional)

### Using Frontend (fetch):
```javascript
const response = await fetch(
  `/api/journal/summary/weekly?uid=${userId}&endDate=${today}`
);
const summary = await response.json();
```

## Performance Considerations

- The endpoint fetches data for only 7 days, keeping queries efficient
- Consider caching the response for 1-24 hours to reduce database reads
- Indexes recommended on:
  - `users/{uid}/journals` collection: `date` field
  - `users/{uid}/planners` collection: document ID (YYYY-MM)

## Next Steps

After integrating the backend:
1. Test the endpoint with sample data
2. Implement the frontend WeeklySummary component
3. Add caching if needed for performance
4. Monitor error logs for any edge cases

## Support

If you encounter issues:
1. Check Firebase Admin initialization
2. Verify Firestore data structure matches expected format
3. Check console logs for detailed error messages
4. Ensure proper CORS configuration if calling from frontend
