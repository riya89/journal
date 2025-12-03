// Complete getStreaks method for Raindrop Worker
// This fixes the "1 day" streak recovery issue

async getStreaks(uid: string): Promise<Response> {
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

    const today = new Date();
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

    // Calculate current streak (only if active)
    if (isStreakActive) {
      currentStreak = 1; // Start counting from the most recent entry

      // Calculate current streak from most recent date backwards
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]!);
        const currDate = new Date(dates[i]!);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
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

    // ✅ FIX: Calculate the streak that just broke (for recovery message)
    let brokenStreak = 0;
    if (!isStreakActive && dates.length > 0) {
      // Start from the last entry date and count backwards
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

    // Award badges based on current streak
    const newlyEarned = await this.awardBadges(uid, currentStreak);

    return this.json({
      uid,
      currentStreak,
      longestStreak,
      lastEntryDate,
      totalEntries: dates.length,
      newlyEarned,
      isStreakActive,
      // ✅ FIX: These fields are used by the streak recovery modal
      streakBroken: !isStreakActive && dates.length > 0,
      missedDays: !isStreakActive && dates.length > 0 
        ? Math.floor((today.getTime() - new Date(lastEntryDate).getTime()) / 86400000) - 1
        : 0,
      previousStreak: brokenStreak // ✅ THIS IS THE KEY FIX - use broken streak, not longestStreak
    });
  } catch (e: unknown) {
    return this.json({ error: "streaks failed", details: String(e) }, 500);
  }
}

/*
EXPLANATION OF THE FIX:

BEFORE (WRONG):
previousStreak: !isStreakActive ? longestStreak : 0

This would return the all-time longest streak, which could be from months ago.
Example: User had a 10-day streak 3 months ago, then a 4-day streak last week.
         When they miss a day, it would show "Your 10-day streak" instead of "Your 4-day streak"

AFTER (CORRECT):
previousStreak: brokenStreak

This calculates the streak that just ended by counting consecutive days from the last entry backwards.
Example: User had entries on Dec 1, 2, 3, 4 (4 days), then missed Dec 5.
         brokenStreak = 4, so it shows "Your 4-day streak was amazing!"

HOW brokenStreak IS CALCULATED:
1. Only runs if streak is broken (!isStreakActive)
2. Starts at 1 (the last entry date)
3. Counts backwards through dates
4. Increments for each consecutive day (diffDays === 1)
5. Stops at the first gap (break)
6. Returns the count of consecutive days before the break

EXAMPLE:
Dates: [Dec 4, Dec 3, Dec 2, Dec 1, Nov 28, Nov 27]
Today: Dec 6 (missed Dec 5)

- isStreakActive = false (last entry Dec 4, not yesterday/today)
- brokenStreak starts at 1 (Dec 4)
- Dec 4 -> Dec 3: diffDays = 1, brokenStreak = 2
- Dec 3 -> Dec 2: diffDays = 1, brokenStreak = 3
- Dec 2 -> Dec 1: diffDays = 1, brokenStreak = 4
- Dec 1 -> Nov 28: diffDays = 3, BREAK
- Final brokenStreak = 4

Result: "Your 4-day streak was amazing!"
*/
