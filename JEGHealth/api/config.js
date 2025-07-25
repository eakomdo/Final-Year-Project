import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL, NETWORK_CONFIG } from '../lib/networkConfig';

// API Configuration
// Get the backend URL based on environment
const API_BASE_URL = getBackendURL();

console.log('Using API Base URL:', API_BASE_URL);

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
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken
                    });

                    const { access } = response.data;
                    await AsyncStorage.setItem('access_token', access);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return apiClient(originalRequest);
                }
            } catch (_refreshError) {
                // Refresh failed, clear tokens and redirect to login
                await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
                // You might want to trigger a logout action here
                console.log('Token refresh failed, user needs to log in again');
            }
        }

        return Promise.reject(error);
    }
);

export { API_BASE_URL, apiClient };
export default apiClient;
