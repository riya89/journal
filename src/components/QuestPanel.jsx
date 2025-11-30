import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '../utils/api';
import { checkAndRotateQuests } from '../utils/questExpiration';
import QuestCard from './QuestCard';

/**
 * QuestPanel Component
 * Displays daily, weekly, and monthly quests with tabs
 * Integrates with quest API endpoints
 */
export default function QuestPanel({ theme, userId, compact = false }) {
  const [quests, setQuests] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all quests (including completed ones for today)
      const response = await apiGet(`http://localhost:8000/journal/quests/all?uid=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quests');
      }

      const data = await response.json();
      
      // Sort quests: incomplete first, then completed
      const sortQuests = (questList) => {
        return [...questList].sort((a, b) => {
          const aCompleted = a.status === 'completed' || (a.progress >= a.target);
          const bCompleted = b.status === 'completed' || (b.progress >= b.target);
          if (aCompleted === bCompleted) return 0;
          return aCompleted ? 1 : -1; // Incomplete quests first
        });
      };
      
      setQuests({
        daily: sortQuests(data.daily || []),
        weekly: sortQuests(data.weekly || []),
        monthly: sortQuests(data.monthly || [])
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchQuests();
    }
  }, [userId, fetchQuests]);

  // Check for expired quests periodically (every 5 minutes)
  useEffect(() => {
    if (!userId) return;

    const checkExpiration = async () => {
      const result = await checkAndRotateQuests(userId);
      if (result.success && result.expiredCount > 0) {
        // Refresh quests if any were expired
        fetchQuests();
      }
    };

    // Check immediately on mount
    checkExpiration();

    // Set up periodic check every 5 minutes
    const intervalId = setInterval(checkExpiration, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [userId, fetchQuests]);

  const handleQuestComplete = (questId) => {
    // Refresh quests after completion
    fetchQuests();
  };

  const activeQuests = quests[activeTab] || [];
  const questCount = {
    daily: quests.daily.length,
    weekly: quests.weekly.length,
    monthly: quests.monthly.length
  };

  if (loading) {
    return (
      <div className={`quest-panel rounded-xl p-6 ${
        theme === 'dark'
          ? 'bg-[#3a2e20] border border-[#5b4a3d]'
          : 'bg-[#F3EFE2] border border-[#cdd6c0]'
      }`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`quest-panel rounded-xl p-6 ${
        theme === 'dark'
          ? 'bg-[#3a2e20] border border-[#5b4a3d]'
          : 'bg-[#F3EFE2] border border-[#cdd6c0]'
      }`}>
        <div className={`text-center py-8 ${
          theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
        }`}>
          <p className="text-sm opacity-70">Unable to load quests</p>
          <button
            onClick={fetchQuests}
            className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              theme === 'dark'
                ? 'bg-[#5b4a3d] hover:bg-[#6b5a4d] text-[#EBDDBF]'
                : 'bg-[#7A916C] hover:bg-[#6c7a5b] text-white'
            }`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`quest-panel rounded-xl overflow-hidden ${
      theme === 'dark'
        ? 'bg-[#3a2e20] border border-[#5b4a3d]'
        : 'bg-[#F3EFE2] border border-[#cdd6c0]'
    }`}>
      {/* Header */}
      {!compact && (
        <div className="p-6 pb-4">
          <h3 className={`text-lg font-bold mb-1 ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            Quests
          </h3>
          <p className={`text-xs opacity-70 ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            Complete challenges to earn XP and level up
          </p>
        </div>
      )}
      
      {compact && (
        <div className="px-3 pt-2 pb-1">
          <h3 className={`text-sm font-bold ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            Quests
          </h3>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex border-b ${
        theme === 'dark' ? 'border-[#5b4a3d]' : 'border-[#cdd6c0]'
      }`}>
        {['daily', 'weekly', 'monthly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-semibold capitalize transition-all relative ${
              activeTab === tab
                ? theme === 'dark'
                  ? 'text-[#EBDDBF] bg-[#2b241c]'
                  : 'text-[#6c7a5b] bg-white/60'
                : theme === 'dark'
                  ? 'text-[#EBDDBF]/60 hover:text-[#EBDDBF]/80'
                  : 'text-[#6c7a5b]/60 hover:text-[#6c7a5b]/80'
            }`}
          >
            {tab}
            {questCount[tab] > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab
                  ? theme === 'dark'
                    ? 'bg-[#7A916C] text-white'
                    : 'bg-[#7A916C] text-white'
                  : theme === 'dark'
                    ? 'bg-[#5b4a3d] text-[#EBDDBF]'
                    : 'bg-[#cdd6c0] text-[#6c7a5b]'
              }`}>
                {questCount[tab]}
              </span>
            )}
            {/* Active tab indicator */}
            {activeTab === tab && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                theme === 'dark' ? 'bg-[#7A916C]' : 'bg-[#7A916C]'
              }`}></div>
            )}
          </button>
        ))}
      </div>

      {/* Quest List */}
      <div className={`${compact ? 'p-3 space-y-2 max-h-[300px]' : 'p-6 space-y-3 max-h-[500px]'} overflow-y-auto`}>
        {activeQuests.length === 0 ? (
          <div className={`text-center ${compact ? 'py-6' : 'py-12'} ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            <div className={`${compact ? 'text-2xl mb-2' : 'text-4xl mb-3'}`}>✨</div>
            <p className={`${compact ? 'text-xs' : 'text-sm'} opacity-70`}>
              No {activeTab} quests available
            </p>
            {!compact && (
              <p className="text-xs opacity-50 mt-1">
                Check back soon for new challenges!
              </p>
            )}
          </div>
        ) : (
          activeQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              theme={theme}
              onComplete={handleQuestComplete}
              compact={compact}
            />
          ))
        )}
      </div>
    </div>
  );
}
