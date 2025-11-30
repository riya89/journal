# Backend Implementation: Personalized Affirmations

## Overview
This document describes the backend implementation for personalized affirmations based on user mood and journal data.

## New Endpoint: `/journal/affirmation/personalized`

### Purpose
Generate personalized affirmations based on user's recent mood data and journal entries.

### Request
```
GET http://localhost:8000/journal/affirmation/personalized
```

### Headers
```
Authorization: Bearer {firebase-token}
```

### Query Parameters
```
forceRefresh: boolean (optional) - Force regeneration even if cached
```

### Response
```json
{
  "affirmation": "You've been navigating stress with such grace this week. Your resilience is beautiful.",
  "basedOn": {
    "recentMood": "mixed",
    "themes": ["stress", "work"],
    "moodTrend": "improving"
  },
  "cached": false,
  "generatedAt": "2025-11-30T10:30:00Z"
}
```

## Implementation Code

Add this to your `backend/routes/journal.js` file:

```javascript
// ============================================
// PERSONALIZED AFFIRMATIONS
// ============================================

/**
 * Helper: Analyze themes from journal entries
 */
function analyzeJournalThemes(journals) {
  const themes = [];
  const allText = journals.map(j => j.content || '').join(' ').toLowerCase();
  
  // Theme detection keywords
  const themeKeywords = {
    stress: ['stress', 'stressed', 'overwhelm', 'anxious', 'anxiety', 'worried', 'pressure'],
    work: ['work', 'job', 'career', 'project', 'deadline', 'meeting', 'boss'],
    relationships: ['friend', 'family', 'partner', 'relationship', 'love', 'conflict'],
    growth: ['learn', 'grow', 'improve', 'progress', 'achieve', 'goal', 'success'],
    selfCare: ['rest', 'sleep', 'exercise', 'meditate', 'relax', 'care', 'health']
  };
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      themes.push(theme);
    }
  }
  
  return themes.length > 0 ? themes : ['general'];
}

/**
 * Helper: Calculate mood trend
 */
function calculateMoodTrend(moodData) {
  if (!moodData || moodData.length < 2) return 'stable';
  
  const recent = moodData.slice(-3);
  const avgRecent = recent.reduce((sum, m) => sum + m.mood, 0) / recent.length;
  
  const older = moodData.slice(0, -3);
  if (older.length === 0) return 'stable';
  
  const avgOlder = older.reduce((sum, m) => sum + m.mood, 0) / older.length;
  
  const diff = avgRecent - avgOlder;
  
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

/**
 * Helper: Check if affirmation is too similar to recent ones
 */
async function isSimilarToRecent(userId, newAffirmation) {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentAffirmations = await db
    .collection('users')
    .doc(userId)
    .collection('affirmations')
    .where('createdAt', '>=', twoWeeksAgo)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();
  
  if (recentAffirmations.empty) return false;
  
  // Simple similarity check - check if first 20 characters match
  const newStart = newAffirmation.substring(0, 20).toLowerCase();
  
  for (const doc of recentAffirmations.docs) {
    const oldAffirmation = doc.data().affirmation || '';
    const oldStart = oldAffirmation.substring(0, 20).toLowerCase();
    
    if (newStart === oldStart) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate personalized affirmation
 * GET /journal/affirmation/personalized
 */
router.get("/affirmation/personalized", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const forceRefresh = req.query.forceRefresh === 'true';
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check cache (unless force refresh)
    if (!forceRefresh) {
      const cachedRef = db
        .collection('users')
        .doc(userId)
        .collection('affirmations')
        .doc(today);
      
      const cachedDoc = await cachedRef.get();
      
      if (cachedDoc.exists) {
        const cached = cachedDoc.data();
        return res.json({
          affirmation: cached.affirmation,
          basedOn: cached.basedOn,
          cached: true,
          generatedAt: cached.createdAt.toDate().toISOString()
        });
      }
    }
    
    // Fetch mood data from Raindrop (last 7 days)
    let moodData = [];
    let avgMood = 3; // neutral default
    let moodTrend = 'stable';
    
    try {
      const raindropUrl = process.env.RAINDROP_URL || 'http://localhost:8787';
      const moodRes = await fetch(`${raindropUrl}/analytics/mood?uid=${userId}`);
      
      if (moodRes.ok) {
        const moodJson = await moodRes.json();
        moodData = moodJson.moodData || [];
        
        if (moodData.length > 0) {
          avgMood = moodData.reduce((sum, m) => sum + m.mood, 0) / moodData.length;
          moodTrend = calculateMoodTrend(moodData);
        }
      }
    } catch (moodError) {
      console.warn('Could not fetch mood data:', moodError);
    }
    
    // Fetch recent journal entries (last 3)
    const journalsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('journals')
      .orderBy('date', 'desc')
      .limit(3)
      .get();
    
    const journals = journalsSnapshot.docs.map(doc => doc.data());
    const themes = analyzeJournalThemes(journals);
    
    // Determine mood category
    let moodCategory = 'mixed';
    if (avgMood < 2.5) moodCategory = 'low';
    else if (avgMood > 3.5) moodCategory = 'positive';
    
    // Build context for AI
    const journalSnippets = journals
      .map(j => (j.content || '').substring(0, 100))
      .filter(s => s.length > 0)
      .join(' | ');
    
    const context = `
