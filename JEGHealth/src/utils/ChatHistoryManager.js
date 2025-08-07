import AsyncStorage from '@react-native-async-storage/async-storage';
import { drJegAPI } from '../../api/services';

/**
 * Chat History Utilities for managing Dr. JEG conversations
 * Enhanced to work with real backend API endpoints
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

  /**
   * Load conversations from backend API
   * @param {boolean} fallbackToLocal - Whether to fallback to local storage if API fails
   * @returns {Array} Array of conversation objects
   */
  static async loadConversationsFromAPI(fallbackToLocal = true) {
    try {
      console.log('Loading conversations from API...');
      const response = await drJegAPI.getConversations();
      const conversations = response.data;
      
      // Cache conversations locally for offline access
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(conversations));
      
      // Sort by most recent first
      return conversations.sort((a, b) => new Date(b.updated_at || b.lastUpdated) - new Date(a.updated_at || a.lastUpdated));
    } catch (error) {
      console.error('Error loading conversations from API:', error);
      
      if (fallbackToLocal) {
        console.log('Falling back to local storage...');
        return await this.loadConversations();
      }
      
      throw error;
    }
  }

  /**
   * Get a conversation from API with full message history
   * @param {string} conversationId - The conversation ID
   * @returns {Object|null} The conversation object with messages
   */
  static async getConversationFromAPI(conversationId) {
    try {
      console.log('Loading conversation from API:', conversationId);
      const response = await drJegAPI.getConversation(conversationId);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation from API:', error);
      
      // Fallback to local storage
      return await this.getConversation(conversationId);
    }
  }

  /**
   * Delete a conversation via API
   * @param {string} conversationId - The conversation ID to delete
   * @returns {boolean} Success status
   */
  static async deleteConversationFromAPI(conversationId) {
    try {
      console.log('Deleting conversation via API:', conversationId);
      await drJegAPI.deleteConversation(conversationId);
      
      // Also remove from local cache
      await this.deleteConversation(conversationId);
      
      return true;
    } catch (error) {
      console.error('Error deleting conversation from API:', error);
      
      // Try local deletion as fallback
      return await this.deleteConversation(conversationId);
    }
  }

  /**
   * Clear all conversations via API
   * @returns {boolean} Success status
   */
  static async clearAllConversationsFromAPI() {
    try {
      console.log('Clearing all conversations via API...');
      await drJegAPI.clearAllConversations();
      
      // Also clear local cache
      await this.clearAllHistory();
      
      return true;
    } catch (error) {
      console.error('Error clearing conversations from API:', error);
      
      // Try local clear as fallback
      return await this.clearAllHistory();
    }
  }

  /**
   * Send a message to Dr. JEG and get response
   * @param {string} message - The user's message
   * @param {string} conversationId - Optional conversation ID to continue existing conversation
   * @returns {Object} Response with conversation data and Dr. JEG's reply
   */
  static async sendMessageToAPI(message, conversationId = null) {
    try {
      console.log('=== CHAT HISTORY MANAGER ===');
      console.log('Sending message to Dr. JEG API:', { 
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''), 
        conversationId,
        endpoint: '/api/v1/dr-jeg/conversation/'
      });
      
      const response = await drJegAPI.sendMessage(message, conversationId);
      
      console.log('Dr. JEG API raw response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // The API should return the updated conversation with the new messages
      const conversationData = response.data;
      
      // Cache the updated conversation locally
      if (conversationData) {
        console.log('Caching conversation data locally...');
        await this.saveConversation(conversationData);
      } else {
        console.warn('No conversation data to cache');
      }
      
      return conversationData;
    } catch (error) {
      console.error('=== CHAT HISTORY MANAGER ERROR ===');
      console.error('Error sending message to Dr. JEG API:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Full error:', error);
      throw error;
    }
  }
  

  /**
   * Send a message to Dr. JEG (alias for sendMessageToAPI)
   * @param {string} message - The user's message
   * @param {string} conversationId - Optional conversation ID
   * @returns {Object} API response with conversation data
   */
  static async sendMessage(message, conversationId = null) {
    return this.sendMessageToAPI(message, conversationId);
  }

  /**
   * Get Dr. JEG service status
   * @returns {Object} Service status information
   */
  static async getDrJegStatus() {
    try {
      const response = await drJegAPI.getStatus();
      return response.data;
    } catch (error) {
      console.error('Error getting Dr. JEG status:', error);
      return { status: 'unavailable', error: error.message };
    }
  }

  /**
   * Get user's Dr. JEG usage analytics
   * @returns {Object} Analytics data
   */
  static async getDrJegAnalytics() {
    try {
      const response = await drJegAPI.getAnalytics();
      return response.data;
    } catch (error) {
      console.error('Error getting Dr. JEG analytics:', error);
      return null;
    }
  }
}

export default ChatHistoryManager;
