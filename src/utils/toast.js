/**
 * Toast notification utility for displaying temporary messages
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast: 'info', 'success', 'error', 'warning'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  // Create toast element
  const toast = document.createElement('div');
  
  // Set base classes and type-specific styling
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };
  
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity ${
    typeStyles[type] || typeStyles.info
  }`;
  
  toast.textContent = message;
  toast.style.opacity = '1';
  
  // Add to DOM
  document.body.appendChild(toast);
  
  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
};

/**
 * Show a success toast
 * @param {string} message - The message to display
 */
export const showSuccessToast = (message) => {
  showToast(message, 'success');
};

/**
 * Show an error toast
 * @param {string} message - The message to display
 */
export const showErrorToast = (message) => {
  showToast(message, 'error');
};

/**
 * Show a warning toast
 * @param {string} message - The message to display
 */
export const showWarningToast = (message) => {
  showToast(message, 'warning');
};

/**
 * Show an info toast
 * @param {string} message - The message to display
 */
export const showInfoToast = (message) => {
  showToast(message, 'info');
};
