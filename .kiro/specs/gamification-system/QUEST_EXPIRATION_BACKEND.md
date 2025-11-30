# Quest Expiration Backend Implementation Guide

## Overview

This document describes the backend implementation required for quest expiration and rotation functionality. The system automatically checks for expired quests when users log in and generates new quests for the next period.

## API Endpoints

### 1. Check and Rotate Expired Quests

**Endpoint:** `POST /journal/quests/check-expiration`

**Purpose:** Check for expired quests and generate new ones for the next period

**Request Body:**
```json
{
  "uid": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "expiredQuests": [
    {
      "id": "quest_daily_write100_20251129",
      "type": "daily",
      "title": "Write 100 words",
      "status": "expired"
    }
  ],
  "newQuests": [
    {
      "id": "quest_daily_write100_20251130",
      "type": "daily",
      "title": "Write 100 words",
      "description": "Express yourself with at least 100 words today",
      "target": 100,
      "progress": 0,
      "reward": { "xp": 10 },
      "expiresAt": "2025-11-30T23:59:59Z"
    }
  ],
  "message": "Expired 3 quest(s) and generated 3 new quest(s)"
}
```

**Implementation Logic:**

```javascript
// Pseudo-code for backend implementation
async function checkAndRotateQuests(uid) {
  const now = new Date();
  const expiredQuests = [];
  const newQuests = [];

  // 1. Fetch all active quests for the user
  const activeQuests = await db.collection('quests')
    .where('userId', '==', uid)
    .where('status', '==', 'active')
    .get();

  // 2. Check each quest for expiration
  for (const quest of activeQuests) {
    const expiresAt = quest.expiresAt.toDate();
    
    if (now > expiresAt) {
      // Mark quest as expired
      await db.collection('quests').doc(quest.id).update({
        status: 'expired',
        expiredAt: now
      });
      
      expiredQuests.push({
        id: quest.id,
        type: quest.type,
        title: quest.title,
        status: 'expired'
      });
    }
  }

  // 3. Check if new quests need to be generated for each period
  const userProgress = await db.collection('userProgress').doc(uid).get();
  const lastGeneration = userProgress.data()?.lastQuestGeneration || {};

  // Check daily quests
  if (shouldGenerateNewQuests(lastGeneration.daily, 'daily')) {
    const dailyQuests = await generateQuestsForPeriod(uid, 'daily');
    newQuests.push(...dailyQuests);
    lastGeneration.daily = now;
  }

  // Check weekly quests
  if (shouldGenerateNewQuests(lastGeneration.weekly, 'weekly')) {
    const weeklyQuests = await generateQuestsForPeriod(uid, 'weekly');
    newQuests.push(...weeklyQuests);
    lastGeneration.weekly = now;
  }

  // Check monthly quests
  if (shouldGenerateNewQuests(lastGeneration.monthly, 'monthly')) {
    const monthlyQuests = await generateQuestsForPeriod(uid, 'monthly');
    newQuests.push(...monthlyQuests);
    lastGeneration.monthly = now;
  }

  // 4. Update last generation timestamps
  if (newQuests.length > 0) {
    await db.collection('userProgress').doc(uid).update({
      lastQuestGeneration: lastGeneration
    });
  }

  return {
    success: true,
    expiredQuests,
    newQuests,
    message: `Expired ${expiredQuests.length} quest(s) and generated ${newQuests.length} new quest(s)`
  };
}

function shouldGenerateNewQuests(lastGeneration, period) {
  if (!lastGeneration) return true;

  const now = new Date();
  const lastGen = new Date(lastGeneration);

  switch (period) {
    case 'daily':
      // Generate new daily quests if it's a new day
      return now.toDateString() !== lastGen.toDateString();
    
    case 'weekly':
      // Generate new weekly quests if it's a new week (Sunday start)
      const nowWeekStart = new Date(now);
      nowWeekStart.setDate(now.getDate() - now.getDay());
      nowWeekStart.setHours(0, 0, 0, 0);
      
      const lastWeekStart = new Date(lastGen);
      lastWeekStart.setDate(lastGen.getDate() - lastGen.getDay());
      lastWeekStart.setHours(0, 0, 0, 0);
      
      return nowWeekStart.getTime() > lastWeekStart.getTime();
    
    case 'monthly':
      // Generate new monthly quests if it's a new month
      return now.getMonth() !== lastGen.getMonth() || 
             now.getFullYear() !== lastGen.getFullYear();
    
    default:
      return false;
  }
}

async function generateQuestsForPeriod(uid, period) {
  const quests = [];
  const templates = getQuestTemplates(period);
  
  // Select 2-3 random templates to avoid repetition
  const selectedTemplates = selectRandomTemplates(templates, period === 'monthly' ? 1 : 2);
  
  for (const template of selectedTemplates) {
    const quest = {
      id: `quest_${period}_${template.id}_${Date.now()}`,
      userId: uid,
      type: period,
      title: template.title,
      description: template.description,
      target: template.target,
      progress: 0,
      reward: template.reward,
      status: 'active',
      createdAt: new Date(),
      expiresAt: calculateExpirationDate(period),
      completedAt: null
    };
    
    await db.collection('quests').add(quest);
    quests.push(quest);
  }
  
  return quests;
}

function calculateExpirationDate(period) {
  const now = new Date();
  
  switch (period) {
    case 'daily':
      // Expires at end of day
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay;
    
    case 'weekly':
      // Expires at end of week (Saturday 11:59 PM)
      const endOfWeek = new Date(now);
      const daysUntilSaturday = 6 - now.getDay();
      endOfWeek.setDate(now.getDate() + daysUntilSaturday);
      endOfWeek.setHours(23, 59, 59, 999);
      return endOfWeek;
    
    case 'monthly':
      // Expires at end of month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return endOfMonth;
    
    default:
      return now;
  }
}

function getQuestTemplates(period) {
  const templates = {
    daily: [
      {
        id: 'write100',
        title: 'Write 100 words',
        description: 'Express yourself with at least 100 words today',
        target: 100,
        reward: { xp: 10 }
      },
      {
        id: 'complete3tasks',
        title: 'Complete 3 tasks',
        description: 'Check off 3 tasks from your planner',
        target: 3,
        reward: { xp: 15 }
      },
      {
        id: 'dailyentry',
        title: 'Daily journal entry',
        description: 'Write at least one journal entry today',
        target: 1,
        reward: { xp: 10 }
      }
    ],
    weekly: [
      {
        id: 'journal5days',
        title: 'Journal 5 days',
        description: 'Write journal entries on 5 different days this week',
        target: 5,
        reward: { xp: 50 }
      },
      {
        id: 'maintain7daystreak',
        title: 'Maintain 7-day streak',
        description: 'Keep your journaling streak alive for 7 days',
        target: 7,
        reward: { xp: 75 }
      },
      {
        id: 'complete15tasks',
        title: 'Complete 15 tasks',
        description: 'Check off 15 tasks from your planner this week',
        target: 15,
        reward: { xp: 60 }
      }
    ],
    monthly: [
      {
        id: 'reach20entries',
        title: 'Reach 20 entries',
        description: 'Write 20 journal entries this month',
        target: 20,
        reward: { xp: 200 }
      },
      {
        id: 'tryallcategories',
        title: 'Try all categories',
        description: 'Complete tasks from all task categories',
        target: 5,
        reward: { xp: 150 }
      },
      {
        id: 'perfectweek',
        title: 'Perfect week',
        description: 'Complete all daily quests for 7 consecutive days',
        target: 7,
        reward: { xp: 250 }
      }
    ]
  };
  
  return templates[period] || [];
}

function selectRandomTemplates(templates, count) {
  // Shuffle and select random templates
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

### 2. Get Last Quest Generation Timestamps

**Endpoint:** `GET /journal/quests/last-generation?uid={userId}`

**Purpose:** Get the last time quests were generated for each period

**Response:**
```json
{
  "daily": "2025-11-30T08:00:00Z",
  "weekly": "2025-11-24T08:00:00Z",
  "monthly": "2025-11-01T08:00:00Z"
}
```

**Implementation:**
```javascript
async function getLastQuestGeneration(uid) {
  const userProgress = await db.collection('userProgress').doc(uid).get();
  const lastGeneration = userProgress.data()?.lastQuestGeneration || {};
  
  return {
    daily: lastGeneration.daily || null,
    weekly: lastGeneration.weekly || null,
    monthly: lastGeneration.monthly || null
  };
}
```

### 3. Manual Quest Rotation

**Endpoint:** `POST /journal/quests/rotate`

**Purpose:** Manually trigger quest rotation for a specific period (useful for testing)

**Request Body:**
```json
{
  "uid": "user123",
  "period": "daily"
}
```

**Response:**
```json
{
  "success": true,
  "newQuests": [
    {
      "id": "quest_daily_write100_20251130",
      "type": "daily",
      "title": "Write 100 words",
      "description": "Express yourself with at least 100 words today",
      "target": 100,
      "progress": 0,
      "reward": { "xp": 10 },
      "expiresAt": "2025-11-30T23:59:59Z"
    }
  ],
  "message": "Generated 2 new daily quest(s)"
}
```

**Implementation:**
```javascript
async function rotateQuestsForPeriod(uid, period) {
  // Mark all active quests of this period as expired
  const activeQuests = await db.collection('quests')
    .where('userId', '==', uid)
    .where('type', '==', period)
    .where('status', '==', 'active')
    .get();

  const batch = db.batch();
  activeQuests.forEach(quest => {
    batch.update(quest.ref, {
      status: 'expired',
      expiredAt: new Date()
    });
  });
  await batch.commit();

  // Generate new quests
  const newQuests = await generateQuestsForPeriod(uid, period);

  // Update last generation timestamp
  await db.collection('userProgress').doc(uid).update({
    [`lastQuestGeneration.${period}`]: new Date()
  });

  return {
    success: true,
    newQuests,
    message: `Generated ${newQuests.length} new ${period} quest(s)`
  };
}
```

## Database Schema Updates

### UserProgress Collection

Add `lastQuestGeneration` field to track when quests were last generated:

```javascript
{
  userId: "user123",
  totalXP: 450,
  currentLevel: 5,
  earnedBadges: ["badge3", "badge4"],
  questsCompleted: 23,
  lastQuestGeneration: {
    daily: Timestamp,    // Last time daily quests were generated
    weekly: Timestamp,   // Last time weekly quests were generated
    monthly: Timestamp   // Last time monthly quests were generated
  },
  stats: {
    totalJournalEntries: 45,
    totalTasksCompleted: 120,
    longestStreak: 14,
    perfectDays: 3
  }
}
```

### Quest Collection

Add `expiredAt` field to track when quests expired:

```javascript
{
  id: "quest_daily_write100",
  userId: "user123",
  type: "daily" | "weekly" | "monthly",
  title: "Write 100 words",
  description: "Express yourself with at least 100 words today",
  target: 100,
  progress: 75,
  reward: {
    xp: 10,
    badge: null
  },
  status: "active" | "completed" | "expired",
  createdAt: Timestamp,
  expiresAt: Timestamp,
  completedAt: Timestamp | null,
  expiredAt: Timestamp | null  // NEW: When quest was marked as expired
}
```

## Frontend Integration

The frontend automatically checks for expired quests in two places:

1. **On App Load (Home.jsx):** Checks once per day when the user opens the app
2. **In Quest Panel (QuestPanel.jsx):** Checks periodically every 5 minutes while the panel is open

Both implementations use localStorage to prevent duplicate checks within the same day.

## Testing Checklist

- [ ] Verify daily quests expire at end of day (11:59 PM)
- [ ] Verify weekly quests expire at end of week (Saturday 11:59 PM)
- [ ] Verify monthly quests expire at end of month
- [ ] Verify new quests are generated when period expires
- [ ] Verify quest variety (no consecutive duplicates)
- [ ] Verify lastQuestGeneration timestamps are updated correctly
- [ ] Verify expired quests are marked with status 'expired'
- [ ] Verify manual rotation endpoint works for testing
- [ ] Verify frontend checks expiration on app load
- [ ] Verify frontend checks expiration periodically in QuestPanel
- [ ] Verify localStorage prevents duplicate checks

## Error Handling

All quest expiration operations should fail gracefully:

- If expiration check fails, log error but don't block app loading
- If quest generation fails, use fallback templates
- If database update fails, retry once before giving up
- Always return success: false with error message in response

## Performance Considerations

- Use batch operations when marking multiple quests as expired
- Index quests collection by userId, status, and expiresAt
- Cache quest templates in memory to avoid repeated database reads
- Limit quest generation to 2-3 quests per period to avoid overwhelming users
