/**
 * NotificationHelper - Replaces intrusive alerts with user-friendly notifications
 * This ensures the app behaves like a real user experience without blocking popups
 */

import { showError as toastError, showSuccess as toastSuccess, showWarning as toastWarning, showInfo as toastInfo } from './ToastManager';

/**
 * Show a notification instead of an alert for better UX
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - Type of notification: 'error', 'success', 'info', 'warning'
 */
export const showNotification = async (title, message, type = 'info') => {
  try {
    // Use simple toast system that works in Expo Go
    switch (type) {
      case 'error':
        toastError(title, message);
        break;
      case 'success':
        toastSuccess(title, message);
        break;
      case 'warning':
        toastWarning(title, message);
        break;
      default:
        toastInfo(title, message);
    }
    
    // Also log for development
    console.log(`📱 Notification (${type}): ${title} - ${message}`);
  } catch (error) {
    console.error('Failed to show notification:', error);
    // Fallback to console log if notification fails
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }
};

/**
 * Show an error notification
 */
export const showError = (title, message) => {
  toastError(title, message);
  console.log(`[ERROR] ${title}: ${message}`);
};

/**
 * Show a success notification
 */
export const showSuccess = (title, message) => {
  toastSuccess(title, message);
  console.log(`[SUCCESS] ${title}: ${message}`);
};

/**
 * Show a warning notification
 */
export const showWarning = (title, message) => {
  toastWarning(title, message);
  console.log(`[WARNING] ${title}: ${message}`);
};

/**
 * Show an info notification
 */
export const showInfo = (title, message) => {
  toastInfo(title, message);
  console.log(`[INFO] ${title}: ${message}`);
};

/**
 * Legacy alert replacement - converts Alert.alert calls to notifications
 * @param {string} title 
 * @param {string} message 
 * @param {Array} buttons - Optional buttons (will be ignored for notifications)
 */
export const alertToNotification = (title, message, buttons = []) => {
  // Determine type based on title
  let type = 'info';
  if (title.toLowerCase().includes('error')) {
    type = 'error';
  } else if (title.toLowerCase().includes('success')) {
    type = 'success';
  } else if (title.toLowerCase().includes('warning')) {
    type = 'warning';
  }

  showNotification(title, message, type);
  
  // If there were buttons with onPress handlers, we could potentially handle them here
  // For now, we'll just log them for development purposes
  if (buttons && buttons.length > 0) {
    console.log('Alert buttons were provided but notifications don\'t support interactive buttons:', buttons);
  }
};

// Default export for convenience
export default {
  showNotification,
  showError,
  showSuccess,
  showWarning,
  showInfo,
  alertToNotification,
};
