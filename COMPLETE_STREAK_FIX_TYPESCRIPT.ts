// ============================================
// COMPLETE FIX FOR STREAK TIMEZONE ISSUE (TypeScript)
// ============================================

// 1. UPDATE YOUR ROUTE HANDLER (in Cloudflare Worker)
// ============================================
if (path === "/analytics/streaks" && method === "GET") {
  const uid = url.searchParams.get("uid");
  const timezone = url.searchParams.get("timezone") || "UTC";
  if (!uid) return this.json({ error: "uid required" }, 400);
  return this.getStreaks(uid, timezone);
}

// 2. UPDATE YOUR getStreaks METHOD
// ============================================
async getStreaks(uid: string, timezone: string = 'UTC'): Promise<Response> {
  try {
    // Get unique dates only (one entry per date)
    const stmt = this.env.JOURNALDB.prepare(
      "SELECT DISTINCT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
    );
    const rows = await stmt.bind(uid).all<{ entry_date: string }>();

    if (!rows.results.length) {
      return this.json({
        uid,
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        totalEntries: 0,
        streakBroken: false,
        missedDays: 0,
        previousStreak: 0,
      });
    }

    // Get unique sorted dates (newest first)
    const uniqueDates: Set<string> = new Set(
      rows.results.map((r: { entry_date: string }) => r.entry_date)
    );
    const dates = Array.from(uniqueDates).sort().reverse();

    // ✅ FIX 1: Use user's timezone instead of server time
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak is still active (last entry is today or yesterday)
    const lastEntryDate = dates[0]!;
    const isStreakActive = lastEntryDate === todayStr || lastEntryDate === yesterdayStr;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // ✅ FIX 2: Calculate brokenStreak FIRST (always, not just when broken)
    let brokenStreak = 0;
    if (dates.length > 0) {
      brokenStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]!);
        const currDate = new Date(dates[i]!);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          brokenStreak++;
        } else {
          break; // Stop at the first gap
        }
      }
    }

    // Calculate current streak
    if (isStreakActive) {
      currentStreak = 1;
      
      // Calculate from most recent date backwards
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]!);
        const currDate = new Date(dates[i]!);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      // ✅ FIX 3: When streak is broken, show the broken streak value
      currentStreak = brokenStreak;
    }

    // Calculate longest streak (all-time)
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]!);
      const currDate = new Date(dates[i]!);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Award badges based on current streak
    const newlyEarned = await this.awardBadges(uid, currentStreak);

    return this.json({
      uid,
      currentStreak, // ✅ Now shows 10 instead of 0 when broken
      longestStreak,
      lastEntryDate,
      totalEntries: dates.length,
      newlyEarned,
      isStreakActive,
      streakBroken: !isStreakActive && dates.length > 0,
      missedDays: !isStreakActive && dates.length > 0 
        ? Math.floor((today.getTime() - new Date(lastEntryDate).getTime()) / 86400000) - 1
        : 0,
      previousStreak: brokenStreak
    });
  } catch (e: unknown) {
    return this.json({ error: "streaks failed", details: String(e) }, 500);
  }
}

// ============================================
// KEY CHANGES FROM YOUR ORIGINAL CODE:
// ============================================
// 
// LINE 17: Added timezone parameter
// OLD: async getStreaks(uid: string): Promise<Response>
// NEW: async getStreaks(uid: string, timezone: string = 'UTC'): Promise<Response>
//
// LINE 43-45: Use user's timezone for "today"
// OLD: const today = new Date();
// NEW: const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
//
// LINE 57-71: Calculate brokenStreak BEFORE isStreakActive check
// OLD: Only calculated inside if (!isStreakActive) block
// NEW: Always calculated, moved before the isStreakActive check
//
// LINE 91-93: Set currentStreak when broken
// OLD: currentStreak stays 0 when !isStreakActive
// NEW: currentStreak = brokenStreak when !isStreakActive
//
// RESULT: currentStreak shows 10 instead of 0 when streak is broken
