import { useState } from 'react';
import { BADGE_DEFINITIONS, BADGE_RARITIES } from '../constants/badges';

export default function BadgeGallery({ earnedBadges = [], theme = 'light', compact = false }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [filter, setFilter] = useState('all');

  const categoryNames = {
    perfect_day: 'Perfect Days',
    quest_completion: 'Quest Master',
    level: 'Level Achievements',
    streak: 'Streak Achievements',
    special: 'Special Badges'
  };

  // Group badges by category
  const badgesByCategory = BADGE_DEFINITIONS.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {});

  // Filter badges based on selected filter
  const filteredCategories = Object.entries(badgesByCategory).reduce((acc, [category, badges]) => {
    const filteredBadges = badges.filter(badge => {
      const isEarned = earnedBadges.includes(badge.id);
      if (filter === 'earned') return isEarned;
      if (filter === 'locked') return !isEarned;
      return true; // 'all'
    });
    
    if (filteredBadges.length > 0) {
      acc[category] = filteredBadges;
    }
    return acc;
  }, {});

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case BADGE_RARITIES.LEGENDARY:
        return theme === 'dark' 
          ? 'from-yellow-600/30 to-orange-600/30 border-yellow-500/50'
          : 'from-yellow-100 to-orange-100 border-yellow-400';
      case BADGE_RARITIES.RARE:
        return theme === 'dark'
          ? 'from-purple-600/30 to-pink-600/30 border-purple-500/50'
          : 'from-purple-100 to-pink-100 border-purple-400';
      case BADGE_RARITIES.COMMON:
      default:
        return theme === 'dark'
          ? 'from-gray-700/30 to-gray-600/30 border-gray-500/50'
          : 'from-gray-100 to-gray-200 border-gray-300';
    }
  };

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case BADGE_RARITIES.LEGENDARY:
        return 'text-yellow-600 dark:text-yellow-400';
      case BADGE_RARITIES.RARE:
        return 'text-purple-600 dark:text-purple-400';
      case BADGE_RARITIES.COMMON:
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Compact mode for dashboard
  if (compact) {
    return (
      <div className="badge-gallery-compact w-full">
        <div className="grid grid-cols-6 gap-1.5">
          {BADGE_DEFINITIONS.slice(0, 12).map(badge => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`
                  rounded-lg p-1.5 text-center cursor-pointer
                  transition-all hover:scale-110
                  ${isEarned ? '' : 'opacity-40'}
                  ${theme === 'dark' 
                    ? 'bg-[#2b241c]/50 hover:bg-[#3a2e20]/70' 
                    : 'bg-white/60 hover:bg-white/90'
                  }
                  ${isEarned ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} border` : ''}
                `}
              >
                <div className={`text-xl ${isEarned ? '' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                {!isEarned && <div className="text-[8px] mt-0.5">🔒</div>}
              </div>
            );
          })}
        </div>

        {/* Badge Detail Modal */}
        {selectedBadge && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <div 
              className={`
                rounded-xl p-6 max-w-md w-full shadow-2xl
                ${theme === 'dark' ? 'bg-[#2b241c]' : 'bg-white'}
                bg-gradient-to-br ${getRarityColor(selectedBadge.rarity)}
                border-2
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`text-6xl mb-4 ${
                  earnedBadges.includes(selectedBadge.id) ? '' : 'grayscale'
                }`}>
                  {selectedBadge.icon}
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' 
                    ? 'text-[#EBDDBF] font-spooky-header' 
                    : 'text-gray-800'
                }`}>
                  {selectedBadge.name}
                </h3>
                
                <p className={`text-sm uppercase tracking-wide font-medium mb-4 ${
                  getRarityTextColor(selectedBadge.rarity)
                }`}>
                  {selectedBadge.rarity}
                </p>
                
                <p className={`text-sm mb-4 ${
                  theme === 'dark' ? 'text-[#EBDDBF]/80' : 'text-gray-600'
                }`}>
                  {selectedBadge.description}
                </p>
                
                <div className={`
                  rounded-lg p-3 mb-4
                  ${theme === 'dark' ? 'bg-black/20' : 'bg-white/50'}
                `}>
                  <p className={`text-xs uppercase tracking-wide mb-1 ${
                    theme === 'dark' ? 'text-[#EBDDBF]/60' : 'text-gray-500'
                  }`}>
                    {earnedBadges.includes(selectedBadge.id) ? 'Unlocked' : 'Unlock Requirement'}
                  </p>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-[#EBDDBF]' : 'text-gray-800'
                  }`}>
                    {selectedBadge.requirement}
                  </p>
                </div>
                
                {earnedBadges.includes(selectedBadge.id) ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <span className="text-xl">✓</span>
                    <span className="font-semibold">Earned</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="text-xl">🔒</span>
                    <span className="font-semibold">Locked</span>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedBadge(null)}
                  className={`
                    mt-6 w-full py-2 px-4 rounded-lg font-medium transition-colors
                    ${theme === 'dark'
                      ? 'bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90'
                      : 'bg-[#7A916C] text-white hover:bg-[#6a8160]'
                    }
                  `}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full gallery mode
  return (
    <div className="badge-gallery w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-3 flex-shrink-0">
        <h3 className={`text-xl font-bold mb-1 ${
          theme === 'dark' 
            ? 'text-[#EBDDBF] font-spooky-header' 
            : 'text-[#7A916C]'
        }`}>
          Your Achievements
        </h3>
        <p className={`text-xs ${
          theme === 'dark' ? 'text-[#EBDDBF]/70' : 'text-gray-600'
        }`}>
          {earnedBadges.length} of {BADGE_DEFINITIONS.length} badges earned
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-3 flex-shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'all'
              ? theme === 'dark'
                ? 'bg-[#EBDDBF] text-[#2b241c]'
                : 'bg-[#7A916C] text-white'
              : theme === 'dark'
                ? 'bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3e30]'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({BADGE_DEFINITIONS.length})
        </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'earned'
              ? theme === 'dark'
                ? 'bg-[#EBDDBF] text-[#2b241c]'
                : 'bg-[#7A916C] text-white'
              : theme === 'dark'
                ? 'bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3e30]'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Earned ({earnedBadges.length})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'locked'
              ? theme === 'dark'
                ? 'bg-[#EBDDBF] text-[#2b241c]'
                : 'bg-[#7A916C] text-white'
              : theme === 'dark'
                ? 'bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3e30]'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Locked ({BADGE_DEFINITIONS.length - earnedBadges.length})
        </button>
      </div>

      {/* Badge Grid by Category - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {Object.entries(filteredCategories).map(([category, badges]) => (
          <div key={category}>
            <h4 className={`text-sm font-semibold mb-2 ${
              theme === 'dark' 
                ? 'text-[#EBDDBF] font-gothic-body' 
                : 'text-[#7A916C]'
            }`}>
              {categoryNames[category] || category}
            </h4>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {badges.map(badge => {
                const isEarned = earnedBadges.includes(badge.id);
                
                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`
                      badge-card cursor-pointer rounded-lg p-2 
                      border transition-all duration-200
                      ${isEarned ? '' : 'opacity-60'}
                      ${theme === 'dark' 
                        ? 'bg-[#2b241c] hover:bg-[#3a2e20]' 
                        : 'bg-white hover:shadow-md'
                      }
                      ${isEarned 
                        ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}` 
                        : theme === 'dark'
                          ? 'border-gray-700'
                          : 'border-gray-300'
                      }
                      hover:scale-110 hover:shadow-lg hover:z-10
                    `}
                  >
                    {/* Badge Icon */}
                    <div className={`text-2xl text-center ${
                      isEarned ? '' : 'grayscale'
                    }`}>
                      {badge.icon}
                    </div>
                    
                    {/* Badge Name - Hidden on small screens, shown on hover */}
                    <p className={`text-[10px] font-medium text-center mt-1 truncate ${
                      theme === 'dark' ? 'text-[#EBDDBF]' : 'text-gray-800'
                    }`}>
                      {badge.name}
                    </p>
                    
                    {/* Lock Icon for Locked Badges */}
                    {!isEarned && (
                      <div className="text-center text-xs text-gray-400 dark:text-gray-600">
                        🔒
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className={`
              rounded-xl p-6 max-w-md w-full shadow-2xl
              ${theme === 'dark' ? 'bg-[#2b241c]' : 'bg-white'}
              bg-gradient-to-br ${getRarityColor(selectedBadge.rarity)}
              border-2
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Badge Icon */}
              <div className={`text-7xl mb-4 ${
                earnedBadges.includes(selectedBadge.id) ? '' : 'grayscale'
              }`}>
                {selectedBadge.icon}
              </div>
              
              {/* Badge Name */}
              <h3 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' 
                  ? 'text-[#EBDDBF] font-spooky-header' 
                  : 'text-gray-800'
              }`}>
                {selectedBadge.name}
              </h3>
              
              {/* Rarity */}
              <p className={`text-sm uppercase tracking-wide font-medium mb-4 ${
                getRarityTextColor(selectedBadge.rarity)
              }`}>
                {selectedBadge.rarity}
              </p>
              
              {/* Description */}
              <p className={`text-sm mb-4 ${
                theme === 'dark' ? 'text-[#EBDDBF]/80' : 'text-gray-600'
              }`}>
                {selectedBadge.description}
              </p>
              
              {/* Unlock Requirement */}
              <div className={`
                rounded-lg p-3 mb-4
                ${theme === 'dark' ? 'bg-black/20' : 'bg-white/50'}
              `}>
                <p className={`text-xs uppercase tracking-wide mb-1 ${
                  theme === 'dark' ? 'text-[#EBDDBF]/60' : 'text-gray-500'
                }`}>
                  {earnedBadges.includes(selectedBadge.id) ? 'Unlocked' : 'Unlock Requirement'}
                </p>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-[#EBDDBF]' : 'text-gray-800'
                }`}>
                  {selectedBadge.requirement}
                </p>
              </div>
              
              {/* Status */}
              {earnedBadges.includes(selectedBadge.id) ? (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <span className="text-xl">✓</span>
                  <span className="font-semibold">Earned</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                  <span className="text-xl">🔒</span>
                  <span className="font-semibold">Locked</span>
                </div>
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className={`
                  mt-6 w-full py-2 px-4 rounded-lg font-medium transition-colors
                  ${theme === 'dark'
                    ? 'bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90'
                    : 'bg-[#7A916C] text-white hover:bg-[#6a8160]'
                  }
                `}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
