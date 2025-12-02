import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { registerLogoutHandler } from '../utils/api';
import { showErrorToast } from '../utils/toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Login method - accepts Firebase user and fetches avatar from backend
  const login = useCallback(async (firebaseUser) => {
    try {
      setError(null);
      const token = await firebaseUser.getIdToken();
      
      // Fetch avatar from backend
      let avatarURL = null;
      try {
        const response = await fetch('https://journal-6xfj.onrender.com/journal/avatar', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          avatarURL = data.avatarURL;
        }
      } catch (avatarErr) {
        // Avatar fetch is optional, don't fail login if it errors
        console.warn('Could not fetch avatar:', avatarErr);
      }

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        avatarURL: avatarURL,
        emailVerified: firebaseUser.emailVerified,
      };

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to complete login');
      throw err;
    }
  }, []);

  // Logout method - signs out from Firebase, clears localStorage, resets state, and redirects
  const logout = useCallback(async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      setUser(null);
      setError(null);
      
      // Redirect to login
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      // Even if Firebase signOut fails, clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      window.location.href = '/';
    }
  }, []);

  // Get valid token - returns current token or refreshes if needed
  const getValidToken = async () => {
    try {
      if (!auth.currentUser) {
        return null;
      }
      
      const token = await auth.currentUser.getIdToken();
      localStorage.setItem('token', token);
      return token;
    } catch (err) {
      console.error('Error getting valid token:', err);
      return null;
    }
  };

  // Refresh token method - forces token refresh
  const refreshToken = useCallback(async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      const newToken = await auth.currentUser.getIdToken(true);
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      setError('Failed to refresh session');
      showErrorToast('Unable to refresh session. Please log in again.');
      logout();
      throw err;
    }
  }, [logout]);

  // Update user data (e.g., avatar) - updates both state and localStorage
  const updateUser = useCallback((updates) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Register logout handler with API utility
  useEffect(() => {
    registerLogoutHandler(logout);
  }, [logout]);

  // Set up Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const token = await firebaseUser.getIdToken();
          
          // Check if we already have user data in localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            // Update token and use stored user data
            localStorage.setItem('token', token);
            setUser(JSON.parse(storedUser));
          } else {
            // Fetch user data including avatar
            await login(firebaseUser);
          }
        } else {
          // User is signed out
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Authentication error occurred');
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [login]);

  // Set up automatic token refresh every 50 minutes
  useEffect(() => {
    if (!user) {
      return;
    }

    // Refresh token every 50 minutes (before 1-hour expiration)
    const refreshInterval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          await refreshToken();
        }
      } catch (err) {
        console.error('Automatic token refresh failed:', err);
        // Note: refreshToken already shows error toast and logs out
      }
    }, 50 * 60 * 1000); // 50 minutes in milliseconds

    // Cleanup interval on unmount or when user changes
    return () => clearInterval(refreshInterval);
  }, [user, refreshToken]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    getValidToken,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
