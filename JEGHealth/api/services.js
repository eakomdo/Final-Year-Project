import { apiClient } from './config';

// Auth API calls
export const authAPI = {
    register: (userData) => apiClient.post('/auth/register/', userData),
    login: (credentials) => apiClient.post('/auth/login/', credentials),
    logout: () => apiClient.post('/auth/logout/'),
    getCurrentUser: () => apiClient.get('/auth/current-user/'),
    refreshToken: (refreshToken) => apiClient.post('/auth/token/refresh/', { refresh: refreshToken }),
    resetPassword: (email) => apiClient.post('/auth/password/reset/', { email }),
    confirmPasswordReset: (data) => apiClient.post('/auth/password/reset/confirm/', data),
    
    // Profile API endpoints with fallback support
    getBasicProfile: async () => {
        // Try different possible endpoints
        const possibleEndpoints = [
            '/api/v1/auth/profile/basic/',
            '/v1/auth/profile/basic/',
            '/auth/profile/basic/',
            '/api/auth/profile/basic/',
            '/auth/current-user/' // Fallback to current user endpoint
        ];
        
        for (const endpoint of possibleEndpoints) {
            try {
                return await apiClient.get(endpoint);
            } catch (error) {
                if (error.response?.status !== 404) {
                    throw error; // If it's not a 404, it's a real error
                }
                // Continue to next endpoint if 404
            }
        }
        
        throw new Error('No available profile endpoint found');
    },
    
    updateBasicProfile: async (data) => {
        const possibleEndpoints = [
            '/api/v1/auth/profile/basic/',
            '/v1/auth/profile/basic/',
            '/auth/profile/basic/',
            '/api/auth/profile/basic/'
        ];
        
        for (const endpoint of possibleEndpoints) {
            try {
                return await apiClient.patch(endpoint, data);
            } catch (error) {
                if (error.response?.status !== 404) {
                    throw error;
                }
            }
        }
        
        throw new Error('No available profile update endpoint found');
    },
    
    getPersonalProfile: async () => {
        const possibleEndpoints = [
            '/api/v1/auth/profile/personal/',
            '/v1/auth/profile/personal/',
            '/auth/profile/personal/',
            '/api/auth/profile/personal/'
        ];
        
        for (const endpoint of possibleEndpoints) {
            try {
                return await apiClient.get(endpoint);
            } catch (error) {
                if (error.response?.status !== 404) {
                    throw error;
                }
            }
        }
        
        throw new Error('No available personal profile endpoint found');
    },
    
    updatePersonalProfile: async (data) => {
        const possibleEndpoints = [
            '/api/v1/auth/profile/personal/',
            '/v1/auth/profile/personal/',
            '/auth/profile/personal/',
            '/api/auth/profile/personal/'
        ];
        
        for (const endpoint of possibleEndpoints) {
            try {
                return await apiClient.patch(endpoint, data);
            } catch (error) {
                if (error.response?.status !== 404) {
                    throw error;
                }
            }
        }
        
        throw new Error('No available personal profile update endpoint found');
    },
    
    // Profile picture upload
    uploadProfilePicture: async (imageUri) => {
        const formData = new FormData();
        formData.append('profile_image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'profile.jpg',
        });
        
        const possibleEndpoints = [
            '/api/v1/auth/profile/image/',
            '/v1/auth/profile/image/',
            '/auth/profile/image/',
            '/api/auth/profile/image/',
            '/api/v1/auth/profile/basic/',
            '/v1/auth/profile/basic/',
            '/auth/profile/basic/',
            '/api/auth/profile/basic/'
        ];
        
        for (const endpoint of possibleEndpoints) {
            try {
                return await apiClient.patch(endpoint, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } catch (error) {
                if (error.response?.status !== 404) {
                    throw error;
                }
            }
        }
        
        throw new Error('No available profile image upload endpoint found');
    },
};

