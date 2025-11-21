import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ghost1 from '../assets/ghost1.png';
import cute from '../assets/cute.png';
import avatarDark from '../assets/avatar_dark.mp3';
import avatarLight from '../assets/avatar_light.mp3';
import Fireflies from './Fireflies';

export default function AvatarSelectModal({ theme, onSelect }) {
  const audioRef = useRef(null);
  const characterImage = theme === 'dark' ? ghost1 : cute;
  const audioSrc = theme === 'dark' ? avatarDark : avatarLight;

  const avatarOptions = [
    "https://i.pinimg.com/736x/41/64/bc/4164bc4a4b20c1a14e40137999db2f87.jpg",
    "https://i.pinimg.com/736x/29/86/4e/29864e8539b2c6a086066531a470d02d.jpg",
    "https://i.pinimg.com/1200x/0d/31/8d/0d318d6e06870c332f84998e7cc23aa6.jpg",
    "https://i.pinimg.com/736x/e7/0e/37/e70e37a0816cd9f17876aaaf958309af.jpg",
    "https://i.pinimg.com/736x/85/ea/28/85ea284dfdb7ec7bdbdb9227d4f51271.jpg",
    "https://i.pinimg.com/1200x/84/4a/f8/844af84b8a77b9dc2ca8c5226ba2431f.jpg",
    "https://i.pinimg.com/736x/b2/55/97/b255979be38edf1a8ebfd82f847e9baf.jpg",
    "https://i.pinimg.com/736x/0e/53/f3/0e53f313562880bfa62dccc6ab10b7c8.jpg",
    "https://i.pinimg.com/736x/9f/53/54/9f5354b59fcceb74ad6901369a9095f6.jpg",
    "https://i.pinimg.com/736x/98/05/63/980563de9d8c8b7c72a4035a718ff5d4.jpg",
  ];

  // Play audio on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('Audio autoplay prevented:', err);
      });
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
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

      {/* Container with character and avatar selection */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Floating Character */}
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: 'backOut',
          }}
          className="w-32 h-32 md:w-40 md:h-40"
        >
          <motion.img
            src={characterImage}
            alt={theme === 'dark' ? 'ghost' : 'cute character'}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`w-full h-full object-contain ${
              theme === 'dark' 
                ? 'drop-shadow-[0_0_30px_rgba(235,221,191,0.4)]' 
                : 'drop-shadow-[0_0_20px_rgba(122,145,108,0.3)]'
            }`}
          />
        </motion.div>

        {/* Speech Bubble with "Choose your avatar" */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'backOut' }}
          className={`px-6 py-3 rounded-full shadow-lg ${
            theme === 'dark'
              ? 'bg-[#2b241c]/90 border-2 border-[#5b4a3d]/40 text-[#EBDDBF]'
              : 'bg-white/90 border-2 border-[#7A916C]/30 text-[#6c7a5b]'
          }`}
        >
          <p className="text-base md:text-lg font-['Shantell_Sans'] text-center">
            Choose your avatar to get started
          </p>
        </motion.div>

        {/* Avatar Selection Box */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={`p-6 md:p-8 rounded-3xl shadow-2xl max-w-lg w-full ${
            theme === "dark"
              ? "bg-[#2b241c]/90 border-2 border-[#5b4a3d]/40"
              : "bg-white/90 border-2 border-[#7A916C]/30"
          }`}
        >
          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {avatarOptions.map((url, index) => (
              <motion.img
                key={url}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.6 + (index * 0.05),
                  ease: 'backOut'
                }}
                src={url}
                alt="avatar option"
                onClick={() => onSelect(url)}
                className={`w-full aspect-square rounded-2xl object-cover cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 border-transparent ${
                  theme === 'dark'
                    ? 'hover:border-[#EBDDBF]'
                    : 'hover:border-[#7A916C]'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}