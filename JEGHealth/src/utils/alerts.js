import { showError, showSuccess, showWarning } from './NotificationHelper';

export const showErrorAlert = (title, message) => {
  showError(title || 'Error', message);
};

export const showSuccessAlert = (title, message, onPress) => {
  showSuccess(title || 'Success', message);
  
  // Execute callback after showing notification
  if (onPress) {
    setTimeout(onPress, 1000);
  }
};

export const showConfirmAlert = (title, message, onConfirm, onCancel) => {
  showWarning(
    title,
    `${message}\n\nThis action will be performed automatically in 3 seconds. Close the app to cancel.`
  );
  
  // Auto-confirm after 3 seconds (no interactive buttons in notifications)
  setTimeout(() => {
    if (onConfirm) {
      onConfirm();
    }
  }, 3000);
};