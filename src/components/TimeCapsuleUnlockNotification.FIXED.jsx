import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost } from '../utils/api';
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
        
        // OPTION 1: If backend provides needsNotification array (RECOMMENDED)
        if (data.needsNotification && data.needsNotification.length > 0) {
          const newUnlock = data.needsNotification[0];
          setUnlockedCapsule(newUnlock);
          setShowNotification(true);
          
          // Mark as shown in backend
          try {
            await apiPost(`${API_BASE_URL}/timecapsule/${newUnlock.capsuleId}/notification-shown`, {});
          } catch (err) {
            console.error('Failed to mark notification as shown:', err);
          }
          return;
        }
        
        // OPTION 2: Fallback - check unlocked array and use localStorage
        if (data.unlocked && data.unlocked.length > 0) {
          const seenKey = `capsule_notif_${user.uid}`;
          const seenCapsules = JSON.parse(localStorage.getItem(seenKey) || '[]');
          
          const newUnlock = data.unlocked.find(c => !seenCapsules.includes(c.capsuleId));
          
          if (newUnlock) {
            setUnlockedCapsule(newUnlock);
            setShowNotification(true);
            
            // Mark as seen
            localStorage.setItem(seenKey, JSON.stringify([...seenCapsules, newUnlock.capsuleId]));
          }
        }
      } catch (err) {
        console.error('Error checking for unlocked capsules:', err);
      }
    };

    // Check immediately
    checkForUnlockedCapsules();
    
    // Check every 2 minutes
    const interval = setInterval(checkForUnlockedCapsules, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleViewCapsule = () => {
    setShowNotification(false);
    navigate('/mood-tracking-hub');
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!unlockedCapsule || !showNotification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 right-4 z-[9999] max-w-sm"
      >
        <div className={`rounded-xl shadow-2xl p-6 relative ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-[#3a2f1f] to-[#2e261f] border-2 border-[#5b4a3d]/40'
            : 'bg-gradient-to-br from-[#f0f4f0] to-[#e8f0e8] border-2 border-[#a8c5a0]/50'
        }`}>
          <button
            onClick={handleDismiss}
            className={`absolute top-2 right-2 text-xl transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Dismiss"
          >
            ✖
          </button>

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

          <h3 className={`text-xl font-bold text-center mb-2 ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#2d5016]'
          }`}>
            Time Capsule Unlocked! 🎉
          </h3>

          <p className={`text-center mb-4 text-sm ${
            theme === 'dark' ? 'text-[#EBDDBF]/80' : 'text-[#3d6b2a]/80'
          }`}>
            Your time capsule from {new Date(unlockedCapsule.createdAt).toLocaleDateString()} is ready to open!
          </p>

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
    </AnimatePresence>
  );
}
