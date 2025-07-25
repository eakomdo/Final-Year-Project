import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/services';

class DjangoAuthService {
    // Register new user
    async registerUser(userData) {
        try {
            console.log('Starting user registration for:', userData.email);

            const response = await authAPI.register({
                email: userData.email,
                password: userData.password,
                full_name: userData.fullName,
                phone_number: userData.phoneNumber,
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
            const { access, refresh, user } = response.data;

            // Store tokens
            await AsyncStorage.setItem('access_token', access);
            await AsyncStorage.setItem('refresh_token', refresh);

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
                return null;
            }

            const response = await authAPI.getCurrentUser();
            const user = response.data;

            return {
                authUser: user,
                userDocument: user,
                userProfile: user.profile,
                role: { name: user.role }
            };

        } catch (error) {
            console.error('Get current user error:', error.message);
            // If token is invalid, clear it
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
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

    // Clear all stored data
    async clearStoredData() {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    }
}

export default new DjangoAuthService();
