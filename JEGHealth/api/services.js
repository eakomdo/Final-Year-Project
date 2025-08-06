import { apiClient } from './config';

// Auth API calls
export const authAPI = {
    register: (userData) => apiClient.post('/api/v1/auth/register/', userData),
    login: (credentials) => apiClient.post('/api/v1/auth/login/', credentials),
    logout: () => apiClient.post('/api/v1/auth/logout/'),
    getCurrentUser: () => apiClient.get('/api/v1/auth/current-user/'),
    refreshToken: (refreshToken) => apiClient.post('/api/v1/auth/token/refresh/', { refresh: refreshToken }),
    resetPassword: (email) => apiClient.post('/api/v1/auth/password/reset/', { email }),
    confirmPasswordReset: (data) => apiClient.post('/api/v1/auth/password/reset/confirm/', data),
    changePassword: (data) => apiClient.post('/api/v1/auth/change-password/', data),
    // Profile methods - using correct backend endpoints
    getProfile: () => apiClient.get('/api/v1/auth/profile/'),
    getProfileDetails: () => apiClient.get('/api/v1/auth/profile/details/'),
    getBasicProfile: () => apiClient.get('/api/v1/auth/profile/basic/'),
    getPersonalProfile: () => apiClient.get('/api/v1/auth/profile/personal/'),
    updateProfile: (data) => apiClient.patch('/api/v1/auth/profile/', data),
    updateProfileDetails: (data) => apiClient.patch('/api/v1/auth/profile/details/', data),
    updateBasicProfile: (data) => apiClient.patch('/api/v1/auth/profile/basic/', data),
    updatePersonalProfile: (data) => apiClient.patch('/api/v1/auth/profile/personal/', data),
    // Profile image upload
    uploadProfilePicture: (imageUri) => {
        const formData = new FormData();
        formData.append('profile_image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'profile.jpg',
        });
        return apiClient.patch('/api/v1/auth/profile/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    // Role management (admin only)
    getRoles: () => apiClient.get('/api/v1/auth/roles/'),
    createRole: (data) => apiClient.post('/api/v1/auth/roles/', data),
    assignRole: (data) => apiClient.post('/api/v1/auth/assign-role/', data),
};

// Health Metrics API
export const healthAPI = {
    getMetrics: (userId, params = {}) => apiClient.get(`/api/v1/health-metrics/`, { params: { user: userId, ...params } }),
    createMetric: (data) => apiClient.post('/api/v1/health-metrics/', data),
    updateMetric: (id, data) => apiClient.patch(`/api/v1/health-metrics/${id}/`, data),
    deleteMetric: (id) => apiClient.delete(`/api/v1/health-metrics/${id}/`),
    getStats: (userId) => apiClient.get(`/api/v1/health-metrics/stats/`, { params: { user: userId } }),
};

// Appointments API
export const appointmentsAPI = {
    // List user's appointments
    getAppointments: (params = {}) => apiClient.get('/api/v1/appointments/', { params }),
    
    // Create new appointment
    createAppointment: (data) => apiClient.post('/api/v1/appointments/create/', data),
    
    // Get specific appointment details
    getAppointmentDetails: (appointmentId) => apiClient.get(`/api/v1/appointments/${appointmentId}/`),
    
    // Update appointment
    updateAppointment: (appointmentId, data) => apiClient.put(`/api/v1/appointments/${appointmentId}/update/`, data),
    
    // Cancel appointment
    cancelAppointment: (appointmentId) => apiClient.delete(`/api/v1/appointments/${appointmentId}/cancel/`),
    
    // Reschedule appointment
    rescheduleAppointment: (appointmentId, data) => apiClient.post(`/api/v1/appointments/${appointmentId}/reschedule/`, data),
    
    // Get appointment statistics
    getStats: () => apiClient.get('/api/v1/appointments/stats/'),
    
    // Get upcoming appointments
    getUpcoming: () => apiClient.get('/api/v1/appointments/upcoming/'),
    
    // Get appointment history
    getHistory: () => apiClient.get('/api/v1/appointments/history/'),
    
    // Get appointment booking choices (types, specialties, etc.)
    getBookingChoices: () => apiClient.get('/api/v1/appointments/frontend/choices/'),
    
    // Legacy methods for backward compatibility
    getUserAppointments: (userId, params = {}) => apiClient.get('/api/v1/appointments/', { 
        params: { 
            patient: userId, 
            ...params 
        } 
    }),
};

// Healthcare Providers API
export const providersAPI = {
    // List all doctors/providers
    getProviders: (params = {}) => apiClient.get('/api/v1/providers/', { params }),
    
    // Search providers by specialization
    getProvidersBySpecialization: (specialization) => apiClient.get('/api/v1/providers/', { 
        params: { specialization } 
    }),
    
    // Get specific provider details
    getProviderDetails: (providerId) => apiClient.get(`/api/v1/providers/${providerId}/`),
    
    // Search providers by name (for autocomplete)
    searchProviders: (query) => apiClient.get('/api/v1/providers/', { 
        params: { search: query } 
    }),
};

// Medications API
export const medicationsAPI = {
    getMedications: (userId) => apiClient.get('/api/v1/medications/', { params: { user: userId } }),
    createMedication: (data) => apiClient.post('/api/v1/medications/', data),
    updateMedication: (id, data) => apiClient.patch(`/api/v1/medications/${id}/`, data),
    deleteMedication: (id) => apiClient.delete(`/api/v1/medications/${id}/`),
};

// Notifications API
export const notificationsAPI = {
    getNotifications: (userId, params = {}) => apiClient.get('/api/v1/notifications/', { params: { user: userId, ...params } }),
    markAsRead: (id) => apiClient.patch(`/api/v1/notifications/${id}/`, { is_read: true }),
    markAllAsRead: (userId) => apiClient.post('/api/v1/notifications/mark-all-read/', { user: userId }),
    getUserNotifications: (userId, params = {}) => apiClient.get('/api/v1/notifications/', { 
        params: { 
            recipient: userId, 
            ...params 
        } 
    }),
};

// Profile/User API
export const userAPI = {
    getProfile: (userId) => apiClient.get(`/api/v1/users/${userId}/`),
    updateProfile: (userId, data) => apiClient.patch(`/api/v1/users/${userId}/`, data),
    getUserProfile: () => apiClient.get('/api/v1/auth/profile/'),
    updateUserProfile: (data) => apiClient.patch('/api/v1/auth/profile/', data),
};

// Caretakers API
export const caretakersAPI = {
    getCaretakers: (userId) => apiClient.get('/api/v1/caretakers/', { params: { patient: userId } }),
    addCaretaker: (data) => apiClient.post('/api/v1/caretakers/', data),
    removeCaretaker: (id) => apiClient.delete(`/api/v1/caretakers/${id}/`),
    updateCaretakerPermissions: (id, data) => apiClient.patch(`/api/v1/caretakers/${id}/`, data),
};

// AI Chat API (if you have AI integration)
export const aiAPI = {
    sendMessage: (data) => apiClient.post('/api/v1/ai/chat/', data),
    getChatHistory: (userId) => apiClient.get('/api/v1/ai/chat-history/', { params: { user: userId } }),
};

// Health Tips API
export const healthTipsAPI = {
    getHealthTips: (params = {}) => apiClient.get('/api/v1/health-tips/', { params }),
    getHealthTip: (id) => apiClient.get(`/api/v1/health-tips/${id}/`),
};

// Documents/Files API
export const documentsAPI = {
    uploadDocument: (formData) => apiClient.post('/api/v1/documents/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getDocuments: (userId) => apiClient.get('/api/v1/documents/', { params: { user: userId } }),
    deleteDocument: (id) => apiClient.delete(`/api/v1/documents/${id}/`),
};

// Device/IoT API (if you have device integration)
export const deviceAPI = {
    getDevices: (userId) => apiClient.get('/api/v1/devices/', { params: { user: userId } }),
    connectDevice: (data) => apiClient.post('/api/v1/devices/', data),
    disconnectDevice: (id) => apiClient.delete(`/api/v1/devices/${id}/`),
    getDeviceData: (deviceId, params = {}) => apiClient.get(`/api/v1/devices/${deviceId}/data/`, { params }),
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
