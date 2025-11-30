# Task Analysis Backend Endpoint

Add this endpoint to your backend `routes/journal.js` file (after the affirmation endpoint, around line 700).

## Backend Code to Add

```javascript
// -----------------------------------------
// 🎯 TASK ANALYSIS - AI-powered task suggestions
// -----------------------------------------

/**
 * POST /journal/analyze-for-tasks
 * Analyze journal content and suggest relevant tasks
 */
router.post("/analyze-for-tasks", verifyToken, async (req, res) => {
  try {
    const { journalText, mood, date } = req.body;

    // Validate input
    if (!journalText || journalText.trim().length < 20) {
      return res.json({ 
        suggestedTasks: [],
        message: "Journal entry too short for analysis"
      });
    }

    // Build AI prompt for task analysis
    const prompt = `You are a helpful task planning assistant. Analyze this journal entry and suggest 2-3 actionable tasks.

Journal Entry:
"${journalText}"

Mood: ${mood}/5

Based on the journal content, suggest 2-3 specific, actionable tasks that would help the person.

Requirements:
- Tasks should be concrete and achievable
- Match the person's current emotional state (mood: ${mood}/5)
- Address themes or challenges mentioned in the journal
- Each task should take 15-60 minutes

Respond in this EXACT JSON format:
{
  "tasks": [
    {
      "name": "Task name (under 50 characters)",
      "category": "one of: Work, Personal, Health, Social, Creative, Learning",
      "timeEstimate": 30,
      "reason": "Why this task would help (one sentence)"
    }
  ]
}

Generate 2-3 tasks now:`;

    // Call Gemini AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse JSON from AI response
    let suggestedTasks = [];
    
    try {
      // Try to extract JSON from response (AI might wrap it in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestedTasks = parsed.tasks || [];
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr);
      console.log("AI Response:", aiResponse);
      
      // Fallback: return empty array
      return res.json({ 
        suggestedTasks: [],
        message: "Could not parse task suggestions"
      });
    }

    // Category mapping to match frontend
    const categoryMap = {
      'Work': 'work',
      'Personal': 'other',
      'Health': 'health',
      'Social': 'social',
      'Creative': 'creative',
      'Learning': 'learning',
      'Mindfulness': 'mindfulness'
    };

    // Validate and clean up tasks
    const validTasks = suggestedTasks
      .filter(task => task.name && task.category)
      .map(task => {
        // Normalize category to lowercase frontend format
        const normalizedCategory = categoryMap[task.category] || task.category.toLowerCase();
        
        return {
          name: task.name.substring(0, 100),
          category: normalizedCategory,
          timeEstimate: task.timeEstimate || 30,
          reason: task.reason || "Suggested based on your journal entry"
        };
      })
      .slice(0, 3); // Max 3 tasks

    console.log(`✅ Generated ${validTasks.length} task suggestions for journal entry`);

    res.json({
      suggestedTasks: validTasks,
      analyzedThemes: [], // Could add theme detection later
      message: validTasks.length > 0 ? "Tasks suggested successfully" : "No tasks suggested"
    });

  } catch (err) {
    console.error("Task analysis error:", err);
    
    // Return empty suggestions on error (don't break the flow)
    res.json({
      suggestedTasks: [],
      message: "Task analysis unavailable"
    });
  }
});
```

## Where to Add It

In your `backend/routes/journal.js` file:

1. Find the affirmation endpoint (around line 700)
2. Add this new endpoint right after it
3. Make sure it's before the `export default router;` line at the end

## Example Placement

```javascript
// ... existing affirmation endpoint ...

router.get("/affirmation/daily", verifyToken, async (req, res) => {
  // ... existing code ...
});

// 👇 ADD THE NEW ENDPOINT HERE
router.post("/analyze-for-tasks", verifyToken, async (req, res) => {
  // ... code from above ...
});

// ... rest of your endpoints ...

export default router;
```

## Testing

After adding the endpoint, test it:

```bash
curl -X POST http://localhost:8000/journal/analyze-for-tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "journalText": "Today was stressful at work. I have so many projects piling up and I feel overwhelmed. I need to get organized and take better care of myself.",
    "mood": 2,
    "date": "2025-12-01"
  }'
```

Expected response:
```json
{
  "suggestedTasks": [
    {
      "name": "Create a priority list for work projects",
      "category": "Work",
      "timeEstimate": 20,
      "reason": "Breaking down tasks will help reduce overwhelm"
    },
    {
      "name": "Take a 15-minute walk outside",
      "category": "Health",
      "timeEstimate": 15,
      "reason": "Physical activity helps manage stress"
    },
    {
      "name": "Schedule 30 minutes for self-care",
      "category": "Personal",
      "timeEstimate": 30,
      "reason": "Prioritizing yourself will improve your wellbeing"
    }
  ],
  "analyzedThemes": [],
  "message": "Tasks suggested successfully"
}
```

## How It Works

1. **User saves journal entry** with meaningful content (100+ words recommended)
2. **Frontend calls** `/journal/analyze-for-tasks` with journal text, mood, and date
3. **Backend uses Gemini AI** to analyze the content and detect themes
4. **AI suggests 2-3 tasks** that are relevant and actionable
5. **Frontend shows modal** with suggested tasks
6. **User can add tasks** to tomorrow's planner with one click

## Features

- ✅ AI-powered task suggestions based on journal content
- ✅ Considers user's mood when suggesting tasks
- ✅ Suggests appropriate task categories
- ✅ Estimates time needed for each task
- ✅ Provides reasoning for each suggestion
- ✅ Non-blocking (won't interrupt journal save if it fails)
- ✅ Graceful error handling

## Notes

- Requires `GEMINI_API_KEY` in your environment variables
- Only analyzes entries with 20+ characters
- Returns empty array on errors (won't break the app)
- Suggestions are shown in a modal after journal save
- User can choose which tasks to add to their planner

---

That's it! Add this endpoint to your backend and the task suggestion feature will work. 🎉
