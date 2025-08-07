import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DjangoAuthService from '../lib/djangoAuth';
import DjangoDatabaseService from '../lib/djangoDatabase';
import { setGlobalAuthHandler } from '../api/config';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({
    user: null,
    userProfile: null,
    userRole: null,
    isLoading: true,
    isAuthenticated: false,
    login: () => Promise.resolve({ success: false, error: 'Not initialized' }),
    register: () => Promise.resolve({ success: false, error: 'Not initialized' }),
    logout: () => Promise.resolve({ success: false, error: 'Not initialized' }),
    updateProfile: () => Promise.resolve({ success: false, error: 'Not initialized' }),
    handleAuthFailure: () => {},
    validateToken: () => Promise.resolve(false),
    getUserPermissions: () => [],
    hasPermission: () => false,
    getUserRole: () => 'unknown'
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    let navigation;
    try {
        navigation = useNavigation();
    } catch (error) {
        console.warn('Navigation not available in AuthProvider:', error.message);
        navigation = null;
    }
    
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Simplified normalize user data function
    const normalizeUserData = (userData) => {
        console.log('=== AUTHCONTEXT: NORMALIZING USER DATA ===', JSON.stringify(userData, null, 2));
        
        if (!userData) {
            console.warn('normalizeUserData: Invalid or missing user data');
            return null;
        }

        // Handle already normalized data from DjangoAuthService
        if (userData.authUser && userData.userProfile && userData.role) {
            console.log('Data already normalized, using directly');
            const { authUser, userProfile, role } = userData;
            
            // Validate essential fields
            if (!authUser.id && !authUser.email && !authUser.username) {
                console.error('normalizeUserData: No valid identifier found');
                console.error('authUser fields:', Object.keys(authUser));
                return null;
            }

            return {
                user: authUser,
                profile: userProfile,
                role: role
            };
        }

        // Handle raw user data (fallback for other scenarios)
        console.warn('Handling raw user data - this should not happen after login');
        const normalizedUser = {
            ...userData,
            id: userData.id || userData.pk || userData.user_id || userData.email,
            email: userData.email || userData.username,
            username: userData.username || userData.email,
            first_name: userData.first_name || userData.firstName || '',
            last_name: userData.last_name || userData.lastName || ''
        };

        console.log('Normalized user from raw data:', JSON.stringify(normalizedUser, null, 2));

        return {
            user: normalizedUser,
            profile: {},
            role: { name: 'user', permissions: {} }
        };
    };

    // Decode JWT to check expiration
    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            console.log('Token expiration check:', { exp: decoded.exp, now, user_id: decoded.user_id });
            return decoded.exp < now;
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    };

    // Refresh token
    const refreshAccessToken = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            console.log('Refresh token exists:', !!refreshToken);
            if (!refreshToken) {
                console.log('No refresh token found');
                return false;
            }
            const newAccessToken = await DjangoAuthService.refreshAccessToken();
            console.log('New access token received:', !!newAccessToken);
            if (newAccessToken) {
                console.log('Token refreshed successfully');
                return true;
            }
            console.log('Token refresh failed: No access token returned');
            return false;
        } catch (error) {
            console.error('Error refreshing token:', error.message);
            console.error('Error details:', error.response?.data || error);
            return false;
        }
    };

    // Validate token with refresh attempt
    const validateToken = async () => {
        try {
            console.log('=== VALIDATE TOKEN STARTED ===');
            const token = await AsyncStorage.getItem('access_token');
            console.log('Access token exists:', !!token);
            if (!token) {
                console.log('No access token found during validation');
                return false;
            }
            
            if (isTokenExpired(token)) {
                console.log('Access token expired, attempting to refresh');
                const refreshed = await refreshAccessToken();
                console.log('Token refresh result:', refreshed);
                if (!refreshed) {
                    console.log('Token refresh failed');
                    return false;
                }
            }
            
            console.log('Making getCurrentUser call for token validation...');
            const userData = await DjangoAuthService.getCurrentUser();
            console.log('getCurrentUser response:', JSON.stringify(userData, null, 2));
            
            if (!userData) {
                console.error('No user data returned during validation');
                return false;
            }
            
            const normalizedData = normalizeUserData(userData);
            if (!normalizedData) {
                console.error('User data normalization failed');
                return false;
            }
            
            setUser(normalizedData.user);
            setUserProfile(normalizedData.profile);
            setUserRole(normalizedData.role);
            setIsAuthenticated(true);
            console.log('Token validation successful for user:', normalizedData.user.email || normalizedData.user.username);
            return true;
            
        } catch (error) {
            console.error('Token validation failed:', error.message);
            console.error('Error details:', error.response?.data || error);
            
            if (error.message.includes('401') || error.message.includes('403') || 
                error.message.includes('Invalid token')) {
                console.log('Auth error detected, attempting token refresh');
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    try {
                        const userData = await DjangoAuthService.getCurrentUser();
                        console.log('Retry getCurrentUser response:', JSON.stringify(userData, null, 2));
                        if (userData) {
                            const normalizedData = normalizeUserData(userData);
                            if (!normalizedData) {
                                console.error('Retry user data normalization failed');
                                return false;
                            }
                            setUser(normalizedData.user);
                            setUserProfile(normalizedData.profile);
                            setUserRole(normalizedData.role);
                            setIsAuthenticated(true);
                            console.log('Retry after refresh successful');
                            return true;
                        }
                    } catch (retryError) {
                        console.error('Retry after refresh failed:', retryError);
                    }
                }
                await handleAuthFailure('Your session has expired. Please login again.');
            }
            return false;
        }
    };

    // Handle authentication failures
    const handleAuthFailure = async (message = 'Session expired. Please login again.') => {
        console.log('Authentication failure detected:', message);
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            const isValid = await validateToken();
            if (isValid) {
                console.log('Token refreshed successfully, continuing session');
                return;
            }
        }
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
        setIsAuthenticated(false);
        try {
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            console.log('Tokens cleared from storage');
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
        Alert.alert(
            'Session Expired',
            message,
            [{
                text: 'OK',
                onPress: () => {
                    try {
                        if (navigation && navigation.navigate) {
                            navigation.navigate('Auth');
                        }
                    } catch (navError) {
                        console.error('Navigation error:', navError);
                    }
                }
            }],
            { cancelable: false }
        );
    };

    // Initialize app
    useEffect(() => {
        const initializeApp = async () => {
            try {
                setIsLoading(true);
                console.log('Initializing app authentication...');
                setGlobalAuthHandler({ handleAuthFailure });
                const isAuth = await DjangoAuthService.isAuthenticated();
                console.log('Initial auth check result:', isAuth);
                if (isAuth) {
                    const isValid = await validateToken();
                    if (!isValid) {
                        console.log('Token validation failed during init');
                        setIsAuthenticated(false);
                    }
                } else {
                    console.log('No valid authentication found during init');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('App initialization error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
                console.log('App initialization complete');
            }
        };
        initializeApp();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            console.log('Starting login process for:', email);
            const loginResponse = await DjangoAuthService.loginUser(email, password);
            console.log('Login response:', JSON.stringify(loginResponse, null, 2));
            
            if (loginResponse && loginResponse.success) {
                const normalizedData = normalizeUserData(loginResponse);
                
                if (!normalizedData) {
                    console.error('Login user data normalization failed');
                    throw new Error('Invalid user data in login response');
                }
                
                setUser(normalizedData.user);
                setUserProfile(normalizedData.profile);
                setUserRole(normalizedData.role);
                setIsAuthenticated(true);
                console.log('User logged in successfully:', normalizedData.user.email);
                return { success: true, user: normalizedData.user };
            }
            throw new Error(loginResponse?.message || 'Login failed - invalid response');
        } catch (error) {
            console.error('Login error:', error);
            setIsAuthenticated(false);
            setUser(null);
            setUserProfile(null);
            setUserRole(null);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            setIsLoading(true);
            console.log('Starting registration process...');
            const result = await DjangoAuthService.registerUser(userData);
            console.log('Registration response:', JSON.stringify(result, null, 2));
            
            if (result && result.success) {
                const normalizedData = normalizeUserData(result);
                
                if (!normalizedData) {
                    console.error('Registration user data normalization failed');
                    throw new Error('Invalid user data in registration response');
                }
                
                setUser(normalizedData.user);
                setUserProfile(normalizedData.profile);
                setUserRole(normalizedData.role);
                setIsAuthenticated(true);
                console.log('Registration completed successfully:', normalizedData.user.email);
                return { success: true, user: normalizedData.user };
            }
            throw new Error(result?.message || 'Registration failed - invalid response');
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            setIsLoading(true);
            console.log('Starting logout process...');
            try {
                await DjangoAuthService.logoutUser();
                console.log('Server logout successful');
            } catch (error) {
                console.warn('Server logout failed, continuing with local cleanup:', error.message);
            }
            setUser(null);
            setUserProfile(null);
            setUserRole(null);
            setIsAuthenticated(false);
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            console.log('Local logout cleanup completed');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            setUserProfile(null);
            setUserRole(null);
            setIsAuthenticated(false);
            try {
                await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            } catch (storageError) {
                console.error('Error clearing storage during failed logout:', storageError);
            }
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            if (!userProfile) {
                throw new Error('No user profile found');
            }
            const userId = user?.id || user?.email;
            if (!userId) {
                throw new Error('User ID not found');
            }
            const updatedProfile = await DjangoDatabaseService.updateUserProfile(userId, profileData);
            setUserProfile(updatedProfile);
            return { success: true, profile: updatedProfile };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    };

    // Get user role permissions
    const getUserPermissions = () => {
        if (!userRole?.permissions) return [];
        try {
            return Object.keys(userRole.permissions).filter(key => userRole.permissions[key] === true);
        } catch (error) {
            console.error('Error parsing permissions:', error);
            return [];
        }
    };

    // Check if user has specific permission
    const hasPermission = (permission) => {
        const permissions = getUserPermissions();
        return permissions.includes(permission);
    };

    // Get user role name
    const getUserRole = () => {
        return userRole?.name || 'unknown';
    };

    // Debug: Log user state changes
    useEffect(() => {
        console.log('=== Auth State Update ===');
        console.log('User:', user ? { id: user.id, email: user.email } : null);
        console.log('IsAuthenticated:', isAuthenticated);
        console.log('IsLoading:', isLoading);
        console.log('========================');
    }, [user, isAuthenticated, isLoading]);

    const value = {
        user,
        userProfile,
        userRole,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        handleAuthFailure,
        validateToken,
        getUserPermissions,
        hasPermission,
        getUserRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;