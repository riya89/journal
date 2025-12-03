// ============================================
// COMPLETE /analytics/mood/extended ROUTE
// For Cloudflare Worker (TypeScript)
// ============================================

// Add this to your Cloudflare Worker's fetch handler:

if (path === "/analytics/mood/extended" && method === "GET") {
  const uid = url.searchParams.get("uid");
  const days = parseInt(url.searchParams.get("days") || "30");
  
  if (!uid) {
    return this.json({ error: "uid required" }, 400);
  }
  
  return this.getMoodExtended(uid, days);
}

// ============================================
// METHOD IMPLEMENTATION
// ============================================

async getMoodExtended(uid: string, days: number): Promise<Response> {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch journal entries with mood data
    const stmt = this.env.JOURNALDB.prepare(
      `SELECT entry_date, mood 
       FROM journal_entries 
       WHERE uid = ? 
       AND entry_date >= ? 
       AND entry_date <= ?
       AND mood IS NOT NULL
       ORDER BY entry_date DESC`
    );
    
    const rows = await stmt.bind(uid, startDateStr, endDateStr).all<{
      entry_date: string;
      mood: number;
    }>();

    if (!rows.results.length) {
      return this.json({
        uid,
        period: `${days} days`,
        moodData: [],
        stats: {
          averageMood: 0,
          moodVariance: 0,
          trend: "stable",
          bestDay: null,
          worstDay: null,
          daysTracked: 0,
          missedDays: days
        }
      });
    }

    // Transform data
    const moodData = rows.results.map(row => ({
      date: row.entry_date,
      mood: row.mood
    }));

    // Calculate statistics
    const moods = moodData.map(m => m.mood);
    const averageMood = moods.reduce((sum, m) => sum + m, 0) / moods.length;
    
    // Calculate variance
    const variance = moods.reduce((sum, m) => sum + Math.pow(m - averageMood, 2), 0) / moods.length;
    const moodVariance = Math.round(variance * 10) / 10;

    // Find best and worst days
    const sortedByMood = [...moodData].sort((a, b) => b.mood - a.mood);
    const bestDay = sortedByMood[0];
    const worstDay = sortedByMood[sortedByMood.length - 1];

    // ✅ FIXED TREND CALCULATION
    // Compare recent 3 days vs previous 3 days instead of splitting all data
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

    // Calculate missed days
    const daysTracked = moodData.length;
    const missedDays = days - daysTracked;

    return this.json({
      uid,
      period: `${days} days`,
      moodData,
      stats: {
        averageMood: Math.round(averageMood * 10) / 10,
        moodVariance,
        trend,
        bestDay,
        worstDay,
        daysTracked,
        missedDays
      }
    });
  } catch (e: unknown) {
    return this.json({ 
      error: "Failed to fetch mood data", 
      details: String(e) 
    }, 500);
  }
}

// ============================================
// EXAMPLE RESPONSE:
// ============================================
/*
{
  "uid": "gqXk6N1i49hULkrMNjvQcLgI0gE3",
  "period": "30 days",
  "moodData": [
    { "date": "2025-12-04", "mood": 5 },
    { "date": "2025-12-03", "mood": 3 },
    { "date": "2025-12-02", "mood": 5 },
    ...
  ],
  "stats": {
    "averageMood": 4.4,
    "moodVariance": 0.8,
    "trend": "improving",  // ✅ Now correctly shows "improving"
    "bestDay": { "date": "2025-12-04", "mood": 5 },
    "worstDay": { "date": "2025-12-03", "mood": 3 },
    "daysTracked": 11,
    "missedDays": 19
  }
}
*/

// ============================================
// KEY CHANGES FROM OLD VERSION:
// ============================================
// 
// OLD TREND LOGIC (WRONG):
// - Split all data in half
// - First half: [3,5,5,5,5,4] avg = 4.5
// - Second half: [5,3,5,3,5] avg = 4.2
// - Result: "declining" ❌
//
// NEW TREND LOGIC (CORRECT):
// - Compare last 3 days vs previous 3 days
// - Recent 3: [5,3,5] avg = 4.33
// - Previous 3: [3,5,4] avg = 4.0
// - Result: "improving" ✅
//
// This gives more accurate and responsive trend detection
// that reflects the user's actual recent mood trajectory.
