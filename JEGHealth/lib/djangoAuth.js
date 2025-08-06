import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/services';

class DjangoAuthService {
    // Register new user
    async registerUser(userData) {
        try {
            console.log('Starting user registration for:', userData.email);

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

            console.log('User registration completed successfully');

            return {
                success: true,
                authUser: user,
                userDocument: user,
                userProfile: user.profile,
                role: { name: user.role }
            };

        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
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
            console.log('Starting user login for:', email);

            const response = await authAPI.login({ email, password });
            const { tokens, user } = response.data;

            console.log('Login response:', response.data)
            console.log('Login response:', tokens.access)
            console.log('Login response:', tokens.refresh)
            console.log('Login response:',user);
            // Store tokens
            await AsyncStorage.setItem('access_token', tokens.access);
            await AsyncStorage.setItem('refresh_token', tokens.refresh);

            console.log('User login completed successfully');

            return {
                success: true,
                authUser: user,
                userDocument: user,
                userProfile: user.profile,
                role: { name: user.role }
            };

        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.detail || 
                error.response?.data?.error ||
                'Invalid email or password'
            );
        }
    }

    // Logout user
    async logoutUser() {
        try {
            // Try to logout from server
            await authAPI.logout();
        } catch (error) {
            console.warn('Server logout failed:', error.message);
        } finally {
            // Always clear local tokens
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        }

        return { success: true };
    }

    // Get current user
    async getCurrentUser() {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                console.log('No access token found for getCurrentUser');
                return null;
            }

            console.log('Making getCurrentUser API call...');
            const response = await authAPI.getCurrentUser();
            
            console.log('getCurrentUser full response:', JSON.stringify(response, null, 2));
            console.log('getCurrentUser response.data:', JSON.stringify(response.data, null, 2));
            console.log('getCurrentUser response status:', response.status);
            
            // Handle different possible response structures
            let user = response.data;
            
            // Some APIs might return data nested under different keys
            if (!user && response.user) {
                user = response.user;
                console.log('Found user data under response.user');
            } else if (!user && response.data?.user) {
                user = response.data.user;
                console.log('Found user data under response.data.user');
            } else if (!user && response.data?.data) {
                user = response.data.data;
                console.log('Found user data under response.data.data');
            }
            
            console.log('Final user object:', JSON.stringify(user, null, 2));
            console.log('getCurrentUser successful:', user?.email || user?.username || 'No email found');
            
            if (!user) {
                console.error('getCurrentUser returned null/undefined user data after all fallbacks');
                return null;
            }
            
            return {
                authUser: user,
                userDocument: user,
                userProfile: user.profile,
                role: { name: user.role || user.roles?.[0] }
            };

        } catch (error) {
            console.error('Get current user error:', error.message);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            
            // Only clear tokens for explicit auth errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('Auth error detected, clearing tokens');
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
                return false;
            }

            // Try to get current user to verify token
            const user = await this.getCurrentUser();
            return !!user;

        } catch (_error) {
            return false;
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            await authAPI.resetPassword(email);
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error.response?.data || error.message);
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
            console.error('Confirm password reset error:', error.response?.data || error.message);
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
            return access;

        } catch (error) {
            console.error('Token refresh error:', error.message);
            // Clear tokens if refresh fails
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            throw error;
        }
    }

    // Test method to verify API connectivity (for debugging)
    async testCurrentUserAPI() {
        try {
            console.log('=== TESTING CURRENT USER API ===');
            const token = await AsyncStorage.getItem('access_token');
            console.log('Token exists:', !!token);
            console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'None');
            
            const response = await authAPI.getCurrentUser();
            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', JSON.stringify(response.headers, null, 2));
            console.log('API Raw Response:', JSON.stringify(response, null, 2));
            
            return response;
        } catch (error) {
            console.error('Test API Error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
            throw error;
        }
    }

    // Clear all stored data
    async clearStoredData() {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    }
}

export default new DjangoAuthService();
