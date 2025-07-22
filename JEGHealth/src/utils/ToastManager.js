/**
 * ToastManager - Simple toast notification system for Expo Go
 * Provides visual feedback without system notification dependencies
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import SimpleToast from '../components/SimpleToast';

// Create Toast Context
const ToastContext = createContext();

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, visible: true };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration + animation time
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 600); // Extra time for hide animation
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, visible: false } : toast
    ));
  }, []);

  const showError = useCallback((title, message) => {
    showToast(`${title}: ${message}`, 'error');
  }, [showToast]);

  const showSuccess = useCallback((title, message) => {
    showToast(`${title}: ${message}`, 'success');
  }, [showToast]);

  const showWarning = useCallback((title, message) => {
    showToast(`${title}: ${message}`, 'warning');
  }, [showToast]);

  const showInfo = useCallback((title, message) => {
    showToast(`${title}: ${message}`, 'info');
  }, [showToast]);

  const value = {
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render active toasts */}
      {toasts.map((toast, index) => (
        <SimpleToast
          key={toast.id}
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onHide={() => hideToast(toast.id)}
          style={{ top: 60 + (index * 80) }} // Stack multiple toasts
        />
      ))}
    </ToastContext.Provider>
  );
};

// Hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Standalone functions for backward compatibility
let globalToastContext = null;

export const setGlobalToastContext = (context) => {
  globalToastContext = context;
};

export const showError = (title, message) => {
  if (globalToastContext) {
    globalToastContext.showError(title, message);
  } else {
    console.log(`[ERROR] ${title}: ${message}`);
  }
};

export const showSuccess = (title, message) => {
  if (globalToastContext) {
    globalToastContext.showSuccess(title, message);
  } else {
    console.log(`[SUCCESS] ${title}: ${message}`);
  }
};

export const showWarning = (title, message) => {
  if (globalToastContext) {
    globalToastContext.showWarning(title, message);
  } else {
    console.log(`[WARNING] ${title}: ${message}`);
  }
};

export const showInfo = (title, message) => {
  if (globalToastContext) {
    globalToastContext.showInfo(title, message);
  } else {
    console.log(`[INFO] ${title}: ${message}`);
  }
};
