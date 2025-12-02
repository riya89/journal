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
      <div className="bg-gradient-to-br from-[#f5f1e8] to-[#e8dfc8] dark:from-[#2b241c] dark:to-[#1f1a13] p-8 rounded-xl shadow-2xl relative w-[90%] max-w-md border-2 border-[#7A916C]/30 dark:border-[#EBDDBF]/20">
        <button 
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" 
          onClick={onClose}
        >
          ✖
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#7A916C] dark:text-[#EBDDBF] mb-2">
            You crushed it today! 🎉
          </h2>
          <p className="text-[#7A916C]/80 dark:text-[#EBDDBF]/80 mb-6">
            All tasks completed!
          </p>

          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-6 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-[#EBDDBF]/70">Tasks Completed:</span>
              <span className="font-bold text-[#7A916C] dark:text-[#EBDDBF] text-xl">
                {stats.tasksCompleted}
              </span>
            </div>
            
            {stats.totalTime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-[#EBDDBF]/70">Time Invested:</span>
                <span className="font-bold text-[#7A916C] dark:text-[#EBDDBF] text-xl">
                  {stats.totalTime}
                </span>
              </div>
            )}
          </div>

          {reward && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#7A916C]/10 to-[#7A916C]/20 dark:from-[#EBDDBF]/10 dark:to-[#EBDDBF]/20 rounded-lg border-2 border-[#7A916C]/30 dark:border-[#EBDDBF]/30">
              <p className="text-sm text-[#7A916C] dark:text-[#EBDDBF]/80 mb-2">
                New Achievement Unlocked!
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">{reward.icon || '⭐'}</span>
                <div className="text-left">
                  <p className="font-bold text-[#7A916C] dark:text-[#EBDDBF]">
                    {reward.name}
                  </p>
                  <p className={`text-xs uppercase tracking-wide ${
                    reward.rarity === 'legendary' ? 'text-yellow-600 dark:text-yellow-400' :
                    reward.rarity === 'rare' ? 'text-[#7A916C] dark:text-[#EBDDBF]/70' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {reward.rarity}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-[#7A916C] hover:bg-[#6a8160] dark:bg-[#EBDDBF] dark:hover:bg-[#EBDDBF]/90 text-white dark:text-[#2b241c] font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
