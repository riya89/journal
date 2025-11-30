/**
 * ConversationContext - Manages AI Assistant conversation sessions
 * Handles message storage, context formatting, and backend API persistence
 * 
 * NOTE: Persistence is handled by the backend API, not directly via Firebase
 */

export class ConversationContext {
  constructor(sessionId, userId, maxMessages = 10) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.maxMessages = maxMessages;
    this.messages = [];
  }

  /**
   * Add a message to the conversation context
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addMessage(role, content) {
    const message = {
      role,
      content,
      timestamp: new Date().toISOString()
    };

    this.messages.push(message);

    // Keep only last N messages to maintain context window
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    return message;
  }

  /**
   * Get messages formatted for AI API
   * @returns {Array} Array of {role, content} objects
   */
  getContextForAI() {
    return this.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Get all messages with timestamps
   * @returns {Array} Full message array
   */
  getAllMessages() {
    return [...this.messages];
  }

  /**
   * Load messages from an existing array
   * @param {Array} messages - Array of message objects
   */
  loadMessages(messages) {
    this.messages = messages.slice(-this.maxMessages);
  }

  /**
   * Persist conversation to backend
   * NOTE: Persistence is handled automatically by the backend API
   * when messages are sent via /assistant/reply-with-context
   * This method is kept for compatibility but doesn't need to do anything
   */
  async persist() {
    // Backend handles persistence automatically when messages are sent
    // No need to manually persist from frontend
    return true;
  }

  /**
   * Load conversation from backend API
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @returns {ConversationContext|null} Loaded context or null
   */
  static async load(userId, sessionId) {
    try {
      // Load from backend API instead of Firebase directly
      const response = await fetch(
        `http://localhost:8000/journal/assistant/context?sessionId=${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const context = new ConversationContext(sessionId, userId);
        context.loadMessages(data.messages || []);
        return context;
      }

      return null;
    } catch (error) {
      console.error('Error loading conversation:', error);
      return null;
    }
  }

  /**
   * Generate a new session ID with date prefix
   * Format: session_YYYY-MM-DD_timestamp_random
   * @returns {string} New session ID
   */
  static generateSessionId() {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `session_${date}_${timestamp}_${random}`;
  }

  /**
   * Clear all messages from context
   */
  clear() {
    this.messages = [];
  }

  /**
   * Get message count
   * @returns {number} Number of messages
   */
  getMessageCount() {
    return this.messages.length;
  }
}

export default ConversationContext;
