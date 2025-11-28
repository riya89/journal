# Task Integration Features Design

## Overview

This design creates seamless integration between journaling and task management through post-journal task completion checks, AI-powered task suggestions, weekly progress summaries, and correlation analysis between tasks and mood. The system connects existing journal and planner features with new intelligent prompts and insights.

## Architecture

### System Components

```
┌──────────────────────────────────────────────────────────┐
│                   Frontend (React)                        │
├──────────────────────────────────────────────────────────┤
│  PostJournalCheck  │  TaskSuggestionModal  │  WeeklySummary│
│  CorrelationChart  │  DailyStatusWidget                   │
└──────────────┬───────────────────────────────────────────┘
               │
               ├──────────────┬──────────────────┐
               │              │                  │
         ┌─────▼─────┐  ┌────▼────┐      ┌─────▼──────┐
         │  Firebase  │  │ Node.js │      │   Gemini   │
         │  Firestore │  │ Backend │      │     AI     │
         └────────────┘  └─────────┘      └────────────┘
              │               │                   │
      Task/Journal       Analysis Logic      Task Suggestions
      Data Storage       Weekly Stats        Theme Detection
```

### Data Flow

1. **Post-Journal Check**: Journal saved → Fetch today's tasks → Display modal → Update completions
2. **Task Suggestions**: Journal saved → AI analyzes content → Generate suggestions → User adds to planner
3. **Weekly Summary**: User requests → Aggregate 7 days data → Calculate stats → Display insights
4. **Correlation Analysis**: Fetch mood + task data → Calculate correlations → Visualize patterns

## Components and Interfaces

### 1. Post-Journal Task Check

#### Backend API (Node.js)

```javascript
// GET /journal/post-save-check?uid={userId}&date=2025-11-29
Response: {
  hasTasks: true,
  todaysTasks: [
    {
      id: "task_123",
      name: "Morning meditation",
      category: "self-care",
      completed: false,
      timeEstimate: 15
    },
    {
      id: "task_456",
      name: "Read 20 pages",
      category: "personal-growth",
      completed: true,
      timeEstimate: 30
    }
  ],
  completionStats: {
    completed: 1,
    total: 2,
    percentage: 50
  }
}

// POST /journal/quick-complete-tasks
Body: {
  uid: "user123",
  date: "2025-11-29",
  taskIds: ["task_123", "task_456"]
}
Response: {
  success: true,
  completedCount: 2,
  allTasksComplete: true
}
```

#### Frontend Component

```jsx
// PostJournalCheckModal.jsx
const PostJournalCheckModal = ({ date, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  useEffect(() => {
    loadTasks();
  }, []);
  
  const loadTasks = async () => {
    const response = await fetch(
      `/journal/post-save-check?uid=${user.uid}&date=${date}`
    );
    const data = await response.json();
    
    if (!data.hasTasks) {
      onClose();
      return;
    }
    
    setTasks(data.todaysTasks);
    // Pre-select already completed tasks
    setSelectedTasks(
      data.todaysTasks.filter(t => t.completed).map(t => t.id)
    );
    setLoading(false);
  };
  
  const toggleTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };
  
  const markAllDone = () => {
    setSelectedTasks(tasks.map(t => t.id));
  };
  
  const saveAndClose = async () => {
    await fetch('/journal/quick-complete-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        date,
        taskIds: selectedTasks
      })
    });
    
    // Check if all tasks completed for celebration
    if (selectedTasks.length === tasks.length) {
      triggerCelebration();
    }
    
    onClose();
  };
  
  if (loading) return <Skeleton />;
  
  return (
    <Modal className="post-journal-check-modal">
      <h2>Great journaling! 📝</h2>
      <p className="subtitle">Did you complete your planned tasks today?</p>
      
      <div className="task-list">
        {tasks.map(task => (
          <div 
            key={task.id}
            className={`task-item ${selectedTasks.includes(task.id) ? 'completed' : ''}`}
            onClick={() => toggleTask(task.id)}
          >
            <div className="checkbox">
              {selectedTasks.includes(task.id) && '✓'}
            </div>
            <div className="task-info">
              <p className="task-name">{task.name}</p>
              <span className="task-meta">
                {task.category} • {task.timeEstimate} min
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="quick-actions">
        <button onClick={markAllDone} className="secondary">
          Mark all done ✓
        </button>
        <button onClick={() => navigate('/planner')} className="secondary">
          Review tasks
        </button>
      </div>
      
      <div className="primary-actions">
        <button onClick={saveAndClose} className="primary">
          Save & Continue
        </button>
        <button onClick={onClose} className="text-button">
          Skip for now
        </button>
      </div>
    </Modal>
  );
};
```

