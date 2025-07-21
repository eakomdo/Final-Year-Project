/**
 * NotificationHelper - Replaces intrusive alerts with user-friendly notifications
 * This ensures the app behaves like a real user experience without blocking popups
 */

import { NotificationService } from '../services/NotificationService';

/**
 * Show a notification instead of an alert for better UX
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - Type of notification: 'error', 'success', 'info', 'warning'
 */
export const showNotification = async (title, message, type = 'info') => {
  try {
    // Define notification config based on type
    const notificationConfig = {
      title,
      body: message,
      data: { type },
    };

    // Customize notification based on type
    switch (type) {
      case 'error':
        notificationConfig.categoryIdentifier = 'ERROR';
        notificationConfig.subtitle = 'Error';
        break;
      case 'success':
        notificationConfig.categoryIdentifier = 'SUCCESS';
        notificationConfig.subtitle = 'Success';
        break;
      case 'warning':
        notificationConfig.categoryIdentifier = 'WARNING';
        notificationConfig.subtitle = 'Warning';
        break;
      default:
        notificationConfig.categoryIdentifier = 'INFO';
        notificationConfig.subtitle = 'Information';
    }

    await NotificationService.scheduleLocalNotification(notificationConfig);
    
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
export const showError = (title, message) => showNotification(title, message, 'error');

/**
 * Show a success notification
 */
export const showSuccess = (title, message) => showNotification(title, message, 'success');

/**
 * Show a warning notification
 */
export const showWarning = (title, message) => showNotification(title, message, 'warning');

/**
 * Show an info notification
 */
export const showInfo = (title, message) => showNotification(title, message, 'info');

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
