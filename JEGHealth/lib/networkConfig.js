import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * Network configuration for different environments
 * This file helps manage different backend URLs for development and production
 */

// Development configuration
const DEVELOPMENT_CONFIG = {
    // Django backend running on 0.0.0.0:8000
    // IMPORTANT: 0.0.0.0 is not accessible from mobile devices/emulators
    
    // For physical devices, use your machine's actual IP address
    // Your Mac's IP address on the local network
    PHYSICAL_DEVICE_HOST: '192.168.1.50', // Your computer's IP address
    
    // For Android emulator, use 10.0.2.2 to reach host machine
    ANDROID_EMULATOR_HOST: '10.0.2.2',
    
    // For iOS simulator, localhost works fine
    IOS_SIMULATOR_HOST: 'localhost',
    
    // Default port
    DJANGO_PORT: '8000',
};

// Production configuration
const PRODUCTION_CONFIG = {
    DJANGO_HOST: 'your-domain.com',
    DJANGO_PORT: '443', // HTTPS
    USE_HTTPS: true,
};

// Helper function to detect if running on physical device
const isPhysicalDevice = () => {
    // For iOS physical device detection, check if we're not in simulator
    if (Platform.OS === 'ios') {
        // In development, iOS physical devices can be detected by checking if we're not in simulator
        return Platform.isPad !== undefined || Platform.isTVOS !== undefined || __DEV__;
    }
    
    // For Android, check various indicators
    return Platform.OS === 'android' && 
           (process.env.REACT_NATIVE_PACKAGER_HOSTNAME !== 'localhost' || !__DEV__);
};

// Helper function to get the correct host based on platform and environment
const getBackendHost = () => {
    if (__DEV__) {
        // Development environment
        if (Platform.OS === 'android') {
            // Check if running on physical device
            if (isPhysicalDevice()) {
                console.log('[DEBUG] Using physical device host for Android');
                return DEVELOPMENT_CONFIG.PHYSICAL_DEVICE_HOST;
            } else {
                console.log('[DEBUG] Using emulator host for Android');
                return DEVELOPMENT_CONFIG.ANDROID_EMULATOR_HOST;
            }
        } else if (Platform.OS === 'ios') {
            // For iOS physical device, always use your machine's IP
            // iOS simulator uses localhost, but physical device needs machine IP
            console.log('[DEBUG] Using physical device host for iOS');
            return DEVELOPMENT_CONFIG.PHYSICAL_DEVICE_HOST;
        }
        
        // Fallback to physical device host
        return DEVELOPMENT_CONFIG.PHYSICAL_DEVICE_HOST;
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

    // Log the backend URL for debugging
    console.log('[DEBUG] Platform:', Platform.OS);
    console.log('[DEBUG] Is Physical Device:', isPhysicalDevice());
    console.log('[DEBUG] Backend URL used for requests:', baseURL);
    
    return baseURL;
};

// Network timeout configuration - increased timeouts for mobile
export const NETWORK_CONFIG = {
    TIMEOUT: 30000, // 30 seconds (increased for mobile networks)
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 seconds
    CONNECT_TIMEOUT: 15000, // 15 seconds for connection
};

// Helper function to check network connectivity
export const checkNetworkConnectivity = async () => {
    try {
        const netInfo = await NetInfo.fetch();
        console.log('[DEBUG] Network Info:', {
            type: netInfo.type,
            isConnected: netInfo.isConnected,
            isInternetReachable: netInfo.isInternetReachable,
        });
        
        return netInfo.isConnected && netInfo.isInternetReachable;
    } catch (error) {
        console.warn('Could not check network connectivity:', error);
        return true; // Assume connected if check fails
    }
};

// Enhanced backend connection check with better error handling
export const checkBackendConnection = async () => {
    try {
        // First check network connectivity
        const isConnected = await checkNetworkConnectivity();
        if (!isConnected) {
            console.warn('No network connectivity detected');
            return false;
        }
        
        const url = getBackendURL();
        console.log(`[DEBUG] Testing connection to: ${url}/health/`);
        
        // Use a more robust fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.CONNECT_TIMEOUT);
        
        const response = await fetch(`${url}/health/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log(`[DEBUG] Backend connection test result: ${response.status}`);
        return response.ok;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Backend connection check timed out');
        } else {
            console.warn('Backend connection check failed:', error.message);
        }
        return false;
    }
};

// Helper function to get your machine's IP address automatically
export const getLocalIPAddress = async () => {
    try {
        // Try multiple IP detection services
        const services = [
            'https://api.ipify.org?format=json',
            'https://httpbin.org/ip',
            'https://jsonip.com'
        ];
        
        for (const service of services) {
            try {
                const response = await fetch(service, { timeout: 5000 });
                const data = await response.json();
                
                // Different services return IP in different formats
                const ip = data.ip || data.origin || data.query;
                if (ip) {
                    console.log(`[DEBUG] Detected IP from ${service}:`, ip);
                    return ip;
                }
            } catch (serviceError) {
                console.warn(`Failed to get IP from ${service}:`, serviceError.message);
                continue;
            }
        }
        
        return null;
    } catch (error) {
        console.warn('Could not get local IP:', error);
        return null;
    }
};

// Debug function to test different host configurations
export const testBackendHosts = async () => {
    const hosts = [
        DEVELOPMENT_CONFIG.PHYSICAL_DEVICE_HOST,
        DEVELOPMENT_CONFIG.ANDROID_EMULATOR_HOST,
        DEVELOPMENT_CONFIG.IOS_SIMULATOR_HOST,
        'localhost',
        '127.0.0.1'
    ];
    
    const results = {};
    
    for (const host of hosts) {
        try {
            const url = `http://${host}:${DEVELOPMENT_CONFIG.DJANGO_PORT}`;
            console.log(`[DEBUG] Testing host: ${url}/health/`);
            
            const response = await fetch(`${url}/health/`, {
                method: 'GET',
                timeout: 5000,
            });
            
            results[host] = {
                success: response.ok,
                status: response.status,
                url: url
            };
        } catch (error) {
            results[host] = {
                success: false,
                error: error.message,
                url: `http://${host}:${DEVELOPMENT_CONFIG.DJANGO_PORT}`
            };
        }
    }
    
    console.log('[DEBUG] Host test results:', results);
    return results;
};

export default {
    getBackendURL,
    NETWORK_CONFIG,
    checkBackendConnection,
    checkNetworkConnectivity,
    getLocalIPAddress,
    testBackendHosts,
    DEVELOPMENT_CONFIG,
    PRODUCTION_CONFIG,
};