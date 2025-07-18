import { databases, appwriteConfig } from './appwrite';
import { ID, Query } from 'appwrite';

class DatabaseService {
    // Users
    async createUser(userData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                userData
            );
        } catch (error) {
            console.error('Error creating user:', error);
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

    async getUserByEmail(email) {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal('email', email)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    // Roles
    async getRoles() {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.roleCollectionId,
                [Query.equal('is_active', true)]
            );
        } catch (error) {
            console.error('Error getting roles:', error);
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

    // User Profiles
    async createUserProfile(profileData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                ID.unique(),
                profileData
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

    // Health Metrics
    async createHealthMetric(metricData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.healthMetricCollectionId,
                ID.unique(),
                metricData
            );
        } catch (error) {
            console.error('Error creating health metric:', error);
            throw error;
        }
    }

    async getHealthMetrics(patientId, metricType = null, limit = 50) {
        try {
            const queries = [
                Query.equal('patient_id', patientId),
                Query.orderDesc('recorded_at'),
                Query.limit(limit)
            ];

            if (metricType) {
                queries.push(Query.equal('metric_type', metricType));
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

    // User Relationships (Caretakers, Doctor-Patient, etc.)
    async createUserRelationship(relationshipData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userRelationshipCollectionId,
                ID.unique(),
                relationshipData
            );
        } catch (error) {
            console.error('Error creating user relationship:', error);
            throw error;
        }
    }

    async getUserRelationships(userId, relationshipType = null) {
        try {
            const queries = [
                Query.equal('user_id', userId),
                Query.equal('status', 'active')
            ];

            if (relationshipType) {
                queries.push(Query.equal('relationship_type', relationshipType));
            }

            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userRelationshipCollectionId,
                queries
            );
        } catch (error) {
            console.error('Error getting user relationships:', error);
            throw error;
        }
    }

    // Notifications
    async createNotification(notificationData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                ID.unique(),
                notificationData
            );
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async getUserNotifications(userId, limit = 50) {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                [
                    Query.equal('user_id', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit)
                ]
            );
        } catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    }

    // Appointments
    async createAppointment(appointmentData) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.appointmentCollectionId,
                ID.unique(),
                appointmentData
            );
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async getUserAppointments(userId, limit = 50) {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.appointmentCollectionId,
                [
                    Query.equal('patient_id', userId),
                    Query.orderDesc('appointment_date'),
                    Query.limit(limit)
                ]
            );
        } catch (error) {
            console.error('Error getting user appointments:', error);
            throw error;
        }
    }
}

export default new DatabaseService();