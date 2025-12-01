import React, { useState } from 'react';
import Modal from './Modal';

const AddGratitudeModal = ({ onSubmit, onClose }) => {
  const [gratitudeText, setGratitudeText] = useState('');
  const [mood, setMood] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!gratitudeText.trim()) {
      alert('Please write what you\'re grateful for');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(gratitudeText.trim(), mood);
    } catch (error) {
      console.error('Error adding gratitude:', error);
      alert('Failed to add gratitude. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

  return (
    <Modal onClose={onClose}>
      <div className="add-gratitude-modal">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Add Gratitude
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          What are you grateful for today? These moments will be saved in your gratitude jar.
        </p>

        {/* Gratitude Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            I'm grateful for...
          </label>
          <textarea
            value={gratitudeText}
            onChange={(e) => setGratitudeText(e.target.value)}
            placeholder="I'm grateful for my morning coffee and quiet time to reflect..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-amber-500 focus:border-transparent
                     resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {gratitudeText.length} characters
          </p>
        </div>

        {/* Current Mood */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How are you feeling?
          </label>
          <div className="flex gap-2 justify-between">
            {[1, 2, 3, 4, 5].map((moodValue) => (
              <button
                key={moodValue}
                type="button"
                onClick={() => setMood(moodValue)}
                className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all
                  ${mood === moodValue
                    ? 'border-[#7A916C] dark:border-[#d4a574] bg-[#7A916C]/10 dark:bg-[#5b4a3d]/30 scale-105'
                    : 'border-gray-300 dark:border-[#5b4a3d] hover:border-[#7A916C]/50 dark:hover:border-[#d4a574]/50'
                  }`}
              >
                <div className="text-2xl mb-1">{moodEmojis[moodValue - 1]}</div>
                <div className="text-xs text-gray-600 dark:text-[#EBDDBF]/70">
                  {moodLabels[moodValue - 1]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                     dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !gratitudeText.trim()}
            className="px-6 py-2 bg-[#7A916C] dark:bg-[#8b6f47] text-white rounded-lg 
                     hover:bg-[#6c7a5b] dark:hover:bg-[#9d7d52] 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Adding...
              </>
            ) : (
              <>
                ✨ Add to Jar
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddGratitudeModal;
