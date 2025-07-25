# Frontend to Django Backend Integration Guide

This guide explains how to connect your React Native frontend to your Django backend.

## Files Created/Modified

### 1. API Configuration (`/api/config.js`)
- Sets up axios instance with base URL pointing to Django backend
- Handles authentication tokens automatically
- Includes request/response interceptors for token management
- Handles token refresh automatically

### 2. API Services (`/api/services.js`)
- Contains all API endpoints organized by feature
- Authentication, health metrics, appointments, medications, etc.
- Returns promises that can be used with async/await

### 3. Django Authentication Service (`/lib/djangoAuth.js`)
- Handles user registration, login, logout
- Token management (access and refresh tokens)
- Password reset functionality
- Compatible with existing AuthContext

### 4. Django Database Service (`/lib/djangoDatabase.js`)
- Handles all data operations (CRUD)
- Health metrics, appointments, medications, notifications
- Returns data in format compatible with existing screens

### 5. Updated AuthContext (`/context/AuthContext.js`)
- Modified to use Django authentication service
- Maintains same interface for existing components
- Handles token storage in AsyncStorage

## Configuration

### Backend URL Configuration
In `/api/config.js`, update the API_BASE_URL:

```javascript
// For local development (update IP address to your machine's IP)
const API_BASE_URL = 'http://192.168.137.224:8000/api/v1';

// For production
const API_BASE_URL = 'https://your-domain.com/api/v1';
```

### Finding Your Local IP Address
To find your machine's IP address:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your network adapter.

**macOS/Linux:**
```bash
ifconfig
```
Look for "inet" address under your network interface (usually en0 or wlan0).

### Django Backend Requirements
Make sure your Django backend has these endpoints:

#### Authentication
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `GET /api/v1/auth/current-user/` - Get current user
- `POST /api/v1/auth/token/refresh/` - Refresh token

#### Health Metrics
- `GET /api/v1/health-metrics/` - Get health metrics
- `POST /api/v1/health-metrics/` - Create health metric
- `PATCH /api/v1/health-metrics/{id}/` - Update health metric
- `DELETE /api/v1/health-metrics/{id}/` - Delete health metric

#### Appointments
- `GET /api/v1/appointments/` - Get appointments
- `POST /api/v1/appointments/` - Create appointment
- `PATCH /api/v1/appointments/{id}/` - Update appointment
- `DELETE /api/v1/appointments/{id}/` - Delete appointment

And similar endpoints for medications, notifications, etc.

## CORS Configuration
Make sure your Django backend allows requests from your React Native app:

```python
# In Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",  # Expo default port
    "http://192.168.137.224:8081",  # Your IP
]

# Or for development, allow all origins (not recommended for production)
CORS_ALLOW_ALL_ORIGINS = True
```

## Usage Examples

### Login
```javascript
import { useAuth } from '../context/AuthContext';

const { login } = useAuth();

const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
        // Navigate to home screen
    } else {
        Alert.alert('Login Failed', result.error);
    }
};
```

### Fetching Health Metrics
```javascript
import DjangoDatabaseService from '../lib/djangoDatabase';

const loadHealthMetrics = async () => {
    try {
        const response = await DjangoDatabaseService.getHealthMetrics(userId);
        setMetrics(response.documents);
    } catch (error) {
        console.error('Error loading metrics:', error);
    }
};
```

### Creating a Health Metric
```javascript
const createMetric = async (metricData) => {
    try {
        const newMetric = await DjangoDatabaseService.createHealthMetric({
            user: userId,
            metric_type: 'blood_pressure',
            value: '120/80',
            unit: 'mmHg',
            recorded_at: new Date().toISOString()
        });
        // Update UI with new metric
    } catch (error) {
        console.error('Error creating metric:', error);
    }
};
```

## Testing the Connection

1. Start your Django backend server:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

2. Update the IP address in `/api/config.js` to match your machine's IP

3. Start your React Native app:
   ```bash
   npm start
   ```

4. Try logging in or registering a user

## Troubleshooting

### Common Issues

1. **Network Request Failed**
   - Check if Django server is running
   - Verify IP address in config.js
   - Check firewall settings

2. **CORS Errors**
   - Add CORS configuration to Django settings
   - Install django-cors-headers package

3. **Authentication Errors**
   - Check if tokens are being saved correctly
   - Verify Django JWT settings
   - Check token expiration times

4. **Data Format Issues**
   - Verify API response format matches expected structure
   - Check field names in Django serializers

### Debugging Tips

1. Check network requests in Metro bundler logs
2. Use console.log to debug API responses
3. Test API endpoints directly with Postman or curl
4. Check AsyncStorage for stored tokens

## Migration Strategy

You can gradually migrate from Appwrite to Django by:

1. Use the service configuration in `/lib/serviceConfig.js`
2. Set `USE_DJANGO_BACKEND = false` to keep using Appwrite
3. Set `USE_DJANGO_BACKEND = true` to switch to Django
4. Migrate one feature at a time by updating individual screens

This allows you to test the Django backend without breaking existing functionality.
