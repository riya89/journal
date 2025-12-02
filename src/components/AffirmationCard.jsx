import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { apiGet } from '../utils/api';
import { API_BASE_URL } from '../config/api';

export default function AffirmationCard({ theme }) {
  const [affirmation, setAffirmation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load affirmation on mount
  useEffect(() => {
    loadAffirmation();
  }, []);

  const loadAffirmation = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      const url = forceRefresh
        ? `${API_BASE_URL}/affirmation/personalized?forceRefresh=true`
        : `${API_BASE_URL}/affirmation/personalized`;

      const response = await apiGet(url);

      if (!response.ok) {
        throw new Error('Failed to fetch affirmation');
      }

      const data = await response.json();
      setAffirmation(data);
    } catch (err) {
      console.error('Error loading affirmation:', err);
      setError(err.message);
      
      // Set fallback affirmation
      setAffirmation({
        affirmation: "You're doing your best, and that's more than enough. Be gentle with yourself today. 🌿",
        basedOn: {
          recentMood: 'unknown',
          themes: ['general'],
          moodTrend: 'stable'
        },
        cached: false
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAffirmation(true);
  };

  // Get mood trend display text
  const getMoodTrendText = () => {
    if (!affirmation?.basedOn) return null;

    const { moodTrend, recentMood } = affirmation.basedOn;

    if (moodTrend === 'improving') {
      return '✨ Your mood has been improving';
    } else if (moodTrend === 'declining') {
      return '🌿 Remember to be gentle with yourself';
    } else if (recentMood === 'positive') {
      return '☀️ You\'ve been feeling good lately';
    } else if (recentMood === 'low') {
      return '💙 You\'re navigating a tough time';
    }

    return null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={`w-full p-6 rounded-2xl shadow-lg transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-[#2e241b] border border-[#4a3a2e]'
            : 'bg-white border border-[#e8ecd9]'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl animate-pulse">✨</div>
          <div className="flex-1 space-y-3">
            <div
              className={`h-4 rounded animate-pulse ${
                theme === 'dark' ? 'bg-[#4a3a2e]' : 'bg-[#e8ecd9]'
              }`}
              style={{ width: '80%' }}
            ></div>
            <div
              className={`h-4 rounded animate-pulse ${
                theme === 'dark' ? 'bg-[#4a3a2e]' : 'bg-[#e8ecd9]'
              }`}
              style={{ width: '60%' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full p-6 rounded-2xl shadow-lg transition-all duration-300 relative ${
        theme === 'dark'
          ? 'bg-[#2e241b] border border-[#4a3a2e] text-[#EBDDBF]'
          : 'bg-white border border-[#e8ecd9] text-[#6c7a5b]'
      }`}
    >
      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
          refreshing ? 'animate-spin' : ''
        } ${
          theme === 'dark'
            ? 'hover:bg-[#4a3a2e] text-[#EBDDBF]/60 hover:text-[#EBDDBF]'
            : 'hover:bg-[#f4f0d8] text-[#6c7a5b]/60 hover:text-[#6c7a5b]'
        }`}
        title="Get a new affirmation"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      <div className="flex items-start gap-4 pr-10">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0">✨</div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Affirmation text */}
          <p
            className={`text-lg leading-relaxed font-medium ${
              theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
            }`}
          >
            {affirmation?.affirmation}
          </p>

          {/* Context hint */}
          {getMoodTrendText() && (
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-[#EBDDBF]/60' : 'text-[#6c7a5b]/60'
              }`}
            >
              {getMoodTrendText()}
            </p>
          )}

          {/* Cached indicator */}
          {affirmation?.cached && (
            <p
              className={`text-xs ${
                theme === 'dark' ? 'text-[#EBDDBF]/40' : 'text-[#6c7a5b]/40'
              }`}
            >
              Today's affirmation
            </p>
          )}

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500">
              Using fallback affirmation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
