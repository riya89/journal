# Mood Tracking Enhancements Design

## Overview

This design adds extended mood history views, a visual mood constellation feature, time capsules for future self-reflection, and a gratitude jar. The system builds on existing Raindrop analytics while adding new Firebase collections for time capsules and gratitude entries.

## Architecture

### System Components

```
┌──────────────────────────────────────────────────────────┐
│                   Frontend (React)                        │
├──────────────────────────────────────────────────────────┤
│  MoodDashboard  │  ConstellationView  │  TimeCapsuleUI   │
│  GratitudeJar   │  ExtendedHistoryChart                  │
└──────────────┬───────────────────────────────────────────┘
               │
               ├──────────────┬──────────────────┐
               │              │                  │
         ┌─────▼─────┐  ┌────▼────┐      ┌─────▼──────┐
         │  Firebase  │  │ Node.js │      │  Raindrop  │
         │  Firestore │  │ Backend │      │  Analytics │
         └────────────┘  └─────────┘      └────────────┘
              │               │                   │
      Time Capsules      API Layer          Mood History
      Gratitude Entries  Notifications      Extended Stats
```

### Data Flow

1. **Extended History**: Raindrop provides mood data → Frontend visualizes with charts
2. **Constellation**: Fetch mood entries → Render as stars → Connect consecutive days
3. **Time Capsule**: Create → Store locked → Schedule notification → Unlock on date
4. **Gratitude Jar**: Add entry → Store in Firebase → Retrieve random for display

## Components and Interfaces

### 1. Extended Mood History

#### Backend API (Raindrop - Enhanced)

```javascript
// GET /analytics/mood/extended?uid={userId}&days=30
Response: {
  uid: "user123",
  period: "30 days",
  moodData: [
    { date: "2025-11-01", mood: 3 },
    { date: "2025-11-02", mood: 4 },
    // ... 30 days of data
  ],
  stats: {
    averageMood: 3.7,
    moodVariance: 0.8,
    trend: "improving", // "improving" | "declining" | "stable"
    bestDay: { date: "2025-11-15", mood: 5 },
    worstDay: { date: "2025-11-03", mood: 2 },
    daysTracked: 28,
    missedDays: 2
  }
}
```

#### Raindrop Implementation

```typescript
// Add to existing Raindrop service
async getMoodExtended(uid: string, days: number): Promise<Response> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    const rows = await this.env.JOURNALDB.prepare(`
      SELECT entry_date, mood
      FROM journal_entries
      WHERE uid = ?
      AND mood IS NOT NULL
      AND entry_date >= ?
      ORDER BY entry_date ASC
    `).bind(uid, cutoffStr).all<{ entry_date: string; mood: number }>();
    
    const moodData = rows.results.map(r => ({ 
      date: r.entry_date, 
      mood: r.mood 
    }));
    
    // Calculate stats
    const moods = moodData.map(m => m.mood);
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    const variance = calculateVariance(moods);
    const trend = calculateTrend(moodData);
    
    const bestDay = moodData.reduce((best, curr) => 
      curr.mood > best.mood ? curr : best
    );
    const worstDay = moodData.reduce((worst, curr) => 
      curr.mood < worst.mood ? curr : worst
    );
    
    return this.json({
      uid,
      period: `${days} days`,
      moodData,
      stats: {
        averageMood: Math.round(avgMood * 10) / 10,
        moodVariance: Math.round(variance * 10) / 10,
        trend,
        bestDay,
        worstDay,
        daysTracked: moodData.length,
        missedDays: days - moodData.length
      }
    });
  } catch (e: unknown) {
    return this.json({ error: "extended mood fetch failed" }, 500);
  }
}
```

#### Frontend Component

