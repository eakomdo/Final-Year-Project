# Quick Start: Testing Your React Native + Django Integration

## 🚀 Ready to Test!

Your React Native app has been successfully configured to work with Django backend. Here's how to test it:

## 1. Quick Test (Recommended)

```bash
# Navigate to your project directory
cd /home/eakomdo/Desktop/Final-Year-Project/JEGHealth

# Run the automated test script
./test-integration.sh
```

This script will:
- ✅ Check all required files
- ✅ Verify dependencies
- ✅ Test backend connectivity
- ✅ Start the development server with testing instructions

## 2. Manual Configuration Check

### Update Backend URL (Important!)

Edit `/lib/networkConfig.js` and update the Django host:

```javascript
const DEVELOPMENT_CONFIG = {
    DJANGO_HOST: 'YOUR_DJANGO_IP_HERE',  // Update this!
    DJANGO_PORT: '8000',
    // ...
};
```

**Common URLs:**
- Local: `localhost` or `127.0.0.1`
- Network: Your computer's IP (e.g., `192.168.1.100`)
- Docker: `host.docker.internal`

## 3. Start Testing

### Option A: Use Test Screen
1. Start the app: `npx expo start`
2. Open on device/emulator
3. Look for **"Test Django"** button on home screen (quick actions)
4. Tap to run comprehensive backend tests

### Option B: Test Navigation
1. Manually navigate to `/test-django` in your app
2. The test screen will show real-time connection status
3. Test individual API endpoints

### Option C: Test Core Features
1. **Sign Up**: Create new account with Django backend
2. **Login**: Authenticate using Django JWT
3. **Dashboard**: Check if home screen loads data from Django
4. **Navigation**: Test other screens (Health, Profile, etc.)

## 4. What You Should See

### ✅ Successful Integration
- "Test Django" button appears on home screen
- Connection tests pass in test screen
- User registration/login works
- Dashboard loads data from Django APIs
- No network errors in console

### ❌ Common Issues
- **Network Error**: Check Django backend URL and ensure it's running
- **CORS Issues**: Configure Django CORS settings for mobile requests
- **Authentication Fails**: Verify Django JWT configuration
- **No Test Button**: Ensure you're in development mode

## 5. Testing Checklist

- [ ] Django backend is running
- [ ] Backend URL is configured correctly
- [ ] App starts without errors
- [ ] "Test Django" button is visible on home screen
- [ ] Test screen shows successful connection
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard data loads
- [ ] Other screens function properly

## 6. Next Steps After Testing

1. **Production Setup**: Configure production backend URL
2. **Performance**: Optimize API calls and add caching
3. **Error Handling**: Enhance error messages and offline handling
4. **Security**: Review authentication and data protection

## 📚 Additional Resources

- `/TESTING_GUIDE.md` - Comprehensive testing guide
- `/DJANGO_INTEGRATION_GUIDE.md` - Detailed setup instructions
- `/INTEGRATION_SUMMARY.md` - Technical implementation details
- `/test-backend.sh` - Backend connectivity test script

## 🆘 Getting Help

If you encounter issues:

1. Check Django server logs
2. Use React Native debugger
3. Review network requests in browser dev tools
4. Check the in-app test screen for specific error details

**Ready to test? Run `./test-integration.sh` to get started!** 🎯
