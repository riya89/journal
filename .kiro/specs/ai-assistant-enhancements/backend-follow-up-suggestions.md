# Backend Implementation: Follow-Up Suggestions

## Overview
This document describes the backend implementation for generating intelligent follow-up question suggestions based on conversation context and detected themes.

## Modified Endpoint: `/journal/assistant/reply-with-context`

### Enhanced Response
The endpoint now includes `followUpSuggestions` in the response:

```json
{
  "reply": "I hear you... that sounds really heavy. What aspect of work feels most overwhelming right now?",
  "sessionId": "session_1234567890_abc123",
  "messageId": "msg_xyz789",
  "timestamp": "2025-11-30T10:30:00Z",
  "followUpSuggestions": [
    "Tell me more about your workload",
    "What would help you feel less overwhelmed?",
    "Have you been able to take breaks?"
  ]
}
```

## Implementation

### 1. Theme Detection Function

```javascript
/**
 * Detect themes in the conversation
 * @param {string} userMessage - The user's message
 * @param {string} aiResponse - The AI's response
 * @param {Array} conversationHistory - Previous messages
 * @returns {Array} Detected themes
 */
function detectThemes(userMessage, aiResponse, conversationHistory) {
  const themes = [];
  const combinedText = `${userMessage} ${aiResponse}`.toLowerCase();
  
  // Stress/Anxiety themes
  const stressKeywords = ['stress', 'anxious', 'anxiety', 'overwhelm', 'worried', 'panic', 'nervous', 'tense'];
  if (stressKeywords.some(keyword => combinedText.includes(keyword))) {
    themes.push('stress');
  }
  
  // Achievement themes
  const achievementKeywords = ['accomplish', 'achieve', 'success', 'proud', 'finish', 'complete', 'goal', 'win'];
  if (achievementKeywords.some(keyword => combinedText.includes(keyword))) {
    themes.push('achievement');
  }
  
  // Relationship themes
  const relationshipKeywords = ['friend', 'family', 'partner', 'relationship', 'conflict', 'argument', 'love', 'connection'];
  if (relationshipKeywords.some(keyword => combinedText.includes(keyword))) {
    themes.push('relationship');
  }
  
  // Work themes
  const workKeywords = ['work', 'job', 'career', 'boss', 'colleague', 'project', 'deadline', 'meeting'];
  if (workKeywords.some(keyword => combinedText.includes(keyword))) {
    themes.push('work');
  }
  
  // Self-care themes
  const selfCareKeywords = ['tired', 'exhausted', 'rest', 'sleep', 'self-care', 'burnout', 'energy'];
  if (selfCareKeywords.some(keyword => combinedText.includes(keyword))) {
    themes.push('self-care');
  }
  
  // Growth themes
  const growthKeywords = ['learn', 'grow', 'change', 'improve', 'develop', 'progress', 'better'];
  if (growthKeywords.some(keyword => combinedText.includes(keyword))) {
    themes.push('growth');
  }
  
  return themes;
}
```

### 2. Theme-Based Suggestion Templates

```javascript
/**
 * Get follow-up suggestions based on detected themes
 * @param {Array} themes - Detected themes
 * @param {string} userMessage - The user's message
 * @returns {Array} Follow-up suggestions
 */
function getThemeBasedSuggestions(themes, userMessage) {
  const suggestionTemplates = {
    stress: [
      "What's been the most stressful part?",
      "How has this been affecting you?",
      "What usually helps you when you feel this way?",
      "Have you been able to take any breaks?",
      "What would make this feel more manageable?"
    ],
    achievement: [
      "What does this accomplishment mean to you?",
      "How did you make this happen?",
      "What are you most proud of?",
      "What's next for you?",
      "How are you celebrating this?"
    ],
    relationship: [
      "How are you feeling about this relationship?",
      "What do you need from this person?",
      "Have you been able to talk about this?",
      "What would help improve this situation?",
      "How can you take care of yourself through this?"
    ],
    work: [
      "What's the most challenging part of work right now?",
      "How is this affecting your wellbeing?",
      "What boundaries might help?",
      "What support do you need?",
      "What would make work feel better?"
    ],
    'self-care': [
      "What does your body need right now?",
      "When was the last time you rested?",
      "What would feel nourishing?",
      "How can you be gentle with yourself?",
      "What small thing could help you feel better?"
    ],
    growth: [
      "What are you learning about yourself?",
      "What progress have you noticed?",
      "What's different now compared to before?",
      "What's helping you grow?",
      "What do you want to focus on next?"
    ]
  };
  
  const suggestions = [];
  
  // Get suggestions for each detected theme
  for (const theme of themes) {
    if (suggestionTemplates[theme]) {
      const templates = suggestionTemplates[theme];
      // Pick 1-2 random suggestions from this theme
      const randomIndex = Math.floor(Math.random() * templates.length);
      suggestions.push(templates[randomIndex]);
    }
  }
  
  // If no themes detected or not enough suggestions, add generic ones
  const genericSuggestions = [
    "Tell me more about that",
    "How are you feeling about this?",
    "What's on your mind right now?",
    "What would help you feel better?"
  ];
  
  while (suggestions.length < 3) {
    const randomIndex = Math.floor(Math.random() * genericSuggestions.length);
    const suggestion = genericSuggestions[randomIndex];
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }
  
  // Return 2-3 suggestions
  return suggestions.slice(0, 3);
}
```

