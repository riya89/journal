# 🔧 Backend Implementation Specification

## API Endpoints to Implement

### 1. Streak Management

#### Check Streak Status
```
GET /journal/streak/check?uid={userId}
```
**Logic:**
- Get user's last journal entry date
- Compare with today
- If gap > 1 day: streak broken
- Return previous streak count
- Generate encouraging message

**Response:**
```json
{
  "streakBroken": true,
  "lastEntry": "2025-11-27",
  "missedDays": 1,
  "previousStreak": 14,
  "message": {
    "title": "Hey, are you okay? 💙",
    "body": "We noticed you missed yesterday...",
    "encouragement": "Your 14-day streak was amazing!",
    "cta": "Start Writing"
  }
}
```

---

### 2. Post-Journal Task Check

#### Save Entry with Task Check
```
POST /journal/entry/save
Body: { journalText, mood, date, uid }
```
**Logic:**
- Save journal entry
- Query planner for today's tasks
- Check completion status
- Return task list with prompt

**Response:**
```json
{
  "entrySaved": true,
  "taskCheck": {
    "hasTasks": true,
    "todaysTasks": [...],
    "prompt": {
      "title": "Great journaling! 📝",
      "message": "Did you complete your planned tasks?",
      "quickActions": [...]
    }
  }
}
```

---

### 3. Journal Content Analysis

#### Analyze for Task Suggestions
```
POST /journal/entry/analyze
Body: { journalText, mood, uid }
```
**Logic:**
- Use NLP/keyword detection for themes
- Detect: stress, anxiety, happiness, exercise, work, etc.
- Match themes to task templates
- Return 2-3 relevant suggestions

**Response:**
```json
{
  "detectedThemes": ["stress", "work"],
  "suggestedTasks": [
    {
      "name": "10-minute breathing exercise",
      "category": "self-care",
      "timeEstimate": 10,
      "reason": "You mentioned feeling stressed"
    }
  ]
}
```

---

### 4. Daily Status Check

#### Check Task Completion
```
GET /journal/planner/daily-status?uid={userId}&date=2025-11-29
```
**Logic:**
- Get all tasks for date
- Check completion status
- If all complete: trigger celebration
- Calculate stats

**Response:**
```json
{
  "allTasksComplete": true,
  "celebration": {
    "title": "You crushed it today! 🎉",
    "stats": {
      "totalTime": "3h 45m",
      "tasksCompleted": 5
    },
    "reward": {
      "type": "badge",
      "name": "Perfect Day"
    }
  }
}
```

---

### 5. Morning Greeting

#### Get Daily Greeting
```
GET /journal/daily/greeting?uid={userId}&time=morning
```
**Logic:**
- Check time of day
- Get today's tasks from planner
- Get current streak
- Generate personalized greeting

**Response:**
```json
{
  "greeting": {
    "title": "Good morning, Riya! ☀️",
    "todaysFocus": {
      "tasks": 4,
      "estimatedTime": "2h 30m"
    },
    "motivation": "You're on a 7-day streak!"
  }
}
```

---

### 6. Evening Reflection

#### Get Evening Prompt
```
GET /journal/daily/evening-prompt?uid={userId}
```
**Logic:**
- Check if evening (7-9 PM)
- Get today's task completion
- Generate reflection questions

**Response:**
```json
{
  "prompt": {
    "title": "How was your day? 🌙",
    "questions": [
      "What went well today?",
      "What challenged you?",
      "What are you grateful for?"
    ],
    "taskSummary": {
      "completed": 3,
      "total": 5
    }
  }
}
```

---

### 7. Milestone Tracking

#### Check Milestones
```
GET /journal/milestones/check?uid={userId}
```
**Logic:**
- Count total entries
- Check against milestone thresholds: 10, 25, 50, 100, 250, 500
- Calculate stats (words, average, etc.)
- Return new unlocks

**Milestones:**
- 10 entries: "Getting Started" badge
- 25 entries: "Committed Writer" badge
- 50 entries: "Storyteller" badge + custom themes
- 100 entries: "Century Club" badge + export feature
- 250 entries: "Dedicated Journaler" badge
- 500 entries: "Master Chronicler" badge

**Response:**
```json
{
  "newMilestones": [
    {
      "id": "milestone_50",
      "title": "50 Journal Entries!",
      "reward": {
        "badge": "Storyteller",
        "unlocks": "Custom journal themes"
      },
      "stats": {
        "totalWords": 12500,
        "averagePerEntry": 250
      }
    }
  ]
}
```

---

### 8. Smart Nudges

#### Check if Nudge Needed
```
GET /journal/nudge/check?uid={userId}
```
**Logic:**
- Get user's typical writing time
- Check if they've written today
- If past usual time + not written: nudge
- Use gentle, supportive language

**Response:**
```json
{
  "shouldNudge": true,
  "nudge": {
    "type": "gentle",
    "message": "Your journal misses you 💙",
    "context": "You usually write around this time",
    "dismissible": true
  }
}
```

---

### 9. Weekly Summary

#### Get Weekly Stats
```
GET /journal/summary/weekly?uid={userId}
```
**Logic:**
- Get last 7 days of data
- Calculate: entries, tasks, mood, words
- Generate insights
- Find best/worst days

**Response:**
```json
{
  "week": "Nov 23-29",
  "stats": {
    "entriesWritten": 6,
    "tasksCompleted": 28,
    "averageMood": 3.8,
    "totalWords": 1850
  },
  "highlights": [
    "Your mood improved by 25% this week!",
    "You completed 90% of your planned tasks"
  ],
  "insights": {
    "bestDay": "Friday",
    "improvement": "Evening mood getting better"
  }
}
```

