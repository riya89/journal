import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';
import { API_BASE_URL } from '../config/api';

/**
 * XPBar Component
 * Displays user's current level, XP progress, and progress to next level
 * Features smooth animations and theme-aware styling
 */
export default function XPBar({ theme }) {
  const [xpData, setXpData] = useState({
    totalXP: 0,
    currentLevel: 1,
    xpForNextLevel: 100,
    xpProgress: 0,
    levelUpThreshold: 100
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    fetchXPData();
  }, []);

  const fetchXPData = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`${API_BASE_URL}/user/xp`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch XP data');
      }

      const data = await response.json();
      setXpData(data);
      
      // Animate progress bar
      setTimeout(() => {
        const progress = (data.xpProgress / data.xpForNextLevel) * 100;
        setProgressWidth(Math.min(progress, 100));
      }, 100);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching XP data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate XP needed for next level
  const xpNeeded = xpData.xpForNextLevel - xpData.xpProgress;

  if (loading) {
    return (
      <div className={`xp-bar-container flex items-center gap-3 px-4 py-2 rounded-xl ${
        theme === 'dark' 
          ? 'bg-[#3a2e20] border border-[#5b4a3d]' 
          : 'bg-[#F3EFE2] border border-[#cdd6c0]'
      }`}>
        <div className="animate-pulse flex items-center gap-3 w-full">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex-1 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`xp-bar-container px-4 py-2 rounded-xl text-sm ${
        theme === 'dark' 
          ? 'bg-[#3a2e20] border border-[#5b4a3d] text-[#EBDDBF] font-gothic-body' 
          : 'bg-[#F3EFE2] border border-[#cdd6c0] text-[#6c7a5b]'
      }`}>
        <span className="opacity-70">Unable to load XP</span>
      </div>
    );
  }

  return (
    <div className={`xp-bar-container flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      theme === 'dark' 
        ? 'bg-[#3a2e20] border border-[#5b4a3d]' 
        : 'bg-[#F3EFE2] border border-[#cdd6c0]'
    }`}>
      {/* Level Badge */}
      <div className={`level-badge flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm shadow-md ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#5b4a3d] to-[#3a2e20] text-[#EBDDBF] border-2 border-[#EBDDBF]/30 font-gothic-body'
          : 'bg-gradient-to-br from-[#7A916C] to-[#94A786] text-white border-2 border-white/50'
      }`}>
        <span>Lv {xpData.currentLevel}</span>
      </div>

      {/* XP Progress Bar */}
      <div className="flex-1 flex flex-col gap-1">
        <div className={`xp-bar relative h-6 rounded-full overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#2b241c]'
            : 'bg-white/60'
        }`}>
          {/* Progress Fill */}
          <div 
            className={`xp-progress absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-[#7A916C] to-[#94A786]'
                : 'bg-gradient-to-r from-[#7A916C] to-[#94A786]'
            }`}
            style={{ width: `${progressWidth}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>

          {/* XP Text */}
          <div className={`xp-text absolute inset-0 flex items-center justify-center text-xs font-semibold ${
            theme === 'dark' ? 'text-[#EBDDBF] font-gothic-body' : 'text-[#6c7a5b]'
          }`}>
            <span className="drop-shadow-sm">
              {xpData.xpProgress} / {xpData.xpForNextLevel} XP
            </span>
          </div>
        </div>

        {/* Next Level Info */}
        <div className={`text-xs text-center opacity-70 ${
          theme === 'dark' ? 'text-[#EBDDBF] font-gothic-body' : 'text-[#6c7a5b]'
        }`}>
          {xpNeeded > 0 ? `${xpNeeded} XP to level ${xpData.currentLevel + 1}` : 'Max level!'}
        </div>
      </div>
    </div>
  );
}
