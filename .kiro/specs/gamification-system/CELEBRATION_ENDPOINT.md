# Celebration System Backend Endpoint

## Overview
Add this endpoint to your existing `journal.js` router file in your backend repository to support the celebration system.

---

## Daily Status Check Endpoint

```javascript
// ==========================================
// 🎉 CELEBRATION SYSTEM ENDPOINT
// ==========================================

/**
 * GET /journal/planner/daily-status
 * Check if all tasks are completed for a specific day and calculate stats
 * Query params: uid (from token), date (YYYY-MM-DD format, optional - defaults to today)
 */
router.get("/planner/daily-status", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const dateParam = req.query.date;
    
    // Parse date or use today
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Get all tasks for the specified date
    const userRef = db.collection("users").doc(userId);
    const tasksSnapshot = await userRef
      .collection("tasks")
      .where("date", "==", dateStr)
      .get();
    
    if (tasksSnapshot.empty) {
      return res.json({
        allTasksComplete: false,
        stats: {
          totalTime: "0h 0m",
          tasksCompleted: 0,
          totalTasks: 0,
          streakDays: 0
        },
        reward: null
      });
    }
    
    // Calculate task completion stats
    let totalTasks = 0;
    let completedTasks = 0;
    let totalMinutes = 0;
    
    tasksSnapshot.forEach(doc => {
      const task = doc.data();
      totalTasks++;
      
      if (task.completed) {
        completedTasks++;
        
        // Calculate time spent (if duration is stored)
        if (task.duration) {
          totalMinutes += task.duration;
        } else if (task.estimatedTime) {
          // Use estimated time if actual duration not available
          totalMinutes += task.estimatedTime;
        }
      }
    });
    
    const allTasksComplete = totalTasks > 0 && completedTasks === totalTasks;
    
    // Format total time
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalTime = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m`;
    
    // Get current streak from user data or calculate
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    let streakDays = 0;
    
    // Try to get streak from analytics or calculate
    try {
      // You can integrate with your existing streak calculation here
      // For now, we'll use stored streak data if available
      streakDays = userData.currentStreak || 0;
    } catch (err) {
      console.error("Error calculating streak:", err);
    }
    
    // Determine if special badge should be awarded
    let reward = null;
    if (allTasksComplete) {
      // Check if user already has Perfect Day badge for this date
      const badgesSnapshot = await userRef
        .collection("badges")
        .where("type", "==", "perfect_day")
        .where("earnedDate", "==", dateStr)
        .get();
      
      if (badgesSnapshot.empty) {
        // Award Perfect Day badge
        reward = {
          type: "badge",
          name: "Perfect Day",
          icon: "⭐",
          rarity: "rare"
        };
        
        // Store the badge
        await userRef.collection("badges").add({
          type: "perfect_day",
          name: "Perfect Day",
          icon: "⭐",
          rarity: "rare",
          earnedDate: dateStr,
          earnedAt: new Date()
        });
        
        // Update user stats
        const currentPerfectDays = userData.stats?.perfectDays || 0;
        await userRef.set({
          stats: {
            ...userData.stats,
            perfectDays: currentPerfectDays + 1
          }
        }, { merge: true });
      }
    }
    
    res.json({
      allTasksComplete,
      stats: {
        totalTime,
        tasksCompleted: completedTasks,
        totalTasks,
        streakDays
      },
      reward
    });
    
  } catch (err) {
    console.error("Error checking daily status:", err);
    res.status(500).json({ error: "Failed to check daily status" });
  }
});
```

---

## Firestore Collection Structure

The celebration system uses the following additional Firestore structure:

```
users/{uid}/
  ├── stats: {
  │     perfectDays: number,
  │     totalTasksCompleted: number,
  │     ...
  │   }
  ├── tasks/{taskId}/
  │     ├── date: string (YYYY-MM-DD)
  │     ├── completed: boolean
  │     ├── duration: number (minutes, optional)
  │     └── estimatedTime: number (minutes, optional)
  └── badges/{badgeId}/
        ├── type: string (e.g., "perfect_day")
        ├── name: string
        ├── icon: string
        ├── rarity: "common" | "rare" | "legendary"
        ├── earnedDate: string (YYYY-MM-DD)
        └── earnedAt: timestamp
```

---

## Testing the Endpoint

After adding the code, test with:

```bash
# Check today's status
GET http://localhost:8000/journal/planner/daily-status
Authorization: Bearer {token}

# Check specific date
GET http://localhost:8000/journal/planner/daily-status?date=2025-11-29
Authorization: Bearer {token}
```

### Expected Response

```json
{
  "allTasksComplete": true,
  "stats": {
    "totalTime": "3h 45m",
    "tasksCompleted": 5,
    "totalTasks": 5,
    "streakDays": 7
  },
  "reward": {
    "type": "badge",
    "name": "Perfect Day",
    "icon": "⭐",
    "rarity": "rare"
  }
}
```

---

## Integration Notes

1. **Task Duration Tracking**: If your tasks don't currently store duration, you can use estimated time or add duration tracking when tasks are completed.

2. **Streak Calculation**: This endpoint uses the stored `currentStreak` value. Make sure your streak calculation logic updates this field regularly.

3. **Badge Deduplication**: The endpoint checks if a Perfect Day badge has already been awarded for the specific date to prevent duplicates.

4. **Stats Tracking**: The endpoint updates the `perfectDays` counter in user stats when awarding the badge.

---

## Implementation Complete ✅

The daily status check endpoint is now ready to be added to your backend!
