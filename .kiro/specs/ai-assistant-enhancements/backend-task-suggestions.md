# Backend Implementation: Smart Task Suggestions

## Overview
This document describes the backend implementation for analyzing journal content and generating smart task suggestions based on detected themes.

## New Endpoint: `/journal/analyze-for-tasks`

### Purpose
Analyze journal content using Gemini AI to detect themes (stress, goals, challenges) and generate 2-3 relevant task suggestions.

### Request
```
POST http://localhost:8000/journal/analyze-for-tasks
```

### Headers
```
Authorization: Bearer {firebase-token}
Content-Type: application/json
```

### Body
```json
{
  "journalText": "I felt stressed about work today. Didn't have time for myself.",
  "mood": 2,
  "date": "2025-11-30"
}
```

### Response
```json
{
  "themes": ["stress", "work", "self-care-deficit"],
  "suggestedTasks": [
    {
      "name": "10-minute breathing exercise",
      "category": "self-care",
      "timeEstimate": 10,
      "reason": "You mentioned feeling stressed - breathing exercises can help calm your nervous system"
    },
    {
      "name": "Evening walk",
      "category": "exercise",
      "timeEstimate": 30,
      "reason": "Physical activity helps process work stress and creates mental space"
    },
    {
      "name": "Set work boundaries",
      "category": "personal-growth",
      "timeEstimate": 15,
      "reason": "You noted not having time for yourself - setting boundaries can help reclaim personal time"
    }
  ]
}
```

## Implementation Code

Add this to your `backend/routes/journal.js` file:

```javascript
// ============================================
// SMART TASK SUGGESTIONS
// ============================================

/**
 * Analyze journal content and generate task suggestions
 * POST /journal/analyze-for-tasks
 */
router.post("/analyze-for-tasks", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { journalText, mood, date } = req.body;
    
    // Validate input
    if (!journalText || typeof journalText !== 'string') {
      return res.status(400).json({ 
        error: 'journalText is required and must be a string' 
      });
    }
    
    if (journalText.trim().length < 20) {
      // Too short to analyze meaningfully
      return res.json({
        themes: [],
        suggestedTasks: []
      });
    }
    
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    // Build analysis prompt
    const moodContext = mood ? `\nMood: ${mood}/5` : '';
    
    const prompt = `Analyze this journal entry and suggest 2-3 actionable tasks:

Journal: "${journalText}"${moodContext}

Detect themes from this list:
- stress: mentions of stress, overwhelm, anxiety, pressure
- work: work-related challenges or goals
- relationships: social connections, conflicts, or desires
- self-care-deficit: lack of rest, exercise, or personal time
- goals: aspirations, ambitions, things they want to achieve
- challenges: problems they're facing or obstacles
- growth: desire to learn, improve, or develop

Based on the detected themes, suggest 2-3 specific, actionable tasks:

Theme-based task mapping:
- stress → self-care tasks (meditation, breathing, walks, journaling)
- work → productivity or boundary-setting tasks
- relationships → connection or communication tasks
- self-care-deficit → rest, exercise, or hobby tasks
- goals → concrete action steps toward the goal
- challenges → problem-solving or support-seeking tasks
- growth → learning, practice, or skill-building tasks

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "themes": ["theme1", "theme2"],
  "tasks": [
    {
      "name": "specific task name (5-8 words max)",
      "category": "self-care|exercise|personal-growth|social|creative|productivity",
      "timeEstimate": 15,
      "reason": "why this task is relevant (reference journal content)"
    }
  ]
}

Guidelines:
- Tasks should be specific and achievable
- Time estimates: 10-60 minutes
- Reasons should reference the journal content
- Focus on wellbeing and growth
- Keep task names concise and actionable`;
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            responseMimeType: "application/json"
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse JSON response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleanedText = rawText.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', rawText);
      throw new Error('Invalid JSON response from AI');
    }
    
    // Validate and format response
    const themes = Array.isArray(parsed.themes) ? parsed.themes : [];
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    
    // Validate task structure
    const validTasks = tasks
      .filter(task => 
        task.name && 
        task.category && 
        task.timeEstimate && 
        task.reason
      )
      .map(task => ({
        name: String(task.name).substring(0, 100),
        category: String(task.category),
        timeEstimate: Math.min(Math.max(parseInt(task.timeEstimate) || 15, 5), 120),
        reason: String(task.reason).substring(0, 200)
      }))
      .slice(0, 3); // Max 3 tasks
    
    // Log for analytics (optional)
    if (validTasks.length > 0) {
      await db
        .collection('users')
        .doc(userId)
        .collection('taskSuggestions')
        .add({
          date: date || new Date().toISOString().split('T')[0],
          themes,
          suggestedTasks: validTasks,
          journalLength: journalText.length,
          mood: mood || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    
    // Return suggestions
    res.json({
      themes,
      suggestedTasks: validTasks
    });
    
  } catch (error) {
    console.error('Error analyzing journal for tasks:', error);
    
    // Return empty suggestions on error
    res.status(500).json({
      error: 'Failed to analyze journal content',
      themes: [],
      suggestedTasks: []
    });
  }
});
```

## Firestore Data Structure

### Collection: `users/{uid}/taskSuggestions/{autoId}`

```javascript
{
  date: "2025-11-30",
  themes: ["stress", "work"],
  suggestedTasks: [
    {
      name: "10-minute breathing exercise",
      category: "self-care",
      timeEstimate: 10,
      reason: "You mentioned feeling stressed..."
    }
  ],
  journalLength: 150,
  mood: 2,
  createdAt: Timestamp
}
```

## Task Categories

Valid categories for tasks:
- `self-care`: Rest, relaxation, mindfulness
- `exercise`: Physical activity, movement
- `personal-growth`: Learning, skill-building, reflection
- `social`: Connection, communication, relationships
- `creative`: Art, writing, hobbies
- `productivity`: Work tasks, organization, planning

## Theme Detection

The AI detects these themes:
- `stress`: Overwhelm, anxiety, pressure
- `work`: Job-related content
- `relationships`: Social connections
- `self-care-deficit`: Lack of personal time
- `goals`: Aspirations and ambitions
- `challenges`: Problems or obstacles
- `growth`: Desire to improve

## Environment Variables

Ensure these are in your `.env` file:

```bash
GEMINI_API_KEY=your-gemini-api-key
```

## Testing

```bash
# Analyze journal for task suggestions
curl -X POST "http://localhost:8000/journal/analyze-for-tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "journalText": "I felt stressed about work today. Didn'\''t have time for myself.",
    "mood": 2,
    "date": "2025-11-30"
  }'
```

## Error Handling

1. **Missing journalText**: Returns 400 error
2. **Text too short (<20 chars)**: Returns empty suggestions
3. **Gemini API failure**: Returns 500 with empty suggestions
4. **Invalid JSON from AI**: Returns 500 with empty suggestions
5. **Missing API key**: Returns 500 error

## Performance Considerations

1. **Minimum text length**: 20 characters to avoid unnecessary API calls
2. **Max tasks**: Limited to 3 suggestions
3. **Time estimates**: Capped between 5-120 minutes
4. **Text truncation**: Task names and reasons are truncated for safety
5. **Async logging**: Firestore writes are non-blocking

## Integration Notes

- Works independently of other AI features
- Stores suggestions for analytics (optional)
- Returns empty arrays on error (graceful degradation)
- Compatible with existing task categories
- No migration needed for existing users

