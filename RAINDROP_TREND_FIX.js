// ============================================
// FIXED TREND CALCULATION FOR RAINDROP
// ============================================
// This fixes the "declining" issue when recent mood is actually good

// In your Cloudflare Worker's /analytics/mood/extended endpoint:

// ❌ OLD LOGIC (splits all data in half)
let trend = "stable";
if (moods.length >= 3) {
  const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
  const secondHalf = moods.slice(Math.floor(moods.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  if (secondAvg > firstAvg + 0.15) trend = "improving";
  else if (secondAvg < firstAvg - 0.15) trend = "declining";
}

// ✅ NEW LOGIC (compares recent days to previous period)
let trend = "stable";
if (moodData.length >= 3) {
  // Sort by date (newest first)
  const sorted = [...moodData].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get last 3 days and previous 3 days
  const recentDays = sorted.slice(0, Math.min(3, sorted.length));
  const previousDays = sorted.slice(3, Math.min(6, sorted.length));
  
  if (previousDays.length > 0) {
    // Compare recent average to previous average
    const recentAvg = recentDays.reduce((sum, m) => sum + m.mood, 0) / recentDays.length;
    const previousAvg = previousDays.reduce((sum, m) => sum + m.mood, 0) / previousDays.length;
    
    const diff = recentAvg - previousAvg;
    
    if (diff > 0.3) trend = "improving";
    else if (diff < -0.3) trend = "declining";
  } else if (recentDays.length >= 2) {
    // Not enough history, just check if recent trend is up or down
    const oldest = recentDays[recentDays.length - 1].mood;
    const newest = recentDays[0].mood;
    
    if (newest > oldest + 0.5) trend = "improving";
    else if (newest < oldest - 0.5) trend = "declining";
  }
}

// ============================================
// EXAMPLE WITH YOUR DATA:
// ============================================
// Recent 3 days: Dec 04 (5), Dec 03 (3), Dec 02 (5) → Avg = 4.33
// Previous 3 days: Dec 01 (3), Nov 30 (5), Nov 29 (4) → Avg = 4.0
// Difference: 4.33 - 4.0 = 0.33 → "improving" ✅

// OLD LOGIC RESULT:
// First half: [3,5,5,5,5,4] → Avg = 4.5
// Second half: [5,3,5,3,5] → Avg = 4.2
// Difference: 4.2 - 4.5 = -0.3 → "declining" ❌

// ============================================
// COMPLETE REPLACEMENT CODE:
// ============================================

// Calculate trend (replace the entire trend calculation block)
let trend = "stable";
if (moodData.length >= 3) {
  // Sort by date descending (newest first)
  const sortedMoods = [...moodData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get recent period (last 3 entries) and previous period (next 3 entries)
  const recentPeriod = sortedMoods.slice(0, Math.min(3, sortedMoods.length));
  const previousPeriod = sortedMoods.slice(3, Math.min(6, sortedMoods.length));
  
  if (previousPeriod.length > 0) {
    // Calculate averages
    const recentAvg = recentPeriod.reduce((sum, entry) => sum + entry.mood, 0) / recentPeriod.length;
    const previousAvg = previousPeriod.reduce((sum, entry) => sum + entry.mood, 0) / previousPeriod.length;
    
    const difference = recentAvg - previousAvg;
    
    // Determine trend with threshold of 0.3
    if (difference > 0.3) {
      trend = "improving";
    } else if (difference < -0.3) {
      trend = "declining";
    }
    // else stays "stable"
  } else if (recentPeriod.length >= 2) {
    // Not enough data for comparison, check simple trend
    const firstMood = recentPeriod[recentPeriod.length - 1].mood;
    const lastMood = recentPeriod[0].mood;
    
    if (lastMood > firstMood + 0.5) {
      trend = "improving";
    } else if (lastMood < firstMood - 0.5) {
      trend = "declining";
    }
  }
}

// ============================================
// WHERE TO APPLY THIS:
// ============================================
// In your Cloudflare Worker, find the /analytics/mood/extended endpoint
// Replace the trend calculation section with the code above
