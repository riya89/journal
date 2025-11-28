# AI Assistant Enhancements Design

## Overview

This design enhances the AI Assistant with conversation memory, persistent history, personalized affirmations based on mood/journal analysis, intelligent follow-up suggestions, and smart task recommendations. The system leverages Gemini AI for natural language processing while maintaining the app's gentle, supportive tone.

## Architecture

### System Components

```
┌──────────────────────────────────────────────────────────┐
│                   Frontend (React)                        │
├──────────────────────────────────────────────────────────┤
│  ChatInterface  │  HistoryPanel  │  AffirmationCard      │
│  FollowUpSuggestions  │  TaskSuggestionModal             │
└──────────────┬───────────────────────────────────────────┘
               │
               ├──────────────┬──────────────────┐
               │              │                  │
         ┌─────▼─────┐  ┌────▼────┐      ┌─────▼──────┐
         │  Firebase  │  │ Node.js │      │   Gemini   │
         │  Firestore │  │ Backend │      │     AI     │
         └────────────┘  └─────────┘      └────────────┘
              │               │                   │
      Conversation       AI Prompts          NLP Analysis
      History Storage    Context Mgmt        Response Gen
```

### Data Flow

1. **Message Flow**: User message → Context assembly → Gemini AI → Response → Store in history
2. **Affirmation Generation**: Fetch mood data → Analyze journal themes → Generate personalized affirmation → Cache daily
3. **Task Suggestions**: Journal saved → Content analysis → Theme detection → Generate task suggestions → Present to user
4. **Follow-up Suggestions**: After AI response → Analyze conversation context → Generate 2-3 relevant prompts

## Components and Interfaces

### 1. Conversation Memory System

#### Backend API (Node.js)

```javascript
// POST /assistant/reply-with-context
Body: {
  uid: "user123",
  message: "I'm feeling overwhelmed with work",
  sessionId: "session_abc123",
  includeHistory: true
}
Response: {
  reply: "I hear you... that sounds really heavy. What aspect of work feels most overwhelming right now?",
  sessionId: "session_abc123",
  messageId: "msg_xyz789",
  followUpSuggestions: [
    "Tell me about your workload",
    "What would help you feel less overwhelmed?",
    "Have you been able to take breaks?"
  ]
}

// GET /assistant/context?uid={userId}&sessionId={sessionId}
Response: {
  messages: [
    { role: "user", content: "...", timestamp: "..." },
    { role: "assistant", content: "...", timestamp: "..." }
  ],
  messageCount: 10,
  sessionStarted: "2025-11-29T10:00:00Z"
}
```

#### Context Management Logic

```javascript
// contextManager.js
class ConversationContext {
  constructor(sessionId, maxMessages = 10) {
    this.sessionId = sessionId;
    this.maxMessages = maxMessages;
    this.messages = [];
  }
  
  addMessage(role, content) {
    this.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last N messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }
  
  getContextForAI() {
    return this.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
  
  async persist(userId) {
    await db.collection('users')
      .doc(userId)
      .collection('aiSessions')
      .doc(this.sessionId)
      .set({
        messages: this.messages,
        updatedAt: new Date()
      });
  }
}
```

#### Frontend Component

```jsx
// ChatInterface.jsx (Enhanced)
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  
  useEffect(() => {
    // Generate or retrieve session ID
    const sid = sessionStorage.getItem('aiSessionId') || 
                `session_${Date.now()}`;
    setSessionId(sid);
    sessionStorage.setItem('aiSessionId', sid);
    
    // Load recent context
    loadSessionContext(sid);
  }, []);
  
  const sendMessage = async (content) => {
    const userMsg = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    const response = await fetch('/assistant/reply-with-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        message: content,
        sessionId,
        includeHistory: true
      })
    });
    
    const data = await response.json();
    
    const assistantMsg = { 
      role: 'assistant', 
      content: data.reply, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, assistantMsg]);
    setFollowUps(data.followUpSuggestions || []);
  };
  
  return (
    <div className="chat-interface">
      <MessageList messages={messages} />
      {followUps.length > 0 && (
        <FollowUpSuggestions 
          suggestions={followUps}
          onSelect={sendMessage}
        />
      )}
      <MessageInput onSend={sendMessage} />
    </div>
  );
};
```

### 2. Conversation History

#### Backend API (Node.js)

```javascript
// GET /assistant/history?uid={userId}&limit=20
Response: {
  sessions: [
    {
      sessionId: "session_abc123",
      startedAt: "2025-11-29T10:00:00Z",
      endedAt: "2025-11-29T10:30:00Z",
      messageCount: 12,
      preview: "I'm feeling overwhelmed with work...",
      themes: ["stress", "work"]
    }
  ],
  total: 45
}

// GET /assistant/history/:sessionId?uid={userId}
Response: {
  sessionId: "session_abc123",
  messages: [
    { role: "user", content: "...", timestamp: "..." },
    { role: "assistant", content: "...", timestamp: "..." }
  ],
  themes: ["stress", "work"],
  startedAt: "2025-11-29T10:00:00Z"
}
```

