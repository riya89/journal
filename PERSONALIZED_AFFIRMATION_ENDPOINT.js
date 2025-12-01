// ============================================
// 🌸 PERSONALIZED AFFIRMATIONS ENDPOINT
// ============================================
// Add this to your backend/routes/journal.js file

/**
 * Helper: Analyze themes from journal entries and AI chat messages
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
 * Generate personalized affirmation based on journal entries, AI chat, and mood
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
    
    // Fetch recent journal entries (last 2-3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
    
    const journalsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('journals')
      .where('date', '>=', threeDaysAgoStr)
      .orderBy('date', 'desc')
      .limit(5)
      .get();
    
    const journals = journalsSnapshot.docs.map(doc => doc.data());
    
    // Fetch recent AI chat conversations (last 2-3 days)
    const aiSessionsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('aiSessions')
      .where('updatedAt', '>=', threeDaysAgo)
      .orderBy('updatedAt', 'desc')
      .limit(3)
      .get();
    
    // Extract user messages from AI sessions
    const aiMessages = [];
    aiSessionsSnapshot.docs.forEach(doc => {
      const sessionData = doc.data();
      const messages = sessionData.messages || [];
      
      // Get only user messages (not AI responses)
      const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .slice(-5); // Last 5 user messages per session
      
      aiMessages.push(...userMessages);
    });
    
    // Combine journals and AI chat for theme analysis
    const allContent = [
      ...journals.map(j => j.content || ''),
      ...aiMessages
    ];
    const themes = analyzeJournalThemes(allContent.map(c => ({ content: c })));
    
    // Determine mood category
    let moodCategory = 'mixed';
    if (avgMood < 2.5) moodCategory = 'low';
    else if (avgMood > 3.5) moodCategory = 'positive';
    
    // Build richer context for AI with journal and chat content
    const journalSnippets = journals
      .map(j => {
        const content = j.content || '';
        return content.substring(0, 200);
      })
      .filter(s => s.length > 0)
      .join('\n---\n');
    
    const chatSnippets = aiMessages
      .slice(0, 5) // Take first 5 messages
      .map(msg => msg.substring(0, 150))
      .filter(s => s.length > 0)
      .join('\n---\n');
    
    const context = `
User's recent mood: ${moodCategory} (average: ${avgMood.toFixed(1)}/5)
Mood trend: ${moodTrend}
Recent themes: ${themes.join(', ')}
Number of recent journal entries: ${journals.length}
Number of recent AI conversations: ${aiMessages.length}

Recent journal excerpts (last 2-3 days):
${journalSnippets || 'No recent journal entries'}

Recent AI chat messages (last 2-3 days):
${chatSnippets || 'No recent AI conversations'}
    `.trim();
    
    // Build mood-specific prompt
    let toneGuidance = '';
    if (moodCategory === 'low') {
      toneGuidance = 'Be extra supportive, grounding, and compassionate. Acknowledge their struggle while offering gentle encouragement.';
    } else if (moodCategory === 'positive') {
      toneGuidance = 'Be celebratory and encouraging. Acknowledge their positive momentum and inspire continued growth.';
    } else {
      toneGuidance = 'Be balanced and validating. Acknowledge both challenges and strengths with gentle support.';
    }
    
    const prompt = `Generate a SHORT, personalized affirmation in FIRST PERSON (1-2 sentences MAXIMUM, under 25 words total).

${context}

Tone: ${toneGuidance}

STRICT RULES:
- MAXIMUM 1-2 short sentences (under 25 words total)
- MUST use FIRST PERSON: "I am...", "I attract...", "I deserve...", "I choose..."
- NO second person ("you are", "your")
- NO coaching language
- Direct, powerful, present tense
- Reference their actual themes/mood if available
- NO explanations, JUST the affirmation

Examples of CORRECT format:
- "I am resilient and capable of handling whatever comes my way."
- "I attract peace and positive energy into my life today."
- "I am worthy of rest and self-compassion."
- "I choose to trust my journey and embrace growth."
- "I am stronger than my stress, and I navigate challenges with grace."

Generate ONE short FIRST PERSON affirmation NOW (under 25 words):`;
    
    // Generate affirmation with Gemini
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    let affirmation = '';
    let attempts = 0;
    const maxAttempts = 3;
    
    // Try to generate unique affirmation (check against recent ones)
    while (attempts < maxAttempts) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 50  // Reduced from 100 to force shorter responses
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
      
      // Remove any coaching language that slipped through
      affirmation = affirmation.replace(/^As your mental wellness coach,?\s*/i, '');
      affirmation = affirmation.replace(/^I've noticed (that )?\s*/i, '');
      affirmation = affirmation.replace(/^I want to remind you (that )?\s*/i, '');
      
      // If still too long (over 150 chars), truncate to first 2 sentences
      if (affirmation.length > 150) {
        const sentences = affirmation.match(/[^.!?]+[.!?]+/g) || [affirmation];
        affirmation = sentences.slice(0, 2).join(' ').trim();
      }
      
      // Check if similar to recent affirmations
      const isSimilar = await isSimilarToRecent(userId, affirmation);
      
      if (!isSimilar || attempts === maxAttempts - 1) {
        break;
      }
      
      attempts++;
      console.log(`Affirmation too similar, regenerating (attempt ${attempts + 1}/${maxAttempts})`);
    }
    
    if (!affirmation) {
      // Fallback affirmation (first person)
      affirmation = "I am doing my best, and that is more than enough. I choose to be gentle with myself today. 🌿";
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
      createdAt: new Date(),
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
    
    // Return fallback affirmation (first person)
    res.json({
      affirmation: "I am doing my best, and that is more than enough. I choose to be gentle with myself today. 🌿",
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
