import { 
    healthAPI, 
    appointmentsAPI, 
    medicationsAPI, 
    notificationsAPI, 
    userAPI, 
    caretakersAPI,
    healthTipsAPI,
    documentsAPI 
} from '../api/services';

class DjangoDatabaseService {
    // ===== HEALTH METRICS =====
    async getHealthMetrics(userId, options = {}) {
        try {
            const params = {
                user: userId,
                ...options
            };
            
            const response = await healthAPI.getMetrics(userId, params);
            return {
                documents: response.data.results || response.data,
                total: response.data.count || response.data.length
            };
        } catch (error) {
            console.error('Error getting health metrics:', error);
            throw error;
        }
    }

    async createHealthMetric(metricData) {
        try {
            const response = await healthAPI.createMetric(metricData);
            return response.data;
        } catch (error) {
            console.error('Error creating health metric:', error);
            throw error;
        }
    }

    async updateHealthMetric(metricId, updateData) {
        try {
            const response = await healthAPI.updateMetric(metricId, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating health metric:', error);
            throw error;
        }
    }

    async deleteHealthMetric(metricId) {
        try {
            await healthAPI.deleteMetric(metricId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting health metric:', error);
            throw error;
        }
    }

    // ===== APPOINTMENTS =====
    async getUserAppointments(userId, options = {}) {
        try {
            const response = await appointmentsAPI.getUserAppointments(userId, options);
            return {
                documents: response.data.results || response.data,
                total: response.data.count || response.data.length
            };
        } catch (error) {
            console.error('Error getting user appointments:', error);
            throw error;
        }
    }

    async createAppointment(appointmentData) {
        try {
            const response = await appointmentsAPI.createAppointment(appointmentData);
            return response.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async updateAppointment(appointmentId, updateData) {
        try {
            const response = await appointmentsAPI.updateAppointment(appointmentId, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    async deleteAppointment(appointmentId) {
        try {
            await appointmentsAPI.deleteAppointment(appointmentId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }

    // ===== MEDICATIONS =====
    async getUserMedications(userId) {
        try {
            const response = await medicationsAPI.getMedications(userId);
            return {
                documents: response.data.results || response.data,
                total: response.data.count || response.data.length
            };
        } catch (error) {
            console.error('Error getting user medications:', error);
            throw error;
        }
    }

    async createMedication(medicationData) {
        try {
            const response = await medicationsAPI.createMedication(medicationData);
            return response.data;
        } catch (error) {
            console.error('Error creating medication:', error);
            throw error;
        }
    }

    async updateMedication(medicationId, updateData) {
        try {
            const response = await medicationsAPI.updateMedication(medicationId, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating medication:', error);
            throw error;
        }
    }

    async deleteMedication(medicationId) {
        try {
            await medicationsAPI.deleteMedication(medicationId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting medication:', error);
            throw error;
        }
    }

    // ===== NOTIFICATIONS =====
    async getUserNotifications(userId, options = {}) {
        try {
            const response = await notificationsAPI.getUserNotifications(userId, options);
            return {
                documents: response.data.results || response.data,
                total: response.data.count || response.data.length
            };
        } catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            const response = await notificationsAPI.markAsRead(notificationId);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllNotificationsAsRead(userId) {
        try {
            await notificationsAPI.markAllAsRead(userId);
            return { success: true };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // ===== USER PROFILE =====
    async getUserProfile(userId) {
        try {
            const response = await userAPI.getProfile(userId);
            return response.data;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    async updateUserProfile(userId, updateData) {
        try {
            const response = await userAPI.updateProfile(userId, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    // ===== CARETAKERS =====
    async getCaretakers(userId) {
        try {
            const response = await caretakersAPI.getCaretakers(userId);
            return {
                documents: response.data.results || response.data,
                total: response.data.count || response.data.length
            };
        } catch (error) {
            console.error('Error getting caretakers:', error);
            throw error;
        }
    }

    async addCaretaker(caretakerData) {
        try {
            const response = await caretakersAPI.addCaretaker(caretakerData);
            return response.data;
        } catch (error) {
            console.error('Error adding caretaker:', error);
            throw error;
        }
    }

    async removeCaretaker(caretakerId) {
        try {
            await caretakersAPI.removeCaretaker(caretakerId);
            return { success: true };
        } catch (error) {
            console.error('Error removing caretaker:', error);
            throw error;
        }
    }

    // ===== HEALTH TIPS =====
    async getHealthTips(options = {}) {
        try {
            const response = await healthTipsAPI.getHealthTips(options);
            return {
                documents: response.data.results || response.data,
                total: response.data.count || response.data.length
            };
        } catch (error) {
            console.error('Error getting health tips:', error);
            throw error;
        }
    }

    async getHealthTip(tipId) {
        try {
            const response = await healthTipsAPI.getHealthTip(tipId);
            return response.data;
        } catch (error) {
            console.error('Error getting health tip:', error);
            throw error;
        }
    }

    // ===== DOCUMENTS =====
    async uploadDocument(formData) {
        try {
            const response = await documentsAPI.uploadDocument(formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    }

    async getUserDocuments(userId) {
        try {
            const response = await documentsAPI.getDocuments(userId);
            return {
                documents: response.data.results || response.data,
                total: response.data.count || response.data.length
            };
        } catch (error) {
            console.error('Error getting user documents:', error);
            throw error;
        }
    }

    async deleteDocument(documentId) {
        try {
            await documentsAPI.deleteDocument(documentId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    // ===== HELPER METHODS =====
    
    // Method to maintain compatibility with existing code
    async getRoleByName(roleName) {
        // Since Django handles roles differently, we'll return a mock role object
        return {
            $id: roleName,
            name: roleName,
            is_active: true
        };
    }

    // Method to maintain compatibility with existing code
    async createUser(userData) {
        // This would be handled by the Django auth registration
        return userData;
    }

    // Method to maintain compatibility with existing code
    async createUserProfile(profileData) {
        // This would be handled by the Django auth registration
        return profileData;
    }
}

export default new DjangoDatabaseService();
