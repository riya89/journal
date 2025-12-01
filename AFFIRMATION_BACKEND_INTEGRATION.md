# Personalized Affirmation Backend Integration Guide

## Problem
All users are seeing the same fallback affirmation because the `/journal/affirmation/personalized` endpoint doesn't exist in your backend yet.

## Solution
Add the personalized affirmation endpoint to your backend.

---

## Step 1: Copy the Endpoint Code

Open your backend repo and locate your `routes/journal.js` file.

Copy the entire code from `PERSONALIZED_AFFIRMATION_ENDPOINT.js` in this repo and paste it into your `routes/journal.js` file.

**Where to paste it:**
- Add it after your existing `/affirmation/daily` endpoint
- Or at the end of the file before `export default router;`

---

## Step 2: Verify Environment Variables

Make sure your backend `.env` file has:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
RAINDROP_URL=http://localhost:8787
```

**Note:** You already have `GEMINI_API_KEY` since your `/affirmation/daily` endpoint works. The `RAINDROP_URL` is optional - if it's not available, the endpoint will use a neutral mood default.

---

## Step 3: Restart Your Backend

```bash
# In your backend repo
npm start
# or
node server.js
# or whatever command you use
```

---

## Step 4: Test the Endpoint

### Test with curl:

```bash
# Get your Firebase auth token first (from browser dev tools)
# Then test:

curl -X GET "http://localhost:8000/journal/affirmation/personalized" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Expected Response:

```json
{
  "affirmation": "You've been navigating work stress with such grace this week. Your resilience is beautiful.",
  "basedOn": {
    "recentMood": "mixed",
    "themes": ["stress", "work"],
    "moodTrend": "improving",
    "avgMood": 3.2
  },
  "cached": false,
  "generatedAt": "2025-12-02T10:30:00.000Z"
}
```

---

## Step 5: Test in Your Frontend

1. Open your app in the browser
2. Navigate to a page with the `AffirmationCard` component (Home, MoodDashboard, etc.)
3. You should now see a **personalized affirmation** based on your journal entries
4. Try with different user accounts - each should see different affirmations

---

## How It Works

### Data Sources:
1. **Last 2-3 days of journal entries** - analyzes content for themes (up to 5 entries)
2. **Last 2-3 days of AI chat conversations** - extracts user messages (up to 3 sessions, 5 messages each)
3. **Last 7 days of mood data** - calculates average mood and trend
4. **Theme detection** - identifies stress, work, relationships, growth, self-care from BOTH journals and AI chats

### Personalization:
- **Low mood (< 2.5/5)**: Extra supportive and grounding tone
- **Positive mood (> 3.5/5)**: Celebratory and encouraging tone
- **Mixed mood**: Balanced and validating tone

### Caching:
- One affirmation per day per user
- Cached in Firestore: `users/{uid}/affirmations/{date}`
- Use `?forceRefresh=true` to regenerate

### Variety:
- Checks last 10 affirmations within 14 days
- Regenerates up to 3 times if too similar
- Uses high temperature (0.9) for creativity

---

## Troubleshooting

### Still seeing the same fallback affirmation?

1. **Check backend logs** - look for errors when the endpoint is called
2. **Verify endpoint exists** - test with curl
3. **Check browser console** - look for 404 or 500 errors
4. **Clear browser cache** - hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Getting generic affirmations?

This means the endpoint is working but:
- User has no recent journal entries (last 3 days)
- User has no recent AI chat conversations (last 3 days)
- Or mood data is unavailable
- The AI will still generate affirmations but they'll be more general

**Tip:** The more the user journals and chats with the AI assistant, the more personalized the affirmations become!

### Affirmations not changing?

This is expected! Affirmations are cached per day. To get a new one:
- Wait until tomorrow
- Or click the refresh button in the UI
- Or use `?forceRefresh=true` in the API call

---

## Database Structure

The endpoint creates this Firestore collection:

```
users/{uid}/affirmations/{date}
  ├── affirmation: "Your personalized message..."
  ├── basedOn: {
  │     recentMood: "mixed",
  │     themes: ["stress", "work"],
  │     moodTrend: "improving",
  │     avgMood: 3.2
  │   }
  ├── createdAt: Timestamp
  └── userId: "user123"
```

---

## What's Different from `/affirmation/daily`?

| Feature | `/affirmation/daily` | `/affirmation/personalized` |
|---------|---------------------|----------------------------|
| **Personalization** | Generic for all users | Based on user's journals, AI chats & mood |
| **Caching** | Global (same for everyone) | Per-user (unique per person) |
| **Context** | None | Last 2-3 days of journals + AI chats |
| **Mood awareness** | No | Yes (last 7 days) |
| **Theme detection** | No | Yes (stress, work, etc.) |
| **Variety tracking** | No | Yes (checks last 10) |
| **AI chat integration** | No | Yes (analyzes user messages) |

---

## Next Steps

Once this is working:

1. ✅ Each user gets personalized affirmations
2. ✅ Affirmations reference their actual journal content AND AI chat conversations
3. ✅ Mood-aware tone (supportive vs celebratory)
4. ✅ Daily variety (won't repeat similar ones)
5. ✅ Deeper personalization as users engage more with journaling and AI assistant

You can then:
- Add the `AffirmationCard` to more pages
- Show affirmations in notifications
- Create an affirmation history view
- Let users favorite affirmations

---

## Summary

**File to edit:** `backend/routes/journal.js` (in your backend repo)
**Code to add:** Copy from `PERSONALIZED_AFFIRMATION_ENDPOINT.js`
**Environment variable:** `GEMINI_API_KEY` (you already have this)
**Data sources:** Journals + AI chat conversations + mood data
**Test:** Restart backend, refresh frontend, see personalized affirmations! 🎉

**Pro tip:** The affirmations get more personalized as users:
- Write more journal entries
- Chat more with the AI assistant
- Track their mood regularly
