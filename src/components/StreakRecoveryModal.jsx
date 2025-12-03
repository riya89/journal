import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StreakRecoveryModal({ message, onStartJournaling, onClose, theme }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-md rounded-2xl shadow-2xl p-8 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#3a2f1f] to-[#2e261f] border-2 border-[#5b4a3d]/40'
              : 'bg-gradient-to-br from-[#f0f4f0] to-[#e8f0e8] border-2 border-[#a8c5a0]/50'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 text-2xl transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Close"
          >
            ✖
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-6xl"
            >
              💙
            </motion.div>
          </div>

          {/* Title */}
          <h2
            className={`text-2xl font-bold text-center mb-4 ${
              theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#2d5016]'
            }`}
          >
            {message.title}
          </h2>

          {/* Body text */}
          <p
            className={`text-center mb-6 leading-relaxed ${
              theme === 'dark' ? 'text-[#EBDDBF]/80' : 'text-[#3d6b2a]/80'
            }`}
          >
            {message.body}
          </p>

          {/* Previous achievement highlight */}
          {message.previousStreak > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`mb-6 p-6 rounded-xl text-center ${
                theme === 'dark'
                  ? 'bg-[#4a3a28]/50 border border-[#5b4a3d]/30'
                  : 'bg-white/60 border border-[#a8c5a0]/50'
              }`}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-4xl">🔥</span>
                <div
                  className={`text-5xl font-bold ${
                    theme === 'dark'
                      ? 'text-amber-400'
                      : 'text-[#5a8c3f]'
                  }`}
                >
                  {message.previousStreak}
                </div>
                <span
                  className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#2d5016]'
                  }`}
                >
                  {message.previousStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-[#EBDDBF]/70' : 'text-[#4a7a32]/70'
                }`}
              >
                {message.encouragement}
              </p>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartJournaling}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg shadow-lg transition-all ${
                theme === 'dark'
                  ? 'bg-[#5b4a3d] text-[#EBDDBF] hover:bg-[#6b5a4d] hover:shadow-[0_0_20px_rgba(235,221,191,0.2)]'
                  : 'bg-[#5a8c3f] text-white hover:bg-[#4a7a32] hover:shadow-[#a8c5a0]/50'
              }`}
            >
              Start Writing ✨
            </motion.button>

            <button
              onClick={onClose}
              className={`w-full py-2 px-6 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-[#EBDDBF]/60 hover:text-[#EBDDBF] hover:bg-[#3a2e20]/30'
                  : 'text-[#5a8c3f]/60 hover:text-[#5a8c3f] hover:bg-[#e8f0e8]/30'
              }`}
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