### 2. Weekly Progress Summary

#### Backend API (Node.js)

```javascript
// GET /journal/summary/weekly?uid={userId}&endDate=2025-11-29
Response: {
  week: "Nov 23-29",
  stats: {
    entriesWritten: 6,
    tasksCompleted: 28,
    tasksPlanned: 35,
    completionRate: 80,
    averageMood: 3.8,
    totalWords: 1850,
    streakMaintained: true,
    perfectDays: 2
  },
  highlights: [
    "Your mood improved by 25% this week! 📈",
    "You completed 90% of your planned tasks",
    "You wrote every day except Sunday"
  ],
  insights: {
    bestDay: {
      date: "2025-11-27",
      mood: 5,
      tasksCompleted: 5,
      tasksPlanned: 5
    },
    improvement: "Your evening mood is getting better",
    suggestion: "Try adding a morning routine task"
  },
  moodTrend: "improving",
  tasksByCategory: {
    "self-care": { completed: 8, planned: 10 },
    "exercise": { completed: 5, planned: 7 },
    "personal-growth": { completed: 10, planned: 12 }
  }
}
```

#### Implementation Logic

```javascript
// weeklySummary.js
async function generateWeeklySummary(userId, endDate) {
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);
  
  // Fetch journal entries
  const journals = await db.collection('users')
    .doc(userId)
    .collection('journals')
    .where('date', '>=', formatDate(startDate))
    .where('date', '<=', endDate)
    .get();
  
  // Fetch planner data
  const yearMonth = endDate.substring(0, 7);
  const planner = await db.collection('users')
    .doc(userId)
    .collection('planners')
    .doc(yearMonth)
    .get();
  
  const plannerData = planner.data() || { tasks: [], completions: {} };
  
  // Calculate stats
  const entriesWritten = journals.docs.length;
  const moods = journals.docs.map(d => d.data().mood).filter(m => m);
  const averageMood = moods.reduce((a, b) => a + b, 0) / moods.length;
  const totalWords = journals.docs.reduce((sum, doc) => {
    const content = doc.data().content || '';
    return sum + content.split(/\s+/).length;
  }, 0);
  
  // Task stats for the week
  let tasksCompleted = 0;
  let tasksPlanned = 0;
  let perfectDays = 0;
  const tasksByCategory = {};
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = formatDate(date);
    
    const dayTasks = getDayTasks(plannerData, dateStr);
    const dayCompletions = plannerData.completions[dateStr] || [];
    
    tasksPlanned += dayTasks.length;
    tasksCompleted += dayCompletions.length;
    
    if (dayTasks.length > 0 && dayCompletions.length === dayTasks.length) {
      perfectDays++;
    }
    
    // Category breakdown
    dayTasks.forEach(task => {
      if (!tasksByCategory[task.category]) {
        tasksByCategory[task.category] = { completed: 0, planned: 0 };
      }
      tasksByCategory[task.category].planned++;
      if (dayCompletions.includes(task.id)) {
        tasksByCategory[task.category].completed++;
      }
    });
  }
  
  // Generate highlights
  const highlights = [];
  const moodTrend = calculateMoodTrend(moods);
  
  if (moodTrend === 'improving') {
    const improvement = ((moods[moods.length - 1] - moods[0]) / moods[0] * 100).toFixed(0);
    highlights.push(`Your mood improved by ${improvement}% this week! 📈`);
  }
  
  const completionRate = (tasksCompleted / tasksPlanned * 100).toFixed(0);
  if (completionRate >= 80) {
    highlights.push(`You completed ${completionRate}% of your planned tasks`);
  }
  
  if (entriesWritten === 7) {
    highlights.push("You wrote every day this week! 🔥");
  } else if (entriesWritten >= 5) {
    highlights.push(`You wrote ${entriesWritten} out of 7 days`);
  }
  
  // Find best day
  const bestDay = findBestDay(journals.docs, plannerData);
  
  return {
    week: `${formatDate(startDate, 'MMM DD')}-${formatDate(endDate, 'DD')}`,
    stats: {
      entriesWritten,
      tasksCompleted,
      tasksPlanned,
      completionRate: Math.round(completionRate),
      averageMood: Math.round(averageMood * 10) / 10,
      totalWords,
      streakMaintained: entriesWritten >= 6,
      perfectDays
    },
    highlights,
    insights: {
      bestDay,
      improvement: moodTrend === 'improving' ? "Your mood is trending upward" : null,
      suggestion: generateSuggestion(tasksByCategory, moods)
    },
    moodTrend,
    tasksByCategory
  };
}
```

