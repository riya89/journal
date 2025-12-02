import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost } from '../utils/api';
import AddGratitudeModal from './AddGratitudeModal';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_BASE_URL = 'http://localhost:8000/journal';

const GratitudeJar = ({ theme }) => {
  const { user } = useAuth();
  const [gratitudes, setGratitudes] = useState([]);
  const [randomGratitude, setRandomGratitude] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(false);

  useEffect(() => {
    if (user) {
      loadGratitudes();
    }
  }, [user]);

  const loadGratitudes = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`${API_BASE_URL}/gratitude/all`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gratitudes');
      }
      
      const data = await response.json();
      setGratitudes(data.gratitudes || []);
    } catch (error) {
      console.error('Error loading gratitudes:', error);
      // Don't show error for empty state
      if (error.message !== 'Failed to fetch gratitudes') {
        showErrorToast('Failed to load gratitudes');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRandomGratitude = async () => {
    if (gratitudes.length === 0) {
      showErrorToast('Add some gratitudes first!');
      return;
    }

    try {
      setLoadingRandom(true);
      const response = await apiGet(`${API_BASE_URL}/gratitude/random`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch random gratitude');
      }
      
      const data = await response.json();
      setRandomGratitude(data);
    } catch (error) {
      console.error('Error fetching random gratitude:', error);
      showErrorToast('Failed to fetch random gratitude');
    } finally {
      setLoadingRandom(false);
    }
  };

  const addGratitude = async (text, mood) => {
    try {
      const response = await apiPost(`${API_BASE_URL}/gratitude/add`, {
        gratitudeText: text,
        mood
      });
      
      if (!response.ok) {
        throw new Error('Failed to add gratitude');
      }
      
      showSuccessToast('Gratitude added to your jar! ✨');
      await loadGratitudes();
      setShowAdd(false);
      setRandomGratitude(null); // Clear random gratitude when adding new one
    } catch (error) {
      console.error('Error adding gratitude:', error);
      throw error; // Re-throw to let modal handle it
    }
  };

  const deleteGratitude = async (gratitudeId) => {
    if (!window.confirm('Are you sure you want to delete this gratitude?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gratitude/${gratitudeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete gratitude');
      }
      
      showSuccessToast('Gratitude deleted');
      await loadGratitudes();
    } catch (error) {
      console.error('Error deleting gratitude:', error);
      showErrorToast('Failed to delete gratitude');
    }
  };

  const fillPercentage = Math.min((gratitudes.length / 100) * 100, 100);
  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];

  if (loading) {
    return (
      <div className="gratitude-jar-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏺</div>
          <p className="text-gray-600 dark:text-gray-400">Loading your gratitude jar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gratitude-jar-container flex flex-col relative z-10 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="text-center pt-2 pb-2 px-6">
        <h2 className={`text-xl font-bold mb-0.5 text-gray-800 dark:text-white ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
          Gratitude Jar
        </h2>
        <p className={`text-xs text-gray-600 dark:text-gray-400 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
          Collect moments of gratitude and revisit them when you need a boost
        </p>
      </div>

      {/* Main Layout: Jar on Left, Gratitudes on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 overflow-hidden">
        
        {/* Left Side: Jar Visual */}
        <div className="jar-visual-container bg-gradient-to-b from-[#EBDDBF]/20 to-[#d4a574]/20 
                      dark:from-[#3a2e20] dark:to-[#2a1f15] rounded-2xl p-4 shadow-lg flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <svg 
              viewBox="0 0 200 400" 
              className="jar-svg w-full h-full"
              style={{ 
                filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15))',
                maxWidth: '260px',
                maxHeight: '55vh'
              }}
              preserveAspectRatio="xMidYMid meet"
            >
            <defs>
              <linearGradient id="jarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#EBDDBF', stopOpacity: 0.4 }} />
                <stop offset="50%" style={{ stopColor: '#d4a574', stopOpacity: 0.25 }} />
                <stop offset="100%" style={{ stopColor: '#b8956a', stopOpacity: 0.3 }} />
              </linearGradient>
              <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#d4a574', stopOpacity: 0.7 }} />
                <stop offset="50%" style={{ stopColor: '#c9a36d', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#b8956a', stopOpacity: 0.5 }} />
              </linearGradient>
              <radialGradient id="glassShine" cx="30%" cy="40%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
              </radialGradient>
            </defs>
            
            {/* Jar body - completely straight sides */}
            <rect 
              x="60" 
              y="60" 
              width="80" 
              height="280" 
              rx="0"
              fill="url(#jarGradient)" 
              stroke="#8b6f47" 
              strokeWidth="4"
            />
            
            {/* Rounded bottom */}
            <path 
              d="M 60 340 Q 60 360, 100 365 Q 140 360, 140 340 L 140 340 L 60 340 Z" 
              fill="url(#jarGradient)" 
              stroke="#8b6f47" 
              strokeWidth="4"
            />
            
            {/* Glass shine effect */}
            <ellipse 
              cx="80" 
              cy="200" 
              rx="20" 
              ry="100" 
              fill="url(#glassShine)"
              opacity="0.5"
            />
            
            {/* Jar neck */}
            <rect 
              x="60" 
              y="50" 
              width="80" 
              height="10" 
              fill="#EBDDBF"
              fillOpacity="0.3"
              stroke="#8b6f47" 
              strokeWidth="3.5"
            />
            
            {/* Jar lid */}
            <g>
              <rect 
                x="50" 
                y="35" 
                width="100" 
                height="18" 
                rx="3"
                fill="#5b4a3d"
                stroke="#4a3a2f"
                strokeWidth="2.5"
              />
              <ellipse 
                cx="100" 
                cy="32" 
                rx="15" 
                ry="8" 
                fill="#6d5a4a"
                stroke="#4a3a2f"
                strokeWidth="2"
              />
              <line x1="60" y1="44" x2="140" y2="44" stroke="#4a3a2f" strokeWidth="1" opacity="0.4"/>
            </g>
            
            {/* Fill level - stays inside jar with straight sides */}
            {fillPercentage > 0 && (
              <>
                {/* Main fill rectangle */}
                <rect 
                  x="60" 
                  y={340 - (fillPercentage * 2.8)}
                  width="80" 
                  height={fillPercentage * 2.8}
                  fill="url(#fillGradient)"
                  className="transition-all duration-500"
                />
                {/* Rounded bottom of fill */}
                <path 
                  d="M 60 340 Q 60 360, 100 365 Q 140 360, 140 340 L 140 340 L 60 340 Z" 
                  fill="url(#fillGradient)" 
                  className="transition-all duration-500"
                />
              </>
            )}
            
            {/* Gratitude notes - simple dots */}
            {gratitudes.slice(0, 35).map((g, idx) => {
              const row = Math.floor(idx / 4);
              const col = idx % 4;
              const x = 70 + col * 18;
              const y = 350 - (row * 18) - (fillPercentage * 0.4);
              
              // Only show if inside jar
              if (y < 60 || y > 350) return null;
              
              return (
                <g key={g.gratitudeId}>
                  {/* Glow effect */}
                  <circle 
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#d4a574"
                    opacity="0.2"
                  />
                  {/* Main dot - color based on mood */}
                  <circle 
                    cx={x}
                    cy={y}
                    r="5"
                    fill={g.mood >= 4 ? "#d4a574" : g.mood >= 3 ? "#b8956a" : "#8b6f47"}
                    opacity="0.95"
                  />
                </g>
              );
            })}
            
            {/* Sparkles */}
            {gratitudes.length > 0 && (
              <>
                <circle cx="70" cy="45" r="2.5" fill="#d4a574" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="130" cy="50" r="2.2" fill="#d4a574" opacity="0.8">
                  <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2.2;3.2;2.2" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="25" r="2.8" fill="#d4a574" opacity="0.85">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2.8;3.8;2.8" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="55" cy="150" r="2" fill="#d4a574" opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="145" cy="180" r="2" fill="#d4a574" opacity="0.7">
                  <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.8s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            </svg>
          </div>
          
          <div className="text-center py-2">
            <p className={`text-lg font-bold text-[#7A916C] dark:text-[#d4a574] mb-0.5 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              {gratitudes.length} {gratitudes.length === 1 ? 'gratitude' : 'gratitudes'}
            </p>
            <p className={`text-xs text-gray-600 dark:text-[#EBDDBF]/70 mb-3 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              {fillPercentage.toFixed(0)}% full
            </p>
            
            {/* Action Buttons - Below jar */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={getRandomGratitude}
                disabled={loadingRandom || gratitudes.length === 0}
                className={`px-3 py-1.5 bg-[#6B7A59] dark:bg-[#5b4a3d] text-white text-xs rounded-lg 
                         hover:bg-[#5C6F4C] dark:hover:bg-[#6d5a4a] 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-1.5 shadow-md ${theme === 'dark' ? 'font-gothic-body' : ''}`}
              >
                {loadingRandom ? (
                  <>
                    <span className="animate-spin">🔄</span>
                    Loading...
                  </>
                ) : (
                  <>
                    Random
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className={`px-3 py-1.5 bg-[#7A916C] dark:bg-[#8b6f47] text-white text-xs rounded-lg 
                         hover:bg-[#6c7a5b] dark:hover:bg-[#9d7d52] 
                         transition-colors flex items-center gap-1.5 shadow-md ${theme === 'dark' ? 'font-gothic-body' : ''}`}
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Side: Gratitude List */}
        <div className="gratitude-list-section flex flex-col overflow-hidden">
          {/* Recent Gratitudes List */}
          {gratitudes.length > 0 ? (
            <div className="flex flex-col h-full overflow-hidden">
              <h3 className={`text-lg font-semibold text-gray-800 dark:text-[#EBDDBF] mb-3 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
                Recent Gratitudes
              </h3>
              <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {gratitudes.slice(0, 10).map((gratitude) => (
                  <div
                    key={gratitude.gratitudeId}
                    className="bg-white dark:bg-[#3a2e20] rounded-lg p-3 shadow-sm 
                             border border-gray-200 dark:border-[#5b4a3d] hover:shadow-md 
                             transition-shadow group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-xl flex-shrink-0 opacity-60">🌙</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm text-gray-800 dark:text-[#EBDDBF] mb-2 break-words ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                          {gratitude.gratitudeText}
                        </p>
                        <p className={`text-xs text-gray-500 dark:text-[#EBDDBF]/60 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                          {new Date(gratitude.date).toLocaleDateString()} • Mood: {gratitude.mood}/5
                        </p>
                      </div>
                      <button
                        onClick={() => deleteGratitude(gratitude.gratitudeId)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
                                 text-gray-400 hover:text-red-500 dark:text-gray-500 
                                 dark:hover:text-red-400 p-1"
                        title="Delete gratitude"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {gratitudes.length > 10 && (
                <p className={`text-center text-sm text-gray-500 dark:text-[#EBDDBF]/60 mt-4 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                  And {gratitudes.length - 10} more in your jar...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-[#3a2e20] rounded-xl">
              <div className="text-6xl mb-4">✨</div>
              <h3 className={`text-xl font-semibold text-gray-800 dark:text-[#EBDDBF] mb-2 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
                No gratitudes yet
              </h3>
              <p className={`text-gray-600 dark:text-[#EBDDBF]/70 mb-6 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Start adding moments of gratitude to fill your jar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Random Gratitude Display - Higher z-index */}
      {randomGratitude && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={() => setRandomGratitude(null)}>
          <div className="random-gratitude-card bg-white dark:bg-[#3a2e20] rounded-xl p-6 
                        shadow-2xl border-2 border-[#d4a574]/30 dark:border-[#5b4a3d]
                        animate-fade-in max-w-2xl w-full"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-lg font-semibold text-gray-800 dark:text-[#EBDDBF] ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
                Random Gratitude ✨
              </h3>
              <button
                onClick={() => setRandomGratitude(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{moodEmojis[randomGratitude.mood - 1]}</div>
              <div className="flex-1">
                <p className={`text-lg text-gray-800 dark:text-[#EBDDBF] mb-3 italic ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                  "{randomGratitude.gratitudeText}"
                </p>
                <div className={`flex items-center gap-4 text-sm text-gray-600 dark:text-[#EBDDBF]/70 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                  <span>📅 {new Date(randomGratitude.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Mood: {randomGratitude.mood}/5</span>
                </div>
              </div>
            </div>
            <button
              onClick={getRandomGratitude}
              className={`mt-4 text-[#7A916C] dark:text-[#d4a574] hover:text-[#6c7a5b] 
                       dark:hover:text-[#EBDDBF] text-sm font-medium ${theme === 'dark' ? 'font-gothic-body' : ''}`}
            >
              Read Another →
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {gratitudes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-[#3a2e20] rounded-xl">
          <div className="text-6xl mb-4">🏺</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-[#EBDDBF] mb-2">
            Your jar is empty
          </h3>
          <p className="text-gray-600 dark:text-[#EBDDBF]/70 mb-6">
            Start collecting moments of gratitude to fill your jar
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className={`px-6 py-3 bg-[#7A916C] dark:bg-[#8b6f47] text-white rounded-lg 
                     hover:bg-[#6c7a5b] dark:hover:bg-[#9d7d52] 
                     transition-colors inline-flex items-center gap-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}
          >
            ✨ Add Your First Gratitude
          </button>
        </div>
      )}



      {/* Add Gratitude Modal */}
      {showAdd && (
        <AddGratitudeModal 
          onSubmit={addGratitude}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
};

export default GratitudeJar;