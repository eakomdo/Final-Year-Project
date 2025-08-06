import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Chat History Utilities for managing Dr. JEG conversations
 */

const CHAT_HISTORY_KEY = 'chatHistory';
const MAX_CONVERSATIONS = 50;

export class ChatHistoryManager {
  
  /**
   * Save a conversation to history
   * @param {Object} conversation - The conversation object to save
   */
  static async saveConversation(conversation) {
    try {
      const existingHistory = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      let conversations = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Update existing conversation or add new one
      const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);
      if (existingIndex >= 0) {
        conversations[existingIndex] = {
          ...conversations[existingIndex],
          ...conversation,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        conversations.unshift({
          ...conversation,
          lastUpdated: new Date().toISOString(),
        });
      }

      // Keep only the most recent conversations
      if (conversations.length > MAX_CONVERSATIONS) {
        conversations = conversations.slice(0, MAX_CONVERSATIONS);
      }

      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(conversations));
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return false;
    }
  }

  /**
   * Load all conversations from history
   * @returns {Array} Array of conversation objects
   */
  static async loadConversations() {
    try {
      const savedConversations = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (savedConversations) {
        const conversations = JSON.parse(savedConversations);
        // Sort by most recent first
        return conversations.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      }
      return [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Get a specific conversation by ID
   * @param {string} conversationId - The ID of the conversation to retrieve
   * @returns {Object|null} The conversation object or null if not found
   */
  static async getConversation(conversationId) {
    try {
      const conversations = await this.loadConversations();
      return conversations.find(conv => conv.id === conversationId) || null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Delete a specific conversation
   * @param {string} conversationId - The ID of the conversation to delete
   * @returns {boolean} Success status
   */
  static async deleteConversation(conversationId) {
    try {
      const conversations = await this.loadConversations();
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedConversations));
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  /**
   * Clear all conversation history
   * @returns {boolean} Success status
   */
  static async clearAllHistory() {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  }

  /**
   * Generate a conversation title from messages
   * @param {Array} messages - Array of message objects
   * @returns {string} Generated title
   */
  static generateConversationTitle(messages) {
    const firstUserMessage = messages.find(msg => msg.isUser);
    if (firstUserMessage) {
      return firstUserMessage.text.length > 50 
        ? firstUserMessage.text.substring(0, 47) + '...'
        : firstUserMessage.text;
    }
    return 'New Conversation';
  }

  /**
   * Get conversation statistics
   * @returns {Object} Stats object with total conversations, total messages, etc.
   */
  static async getStats() {
    try {
      const conversations = await this.loadConversations();
      const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
      const totalUserMessages = conversations.reduce((sum, conv) => {
        return sum + conv.messages.filter(msg => msg.isUser).length;
      }, 0);

      return {
        totalConversations: conversations.length,
        totalMessages,
        totalUserMessages,
        averageMessagesPerConversation: conversations.length > 0 
          ? Math.round(totalMessages / conversations.length) 
          : 0,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        totalUserMessages: 0,
        averageMessagesPerConversation: 0,
      };
    }
  }

  /**
   * Search conversations by text content
   * @param {string} searchQuery - The text to search for
   * @returns {Array} Array of matching conversations
   */
  static async searchConversations(searchQuery) {
    try {
      const conversations = await this.loadConversations();
      const query = searchQuery.toLowerCase().trim();
      
      if (!query) return conversations;

      return conversations.filter(conversation => {
        // Search in title
        const titleMatch = (conversation.title || '').toLowerCase().includes(query);
        
        // Search in message content
        const messageMatch = conversation.messages.some(msg => 
          msg.text.toLowerCase().includes(query)
        );

        return titleMatch || messageMatch;
      });
    } catch (error) {
      console.error('Error searching conversations:', error);
      return [];
    }
  }

  /**
   * Export conversation as text
   * @param {string} conversationId - The ID of the conversation to export
   * @returns {string} Formatted conversation text
   */
  static async exportConversation(conversationId) {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) return '';

      const header = `Dr. JEG Conversation\nDate: ${new Date(conversation.lastUpdated).toLocaleDateString()}\nTitle: ${conversation.title}\n\n`;
      
      const messages = conversation.messages.map(msg => {
        const sender = msg.isUser ? 'You' : 'Dr. JEG';
        const timestamp = new Date(msg.timestamp).toLocaleTimeString();
        return `[${timestamp}] ${sender}: ${msg.text}`;
      }).join('\n\n');

      return header + messages;
    } catch (error) {
      console.error('Error exporting conversation:', error);
      return '';
    }
  }
}

export default ChatHistoryManager;
