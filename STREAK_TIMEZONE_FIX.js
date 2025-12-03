// FIXED getStreaks method with timezone support
// This ensures currentStreak shows correctly even when streak is broken

// ✅ ROUTE HANDLER (add this to your fetch handler):
// if (url.pathname === '/raindrop/streaks') {
//   const uid = url.searchParams.get('uid');
//   const timezone = url.searchParams.get('timezone') || 'UTC';
//   return await this.getStreaks(uid, timezone);
// }

async getStreaks(uid, timezone = 'UTC') {
  try {
    // Get unique dates only (one entry per date)
    const stmt = this.env.JOURNALDB.prepare(
      "SELECT DISTINCT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
    );
    const rows = await stmt.bind(uid).all();

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
    const uniqueDates = new Set(rows.results.map(r => r.entry_date));
    const dates = Array.from(uniqueDates).sort().reverse();

    // ✅ FIX: Use user's timezone instead of server time
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak is still active (last entry is today or yesterday)
    const lastEntryDate = dates[0];
    const isStreakActive = lastEntryDate === todayStr || lastEntryDate === yesterdayStr;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // ✅ FIX: Calculate the streak that just broke FIRST (before checking isStreakActive)
    // This ensures we always have the correct previousStreak value
    let brokenStreak = 0;
    if (dates.length > 0) {
      // Start from the last entry date and count backwards
      brokenStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          brokenStreak++;
        } else {
          break; // Stop at the first gap
        }
      }
    }

    // Calculate current streak (only if active)
    if (isStreakActive) {
      currentStreak = 1; // Start counting from the most recent entry

      // Calculate current streak from most recent date backwards
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
    } else {
      // ✅ KEY FIX: When streak is broken, currentStreak should show the broken streak
      // This is what the user expects to see - their recent streak that just ended
      currentStreak = brokenStreak;
    }

    // Calculate longest streak (all-time)
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
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
      currentStreak, // ✅ Now shows broken streak value when streak is inactive
      longestStreak,
      lastEntryDate,
      totalEntries: dates.length,
      newlyEarned,
      isStreakActive,
      streakBroken: !isStreakActive && dates.length > 0,
      missedDays: !isStreakActive && dates.length > 0 
        ? Math.floor((today.getTime() - new Date(lastEntryDate).getTime()) / 86400000) - 1
        : 0,
      previousStreak: brokenStreak // Used by streak recovery modal
    });
  } catch (e) {
    return this.json({ error: "streaks failed", details: String(e) }, 500);
  }
}

/*
KEY CHANGES:

1. ✅ Added timezone parameter (defaults to 'UTC')
   - Method signature: async getStreaks(uid, timezone = 'UTC')
   - Used when calculating today's date

2. ✅ Use user's timezone for "today" calculation
   - const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
   - This ensures streak status is based on user's local time, not server time

3. ✅ Calculate brokenStreak BEFORE checking isStreakActive
   - This ensures we always have the correct value

4. ✅ Set currentStreak = brokenStreak when streak is broken
   - This is the KEY FIX for your issue
   - When streak is inactive, currentStreak shows the recent broken streak
   - This matches user expectations: "I had a 10-day streak, why does it show 0?"

EXAMPLE SCENARIO (Your Case):
- User had entries: Dec 1, 2, 3, 4 (4 days), then Nov 24-30 (7 days) = 10 total consecutive
- Last entry: Dec 4
- Today: Dec 6 (in Asia/Calcutta timezone)
- Missed: Dec 5

BEFORE FIX:
- isStreakActive = false
- currentStreak = 0 ❌ (because streak is broken)
- previousStreak = 10 ✅

AFTER FIX:
- isStreakActive = false
- brokenStreak = 10 (counts from Dec 4 backwards)
- currentStreak = 10 ✅ (set to brokenStreak when inactive)
- previousStreak = 10 ✅

RESULT: User sees "Current Streak: 10" with the recovery modal showing they can recover it
*/
