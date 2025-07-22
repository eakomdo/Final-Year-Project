# Appwrite Backend Configuration Guide

## Issue Resolution for Registration Errors

### Current Problems:
1. **Duplicate User Error**: "A user with the same id, email, or phone already exists"
2. **Authorization Error**: "The current user is not authorized to perform the requested action"

## Quick Fixes:

### 1. Clear Test Users (Option A)
1. Open Appwrite Console
2. Go to **Auth** → **Users**
3. Delete test accounts:
   - `akomdoemmanuel22@gmail.com`
   - `eakomdo1@gmail.com`

### 2. Database Permissions Setup
Go to **Databases** → **[Your Database]** → **Settings** → **Permissions**

#### For User Registration to work, set these permissions:

**Users Collection:**
- **Create**: `users` (authenticated users)
- **Read**: `users` (authenticated users)
- **Update**: `users` (authenticated users) 
- **Delete**: `admins` (admin role only)

**Roles Collection (if exists):**
- **Create**: `admins` (admin role only)
- **Read**: `users` (authenticated users)
- **Update**: `admins` (admin role only)
- **Delete**: `admins` (admin role only)

**Profiles Collection (if exists):**
- **Create**: `users` (authenticated users)
- **Read**: `users` (authenticated users)
- **Update**: `users` (authenticated users)
- **Delete**: `users` (authenticated users)

### 3. Authentication Settings
Go to **Auth** → **Settings**

Ensure these are enabled:
- ✅ **Email/Password Authentication**
- ✅ **Account Verification** (optional, but recommended)
- ✅ **Password Recovery**

### 4. Security Settings
Go to **Settings** → **Security**

Check:
- **API Keys**: Ensure your client API key has proper permissions
- **Platforms**: Add your development platform (Expo Go, localhost, etc.)

## Testing Steps:

1. **Clear existing test users** from Appwrite Console
2. **Verify database permissions** are set correctly
3. **Test registration** with a new email address
4. **Check logs** for any remaining permission issues

## Common Permission Patterns:

### For Public App:
```
Read: Any
Create: Users  
Update: Users
Delete: Users or Admins
```

### For Secure App:
```
Read: Users
Create: Users
Update: Users  
Delete: Admins
```

## Additional Resources:
- [Appwrite Auth Documentation](https://appwrite.io/docs/client/account)
- [Database Permissions Guide](https://appwrite.io/docs/permissions)
- [Security Best Practices](https://appwrite.io/docs/security)

---

**Next Steps:**
1. Follow the permission setup above
2. Clear test users or use new email addresses
3. Test registration again
4. If issues persist, check the Appwrite Console logs for detailed error messages
