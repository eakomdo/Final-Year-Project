import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/services';
import logger from '../utils/logger';

class DjangoAuthService {
    // Normalize user data to ensure consistent structure
    normalizeUserData(userData) {
        if (!userData) {
            logger.warn('normalizeUserData: Invalid or missing user data');
            return null;
        }

        logger.log('normalizeUserData: Starting normalization for:', JSON.stringify(userData, null, 2));

        // Extract ID with fallbacks
        const userId = userData.id || userData.pk || userData.user_id || userData.userId || null;
        
        // Extract email/username with fallbacks
        const email = userData.email || userData.user_email || userData.userEmail || null;
        const username = userData.username || userData.user_name || userData.userName || email || null;

        // Extract names with fallbacks
        const firstName = userData.first_name || userData.firstName || userData.fname || '';
        const lastName = userData.last_name || userData.lastName || userData.lname || '';

        // Extract profile data
        const profileData = userData.profile || userData.user_profile || userData.userProfile || {};
        
        // Extract role information
        const roleInfo = userData.role || userData.roles?.[0] || userData.user_role || userData.userRole || 'user';

        // Validate essential fields
        if (!userId && !email && !username) {
            logger.warn('normalizeUserData: No valid user ID, email, or username found in data');
            logger.warn('normalizeUserData: Available keys:', Object.keys(userData));
            return null;
        }

        // Create normalized structure
        const normalized = {
            authUser: {
                id: userId,
                username: username,
                email: email,
                first_name: firstName,
                last_name: lastName,
                is_active: userData.is_active !== undefined ? userData.is_active : true,
                date_joined: userData.date_joined || userData.dateJoined || null,
                last_login: userData.last_login || userData.lastLogin || null,
                // Include all original fields as fallback
                ...userData
            },
            userDocument: userData,
            userProfile: {
                contact: userData.contact || profileData.contact || '',
                phone: userData.phone || profileData.phone || userData.contact || '',
                address: userData.address || profileData.address || '',
                ...profileData
            },
            role: {
                name: typeof roleInfo === 'object' ? roleInfo.name || roleInfo.role || 'user' : roleInfo,
                permissions: userData.permissions || (typeof roleInfo === 'object' ? roleInfo.permissions : {}) || {}
            }
        };

        logger.log('normalizeUserData: Successfully normalized user data:', JSON.stringify(normalized, null, 2));
        return normalized;
    }

    // Register new user
    async registerUser(userData) {
        try {
            logger.log('Starting user registration for:', userData.email);
            const response = await authAPI.register({
                username: userData.email,
                email: userData.email,
                password: userData.password,
                password_confirm: userData.password_confirm,
                first_name: userData.first_name,
                last_name: userData.last_name,
                contact: userData.contact,
                role: userData.roleName,
                profile_data: userData.profileData || {}
            });

            const { access, refresh, user } = response.data;

            // Store tokens
            await AsyncStorage.setItem('access_token', access);
            await AsyncStorage.setItem('refresh_token', refresh);

            logger.log('User registration completed successfully');
            return {
                success: true,
                ...this.normalizeUserData(user)
            };
        } catch (error) {
            logger.error('Registration error:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.detail || 
                error.response?.data?.error ||
                'Registration failed. Please try again.'
            );
        }
    }

    // Login user
    async loginUser(email, password) {
        try {
            logger.log('Attempting to log in user:', email);
            const response = await authAPI.login({ email, password });

            logger.log('Login API raw response:', JSON.stringify(response, null, 2));

            // Defensive check for response data
            if (!response || !response.data) {
                logger.error('Login error: Invalid response from server.');
                throw new Error('Invalid response from server.');
            }

            logger.log('Login response data structure:', {
                hasData: !!response.data,
                dataKeys: Object.keys(response.data),
                dataContent: response.data
            });

            const { tokens, authUser, user } = response.data;

            // Defensive check for tokens and user data
            if (!tokens || !tokens.access || !tokens.refresh) {
                logger.error('Login error: Missing or incomplete token data', {
                    hasTokens: !!tokens,
                    hasAccess: tokens?.access ? true : false,
                    hasRefresh: tokens?.refresh ? true : false,
                });
                throw new Error('Incomplete token data from server.');
            }

            // Handle different user data structures - check both 'user' and 'authUser'
            const userData = user || authUser;
            if (!userData) {
                logger.error('Login error: Missing user data in response', {
                    hasUser: !!user,
                    hasAuthUser: !!authUser,
                    availableKeys: Object.keys(response.data)
                });
                throw new Error('Missing user data in server response.');
            }

            logger.log('Login response validated successfully:', {
                userId: userData?.id,
                userKeys: Object.keys(userData),
                tokenLength: tokens.access.length
            });

            await AsyncStorage.setItem('access_token', tokens.access);
            await AsyncStorage.setItem('refresh_token', tokens.refresh);

            const normalizedData = this.normalizeUserData(userData);
            if (!normalizedData) {
                logger.error('Login user data normalization failed');
                throw new Error('Invalid user data in login response');
            }

            logger.log('Login successful, returning normalized data');
            return {
                success: true,
                ...normalizedData,
            };
        } catch (error) {
            logger.error('Login error:', error.message);
            if (error.response) {
                logger.error('Login error response:', error.response?.data);
            }
            const errorMessage =
                error.response?.data?.detail ||
                error.response?.data?.error ||
                (error.message.includes('Network') ? 'Cannot connect to server.' : error.message);
            
            throw new Error(errorMessage);
        }
    }

