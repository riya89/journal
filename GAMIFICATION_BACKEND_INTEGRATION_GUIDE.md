# Complete Gamification Backend Integration Guide

## Overview

This guide shows you how to integrate the complete gamification system into your existing backend. The gamification system includes:

1. **Quest System** - Daily, weekly, and monthly quests with automatic rotation
2. **XP & Leveling** - Experience points and level progression
3. **Badge System** - Achievement badges with rarity tiers
4. **Celebration System** - Perfect day detection and rewards
5. **Streak Recovery** - Compassionate messaging for broken streaks
6. **Quest Expiration** - Automatic quest rotation when periods end

## Quick Start

### Option 1: Replace Your Existing Quest Code

1. Open your `backend/routes/journal.js` file
2. **Remove** all existing quest-related code (lines with quest templates, quest endpoints, etc.)
3. **Copy** everything from `gamification-backend-complete.js`
4. **Paste** it into your `journal.js` file (after imports and before export)

### Option 2: Merge Carefully

If you have custom modifications, merge section by section:

1. **Quest Templates** (lines 20-120) - Replace your existing templates
2. **Helper Functions** (lines 125-280) - Add these helper functions
3. **Quest Endpoints** (lines 285-550) - Replace your quest endpoints
4. **XP Endpoints** (lines 555-640) - Replace your XP endpoints
5. **Badge Endpoints** (lines 645-700) - Add badge endpoints
6. **Celebration Endpoint** (lines 705-800) - Replace daily status endpoint
7. **Streak Recovery** (lines 805-850) - Add streak recovery endpoint

## What's Included

### 1. Quest System ✅

**Templates:**
- 4 Daily quest templates (2 selected randomly each day)
- 4 Weekly quest templates (2 selected randomly each week)
- 4 Monthly quest templates (1 selected randomly each month)

**Endpoints:**
- `GET /journal/quests/active` - Get all active quests
- `POST /journal/quests/progress` - Update quest progress
- `POST /journal/quests/check-completions` - Check for completed quests
- `POST /journal/quests/check-expiration` - Check and rotate expired quests
- `GET /journal/quests/last-generation` - Get last generation timestamps
- `POST /journal/quests/rotate` - Manually rotate quests (testing)

**Features:**
- Automatic quest generation on first load
- Quest expiration at end of period (daily/weekly/monthly)
- Automatic XP rewards on quest completion
- Level-up detection
- Progress tracking by quest type

### 2. XP & Leveling System ✅

**Endpoints:**
- `GET /journal/user/xp` - Get user XP and level info
- `GET /journal/user/stats` - Get detailed user statistics

**Features:**
- 16+ level progression system
- XP thresholds: 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000, 26000, 33000, 41000, 50000+
- Automatic level calculation
- XP progress tracking
- Level-up detection

### 3. Badge System ✅

**Endpoints:**
- `POST /journal/user/badge/award` - Award a badge to user

**Features:**
- Badge deduplication (can't earn same badge twice)
- Badge tracking in user profile
- Perfect Day badge auto-award
- Badge metadata storage

### 4. Celebration System ✅

**Endpoints:**
- `GET /journal/planner/daily-status` - Check if all tasks complete

**Features:**
- Detects when all tasks are completed for a day
- Calculates total time spent
- Awards Perfect Day badge
- Tracks perfect day count
- Returns celebration data for frontend

### 5. Streak Recovery ✅

**Endpoints:**
- `GET /journal/streak/recovery-message` - Get compassionate message for broken streak

**Features:**
- Integrates with Raindrop analytics
- Detects broken streaks
- Generates compassionate messages
- Shows previous streak achievement
- Encourages fresh start

### 6. Quest Expiration ✅

**Features:**
- Automatic expiration checking
- Marks expired quests as 'expired'
- Generates new quests for next period
- Updates last generation timestamps
- Prevents duplicate quest generation

## Database Schema

### Users Collection

```javascript
users/{uid}/
  ├── totalXP: number
  ├── currentLevel: number
  ├── questsCompleted: number
  ├── earnedBadges: string[]
  ├── currentStreak: number
  ├── lastQuestGeneration: {
  │     daily: string (ISO timestamp),
  │     weekly: string (ISO timestamp),
  │     monthly: string (ISO timestamp)
  │   }
  └── stats: {
        totalJournalEntries: number,
        totalTasksCompleted: number,
        longestStreak: number,
        perfectDays: number
      }
```

### Quests Subcollection

```javascript
users/{uid}/quests/{questId}/
  ├── userId: string
  ├── type: "daily" | "weekly" | "monthly"
  ├── title: string
  ├── description: string
  ├── target: number
  ├── progress: number
  ├── reward: { xp: number, badge: string | null }
  ├── status: "active" | "completed" | "expired"
  ├── trackingType: string
  ├── createdAt: Timestamp
  ├── expiresAt: Timestamp
  ├── completedAt: Timestamp | null
  └── expiredAt: Timestamp | null
```

## Environment Variables

Make sure you have these in your `.env` file:

```bash
# Raindrop URL for streak analytics
RAINDROP_URL=http://localhost:8787

# Firebase credentials (you already have these)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## Testing the Endpoints

### 1. Test Quest System

```bash
# Get active quests (will auto-generate if none exist)
curl -X GET http://localhost:8000/journal/quests/active \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update quest progress
curl -X POST http://localhost:8000/journal/quests/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questType": "word_count",
    "progress": 100,
    "date": "2025-11-30"
  }'

