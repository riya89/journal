# Deployment Checklist

## 1. Vercel Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

```
REACT_APP_FIREBASE_API_KEY=AIzaSyDECY3yPtpExQH2FT57PG0vwxbrqZQITMQ
REACT_APP_FIREBASE_AUTH_DOMAIN=journal-bb4cc.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=journal-bb4cc
REACT_APP_FIREBASE_STORAGE_BUCKET=journal-bb4cc.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=238211401247
REACT_APP_FIREBASE_APP_ID=1:238211401247:web:167d30a000b2a1756eb72a
REACT_APP_FIREBASE_MEASUREMENT_ID=G-WFKWCH5S8Z
REACT_APP_API_BASE_URL=https://journal-6xfj.onrender.com/journal
```

## 2. Firebase Console Setup

1. Go to https://console.firebase.google.com/project/journal-bb4cc/authentication/settings
2. Click on "Authorized domains"
3. Add your Vercel domain (e.g., `your-app.vercel.app`)
4. Add any custom domains you're using

## 3. Backend CORS Configuration

Your backend at `https://journal-6xfj.onrender.com` needs to allow:
- Your Vercel domain (e.g., `https://your-app.vercel.app`)
- For local dev: `http://localhost:3000`

Example backend CORS setup (Node.js/Express):
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    // Add your custom domain if you have one
  ],
  credentials: true
}));
```

## 4. Backend Endpoints to Verify

Make sure your backend has these endpoints:
- `/auth/saveUser` - Save user info on login
- `/journal/*` - Journal CRUD operations
- `/raindrop/*` - Analytics/mood tracking (if using separate analytics backend)

## 5. Common Issues

### "Failed to fetch" errors
- **Cause**: CORS not configured or backend is down
- **Fix**: Check backend CORS settings and ensure backend is running

### "404 Not Found" on auth
- **Cause**: URL construction issue or missing endpoint
- **Fix**: Verify the endpoint exists on your backend

### Auth works but data doesn't load
- **Cause**: Token not being sent or backend not accepting it
- **Fix**: Check Authorization header is being sent with Bearer token

## 6. Testing Locally

To test locally with the production backend:
1. Make sure your backend allows `http://localhost:3000` in CORS
2. Run `npm start`
3. Check browser console for any CORS errors

## 7. Deploy

```bash
git add .
git commit -m "Fix: Environment variables and API configuration"
git push
```

Vercel will auto-deploy from your connected branch.