### 3. AI-Generated Follow-Up Suggestions (Alternative Approach)

For more contextual and intelligent suggestions, use Gemini AI:

```javascript
/**
 * Generate follow-up suggestions using AI
 * @param {string} userMessage - The user's message
 * @param {string} aiResponse - The AI's response
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<Array>} Follow-up suggestions
 */
async function generateAIFollowUpSuggestions(userMessage, aiResponse, conversationHistory) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Build context
    const recentContext = conversationHistory.slice(-4).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');
    
    const prompt = `Based on this conversation, generate 3 thoughtful follow-up questions that would help the user explore their feelings more deeply.

Recent conversation:
${recentContext}
User: ${userMessage}
Assistant: ${aiResponse}

Generate 3 follow-up questions that are:
- Empathetic and supportive
- Specific to what the user shared
- Open-ended to encourage reflection
- Brief (under 10 words each)

Return ONLY the 3 questions, one per line, without numbering or bullets.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse suggestions
    const suggestions = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 100)
      .slice(0, 3);
    
    return suggestions.length >= 2 ? suggestions : null;
  } catch (error) {
    console.error('Error generating AI follow-up suggestions:', error);
    return null;
  }
}
```

### 4. Updated Endpoint Handler

```javascript
app.post('/journal/assistant/reply-with-context', async (req, res) => {
  try {
    // ... (existing authentication and context loading code) ...

    // Generate AI response
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // ===== NEW: Generate follow-up suggestions =====
    let followUpSuggestions = [];
    
    // Try AI-generated suggestions first
    const aiSuggestions = await generateAIFollowUpSuggestions(
      message,
      reply,
      conversationHistory
    );
    
    if (aiSuggestions && aiSuggestions.length >= 2) {
      followUpSuggestions = aiSuggestions;
    } else {
      // Fallback to theme-based suggestions
      const themes = detectThemes(message, reply, conversationHistory);
      followUpSuggestions = getThemeBasedSuggestions(themes, message);
    }
    // ===============================================

    // Store messages in Firebase (async)
    // ... (existing storage code) ...

    // Return response with follow-up suggestions
    res.json({
      reply: reply,
      sessionId: sessionId,
      messageId: messageId,
      timestamp: timestamp,
      followUpSuggestions: followUpSuggestions // NEW
    });

  } catch (error) {
    console.error('Error in reply-with-context:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      reply: "I'm here with you 🌿 I'm listening.",
      followUpSuggestions: [] // Return empty array on error
    });
  }
});
```

## Complete Implementation Example

```javascript
// Add these functions to your backend

function detectThemes(userMessage, aiResponse, conversationHistory) {
  const themes = [];
  const combinedText = `${userMessage} ${aiResponse}`.toLowerCase();
  
  const themeKeywords = {
    stress: ['stress', 'anxious', 'anxiety', 'overwhelm', 'worried', 'panic', 'nervous', 'tense'],
    achievement: ['accomplish', 'achieve', 'success', 'proud', 'finish', 'complete', 'goal', 'win'],
    relationship: ['friend', 'family', 'partner', 'relationship', 'conflict', 'argument', 'love', 'connection'],
    work: ['work', 'job', 'career', 'boss', 'colleague', 'project', 'deadline', 'meeting'],
    'self-care': ['tired', 'exhausted', 'rest', 'sleep', 'self-care', 'burnout', 'energy'],
    growth: ['learn', 'grow', 'change', 'improve', 'develop', 'progress', 'better']
  };
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      themes.push(theme);
    }
  }
  
  return themes;
}

