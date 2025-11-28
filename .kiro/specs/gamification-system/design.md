# Gamification System Design

## Overview

The Gamification System adds engaging elements to the journaling app through quests, celebrations, and compassionate streak recovery. The design integrates with existing Raindrop backend analytics and Firebase/Node.js backend for quest management, while maintaining the app's gentle, supportive aesthetic.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
├─────────────────────────────────────────────────────────┤
│  QuestPanel  │  CelebrationModal  │  StreakRecoveryModal│
│  XPBar       │  BadgeGallery      │  LevelUpNotification│
└──────────────┬──────────────────────────────────────────┘
               │
               ├──────────────┬──────────────────┐
               │              │                  │
         ┌─────▼─────┐  ┌────▼────┐      ┌─────▼──────┐
         │  Firebase  │  │ Node.js │      │  Raindrop  │
         │  Firestore │  │ Backend │      │  Analytics │
         └────────────┘  └─────────┘      └────────────┘
              │               │                   │
         Quest Data      Quest Logic         Streak Data
         User Progress   Rewards             Badge Awards
```

### Data Flow

1. **Quest Generation**: Node.js backend generates quests based on user activity patterns
2. **Progress Tracking**: Frontend updates quest progress in real-time, syncs to Firebase
3. **Streak Detection**: Raindrop analytics calculates streaks, Node.js handles recovery messaging
4. **Celebrations**: Frontend triggers celebrations based on task completion data from Firebase

## Components and Interfaces

### 1. Quest System

#### Backend API (Node.js)

```javascript
// GET /journal/quests/active?uid={userId}
Response: {
  daily: [
    {
      id: "quest_daily_write100",
      title: "Write 100 words",
      description: "Express yourself with at least 100 words today",
      type: "daily",
      progress: 75,
      target: 100,
      reward: { xp: 10, badge: null },
      expiresAt: "2025-11-30T00:00:00Z"
    }
  ],
  weekly: [...],
  monthly: [...]
}

