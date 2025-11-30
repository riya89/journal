import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { getBadgeById, BADGE_RARITIES } from '../constants/badges';

export default function BadgeUnlockModal({ badgeId, onClose, theme = 'light' }) {
  const [badge, setBadge] = useState(null);

  useEffect(() => {
    // Get badge details
    const badgeData = getBadgeById(badgeId);
    setBadge(badgeData);

    if (!badgeData) return;

    // Trigger confetti animation based on rarity
    const triggerConfetti = () => {
      const colors = {
        [BADGE_RARITIES.LEGENDARY]: ['#FFD700', '#FFA500', '#FF6347'],
        [BADGE_RARITIES.RARE]: ['#9333EA', '#EC4899', '#8B5CF6'],
        [BADGE_RARITIES.COMMON]: ['#6B7280', '#9CA3AF', '#D1D5DB']
      };

      const badgeColors = colors[badgeData.rarity] || colors[BADGE_RARITIES.COMMON];

      // Different confetti patterns based on rarity
      if (badgeData.rarity === BADGE_RARITIES.LEGENDARY) {
        // Epic confetti for legendary badges
        const duration = 4000;
        const animationEnd = Date.now() + duration;
        const defaults = { 
          startVelocity: 30, 
          spread: 360, 
          ticks: 100, 
          zIndex: 100,
          colors: badgeColors
        };

        function randomInRange(min, max) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 75 * (timeLeft / duration);
          
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);

        return () => clearInterval(interval);
      } else if (badgeData.rarity === BADGE_RARITIES.RARE) {
        // Moderate confetti for rare badges
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: badgeColors
        });
        
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: badgeColors
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: badgeColors
          });
        }, 250);
      } else {
        // Simple confetti for common badges
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: badgeColors
        });
      }
    };

    triggerConfetti();
  }, [badgeId]);

  if (!badge) {
    return null;
  }

  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case BADGE_RARITIES.LEGENDARY:
        return theme === 'dark'
          ? 'from-yellow-600/40 via-orange-600/40 to-red-600/40'
          : 'from-yellow-100 via-orange-100 to-red-100';
      case BADGE_RARITIES.RARE:
        return theme === 'dark'
          ? 'from-purple-600/40 via-pink-600/40 to-purple-600/40'
          : 'from-purple-100 via-pink-100 to-purple-100';
      case BADGE_RARITIES.COMMON:
      default:
        return theme === 'dark'
          ? 'from-gray-700/40 via-gray-600/40 to-gray-700/40'
          : 'from-gray-100 via-gray-200 to-gray-100';
    }
  };

  const getRarityBorderColor = (rarity) => {
    switch (rarity) {
      case BADGE_RARITIES.LEGENDARY:
        return 'border-yellow-500';
      case BADGE_RARITIES.RARE:
        return 'border-purple-500';
      case BADGE_RARITIES.COMMON:
      default:
        return 'border-gray-400';
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

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case BADGE_RARITIES.LEGENDARY:
        return 'shadow-[0_0_30px_rgba(255,215,0,0.5)]';
      case BADGE_RARITIES.RARE:
        return 'shadow-[0_0_25px_rgba(147,51,234,0.4)]';
      case BADGE_RARITIES.COMMON:
      default:
        return 'shadow-xl';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`
          rounded-2xl p-8 max-w-md w-full relative
          ${theme === 'dark' ? 'bg-[#2b241c]' : 'bg-white'}
          bg-gradient-to-br ${getRarityGradient(badge.rarity)}
          border-3 ${getRarityBorderColor(badge.rarity)}
          ${getRarityGlow(badge.rarity)}
          animate-scaleIn
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className={`
            absolute top-4 right-4 text-2xl transition-colors
            ${theme === 'dark' 
              ? 'text-[#EBDDBF]/60 hover:text-[#EBDDBF]' 
              : 'text-gray-400 hover:text-gray-600'
            }
          `}
          onClick={onClose}
        >
          ✖
        </button>

        <div className="text-center">
          {/* Achievement Header */}
          <div className="mb-4">
            <p className={`text-sm uppercase tracking-wider font-semibold ${
              theme === 'dark' ? 'text-[#EBDDBF]/80' : 'text-gray-600'
            }`}>
              Achievement Unlocked!
            </p>
          </div>

          {/* Badge Icon with Animation */}
          <div className="mb-6 animate-bounce-slow">
            <div className={`
              text-8xl inline-block p-4 rounded-full
              ${badge.rarity === BADGE_RARITIES.LEGENDARY ? 'animate-pulse' : ''}
            `}>
              {badge.icon}
            </div>
          </div>

          {/* Badge Name */}
          <h2 className={`text-3xl font-bold mb-3 ${
            theme === 'dark' 
              ? 'text-[#EBDDBF] font-spooky-header' 
              : 'text-gray-800'
          }`}>
            {badge.name}
          </h2>

          {/* Rarity Badge */}
          <div className="mb-4">
            <span className={`
              inline-block px-4 py-1 rounded-full text-xs uppercase tracking-wider font-bold
              ${getRarityTextColor(badge.rarity)}
              ${theme === 'dark' ? 'bg-black/30' : 'bg-white/70'}
            `}>
              {badge.rarity}
            </span>
          </div>

          {/* Description */}
          <p className={`text-base mb-6 leading-relaxed ${
            theme === 'dark' ? 'text-[#EBDDBF]/90' : 'text-gray-700'
          }`}>
            {badge.description}
          </p>

          {/* Requirement Met */}
          <div className={`
            rounded-lg p-4 mb-6
            ${theme === 'dark' ? 'bg-black/20' : 'bg-white/60'}
          `}>
            <p className={`text-xs uppercase tracking-wide mb-1 ${
              theme === 'dark' ? 'text-[#EBDDBF]/60' : 'text-gray-500'
            }`}>
              Requirement Met
            </p>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-[#EBDDBF]' : 'text-gray-800'
            }`}>
              {badge.requirement}
            </p>
          </div>

          {/* Congratulations Message */}
          <p className={`text-lg font-semibold mb-6 ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-gray-800'
          }`}>
            🎉 Congratulations! 🎉
          </p>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-lg
              transition-all duration-200 transform hover:scale-105
              ${theme === 'dark'
                ? 'bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90'
                : 'bg-[#7A916C] text-white hover:bg-[#6a8160]'
              }
              shadow-lg hover:shadow-xl
            `}
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}
