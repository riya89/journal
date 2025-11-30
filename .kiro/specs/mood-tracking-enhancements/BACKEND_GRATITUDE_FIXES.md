# Backend Gratitude Fixes

Replace your gratitude endpoints with these updated versions:

```javascript
// ===========================================
// 🙏 GRATITUDE JAR FEATURE (UPDATED)
// ===========================================

// Add gratitude entry
router.post("/gratitude/add", verifyToken, async (req, res) => {
  try {
    const { gratitudeText, mood } = req.body;
    
    // Validate gratitude text
    if (!gratitudeText || !gratitudeText.trim()) {
      return res.status(400).json({ error: "Gratitude text is required" });
    }
    
    // Validate mood if provided
    if (mood && (mood < 1 || mood > 5)) {
      return res.status(400).json({ error: "Mood must be between 1 and 5" });
    }
    
    const gratitudeRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries")
      .doc();
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    await gratitudeRef.set({
      gratitudeId: gratitudeRef.id,
      userId: req.uid,
      gratitudeText: gratitudeText.trim(),
      date: dateStr,
      mood: mood || null,
      createdAt: now
    });
    
    res.json({
      gratitudeId: gratitudeRef.id,
      success: true
    });
  } catch (err) {
    console.error("Error adding gratitude:", err);
    res.status(500).json({ error: "Failed to add gratitude entry" });
  }
});

// Get random gratitude entry
router.get("/gratitude/random", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries");
    
    const snapshot = await gratitudesRef.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: "No gratitude entries found" });
    }
    
    // Get random entry
    const entries = [];
    snapshot.forEach(doc => {
      entries.push(doc.data());
    });
    
    const randomEntry = entries[Math.floor(Math.random() * entries.length)];
    
    res.json({
      gratitudeId: randomEntry.gratitudeId,
      gratitudeText: randomEntry.gratitudeText,
      date: randomEntry.date,
      mood: randomEntry.mood
    });
  } catch (err) {
    console.error("Error fetching random gratitude:", err);
    res.status(500).json({ error: "Failed to fetch random gratitude" });
  }
});

// Get all gratitude entries with optional filtering
router.get("/gratitude/all", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, mood } = req.query;
    
    let gratitudesRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries")
      .orderBy("date", "desc");
    
    // Apply filters if provided
    if (startDate) {
      gratitudesRef = gratitudesRef.where("date", ">=", startDate);
    }
    if (endDate) {
      gratitudesRef = gratitudesRef.where("date", "<=", endDate);
    }
    if (mood) {
      gratitudesRef = gratitudesRef.where("mood", "==", parseInt(mood));
    }
    
    const snapshot = await gratitudesRef.get();
    
    const gratitudes = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      gratitudes.push({
        gratitudeId: data.gratitudeId,
        gratitudeText: data.gratitudeText,
        date: data.date,
        mood: data.mood
      });
    });
    
    res.json({
      gratitudes,
      total: gratitudes.length
    });
  } catch (err) {
    console.error("Error fetching gratitudes:", err);
    res.status(500).json({ error: "Failed to fetch gratitude entries" });
  }
});
```

## Key Changes:

1. ✅ Added mood validation (1-5 range)
2. ✅ Fixed random endpoint to return 404 when empty
3. ✅ Added filtering support (startDate, endDate, mood)
4. ✅ Improved error messages
5. ✅ Consistent date handling

## Testing the Filters:

```bash
# Filter by mood
curl -X GET "http://localhost:8000/journal/gratitude/all?mood=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by date range
curl -X GET "http://localhost:8000/journal/gratitude/all?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combine filters
curl -X GET "http://localhost:8000/journal/gratitude/all?mood=4&startDate=2025-11-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
