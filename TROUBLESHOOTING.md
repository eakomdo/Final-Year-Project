# Troubleshooting Guide

## Common Issues & Solutions

### Authentication Problems
- **Issue**: Login fails with 'Invalid user data'
- **Solution**: Check user data normalization in AuthContext
- **Fix Applied**: Handle both 'user' and 'authUser' response formats

### Provider Search Not Working  
- **Issue**: Providers don't appear in dropdown
- **Solution**: Verify Django backend response structure
- **Fix Applied**: Support 'suggestions' array format

### User ID Missing Errors
- **Issue**: 'User not authenticated or user ID missing'
- **Solution**: Use user.id instead of user.$id for Django
- **Fix Applied**: Updated user ID access patterns

### API Connection Errors
- **Issue**: 500 errors from provider endpoints
- **Solution**: Check Django backend configuration
- **Status**: Frontend handles graceful fallback

## Debug Tips
- Check Expo Go logs for detailed error messages
- Use centralized logger for structured debugging
- Verify API response structure matches frontend expectations
- Test authentication token validity

