import React from 'react';

const TodayOnlyModal = ({ theme, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className={`
          relative max-w-md w-full rounded-2xl shadow-2xl p-6
          ${theme === 'dark' 
            ? 'bg-[#2b241c] text-[#EBDDBF] border border-[#5b4a3d]' 
            : 'bg-white text-[#7A916C] border border-[#E6F0D1]'
          }
        `}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center text-3xl
            ${theme === 'dark' 
              ? 'bg-[#5b4a3d]/30' 
              : 'bg-[#E6F0D1]/50'
            }
          `}>
            📅
          </div>
        </div>

        {/* Title */}
        <h3 className={`
          text-xl font-semibold text-center mb-3
          ${theme === 'dark' ? 'font-spooky-header' : 'font-shantell'}
        `}>
          Today's Tasks Only
        </h3>

        {/* Message */}
        <p className={`
          text-center text-sm leading-relaxed mb-6
          ${theme === 'dark' 
            ? 'text-[#EBDDBF]/80 font-gothic-body' 
            : 'text-[#6c7a5b]'
          }
        `}>
          You can only check off tasks for today. This helps you stay focused on the present moment. 🌿
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className={`
            w-full py-3 rounded-xl font-medium transition-all duration-200
            ${theme === 'dark'
              ? 'bg-[#5b4a3d] hover:bg-[#6d5a4a] text-[#EBDDBF]'
              : 'bg-[#7A916C] hover:bg-[#6c7a5b] text-white'
            }
          `}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default TodayOnlyModal;
