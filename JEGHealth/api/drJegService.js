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
     * @param {Array} attachments - Optional array of file attachments
     * @returns {Promise} API response with Dr. JEG's reply
     */
    sendMessage: (message, conversationId = null, attachments = null) => {
        // If there are attachments, use FormData for multipart upload
        if (attachments && attachments.length > 0) {
            const formData = new FormData();
            formData.append('message', message);
            
            if (conversationId) {
                formData.append('conversation_id', conversationId);
            }
            
            // Add each attachment to the form data
            attachments.forEach((attachment, index) => {
                formData.append(`attachments`, {
                    uri: attachment.uri,
                    type: attachment.type,
                    name: attachment.name || `attachment_${index}`,
                });
            });
            
            return apiClient.post('/api/v1/dr-jeg/conversation/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } else {
            // Regular JSON request for text-only messages
            const data = { message };
            if (conversationId) {
                data.conversation_id = conversationId;
            }
            return apiClient.post('/api/v1/dr-jeg/conversation/', data);
        }
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

    /**
     * Upload a file to Dr. JEG for analysis
     * Endpoint: POST /api/v1/dr-jeg/upload/
     * @param {Object} file - File object with uri, type, and name
     * @param {string} analysisType - Type of analysis requested (e.g., 'medical-report', 'prescription', 'lab-results')
     * @returns {Promise} API response with file upload result
     */
    uploadFile: (file, analysisType = 'general') => {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type,
            name: file.name,
        });
        formData.append('analysis_type', analysisType);
        
        return apiClient.post('/api/v1/dr-jeg/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Get supported file types for upload
     * Endpoint: GET /api/v1/dr-jeg/supported-files/
     * @returns {Promise} API response with supported file types
     */
    getSupportedFileTypes: () => apiClient.get('/api/v1/dr-jeg/supported-files/'),
};

export default drJegAPI;
