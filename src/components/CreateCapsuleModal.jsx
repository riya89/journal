import React, { useState } from 'react';
import Modal from './Modal';

const CreateCapsuleModal = ({ onSubmit, onClose }) => {
  const [message, setMessage] = useState('');
  const [unlockPeriod, setUnlockPeriod] = useState('30d'); // Changed to string format
  const [goals, setGoals] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('Please write a message to your future self');
      return;
    }

    setIsSubmitting(true);
    
    // Parse the unlock period
    const periodMatch = unlockPeriod.match(/^(\d+)([mhd])$/);
    if (!periodMatch) {
      alert('Invalid unlock period format');
      setIsSubmitting(false);
      return;
    }

    const [, value, unit] = periodMatch;
    const durationValue = parseInt(value);
    let durationType;
    let unlockDate = new Date();

    // Calculate unlock date based on unit
    switch (unit) {
      case 'm': // minutes
        durationType = 'minutes';
        unlockDate = new Date(unlockDate.getTime() + durationValue * 60 * 1000);
        break;
      case 'h': // hours
        durationType = 'hours';
        unlockDate = new Date(unlockDate.getTime() + durationValue * 60 * 60 * 1000);
        break;
      case 'd': // days
        durationType = 'days';
        unlockDate = new Date(unlockDate.getTime() + durationValue * 24 * 60 * 60 * 1000);
        break;
      default:
        durationType = 'days';
        unlockDate.setDate(unlockDate.getDate() + durationValue);
    }
    
    // ✅ Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    try {
      await onSubmit({
        message: message.trim(),
        unlockDate: unlockDate.toISOString(),
        currentGoals: goals.filter(g => g.trim()),
        timezone,
        durationType,
        durationValue
      });
    } catch (error) {
      console.error('Error creating capsule:', error);
      alert('Failed to create time capsule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGoal = () => {
    setGoals([...goals, '']);
  };

  const updateGoal = (index, value) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const removeGoal = (index) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  // Helper function to display unlock date
  const getUnlockDateDisplay = (period) => {
    const match = period.match(/^(\d+)([mhd])$/);
    if (!match) return 'Invalid period';
    
    const [, value, unit] = match;
    const val = parseInt(value);
    const now = new Date();
    let unlockDate;

    switch (unit) {
      case 'm':
        unlockDate = new Date(now.getTime() + val * 60 * 1000);
        return unlockDate.toLocaleString();
      case 'h':
        unlockDate = new Date(now.getTime() + val * 60 * 60 * 1000);
        return unlockDate.toLocaleString();
      case 'd':
        unlockDate = new Date(now.getTime() + val * 24 * 60 * 60 * 1000);
        return unlockDate.toLocaleDateString();
      default:
        return 'Unknown';
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="create-capsule-modal">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Create Time Capsule 
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Write a message to your future self. It will be locked until the unlock date.
        </p>

        {/* Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message to Future Self
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Dear future me, I hope you're doing well..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-[#7A916C] focus:border-transparent
                     resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {message.length} characters
          </p>
        </div>

        {/* Unlock Period */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unlock After
          </label>
          <select
            value={unlockPeriod}
            onChange={(e) => setUnlockPeriod(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-[#7A916C] focus:border-transparent"
          >
            <option value="30d">30 days (1 month)</option>
            <option value="60d">60 days (2 months)</option>
            <option value="90d">90 days (3 months)</option>
            <option value="180d">180 days (6 months)</option>
            <option value="365d">365 days (1 year)</option>
            <option value="730d">730 days (2 years)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Unlocks on: {getUnlockDateDisplay(unlockPeriod)}
          </p>
        </div>

        {/* Removed Current Mood - Time capsules should be joyful, not tracked */}

        {/* Current Goals */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Goals (Optional)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            What are you working towards? You'll see how you've progressed when the capsule unlocks.
          </p>
          {goals.map((goal, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => updateGoal(index, e.target.value)}
                placeholder={`Goal ${index + 1}...`}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-[#7A916C] focus:border-transparent"
              />
              {goals.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGoal(index)}
                  className="px-3 py-2 text-[#8b6f47] dark:text-[#EBDDBF] hover:bg-[#cdd6c0]/20 
                           dark:hover:bg-[#3a2e20]/30 rounded-lg transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {goals.length < 5 && (
            <button
              type="button"
              onClick={addGoal}
              className="text-sm text-[#7A916C] dark:text-[#d4a574] hover:text-[#6c7a5b] 
                       dark:hover:text-[#EBDDBF] mt-2"
            >
              + Add Goal
            </button>
          )}
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
            disabled={isSubmitting || !message.trim()}
            className="px-6 py-2 bg-[#7A916C] dark:bg-[#5b4a3d] text-white rounded-lg 
                     hover:bg-[#6c7a5b] dark:hover:bg-[#6d5a4a] 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Lock Capsule
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCapsuleModal;
