# Time Capsule Global Unlock Notification

## Problem
Time capsule unlock notifications only appear when visiting the Time Capsule page. Users want to see the notification on any page when a capsule unlocks.

## Solution
Move the unlock check to a global location (App.js or Home.jsx) so it runs regardless of which page the user is on.

## Implementation

### Step 1: Create a Global Time Capsule Notification Component

Create `src/components/TimeCapsuleUnlockNotification.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '../utils/api';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';

export default function TimeCapsuleUnlockNotification({ user, theme }) {
  const [showNotification, setShowNotification] = useState(false);
  const [unlockedCapsule, setUnlockedCapsule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const checkForUnlockedCapsules = async () => {
      try {
        const response = await apiGet(`${API_BASE_URL}/timecapsule/list`);
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Check for newly unlocked capsules
        const lastCheck = localStorage.getItem('lastCapsuleCheck') || '0';
        const seenCapsules = JSON.parse(localStorage.getItem('seenUnlockedCapsules') || '[]');
        
        const newUnlock = data.unlocked.find(c => 
          !seenCapsules.includes(c.capsuleId) && 
          new Date(c.unlockedAt).getTime() > parseInt(lastCheck)
        );
        
        if (newUnlock) {
          setUnlockedCapsule(newUnlock);
          setShowNotification(true);
          
          // Mark as seen
          localStorage.setItem('seenUnlockedCapsules', 
            JSON.stringify([...seenCapsules, newUnlock.capsuleId])
          );
        }
        
        // Update last check time
        localStorage.setItem('lastCapsuleCheck', Date.now().toString());
      } catch (err) {
        console.error('Error checking for unlocked capsules:', err);
      }
    };

    // Check immediately
    checkForUnlockedCapsules();
    
    // Check every 5 minutes
    const interval = setInterval(checkForUnlockedCapsules, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleViewCapsule = () => {
    setShowNotification(false);
    navigate('/mood-tracking-hub');
    // Scroll to time capsule section after navigation
    setTimeout(() => {
      const element = document.getElementById('time-capsule-section');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!unlockedCapsule) return null;

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <div className={`rounded-xl shadow-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#3a2f1f] to-[#2e261f] border-2 border-[#5b4a3d]/40'
              : 'bg-gradient-to-br from-[#f0f4f0] to-[#e8f0e8] border-2 border-[#a8c5a0]/50'
          }`}>
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className={`absolute top-2 right-2 text-xl transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✖
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-5xl"
              >
                🎁
              </motion.div>
            </div>

            {/* Title */}
            <h3 className={`text-xl font-bold text-center mb-2 ${
              theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#2d5016]'
            }`}>
              Time Capsule Unlocked! 🎉
            </h3>

            {/* Message */}
            <p className={`text-center mb-4 text-sm ${
              theme === 'dark' ? 'text-[#EBDDBF]/80' : 'text-[#3d6b2a]/80'
            }`}>
              Your time capsule from {new Date(unlockedCapsule.createdAt).toLocaleDateString()} is ready to open!
            </p>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleViewCapsule}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-[#5b4a3d] text-[#EBDDBF] hover:bg-[#6b5a4d]'
                    : 'bg-[#5a8c3f] text-white hover:bg-[#4a7a32]'
                }`}
              >
                View Now ✨
              </button>
              <button
                onClick={handleDismiss}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'text-[#EBDDBF]/60 hover:text-[#EBDDBF] hover:bg-[#3a2e20]/30'
                    : 'text-[#5a8c3f]/60 hover:text-[#5a8c3f] hover:bg-[#e8f0e8]/30'
                }`}
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Step 2: Add to App.js

In `src/App.js`, import and add the component:

```jsx
import TimeCapsuleUnlockNotification from './components/TimeCapsuleUnlockNotification';

// Inside your App component, add this near the top level (after authentication check):
function App() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');
  
  return (
    <div className="App">
      {/* Other components */}
      
      {/* Global Time Capsule Notification */}
      {user && <TimeCapsuleUnlockNotification user={user} theme={theme} />}
      
      {/* Routes */}
      <Routes>
        {/* ... */}
      </Routes>
    </div>
  );
}
```

### Step 3: Update TimeCapsuleUI Component (Optional)

You can keep the existing notification in `TimeCapsuleUI.jsx` or remove it to avoid duplicates. If you want to keep it for immediate feedback when on the page, that's fine too.

## Features

1. **Global Check**: Runs on any page when user is logged in
2. **Periodic Checks**: Checks every 5 minutes for new unlocks
3. **Smart Tracking**: Uses localStorage to avoid showing the same notification twice
4. **Navigation**: "View Now" button takes user directly to the Time Capsule section
5. **Dismissible**: Users can dismiss and view later
6. **Theme Support**: Matches your sage green theme

## Testing

1. Create a time capsule with a 1-minute unlock time
2. Navigate to any page (Home, Mood Dashboard, etc.)
3. Wait for the capsule to unlock
4. The notification should appear in the top-right corner
5. Click "View Now" to navigate to the capsule
6. Notification should not reappear after dismissing

## Notes

- The notification appears in the top-right corner with a fixed position
- It automatically checks every 5 minutes, so there might be a delay
- You can adjust the check interval by changing `5 * 60 * 1000` to a shorter time
- The notification persists across page navigation until dismissed