```jsx
// ExtendedMoodDashboard.jsx
const ExtendedMoodDashboard = () => {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadMoodData(period);
  }, [period]);
  
  const loadMoodData = async (days) => {
    setLoading(true);
    const response = await fetch(
      `${RAINDROP_URL}/analytics/mood/extended?uid=${user.uid}&days=${days}`
    );
    const result = await response.json();
    setData(result);
    setLoading(false);
  };
  
  return (
    <div className="extended-mood-dashboard">
      <div className="period-selector">
        <button onClick={() => setPeriod(7)} className={period === 7 ? 'active' : ''}>
          7 Days
        </button>
        <button onClick={() => setPeriod(30)} className={period === 30 ? 'active' : ''}>
          30 Days
        </button>
        <button onClick={() => setPeriod(90)} className={period === 90 ? 'active' : ''}>
          90 Days
        </button>
        <button onClick={() => setPeriod(365)} className={period === 365 ? 'active' : ''}>
          1 Year
        </button>
      </div>
      
      {loading ? <Skeleton /> : (
        <>
          <MoodChart data={data.moodData} />
          
          <div className="stats-grid">
            <StatCard 
              label="Average Mood" 
              value={data.stats.averageMood}
              icon="📊"
            />
            <StatCard 
              label="Trend" 
              value={data.stats.trend}
              icon={data.stats.trend === 'improving' ? '📈' : '📉'}
            />
            <StatCard 
              label="Days Tracked" 
              value={`${data.stats.daysTracked}/${period}`}
              icon="✅"
            />
          </div>
          
          <div className="insights">
            <h3>Insights</h3>
            <p>Your best day was {formatDate(data.stats.bestDay.date)} with a mood of {data.stats.bestDay.mood}/5</p>
            {data.stats.trend === 'improving' && (
              <p className="positive">Your mood has been improving over this period! 🌟</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
```

### 2. Mood Constellation

#### Frontend Component

```jsx
// MoodConstellation.jsx
const MoodConstellation = () => {
  const [entries, setEntries] = useState([]);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    loadEntries();
  }, []);
  
  useEffect(() => {
    if (entries.length > 0) {
      renderConstellation();
    }
  }, [entries]);
  
  const loadEntries = async () => {
    const response = await fetch(
      `${RAINDROP_URL}/analytics/mood/extended?uid=${user.uid}&days=90`
    );
    const data = await response.json();
    setEntries(data.moodData);
  };
  
  const renderConstellation = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Night sky background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add stars (background)
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Plot mood entries as stars
    const positions = [];
    entries.forEach((entry, idx) => {
      const x = (idx / entries.length) * canvas.width;
      const y = canvas.height - (entry.mood / 5) * (canvas.height * 0.8) - 50;
      
      positions.push({ x, y, mood: entry.mood, date: entry.date });
      
      // Star color based on mood
      const color = getMoodColor(entry.mood);
      
      // Draw star
      drawStar(ctx, x, y, entry.mood === 5 ? 8 : 5, color);
      
      // Shooting star animation for perfect days
      if (entry.mood === 5) {
        animateShootingStar(ctx, x, y);
      }
    });
    
    // Connect consecutive days
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      
      // Check if consecutive days
      const prevDate = new Date(prev.date);
      const currDate = new Date(curr.date);
      const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }
    }
  };
  
  const getMoodColor = (mood) => {
    const colors = {
      1: '#6366f1', // indigo (low)
      2: '#8b5cf6', // purple
      3: '#ec4899', // pink
      4: '#f59e0b', // amber
      5: '#fbbf24'  // yellow (high)
    };
    return colors[mood] || '#ffffff';
  };
  
  const drawStar = (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  
  return (
    <div className="mood-constellation">
      <h2>Your Mood Constellation</h2>
      <p className="subtitle">Each star represents a day in your journey</p>
      <canvas ref={canvasRef} className="constellation-canvas" />
      <div className="legend">
        <div className="legend-item">
          <span className="color-dot" style={{ background: '#6366f1' }} />
          <span>Low Mood</span>
        </div>
        <div className="legend-item">
          <span className="color-dot" style={{ background: '#fbbf24' }} />
          <span>High Mood</span>
        </div>
        <div className="legend-item">
          <span>⭐</span>
          <span>Perfect Day</span>
        </div>
      </div>
    </div>
  );
};
```

### 3. Time Capsule

#### Backend API (Node.js)

```javascript
// POST /journal/timecapsule/create
Body: {
  uid: "user123",
  message: "Dear future me, I hope you're doing well...",
  unlockDate: "2026-11-29",
  currentMood: 3,
  currentGoals: ["exercise more", "reduce stress"]
}
Response: {
  capsuleId: "capsule_abc123",
  unlockDate: "2026-11-29",
  daysUntilUnlock: 365
}

// GET /journal/timecapsule/list?uid={userId}
Response: {
  locked: [
    {
      capsuleId: "capsule_abc123",
      createdAt: "2025-11-29",
      unlockDate: "2026-11-29",
      daysUntilUnlock: 365
    }
  ],
  unlocked: [
    {
      capsuleId: "capsule_xyz789",
      createdAt: "2024-11-29",
      unlockDate: "2025-11-29",
      message: "Dear future me...",
      currentMood: 3,
      currentGoals: ["exercise more"],
      comparison: {
        moodThen: 3,
        moodNow: 4,
        goalsAchieved: ["exercise more"]
      }
    }
  ]
}

// GET /journal/timecapsule/:capsuleId?uid={userId}
Response: {
  capsuleId: "capsule_xyz789",
  message: "Dear future me...",
  createdAt: "2024-11-29",
  unlockDate: "2025-11-29",
  currentMood: 3,
  currentGoals: ["exercise more"],
  isUnlocked: true
}
```

