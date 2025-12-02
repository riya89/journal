// Add this to your backend/routes/journal.js file

/**
 * GET /journal/insights/fresh
 * Generate fresh insights based on current mood data and streaks
 */
router.get("/insights/fresh", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    
    // Fetch recent journal entries (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    const journalsSnapshot = await userRef
      .collection("journals")
      .where("date", ">=", thirtyDaysAgoStr)
      .orderBy("date", "desc")
      .get();
    
    const journals = [];
    journalsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.mood) {
        journals.push({
          date: data.date,
          mood: parseInt(data.mood),
          content: data.content || ""
        });
      }
    });
    
    if (journals.length === 0) {
      return res.json({ insights: [] });
    }
    
    // Calculate statistics
    const moods = journals.map(j => j.mood);
    const avgMood = moods.reduce((sum, m) => sum + m, 0) / moods.length;
    
    // Find best and worst days
    const sortedByMood = [...journals].sort((a, b) => b.mood - a.mood);
    const bestDay = sortedByMood[0];
    const worstDay = sortedByMood[sortedByMood.length - 1];
    
    // Calculate current streak (consecutive days with mood >= 4)
    let currentStreak = 0;
    const sortedByDate = [...journals].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    for (const entry of sortedByDate) {
      if (entry.mood >= 4) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate max streak in period
    let maxStreak = 0;
    let tempStreak = 0;
    for (const entry of journals) {
      if (entry.mood >= 4) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    // Calculate trend
    const recentMoods = moods.slice(0, 7);
    const olderMoods = moods.slice(7, 14);
    const recentAvg = recentMoods.reduce((sum, m) => sum + m, 0) / recentMoods.length;
    const olderAvg = olderMoods.length > 0 
      ? olderMoods.reduce((sum, m) => sum + m, 0) / olderMoods.length 
      : recentAvg;
    
    let trend = 'stable';
    if (recentAvg - olderAvg > 0.5) trend = 'improving';
    else if (recentAvg - olderAvg < -0.5) trend = 'declining';
    
    // Calculate missed days
    const totalDays = 30;
    const missedDays = totalDays - journals.length;
    
    // Generate insights array
    const insights = [];
    
    // Best day insight
    if (bestDay) {
      insights.push(
        `Your best day was ${formatDate(bestDay.date)} with a mood of ${bestDay.mood}/5`
      );
    }
    
    // Worst day insight (with encouragement)
    if (worstDay && worstDay.mood <= 3) {
      insights.push(
        `Your most challenging day was ${formatDate(worstDay.date)} with a mood of ${worstDay.mood}/5. Even on challenging days, you're tracking your progress. That's a sign of strength.`
      );
    }
    
    // Streak insight (UPDATED - uses current streak)
    const streakToShow = currentStreak > 0 ? currentStreak : maxStreak;
    if (streakToShow >= 3) {
      const message = currentStreak > 0
        ? `You have a ${currentStreak}-day streak of good moods! Keep it going! 🔥`
        : `You had a ${maxStreak}-day streak of good moods! What were you doing during that time?`;
      insights.push(message);
    }
    
    // Trend insight
    if (trend === 'improving') {
      insights.push("Your mood has been improving over this period! Keep up the great work! 🌟");
    } else if (trend === 'stable') {
      insights.push("Your mood has been relatively stable. Consistency is a sign of balance!");
    } else if (trend === 'declining') {
      insights.push("It looks like things have been tough lately. Remember, it's okay to have difficult days. Consider reaching out to someone you trust.");
    }
    
    // Consistency insight
    if (missedDays > 0 && missedDays < 25) {
      insights.push(
        `You missed ${missedDays} ${missedDays === 1 ? 'day' : 'days'} of journaling in last 30 days. Try to journal daily to track your mood more accurately!`
      );
    }
    
    // High average mood
    if (avgMood >= 4) {
      insights.push("You're doing great! Reflect on what's been working well so you can continue these positive habits.");
    }
    
    // Low average mood
    if (avgMood < 3) {
      insights.push("Your average mood has been lower. Consider prioritizing self-care activities like rest, exercise, or connecting with loved ones.");
    }
    
    // Consistency suggestion
    if (journals.length < 15) {
      insights.push("Set a daily reminder to journal. Consistent tracking helps you understand your patterns better.");
    }
    
    res.json({
      insights,
      stats: {
        avgMood: Math.round(avgMood * 10) / 10,
        currentStreak,
        maxStreak,
        trend,
        daysTracked: journals.length,
        missedDays
      }
    });
    
  } catch (err) {
    console.error("Error generating fresh insights:", err);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// Helper function to format dates
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}
