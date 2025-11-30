// Add this NEW endpoint to your backend (alongside the existing /quests/active endpoint)

router.get("/quests/all", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const now = new Date();
    
    // Check and generate new quests if needed
    await checkAndGenerateQuests(userId);
    
    // Get ALL quests (both active and completed) that haven't expired
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");
    
    // Fetch quests that are either:
    // 1. Active and not expired
    // 2. Completed today/this week/this month (depending on type)
    const snapshot = await questsRef
      .where("expiresAt", ">", now)
      .get();
    
    const quests = { daily: [], weekly: [], monthly: [] };
    
    snapshot.forEach(doc => {
      const quest = { id: doc.id, ...doc.data() };
      
      // Convert Firestore Timestamp to ISO string
      if (quest.createdAt && quest.createdAt.toDate) {
        quest.createdAt = quest.createdAt.toDate().toISOString();
      }
      if (quest.expiresAt && quest.expiresAt.toDate) {
        quest.expiresAt = quest.expiresAt.toDate().toISOString();
      }
      if (quest.completedAt && quest.completedAt.toDate) {
        quest.completedAt = quest.completedAt.toDate().toISOString();
      }
      
      // Include both active and completed quests
      if (quest.status === "active" || quest.status === "completed") {
        quests[quest.type].push(quest);
      }
    });
    
    res.json(quests);
  } catch (err) {
    console.error("Error fetching all quests:", err);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

// KEEP the existing /quests/active endpoint as-is for backward compatibility
// Other parts of your app might still use it