#### Frontend Component

```jsx
// WeeklySummary.jsx
const WeeklySummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadSummary();
  }, []);
  
  const loadSummary = async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `/journal/summary/weekly?uid=${user.uid}&endDate=${today}`
    );
    const data = await response.json();
    setSummary(data);
    setLoading(false);
  };
  
  if (loading) return <Skeleton />;
  
  return (
    <div className="weekly-summary">
      <h2>Your Week: {summary.week}</h2>
      
      <div className="stats-grid">
        <StatCard 
          icon="📝"
          label="Entries Written"
          value={summary.stats.entriesWritten}
          subtitle="out of 7 days"
        />
        <StatCard 
          icon="✅"
          label="Tasks Completed"
          value={summary.stats.tasksCompleted}
          subtitle={`${summary.stats.completionRate}% completion rate`}
        />
        <StatCard 
          icon="😊"
          label="Average Mood"
          value={summary.stats.averageMood}
          subtitle={`Trend: ${summary.moodTrend}`}
        />
        <StatCard 
          icon="⭐"
          label="Perfect Days"
          value={summary.stats.perfectDays}
          subtitle="All tasks completed"
        />
      </div>
      
      <div className="highlights-section">
        <h3>Highlights</h3>
        {summary.highlights.map((highlight, idx) => (
          <div key={idx} className="highlight-item">
            <span className="bullet">•</span>
            <p>{highlight}</p>
          </div>
        ))}
      </div>
      
      <div className="insights-section">
        <h3>Insights</h3>
        <div className="best-day-card">
          <h4>Your Best Day</h4>
          <p className="date">{formatDate(summary.insights.bestDay.date)}</p>
          <div className="best-day-stats">
            <span>Mood: {summary.insights.bestDay.mood}/5</span>
            <span>Tasks: {summary.insights.bestDay.tasksCompleted}/{summary.insights.bestDay.tasksPlanned}</span>
          </div>
        </div>
        
        {summary.insights.suggestion && (
          <div className="suggestion-card">
            <p className="suggestion-icon">💡</p>
            <p>{summary.insights.suggestion}</p>
          </div>
        )}
      </div>
      
      <div className="category-breakdown">
        <h3>Tasks by Category</h3>
        {Object.entries(summary.tasksByCategory).map(([category, stats]) => (
          <div key={category} className="category-row">
            <span className="category-name">{category}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(stats.completed / stats.planned) * 100}%` }}
              />
            </div>
            <span className="category-stats">
              {stats.completed}/{stats.planned}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. Mood-Task Correlation Analysis

#### Backend API (Node.js)

```javascript
// GET /journal/correlation/mood-tasks?uid={userId}&days=30
Response: {
  correlations: [
    {
      category: "self-care",
      correlation: 0.75,
      impact: "high",
      avgMoodWithTasks: 4.2,
      avgMoodWithoutTasks: 3.1,
      sampleSize: 15
    },
    {
      category: "exercise",
      correlation: 0.68,
      impact: "high",
      avgMoodWithTasks: 4.0,
      avgMoodWithoutTasks: 3.3,
      sampleSize: 12
    }
  ],
  insights: [
    "Self-care tasks have the strongest positive impact on your mood",
    "Days with exercise show 21% higher mood scores",
    "Completing tasks in general correlates with better mood"
  ],
  overallCorrelation: 0.62
}
```

#### Frontend Component

