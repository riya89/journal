import { useState, useEffect } from 'react';

/**
 * QuestCard Component
 * Displays individual quest with progress bar and time remaining
 */
export default function QuestCard({ quest, theme, onComplete, compact = false }) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);
  const [prevProgress, setPrevProgress] = useState(quest.progress);

  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!quest.expiresAt) return;
      
      const now = new Date();
      const expires = new Date(quest.expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d ${hours % 24}h left`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m left`);
      } else {
        setTimeRemaining(`${minutes}m left`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [quest.expiresAt]);

  const progressPercentage = quest.target > 0 
    ? Math.min((quest.progress / quest.target) * 100, 100) 
    : 0;

  const isCompleted = quest.status === 'completed' || progressPercentage >= 100;

  // Detect quest completion and trigger animation
  useEffect(() => {
    if (quest.progress > prevProgress && progressPercentage >= 100 && !justCompleted) {
      setJustCompleted(true);
      // Reset animation after 2 seconds
      setTimeout(() => setJustCompleted(false), 2000);
      if (onComplete) {
        onComplete(quest.id);
      }
    }
    setPrevProgress(quest.progress);
  }, [quest.progress, progressPercentage, prevProgress, justCompleted, quest.id, onComplete]);

  return (
    <div className={`quest-card rounded-lg ${compact ? 'p-2' : 'p-4'} transition-all duration-200 relative ${
      isCompleted 
        ? theme === 'dark'
          ? 'bg-[#2d3a2d] border-2 border-[#7A916C]'
          : 'bg-[#e8f5e8] border-2 border-[#7A916C]'
        : theme === 'dark'
          ? 'bg-[#3a2e20] border border-[#5b4a3d]'
          : 'bg-[#F3EFE2] border border-[#cdd6c0]'
    } ${justCompleted ? 'animate-questComplete' : ''}`}>
      {/* Completed Badge (top right corner) */}
      {isCompleted && (
        <div className={`absolute ${compact ? '-top-1 -right-1 w-6 h-6' : '-top-2 -right-2 w-8 h-8'} bg-[#7A916C] text-white rounded-full flex items-center justify-center shadow-lg`}>
          <span className={compact ? 'text-sm' : 'text-lg'}>✓</span>
        </div>
      )}

      {/* Quest Header */}
      <div className={`flex items-start justify-between ${compact ? 'gap-2 mb-2' : 'gap-3 mb-3'}`}>
        <div className="flex-1">
          <h4 className={`font-semibold ${compact ? 'text-xs mb-0.5' : 'text-sm mb-1'} ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            {quest.title}
          </h4>
          {!compact && (
            <p className={`text-xs ${isCompleted ? 'opacity-60' : 'opacity-70'} ${
              theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
            }`}>
              {quest.description}
            </p>
          )}
        </div>
        
        {/* Reward Badge */}
        <div className={`flex items-center gap-1 ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'} rounded-full ${compact ? 'text-[10px]' : 'text-xs'} font-semibold ${
          isCompleted
            ? 'bg-[#7A916C] text-white'
            : theme === 'dark'
              ? 'bg-[#5b4a3d] text-[#EBDDBF]'
              : 'bg-[#7A916C]/70 text-white'
        }`}>
          <span>+{quest.reward?.xp || 0}</span>
          <span className="text-[10px]">XP</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={compact ? 'mb-1' : 'mb-2'}>
        <div className={`relative ${compact ? 'h-3' : 'h-4'} rounded-full overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#2b241c]'
            : 'bg-white/60'
        }`}>
          {/* Progress Fill */}
          <div 
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
              isCompleted
                ? 'bg-gradient-to-r from-[#7A916C] to-[#94A786]'
                : 'bg-gradient-to-r from-[#7A916C]/70 to-[#94A786]/70'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Shine effect */}
            {!isCompleted && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
          </div>

          {/* Progress Text */}
          <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-semibold ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            <span className="drop-shadow-sm">
              {quest.progress} / {quest.target}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Time Remaining & Status */}
      {!compact && (
        <div className="flex items-center justify-between">
          <span className={`text-xs opacity-60 ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            {timeRemaining}
          </span>
          
          {isCompleted && (
            <span className={`text-xs font-semibold ${
              theme === 'dark' ? 'text-[#94A786]' : 'text-[#7A916C]'
            }`}>
              ✓ Completed
            </span>
          )}
        </div>
      )}
      
      {compact && (
        <div className="flex items-center justify-between">
          <span className={`text-[10px] opacity-60 ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            {timeRemaining}
          </span>
          
          {isCompleted && (
            <span className={`text-[10px] font-semibold ${
              theme === 'dark' ? 'text-[#94A786]' : 'text-[#7A916C]'
            }`}>
              ✓ Done
            </span>
          )}
        </div>
      )}
    </div>
  );
}