    // Logout user
    async logoutUser() {
        try {
            await authAPI.logout();
        } catch (error) {
            logger.warn('Server logout failed:', error.message);
        } finally {
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        }
        return { success: true };
    }

    // Get current user
    async getCurrentUser() {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                logger.log('No access token found for getCurrentUser');
                return null;
            }

            logger.log('Making getCurrentUser API call...');
            const response = await authAPI.getCurrentUser();
            let userData = response.data;

            // Handle various response structures
            if (userData.results && Array.isArray(userData.results)) {
                userData = userData.results[0];
            } else if (userData.user) {
                userData = userData.user;
            } else if (userData.data) {
                userData = userData.data;
            }

            if (!userData) {
                logger.error('getCurrentUser: No valid user data found');
                logger.error('Response keys:', Object.keys(response));
                return null;
            }

            logger.log('Extracted user data:', JSON.stringify(userData, null, 2));
            const normalizedData = this.normalizeUserData(userData);
            if (!normalizedData) {
                logger.error('Normalization failed for user data');
                return null;
            }

            return normalizedData;
        } catch (error) {
            logger.error('Get current user error:', error.message, error.response?.data);
            if (error.response?.status === 401 || error.response?.status === 403) {
                logger.log('Auth error detected, clearing tokens');
                await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            }
            return null;
        }
    }

    // Check if user is authenticated
    async isAuthenticated() {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                logger.log('isAuthenticated: No token found');
                return false;
            }
            const userData = await this.getCurrentUser();
            const isAuth = !!userData && !!userData.authUser;
            logger.log('isAuthenticated result:', isAuth);
            return isAuth;
        } catch (error) {
            logger.error('isAuthenticated error:', error.message);
            return false;
        }
    }

    // Validate token and return user data
    async validateToken() {
        try {
            logger.log('=== VALIDATE TOKEN CALLED ===');
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                logger.log('validateToken: No token found');
                return { isValid: false, userData: null };
            }

            const userData = await this.getCurrentUser();
            if (!userData || !userData.authUser) {
                logger.log('validateToken: No valid user data returned');
                return { isValid: false, userData: null };
            }

            return {
                isValid: true,
                userData
            };
        } catch (error) {
            logger.error('validateToken error:', error.message);
            return { isValid: false, userData: null, error: error.message };
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            await authAPI.resetPassword(email);
            return { success: true };
        } catch (error) {
            logger.error('Reset password error:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.detail || 
                error.response?.data?.error ||
                'Failed to send reset email'
            );
        }
    }

    // Confirm password reset
    async confirmPasswordReset(data) {
        try {
            await authAPI.confirmPasswordReset(data);
            return { success: true };
        } catch (error) {
            logger.error('Confirm password reset error:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.detail || 
                error.response?.data?.error ||
                'Failed to reset password'
            );
        }
    }

    // Get access token
    async getAccessToken() {
        return await AsyncStorage.getItem('access_token');
    }

    // Get refresh token
    async getRefreshToken() {
        return await AsyncStorage.getItem('refresh_token');
    }

    // Refresh access token
    async refreshAccessToken() {
        try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            const response = await authAPI.refreshToken(refreshToken);
            const { access } = response.data;
            await AsyncStorage.setItem('access_token', access);
            logger.log('Access token refreshed successfully');
            return access;
        } catch (error) {
            logger.error('Token refresh error:', error.message, error.response?.data);
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            throw error;
        }
    }

    // Test method to verify API connectivity
    async testCurrentUserAPI() {
        try {
            logger.log('=== TESTING CURRENT USER API ===');
            const token = await AsyncStorage.getItem('access_token');
            logger.log('Token exists:', !!token);
            const response = await authAPI.getCurrentUser();
            logger.log('API Response:', JSON.stringify(response, null, 2));
            const normalizedData = this.normalizeUserData(response.data);
            logger.log('Normalized data:', JSON.stringify(normalizedData, null, 2));
            return response;
        } catch (error) {
            logger.error('Test API Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }

    // Clear all stored data
    async clearStoredData() {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        logger.log('All stored auth data cleared');
    }

    // Debug method to check current state
    async debugAuthState() {
        try {
            logger.log('=== DEBUG AUTH STATE ===');
            const accessToken = await AsyncStorage.getItem('access_token');
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            logger.log('Access token exists:', !!accessToken);
            logger.log('Refresh token exists:', !!refreshToken);
            if (accessToken) {
                const userData = await this.getCurrentUser();
                logger.log('Current user data:', userData ? JSON.stringify(userData, null, 2) : 'null');
            }
        } catch (error) {
            logger.error('Debug auth state error:', error.message);
        }
    }
}

export default new DjangoAuthService();