import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../lib/auth';
import DatabaseService from '../lib/database';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
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
                
                // Skip role initialization in development/when not authenticated
                // This prevents authorization errors in Expo Go
                // Role initialization should be done by admin users only
                
                // Check if user is already authenticated
                const isAuth = await AuthService.isAuthenticated();
                
                if (isAuth) {
                    const userData = await AuthService.getCurrentUser();
                    setUser(userData.authUser);
                    setUserProfile(userData.userProfile);
                    setUserRole(userData.role);
                    setIsAuthenticated(true);
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
            await AuthService.loginUser(email, password);
            
            // Get full user data
            const userData = await AuthService.getCurrentUser();
            
            setUser(userData.authUser);
            setUserProfile(userData.userProfile);
            setUserRole(userData.role);
            setIsAuthenticated(true);
            
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            setIsLoading(true);
            const result = await AuthService.registerUser(userData);
            
            // Auto-login after successful registration
            const loginResult = await login(userData.email, userData.password);
            
            return { success: true, user: result, loginResult };
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
            await AuthService.logoutUser();
            
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

            const updatedProfile = await DatabaseService.updateUserProfile(
                userProfile.$id,
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