#### Firebase Data Model

```javascript
// Collection: users/{userId}/timeCapsules/{capsuleId}
{
  capsuleId: "capsule_abc123",
  userId: "user123",
  message: "Dear future me...",
  createdAt: Timestamp,
  unlockDate: Timestamp,
  currentMood: 3,
  currentGoals: ["exercise more", "reduce stress"],
  isUnlocked: false,
  unlockedAt: null,
  notificationSent: false
}
```

#### Frontend Component

```jsx
// TimeCapsuleUI.jsx
const TimeCapsuleUI = () => {
  const [capsules, setCapsules] = useState({ locked: [], unlocked: [] });
  const [showCreate, setShowCreate] = useState(false);
  
  useEffect(() => {
    loadCapsules();
  }, []);
  
  const loadCapsules = async () => {
    const response = await fetch(`/journal/timecapsule/list?uid=${user.uid}`);
    const data = await response.json();
    setCapsules(data);
  };
  
  const createCapsule = async (capsuleData) => {
    await fetch('/journal/timecapsule/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        ...capsuleData
      })
    });
    loadCapsules();
    setShowCreate(false);
  };
  
  return (
    <div className="time-capsule-ui">
      <h2>Time Capsules</h2>
      <p className="subtitle">Write to your future self</p>
      
      <button onClick={() => setShowCreate(true)} className="create-btn">
        + Create Time Capsule
      </button>
      
      <div className="capsule-sections">
        <div className="locked-capsules">
          <h3>Locked 🔒</h3>
          {capsules.locked.map(capsule => (
            <LockedCapsuleCard key={capsule.capsuleId} capsule={capsule} />
          ))}
        </div>
        
        <div className="unlocked-capsules">
          <h3>Unlocked ✨</h3>
          {capsules.unlocked.map(capsule => (
            <UnlockedCapsuleCard key={capsule.capsuleId} capsule={capsule} />
          ))}
        </div>
      </div>
      
      {showCreate && (
        <CreateCapsuleModal 
          onSubmit={createCapsule}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
};

// CreateCapsuleModal.jsx
const CreateCapsuleModal = ({ onSubmit, onClose }) => {
  const [message, setMessage] = useState('');
  const [unlockPeriod, setUnlockPeriod] = useState(30);
  const [goals, setGoals] = useState(['']);
  const [currentMood, setCurrentMood] = useState(3);
  
  const handleSubmit = () => {
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + unlockPeriod);
    
    onSubmit({
      message,
      unlockDate: unlockDate.toISOString().split('T')[0],
      currentMood,
      currentGoals: goals.filter(g => g.trim())
    });
  };
  
  return (
    <Modal className="create-capsule-modal">
      <h2>Create Time Capsule</h2>
      
      <label>Message to Future Self</label>
      <textarea 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Dear future me..."
        rows={8}
      />
      
      <label>Unlock After</label>
      <select value={unlockPeriod} onChange={(e) => setUnlockPeriod(Number(e.target.value))}>
        <option value={30}>30 days</option>
        <option value={90}>90 days</option>
        <option value={365}>1 year</option>
      </select>
      
      <label>Current Mood</label>
      <MoodSelector value={currentMood} onChange={setCurrentMood} />
      
      <label>Current Goals</label>
      {goals.map((goal, idx) => (
        <input
          key={idx}
          value={goal}
          onChange={(e) => {
            const newGoals = [...goals];
            newGoals[idx] = e.target.value;
            setGoals(newGoals);
          }}
          placeholder="Enter a goal..."
        />
      ))}
      <button onClick={() => setGoals([...goals, ''])}>+ Add Goal</button>
      
      <div className="actions">
        <button onClick={handleSubmit}>Lock Capsule 🔒</button>
        <button className="secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};
```

### 4. Gratitude Jar

#### Backend API (Node.js)

