import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ghost1 from '../assets/ghost1.png';
import cute from '../assets/cute.png';
import introDark from '../assets/intro_dark.mp3';
import introLight from '../assets/intro_light.mp3';
import Fireflies from './Fireflies';

export default function WelcomeModal({ theme, onComplete }) {
  const [showModal, setShowModal] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const audioRef = useRef(null);

  const welcomeMessage = theme === 'dark' 
    ? "Welcome, brave soul... to your haunted journal. Here, your thoughts echo through the shadows, and every word you write becomes part of the darkness. Are you ready to begin your eerie journey?"
    : "Welcome, dear friend... to your peaceful sanctuary. Here, your thoughts bloom like flowers in a garden, and every word you write becomes a seed of growth. Are you ready to begin your journey?";

  const audioSrc = theme === 'dark' ? introDark : introLight;
  const characterImage = theme === 'dark' ? ghost1 : cute;

  // Streaming text effect
  useEffect(() => {
    if (!showModal) return;

    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex <= welcomeMessage.length) {
        setDisplayedText(welcomeMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        // Show button after text finishes streaming
        setTimeout(() => setShowButton(true), 500);
      }
    }, theme === 'dark' ? 100 : 75); // Dark theme slower (100ms), light theme faster (75ms)

    return () => clearInterval(streamInterval);
  }, [showModal, welcomeMessage, theme]);

  // Play audio
  useEffect(() => {
    if (showModal && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('Audio autoplay prevented:', err);
      });
    }
  }, [showModal]);

  const handleContinue = () => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setShowModal(false);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle at center, rgba(26, 20, 16, 0.95) 0%, rgba(10, 8, 6, 0.98) 100%)'
              : 'radial-gradient(circle at center, rgba(255, 251, 234, 0.95) 0%, rgba(230, 240, 209, 0.98) 100%)',
          }}
        >
          {/* Audio */}
          <audio ref={audioRef} src={audioSrc} />
          
          {/* Fireflies */}
          <Fireflies theme={theme} />

          {/* Container for character and speech bubble */}
          <div className="relative flex items-center justify-center -space-x-4 md:-space-x-6">
            {/* Floating Character - Outside the box */}
            <motion.div
              initial={{ x: -100, opacity: 0, scale: 0.8 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                scale: 1,
                y: [0, -15, 0],
              }}
              transition={{
                x: { duration: 0.8 },
                opacity: { duration: 0.8 },
                scale: { duration: 0.8 },
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.8,
                },
              }}
              className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0"
            >
              <img
                src={characterImage}
                alt={theme === 'dark' ? 'ghost' : 'cute character'}
                className={`w-full h-full object-contain ${
                  theme === 'dark' 
                    ? 'drop-shadow-[0_0_30px_rgba(235,221,191,0.4)]' 
                    : 'drop-shadow-[0_0_20px_rgba(122,145,108,0.3)]'
                }`}
              />
            </motion.div>

            {/* Speech Bubble */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'backOut', delay: 0.3 }}
              className="relative"
            >
              {/* Speech bubble tail pointing to character */}
              <div 
                className={`absolute left-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 ${
                  theme === 'dark'
                    ? 'border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[20px] border-r-[#2b241c]/90'
                    : 'border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[20px] border-r-white/90'
                }`}
              />

              {/* Speech bubble box */}
              <div
                className={`w-80 md:w-96 rounded-3xl shadow-2xl p-5 md:p-6 ${
                  theme === 'dark'
                    ? 'bg-[#2b241c]/90 border-2 border-[#5b4a3d]/40'
                    : 'bg-white/90 border-2 border-[#7A916C]/30'
                }`}
              >
                {/* Streaming text */}
                <p
                  className={`text-sm md:text-base leading-relaxed mb-5 font-['Shantell_Sans'] h-32 ${
                    theme === 'dark'
                      ? 'text-[#EBDDBF]/90'
                      : 'text-[#6c7a5b]'
                  }`}
                >
                  {displayedText}
                  {displayedText.length < welcomeMessage.length && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1 h-5 ml-1 bg-current"
                    />
                  )}
                </p>

                {/* Continue Button */}
                <AnimatePresence>
                  {showButton && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      className={`w-full px-6 py-3 rounded-full font-semibold text-base shadow-lg transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-[#3a2e20] text-[#EBDDBF] border-2 border-[#5b4a3d] hover:bg-[#4a3a28] hover:shadow-[0_0_20px_rgba(235,221,191,0.2)]'
                          : 'bg-[#7A916C] text-white border-2 border-[#6c7a5b] hover:bg-[#6c7a5b] hover:shadow-[0_0_15px_rgba(122,145,108,0.3)]'
                      }`}
                    >
                      {theme === 'dark' ? 'Enter the Shadows 🌙' : 'Begin Your Journey 🌿'}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
