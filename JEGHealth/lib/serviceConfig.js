
import { getBackendURL } from './networkConfig';

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

// Use dynamic backend URL from networkConfig.js
export const API_BASE_URL = getBackendURL();

export default {
    USE_DJANGO_BACKEND,
    AuthService,
    DatabaseService,
    API_BASE_URL
};