# Check for expired quests
curl -X POST http://localhost:8000/journal/quests/check-expiration \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"uid": "YOUR_UID"}'
```

### 2. Test XP System

```bash
# Get user XP
curl -X GET http://localhost:8000/journal/user/xp \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user stats
curl -X GET http://localhost:8000/journal/user/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Badge System

```bash
# Award a badge
curl -X POST http://localhost:8000/journal/user/badge/award \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"badgeId": "perfect_day_1"}'
```

### 4. Test Celebration System

```bash
# Check daily status
curl -X GET "http://localhost:8000/journal/planner/daily-status?date=2025-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Test Streak Recovery

```bash
# Get recovery message
curl -X GET http://localhost:8000/journal/streak/recovery-message \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Integration with Frontend

The frontend is already set up to use these endpoints:

1. **Quest Progress** - `src/utils/questProgress.js` calls `/quests/progress`
2. **Quest Expiration** - `src/utils/questExpiration.js` calls `/quests/check-expiration`
3. **XP Bar** - `src/components/XPBar.jsx` calls `/user/xp`
4. **Quest Panel** - `src/components/QuestPanel.jsx` calls `/quests/active`
5. **Celebration** - Calls `/planner/daily-status` after task completion
6. **Streak Recovery** - `src/pages/Home.jsx` calls `/streak/recovery-message`

## Common Issues & Solutions

### Issue: Quests not generating

**Solution:** Check that `lastQuestGeneration` field exists in user document. If missing, quests will generate on next `/quests/active` call.

### Issue: XP not updating

**Solution:** Verify quest completion is calling the progress endpoint correctly. Check that `totalXP` field exists in user document.

### Issue: Badges not awarding

**Solution:** Ensure `earnedBadges` array exists in user document. Check that badge IDs match between frontend and backend.

### Issue: Streak recovery not showing

**Solution:** Verify Raindrop URL is correct in environment variables. Check that Raindrop is returning `streakBroken: true`.

### Issue: Quest expiration not working

**Solution:** Verify frontend is calling `/quests/check-expiration` on app load. Check that `expiresAt` dates are set correctly.

## Migration from Old Backend

If you're migrating from your old quest system:

1. **Backup your database** before making changes
2. **Export existing quest data** if you want to preserve it
3. **Update user documents** to include new fields:
   ```javascript
   {
     lastQuestGeneration: { daily: null, weekly: null, monthly: null },
     earnedBadges: [],
     stats: { perfectDays: 0, ... }
   }
   ```
4. **Delete old quests** or mark them as expired
5. **Test with a single user** before rolling out to all users

## Performance Optimization

The backend is optimized for performance:

- Quest templates are stored in memory (no database reads)
- Batch operations for marking multiple quests as expired
- Efficient Firestore queries with proper indexing
- Minimal database writes (only when necessary)
- Caching of user data to reduce reads

## Monitoring & Logging

The backend includes comprehensive logging:

- Quest generation events
- Quest completion events
- XP awards and level-ups
- Badge awards
- Expiration checks
- Error handling

Check your server logs for messages like:
- `"Error fetching active quests:"`
- `"Error updating quest progress:"`
- `"Error checking quest expiration:"`

## Next Steps

1. ✅ Copy the backend code to your `journal.js` file
2. ✅ Test all endpoints with curl or Postman
3. ✅ Verify frontend integration works
4. ✅ Test quest generation and expiration
5. ✅ Test XP and leveling system
6. ✅ Test badge awards
7. ✅ Test celebration system
8. ✅ Test streak recovery
9. ✅ Deploy to production

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set
3. Test endpoints individually with curl
4. Check Firestore security rules allow the operations
5. Verify Firebase credentials are correct

## Summary

This complete gamification backend provides:

- ✅ 12 quest templates across 3 periods
- ✅ 10 API endpoints for full functionality
- ✅ Automatic quest generation and rotation
- ✅ XP and leveling with 16+ levels
- ✅ Badge system with deduplication
- ✅ Perfect day celebration
- ✅ Compassionate streak recovery
- ✅ Comprehensive error handling
- ✅ Performance optimizations
- ✅ Full frontend integration

Just copy the code, test the endpoints, and you're ready to go! 🎮✨
