/**
 * Configuration for choosing between Appwrite and Django backends
 * Set USE_DJANGO_BACKEND to true to use Django APIs, false to use Appwrite
 */

export const USE_DJANGO_BACKEND = true; // Change this to false to use Appwrite

// Import services based on configuration
let AuthService, DatabaseService;

if (USE_DJANGO_BACKEND) {
    AuthService = require('./djangoAuth').default;
    DatabaseService = require('./djangoDatabase').default;
} else {
    AuthService = require('./auth').default;
    DatabaseService = require('./database').default;
}

export { AuthService, DatabaseService };

// API endpoints for different environments
export const API_ENDPOINTS = {
    development: {
        django: 'http://192.168.137.224:8000/api/v1',
        appwrite: 'https://cloud.appwrite.io/v1'
    },
    production: {
        django: 'https://your-domain.com/api/v1',
        appwrite: 'https://cloud.appwrite.io/v1'
    }
};

// Get current API endpoint
export const getCurrentAPIEndpoint = () => {
    const env = __DEV__ ? 'development' : 'production';
    return USE_DJANGO_BACKEND ? API_ENDPOINTS[env].django : API_ENDPOINTS[env].appwrite;
};

export default {
    USE_DJANGO_BACKEND,
    AuthService,
    DatabaseService,
    API_ENDPOINTS,
    getCurrentAPIEndpoint
};
