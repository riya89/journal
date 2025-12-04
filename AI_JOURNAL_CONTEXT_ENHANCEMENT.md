# 🤖 AI Companion + Journal Context Integration

## What We're Adding

Currently, your AI companion only has conversation history. We're adding **journal entry context** so the AI can reference what you've written in your recent journals during conversations.

This makes the "stitch" between AI Companion and Journaling real and powerful!

---

## Backend Changes (journal.js)

### 1. Update the `buildFriendlyPrompt` function

Replace the existing `buildFriendlyPrompt` function with this enhanced version:

```javascript
const buildFriendlyPromptWithJournals = (message, conversationHistory = [], recentJournals = []) => {
  let prompt = `You are a close friend having a genuine conversation. Not a therapist, not a coach - just a real friend who cares.

PERSONALITY:
- Warm, authentic, and relatable
- Sometimes playful, sometimes serious - read the room
- Share brief relatable thoughts or observations
- Use casual language like a real friend would
- Show genuine interest and curiosity
- Remember what they've shared before

RESPONSE STYLE:
- Keep it conversational (1-3 sentences max)
- Mix up your responses - don't always validate, sometimes:
  * Share a relatable thought
  * Ask a curious follow-up
  * Offer a gentle perspective
  * Just acknowledge and be present
  * Use light humor when appropriate
- Vary your openings - avoid always starting with "I hear you" or "That sounds..."

EXAMPLES OF GOOD RESPONSES:
User: "I'm so tired today"
Friend: "Ugh, I feel that. Did you get any sleep last night, or was it one of those nights?"

User: "I finally finished that project!"
Friend: "Yes! That's huge! How does it feel to have it off your plate?"

User: "Everyone's annoying me today"
Friend: "One of those days where people are just... a lot? What happened?"

AVOID:
- Therapist phrases: "I hear you", "That must be difficult", "How does that make you feel?"
- Always being overly positive or validating
- Generic responses that could apply to anything
- Ending every message with a question
- Being too formal or careful

