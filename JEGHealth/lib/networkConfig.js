import { Platform } from 'react-native';

/**
 * Network configuration for different environments
 * This file helps manage different backend URLs for development and production
 */

// Development configuration
const DEVELOPMENT_CONFIG = {
    // Your machine's current IP address on the local network
    DJANGO_HOST: '192.168.1.50', // <-- Updated to your current machine's IP
    DJANGO_PORT: '8000',
    
    // For Android emulator, use special IP to reach host machine
    ANDROID_EMULATOR_HOST: '10.0.2.2',
    
    // For iOS simulator, localhost works fine
    IOS_SIMULATOR_HOST: 'localhost',
};

// Production configuration
const PRODUCTION_CONFIG = {
    DJANGO_HOST: 'your-domain.com',
    DJANGO_PORT: '443', // HTTPS
    USE_HTTPS: true,
};

// Helper function to detect if running on physical device vs simulator/emulator
const isPhysicalDevice = () => {
    // This is a simple heuristic - you could also use expo-device for more accurate detection
    return Platform.OS === 'ios' ? 
        !__DEV__ || (Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV) :
        Platform.OS === 'android';
};

// Helper function to get the correct host based on platform and environment
const getBackendHost = () => {
    if (__DEV__) {
        // Development environment
        if (Platform.OS === 'android') {
            // Check if it's Android emulator vs physical device
            // For emulator, use special IP; for physical device, use machine IP
            return isPhysicalDevice() ? 
                DEVELOPMENT_CONFIG.DJANGO_HOST : 
                DEVELOPMENT_CONFIG.ANDROID_EMULATOR_HOST;
        } else if (Platform.OS === 'ios') {
            // For iOS: use localhost for simulator, machine IP for physical device
            // Since you're using physical device, always use machine IP in development
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

// Enhanced debugging function to log all network configuration details
export const debugNetworkConfig = () => {
    const config = {
        platform: Platform.OS,
        isDevelopment: __DEV__,
        isPhysicalDevice: isPhysicalDevice(),
        backendHost: getBackendHost(),
        backendPort: getBackendPort(),
        protocol: getProtocol(),
        fullBackendURL: getBackendURL(),
        machineIP: DEVELOPMENT_CONFIG.DJANGO_HOST,
    };
    
    console.log('=== NETWORK CONFIGURATION DEBUG ===');
    console.log(JSON.stringify(config, null, 2));
    console.log('====================================');
    
    return config;
};

// Test multiple endpoints to diagnose connection issues
export const runNetworkDiagnostics = async () => {
    console.log('🔍 Running network diagnostics...');
    
    const baseURL = getBackendURL();
    const testEndpoints = [
        { name: 'Health Check', path: '/health/' },
        { name: 'Auth Check', path: '/auth/check/' },
        { name: 'API Root', path: '/' },
    ];
    
    const results = [];
    
    for (const endpoint of testEndpoints) {
        try {
            const url = `${baseURL}${endpoint.path}`;
            console.log(`Testing: ${url}`);
            
            const startTime = Date.now();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
            const endTime = Date.now();
            
            results.push({
                endpoint: endpoint.name,
                url,
                status: response.status,
                ok: response.ok,
                responseTime: `${endTime - startTime}ms`,
                success: true,
            });
            
            console.log(`✅ ${endpoint.name}: ${response.status} (${endTime - startTime}ms)`);
            
        } catch (error) {
            results.push({
                endpoint: endpoint.name,
                url: `${baseURL}${endpoint.path}`,
                error: error.message,
                success: false,
            });
            
            console.log(`❌ ${endpoint.name}: ${error.message}`);
        }
    }
    
    console.log('📊 Network Diagnostics Complete');
    console.log(results);
    
    return results;
};

export default {
    getBackendURL,
    NETWORK_CONFIG,
    checkBackendConnection,
    getLocalIPAddress,
    DEVELOPMENT_CONFIG,
    PRODUCTION_CONFIG,
};
