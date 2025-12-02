// Add this DEBUG endpoint to your backend to see what's happening
// Add to backend/routes/journal.js

router.get("/insights/debug", verifyToken, async (req, res) => {
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
    
    // Sort by date descending (most recent first)
    const sortedByDate = [...journals].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Calculate current streak
    let currentStreak = 0;
    const streakDetails = [];
    
    for (const entry of sortedByDate) {
      const isGoodMood = entry.mood >= 4;
      streakDetails.push({
        date: entry.date,
        mood: entry.mood,
        isGoodMood,
        countsInStreak: isGoodMood && currentStreak === streakDetails.filter(d => d.countsInStreak).length
      });
      
      if (isGoodMood) {
        currentStreak++;
      } else {
        break; // Stop at first non-good mood
      }
    }
    
    // Also check what the Raindrop service says
    let raindropStreak = null;
    try {
      const raindropUrl = process.env.RAINDROP_URL || 'https://hello-service.01k9ppzcfjfvyc4cwm4p0ccypp.lmapp.run';
      const raindropResponse = await fetch(`${raindropUrl}/analytics/streaks?uid=${userId}`);
      if (raindropResponse.ok) {
        raindropStreak = await raindropResponse.json();
      }
    } catch (err) {
      console.error("Could not fetch Raindrop streak:", err);
    }
    
    res.json({
      debug: {
        totalJournals: journals.length,
        journalsWithMood: journals.filter(j => j.mood).length,
        today: new Date().toISOString().split('T')[0],
        mostRecentEntry: sortedByDate[0]?.date,
        calculatedCurrentStreak: currentStreak,
        raindropCurrentStreak: raindropStreak?.currentStreak,
        last10Entries: sortedByDate.slice(0, 10).map(j => ({
          date: j.date,
          mood: j.mood,
          isGoodMood: j.mood >= 4
        })),
        streakBreakdown: streakDetails.slice(0, 10)
      }
    });
    
  } catch (err) {
    console.error("Error in debug endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});
