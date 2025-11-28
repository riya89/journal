# 🎨 UI Components for Gamification

## 1. **Streak Recovery Modal**

### Component: `StreakRecoveryModal.jsx`
```jsx
<Modal theme={theme} type="gentle">
  <div className="text-center p-6">
    <div className="text-6xl mb-4">💙</div>
    <h2 className="text-2xl font-bold mb-2">Hey, are you okay?</h2>
    <p className="text-gray-600 mb-4">
      We noticed you missed yesterday. Life happens, and that's completely okay.
    </p>
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <p className="font-semibold">Your 14-day streak was amazing! 🔥</p>
      <p className="text-sm">Every journey has bumps. Ready to start fresh?</p>
    </div>
    <button className="btn-primary">Start Writing Today</button>
    <button className="btn-text mt-2">I need a break</button>
  </div>
</Modal>
```

---

## 2. **Post-Journal Task Check**

### Component: `TaskCompletionCheck.jsx`
```jsx
<Modal theme={theme} type="success">
  <div className="p-6">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-4xl">📝</span>
      <div>
        <h3 className="text-xl font-bold">Great journaling!</h3>
        <p className="text-sm opacity-70">Did you complete your tasks?</p>
      </div>
    </div>
    
    <div className="space-y-2 mb-4">
      {tasks.map(task => (
        <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input 
            type="checkbox" 
            checked={task.completed}
            onChange={() => toggleTask(task.id)}
          />
          <span>{task.name}</span>
          {task.completed && <span className="ml-auto">✓</span>}
        </div>
      ))}
    </div>
    
    <div className="flex gap-2">
      <button className="btn-primary flex-1">Mark All Done</button>
      <button className="btn-secondary">Review Planner</button>
    </div>
  </div>
</Modal>
```

---

## 3. **Daily Completion Celebration**

### Component: `CompletionCelebration.jsx`
```jsx
<Modal theme={theme} type="celebration">
  <Confetti active={true} />
  <div className="text-center p-8">
    <div className="text-7xl mb-4 animate-bounce">🎉</div>
    <h2 className="text-3xl font-bold mb-2">You crushed it today!</h2>
    <p className="text-lg mb-6">All 5 tasks completed!</p>
    
    <div className="grid grid-cols-3 gap-4 mb-6">
      <StatCard icon="⏱️" label="Time" value="3h 45m" />
      <StatCard icon="✓" label="Tasks" value="5/5" />
      <StatCard icon="🔥" label="Streak" value="7 days" />
    </div>
    
    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl">
      <div className="text-4xl mb-2">⭐</div>
      <p className="font-bold">Perfect Day Badge Unlocked!</p>
      <p className="text-sm opacity-70">Rare achievement</p>
    </div>
  </div>
</Modal>
```

---

## 4. **Morning Motivation Card**

### Component: `MorningGreeting.jsx`
```jsx
<div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl shadow-lg">
  <div className="flex items-center gap-3 mb-4">
    <span className="text-4xl">☀️</span>
    <div>
      <h3 className="text-2xl font-bold">Good morning, Riya!</h3>
      <p className="text-sm opacity-70">Ready to make today amazing?</p>
    </div>
  </div>
  
  <div className="bg-white/60 p-4 rounded-xl mb-4">
    <h4 className="font-semibold mb-2">Today's Focus</h4>
    <div className="flex justify-between text-sm">
      <span>📋 4 tasks</span>
      <span>⏱️ 2h 30m</span>
    </div>
    <p className="text-xs mt-2 opacity-70">Top priority: Morning meditation</p>
  </div>
  
  <div className="flex items-center gap-2 text-orange-600">
    <span className="text-2xl">🔥</span>
    <p className="font-semibold">7-day streak! Let's make it 8!</p>
  </div>
</div>
```

---

## 5. **Evening Reflection Prompt**

