// Centralized API configuration
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://journal-6xfj.onrender.com/journal';

// Extract the root URL (without /journal) - handle both with and without trailing /journal
const ROOT_URL = BASE_URL.endsWith('/journal') 
  ? BASE_URL.slice(0, -8)  // Remove '/journal' (8 characters)
  : BASE_URL.replace('/journal', '');  // Fallback for middle occurrence

export const API_BASE_URL = BASE_URL;
export const RAINDROP_BASE_URL = `${ROOT_URL}/raindrop`;
export const AUTH_BASE_URL = `${ROOT_URL}/auth`;

// Helper to build full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getRaindropUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${RAINDROP_BASE_URL}/${cleanEndpoint}`;
};