#### Frontend Component

```jsx
// HistoryPanel.jsx
const HistoryPanel = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = async () => {
    const response = await fetch(`/assistant/history?uid=${user.uid}`);
    const data = await response.json();
    setSessions(data.sessions);
  };
  
  const viewSession = async (sessionId) => {
    const response = await fetch(
      `/assistant/history/${sessionId}?uid=${user.uid}`
    );
    const data = await response.json();
    setSelectedSession(data);
  };
  
  return (
    <div className="history-panel">
      <div className="session-list">
        <h3>Past Conversations</h3>
        {sessions.map(session => (
          <div 
            key={session.sessionId}
            className="session-card"
            onClick={() => viewSession(session.sessionId)}
          >
            <p className="preview">{session.preview}</p>
            <div className="meta">
              <span>{formatDate(session.startedAt)}</span>
              <span>{session.messageCount} messages</span>
            </div>
            <div className="themes">
              {session.themes.map(theme => (
                <span key={theme} className="theme-tag">{theme}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {selectedSession && (
        <div className="session-detail">
          <button onClick={() => setSelectedSession(null)}>← Back</button>
          <MessageList messages={selectedSession.messages} />
        </div>
      )}
    </div>
  );
};
```

### 3. Personalized Affirmations

#### Backend API (Node.js - Enhanced)

```javascript
// GET /affirmation/personalized?uid={userId}
Response: {
  affirmation: "You've been navigating stress with such grace this week. Your resilience is beautiful.",
  basedOn: {
    recentMood: "mixed",
    themes: ["stress", "work"],
    moodTrend: "improving"
  },
  cached: false
}
```

#### Affirmation Generation Logic

```javascript
// affirmationEngine.js
async function generatePersonalizedAffirmation(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  // Check cache
  const cached = await db.collection('dailyAffirmations')
    .doc(`${userId}_${today}`)
    .get();
  
  if (cached.exists) {
    return cached.data();
  }
  
  // Fetch mood data (last 7 days)
  const moodData = await fetch(
    `${RAINDROP_URL}/analytics/mood?uid=${userId}`
  ).then(r => r.json());
  
  // Fetch recent journal entries
  const journals = await db.collection('users')
    .doc(userId)
    .collection('journals')
    .orderBy('date', 'desc')
    .limit(3)
    .get();
  
  // Analyze themes
  const themes = analyzeThemes(journals.docs.map(d => d.data()));
  const avgMood = calculateAverage(moodData.moodData.map(m => m.mood));
  const moodTrend = calculateTrend(moodData.moodData);
  
  // Build context for AI
  const context = `