### Component: `EveningReflection.jsx`
```jsx
<Modal theme={theme} type="calm">
  <div className="p-6">
    <div className="text-center mb-6">
      <span className="text-5xl">🌙</span>
      <h3 className="text-2xl font-bold mt-2">How was your day?</h3>
    </div>
    
    <div className="space-y-4 mb-6">
      <ReflectionQuestion 
        icon="✨" 
        question="What went well today?"
        placeholder="I'm proud that..."
      />
      <ReflectionQuestion 
        icon="💪" 
        question="What challenged you?"
        placeholder="I struggled with..."
      />
      <ReflectionQuestion 
        icon="🙏" 
        question="What are you grateful for?"
        placeholder="I'm thankful for..."
      />
    </div>
    
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <p className="text-sm">
        <strong>Today's Progress:</strong> 3 out of 5 tasks completed
      </p>
      <p className="text-xs opacity-70 mt-1">
        Even small steps forward are worth celebrating.
      </p>
    </div>
    
    <button className="btn-primary w-full">Save Reflection</button>
  </div>
</Modal>
```

---

## 6. **Milestone Celebration**

### Component: `MilestoneCelebration.jsx`
```jsx
<Modal theme={theme} type="epic">
  <Fireworks active={true} />
  <div className="text-center p-8">
    <div className="text-8xl mb-4">📚</div>
    <h2 className="text-3xl font-bold mb-2">50 Journal Entries!</h2>
    <p className="text-lg mb-6">Your story matters.</p>
    
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-2xl mb-6">
      <div className="text-5xl mb-3">🏆</div>
      <p className="text-xl font-bold">Storyteller Badge</p>
      <p className="text-sm opacity-70">Unlocked: Custom journal themes</p>
    </div>
    
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="bg-white/60 p-3 rounded-lg">
        <p className="font-bold text-lg">12,500</p>
        <p className="opacity-70">Total Words</p>
      </div>
      <div className="bg-white/60 p-3 rounded-lg">
        <p className="font-bold text-lg">250</p>
        <p className="opacity-70">Avg/Entry</p>
      </div>
      <div className="bg-white/60 p-3 rounded-lg">
        <p className="font-bold text-lg">850</p>
        <p className="opacity-70">Longest</p>
      </div>
    </div>
  </div>
</Modal>
```

---

## 7. **Gentle Nudge Notification**

### Component: `GentleNudge.jsx`
```jsx
<div className="fixed bottom-6 right-6 bg-white shadow-2xl rounded-2xl p-4 max-w-sm animate-slideIn">
  <div className="flex items-start gap-3">
    <span className="text-3xl">💙</span>
    <div className="flex-1">
      <p className="font-semibold mb-1">Your journal misses you</p>
      <p className="text-sm opacity-70">You usually write around this time</p>
      <div className="flex gap-2 mt-3">
        <button className="btn-sm btn-primary">Write a note</button>
        <button className="btn-sm btn-text">Later</button>
      </div>
    </div>
    <button className="text-gray-400 hover:text-gray-600">✕</button>
  </div>
</div>
```

---

## 8. **Weekly Summary Card**

### Component: `WeeklySummary.jsx`
```jsx
<div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl">
  <h3 className="text-xl font-bold mb-4">Your Week (Nov 23-29)</h3>
  
  <div className="grid grid-cols-2 gap-3 mb-4">
    <StatBox icon="📝" label="Entries" value="6/7" color="blue" />
    <StatBox icon="✓" label="Tasks" value="28" color="green" />
    <StatBox icon="😊" label="Avg Mood" value="3.8/5" color="yellow" />
    <StatBox icon="📖" label="Words" value="1,850" color="purple" />
  </div>
  
  <div className="bg-white/60 p-4 rounded-xl mb-4">
    <h4 className="font-semibold mb-2">✨ Highlights</h4>
    <ul className="space-y-1 text-sm">
      <li>📈 Your mood improved by 25% this week!</li>
      <li>🎯 You completed 90% of your planned tasks</li>
      <li>🔥 You wrote every day except Sunday</li>
    </ul>
  </div>
  
  <div className="bg-green-50 p-3 rounded-lg">
    <p className="text-sm font-semibold">💡 Insight</p>
    <p className="text-xs opacity-70">
      Friday was your best day (mood: 5, all tasks done)
    </p>
  </div>
</div>
```

