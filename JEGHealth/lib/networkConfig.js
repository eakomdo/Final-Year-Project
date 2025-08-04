import { Platform } from 'react-native';

/**
 * Network configuration for different environments
 * This file helps manage different backend URLs for development and production
 */

// Development configuration
const DEVELOPMENT_CONFIG = {
    // Update this IP address to your machine's IP where Django is running
    DJANGO_HOST: '192.168.1.246', // <-- Your machine's IP where Django is running
    DJANGO_PORT: '8000',
    
    // For Android emulator, use this IP to reach host machine
    ANDROID_EMULATOR_HOST: '192.168.1.246',
    
    // For iOS simulator, localhost works fine
    IOS_SIMULATOR_HOST: 'localhost',
};

// Production configuration
const PRODUCTION_CONFIG = {
    DJANGO_HOST: 'your-domain.com',
    DJANGO_PORT: '443', // HTTPS
    USE_HTTPS: true,
};

// Helper function to get the correct host based on platform and environment
const getBackendHost = () => {
    if (__DEV__) {
        // Development environment
        if (Platform.OS === 'android') {
            // For Android emulator, use 10.0.2.2 to reach host machine
            // For Android physical device, use your machine's IP
            return DEVELOPMENT_CONFIG.ANDROID_EMULATOR_HOST;
        } else if (Platform.OS === 'ios') {
            // For iOS simulator, localhost should work
            // For iOS physical device, use your machine's IP
            return DEVELOPMENT_CONFIG.DJANGO_HOST;
        }
        return DEVELOPMENT_CONFIG.DJANGO_HOST;
    } else {
        // Production environment
        return PRODUCTION_CONFIG.DJANGO_HOST;
    }
};

const getBackendPort = () => {
    if (__DEV__) {
        return DEVELOPMENT_CONFIG.DJANGO_PORT;
    } else {
        return PRODUCTION_CONFIG.DJANGO_PORT;
    }
};

const getProtocol = () => {
    if (__DEV__) {
        return 'http';
    } else {
        return PRODUCTION_CONFIG.USE_HTTPS ? 'https' : 'http';
    }
};

// Construct the full backend URL
export const getBackendURL = () => {
    const protocol = getProtocol();
    const host = getBackendHost();
    const port = getBackendPort();
    // Don't include port if it's the default for the protocol
    const includePort = (protocol === 'http' && port !== '80') || 
                       (protocol === 'https' && port !== '443');
    const baseURL = includePort ? 
        `${protocol}://${host}:${port}` : 
        `${protocol}://${host}`;

    // Log the full backend URL for debugging
    const fullURL = `${baseURL}/api/v1`;
    console.log('[DEBUG] Backend URL used for requests:', fullURL);
    return fullURL;
};

// Network timeout configuration
export const NETWORK_CONFIG = {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
};

// Helper function to check if backend is reachable
export const checkBackendConnection = async () => {
    try {
        const url = getBackendURL();
        const response = await fetch(`${url}/health/`, {
            method: 'GET',
            timeout: NETWORK_CONFIG.TIMEOUT,
        });
        
        return response.ok;
    } catch (error) {
        console.warn('Backend connection check failed:', error);
        return false;
    }
};

// Helper function to get local IP address (for development setup)
export const getLocalIPAddress = async () => {
    try {
        // This is a simple way to get local IP, you might want to use a more robust method
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.warn('Could not get local IP:', error);
        return null;
    }
};

export default {
    getBackendURL,
    NETWORK_CONFIG,
    checkBackendConnection,
    getLocalIPAddress,
    DEVELOPMENT_CONFIG,
    PRODUCTION_CONFIG,
};