User's recent mood: ${avgMood < 3 ? 'struggling' : avgMood > 4 ? 'positive' : 'mixed'}
Mood trend: ${moodTrend}
Recent themes: ${themes.join(', ')}
Recent journal snippets: ${journals.docs.map(d => d.data().content?.slice(0, 100)).join(' | ')}
  `;
  
  // Generate with Gemini
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a personalized, gentle affirmation based on this context:
${context}

Requirements:
- 1-2 sentences maximum
- Acknowledge their current experience
- Warm, compassionate, validating tone
- Specific to their situation (not generic)
- Focus on strength, growth, or self-compassion

Generate ONE unique affirmation:`
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 100
        }
      })
    }
  );
  
  const data = await response.json();
  const affirmation = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  
  // Cache it
  await db.collection('dailyAffirmations')
    .doc(`${userId}_${today}`)
    .set({
      affirmation,
      basedOn: { recentMood: avgMood < 3 ? 'low' : 'positive', themes, moodTrend },
      createdAt: new Date()
    });
  
  return { affirmation, basedOn: { themes, moodTrend }, cached: false };
}
```

#### Frontend Component

```jsx
// AffirmationCard.jsx
const AffirmationCard = () => {
  const [affirmation, setAffirmation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAffirmation();
  }, []);
  
  const loadAffirmation = async () => {
    const response = await fetch(`/affirmation/personalized?uid=${user.uid}`);
    const data = await response.json();
    setAffirmation(data);
    setLoading(false);
  };
  
  if (loading) return <Skeleton />;
  
  return (
    <div className="affirmation-card">
      <div className="icon">✨</div>
      <p className="affirmation-text">{affirmation.affirmation}</p>
      {affirmation.basedOn && (
        <p className="context-hint">
          Based on your recent {affirmation.basedOn.moodTrend} mood
        </p>
      )}
    </div>
  );
};
```

### 4. Smart Task Suggestions

#### Backend API (Node.js)

```javascript
// POST /journal/analyze-for-tasks
Body: {
  uid: "user123",
  journalText: "I felt stressed about work today. Didn't have time for myself.",
  mood: 2,
  date: "2025-11-29"
}
Response: {
  themes: ["stress", "work", "self-care-deficit"],
  suggestedTasks: [
    {
      name: "10-minute breathing exercise",
      category: "self-care",
      timeEstimate: 10,
      reason: "You mentioned feeling stressed - breathing exercises can help calm your nervous system"
    },
    {
      name: "Evening walk",
      category: "exercise",
      timeEstimate: 30,
      reason: "Physical activity helps process work stress and creates mental space"
    },
    {
      name: "Set work boundaries",
      category: "personal-growth",
      timeEstimate: 15,
      reason: "You noted not having time for yourself - setting boundaries can help reclaim personal time"
    }
  ]
}
```

#### Task Suggestion Logic

```javascript
// taskSuggestionEngine.js
async function analyzeJournalForTasks(userId, journalText, mood) {
  // Use Gemini to analyze themes
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this journal entry and suggest 2-3 actionable tasks:

Journal: "${journalText}"
Mood: ${mood}/5

Return JSON with this structure:
{
  "themes": ["theme1", "theme2"],
  "tasks": [
    {
      "name": "task name",
      "category": "self-care|exercise|personal-growth|social|creative",
      "timeEstimate": 15,
      "reason": "why this task is relevant"
    }
  ]
}

Guidelines:
- Tasks should be specific and achievable
- Time estimates should be realistic (10-60 minutes)
- Reasons should reference the journal content
- Focus on wellbeing and growth`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        },
        response_format: { type: "json_object" }
      })
    }
  );
  
  const data = await response.json();
  const parsed = JSON.parse(
    data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  );
  
  return {
    themes: parsed.themes || [],
    suggestedTasks: parsed.tasks || []
  };
}
```

#### Frontend Component

```jsx
// TaskSuggestionModal.jsx
const TaskSuggestionModal = ({ suggestions, onAddTask, onClose }) => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  const toggleTask = (task) => {
    setSelectedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };
  
  const addToPlanner = async () => {
    for (const task of selectedTasks) {
      await onAddTask(task);
    }
    onClose();
  };
  
  return (
    <Modal className="task-suggestion-modal">
      <h2>Suggested Tasks for Tomorrow</h2>
      <p className="subtitle">Based on your journal entry</p>
      
      <div className="task-list">
        {suggestions.map((task, idx) => (
          <div 
            key={idx}
            className={`task-card ${selectedTasks.includes(task) ? 'selected' : ''}`}
            onClick={() => toggleTask(task)}
          >
            <div className="task-header">
              <h4>{task.name}</h4>
              <span className="time-badge">{task.timeEstimate} min</span>
            </div>
            <p className="reason">{task.reason}</p>
            <span className="category-tag">{task.category}</span>
          </div>
        ))}
      </div>
      
      <div className="actions">
        <button onClick={addToPlanner} disabled={selectedTasks.length === 0}>
          Add {selectedTasks.length} to Tomorrow's Planner
        </button>
        <button className="secondary" onClick={onClose}>
          Skip for Now
        </button>
      </div>
    </Modal>
  );
};
```

### 5. Follow-up Suggestions

#### Frontend Component

```jsx
// FollowUpSuggestions.jsx
const FollowUpSuggestions = ({ suggestions, onSelect }) => {
  return (
    <div className="follow-up-suggestions">
      <p className="prompt-text">You might want to explore:</p>
      <div className="suggestion-chips">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            className="suggestion-chip"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
```

## Data Models

### AI Session Model (Firebase)

```javascript
{
  sessionId: "session_abc123",
  userId: "user123",
  messages: [
    {
      role: "user" | "assistant",
      content: "message text",
      timestamp: Timestamp
    }
  ],
  themes: ["stress", "work"],
  startedAt: Timestamp,
  endedAt: Timestamp | null,
  messageCount: 12
}
```

### Personalized Affirmation Model (Firebase)

```javascript
{
  id: "user123_2025-11-29",
  userId: "user123",
  date: "2025-11-29",
  affirmation: "You've been navigating stress with such grace...",
  basedOn: {
    recentMood: "mixed",
    themes: ["stress", "work"],
    moodTrend: "improving"
  },
  createdAt: Timestamp
}
```

## Error Handling

- **AI API Failures**: Fall back to generic supportive messages
- **Context Loading Errors**: Start fresh session without history
- **Task Suggestion Failures**: Offer manual task creation
- **Affirmation Generation Errors**: Use curated fallback affirmations

## Testing Strategy

### Unit Tests
- Context management (message limiting, persistence)
- Theme analysis logic
- Task suggestion parsing

### Integration Tests
- Full conversation flow with context
- Affirmation generation with mood data
- Task suggestion → planner integration

## Performance Considerations

- Cache affirmations for 24 hours
- Limit context to last 10 messages
- Debounce follow-up suggestion generation
- Lazy load conversation history
