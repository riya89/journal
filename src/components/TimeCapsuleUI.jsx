import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost } from '../utils/api';
import CreateCapsuleModal from './CreateCapsuleModal';
import { API_BASE_URL } from '../config/api';

const TimeCapsuleUI = ({ theme }) => {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState({ locked: [], unlocked: [] });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [error, setError] = useState(null);

  const loadCapsules = useCallback(async () => {
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
  }, []); // Empty dependency array - function never changes

  useEffect(() => {
    if (user) {
      loadCapsules();
    }
  }, [user, loadCapsules]);

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
          Time Capsules 
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
                 flex items-center gap-2 font-medium dark:font-gothic-body"
      >
        <span className="text-xl">✨</span>
        Create Time Capsule
      </button>

      {/* Capsules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Locked Capsules */}
        <div className="locked-capsules">
          <h3 className={`text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Locked ({capsules.locked.length})
          </h3>
          
          {capsules.locked.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400 dark:font-gothic-body">
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
              <p className="text-gray-500 dark:text-gray-400 dark:font-gothic-body">
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
          onUpdateCapsule={setSelectedCapsule}
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
          <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/70 dark:font-gothic-body">
            Created: {new Date(capsule.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/70 dark:font-gothic-body">
            Unlocks: {new Date(capsule.unlockDate).toLocaleDateString()}
          </p>
        </div>
        <svg className="w-10 h-10 text-[#7A916C] dark:text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <div className="mb-4">
        <div className="text-2xl font-bold text-[#7A916C] dark:text-[#d4a574] dark:font-gothic-body">
          {getCountdownText(capsule.daysUntilUnlock)}
        </div>
      </div>
      
      <div className="p-4 bg-white/50 dark:bg-black/30 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/80 italic dark:font-gothic-body">
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
          <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/70 dark:font-gothic-body">
            Created: {new Date(capsule.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-[#EBDDBF]/70 dark:font-gothic-body">
            Unlocked: {new Date(capsule.unlockDate).toLocaleDateString()}
          </p>
        </div>
        <div className="text-4xl">✨</div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 dark:text-[#EBDDBF] line-clamp-3 dark:font-gothic-body">
          {capsule.message}
        </p>
      </div>
      
      {capsule.currentGoals && capsule.currentGoals.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-[#EBDDBF]/60 mb-1 dark:font-gothic-body">Goals from the past:</p>
          <div className="flex flex-wrap gap-2">
            {capsule.currentGoals.slice(0, 3).map((goal, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-white/50 dark:bg-black/30 
                                       rounded-full text-gray-600 dark:text-[#EBDDBF]/80 dark:font-gothic-body">
                {goal}
              </span>
            ))}
            {capsule.currentGoals.length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-500 dark:text-[#EBDDBF]/60 dark:font-gothic-body">
                +{capsule.currentGoals.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      <button className="text-sm text-[#7A916C] dark:text-[#d4a574] hover:text-[#6c7a5b] 
                       dark:hover:text-[#EBDDBF] font-medium dark:font-gothic-body">
        View Full Message →
      </button>
    </div>
  );
};

// Capsule Detail Modal Component
const CapsuleDetailModal = ({ capsule, onClose, onUpdateCapsule, theme }) => {
  const [reflection, setReflection] = useState('');
  const [achievedGoals, setAchievedGoals] = useState([]);
  const [showReflection, setShowReflection] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleGoalAchieved = (goalIndex) => {
    if (achievedGoals.includes(goalIndex)) {
      setAchievedGoals(achievedGoals.filter(i => i !== goalIndex));
    } else {
      setAchievedGoals([...achievedGoals, goalIndex]);
    }
  };
  
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

          {/* Self-Reflection Section */}
          <div className="mb-6">
            <div className="p-4 bg-gradient-to-br from-[#7A916C]/10 to-[#94A786]/10 
                          dark:from-[#5b4a3d]/20 dark:to-[#3a2e20]/20 rounded-lg 
                          border-2 border-[#7A916C]/30 dark:border-[#5b4a3d]">
              <p className={`text-sm text-gray-600 dark:text-[#EBDDBF]/80 mb-3 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                💭 <span className="font-semibold">Take a moment to reflect:</span> How have you grown since writing this? What progress have you made on your goals?
              </p>
              
              {/* Success Message */}
              {showSuccess && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                    ✓ Reflection saved! This helps you track your personal growth. 🌱
                  </p>
                </div>
              )}
              
              {/* Saved Reflection or Write Button */}
              {capsule.reflection ? (
                <div className="space-y-3">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-[#7A916C]/30 dark:border-[#5b4a3d]">
                    <p className={`text-gray-700 dark:text-[#EBDDBF] whitespace-pre-wrap ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                      {capsule.reflection}
                    </p>
                    {capsule.reflectedAt && (
                      <p className="text-xs text-gray-500 dark:text-[#EBDDBF]/60 mt-2">
                        Reflected on {new Date(capsule.reflectedAt.toDate ? capsule.reflectedAt.toDate() : capsule.reflectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setReflection(capsule.reflection);
                      setShowReflection(true);
                    }}
                    className="text-sm text-[#7A916C] dark:text-[#d4a574] hover:underline"
                  >
                    Edit Reflection
                  </button>
                </div>
              ) : !showReflection ? (
                <button
                  onClick={() => setShowReflection(true)}
                  className="w-full py-2 px-4 bg-[#7A916C] dark:bg-[#5b4a3d] text-white rounded-lg 
                           hover:bg-[#6c7a5b] dark:hover:bg-[#6d5a4a] transition-colors text-sm font-medium"
                >
                  Write Your Reflection
                </button>
              ) : null}
              
              {/* Textarea for writing/editing */}
              {showReflection && (
                <div className="mt-3">
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Reflect on your journey since writing this capsule..."
                    rows={6}
                    className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-[#7A916C] focus:border-transparent
                             resize-none ${theme === 'dark' ? 'font-gothic-body' : ''}`}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={async () => {
                        if (!reflection.trim()) {
                          return;
                        }
                        
                        try {
                          const response = await apiPost(
                            `${API_BASE_URL}/timecapsule/${capsule.capsuleId}/reflection`,
                            { reflection: reflection.trim() }
                          );
                          
                          if (!response.ok) {
                            throw new Error('Failed to save reflection');
                          }
                          
                          // Update capsule with saved reflection
                          onUpdateCapsule({
                            ...capsule,
                            reflection: reflection.trim(),
                            reflectedAt: new Date()
                          });
                          
                          setShowSuccess(true);
                          setShowReflection(false);
                          setTimeout(() => setShowSuccess(false), 3000);
                          
                        } catch (err) {
                          console.error('Error saving reflection:', err);
                          alert('Failed to save reflection. Please try again.');
                        }
                      }}
                      disabled={!reflection.trim()}
                      className="flex-1 py-2 px-4 bg-[#7A916C] dark:bg-[#5b4a3d] text-white rounded-lg 
                               hover:bg-[#6c7a5b] dark:hover:bg-[#6d5a4a] transition-colors text-sm font-medium
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Reflection
                    </button>
                    <button
                      onClick={() => {
                        setShowReflection(false);
                        setReflection('');
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                               dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

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
