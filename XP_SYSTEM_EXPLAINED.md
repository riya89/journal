# XP System Explained

## How XP Works

### What is XP?
XP (Experience Points) is a gamification system that rewards you for completing quests and activities in your journal app.

### How to Earn XP
You earn XP by completing **Quests**:
- **Daily Quests**: Reset every day at midnight
- **Weekly Quests**: Reset every Monday at midnight
- **Monthly Quests**: Reset on the 1st of each month

### XP Rewards
Each quest has an XP reward (e.g., +50 XP, +100 XP, +200 XP)

### Leveling Up
- Your total XP accumulates over time (never resets)
- As you earn more XP, you level up
- Each level requires more XP than the previous one
- Leveling up unlocks new badges and achievements

### XP Refresh Schedule
- **XP Total**: NEVER resets - it's cumulative
- **Daily Quests**: Reset at midnight (00:00) every day
- **Weekly Quests**: Reset every Monday at midnight
- **Monthly Quests**: Reset on the 1st of each month at midnight

### Example Flow
1. **Day 1**: Complete "Morning Journal" quest → Earn 50 XP → Total: 50 XP
2. **Day 2**: Complete "Morning Journal" quest again → Earn 50 XP → Total: 100 XP
3. **Day 3**: Complete "Morning Journal" + "Complete 3 Tasks" → Earn 80 XP → Total: 180 XP
4. Continue accumulating XP to level up!

---

## Backend Issues Found

### 1. Duplicate Weekly Quest
**Issue**: "Complete 20 Tasks" quest appears twice in weekly quests
**Location**: Quest generation logic in backend
**Fix Needed**: Remove duplicate quest from weekly quest pool

### 2. Word Count Logic
**Issue**: Does the "Write 5000 words" monthly quest count words from multiple journal entries on the same date?
**Question**: If I journal twice on the same day, do both entries count toward the word count?
**Expected Behavior**: 
- ✅ Should count ALL words written in the month, regardless of how many times you edit/save
- ✅ Should accumulate across multiple entries on the same day
- ❌ Should NOT double-count if you edit an existing entry

**Recommendation**: 
- Track total word count per day (not per entry)
- When user saves journal for a date, update that date's word count
- Sum all daily word counts for the month

### 3. Quest Progress Tracking
**Current Behavior**: Quests show progress (e.g., 1/3 tasks completed)
**Question**: How is progress tracked?
- Is it real-time or does it update on page refresh?
- Does it track across multiple sessions?

---

## XP System Architecture

```
User Actions → Quest Progress → XP Earned → Level Up → Badges Unlocked
     ↓              ↓              ↓            ↓            ↓
  Journal      Track in DB    Add to Total   Calculate   Show Modal
  Complete     Update Quest   User XP        New Level   Celebration
  Tasks        Status
```

### Database Structure (Recommended)
```javascript
users/{userId}/
  ├── xp: 1250 (total XP, never resets)
  ├── level: 5
  ├── quests/{questId}/
  │   ├── type: "daily" | "weekly" | "monthly"
  │   ├── status: "active" | "completed"
  │   ├── progress: 2
  │   ├── target: 3
  │   ├── createdAt: timestamp
  │   ├── expiresAt: timestamp
  │   └── completedAt: timestamp (if completed)
```

---

## Recommendations

### For Better UX
1. Show XP gain animation when quest is completed
2. Display "Level Up!" modal when user reaches new level
3. Show progress bar for current level (e.g., "Level 5: 250/500 XP")
4. Add XP history/log so users can see what they earned

### For Backend
1. Fix duplicate weekly quest
2. Clarify word count logic (count all words in month)
3. Add quest progress webhook/real-time updates
4. Add XP transaction log for debugging

### For Frontend
1. ✅ Show completed quests with checkmark (DONE)
2. ✅ Sort incomplete quests first (DONE)
3. Add XP gain toast notification
4. Add level-up celebration animation
