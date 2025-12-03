import { uid } from "chart.js/helpers";

import { uid } from "chart.js/helpers";

import { number } from "framer-motion";

import { uid } from "chart.js/helpers";

import { uid } from "chart.js/helpers";

async getMoodExtended(uid: string, days: number): Promise<Response> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const rows = await this.env.JOURNALDB.prepare(`
      SELECT entry_date, mood
      FROM journal_entries
      WHERE uid = ?
        AND mood IS NOT NULL
        AND entry_date >= ?
      ORDER BY entry_date DESC
    `).bind(uid, cutoffStr).all<{ entry_date: string; mood: number }>();

    // Map results (currently DESC order for trend calculation)
    const moodDataDesc = rows.results.map(r => ({ date: r.entry_date, mood: r.mood }));

    // Calculate stats
    const moods = moodDataDesc.map(m => m.mood);
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length || 0;

    // Calculate variance
    const variance = moods.length > 0 
      ? moods.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moods.length
      : 0;

    // ✅ FIXED TREND CALCULATION
    // Compare recent 3 days vs previous 3 days (more responsive and accurate)
    let trend = "stable";
    if (moodDataDesc.length >= 3) {
      // moodDataDesc is sorted DESC (newest first)
      const recentPeriod = moodDataDesc.slice(0, Math.min(3, moodDataDesc.length));
      const previousPeriod = moodDataDesc.slice(3, Math.min(6, moodDataDesc.length));
      
      if (previousPeriod.length > 0) {
        // Compare recent 3 days vs previous 3 days
        const recentAvg = recentPeriod.reduce((sum, m) => sum + m.mood, 0) / recentPeriod.length;
        const previousAvg = previousPeriod.reduce((sum, m) => sum + m.mood, 0) / previousPeriod.length;
        
        const difference = recentAvg - previousAvg;
        
        if (difference > 0.3) {
          trend = "improving";
        } else if (difference < -0.3) {
          trend = "declining";
        }
        // else stays "stable"
      } else if (recentPeriod.length >= 2) {
        // Not enough history, check simple recent trend
        const oldestRecent = recentPeriod[recentPeriod.length - 1]!.mood;
        const newestRecent = recentPeriod[0]!.mood;
        
        if (newestRecent > oldestRecent + 0.5) {
          trend = "improving";
        } else if (newestRecent < oldestRecent - 0.5) {
          trend = "declining";
        }
      }
    }

    // Best day - pick most recent if tied
    const bestDay = moodDataDesc.reduce((best, curr) => {
      if (curr.mood > best.mood) return curr;
      if (curr.mood === best.mood && curr.date > best.date) return curr;
      return best;
    }, { date: "", mood: 0 });

    // Worst day - pick most recent if tied
    const worstDay = moodDataDesc.reduce((worst, curr) => {
      if (curr.mood < worst.mood) return curr;
      if (curr.mood === worst.mood && curr.date > worst.date) return curr;
      return worst;
    }, moodDataDesc[0] || { date: "", mood: 0 });

    // ✅ Reverse data for frontend (oldest to newest for graph)
    const moodData = [...moodDataDesc].reverse();

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
        daysTracked: moodDataDesc.length,
        missedDays: days - moodDataDesc.length
      }
    });
  } catch (e: unknown) {
    return this.json({ error: "extended mood fetch failed", details: String(e) }, 500);
  }
}

/*
============================================
WHAT CHANGED:
============================================

1. ✅ Changed ORDER BY from ASC to DESC
   - Now moodData is sorted newest first
   - Makes slicing for recent period easier

2. ✅ Replaced trend calculation logic
   OLD (splits all data in half):
   - First half: older entries
   - Second half: recent entries
   - Problem: Not responsive to recent changes
   
   NEW (compares last 3 vs previous 3):
   - Recent 3 days: slice(0, 3)
   - Previous 3 days: slice(3, 6)
   - More responsive and accurate

3. ✅ With your data:
   Recent 3: Dec 04 (5), Dec 03 (3), Dec 02 (5) → avg = 4.33
   Previous 3: Dec 01 (3), Nov 30 (5), Nov 29 (4) → avg = 4.0
   Difference: 4.33 - 4.0 = 0.33 → "improving" ✅

============================================
RESULT:
============================================
Your mood will now show "improving" instead of "declining"
because it correctly compares your recent 3 days (better)
vs the previous 3 days (slightly lower).
*/
