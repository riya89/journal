import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiDelete } from '../utils/api';

export default function HistoryPanel({ theme, onClose, onLoadSession }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArchived, setFilterArchived] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiGet(
        `https://journal-6xfj.onrender.com/journal/assistant/history?limit=50&offset=0${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`
      );
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const viewSession = async (sessionId) => {
    try {
      const response = await apiGet(
        `https://journal-6xfj.onrender.com/journal/assistant/history/${sessionId}`
      );
      const data = await response.json();
      setSelectedSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const deleteSession = async (sessionId, event) => {
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      return;
    }

    try {
      await apiDelete(
        `https://journal-6xfj.onrender.com/journal/assistant/history/${sessionId}`
      );
      
      // Remove from list
      setSessions(sessions.filter(s => s.sessionId !== sessionId));
      
      // Close detail view if this session was selected
      if (selectedSession?.sessionId === sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete conversation');
    }
  };

  const loadSessionIntoChat = (session) => {
    if (onLoadSession) {
      onLoadSession(session);
    }
    onClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadHistory();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const filteredSessions = filterArchived
    ? sessions.filter(s => s.isArchived)
    : sessions.filter(s => !s.isArchived);

  if (selectedSession) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          theme === 'dark' ? 'bg-black/80' : 'bg-black/50'
        }`}
        onClick={onClose}
      >
        <div
          className={`w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-[#2e241b] text-[#EBDDBF]'
              : 'bg-white text-[#6c7a5b]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-[#4a3b2b]' : 'border-gray-200'
            }`}
          >
            <div>
              <button
                onClick={() => setSelectedSession(null)}
                className={`text-sm px-3 py-1 rounded-lg ${
                  theme === 'dark'
                    ? 'hover:bg-[#4a3b2b] font-gothic-body'
                    : 'hover:bg-gray-100'
                }`}
              >
                ← Back to History
              </button>
              <p className={`text-xs opacity-60 mt-1 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                {formatDate(selectedSession.startedAt)} • {selectedSession.messageCount} messages
              </p>
            </div>
            <button
              onClick={onClose}
              className={`text-2xl px-3 py-1 rounded-lg ${
                theme === 'dark'
                  ? 'hover:bg-[#4a3b2b]'
                  : 'hover:bg-gray-100'
              }`}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {selectedSession.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-md text-sm ${
                    msg.role === 'user'
                      ? theme === 'dark'
                        ? 'bg-[#4a3b2b] text-[#EBDDBF] font-gothic-body'
                        : 'bg-[#d8e8c8] text-[#44533a]'
                      : theme === 'dark'
                      ? 'bg-[#3a2e20] text-[#EBDDBF] font-gothic-body'
                      : 'bg-gray-100 text-[#6c7a5b]'
                  }`}
                >
                  {msg.content}
                  <div className={`text-xs opacity-50 mt-1 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div
            className={`px-6 py-4 border-t flex justify-between ${
              theme === 'dark' ? 'border-[#4a3b2b]' : 'border-gray-200'
            }`}
          >
            <button
              onClick={() => loadSessionIntoChat(selectedSession)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-[#f4c27c] text-[#2e241b] hover:bg-[#e8b36a] font-gothic-body'
                  : 'bg-[#7A916C] text-white hover:bg-[#6c7a5b]'
              }`}
            >
              Continue This Conversation
            </button>
            <button
              onClick={(e) => deleteSession(selectedSession.sessionId, e)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50 font-gothic-body'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        theme === 'dark' ? 'bg-black/80' : 'bg-black/50'
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#2e241b] text-[#EBDDBF]'
            : 'bg-white text-[#6c7a5b]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            theme === 'dark' ? 'border-[#4a3b2b]' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'font-spooky-header' : ''}`}>Conversation History</h2>
            <button
              onClick={onClose}
              className={`text-2xl px-3 py-1 rounded-lg ${
                theme === 'dark'
                  ? 'hover:bg-[#4a3b2b]'
                  : 'hover:bg-gray-100'
              }`}
            >
              ×
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className={`flex-1 px-4 py-2 rounded-xl text-sm ${
                  theme === 'dark'
                    ? 'bg-[#3a2e20] text-[#EBDDBF] placeholder-[#EBDDBF]/40 font-gothic-body'
                    : 'bg-gray-100 text-[#6c7a5b] placeholder-[#6c7a5b]/40'
                }`}
              />
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-[#4a3b2b] text-[#EBDDBF] hover:bg-[#5a4b3b] font-gothic-body'
                    : 'bg-gray-200 text-[#6c7a5b] hover:bg-gray-300'
                }`}
              >
                Search
              </button>
            </form>
            <button
              onClick={() => setFilterArchived(!filterArchived)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                filterArchived
                  ? theme === 'dark'
                    ? 'bg-[#f4c27c] text-[#2e241b] font-gothic-body'
                    : 'bg-[#7A916C] text-white'
                  : theme === 'dark'
                  ? 'bg-[#4a3b2b] text-[#EBDDBF] hover:bg-[#5a4b3b] font-gothic-body'
                  : 'bg-gray-200 text-[#6c7a5b] hover:bg-gray-300'
              }`}
            >
              {filterArchived ? 'Show Recent' : 'Show Archived'}
            </button>
          </div>
        </div>

        {/* Session List */}
        <div className="overflow-y-auto p-6 space-y-3" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {loading ? (
            <div className={`text-center py-12 opacity-60 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-3"></div>
              Loading conversations...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className={`text-center py-12 opacity-60 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              <p className="text-lg mb-2">
                {searchQuery ? 'No conversations found' : filterArchived ? 'No archived conversations' : 'No conversations yet'}
              </p>
              <p className="text-sm">
                {searchQuery ? 'Try a different search term' : 'Start chatting with your AI companion to create conversation history'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.sessionId}
                onClick={() => viewSession(session.sessionId)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-[#3a2e20] hover:bg-[#4a3b2b]'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className={`text-sm line-clamp-2 flex-1 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>{session.preview}</p>
                  <button
                    onClick={(e) => deleteSession(session.sessionId, e)}
                    className={`ml-3 px-2 py-1 rounded text-xs ${
                      theme === 'dark'
                        ? 'hover:bg-red-900/30 text-red-300 font-gothic-body'
                        : 'hover:bg-red-100 text-red-600'
                    }`}
                  >
                    Delete
                  </button>
                </div>
                <div className={`flex items-center gap-3 text-xs opacity-60 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                  <span>{formatDate(session.startedAt)}</span>
                  <span>•</span>
                  <span>{session.messageCount} messages</span>
                  {session.isArchived && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-500">Archived</span>
                    </>
                  )}
                </div>
                {session.themes && session.themes.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {session.themes.map((themeTag, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-full text-xs ${
                          theme === 'dark'
                            ? 'bg-[#4a3b2b] text-[#EBDDBF] font-gothic-body'
                            : 'bg-gray-200 text-[#6c7a5b]'
                        }`}
                      >
                        {themeTag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
