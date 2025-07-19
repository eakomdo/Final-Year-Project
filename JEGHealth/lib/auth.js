import { account, ID } from './appwrite';
import DatabaseService from './database';

class AuthService {
    // Register new user
    async registerUser(userData) {
        try {
            console.log('Starting user registration for:', userData.email);

            // Step 1: Create auth account
            const authUser = await account.create(
                ID.unique(),
                userData.email,
                userData.password,
                userData.fullName
            );

            console.log('Auth user created:', authUser.$id);

            // Step 2: Get role by name
            const role = await DatabaseService.getRoleByName(userData.roleName);
            if (!role) {
                throw new Error(`Role "${userData.roleName}" not found. Please ensure roles are initialized.`);
            }

            // Step 3: Create user document
            const userDocument = await DatabaseService.createUser({
                userId: authUser.$id,
                email: userData.email,
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber,
                roleId: role.$id
            });

            // Step 4: Create user profile
            const profileData = this.buildProfileData(userData.roleName, userData.profileData || {});
            const userProfile = await DatabaseService.createUserProfile({
                userId: authUser.$id,
                profileType: userData.roleName,
                data: profileData
            });

            console.log('User registration completed successfully');

            return {
                authUser,
                userDocument,
                userProfile,
                role
            };

        } catch (error) {
            console.error('Error during registration:', error);
            
            // Cleanup: If user was created but other steps failed, you might want to delete the auth user
            // This depends on your error handling strategy
            
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    // Login user
    async loginUser(email, password) {
        try {
            console.log('Starting user login for:', email);

            // Create session
            const session = await account.createEmailPasswordSession(email, password);
            
            // Get user details
            const authUser = await account.get();
            
            // Update last login
            await DatabaseService.updateUserLastLogin(authUser.$id);

            console.log('User login successful for:', authUser.email);

            return { session, authUser };

        } catch (error) {
            console.error('Error during login:', error);
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    // Get current user with full profile
    async getCurrentUser() {
        try {
            const authUser = await account.get();
            const userDocument = await DatabaseService.getUser(authUser.$id);
            const userProfile = await DatabaseService.getUserProfile(authUser.$id);
            
            // Get role information
            let role = null;
            if (userDocument?.role_id) {
                try {
                    const roleResponse = await DatabaseService.getAllRoles();
                    role = roleResponse.documents.find(r => r.$id === userDocument.role_id);
                } catch (roleError) {
                    console.warn('Could not fetch role information:', roleError);
                }
            }
            
            return {
                authUser,
                userDocument,
                userProfile,
                role
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    }

    // Check if user is authenticated
    async isAuthenticated() {
        try {
            await account.get();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Logout user
    async logoutUser() {
        try {
            await account.deleteSession('current');
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error);
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    // Send password recovery email
    async resetPassword(email) {
        try {
            await account.createRecovery(
                email,
                'https://yourapp.com/reset-password' // You'll need to implement this
            );
            console.log('Password recovery email sent');
        } catch (error) {
            console.error('Error sending password recovery:', error);
            throw new Error(`Password recovery failed: ${error.message}`);
        }
    }

    // Update password
    async updatePassword(newPassword, oldPassword) {
        try {
            await account.updatePassword(newPassword, oldPassword);
            console.log('Password updated successfully');
        } catch (error) {
            console.error('Error updating password:', error);
            throw new Error(`Password update failed: ${error.message}`);
        }
    }

    // Build profile data based on role
    buildProfileData(roleName, profileData) {
        const baseData = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        switch (roleName) {
            case 'patient':
                return {
                    ...baseData,
                    date_of_birth: profileData.dateOfBirth || null,
                    gender: profileData.gender || null,
                    height: profileData.height || null,
                    weight: profileData.weight || null,
                    blood_type: profileData.bloodType || null,
                    emergency_contact: {
                        name: profileData.emergencyContactName || null,
                        phone: profileData.emergencyContactPhone || null,
                        relationship: profileData.emergencyContactRelationship || null
                    },
                    medical_conditions: profileData.medicalConditions || [],
                    allergies: profileData.allergies || [],
                    medications: profileData.currentMedications || [],
                    insurance_info: {
                        provider: profileData.insuranceProvider || null,
                        policy_number: profileData.policyNumber || null,
                        group_number: profileData.groupNumber || null
                    },
                    preferences: {
                        notification_enabled: true,
                        reminder_enabled: true,
                        data_sharing_consent: profileData.dataConsent || false
                    }
                };

            case 'doctor':
                return {
                    ...baseData,
                    license_number: profileData.licenseNumber || null,
                    specialty: profileData.specialty || null,
                    sub_specialty: profileData.subSpecialty || null,
                    clinic_name: profileData.clinicName || null,
                    clinic_address: profileData.clinicAddress || null,
                    years_experience: profileData.yearsExperience || 0,
                    education: profileData.education || [],
                    certifications: profileData.certifications || [],
                    languages: profileData.languages || ['English'],
                    consultation_fee: profileData.consultationFee || 0,
                    availability: profileData.availability || {},
                    bio: profileData.bio || null,
                    verified: false,
                    rating: 0,
                    total_consultations: 0
                };

            case 'caretaker':
                return {
                    ...baseData,
                    relationship: profileData.relationship || null,
                    address: profileData.address || null,
                    unique_code: this.generateUniqueCode(),
                    can_access_records: profileData.canAccessRecords !== false,
                    emergency_contact: profileData.emergencyContact !== false,
                    notification_preferences: {
                        emergency_alerts: true,
                        health_updates: profileData.healthUpdates !== false,
                        appointment_reminders: profileData.appointmentReminders !== false
                    }
                };

            case 'admin':
                return {
                    ...baseData,
                    department: profileData.department || 'system_admin',
                    access_level: profileData.accessLevel || 'admin',
                    employee_id: profileData.employeeId || null,
                    permissions: profileData.permissions || ['user_management', 'system_monitoring']
                };

            default:
                return { ...baseData, ...profileData };
        }
    }

    // Generate unique 6-character alphanumeric code for caretakers
    generateUniqueCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Get available roles for registration
    async getAvailableRoles() {
        try {
            const rolesResponse = await DatabaseService.getAllRoles();
            return rolesResponse.documents || [];
        } catch (error) {
            console.error('Error getting available roles:', error);
            return [];
        }
    }
}

export default new AuthService();