```jsx
// CorrelationChart.jsx
const CorrelationChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadCorrelations();
  }, []);
  
  const loadCorrelations = async () => {
    const response = await fetch(
      `/journal/correlation/mood-tasks?uid=${user.uid}&days=30`
    );
    const result = await response.json();
    setData(result);
    setLoading(false);
  };
  
  if (loading) return <Skeleton />;
  
  return (
    <div className="correlation-chart">
      <h2>What Improves Your Mood?</h2>
      <p className="subtitle">Based on the last 30 days</p>
      
      <div className="correlation-bars">
        {data.correlations
          .sort((a, b) => b.correlation - a.correlation)
          .map(item => (
            <div key={item.category} className="correlation-item">
              <div className="category-label">
                <span className="category-name">{item.category}</span>
                <span className={`impact-badge ${item.impact}`}>
                  {item.impact} impact
                </span>
              </div>
              
              <div className="comparison">
                <div className="mood-bar with-tasks">
                  <span className="label">With tasks</span>
                  <div 
                    className="bar"
                    style={{ width: `${(item.avgMoodWithTasks / 5) * 100}%` }}
                  />
                  <span className="value">{item.avgMoodWithTasks}</span>
                </div>
                
                <div className="mood-bar without-tasks">
                  <span className="label">Without tasks</span>
                  <div 
                    className="bar"
                    style={{ width: `${(item.avgMoodWithoutTasks / 5) * 100}%` }}
                  />
                  <span className="value">{item.avgMoodWithoutTasks}</span>
                </div>
              </div>
              
              <p className="sample-note">Based on {item.sampleSize} days</p>
            </div>
          ))}
      </div>
      
      <div className="insights">
        <h3>Key Insights</h3>
        {data.insights.map((insight, idx) => (
          <div key={idx} className="insight-item">
            <span className="icon">💡</span>
            <p>{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 4. Daily Status Widget

#### Frontend Component

```jsx
// DailyStatusWidget.jsx
const DailyStatusWidget = () => {
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    loadStatus();
    // Refresh every 5 minutes
    const interval = setInterval(loadStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const loadStatus = async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `/journal/planner/daily-status?uid=${user.uid}&date=${today}`
    );
    const data = await response.json();
    setStatus(data);
  };
  
  if (!status) return null;
  
  const progress = status.stats.tasksCompleted / status.stats.tasksPlanned * 100;
  
  return (
    <div className="daily-status-widget">
      <h3>Today's Progress</h3>
      
      <div className="progress-circle">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="8"
            strokeDasharray={`${progress * 2.827} 282.7`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="progress-text">
          <span className="percentage">{Math.round(progress)}%</span>
          <span className="label">Complete</span>
        </div>
      </div>
      
      <div className="status-details">
        <p>{status.stats.tasksCompleted} of {status.stats.tasksPlanned} tasks</p>
        {status.stats.streakDays > 0 && (
          <p className="streak">🔥 {status.stats.streakDays} day streak</p>
        )}
      </div>
      
      {status.allTasksComplete && (
        <div className="celebration-banner">
          <p>🎉 All tasks complete! Amazing work!</p>
        </div>
      )}
      
      {!status.allTasksComplete && status.stats.tasksCompleted > 0 && (
        <p className="encouragement">
          Keep going! You're doing great 💪
        </p>
      )}
    </div>
  );
};
```

## Data Models

### Weekly Summary Cache (Firebase)

```javascript
{
  userId: "user123",
  weekEnding: "2025-11-29",
  summary: {
    // Full summary object
  },
  generatedAt: Timestamp,
  expiresAt: Timestamp
}
```

## Error Handling

- **Task Fetch Failures**: Skip post-journal check, log for retry
- **Summary Generation Errors**: Show partial data with error notice
- **Correlation Calculation Errors**: Fall back to simple stats

## Testing Strategy

### Unit Tests
- Weekly stats calculation
- Correlation coefficient calculation
- Task completion percentage logic

### Integration Tests
- Journal save → post-check modal flow
- Weekly summary generation with real data
- Correlation analysis with varied datasets

## Performance Considerations

- Cache weekly summaries for 24 hours
- Debounce daily status updates
- Lazy load correlation charts
- Optimize task queries with indexes