User's recent mood: ${moodCategory} (average: ${avgMood.toFixed(1)}/5)
Mood trend: ${moodTrend}
Recent themes: ${themes.join(', ')}
Recent journal snippets: ${journalSnippets || 'No recent entries'}
    `.trim();
    
    // Generate affirmation with Gemini
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    // Build mood-specific prompt
    let toneGuidance = '';
    if (moodCategory === 'low') {
      toneGuidance = 'Be extra supportive, grounding, and compassionate. Acknowledge their struggle while offering gentle encouragement.';
    } else if (moodCategory === 'positive') {
      toneGuidance = 'Be celebratory and encouraging. Acknowledge their positive momentum and inspire continued growth.';
    } else {
      toneGuidance = 'Be balanced and validating. Acknowledge both challenges and strengths with gentle support.';
    }
    
    const prompt = `Generate a personalized, gentle affirmation based on this context:

${context}

Tone guidance: ${toneGuidance}

Requirements:
- 1-2 sentences maximum
- Acknowledge their current experience
- Warm, compassionate, validating tone
- Specific to their situation (not generic)
- Focus on strength, growth, or self-compassion
- Use "you" language (second person)
- Avoid clichés

Generate ONE unique affirmation:`;
    
    let affirmation = '';
    let attempts = 0;
    const maxAttempts = 3;
    
    // Try to generate unique affirmation (check against recent ones)
    while (attempts < maxAttempts) {
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
              temperature: 0.9,
              maxOutputTokens: 100
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      affirmation = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      // Remove quotes if present
      affirmation = affirmation.replace(/^["']|["']$/g, '');
      
      // Check if similar to recent affirmations
      const isSimilar = await isSimilarToRecent(userId, affirmation);
      
      if (!isSimilar || attempts === maxAttempts - 1) {
        break;
      }
      
      attempts++;
      console.log(`Affirmation too similar, regenerating (attempt ${attempts + 1}/${maxAttempts})`);
    }
    
    if (!affirmation) {
      // Fallback affirmation
      affirmation = "You're doing your best, and that's more than enough. Be gentle with yourself today. 🌿";
    }
    
    // Store affirmation
    const affirmationData = {
      affirmation,
      basedOn: {
        recentMood: moodCategory,
        themes,
        moodTrend,
        avgMood: parseFloat(avgMood.toFixed(1))
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId
    };
    
    await db
      .collection('users')
      .doc(userId)
      .collection('affirmations')
      .doc(today)
      .set(affirmationData);
    
    // Return response
    res.json({
      affirmation,
      basedOn: affirmationData.basedOn,
      cached: false,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating personalized affirmation:', error);
    
    // Return fallback affirmation
    res.json({
      affirmation: "You're doing your best, and that's more than enough. Be gentle with yourself today. 🌿",
      basedOn: {
        recentMood: 'unknown',
        themes: ['general'],
        moodTrend: 'stable'
      },
      cached: false,
      generatedAt: new Date().toISOString(),
      error: 'Failed to generate personalized affirmation, using fallback'
    });
  }
});
```

## Firestore Data Structure

### Collection: `users/{uid}/affirmations/{date}`

```javascript
{
  affirmation: "You've been navigating stress with such grace this week...",
  basedOn: {
    recentMood: "mixed",
    themes: ["stress", "work"],
    moodTrend: "improving",
    avgMood: 3.2
  },
  createdAt: Timestamp,
  userId: "user123"
}
```

## Environment Variables

Add to your `.env` file:

```bash
GEMINI_API_KEY=your-gemini-api-key
RAINDROP_URL=http://localhost:8787
```

## Testing

```bash
# Get personalized affirmation
curl -X GET "http://localhost:8000/journal/affirmation/personalized" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Force refresh (regenerate)
curl -X GET "http://localhost:8000/journal/affirmation/personalized?forceRefresh=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

1. **No mood data**: Uses neutral mood (3/5) as default
2. **No journal entries**: Uses general themes
3. **Gemini API failure**: Returns fallback affirmation
4. **Similar affirmation**: Regenerates up to 3 times
5. **Cache miss**: Generates new affirmation

## Performance Considerations

1. **Daily caching**: One affirmation per day per user
2. **Similarity check**: Limited to last 10 affirmations within 14 days
3. **Mood data**: Fetches only last 7 days
4. **Journal data**: Fetches only last 3 entries
5. **Async storage**: Firestore writes are non-blocking

## Integration Notes

- Works with existing Raindrop analytics endpoint
- Compatible with existing journal collection structure
- No migration needed for existing users
- Graceful fallbacks for all external dependencies
