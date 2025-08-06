/**
 * Token decoder utility for the JEGHealth app
 * 
 * This utility helps inspect JWT tokens to debug authentication issues
 * Usage: Import this in any component and call `decodeToken()` to see the token contents
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Decode a JWT token
 * @param {string} token - The JWT token to decode
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get and decode the current access token
 * @returns {Promise<object>} Object with token and decoded payload
 */
export const decodeToken = async () => {
  try {
    // Get the token from storage
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      return { token: null, decoded: null, error: 'No token found' };
    }
    
    // Decode the token
    const decoded = decodeJWT(token);
    if (!decoded) {
      return { token, decoded: null, error: 'Failed to decode token' };
    }
    
    // Extract key information
    const userId = decoded.id || decoded.sub || decoded.user_id;
    const expiresAt = decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'unknown';
    const isExpired = decoded.exp ? Date.now() > decoded.exp * 1000 : false;
    
    // Log the decoded token for debugging
    console.log('=== Decoded Token ===');
    console.log('User ID:', userId);
    console.log('Expires:', expiresAt);
    console.log('Is Expired:', isExpired);
    console.log('Full payload:', decoded);
    
    return { token, decoded, userId, expiresAt, isExpired, error: null };
  } catch (error) {
    console.error('Token decoding error:', error);
    return { token: null, decoded: null, error: error.message };
  }
};

/**
 * Check if the current token is expired
 * @returns {Promise<boolean>} True if token is expired or invalid
 */
export const isTokenExpired = async () => {
  const { decoded, isExpired } = await decodeToken();
  return !decoded || isExpired;
};

export default {
  decodeJWT,
  decodeToken,
  isTokenExpired
};
