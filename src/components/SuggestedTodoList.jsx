import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';
import { API_BASE_URL } from '../config/api';
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

export default function SuggestedTodoList({ theme }) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
    
    // Listen for updates from other components
    const handleUpdate = () => {
      console.log('Daily todos updated, refreshing...');
      fetchTodos();
    };
    
    window.addEventListener('dailyTodosUpdated', handleUpdate);
    
    // Refresh todos every minute to check for new ones
    const interval = setInterval(fetchTodos, 60000);
    
    return () => {
      window.removeEventListener('dailyTodosUpdated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await apiGet(`${API_BASE_URL}/daily-todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data.todos || []);
      }
    } catch (error) {
      console.error('Failed to fetch daily todos:', error);
    }
  };

  const handleToggle = async (todoId, completed) => {
    try {
      await apiPost(`${API_BASE_URL}/daily-todos/${todoId}/toggle`, {
        completed: !completed
      });
      
      // Update local state
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? { ...todo, completed: !completed } : todo
      ));
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const getCategoryInfo = (backendCategory) => {
    const frontendCategory = CATEGORY_MAP[backendCategory] || 'other';
    return TASK_CATEGORIES[frontendCategory] || TASK_CATEGORIES.other;
  };

  // Always show the component, even if empty
  const displayTodos = todos.length > 0;

  return (
    <div className={`
      rounded-[16px] shadow-soft p-4 transition-all duration-300
      ${theme === 'dark' 
        ? 'bg-[#2b241c] text-[#EBDDBF]' 
        : 'bg-white text-[#7A916C]'
      }
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`
          text-base font-semibold
          ${theme === 'dark' 
            ? 'text-[#EBDDBF] font-spooky-header' 
            : 'text-[#7A916C] font-shantell'
          }
        `}>
          Today's Tasks
        </h3>
        {displayTodos && (
          <span className={`
            text-xs font-medium px-2 py-0.5 rounded-full
            ${theme === 'dark'
              ? 'bg-[#EBDDBF]/20 text-[#EBDDBF]'
              : 'bg-[#7A916C]/20 text-[#7A916C]'
            }
          `}>
            {todos.filter(t => !t.completed).length}
          </span>
        )}
      </div>

      {/* Content */}
      {!displayTodos ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="text-3xl mb-2 opacity-30">✍️</div>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-[#EBDDBF]/50' : 'text-[#6c7a5b]/70'
          }`}>
            No tasks yet
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
          {todos.map((todo) => {
            const categoryInfo = getCategoryInfo(todo.category);
            
            return (
              <div
                key={todo.id}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${todo.completed 
                    ? 'opacity-50'
                    : theme === 'dark'
                      ? 'bg-[#3a2e20]/30 hover:bg-[#3a2e20]/50'
                      : 'bg-[#E6F0D1]/30 hover:bg-[#E6F0D1]/50'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo.id, todo.completed)}
                    className={`
                      mt-0.5 w-3.5 h-3.5 rounded cursor-pointer
                      ${theme === 'dark'
                        ? 'text-[#EBDDBF] focus:ring-[#EBDDBF]'
                        : 'text-[#7A916C] focus:ring-[#7A916C]'
                      }
                    `}
                  />
                  
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{categoryInfo.icon}</span>
                      <p className={`
                        text-[13px] leading-snug
                        ${todo.completed ? 'line-through opacity-60' : ''}
                        ${theme === 'dark' 
                          ? 'text-[#EBDDBF] font-gothic-body' 
                          : 'text-[#7A916C]'
                        }
                      `}>
                        {todo.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(235, 221, 191, 0.05)' : 'rgba(122, 145, 108, 0.05)'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(235, 221, 191, 0.2)' : 'rgba(122, 145, 108, 0.2)'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(235, 221, 191, 0.3)' : 'rgba(122, 145, 108, 0.3)'};
        }
      `}</style>
    </div>
  );
}
