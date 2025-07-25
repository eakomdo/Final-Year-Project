# React Native + Django Integration Testing Guide

This guide will help you test your React Native app to verify the Django backend integration is working correctly.

## Prerequisites

1. **Django Backend Running**: Ensure your Django backend is running on the expected URL
2. **React Native Environment**: Expo CLI and development environment set up
3. **Network Access**: Ensure your device/emulator can reach the Django backend

## Step 1: Test Backend Connectivity (Command Line)

First, test if your Django backend is accessible from your development environment:

```bash
# Run the backend connectivity test script
./test-backend.sh

# Or manually test with curl
curl -X GET http://your-django-backend-url/api/health/
```

Expected output:
- ✅ Backend is reachable
- ✅ Health endpoint responds with 200 status
- ✅ API endpoints are properly configured

## Step 2: Configure Backend URL

Update your backend URL in the network configuration:

1. Open `/lib/networkConfig.js`
2. Update the `BACKEND_URLS` with your Django backend URL:

```javascript
const BACKEND_URLS = {
  development: 'http://your-django-backend-url',  // Update this
  production: 'https://your-production-url.com'
};
```

**Important URL Examples:**
- Local Django: `http://localhost:8000` or `http://127.0.0.1:8000`
- Network Django: `http://192.168.1.100:8000` (replace with your computer's IP)
- Docker Django: `http://host.docker.internal:8000` (if using Docker Desktop)

## Step 3: Start the React Native App

```bash
# Install dependencies if not already done
npm install

# Start the Expo development server
npx expo start

# Choose your platform:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on physical device
```

## Step 4: In-App Testing

### Option A: Use the Dedicated Test Screen

1. **Navigate to Test Screen**: In your app, navigate to `/test-django` URL manually or:
2. **From Home Screen**: Look for a "Test Django" button in the quick actions (development mode only)
3. **Run Tests**: The test screen will automatically run connection tests and display results

### Option B: Test Individual Features

1. **Authentication Test**:
   - Go to Sign Up screen
   - Create a test account
   - Check if registration works with Django backend

2. **Login Test**:
   - Go to Login screen
   - Use test credentials
   - Verify token storage and authentication flow

3. **Data Fetching Test**:
   - After login, check if home screen loads dashboard data
   - Navigate to different screens (Health, Appointments, etc.)
   - Verify data is fetched from Django APIs

## Step 5: Troubleshooting Common Issues

### Network Connection Issues

**Symptoms**: 
- "Network Error" or "Connection refused"
- Timeouts or no response

**Solutions**:
1. **Check Django Server**: Ensure Django is running and accessible
2. **Check URL Configuration**: Verify backend URL in `/lib/networkConfig.js`
3. **Network Permissions**: Ensure app has network permissions
4. **Firewall/Security**: Check if firewall is blocking connections

### Authentication Issues

**Symptoms**:
- Login fails with valid credentials
- Token refresh errors
- Unauthorized errors

**Solutions**:
1. **Check Django Authentication**: Verify Django JWT settings
2. **Token Format**: Ensure token format matches expected structure
3. **CORS Settings**: Check Django CORS configuration for React Native requests

### API Response Issues

**Symptoms**:
- Unexpected response format
- Missing data fields
- API errors

**Solutions**:
1. **Check API Endpoints**: Verify Django API URLs and responses
2. **Data Mapping**: Check service mappings in `/api/services.js`
3. **Response Format**: Ensure Django responses match expected format

## Step 6: Testing Checklist

Use this checklist to verify all functionality:

### ✅ Network & Configuration
- [ ] Backend URL is correctly configured
- [ ] Backend is running and accessible
- [ ] Network permissions are granted

### ✅ Authentication Flow
- [ ] User registration works
- [ ] User login works
- [ ] Token is stored correctly
- [ ] Token refresh works
- [ ] Logout works

### ✅ Data Operations
- [ ] Dashboard data loads on home screen
- [ ] Health metrics can be fetched
- [ ] Appointments can be loaded
- [ ] Profile data is accessible
- [ ] CRUD operations work (create, read, update, delete)

### ✅ Error Handling
- [ ] Network errors are handled gracefully
- [ ] Authentication errors show appropriate messages
- [ ] API errors are displayed to users
- [ ] App doesn't crash on network issues

## Step 7: Performance Testing

1. **Load Time**: Check how quickly data loads from Django APIs
2. **Offline Handling**: Test app behavior when network is unavailable
3. **Token Refresh**: Verify automatic token refresh works smoothly
4. **Memory Usage**: Monitor app performance with Django integration

## Debugging Tools

### Development Console
- Open React Native debugger
- Check network requests in network tab
- Monitor console logs for errors

### Django Logs
- Check Django server logs for incoming requests
- Verify API endpoints are being hit
- Monitor for authentication and permission errors

### Network Monitoring
- Use tools like Flipper or React Native Debugger
- Monitor HTTP requests and responses
- Check request/response timing

## Next Steps

After successful testing:

1. **Production Setup**: Configure production backend URL
2. **Error Monitoring**: Set up crash reporting and error tracking
3. **Performance Optimization**: Optimize API calls and caching
4. **Security Review**: Review authentication and data security

## Support

If you encounter issues:

1. Check the `/DJANGO_INTEGRATION_GUIDE.md` for detailed setup
2. Review `/INTEGRATION_SUMMARY.md` for implementation details
3. Use the in-app test component for real-time debugging
4. Check Django and React Native logs for specific errors

Happy testing! 🚀
