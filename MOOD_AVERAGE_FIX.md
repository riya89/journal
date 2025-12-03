# Mood Average Calculation Fix

## Problem
The mood dashboard shows 4.4/5 for every user, regardless of their actual mood entries.

## Root Cause
Possible issues:
1. Default/cached data being returned
2. Incorrect average calculation
3. Missing data validation
4. Wrong user data being fetched

## Raindrop Worker Fix

Replace your `getMoodExtended` method with this corrected version:

```typescript
async getMoodExtended(uid: string, days: number): Promise<Response> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    console.log(`Fetching mood data for uid: ${uid}, cutoff: ${cutoffStr}`);

    const rows = await this.env.JOURNALDB.prepare(`
      SELECT entry_date, mood
      FROM journal_entries
      WHERE uid = ?
        AND mood IS NOT NULL
        AND entry_date >= ?
      ORDER BY entry_date ASC
    `).bind(uid, cutoffStr).all<{ entry_date: string; mood: number }>();

    console.log(`Found ${rows.results.length} mood entries for user ${uid}`);

    // Return early if no data
    if (!rows.results || rows.results.length === 0) {
      return this.json({
        uid,
        period: `${days} days`,
        moodData: [],
        stats: {
          averageMood: 0,
          moodVariance: 0,
          trend: "no_data",
          bestDay: null,
          worstDay: null,
          daysTracked: 0,
          missedDays: days
        }
      });
    }

    const moodData = rows.results.map(r => ({ 
      date: r.entry_date, 
      mood: r.mood 
    }));

    // Calculate stats
    const moods = moodData.map(m => m.mood);
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;

    console.log(`Average mood for ${uid}: ${avgMood} (from ${moods.length} entries)`);

    // Calculate variance
    const variance = moods.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moods.length;

    // Calculate trend
    let trend = "stable";
    if (moods.length >= 3) {
      const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
      const secondHalf = moods.slice(Math.floor(moods.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.3) trend = "improving";
      else if (secondAvg < firstAvg - 0.3) trend = "declining";
    }

    // Best day - pick most recent if tied
    const bestDay = moodData.reduce((best, curr) => {
      if (curr.mood > best.mood) return curr;
      if (curr.mood === best.mood && curr.date > best.date) return curr;
      return best;
    }, moodData[0]);

    // Worst day - pick most recent if tied
    const worstDay = moodData.reduce((worst, curr) => {
      if (curr.mood < worst.mood) return curr;
      if (curr.mood === worst.mood && curr.date > worst.date) return curr;
      return worst;
    }, moodData[0]);

    return this.json({
      uid,
      period: `${days} days`,
      moodData,
      stats: {
        averageMood: Math.round(avgMood * 10) / 10,
        moodVariance: Math.round(variance * 10) / 10,
        trend,
        bestDay,
        worstDay,
        daysTracked: moodData.length,
        missedDays: days - moodData.length
      }
    });
  } catch (e: unknown) {
    console.error('getMoodExtended error:', e);
    return this.json({ 
      error: "extended mood fetch failed", 
      details: String(e) 
    }, 500);
  }
}
```

## Key Changes:
1. **Added console logs** to debug what data is being fetched
2. **Early return** if no mood data exists (prevents division by zero)
3. **Proper null handling** for bestDay/worstDay
4. **Verified uid parameter** is being passed correctly

## Debugging Steps:

1. **Check the database query:**
```sql
SELECT entry_date, mood, uid
FROM journal_entries
WHERE uid = 'YOUR_USER_ID'
  AND mood IS NOT NULL
ORDER BY entry_date DESC
LIMIT 10;
```

2. **Verify the API call** from frontend includes correct uid:
```javascript
// In your frontend code
const response = await apiGet(`${API_BASE_URL}/mood/extended?days=30`);
```

3. **Check authentication** - make sure `req.uid` is being set correctly by your `verifyToken` middleware

4. **Test with curl:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-raindrop-url/mood/extended?days=30"
```

## Common Issues:

### Issue 1: Wrong UID being used
Check if the frontend is sending the request with proper authentication and the backend is extracting the correct uid from the token.

### Issue 2: Cached responses
Add cache-busting headers:
```typescript
return this.json(data, {
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  }
});
```

### Issue 3: Database not updated
Verify mood values are actually being saved when users create journal entries.

## Testing:
1. Create journal entries with different mood values (1, 2, 3, 4, 5)
2. Check the console logs to see what data is being fetched
3. Verify the average calculation matches your expectations
4. Test with multiple users to ensure each gets their own data
