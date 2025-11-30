# Personalized Affirmations - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Backend Setup (2 minutes)

1. Open `backend/routes/journal.js`
2. Copy the entire endpoint code from `.kiro/specs/ai-assistant-enhancements/backend-affirmations.md`
3. Paste it at the end of your routes file
4. Add to your `.env` file:
   ```bash
   GEMINI_API_KEY=your-key-here
   RAINDROP_URL=http://localhost:8787
   ```
5. Restart your backend server

### Step 2: Test Backend (1 minute)

```bash
curl -X GET "http://localhost:8000/journal/affirmation/personalized" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You should see a JSON response with an affirmation!

### Step 3: Add to Frontend (2 minutes)

Open any page (e.g., `src/pages/Home.jsx`) and add:

```jsx
import AffirmationCard from '../components/AffirmationCard';

// Inside your component's return:
<AffirmationCard theme={theme} />
```

### Step 4: Test in Browser

1. Start your frontend: `npm start`
2. Navigate to the page with the affirmation card
3. You should see a personalized affirmation!
4. Click the refresh button to generate a new one

## ✅ That's It!

Your personalized affirmations feature is now live!

## 📚 Need More Details?

- **Backend Implementation**: See `backend-affirmations.md`
- **Frontend Usage**: See `AFFIRMATION_USAGE_GUIDE.md`
- **Integration Steps**: See `BACKEND_INTEGRATION_STEPS.md`
- **Full Documentation**: See `AFFIRMATIONS_IMPLEMENTATION.md`

## 🐛 Troubleshooting

**Affirmation not loading?**
- Check backend is running
- Verify GEMINI_API_KEY is set
- Check browser console for errors

**Backend error?**
- Check backend logs
- Verify environment variables
- Test with curl first

**Need help?**
- Check `BACKEND_INTEGRATION_STEPS.md` for detailed troubleshooting

## 🎉 Features You Get

- ✨ Personalized affirmations based on mood
- 🎯 Theme-aware content from journal entries
- 💙 Supportive tone for low moods
- ☀️ Celebratory tone for positive moods
- 🔄 Refresh button for new affirmations
- 💾 Daily caching for performance
- 🎨 Beautiful UI in light/dark themes

Enjoy your new personalized affirmations feature! 🌿
