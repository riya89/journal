# Mood Trend Calculation Fix

## Issue
User reports seeing "📉 Declining" when mood went from 4.3 (yesterday) to 4.4 (today), which should be improving or at least stable.

## Current Logic (Backend)
```javascript
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
```

## Problem
The threshold of 0.3 is too high. A change from 4.3 to 4.4 (0.1 difference) shows as "stable", but the user is seeing "declining" which suggests:

1. **Either**: The backend is calculating the average incorrectly
2. **Or**: The mood data includes older entries that are bringing down the second half average
3. **Or**: The threshold logic is inverted somewhere

## Better Approach

Instead of comparing halves, compare **recent trend** (last 3-5 days) vs **previous period**:

```javascript
// ✅ IMPROVED TREND CALCULATION
function calculateTrend(moodData) {
  if (moodData.length < 3) return "stable";
  
  // Sort by date (newest first)
  const sorted = [...moodData].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get recent period (last 3 days) and previous period (3 days before that)
  const recentPeriod = sorted.slice(0, Math.min(3, sorted.length));
  const previousPeriod = sorted.slice(3, Math.min(6, sorted.length));
  
  if (previousPeriod.length === 0) {
    // Not enough data, check if recent trend is up or down
    if (recentPeriod.length >= 2) {
      const first = recentPeriod[recentPeriod.length - 1].mood;
      const last = recentPeriod[0].mood;
      const diff = last - first;
      
      if (diff > 0.2) return "improving";
      if (diff < -0.2) return "declining";
    }
    return "stable";
  }
  
  const recentAvg = recentPeriod.reduce((sum, m) => sum + m.mood, 0) / recentPeriod.length;
  const previousAvg = previousPeriod.reduce((sum, m) => sum + m.mood, 0) / previousPeriod.length;
  
  const diff = recentAvg - previousAvg;
  
  // Use smaller threshold (0.2 instead of 0.3) for more responsive feedback
  if (diff > 0.2) return "improving";
  if (diff < -0.2) return "declining";
  return "stable";
}
```

## Alternative: More Positive Framing

Instead of "declining" (which sounds negative), use more supportive language:

```javascript
// Frontend display
{moodStats.trend === 'improving' ? '📈 Improving' : 
 moodStats.trend === 'declining' ? '🌱 Room to Grow' : 
 '➡️ Steady'}
```

Or even better, only show "declining" if mood is actually low:

```javascript
// Backend logic
let trendLabel = trend;
if (trend === 'declining' && averageMood >= 3.5) {
  trendLabel = 'stable'; // Don't show "declining" if mood is still good
}
```

## Recommended Fix

**Option 1: Lower the threshold**
```javascript
if (secondAvg > firstAvg + 0.15) trend = "improving";  // Changed from 0.3
else if (secondAvg < firstAvg - 0.15) trend = "declining";  // Changed from 0.3
```

**Option 2: Use recent trend (recommended)**
Replace the entire trend calculation with the improved version above.

**Option 3: Softer language**
Change "Declining" to "Room to Grow" or "Fluctuating" in the frontend.

## Where to Apply Fix

**Backend**: In your Cloudflare Worker's mood analytics endpoint (likely `/analytics/mood/extended`)

**Frontend**: `src/pages/MoodDashboard.jsx` line 665 for display text changes
