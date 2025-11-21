// API utility with automatic token injection and 401 error handling
import { showErrorToast } from './toast';

// Store logout handler reference
let logoutHandler = null;

// Debounce mechanism to prevent duplicate logout calls
let isLoggingOut = false;

/**
 * Register the logout handler from AuthContext
 * This should be called once when the app initializes
 * @param {Function} handler - The logout function from AuthContext
 */
export const registerLogoutHandler = (handler) => {
  logoutHandler = handler;
};

/**
 * Handle unauthorized (401) responses
 * Triggers logout with debouncing to prevent duplicate calls
 */
const handleUnauthorized = () => {
  // Prevent duplicate logout attempts
  if (isLoggingOut) {
    return;
  }

  isLoggingOut = true;

  // Show session expiration notification
  showErrorToast('Session expired. Please log in again.');

  // Call the logout handler if registered
  if (logoutHandler) {
    logoutHandler();
  } else {
    // Fallback: clear localStorage and redirect
    console.warn('Logout handler not registered, using fallback');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  // Reset debounce flag after a short delay
  setTimeout(() => {
    isLoggingOut = false;
  }, 1000);
};

/**
 * Make an API request with automatic token injection and error handling
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - The fetch response
 */
export const apiRequest = async (url, options = {}) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Prepare headers with token
  const headers = {
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the request
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check for 401 Unauthorized
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  } catch (error) {
    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Helper function to make a GET request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiGet = async (url, options = {}) => {
  return apiRequest(url, {
    ...options,
    method: 'GET',
  });
};

/**
 * Helper function to make a POST request
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiPost = async (url, data, options = {}) => {
  return apiRequest(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
};

/**
 * Helper function to make a PUT request
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiPut = async (url, data, options = {}) => {
  return apiRequest(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
};

/**
 * Helper function to make a DELETE request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiDelete = async (url, options = {}) => {
  return apiRequest(url, {
    ...options,
    method: 'DELETE',
  });
};
