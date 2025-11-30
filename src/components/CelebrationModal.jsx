import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function CelebrationModal({ stats, reward, onClose, onShare }) {
  useEffect(() => {
    // Trigger confetti animation when modal opens
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
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
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#3a2f1f] dark:to-[#2e261f] p-8 rounded-xl shadow-2xl relative w-[90%] max-w-md border-2 border-amber-200 dark:border-amber-900">
        <button 
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" 
          onClick={onClose}
        >
          ✖
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            You crushed it today! 🎉
          </h2>
          <p className="text-amber-700 dark:text-amber-300 mb-6">
            All tasks completed!
          </p>

          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-6 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Tasks Completed:</span>
              <span className="font-bold text-amber-900 dark:text-amber-100 text-xl">
                {stats.tasksCompleted}
              </span>
            </div>
            
            {stats.totalTime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Time Invested:</span>
                <span className="font-bold text-amber-900 dark:text-amber-100 text-xl">
                  {stats.totalTime}
                </span>
              </div>
            )}
            
            {stats.streakDays !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Current Streak:</span>
                <span className="font-bold text-amber-900 dark:text-amber-100 text-xl">
                  {stats.streakDays} {stats.streakDays === 1 ? 'day' : 'days'} 🔥
                </span>
              </div>
            )}
          </div>

          {reward && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700">
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                New Achievement Unlocked!
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">{reward.icon || '⭐'}</span>
                <div className="text-left">
                  <p className="font-bold text-purple-900 dark:text-purple-100">
                    {reward.name}
                  </p>
                  <p className={`text-xs uppercase tracking-wide ${
                    reward.rarity === 'legendary' ? 'text-yellow-600 dark:text-yellow-400' :
                    reward.rarity === 'rare' ? 'text-purple-600 dark:text-purple-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {reward.rarity}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              Continue
            </button>
            
            {onShare && (
              <button
                onClick={onShare}
                className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-900 dark:text-amber-100 font-semibold py-3 px-6 rounded-lg transition-colors shadow-md border-2 border-amber-600"
              >
                Share 🎊
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
