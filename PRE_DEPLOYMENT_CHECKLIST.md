# Pre-Deployment Checklist

## ✅ Before Deploying to Vercel

### 1. Code Preparation
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] Build succeeds locally: `npm run build`
- [ ] All environment variables configured in `.env`
- [ ] Firebase config uses environment variables
- [ ] `.env` added to `.gitignore`

### 2. Backend Setup
- [ ] Backend deployed and accessible
- [ ] Backend URL noted for environment variables
- [ ] CORS configured to allow your Vercel domain
- [ ] All API endpoints tested
- [ ] Firebase Admin SDK configured on backend
- [ ] Database indexes created in Firebase

### 3. Firebase Configuration
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password, Google)
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Authorized domains ready to add Vercel domain

### 4. Environment Variables Ready
Prepare these for Vercel:
- [ ] `REACT_APP_FIREBASE_API_KEY`
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN`
- [ ] `REACT_APP_FIREBASE_PROJECT_ID`
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `REACT_APP_FIREBASE_APP_ID`
- [ ] `REACT_APP_FIREBASE_MEASUREMENT_ID`
- [ ] `REACT_APP_API_BASE_URL` (your deployed backend URL)

### 5. Repository Setup
- [ ] Code pushed to GitHub
- [ ] `.gitignore` excludes `.env` files
- [ ] `vercel.json` committed
- [ ] README updated with deployment info

### 6. Optional Features
- [ ] Stripe keys (if using paid features)
- [ ] OpenAI API key (if using AI features)
- [ ] Analytics configured
- [ ] Error tracking set up

## 🚀 Deployment Steps

### Step 1: Deploy Backend First
1. Choose backend hosting (Render, Railway, Heroku)
2. Deploy backend code
3. Note the backend URL
4. Test backend endpoints

### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add all environment variables
5. Click Deploy

### Step 3: Post-Deployment
1. Add Vercel domain to Firebase authorized domains
2. Update backend CORS to allow Vercel domain
3. Test all features on production
4. Monitor for errors

## 🧪 Testing After Deployment

### Critical Features to Test
- [ ] User signup
- [ ] User login
- [ ] Google authentication
- [ ] Create journal entry
- [ ] Edit journal entry
- [ ] Delete journal entry
- [ ] Mood tracking
- [ ] Gratitude jar
- [ ] Time capsule
- [ ] AI assistant
- [ ] Monthly planner
- [ ] Task management
- [ ] XP and badges
- [ ] Quests
- [ ] Profile settings
- [ ] Dark mode toggle
- [ ] Responsive design on mobile

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Images load properly
- [ ] Animations smooth
- [ ] API calls successful

## 🔧 Common Issues & Solutions

### Build Fails
**Problem**: Build fails on Vercel
**Solution**: 
- Run `npm run build` locally
- Check for missing dependencies
- Ensure all imports are correct

### API Calls Fail
**Problem**: Frontend can't reach backend
**Solution**:
- Verify `REACT_APP_API_BASE_URL` is correct
- Check backend is running
- Enable CORS on backend
- Check network tab in browser

### Firebase Auth Fails
**Problem**: Can't login after deployment
**Solution**:
- Add Vercel domain to Firebase authorized domains
- Check Firebase config environment variables
- Verify Firebase project is active

### 404 on Page Refresh
**Problem**: Routes return 404 when refreshed
**Solution**:
- Ensure `vercel.json` is configured (already done)
- Check all routes redirect to `index.html`

## 📊 Monitoring

After deployment, monitor:
- Vercel Analytics (built-in)
- Firebase Console (user activity)
- Backend logs (API errors)
- Browser console (client errors)

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Users can sign up and login
- ✅ All features work as expected
- ✅ Mobile responsive
- ✅ Dark mode works
- ✅ API calls succeed
- ✅ Data persists correctly

## 📝 Notes

- Vercel provides automatic HTTPS
- Preview deployments for every branch
- Production deployment on main branch
- Free tier includes 100GB bandwidth/month

---

**Ready to deploy? Follow the DEPLOYMENT_GUIDE.md for detailed steps!**