// Health Metrics API
export const healthAPI = {
    getMetrics: (userId, params = {}) => apiClient.get(`/health-metrics/`, { params: { user: userId, ...params } }),
    createMetric: (data) => apiClient.post('/health-metrics/', data),
    updateMetric: (id, data) => apiClient.patch(`/health-metrics/${id}/`, data),
    deleteMetric: (id) => apiClient.delete(`/health-metrics/${id}/`),
    getStats: (userId) => apiClient.get(`/health-metrics/stats/`, { params: { user: userId } }),
};

// Appointments API
export const appointmentsAPI = {
    getAppointments: (userId, params = {}) => apiClient.get('/appointments/', { params: { user: userId, ...params } }),
    createAppointment: (data) => apiClient.post('/appointments/', data),
    updateAppointment: (id, data) => apiClient.patch(`/appointments/${id}/`, data),
    deleteAppointment: (id) => apiClient.delete(`/appointments/${id}/`),
    getUserAppointments: (userId, params = {}) => apiClient.get('/appointments/', { 
        params: { 
            patient: userId, 
            ...params 
        } 
    }),
};

// Medications API
export const medicationsAPI = {
    getMedications: (userId) => apiClient.get('/medications/', { params: { user: userId } }),
    createMedication: (data) => apiClient.post('/medications/', data),
    updateMedication: (id, data) => apiClient.patch(`/medications/${id}/`, data),
    deleteMedication: (id) => apiClient.delete(`/medications/${id}/`),
};

// Notifications API
export const notificationsAPI = {
    getNotifications: (userId, params = {}) => apiClient.get('/notifications/', { params: { user: userId, ...params } }),
    markAsRead: (id) => apiClient.patch(`/notifications/${id}/`, { is_read: true }),
    markAllAsRead: (userId) => apiClient.post('/notifications/mark-all-read/', { user: userId }),
    getUserNotifications: (userId, params = {}) => apiClient.get('/notifications/', { 
        params: { 
            recipient: userId, 
            ...params 
        } 
    }),
};

// Profile/User API
export const userAPI = {
    getProfile: (userId) => apiClient.get(`/users/${userId}/`),
    updateProfile: (userId, data) => apiClient.patch(`/users/${userId}/`, data),
    getUserProfile: () => apiClient.get('/auth/profile/'),
    updateUserProfile: (data) => apiClient.patch('/auth/profile/', data),
};

// Caretakers API
export const caretakersAPI = {
    getCaretakers: (userId) => apiClient.get('/caretakers/', { params: { patient: userId } }),
    addCaretaker: (data) => apiClient.post('/caretakers/', data),
    removeCaretaker: (id) => apiClient.delete(`/caretakers/${id}/`),
    updateCaretakerPermissions: (id, data) => apiClient.patch(`/caretakers/${id}/`, data),
};

// AI Chat API (if you have AI integration)
export const aiAPI = {
    sendMessage: (data) => apiClient.post('/ai/chat/', data),
    getChatHistory: (userId) => apiClient.get('/ai/chat-history/', { params: { user: userId } }),
};

// Health Tips API
export const healthTipsAPI = {
    getHealthTips: (params = {}) => apiClient.get('/health-tips/', { params }),
    getHealthTip: (id) => apiClient.get(`/health-tips/${id}/`),
};

// Documents/Files API
export const documentsAPI = {
    uploadDocument: (formData) => apiClient.post('/documents/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getDocuments: (userId) => apiClient.get('/documents/', { params: { user: userId } }),
    deleteDocument: (id) => apiClient.delete(`/documents/${id}/`),
};

// Device/IoT API (if you have device integration)
export const deviceAPI = {
    getDevices: (userId) => apiClient.get('/devices/', { params: { user: userId } }),
    connectDevice: (data) => apiClient.post('/devices/', data),
    disconnectDevice: (id) => apiClient.delete(`/devices/${id}/`),
    getDeviceData: (deviceId, params = {}) => apiClient.get(`/devices/${deviceId}/data/`, { params }),
};

export default {
    auth: authAPI,
    health: healthAPI,
    appointments: appointmentsAPI,
    medications: medicationsAPI,
    notifications: notificationsAPI,
    user: userAPI,
    caretakers: caretakersAPI,
    ai: aiAPI,
    healthTips: healthTipsAPI,
    documents: documentsAPI,
    device: deviceAPI,
};
