import { apiClient } from './config';

/**
 * Dr. JEG API Service
 * Handles all communication with the Dr. JEG AI assistant backend
 */

export const drJegAPI = {
    /**
     * Send a message to Dr. JEG
     * Endpoint: POST /api/v1/dr-jeg/conversation/
     * @param {string} message - The user's message
     * @param {string} conversationId - Optional conversation ID to continue existing conversation
     * @returns {Promise} API response with Dr. JEG's reply
     */
    sendMessage: (message, conversationId = null) => {
        const data = { message };
        if (conversationId) {
            data.conversation_id = conversationId;
        }
        return apiClient.post('/api/v1/dr-jeg/conversation/', data);
    },

    /**
     * Get list of all user's conversations
     * Endpoint: GET /api/v1/dr-jeg/conversations/
     * @returns {Promise} API response with conversations list
     */
    getConversations: () => apiClient.get('/api/v1/dr-jeg/conversations/'),

    /**
     * Get a specific conversation with all messages
     * Endpoint: GET /api/v1/dr-jeg/conversation/{conversation_id}/
     * @param {string} conversationId - The conversation ID
     * @returns {Promise} API response with conversation details and messages
     */
    getConversation: (conversationId) => apiClient.get(`/api/v1/dr-jeg/conversation/${conversationId}/`),

    /**
     * Delete a specific conversation
     * Endpoint: DELETE /api/v1/dr-jeg/conversation/{conversation_id}/delete/
     * @param {string} conversationId - The conversation ID to delete
     * @returns {Promise} API response
     */
    deleteConversation: (conversationId) => apiClient.delete(`/api/v1/dr-jeg/conversation/${conversationId}/delete/`),

    /**
     * Clear all conversations for the user
     * Endpoint: DELETE /api/v1/dr-jeg/conversations/clear/
     * @returns {Promise} API response
     */
    clearAllConversations: () => apiClient.delete('/api/v1/dr-jeg/conversations/clear/', {
        data: { confirm: true }
    }),

    /**
     * Get Dr. JEG service status
     * Endpoint: GET /api/v1/dr-jeg/status/
     * @returns {Promise} API response with service status
     */
    getStatus: () => apiClient.get('/api/v1/dr-jeg/status/'),

    /**
     * Get analytics data for user's Dr. JEG usage
     * Endpoint: GET /api/v1/dr-jeg/analytics/
     * @returns {Promise} API response with analytics
     */
    getAnalytics: () => apiClient.get('/api/v1/dr-jeg/analytics/'),
};

export default drJegAPI;