// POST /journal/quests/progress
Body: {
  uid: "user123",
  questId: "quest_daily_write100",
  progress: 100
}
Response: {
  completed: true,
  reward: { xp: 10 },
  newLevel: null
}
```

#### Frontend Component

```jsx
// QuestPanel.jsx
const QuestPanel = () => {
  const [quests, setQuests] = useState({ daily: [], weekly: [], monthly: [] });
  const [activeTab, setActiveTab] = useState('daily');
  
  // Fetch quests on mount
  // Update progress when user actions occur
  // Show completion animations
  
  return (
    <div className="quest-panel">
      <div className="quest-tabs">
        <button onClick={() => setActiveTab('daily')}>Daily</button>
        <button onClick={() => setActiveTab('weekly')}>Weekly</button>
        <button onClick={() => setActiveTab('monthly')}>Monthly</button>
      </div>
      <div className="quest-list">
        {quests[activeTab].map(quest => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </div>
  );
};
```

### 2. Celebration System

#### Backend API (Node.js)

```javascript
// GET /journal/planner/daily-status?uid={userId}&date=2025-11-29
Response: {
  allTasksComplete: true,
  stats: {
    totalTime: "3h 45m",
    tasksCompleted: 5,
    streakDays: 7
  },
  reward: {
    type: "badge",
    name: "Perfect Day",
    icon: "⭐",
    rarity: "rare"
  }
}
```

#### Frontend Component

```jsx
// CelebrationModal.jsx
const CelebrationModal = ({ stats, reward, onClose }) => {
  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);
  
  return (
    <Modal className="celebration-modal">
      <h2>You crushed it today! 🎉</h2>
      <div className="stats">
        <p>All {stats.tasksCompleted} tasks completed!</p>
        <p>Time invested: {stats.totalTime}</p>
        <p>Streak: {stats.streakDays} days</p>
      </div>
      {reward && (
        <div className="reward">
          <img src={reward.icon} alt={reward.name} />
          <p className={`rarity-${reward.rarity}`}>{reward.name}</p>
        </div>
      )}
      <button onClick={onClose}>Continue</button>
    </Modal>
  );
};
```

### 3. Streak Recovery System

#### Backend API (Raindrop + Node.js)

```javascript
// GET /analytics/streaks?uid={userId}
// (Existing Raindrop endpoint - enhanced response)
Response: {
  currentStreak: 0,
  longestStreak: 14,
  lastEntryDate: "2025-11-27",
  isStreakActive: false,
  streakBroken: true,
  missedDays: 1
}

// GET /journal/streak/recovery-message?uid={userId}
Response: {
  title: "Hey, are you okay? 💙",
  body: "We noticed you missed yesterday. Life happens, and that's completely okay.",
  encouragement: "Your 14-day streak was amazing! Ready to start fresh today?",
  previousStreak: 14
}
```

#### Frontend Component

```jsx
// StreakRecoveryModal.jsx
const StreakRecoveryModal = ({ message, onStartJournaling }) => {
  return (
    <Modal className="streak-recovery-modal soft-colors">
      <div className="icon">💙</div>
      <h2>{message.title}</h2>
      <p className="body">{message.body}</p>
      <div className="previous-achievement">
        <span className="streak-badge">{message.previousStreak} days</span>
        <p>{message.encouragement}</p>
      </div>
      <button 
        className="primary-cta"
        onClick={onStartJournaling}
      >
        Start Writing
      </button>
      <button className="secondary" onClick={onClose}>
        Maybe Later
      </button>
    </Modal>
  );
};
```

### 4. XP and Level System

#### Backend API (Node.js)

```javascript
// GET /journal/user/xp?uid={userId}
Response: {
  totalXP: 450,
  currentLevel: 5,
  xpForNextLevel: 500,
  xpProgress: 450,
  levelUpThreshold: 500
}

// POST /journal/user/xp/add
Body: {
  uid: "user123",
  xp: 10,
  source: "quest_completion"
}
Response: {
  newTotalXP: 460,
  leveledUp: false,
  currentLevel: 5
}
```

#### Frontend Component

```jsx
// XPBar.jsx
const XPBar = ({ xp, level, nextLevelXP }) => {
  const progress = (xp / nextLevelXP) * 100;
  
  return (
    <div className="xp-bar-container">
      <div className="level-badge">Lv {level}</div>
      <div className="xp-bar">
        <div 
          className="xp-progress" 
          style={{ width: `${progress}%` }}
        />
        <span className="xp-text">{xp} / {nextLevelXP} XP</span>
      </div>
    </div>
  );
};
```

### 5. Badge System

#### Frontend Component

```jsx
// BadgeGallery.jsx
const BadgeGallery = ({ earnedBadges, allBadges }) => {
  return (
    <div className="badge-gallery">
      <h3>Your Achievements</h3>
      <div className="badge-grid">
        {allBadges.map(badge => {
          const earned = earnedBadges.find(b => b.id === badge.id);
          return (
            <div 
              key={badge.id}
              className={`badge-card ${earned ? 'earned' : 'locked'}`}
            >
              <img 
                src={earned ? badge.url : badge.lockedUrl} 
                alt={badge.name}
              />
              <p className="badge-name">{badge.name}</p>
              {!earned && (
                <p className="unlock-condition">{badge.requirement}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

## Data Models

### Quest Model (Firebase)

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
  completedAt: Timestamp | null
}
```

### User Progress Model (Firebase)

```javascript
{
  userId: "user123",
  totalXP: 450,
  currentLevel: 5,
  earnedBadges: ["badge3", "badge4", "perfect_day_1"],
  questsCompleted: 23,
  lastQuestGeneration: {
    daily: Timestamp,
    weekly: Timestamp,
    monthly: Timestamp
  },
  stats: {
    totalJournalEntries: 45,
    totalTasksCompleted: 120,
    longestStreak: 14,
    perfectDays: 3
  }
}
```

## Error Handling

### Quest System Errors

- **Quest Generation Failure**: Fall back to default quest templates
- **Progress Update Failure**: Queue updates locally, retry on reconnection
- **Expired Quest Access**: Gracefully remove from UI, log for analytics

### Celebration System Errors

- **Animation Library Failure**: Show static celebration without confetti
- **Reward Fetch Failure**: Display celebration without reward details

### Streak Recovery Errors

- **Message Generation Failure**: Use predefined compassionate messages
- **Streak Calculation Error**: Default to showing encouragement without specific numbers

## Testing Strategy

### Unit Tests

- Quest progress calculation logic
- XP and level-up calculations
- Streak detection algorithms
- Reward distribution logic

### Integration Tests

- Quest generation and expiration flow
- Complete task → trigger celebration flow
- Broken streak → recovery message flow
- XP accumulation → level up flow

### UI Tests

- Quest panel displays correct quests
- Celebration modal appears on task completion
- Streak recovery modal shows on app open after missed day
- XP bar updates in real-time

## Performance Considerations

- **Quest Caching**: Cache active quests locally, refresh every 5 minutes
- **Lazy Loading**: Load badge gallery images on demand
- **Debounced Progress Updates**: Batch progress updates to reduce API calls
- **Optimistic UI**: Update UI immediately, sync to backend asynchronously

## Security Considerations

- Validate all XP and progress updates server-side to prevent cheating
- Rate limit quest completion endpoints
- Verify quest ownership before allowing progress updates
- Sanitize user-generated content in celebration messages
