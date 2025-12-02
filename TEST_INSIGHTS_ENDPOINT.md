# Test Insights Endpoint

## Quick Test

Open your browser console and run this:

```javascript
fetch('http://localhost:8000/journal/insights/fresh', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Insights Response:', data);
  console.log('Current Streak:', data.stats?.currentStreak);
  console.log('Max Streak:', data.stats?.maxStreak);
  console.log('Insights:', data.insights);
})
.catch(err => console.error('Error:', err));
```

## What to Check

1. **Is `currentStreak` showing 7?**
   - If yes: Frontend is displaying it wrong
   - If no: Backend calculation is wrong

2. **Check the insights array**
   - Look for the streak message
   - Does it say "6-day" or "7-day"?

3. **Check if endpoint exists**
   - If you get 404: Backend endpoint not added yet
   - If you get 401: Token issue
   - If you get 500: Backend error (check backend logs)

## Backend Verification

Make sure your backend has this endpoint in `routes/journal.js`:

```javascript
router.get("/insights/fresh", verifyToken, async (req, res) => {
  // ... endpoint code ...
});
```

## Common Issues

### Issue 1: Backend not restarted
**Solution**: Restart your backend server after adding the endpoint

### Issue 2: Wrong repo
**Solution**: Make sure you're running the backend from the correct repo

### Issue 3: Data not synced
**Solution**: The backend might be reading from a different database than expected

### Issue 4: Calculation logic
**Solution**: The streak calculation might be counting differently

## Debug Steps

1. **Check backend logs** when you load the dashboard
2. **Add console.log** in the backend endpoint to see what data it's processing
3. **Check the journal entries** in your database - do you actually have 7 consecutive days with mood >= 4?

## Expected Response

```json
{
  "insights": [
    "Your best day was Dec 1, 2025 with a mood of 5/5",
    "You have a 7-day streak of good moods! Keep it going! 🔥",
    "Your mood has been relatively stable. Consistency is a sign of balance!",
    "You're doing great! Reflect on what's been working well..."
  ],
  "stats": {
    "avgMood": 4.3,
    "currentStreak": 7,
    "maxStreak": 7,
    "trend": "stable",
    "daysTracked": 8,
    "missedDays": 22
  }
}
```

The key is `stats.currentStreak` should be 7, and the insights array should contain a message with "7-day streak".
