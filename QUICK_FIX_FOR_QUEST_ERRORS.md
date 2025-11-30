# Quick Fix for Quest Progress Errors

## The Problem

Your quest progress calls are failing because of a **data format mismatch** between frontend and backend.

**Frontend sends:**
```javascript
{
  uid: "user123",
  questType: "word_count",  // ❌ Generic type
  progress: 150,
  date: "2025-12-01"
}
```

**Backend expects:**
```javascript
{
  questId: "quest_abc123",  // ✅ Specific quest ID
  progress: 150
}
```

---

## Solution: Fix the Frontend

Update `src/utils/questProgress.js` to fetch active quests first, then update them with the correct IDs.

### Step 1: Update the Import
```javascript
import { apiPost } from './api';

// Add this helper to get auth token
const getAuthToken = () => localStorage.getItem('token');
```

### Step 2: Replace `updateJournalQuests` Function

Replace the entire `updateJournalQuests` function with this:

```javascript
/**
 * Update quest progress after journal save
 * Tracks word count and daily entry quests
 * @param {string} userId - User ID
 * @param {string} content - Journal content
 * @param {string} date - Journal date
 */
export const updateJournalQuests = async (userId, content, date) => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token, skipping quest update');
      return;
    }

    // 1. Fetch active quests
    const questsRes = await fetch('http://localhost:8000/journal/quests/active', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!questsRes.ok) {
      throw new Error('Failed to fetch active quests');
    }

    const quests = await questsRes.json();
    
    // 2. Calculate word count
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

    // 3. Update word count quest if it exists
    const wordCountQuest = quests.find(q => 
      q.type === 'word_count' && 
      q.status === 'active'
    );
    
    if (wordCountQuest) {
      await apiPost('http://localhost:8000/journal/quests/progress', {
        questId: wordCountQuest.id,
        progress: wordCount
      });
      console.log(`✅ Updated word count quest: ${wordCount} words`);
    }

    // 4. Update daily entry quest if it exists
    const dailyQuest = quests.find(q => 
      q.type === 'daily_entry' && 
      q.status === 'active'
    );
    
    if (dailyQuest) {
      await apiPost('http://localhost:8000/journal/quests/progress', {
        questId: dailyQuest.id,
        progress: dailyQuest.progress + 1  // Increment by 1
      });
      console.log('✅ Updated daily entry quest');
    }

    console.log('✅ Quest progress updated for journal save');
  } catch (error) {
    console.error('❌ Failed to update journal quest progress:', error);
    // Don't throw - quest updates should not block journal saves
  }
};
```

### Step 3: Replace `updateTaskQuests` Function

Replace the entire `updateTaskQuests` function with this:

```javascript
/**
 * Update quest progress after task completion
 * Tracks task completion and category-specific quests
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {string} category - Task category
 * @param {string} date - Completion date
 * @param {boolean} completed - Whether task was completed or uncompleted
 */
export const updateTaskQuests = async (userId, taskId, category, date, completed) => {
  try {
    if (!completed) {
      // If task was uncompleted, we don't update quest progress
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token, skipping quest update');
      return;
    }

    // 1. Fetch active quests
    const questsRes = await fetch('http://localhost:8000/journal/quests/active', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!questsRes.ok) {
      throw new Error('Failed to fetch active quests');
    }

    const quests = await questsRes.json();

    // 2. Update task completion quest if it exists
    const taskQuest = quests.find(q => 
      q.type === 'task_completion' && 
      q.status === 'active'
    );
    
    if (taskQuest) {
      await apiPost('http://localhost:8000/journal/quests/progress', {
        questId: taskQuest.id,
        progress: taskQuest.progress + 1  // Increment by 1
      });
      console.log('✅ Updated task completion quest');
    }

    // 3. Update category-specific quest if applicable
    if (category) {
      const categoryQuest = quests.find(q => 
        q.type === 'category_task' && 
        q.status === 'active' &&
        q.metadata?.category === category
      );
      
      if (categoryQuest) {
        await apiPost('http://localhost:8000/journal/quests/progress', {
          questId: categoryQuest.id,
          progress: categoryQuest.progress + 1  // Increment by 1
        });
        console.log(`✅ Updated ${category} category quest`);
      }
    }

    console.log('✅ Quest progress updated for task completion');
  } catch (error) {
    console.error('❌ Failed to update task quest progress:', error);
    // Don't throw - quest updates should not block task operations
  }
};
```

### Step 4: Replace `updateStreakQuests` Function

Replace the entire `updateStreakQuests` function with this:

```javascript
/**
 * Update quest progress for streak-related quests
 * Called when streak data is calculated
 * @param {string} userId - User ID
 * @param {number} currentStreak - Current streak count
 * @param {string} date - Current date
 */
export const updateStreakQuests = async (userId, currentStreak, date) => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token, skipping quest update');
      return;
    }

    // 1. Fetch active quests
    const questsRes = await fetch('http://localhost:8000/journal/quests/active', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!questsRes.ok) {
      throw new Error('Failed to fetch active quests');
    }

    const quests = await questsRes.json();

    // 2. Update streak quest if it exists
    const streakQuest = quests.find(q => 
      q.type === 'streak' && 
      q.status === 'active'
    );
    
    if (streakQuest) {
      await apiPost('http://localhost:8000/journal/quests/progress', {
        questId: streakQuest.id,
        progress: currentStreak
      });
      console.log(`✅ Updated streak quest: ${currentStreak} days`);
    }

    console.log('✅ Quest progress updated for streak');
  } catch (error) {
    console.error('❌ Failed to update streak quest progress:', error);
    // Don't throw - quest updates should not block other operations
  }
};
```

---

## Fix for Task Analysis Error (Optional)

The task analysis endpoint doesn't exist yet. You have two options:

### Option 1: Disable It (Quick)

In `src/components/JournalModal.jsx`, comment out the task analysis call:

```javascript
// 4️⃣ Analyze journal for task suggestions (non-blocking)
// analyzeForTaskSuggestions(content, mood, selectedDate).catch(err => {
//   console.warn('Task suggestion analysis failed, but journal saved successfully:', err);
// });
```

### Option 2: Implement It (Later)

See `.kiro/specs/ai-assistant-enhancements/backend-task-suggestions.md` for full implementation.

---

## Testing

After making these changes:

1. **Save a journal entry** with at least 100 words
2. **Check browser console** - you should see:
   ```
   ✅ Updated word count quest: 150 words
   ✅ Updated daily entry quest
   ✅ Quest progress updated for journal save
   ```
3. **Check Network tab** - the quest progress calls should return 200 OK
4. **Check your gamification UI** - XP should increase when quests complete

---

## Why This Works

**Before:**
- Frontend sent generic `questType`
- Backend didn't know which specific quest to update
- Result: 400 Bad Request

**After:**
- Frontend fetches all active quests first
- Finds the specific quest by type
- Sends the actual `questId` to backend
- Result: Quest updates successfully ✅

---

## Summary

1. Update `src/utils/questProgress.js` with the new code above
2. Optionally disable task analysis in `JournalModal.jsx`
3. Test by saving a journal entry
4. Quest progress should now work! 🎉
