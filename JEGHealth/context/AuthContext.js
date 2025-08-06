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

    // Normalize user data
    const normalizeUserData = (userData) => {
        if (!userData) {
            console.warn('normalizeUserData: No user data provided');
            return null;
        }
        
        // Handle case where userData is nested under authUser or flat
        const authUser = userData.authUser || userData;
        
        if (!authUser || (!authUser.id && !authUser.$id && !authUser.user_id)) {
            console.warn('normalizeUserData: Invalid user data structure', JSON.stringify(authUser, null, 2));
            return null;
        }
        
        const normalizedUser = {
            ...authUser,
            id: authUser.id || authUser.$id || authUser.user_id,
            $id: authUser.$id || authUser.id || authUser.user_id,
            email: authUser.email || authUser.username
        };
        
        console.log('Normalized user data:', {
            original: { id: authUser.id, $id: authUser.$id, user_id: authUser.user_id },
            normalized: { id: normalizedUser.id, $id: normalizedUser.$id, email: normalizedUser.email }
        });
        
        return normalizedUser;
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
            if (!refreshToken) {
                console.log('No refresh token found');
                return false;
            }
            const newAccessToken = await DjangoAuthService.refreshAccessToken();
            if (newAccessToken) {
                console.log('Token refreshed successfully');
                return true;
            }
            console.log('Token refresh failed: No access token returned');
            return false;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    };

    // Validate token with refresh attempt
    const validateToken = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                console.log('No access token found during validation');
                return false;
            }
            if (isTokenExpired(token)) {
                console.log('Access token expired, attempting to refresh');
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    console.log('Token refresh failed');
                    return false;
                }
            }
            const userData = await DjangoAuthService.getCurrentUser();
            console.log('getCurrentUser response:', JSON.stringify(userData, null, 2));
            if (!userData || !userData.authUser) {
                console.error('No valid user data returned during validation');
                return false;
            }
            const normalizedUser = normalizeUserData(userData);
            if (!normalizedUser || !normalizedUser.id) {
                console.error('User data normalization failed', JSON.stringify(userData, null, 2));
                return false;
            }
            setUser(normalizedUser);
            setUserProfile(userData.userProfile || null);
            setUserRole(userData.role || null);
            setIsAuthenticated(true);
            console.log('Token validation successful, user state updated:', normalizedUser.email);
            return true;
        } catch (error) {
            console.error('Token validation failed:', error.message);
            if (error.message.includes('401') || error.message.includes('403') || 
                error.message.includes('Invalid token')) {
                console.log('Auth error detected, attempting token refresh');
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    try {
                        const userData = await DjangoAuthService.getCurrentUser();
                        console.log('Retry getCurrentUser response:', JSON.stringify(userData, null, 2));
                        if (userData && userData.authUser) {
                            const normalizedUser = normalizeUserData(userData);
                            if (!normalizedUser || !normalizedUser.id) {
                                console.error('Retry user data normalization failed', JSON.stringify(userData, null, 2));
                                return false;
                            }
                            setUser(normalizedUser);
                            setUserProfile(userData.userProfile || null);
                            setUserRole(userData.role || null);
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
            if (loginResponse && loginResponse.success && loginResponse.authUser) {
                const normalizedUser = normalizeUserData(loginResponse);
                if (!normalizedUser || !normalizedUser.id) {
                    throw new Error('Invalid user data in login response');
                }
                setUser(normalizedUser);
                setUserProfile(loginResponse.userProfile || null);
                setUserRole(loginResponse.role || null);
                setIsAuthenticated(true);
                console.log('User logged in successfully:', {
                    email: normalizedUser.email,
                    id: normalizedUser.id,
                    $id: normalizedUser.$id
                });
                return { success: true, user: normalizedUser };
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
            if (result && result.success && result.authUser) {
                const normalizedUser = normalizeUserData(result);
                if (!normalizedUser || !normalizedUser.id) {
                    throw new Error('Invalid user data in registration response');
                }
                setUser(normalizedUser);
                setUserProfile(result.userProfile || null);
                setUserRole(result.role || null);
                setIsAuthenticated(true);
                console.log('Registration completed successfully:', {
                    id: normalizedUser.id,
                    $id: normalizedUser.$id,
                    email: normalizedUser.email
                });
                return { success: true, user: normalizedUser };
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
            const userId = user?.id || user?.$id || user?.user_id;
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
        console.log('User:', user ? {
            id: user.id,
            $id: user.$id,
            email: user.email
        } : null);
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