```javascript
// POST /journal/gratitude/add
Body: {
  uid: "user123",
  gratitudeText: "I'm grateful for my morning coffee and quiet time",
  mood: 4
}
Response: {
  gratitudeId: "grat_abc123",
  success: true
}

// GET /journal/gratitude/random?uid={userId}
Response: {
  gratitudeId: "grat_abc123",
  gratitudeText: "I'm grateful for my morning coffee",
  date: "2025-10-15",
  mood: 4
}

// GET /journal/gratitude/all?uid={userId}
Response: {
  gratitudes: [
    {
      gratitudeId: "grat_abc123",
      gratitudeText: "...",
      date: "2025-10-15",
      mood: 4
    }
  ],
  total: 45
}
```

#### Frontend Component

```jsx
// GratitudeJar.jsx
const GratitudeJar = () => {
  const [gratitudes, setGratitudes] = useState([]);
  const [randomGratitude, setRandomGratitude] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  
  useEffect(() => {
    loadGratitudes();
  }, []);
  
  const loadGratitudes = async () => {
    const response = await fetch(`/journal/gratitude/all?uid=${user.uid}`);
    const data = await response.json();
    setGratitudes(data.gratitudes);
  };
  
  const getRandomGratitude = async () => {
    const response = await fetch(`/journal/gratitude/random?uid=${user.uid}`);
    const data = await response.json();
    setRandomGratitude(data);
  };
  
  const addGratitude = async (text, mood) => {
    await fetch('/journal/gratitude/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        gratitudeText: text,
        mood
      })
    });
    loadGratitudes();
    setShowAdd(false);
  };
  
  const fillPercentage = Math.min((gratitudes.length / 100) * 100, 100);
  
  return (
    <div className="gratitude-jar">
      <h2>Gratitude Jar</h2>
      
      <div className="jar-visual">
        <svg viewBox="0 0 200 300" className="jar-svg">
          {/* Jar outline */}
          <path d="M 50 50 L 50 250 Q 50 280 100 280 Q 150 280 150 250 L 150 50 Z" 
                fill="rgba(255, 255, 255, 0.1)" 
                stroke="#fff" 
                strokeWidth="2" />
          
          {/* Fill level */}
          <path d={`M 50 ${250 - (fillPercentage * 2)} L 50 250 Q 50 280 100 280 Q 150 280 150 250 L 150 ${250 - (fillPercentage * 2)} Z`}
                fill="rgba(251, 191, 36, 0.3)" />
          
          {/* Gratitude notes */}
          {gratitudes.slice(0, 10).map((g, idx) => (
            <circle 
              key={g.gratitudeId}
              cx={70 + (idx % 3) * 30}
              cy={260 - (idx * 20)}
              r="8"
              fill="#fbbf24"
              opacity="0.8"
            />
          ))}
        </svg>
        
        <p className="jar-count">{gratitudes.length} gratitudes</p>
      </div>
      
      <div className="actions">
        <button onClick={getRandomGratitude} className="primary">
          Read Random Gratitude
        </button>
        <button onClick={() => setShowAdd(true)} className="secondary">
          + Add Gratitude
        </button>
      </div>
      
      {randomGratitude && (
        <div className="random-gratitude-card">
          <p className="gratitude-text">"{randomGratitude.gratitudeText}"</p>
          <p className="meta">
            {formatDate(randomGratitude.date)} • Mood: {randomGratitude.mood}/5
          </p>
        </div>
      )}
      
      {showAdd && (
        <AddGratitudeModal 
          onSubmit={addGratitude}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
};
```

## Data Models

### Time Capsule Model

```javascript
{
  capsuleId: "capsule_abc123",
  userId: "user123",
  message: "Dear future me...",
  createdAt: Timestamp,
  unlockDate: Timestamp,
  currentMood: 3,
  currentGoals: ["exercise more", "reduce stress"],
  isUnlocked: false,
  unlockedAt: Timestamp | null,
  notificationSent: false
}
```

### Gratitude Entry Model

```javascript
{
  gratitudeId: "grat_abc123",
  userId: "user123",
  gratitudeText: "I'm grateful for...",
  date: "2025-11-29",
  mood: 4,
  createdAt: Timestamp
}
```

## Error Handling

- **Constellation Rendering Errors**: Fall back to simple list view
- **Time Capsule Unlock Failures**: Retry notification, manual unlock option
- **Gratitude Fetch Errors**: Show cached gratitudes if available

## Testing Strategy

### Unit Tests
- Mood trend calculation
- Constellation star positioning
- Time capsule unlock date validation

### Integration Tests
- Extended history data retrieval
- Time capsule creation → unlock flow
- Gratitude jar add → retrieve flow

## Performance Considerations

- Canvas rendering optimization for large datasets
- Lazy load unlocked time capsules
- Cache gratitude jar visual
- Paginate extended history for 365-day view
