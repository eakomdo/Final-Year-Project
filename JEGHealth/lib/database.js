import { databases, appwriteConfig, ID, Query } from './appwrite';

class DatabaseService {
    // ===== ROLES =====
    async createRole(roleData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.roleCollectionId,
                ID.unique(),
                roleData
            );
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }

    async getRoleByName(roleName) {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.roleCollectionId,
                [Query.equal('name', roleName)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error getting role by name:', error);
            throw error;
        }
    }

    async getAllRoles() {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.roleCollectionId,
                [Query.equal('is_active', true)]
            );
        } catch (error) {
            console.error('Error getting all roles:', error);
            throw error;
        }
    }

    // ===== USERS =====
    async createUser(userData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userData.userId,
                {
                    email: userData.email,
                    full_name: userData.fullName,
                    phone_number: userData.phoneNumber || null,
                    role_id: userData.roleId,
                    is_verified: false,
                    is_active: true,
                    profile_picture: null,
                    last_login: null
                }
            );
        } catch (error) {
            console.error('Error creating user document:', error);
            throw error;
        }
    }

    async getUser(userId) {
        try {
            return await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId
            );
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    async updateUser(userId, updateData) {
        try {
            return await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                updateData
            );
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async updateUserLastLogin(userId) {
        try {
            return await this.updateUser(userId, {
                last_login: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    // ===== USER PROFILES =====
    async createUserProfile(profileData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                ID.unique(),
                {
                    user_id: profileData.userId,
                    profile_type: profileData.profileType,
                    data: JSON.stringify(profileData.data)
                }
            );
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                [Query.equal('user_id', userId)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    async updateUserProfile(profileId, profileData) {
        try {
            return await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                profileId,
                {
                    data: JSON.stringify(profileData)
                }
            );
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    // ===== HEALTH METRICS =====
    async createHealthMetric(metricData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.healthMetricCollectionId,
                ID.unique(),
                {
                    patient_id: metricData.patientId,
                    metric_type: metricData.metricType,
                    value: metricData.value,
                    unit: metricData.unit,
                    systolic_value: metricData.systolicValue || null,
                    diastolic_value: metricData.diastolicValue || null,
                    recorded_at: metricData.recordedAt || new Date().toISOString(),
                    recorded_by_id: metricData.recordedById || null,
                    device_id: metricData.deviceId || null,
                    is_manual_entry: metricData.isManualEntry !== false,
                    verified_by_id: metricData.verifiedById || null,
                    notes: metricData.notes || null
                }
            );
        } catch (error) {
            console.error('Error creating health metric:', error);
            throw error;
        }
    }

    async getHealthMetrics(patientId, options = {}) {
        try {
            const {
                metricType = null,
                limit = 50,
                startDate = null,
                endDate = null
            } = options;

            const queries = [
                Query.equal('patient_id', patientId),
                Query.orderDesc('recorded_at'),
                Query.limit(limit)
            ];

            if (metricType) {
                queries.push(Query.equal('metric_type', metricType));
            }

            if (startDate) {
                queries.push(Query.greaterThanEqual('recorded_at', startDate));
            }

            if (endDate) {
                queries.push(Query.lessThanEqual('recorded_at', endDate));
            }

            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.healthMetricCollectionId,
                queries
            );
        } catch (error) {
            console.error('Error getting health metrics:', error);
            throw error;
        }
    }

    // ===== MEDICATIONS =====
    async createMedication(medicationData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.medicationCollectionId,
                ID.unique(),
                {
                    patient_id: medicationData.patientId,
                    prescribed_by_id: medicationData.prescribedById || null,
                    medication_name: medicationData.medicationName,
                    dosage: medicationData.dosage,
                    frequency: medicationData.frequency,
                    start_date: medicationData.startDate,
                    end_date: medicationData.endDate || null,
                    instructions: medicationData.instructions || null,
                    side_effects: medicationData.sideEffects || null,
                    is_active: medicationData.isActive !== false,
                    reminder_times: medicationData.reminderTimes || null
                }
            );
        } catch (error) {
            console.error('Error creating medication:', error);
            throw error;
        }
    }

    async getUserMedications(patientId, activeOnly = true) {
        try {
            const queries = [
                Query.equal('patient_id', patientId),
                Query.orderDesc('$createdAt')
            ];

            if (activeOnly) {
                queries.push(Query.equal('is_active', true));
            }

            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.medicationCollectionId,
                queries
            );
        } catch (error) {
            console.error('Error getting user medications:', error);
            throw error;
        }
    }

    // ===== APPOINTMENTS =====
    async createAppointment(appointmentData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.appointmentCollectionId,
                ID.unique(),
                {
                    patient_id: appointmentData.patientId,
                    doctor_id: appointmentData.doctorId || null,
                    doctor_name: appointmentData.doctorName,
                    specialty: appointmentData.specialty || null,
                    clinic_name: appointmentData.clinicName || null,
                    clinic_address: appointmentData.clinicAddress || null,
                    phone_number: appointmentData.phoneNumber || null,
                    appointment_date: appointmentData.appointmentDate,
                    duration_minutes: appointmentData.durationMinutes || 30,
                    appointment_type: appointmentData.appointmentType || 'consultation',
                    reason: appointmentData.reason || null,
                    notes: appointmentData.notes || null,
                    status: appointmentData.status || 'scheduled',
                    reminder_sent: false
                }
            );
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async getUserAppointments(patientId, options = {}) {
        try {
            const { 
                upcoming = false,
                limit = 50,
                status = null
            } = options;

            const queries = [
                Query.equal('patient_id', patientId),
                Query.orderDesc('appointment_date'),
                Query.limit(limit)
            ];

            if (upcoming) {
                queries.push(Query.greaterThan('appointment_date', new Date().toISOString()));
            }

            if (status) {
                queries.push(Query.equal('status', status));
            }

            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.appointmentCollectionId,
                queries
            );
        } catch (error) {
            console.error('Error getting user appointments:', error);
            throw error;
        }
    }

    // ===== NOTIFICATIONS =====
    async createNotification(notificationData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                ID.unique(),
                {
                    user_id: notificationData.userId,
                    title: notificationData.title,
                    message: notificationData.message,
                    notification_type: notificationData.notificationType,
                    priority: notificationData.priority || 'medium',
                    is_read: false,
                    action_required: notificationData.actionRequired || false,
                    action_url: notificationData.actionUrl || null,
                    scheduled_for: notificationData.scheduledFor || null,
                    sent_at: notificationData.sentAt || new Date().toISOString(),
                    read_at: null,
                    metadata: notificationData.metadata || null
                }
            );
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async getUserNotifications(userId, options = {}) {
        try {
            const { 
                unreadOnly = false,
                limit = 50,
                notificationType = null
            } = options;

            const queries = [
                Query.equal('user_id', userId),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ];

            if (unreadOnly) {
                queries.push(Query.equal('is_read', false));
            }

            if (notificationType) {
                queries.push(Query.equal('notification_type', notificationType));
            }

            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                queries
            );
        } catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            return await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                notificationId,
                {
                    is_read: true,
                    read_at: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
}

export default new DatabaseService();