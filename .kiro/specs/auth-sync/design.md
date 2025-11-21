# Design Document: Firebase Auth Synchronization

## Overview

This design implements a robust authentication state management system for the React frontend that automatically synchronizes with Firebase authentication state, handles token expiration, refreshes tokens proactively, and gracefully handles API authentication errors. The solution uses React Context for centralized auth management and Firebase's `onAuthStateChanged` observer for real-time auth state monitoring.

## Architecture

### High-Level Flow

```
User Login → Firebase Auth → Auth Context → Token Storage → API Calls
                ↓                                              ↓
         Auth Observer                              401 Error Handler
                ↓                                              ↓
         Token Refresh ←────────────────────────────── Auto Logout
```

### Key Components

1. **AuthContext** - Centralized authentication state management
2. **AuthProvider** - Wraps the application and provides auth state
3. **Firebase Auth Observer** - Monitors authentication state changes
4. **Token Refresh Mechanism** - Proactively refreshes tokens before expiration
5. **API Interceptor** - Catches 401 errors and triggers logout
6. **Protected Route Wrapper** - Ensures authenticated access to routes

## Components and Interfaces

### 1. Auth Context (`src/contexts/AuthContext.jsx`)

**Purpose**: Provide centralized authentication state and methods to all components.

**State Management**:
```javascript
{
  user: Object | null,           // Current user object with avatarURL
  loading: boolean,              // Auth initialization state
  error: string | null           // Auth error messages
}
```

**Exposed Methods**:
- `login(firebaseUser)` - Handle user login and token storage
- `logout()` - Clear auth state and redirect to login
- `refreshToken()` - Manually refresh the Firebase ID token
- `getValidToken()` - Get current valid token (auto-refresh if needed)

**Implementation Details**:
- Uses `onAuthStateChanged` to monitor Firebase auth state
- Automatically refreshes token every 50 minutes (before 1-hour expiration)
- Stores user and token in localStorage for persistence
- Clears all auth data on logout

### 2. Token Refresh Strategy

**Approach**: Proactive token refresh before expiration

**Timing**:
- Firebase tokens expire after 1 hour
- Refresh token at 50-minute mark to provide buffer
- Use `setInterval` to schedule automatic refresh
- Clear interval on logout or component unmount

**Implementation**:
```javascript
// Refresh token every 50 minutes
const refreshInterval = setInterval(async () => {
  if (auth.currentUser) {
    const newToken = await auth.currentUser.getIdToken(true);
    localStorage.setItem("token", newToken);
  }
}, 50 * 60 * 1000);
```

### 3. API Request Handler (`src/utils/api.js`)

**Purpose**: Centralized API request handler with automatic token injection and error handling.

**Features**:
- Automatically attaches current valid token to all requests
- Catches 401 errors and triggers logout
- Prevents duplicate logout calls with debouncing
- Provides consistent error handling across the app

**Interface**:
```javascript
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (response.status === 401) {
    // Trigger logout from AuthContext
    handleUnauthorized();
  }
  
  return response;
};
```

### 4. Auth State Observer

**Firebase Integration**:
```javascript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in
      const token = await firebaseUser.getIdToken();
      localStorage.setItem("token", token);
      
      // Fetch additional user data (avatar, etc.)
      await loadUserProfile(firebaseUser);
    } else {
      // User is signed out
      clearAuthState();
    }
    setLoading(false);
  });
  
  return () => unsubscribe();
}, []);
```

**Benefits**:
- Automatically detects when Firebase logs user out
- Handles token refresh initiated by Firebase
- Syncs UI state with Firebase auth state
- Works across browser tabs

### 5. Protected Route Component

**Purpose**: Ensure only authenticated users can access certain routes.

**Implementation**:
```javascript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
```

## Data Models

### User Object Structure
```javascript
{
  uid: string,              // Firebase user ID
  email: string,            // User email
  displayName: string,      // User display name
  photoURL: string,         // Firebase profile photo
  avatarURL: string,        // Custom avatar from backend
  emailVerified: boolean    // Email verification status
}
```

### Auth State
```javascript
{
  user: User | null,
  loading: boolean,
  error: string | null
}
```

## Error Handling

### Token Expiration Scenarios

1. **Active Session Token Expires**
   - Token refresh mechanism prevents this
   - If refresh fails, trigger logout with message

2. **Inactive Session (User Away)**
   - Next API call returns 401
   - API handler catches error and triggers logout
   - Show "Session expired" notification

3. **Firebase Auth State Changes**
   - `onAuthStateChanged` detects change
   - Automatically updates UI to logged-out state

### Error Messages

- "Your session has expired. Please log in again."
- "Authentication failed. Please try again."
- "Unable to refresh session. Please log in again."

### User Notifications

Use a toast/notification system to inform users:
```javascript
const showNotification = (message, type) => {
  // Display toast notification
  // type: 'info', 'error', 'success'
};
```

## Integration Points

### Current Code Changes Required

1. **App.js**
   - Wrap with `AuthProvider`
   - Remove manual localStorage checks
   - Use `useAuth()` hook instead

2. **Login.jsx**
   - Use `login()` method from AuthContext
   - Remove direct localStorage manipulation
   - Let AuthContext handle token storage

3. **API Calls Throughout App**
   - Replace `fetch()` with `apiRequest()` utility
   - Remove manual token attachment
   - Remove manual 401 handling

4. **Home.jsx and Other Pages**
   - Use `useAuth()` to access user state
   - Use `logout()` method for logout functionality

## Testing Strategy

### Unit Tests

1. **AuthContext Tests**
   - Test login flow
   - Test logout flow
   - Test token refresh
   - Test error handling

2. **API Utility Tests**
   - Test token injection
   - Test 401 error handling
   - Test request/response handling

### Integration Tests

1. **Auth Flow Tests**
   - Login → Access protected route → Logout
   - Token expiration → Auto logout
   - Multiple tabs sync

2. **Error Scenario Tests**
   - Network failure during token refresh
   - Backend returns 401
   - Firebase auth state changes

### Manual Testing Checklist

- [ ] Login successfully and verify token stored
- [ ] Wait 50 minutes and verify token refreshes
- [ ] Make API call after token expires (simulate by clearing token)
- [ ] Verify 401 triggers logout
- [ ] Open app in two tabs, logout from one, verify other tab syncs
- [ ] Close app and reopen, verify user still logged in
- [ ] Verify logout clears all auth data

## Implementation Notes

### Token Storage

- Store token in localStorage for persistence
- Consider sessionStorage for more secure, non-persistent option
- Never store sensitive data beyond token and basic user info

### Performance Considerations

- Token refresh runs in background, doesn't block UI
- Auth state observer is lightweight
- API interceptor adds minimal overhead

### Security Considerations

- Always use HTTPS in production
- Token stored in localStorage is accessible to XSS attacks
- Backend must validate token on every request
- Consider implementing refresh tokens for enhanced security

### Browser Compatibility

- Uses modern Firebase SDK (v9+)
- Compatible with all modern browsers
- localStorage available in all target browsers

## Migration Path

1. Create AuthContext and provider
2. Create API utility with 401 handling
3. Wrap App with AuthProvider
4. Update Login.jsx to use AuthContext
5. Update all API calls to use apiRequest utility
6. Test thoroughly in development
7. Deploy to production with monitoring

## Future Enhancements

- Implement refresh token pattern for better security
- Add biometric authentication support
- Implement "Remember me" functionality
- Add session timeout warnings before auto-logout
- Implement token rotation for enhanced security