function getThemeBasedSuggestions(themes, userMessage) {
  const suggestionTemplates = {
    stress: [
      "What's been the most stressful part?",
      "How has this been affecting you?",
      "What usually helps you when you feel this way?",
      "Have you been able to take any breaks?",
      "What would make this feel more manageable?"
    ],
    achievement: [
      "What does this accomplishment mean to you?",
      "How did you make this happen?",
      "What are you most proud of?",
      "What's next for you?",
      "How are you celebrating this?"
    ],
    relationship: [
      "How are you feeling about this relationship?",
      "What do you need from this person?",
      "Have you been able to talk about this?",
      "What would help improve this situation?",
      "How can you take care of yourself through this?"
    ],
    work: [
      "What's the most challenging part of work right now?",
      "How is this affecting your wellbeing?",
      "What boundaries might help?",
      "What support do you need?",
      "What would make work feel better?"
    ],
    'self-care': [
      "What does your body need right now?",
      "When was the last time you rested?",
      "What would feel nourishing?",
      "How can you be gentle with yourself?",
      "What small thing could help you feel better?"
    ],
    growth: [
      "What are you learning about yourself?",
      "What progress have you noticed?",
      "What's different now compared to before?",
      "What's helping you grow?",
      "What do you want to focus on next?"
    ]
  };
  
  const suggestions = [];
  
  for (const theme of themes) {
    if (suggestionTemplates[theme]) {
      const templates = suggestionTemplates[theme];
      const randomIndex = Math.floor(Math.random() * templates.length);
      suggestions.push(templates[randomIndex]);
    }
  }
  
  const genericSuggestions = [
    "Tell me more about that",
    "How are you feeling about this?",
    "What's on your mind right now?",
    "What would help you feel better?"
  ];
  
  while (suggestions.length < 3) {
    const randomIndex = Math.floor(Math.random() * genericSuggestions.length);
    const suggestion = genericSuggestions[randomIndex];
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }
  
  return suggestions.slice(0, 3);
}

async function generateAIFollowUpSuggestions(userMessage, aiResponse, conversationHistory) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const recentContext = conversationHistory.slice(-4).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');
    
    const prompt = `Based on this conversation, generate 3 thoughtful follow-up questions that would help the user explore their feelings more deeply.

Recent conversation:
${recentContext}
User: ${userMessage}
Assistant: ${aiResponse}

Generate 3 follow-up questions that are:
- Empathetic and supportive
- Specific to what the user shared
- Open-ended to encourage reflection
- Brief (under 10 words each)

Return ONLY the 3 questions, one per line, without numbering or bullets.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const suggestions = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 100)
      .slice(0, 3);
    
    return suggestions.length >= 2 ? suggestions : null;
  } catch (error) {
    console.error('Error generating AI follow-up suggestions:', error);
    return null;
  }
}
```

## Testing

### Test with curl
```bash
TOKEN="your-firebase-token"

curl -X POST http://localhost:8000/journal/assistant/reply-with-context \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I had a really stressful day at work today",
    "sessionId": "session_test_123",
    "includeHistory": true
  }'
```

Expected response:
```json
{
  "reply": "That sounds really tough. Work stress can be so draining 🌿",
  "sessionId": "session_test_123",
  "messageId": "msg_xyz789",
  "timestamp": "2025-11-30T10:30:00Z",
  "followUpSuggestions": [
    "What's been the most stressful part?",
    "How has this been affecting you?",
    "What would make this feel more manageable?"
  ]
}
```

## Performance Considerations

1. **AI Generation**: Use AI-generated suggestions for better quality, but have theme-based fallback
2. **Caching**: Consider caching common theme-based suggestions
3. **Timeout**: Set timeout for AI suggestion generation (max 2 seconds)
4. **Parallel Processing**: Generate suggestions in parallel with storing messages

## Error Handling

1. **AI Failure**: Fall back to theme-based suggestions
2. **No Themes Detected**: Use generic suggestions
3. **Empty Suggestions**: Return empty array, frontend handles gracefully
