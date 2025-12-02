# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Backend Deployed**: Your Node.js backend must be deployed separately (see Backend Deployment section)
3. **Firebase Project**: Set up and configured
4. **Environment Variables**: Ready to configure

## Quick Deploy Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_BASE_URL=https://your-backend-api.com/journal
```

**Important**: Add these for all environments (Production, Preview, Development)

### 4. Deploy

Click **Deploy** and Vercel will:
- Install dependencies
- Build your React app
- Deploy to a global CDN
- Provide you with a URL

## Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Backend Deployment

Your backend needs to be deployed separately. Options:

### Option 1: Vercel Serverless Functions
- Move backend code to `/api` folder
- Convert to serverless functions
- Deploy with the same project

### Option 2: Render.com (Recommended for Node.js)
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your backend repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or your backend entry file)
   - **Environment Variables**: Add Firebase Admin SDK credentials

### Option 3: Railway.app
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables
4. Deploy

### Option 4: Heroku
```bash
heroku create your-journal-backend
git push heroku main
heroku config:set FIREBASE_PROJECT_ID=your_project_id
```

## Post-Deployment Checklist

- [ ] Frontend deployed successfully
- [ ] Backend deployed and accessible
- [ ] Environment variables configured
- [ ] Firebase authentication working
- [ ] API calls connecting to backend
- [ ] Test all features:
  - [ ] Login/Signup
  - [ ] Journal entries
  - [ ] Mood tracking
  - [ ] Gratitude jar
  - [ ] Time capsule
  - [ ] AI assistant
  - [ ] Gamification features
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify dark mode works

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Environment Variables Not Working
- Ensure they start with `REACT_APP_`
- Redeploy after adding variables
- Check they're set for correct environment

### API Calls Failing
- Verify `REACT_APP_API_BASE_URL` is correct
- Check backend is deployed and running
- Enable CORS on backend for your Vercel domain
- Check browser network tab for errors

### Firebase Authentication Issues
- Add Vercel domain to Firebase authorized domains
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your Vercel domain (e.g., `your-app.vercel.app`)

### Routing Issues (404 on refresh)
- `vercel.json` should handle this (already configured)
- Ensure all routes redirect to `index.html`

## Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Firebase authorized domains

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: For every pull request and branch

## Performance Optimization

- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable compression
- [ ] Use lazy loading for routes

## Security

- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Enable Firebase security rules
- [ ] Set up proper CORS on backend
- [ ] Use HTTPS only

## Monitoring

- Use Vercel Analytics for performance
- Set up error tracking (Sentry, LogRocket)
- Monitor backend logs
- Set up uptime monitoring

## Cost Considerations

**Vercel Free Tier Includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments

**Upgrade if you need:**
- More bandwidth
- Team collaboration
- Advanced analytics
- Password protection

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Next Steps After Deployment

1. Share your app URL
2. Gather user feedback
3. Monitor performance
4. Iterate and improve
5. Set up analytics
6. Configure custom domain
7. Enable PWA features

---

**Your app is now live! 🎉**
