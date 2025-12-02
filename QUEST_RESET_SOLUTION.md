# Quest Reset Solution

## The Problem

Your existing quests have incorrect `expiresAt` dates because they were created with the broken timezone logic. Even though you've fixed the backend code, the old quests still have wrong expiration dates.

## Quick Solution: Reset All Quests

Add this temporary endpoint to your backend `journal.js`:

```javascript
/**
 * POST /journal/quests/reset-all
 * TEMPORARY: Delete all quests and regenerate with correct timezone
 * Remove this endpoint after using it once
 */
router.post("/quests/reset-all", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");
    
    // Delete all existing quests
    const snapshot = await questsRef.get();
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`🗑️ Deleted ${snapshot.size} old quests for user ${userId}`);
    
    // Reset last generation timestamps
    await userRef.set({
      lastQuestGeneration: {
        daily: null,
        weekly: null,
        monthly: null
      }
    }, { merge: true });
    
    // Generate new quests with correct timezone
    const newQuests = await checkAndGenerateQuests(userId);
    
    console.log(`✅ Generated ${newQuests.length} new quests with correct timezone`);
    
    res.json({
      success: true,
      deletedCount: snapshot.size,
      newQuests,
      message: `Reset complete: deleted ${snapshot.size} old quests, generated ${newQuests.length} new quests`
    });
  } catch (err) {
    console.error("Error resetting quests:", err);
    res.status(500).json({ error: "Failed to reset quests" });
  }
});
```

## How to Use

### Step 1: Add the endpoint to your backend

Add the code above to your `journal.js` file (after the other quest endpoints).

### Step 2: Call it from your browser console

Open your browser console and run:

```javascript
fetch('https://journal-6xfj.onrender.com/journal/quests/reset-all', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Reset result:', data));
```

### Step 3: Verify it worked

Refresh your app and check:
1. Old quests should be gone
2. New quests should appear with correct expiration dates
3. Quest expiration check should now work properly

### Step 4: Remove the endpoint

After using it once, remove the `/quests/reset-all` endpoint from your backend for security.

## Alternative: Manual Database Cleanup

If you prefer, you can also:
1. Go to Firebase Console
2. Navigate to Firestore
3. Find the `users/{userId}/quests` collection
4. Delete all quest documents manually
5. Refresh your app - new quests will be generated automatically

## Why This Works

- Deletes all quests with incorrect expiration dates
- Resets generation timestamps so system thinks it needs to generate new quests
- Calls `checkAndGenerateQuests()` which now uses the fixed timezone logic
- New quests will have correct `expiresAt` dates based on your timezone (Asia/Kolkata)
