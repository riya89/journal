# Implementation Plan

- [x] 1. Create AuthContext with Firebase auth state observer
  - Create `src/contexts/AuthContext.jsx` file
  - Implement React Context with user state, loading state, and error state
  - Set up Firebase `onAuthStateChanged` observer to monitor auth state changes
  - Implement automatic token refresh mechanism that runs every 50 minutes
  - Add cleanup logic to clear intervals on unmount
  - _Requirements: 1.1, 3.1, 3.2, 3.3, 4.1, 4.2_

- [x] 2. Implement auth methods in AuthContext
  - Create `login()` method that accepts Firebase user, fetches avatar from backend, stores token and user in localStorage
  - Create `logout()` method that clears localStorage, resets state, and redirects to login
  - Create `getValidToken()` method that returns current token or refreshes if needed
  - Create `refreshToken()` method that calls Firebase `getIdToken(true)` and updates localStorage
  - Add error handling for all auth operations
  - _Requirements: 2.1, 2.2, 2.3, 4.2, 4.3_

- [x] 3. Create API utility with 401 error handling
  - Create `src/utils/api.js` file with `apiRequest()` function
  - Implement automatic token injection from localStorage to Authorization header
  - Add 401 error detection and handling logic
  - Implement debounced logout to prevent duplicate logout calls
  - Create helper function to trigger logout from AuthContext
  - Export utility functions for use throughout the app
  - _Requirements: 1.3, 5.1, 5.2, 5.3_

- [x] 4. Integrate AuthProvider into App.js
  - Import AuthProvider and wrap the entire app
  - Remove manual localStorage user checks from App.js
  - Replace user state management with `useAuth()` hook
  - Remove avatar checking logic (move to AuthContext login method)
  - Simplify App.js to focus on routing only
  - _Requirements: 3.3, 4.1, 4.3_

- [x] 5. Update Login.jsx to use AuthContext
  - Import and use `useAuth()` hook
  - Replace direct localStorage manipulation with `login()` method from context
  - Remove manual token storage logic
  - Let AuthContext handle all auth state updates
  - Keep existing Google sign-in UI and flow
  - _Requirements: 1.1, 1.2, 2.1, 4.2_

- [x] 6. Refactor API calls to use apiRequest utility
  - Update all `fetch()` calls in components to use `apiRequest()` from `src/utils/api.js`
  - Remove manual Authorization header attachment from individual API calls
  - Remove manual 401 error handling from components
  - Update the following files: `Home.jsx`, `GrowthGarden.jsx`, `AIAssistant.jsx`, `MoodDashboard.jsx`, `MonthlyPlanner.jsx`, and all modal components
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Add session expiration notifications
  - Create or update notification/toast component for displaying auth messages
  - Add notification when user is logged out due to token expiration
  - Add notification when token refresh fails
  - Display "Session expired. Please log in again." message on 401 errors
  - _Requirements: 1.4, 5.4_

- [x] 8. Update logout functionality across the app
  - Update Header.jsx to use `logout()` from AuthContext
  - Update ProfileSidebar.jsx to use `logout()` from AuthContext
  - Remove direct localStorage clearing from components
  - Ensure consistent logout behavior throughout the app
  - _Requirements: 1.2, 4.2_

- [ ]* 9. Add loading states and error boundaries
  - Display loading spinner while auth state is initializing
  - Add error boundary component to catch auth-related errors
  - Show appropriate error messages for different failure scenarios
  - Implement retry logic for transient errors
  - _Requirements: 4.4_

- [ ]* 10. Test auth synchronization scenarios
  - Test login flow and verify token storage
  - Test automatic token refresh after 50 minutes
  - Test logout and verify all auth data is cleared
  - Test 401 error handling by simulating expired token
  - Test multi-tab synchronization by logging out from one tab
  - Test app reload with valid token in localStorage
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 5.1, 5.2_
