import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost } from '../utils/api';
import CreateCapsuleModal from './CreateCapsuleModal';

const API_BASE_URL ='http://localhost:8000/journal';

const TimeCapsuleUI = ({ theme }) => {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState({ locked: [], unlocked: [] });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadCapsules();
    }
  }, [user]);

  const loadCapsules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet(`${API_BASE_URL}/timecapsule/list`);
      
      if (!response.ok) {
        throw new Error('Failed to load time capsules');
      }
      
      const data = await response.json();
      setCapsules(data);
    } catch (err) {
      console.error('Error loading capsules:', err);
      setError('Failed to load time capsules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createCapsule = async (capsuleData) => {
    try {
      const response = await apiPost(`${API_BASE_URL}/timecapsule/create`, capsuleData);
      
      if (!response.ok) {
        throw new Error('Failed to create time capsule');
      }
      
      await loadCapsules();
      setShowCreate(false);
    } catch (err) {
      console.error('Error creating capsule:', err);
      throw err;
    }
  };

  const viewCapsule = async (capsuleId) => {
    try {
      const response = await apiGet(`${API_BASE_URL}/timecapsule/${capsuleId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          alert(`This capsule is still locked! Unlocks on ${errorData.unlockDate}`);
          return;
        }
        throw new Error('Failed to load capsule');
      }
      
      const data = await response.json();
      setSelectedCapsule(data);
    } catch (err) {
      console.error('Error viewing capsule:', err);
      alert('Failed to load capsule details');
    }
  };

  if (loading) {
    return (
      <div className="time-capsule-ui p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="time-capsule-ui p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-3xl font-bold text-gray-800 dark:text-white mb-2 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
          Time Capsules 🕰️
        </h2>
        <p className={`text-gray-600 dark:text-gray-400 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
          Write messages to your future self and unlock them later to reflect on your growth
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={() => setShowCreate(true)}
        className="mb-8 px-6 py-3 bg-[#7A916C] dark:bg-[#5b4a3d] text-white rounded-lg 
                 hover:bg-[#6c7a5b] dark:hover:bg-[#6d5a4a] 
                 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105
                 flex items-center gap-2 font-medium"
      >
        <span className="text-xl">✨</span>
        Create Time Capsule
      </button>

      {/* Capsules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Locked Capsules */}
        <div className="locked-capsules">
          <h3 className={`text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            <span>🔒</span>
            Locked ({capsules.locked.length})
          </h3>
          
          {capsules.locked.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">
                No locked capsules yet. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {capsules.locked.map(capsule => (
                <LockedCapsuleCard key={capsule.capsuleId} capsule={capsule} />
              ))}
            </div>
          )}
        </div>

        {/* Unlocked Capsules */}
        <div className="unlocked-capsules">
          <h3 className={`text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            <span>✨</span>
            Unlocked ({capsules.unlocked.length})
          </h3>
          
          {capsules.unlocked.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">
                No unlocked capsules yet. They'll appear here when the time comes!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {capsules.unlocked.map(capsule => (
                <UnlockedCapsuleCard 
                  key={capsule.capsuleId} 
                  capsule={capsule}
                  onView={() => viewCapsule(capsule.capsuleId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateCapsuleModal 
          onSubmit={createCapsule}
          onClose={() => setShowCreate(false)}
        />
      )}

      {selectedCapsule && (
        <CapsuleDetailModal
          capsule={selectedCapsule}
          onClose={() => setSelectedCapsule(null)}
          theme={theme}
        />
      )}
    </div>
  );
};

// Locked Capsule Card Component
const LockedCapsuleCard = ({ capsule }) => {
  const getCountdownText = (days) => {
    if (days === 0) return 'Unlocks today!';
    if (days === 1) return '1 day remaining';
    if (days < 30) return `${days} days remaining`;
    if (days < 365) return `${Math.floor(days / 30)} months remaining`;
    return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} remaining`;
  };

  return (
    <div className="locked-capsule-card p-6 bg-gradient-to-br from-[#EBDDBF]/10 to-[#d4a574]/10 
                  dark:from-[#3a2e20] dark:to-[#5b4a3d]/50 rounded-lg border-2 
                  border-[#cdd6c0] dark:border-[#5b4a3d] shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/70">
            Created: {new Date(capsule.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/70">
            Unlocks: {new Date(capsule.unlockDate).toLocaleDateString()}
          </p>
        </div>
        <div className="text-4xl">🔒</div>
      </div>
      
      <div className="mb-4">
        <div className="text-2xl font-bold text-[#7A916C] dark:text-[#d4a574]">
          {getCountdownText(capsule.daysUntilUnlock)}
        </div>
      </div>
      
      <div className="p-4 bg-white/50 dark:bg-black/30 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/80 italic">
          Your message is safely locked away, waiting for the right moment...
        </p>
      </div>
    </div>
  );
};

// Unlocked Capsule Card Component
const UnlockedCapsuleCard = ({ capsule, onView }) => {
  return (
    <div className="unlocked-capsule-card p-6 bg-gradient-to-br from-[#d4a574]/10 to-[#EBDDBF]/10 
                  dark:from-[#5b4a3d]/30 dark:to-[#3a2e20]/30 rounded-lg border-2 
                  border-[#d4a574]/30 dark:border-[#5b4a3d] shadow-md hover:shadow-lg 
                  transition-shadow cursor-pointer"
         onClick={onView}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/70">
            Created: {new Date(capsule.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/70">
            Unlocked: {new Date(capsule.unlockDate).toLocaleDateString()}
          </p>
        </div>
        <div className="text-4xl">✨</div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 dark:text-[#EBDDBF] line-clamp-3">
          {capsule.message}
        </p>
      </div>
      
      {capsule.currentGoals && capsule.currentGoals.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-[#EBDDBF]/60 mb-1">Goals from the past:</p>
          <div className="flex flex-wrap gap-2">
            {capsule.currentGoals.slice(0, 3).map((goal, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-white/50 dark:bg-black/30 
                                       rounded-full text-gray-600 dark:text-[#EBDDBF]/80">
                {goal}
              </span>
            ))}
            {capsule.currentGoals.length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-500 dark:text-[#EBDDBF]/60">
                +{capsule.currentGoals.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      <button className="text-sm text-[#7A916C] dark:text-[#d4a574] hover:text-[#6c7a5b] 
                       dark:hover:text-[#EBDDBF] font-medium">
        View Full Message →
      </button>
    </div>
  );
};

// Capsule Detail Modal Component
const CapsuleDetailModal = ({ capsule, onClose, theme }) => {
  const [currentMood, setCurrentMood] = useState(null);
  const [achievedGoals, setAchievedGoals] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

  // Calculate mood change
  const getMoodChange = () => {
    if (!currentMood || !capsule.currentMood) return null;
    const change = currentMood - capsule.currentMood;
    if (change > 0) return { type: 'improved', value: change };
    if (change < 0) return { type: 'declined', value: Math.abs(change) };
    return { type: 'stable', value: 0 };
  };

  const handleSetCurrentMood = (mood) => {
    setCurrentMood(mood);
    setShowComparison(true);
  };

  const toggleGoalAchieved = (goalIndex) => {
    if (achievedGoals.includes(goalIndex)) {
      setAchievedGoals(achievedGoals.filter(i => i !== goalIndex));
    } else {
      setAchievedGoals([...achievedGoals, goalIndex]);
    }
  };

  const moodChange = getMoodChange();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] 
                    overflow-y-auto shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className={`text-2xl font-bold text-gray-800 dark:text-white mb-2 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
                Message from the Past ✨
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Written on {new Date(capsule.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                       dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Message */}
          <div className="mb-6 p-6 bg-gradient-to-br from-[#d4a574]/10 to-[#EBDDBF]/10 
                        dark:from-[#5b4a3d]/30 dark:to-[#3a2e20]/30 rounded-lg 
                        border-2 border-[#d4a574]/30 dark:border-[#5b4a3d]">
            <p className={`text-gray-800 dark:text-[#EBDDBF] whitespace-pre-wrap leading-relaxed ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              {capsule.message}
            </p>
          </div>

          {/* Mood Comparison */}
          {capsule.currentMood && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Mood Comparison
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Past Mood */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Then</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{moodEmojis[capsule.currentMood - 1]}</span>
                    <div>
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {capsule.currentMood}/5
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {moodLabels[capsule.currentMood - 1]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Mood */}
                <div className="p-4 bg-[#7A916C]/10 dark:bg-[#5b4a3d]/30 rounded-lg border-2 
                              border-[#7A916C]/30 dark:border-[#5b4a3d]">
                  <p className="text-xs text-gray-500 dark:text-[#EBDDBF]/60 mb-2">Now</p>
                  {currentMood ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{moodEmojis[currentMood - 1]}</span>
                      <div>
                        <div className="text-lg font-semibold text-gray-700 dark:text-[#EBDDBF]">
                          {currentMood}/5
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#EBDDBF]/70">
                          {moodLabels[currentMood - 1]}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-[#EBDDBF]/70 italic">
                      Set your current mood below
                    </p>
                  )}
                </div>
              </div>

              {/* Mood Change Indicator */}
              {showComparison && moodChange && (
                <div className={`p-3 rounded-lg border-2 ${
                  moodChange.type === 'improved' 
                    ? 'bg-[#7A916C]/10 dark:bg-[#5b4a3d]/30 border-[#7A916C]/30 dark:border-[#5b4a3d]'
                    : moodChange.type === 'declined'
                    ? 'bg-[#d4a574]/10 dark:bg-[#5b4a3d]/20 border-[#d4a574]/30 dark:border-[#5b4a3d]/50'
                    : 'bg-[#cdd6c0]/20 dark:bg-[#3a2e20]/30 border-[#cdd6c0]/40 dark:border-[#5b4a3d]'
                }`}>
                  <p className={`text-sm font-medium ${
                    moodChange.type === 'improved' 
                      ? 'text-[#7A916C] dark:text-[#d4a574]'
                      : moodChange.type === 'declined'
                      ? 'text-[#8b6f47] dark:text-[#EBDDBF]'
                      : 'text-[#6B7A59] dark:text-[#EBDDBF]'
                  }`}>
                    {moodChange.type === 'improved' && `🎉 Your mood has improved by ${moodChange.value} point${moodChange.value > 1 ? 's' : ''}!`}
                    {moodChange.type === 'declined' && `Your mood has changed by ${moodChange.value} point${moodChange.value > 1 ? 's' : ''}`}
                    {moodChange.type === 'stable' && `Your mood has remained stable`}
                  </p>
                </div>
              )}

              {/* Current Mood Selector */}
              {!currentMood && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/80 mb-2">
                    How are you feeling now?
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((mood) => (
                      <button
                        key={mood}
                        onClick={() => handleSetCurrentMood(mood)}
                        className="flex-1 py-2 px-1 rounded-lg border-2 border-gray-300 
                                 dark:border-[#5b4a3d] hover:border-[#7A916C] 
                                 dark:hover:border-[#d4a574] transition-all hover:scale-105"
                      >
                        <div className="text-xl">{moodEmojis[mood - 1]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Goals Comparison */}
          {capsule.currentGoals && capsule.currentGoals.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Goals Progress
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Check off the goals you've achieved since writing this capsule
              </p>
              <ul className="space-y-2">
                {capsule.currentGoals.map((goal, idx) => (
                  <li 
                    key={idx} 
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer 
                              transition-all ${
                      achievedGoals.includes(idx)
                        ? 'bg-[#7A916C]/10 dark:bg-[#5b4a3d]/30 border-2 border-[#7A916C]/30 dark:border-[#5b4a3d]'
                        : 'bg-gray-50 dark:bg-[#3a2e20]/30 border-2 border-transparent hover:border-gray-300 dark:hover:border-[#5b4a3d]'
                    }`}
                    onClick={() => toggleGoalAchieved(idx)}
                  >
                    <input
                      type="checkbox"
                      checked={achievedGoals.includes(idx)}
                      onChange={() => toggleGoalAchieved(idx)}
                      className="mt-1 w-4 h-4 text-[#7A916C] rounded focus:ring-[#7A916C]"
                    />
                    <span className={`flex-1 ${
                      achievedGoals.includes(idx)
                        ? 'text-[#7A916C] dark:text-[#d4a574] line-through'
                        : 'text-gray-700 dark:text-[#EBDDBF]'
                    }`}>
                      {goal}
                    </span>
                    {achievedGoals.includes(idx) && (
                      <span className="text-[#7A916C] dark:text-[#d4a574]">✓</span>
                    )}
                  </li>
                ))}
              </ul>
              
              {achievedGoals.length > 0 && (
                <div className="mt-3 p-3 bg-[#7A916C]/10 dark:bg-[#5b4a3d]/30 rounded-lg border 
                              border-[#7A916C]/30 dark:border-[#5b4a3d]">
                  <p className="text-sm text-[#7A916C] dark:text-[#d4a574] font-medium">
                    🎉 You've achieved {achievedGoals.length} out of {capsule.currentGoals.length} goals!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reflection prompt */}
          <div className="p-4 bg-[#7A916C]/10 dark:bg-[#5b4a3d]/30 rounded-lg border 
                        border-[#7A916C]/30 dark:border-[#5b4a3d]">
            <p className="text-sm text-[#6c7a5b] dark:text-[#EBDDBF] italic">
              💭 Take a moment to reflect: How have you grown since writing this? 
              What progress have you made on your goals?
            </p>
          </div>

          {/* Close button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#7A916C] dark:bg-[#5b4a3d] text-white rounded-lg 
                       hover:bg-[#6c7a5b] dark:hover:bg-[#6d5a4a] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeCapsuleUI;
