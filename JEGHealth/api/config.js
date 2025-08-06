import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL, NETWORK_CONFIG } from '../lib/networkConfig';

// API Configuration
// Get the backend URL based on environment
const API_BASE_URL = getBackendURL();

console.log('Using API Base URL:', API_BASE_URL);

// Global auth state handler - will be set by AuthContext
let globalAuthHandler = null;

const setGlobalAuthHandler = (handler) => {
    globalAuthHandler = handler;
};

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: NETWORK_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (refreshToken) {
                    console.log('Attempting to refresh expired token...');
                    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
                        refresh: refreshToken
                    });

                    const { access } = response.data;
                    await AsyncStorage.setItem('access_token', access);
                    console.log('Token refreshed successfully');

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and trigger logout
                console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
                await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
                
                // Trigger global logout if handler is available
                if (globalAuthHandler && typeof globalAuthHandler.handleAuthFailure === 'function') {
                    globalAuthHandler.handleAuthFailure('Session expired. Please login again.');
                }
                
                console.log('Token refresh failed, user needs to log in again');
            }
        }

        // For network errors or other issues, check if it's an auth-related error
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Authentication failed - status:', error.response?.status);
            if (globalAuthHandler && typeof globalAuthHandler.handleAuthFailure === 'function') {
                globalAuthHandler.handleAuthFailure('Authentication failed. Please login again.');
            }
        }

        return Promise.reject(error);
    }
);

export { API_BASE_URL, apiClient, setGlobalAuthHandler };
export default apiClient;