BE NATURAL:
- Sometimes just say "damn" or "wow" or "oof"
- Use casual contractions (you're, that's, it's)
- It's okay to be brief and simple
- Match their energy level`;

  // Add journal context if available
  if (recentJournals.length > 0) {
    prompt += "\n\nRECENT JOURNAL ENTRIES (last 3 days):";
    recentJournals.forEach(journal => {
      const moodEmoji = journal.mood >= 4 ? "😊" : journal.mood >= 3 ? "😐" : "😔";
      prompt += `\n- ${journal.date} (mood: ${journal.mood}/5 ${moodEmoji}): "${journal.content.substring(0, 200)}..."`;
    });
    prompt += "\n\nYou can reference their journal entries naturally if relevant to the conversation.";
  }

  // Add conversation history if available
  if (conversationHistory.length > 0) {
    prompt += "\n\nPREVIOUS CONVERSATION:\n";
    conversationHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'Friend' : 'You';
      prompt += `${role}: ${msg.content}\n`;
    });
  }

  prompt += `\n\nFriend just said: "${message}"\n\nRespond naturally as their friend (1-3 sentences):`;
  
  return prompt;
};
```

### 2. Update the `/assistant/reply-with-context` endpoint

Find this section in your code:

```javascript
router.post("/assistant/reply-with-context", verifyToken, async (req, res) => {
  const { message, sessionId, includeHistory } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "Hey, what's up? 🌿" });
  }

  try {
    let context = [];
    
    // Load conversation history if requested
    if (includeHistory && sessionId) {
      const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
      const sessionDoc = await sessionRef.get();
      
      if (sessionDoc.exists) {
        const sessionData = sessionDoc.data();
        context = sessionData.messages?.slice(-10) || [];
      }
    }
```

**Add this code right after the conversation history loading:**

```javascript
    // ✨ NEW: Fetch recent journal entries for context
    const userRef = db.collection("users").doc(req.uid);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

    const journalsSnapshot = await userRef.collection("journals")
      .where("date", ">=", threeDaysAgoStr)
      .orderBy("date", "desc")
      .limit(3)
      .get();

    const recentJournals = [];
    journalsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.content || data.mood) {
        recentJournals.push({
          date: data.date,
          content: data.content?.substring(0, 300) || "", // First 300 chars
          mood: data.mood
        });
      }
    });

    console.log(`📚 Loaded ${recentJournals.length} recent journal entries for AI context`);
```

**Then update the prompt building line from:**

```javascript
    const contextPrompt = buildFriendlyPrompt(message, context.slice(0, -1));
```

**To:**

```javascript
    const contextPrompt = buildFriendlyPromptWithJournals(message, context.slice(0, -1), recentJournals);
```

---

## Testing the Integration

### Test Scenario 1: Journal Reference
1. Write a journal entry: "Had a stressful day at work. My boss was demanding."
2. Chat with AI: "I'm feeling overwhelmed"
3. **Expected:** AI should reference your work stress from the journal

### Test Scenario 2: Mood Awareness
1. Write journal with mood 2/5: "Everything feels heavy today"
2. Chat with AI: "How are you?"
3. **Expected:** AI should acknowledge your low mood from recent journal

### Test Scenario 3: Pattern Recognition
1. Write 3 journals mentioning "tired" or "exhausted"
2. Chat with AI: "I don't know what's wrong"
3. **Expected:** AI should notice the tiredness pattern

---

## Example Conversations (After Integration)

### Before (No Journal Context):
```
User: "I'm feeling stressed"
AI: "That sounds tough. What's been going on?"
```

### After (With Journal Context):
```
User: "I'm feeling stressed"
AI: "Yeah, I saw you wrote about work being rough yesterday. Is it still that project deadline weighing on you?"
```

---

## Why This Makes the Frankenstein Stitch Real

**Before:** AI and Journaling were separate - AI couldn't see your journals

**After:** AI reads your journals and references them naturally in conversation

**The Stitch:**
```
Journal Entry (Private reflection)
    ↓
Stored in Firestore
    ↓
AI Companion reads recent entries
    ↓
AI provides context-aware support
    ↓
Conversation feels more personal and connected
```

This is a TRUE integration - not just two features existing side-by-side, but actively working together!

---

## Update Documentation

After implementing, update these sections in your hackathon docs:

### FRANKENSTEIN_ARCHITECTURE.md
Change AI Companion description to:
```markdown
### 3. 🤖 AI Companion (Gemini-powered)
**Traditional Philosophy:** Conversational therapy, reactive support
- Context-aware conversations with session memory
- **Analyzes recent journal entries (last 3 days)**
- **References your journal content in conversations**
- Emotional support based on your actual experiences
- Conversation history (last 10 messages per session)

**The Incompatibility:** AI therapy is typically separate from journaling
**The Stitch:** AI reads your private journals to provide personalized support
```

### Example Flow (Update in docs):
```
User writes journal: "Stressed about work deadline"
    ↓
Saved to Firestore
    ↓
Later, user chats with AI: "I'm feeling anxious"
    ↓
AI fetches recent journals
    ↓
AI sees work stress from yesterday
    ↓
AI responds: "Is it still that work deadline stressing you out? Want to talk through it?"
    ↓
User feels understood and supported
```

---

## Deployment Checklist

- [ ] Update `buildFriendlyPrompt` to `buildFriendlyPromptWithJournals`
- [ ] Add journal fetching code to `/assistant/reply-with-context`
- [ ] Test with real journal entries
- [ ] Verify AI references journals naturally
- [ ] Update hackathon documentation
- [ ] Deploy to production
- [ ] Test in demo video

---

## Benefits for Hackathon Judges

1. **Real Integration:** Not just UI - actual data flow between systems
2. **Personalized AI:** AI knows your story from journals
3. **Compound Value:** Journaling makes AI smarter, AI makes journaling more valuable
4. **Frankenstein Proof:** Shows impossible combination working beautifully

---

This enhancement makes your Frankenstein submission even stronger! 🧟⚡
