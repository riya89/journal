import { useState } from 'react';
import Modal from './Modal';
import { TASK_CATEGORIES } from '../constants/taskCategories';

// Map backend categories to frontend categories
const CATEGORY_MAP = {
  'self-care': 'mindfulness',
  'exercise': 'health',
  'personal-growth': 'learning',
  'social': 'social',
  'creative': 'creative',
  'productivity': 'work'
};

export default function TaskSuggestionModal({ suggestions, onAddTasks, onClose }) {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [addedTasks, setAddedTasks] = useState([]); // Track which tasks have been added
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories from suggestions
  const availableCategories = [...new Set(suggestions.map(s => s.category))];
  
  // Filter suggestions by category
  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const toggleTask = (task) => {
    setSelectedTasks(prev => {
      const isSelected = prev.some(t => t.name === task.name);
      if (isSelected) {
        return prev.filter(t => t.name !== task.name);
      } else {
        return [...prev, task];
      }
    });
  };

  const handleAddToTodoList = async () => {
    if (selectedTasks.length > 0) {
      await onAddTasks(selectedTasks);
      
      // Mark these tasks as added (keep them checked)
      setAddedTasks(prev => [...prev, ...selectedTasks.map(t => t.name)]);
      
      // Show success message
      setSuccessMessage(`✓ Added ${selectedTasks.length} task(s) to your to-do list`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Clear selected tasks but keep modal open for more additions
      setSelectedTasks([]);
    }
  };

  const getCategoryInfo = (backendCategory) => {
    const frontendCategory = CATEGORY_MAP[backendCategory] || 'other';
    return TASK_CATEGORIES[frontendCategory] || TASK_CATEGORIES.other;
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="task-suggestion-modal">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          Suggested Tasks
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Based on your journal entry - Add to your home page to-do list
        </p>

        {/* Success message */}
        {successMessage && (
          <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium">
            {successMessage}
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Category:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All ({suggestions.length})
            </button>
            {availableCategories.map(cat => {
              const categoryInfo = getCategoryInfo(cat);
              const count = suggestions.filter(s => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{categoryInfo.icon}</span>
                  <span>{categoryInfo.name} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
          {filteredSuggestions.map((task, idx) => {
            const isSelected = selectedTasks.some(t => t.name === task.name);
            const isAdded = addedTasks.includes(task.name);
            const categoryInfo = getCategoryInfo(task.category);

            return (
              <div
                key={idx}
                onClick={() => !isAdded && toggleTask(task)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${isAdded
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 opacity-75 cursor-default'
                    : isSelected 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 cursor-pointer' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected || isAdded}
                      disabled={isAdded}
                      onChange={() => !isAdded && toggleTask(task)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <h4 className={`font-semibold ${isAdded ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>
                      {task.name}
                      {isAdded && <span className="ml-2 text-xs">✓ Added</span>}
                    </h4>
                  </div>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 whitespace-nowrap ml-2">
                    {task.timeEstimate} min
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 ml-6">
                  {task.reason}
                </p>

                <div className="flex items-center gap-1 ml-6">
                  <span className="text-sm">{categoryInfo.icon}</span>
                  <span 
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: `${categoryInfo.color}20`,
                      color: categoryInfo.darkColor
                    }}
                  >
                    {categoryInfo.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToTodoList}
            disabled={selectedTasks.length === 0}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-all
              ${selectedTasks.length > 0
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {selectedTasks.length > 0 
              ? `Add ${selectedTasks.length} to To-Do List`
              : 'Select tasks to add'
            }
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
