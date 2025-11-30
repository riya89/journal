# Backend Integration Steps for Personalized Affirmations

## Quick Integration Guide

Follow these steps to add the personalized affirmations endpoint to your backend.

## Step 1: Locate Your Backend File

Find your main backend routes file. Based on your project structure, it should be:
- `backend/routes/journal.js` OR
- `backend/server.js` OR
- Similar file where you have other `/journal/*` endpoints

## Step 2: Add Required Dependencies

Ensure these are imported at the top of your file:

```javascript
const admin = require('firebase-admin');
const fetch = require('node-fetch'); // or use native fetch if Node 18+

const db = admin.firestore();
```

## Step 3: Copy the Endpoint Code

Open `.kiro/specs/ai-assistant-enhancements/backend-affirmations.md` and copy the entire endpoint implementation (starting from the comment `// PERSONALIZED AFFIRMATIONS`).

Paste it into your routes file, after your existing endpoints.

## Step 4: Verify Environment Variables

Add to your `.env` file:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
RAINDROP_URL=http://localhost:8787
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## Step 5: Test the Endpoint

### Using curl:

```bash
# First, get your Firebase auth token
# (You can get this from your browser's localStorage or by logging in)

# Then test the endpoint
curl -X GET "http://localhost:8000/journal/affirmation/personalized" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Expected Response:

```json
{
  "affirmation": "You've been navigating stress with such grace this week. Your resilience is beautiful.",
  "basedOn": {
    "recentMood": "mixed",
    "themes": ["stress", "work"],
    "moodTrend": "improving",
    "avgMood": 3.2
  },
  "cached": false,
  "generatedAt": "2025-11-30T10:30:00Z"
}
```

## Step 6: Test Force Refresh

```bash
curl -X GET "http://localhost:8000/journal/affirmation/personalized?forceRefresh=true" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

This should generate a new affirmation even if one was cached.

## Step 7: Verify Firestore Storage

Check your Firestore console:
- Navigate to `users/{uid}/affirmations/{date}`
- You should see a document with today's date
- It should contain the affirmation and metadata

## Step 8: Test Frontend Integration

1. Start your frontend: `npm start`
2. Navigate to a page with the AffirmationCard component
3. Verify the affirmation loads and displays
4. Click the refresh button to test force refresh

## Troubleshooting

### Error: "GEMINI_API_KEY not configured"
**Solution**: Add `GEMINI_API_KEY` to your `.env` file and restart the backend server.

### Error: "Failed to fetch mood data"
**Solution**: This is a warning, not an error. The endpoint will use default mood values. Ensure Raindrop is running if you want mood integration.

### Error: "Gemini API error: 401"
**Solution**: Your Gemini API key is invalid. Get a new one from https://makersuite.google.com/app/apikey

### Error: "Gemini API error: 429"
**Solution**: You've hit the rate limit. Wait a few minutes or upgrade your Gemini API plan.

### Affirmation is always the same
**Solution**: The affirmation is cached daily. Use `?forceRefresh=true` to generate a new one, or wait until tomorrow.

### No themes detected
**Solution**: The user needs to have journal entries. The system will use "general" theme if no entries exist.

## Code Structure

The endpoint implementation includes:

1. **Cache Check** (lines 1-20)
   - Checks if affirmation exists for today
   - Returns cached version if available

2. **Mood Data Fetch** (lines 22-40)
   - Fetches from Raindrop analytics
   - Falls back to neutral mood if unavailable

3. **Journal Analysis** (lines 42-50)
   - Fetches last 3 journal entries
   - Analyzes themes using keyword matching

4. **Affirmation Generation** (lines 52-100)
   - Builds context for AI
   - Generates mood-specific prompt
   - Calls Gemini API

5. **Variety Check** (lines 102-120)
   - Checks similarity with recent affirmations
   - Regenerates if too similar (up to 3 attempts)

6. **Storage** (lines 122-135)
   - Stores in Firestore for caching
   - Returns response to frontend

## Helper Functions

The implementation includes three helper functions:

### 1. `analyzeJournalThemes(journals)`
Detects themes from journal content using keyword matching.

### 2. `calculateMoodTrend(moodData)`
Calculates if mood is improving, declining, or stable.

### 3. `isSimilarToRecent(userId, newAffirmation)`
Checks if new affirmation is too similar to recent ones.

## Performance Notes

- **First request**: ~2-3 seconds (Gemini API call)
- **Cached requests**: ~100ms (Firestore read)
- **Force refresh**: ~2-3 seconds (new Gemini API call)

## Security Considerations

- ✅ Requires Firebase authentication
- ✅ User can only access their own affirmations
- ✅ API key is server-side only (not exposed to frontend)
- ✅ Rate limiting handled by Gemini API

## Deployment Checklist

Before deploying to production:

- [ ] Add `GEMINI_API_KEY` to production environment variables
- [ ] Update `RAINDROP_URL` to production URL
- [ ] Test endpoint with production Firebase
- [ ] Verify Firestore security rules allow the operations
- [ ] Test with multiple users
- [ ] Monitor Gemini API usage and costs
- [ ] Set up error logging and monitoring

## Monitoring

Monitor these metrics:

1. **API Response Time**: Should be < 3 seconds
2. **Cache Hit Rate**: Should be > 90% (one generation per day per user)
3. **Gemini API Errors**: Should be < 1%
4. **Fallback Usage**: Track how often fallback affirmations are used

## Cost Estimation

Gemini API costs (as of 2025):
- Free tier: 60 requests per minute
- Paid tier: $0.00025 per request

For 1000 daily active users:
- Daily cost: ~$0.25 (assuming one affirmation per user per day)
- Monthly cost: ~$7.50

## Next Steps

1. ✅ Copy endpoint code to your backend
2. ✅ Add environment variables
3. ✅ Test with curl
4. ✅ Verify Firestore storage
5. ✅ Test frontend integration
6. ✅ Deploy to production

## Support

If you encounter issues:

1. Check the backend logs for detailed error messages
2. Verify all environment variables are set
3. Test the endpoint with curl to isolate frontend issues
4. Check Firestore security rules
5. Verify Gemini API key is valid

## Summary

The personalized affirmations endpoint is ready to integrate! Just:
1. Copy the code from `backend-affirmations.md`
2. Add your Gemini API key
3. Test and deploy

The frontend component is already complete and ready to use. 🎉
