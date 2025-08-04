import React, { createContext, useContext, useEffect, useState } from 'react';
import DjangoAuthService from '../lib/djangoAuth';
import DjangoDatabaseService from '../lib/djangoDatabase';
import { useNavigation } from '@react-navigation/native';

const AuthContext = createContext({});



export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigation();
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize app and check authentication on mount
    useEffect(() => {
        const initializeApp = async () => {
            try {
                setIsLoading(true);
                
                // Check if user is already authenticated
                const isAuth = await DjangoAuthService.isAuthenticated();
                
                if (isAuth) {
                    const userData = await DjangoAuthService.getCurrentUser();
                    if (userData) {
                        setUser(userData.authUser);
                        setUserProfile(userData.userProfile);
                        setUserRole(userData.role);
                        setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.error('App initialization error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            
            // First, perform the login and get the response directly
            const loginResponse = await DjangoAuthService.loginUser(email, password);
            
            if (loginResponse && loginResponse.success) {
                // Use the data from the login response first
                setUser(loginResponse.authUser);
                setUserProfile(loginResponse.userProfile);
                setUserRole(loginResponse.role);
                setIsAuthenticated(true);
                
                console.log('User logged in successfully:', email);
                
                // Try to get fresh user data, but don't fail if it doesn't work
                //navigate.navigate('Main');// this is where the routings should be handled 
                try {
                    const userData = await DjangoAuthService.getCurrentUser();
                    if (userData) {
                        setUser(userData.authUser);
                        setUserProfile(userData.userProfile);
                        setUserRole(userData.role);
                    }
                } catch (fetchError) {
                    console.warn('Could not fetch fresh user data after login:', fetchError.message);
                    // We already have the user data from login, so this is not critical
                }
                
                return { success: true, user: loginResponse };
            } else {
                throw new Error('Login failed - no response data');
            }
            
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

            const result = await DjangoAuthService.registerUser(userData);
            
            if (result && result.success) {
                // Use the registration response data directly
                setUser(result.authUser);
                setUserProfile(result.userProfile);
                setUserRole(result.role);
                setIsAuthenticated(true);
                
                console.log('Registration completed successfully');
                return { success: true, user: result };
            } else {
                throw new Error('Registration failed - no response data');
            }
            
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
            await DjangoAuthService.logoutUser();
            
            setUser(null);
            setUserProfile(null);
            setUserRole(null);
            setIsAuthenticated(false);
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
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

            const updatedProfile = await DjangoDatabaseService.updateUserProfile(
                user.$id || user.id,
                profileData
            );

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
            return JSON.parse(userRole.permissions);
        } catch (error) {
            console.error('Error parsing permissions:', error);
            return [];
        }
    };

    // Check if user has specific permission
    const hasPermission = (permission) => {
        const permissions = getUserPermissions();
        return permissions[permission] === true;
    };

    // Get user role name
    const getUserRole = () => {
        return userRole?.name || 'unknown';
    };

    const value = {
        // State
        user,
        userProfile,
        userRole,
        isLoading,
        isAuthenticated,
        
        // Actions
        login,
        register,
        logout,
        updateProfile,
        
        // Utilities
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