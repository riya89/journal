# How Mood Insights Are Generated

## Overview
The mood insights you see in the Mood Dashboard are dynamically generated based on your journal entries, mood patterns, and streak data.

## Data Sources

### 1. Backend Streak Data (`/raindrop/streaks`)
- **Current Streak**: Your active consecutive journaling streak
- **Longest Streak**: Your all-time best streak
- **Total Entries**: Total number of journal entries

### 2. Mood Data (`/raindrop/analytics/mood/extended`)
- Journal entries with mood ratings (1-5)
- Filtered by selected period (7, 30, 90, or 365 days)
- Includes date, mood score, and journal text

## Insight Generation Process

### Step 1: Fetch Data
```javascript
// ExtendedMoodDashboard.jsx
1. Fetch actual streak data from backend
2. Fetch mood data for selected period
3. Fetch previous period data for comparison
```

### Step 2: Calculate Statistics
The system calculates:
- **Average Mood**: Mean of all mood scores
- **Best Day**: Highest mood day
- **Worst Day**: Lowest mood day
- **Trend**: Improving, declining, or stable
- **Variance**: How much mood fluctuates
- **Missed Days**: Days without journal entries

### Step 3: Detect Patterns
```javascript
// moodInsights.js - detectPatterns()
```

**Weekend Pattern**:
- Compares average weekend mood vs weekday mood
- Triggers if difference > 0.5

**Streak Pattern**:
- Uses ACTUAL streak from backend (e.g., 7 days)
- Falls back to calculated streak from mood data if backend unavailable
- Counts consecutive days with mood >= 4
- Triggers if streak >= 3 days

**Volatility Pattern**:
- Calculates mood variance
- Triggers if variance > 1.5

### Step 4: Generate Insights

#### Best Day Insight
```
🌟 Your best day was Nov 25, 2025 with a mood of 5/5
```

#### Worst Day Insight
```
💙 Your most challenging day was Nov 21, 2025 with a mood of 3/5. 
   Even on challenging days, you're tracking your progress. That's a sign of strength.
```

#### Streak Insight (UPDATED)
**Current Active Streak**:
```
🔥 You have a 7-day streak of good moods! Keep it going! 🔥
```

**Past Streak**:
```
🔥 You had a 6-day streak of good moods! What were you doing during that time?
```

The system now:
1. Fetches your actual current streak from backend (7 days)
2. Uses that number instead of calculating from mood data
3. Shows "You have" if streak is active
4. Shows "You had" if streak ended

#### Trend Insights
```
🌈 Your mood has been improving over this period! Keep up the great work! 🌟
🌿 Your mood has been relatively stable. Consistency is a sign of balance!
💜 It looks like things have been tough lately...
```

#### Pattern Insights
```
📅 Your mood tends to be better on weekends...
🌊 Your mood has been fluctuating...
```

#### Actionable Suggestions
```
⏰ Set a daily reminder to journal...
💫 You're doing great! Reflect on what's been working well...
📝 You missed 22 days of journaling in last 30 days...
```

## Period Comparison

When viewing 30+ days, the system compares:
- Current period vs previous period
- Shows percentage improvement/decline
- Highlights changes in high/low mood days

Example:
```
📈 Your mood improved by 15% compared to the previous period!
✨ You had 3 more good mood days compared to the previous period!
```

## Why Insights Update

Insights are regenerated every time you:
1. Open the Mood Dashboard
2. Change the time period (7/30/90/365 days)
3. Add a new journal entry (on next visit)

The system fetches fresh data from the backend, so your insights always reflect your most recent activity.

## Technical Flow

```
User Opens Mood Dashboard
    ↓
ExtendedMoodDashboard.jsx loads
    ↓
Fetch streak data from /raindrop/streaks
    ↓
Fetch mood data from /raindrop/analytics/mood/extended
    ↓
Calculate statistics (average, best/worst, trend)
    ↓
Detect patterns (weekend, streak, volatility)
    ↓
Generate insights using moodInsights.js
    ↓
Display insights with color-coded cards
```

## Key Files

- **`src/components/ExtendedMoodDashboard.jsx`**: Main component that fetches data and displays insights
- **`src/utils/moodInsights.js`**: Logic for calculating patterns and generating insight messages
- **Backend `/raindrop/streaks`**: Provides actual streak data
- **Backend `/raindrop/analytics/mood/extended`**: Provides mood history

## Recent Fix

**Problem**: Insights showed "You had a 6-day streak" when actual streak was 7 days

**Solution**: 
- Now fetches actual streak from backend first
- Uses backend streak data (7 days) instead of calculating from mood data (6 days)
- Ensures insights always show the correct, up-to-date streak count

**Result**: Insights now accurately reflect your current streak! 🎉
