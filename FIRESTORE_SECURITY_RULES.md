# Firestore Security Rules - Make User Data Private

## Current Problem
Right now, anyone with access to your Firestore console can see all user data. You need to set up security rules so that:
- Users can only read/write their own data
- No one else can access another user's data
- You (as admin) can still see data in the Firebase console

## Solution: Firestore Security Rules

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top

### Step 2: Replace Your Rules

Copy and paste these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // ============================================
    // USERS COLLECTION
    // ============================================
    match /users/{userId} {
      // Users can read and write their own document
      allow read, write: if isOwner(userId);
      
      // Subcollections under users/{userId}
      match /{document=**} {
        // Users can read/write all their subcollections
        allow read, write: if isOwner(userId);
      }
    }
    
    // ============================================
    // SPECIFIC SUBCOLLECTIONS (Optional - more granular control)
    // ============================================
    
    // Journal entries
    match /users/{userId}/journalEntries/{entryId} {
      allow read, write: if isOwner(userId);
    }
    
    // Planner data
    match /users/{userId}/planner/{plannerId} {
      allow read, write: if isOwner(userId);
    }
    
    // Time capsules
    match /users/{userId}/timeCapsules/{capsuleId} {
      allow read, write: if isOwner(userId);
    }
    
    // Gratitude entries
    match /users/{userId}/gratitude/{gratitudeId} {
      allow read, write: if isOwner(userId);
    }
    
    // Quests
    match /users/{userId}/quests/{questId} {
      allow read, write: if isOwner(userId);
    }
    
    // Task templates
    match /users/{userId}/taskTemplates/{templateId} {
      allow read, write: if isOwner(userId);
    }
    
    // AI conversations
    match /users/{userId}/conversations/{conversationId} {
      allow read, write: if isOwner(userId);
    }
    
    // Affirmations
    match /users/{userId}/affirmations/{affirmationId} {
      allow read, write: if isOwner(userId);
    }
    
    // ============================================
    // DENY ALL OTHER ACCESS
    // ============================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Publish the Rules

1. Click **Publish** button
2. Confirm the changes

### Step 4: Test the Rules

**Test in Firebase Console:**
1. Go to the **Rules** tab
2. Click **Rules Playground** (if available)
3. Test with different user IDs to verify access

**Test in your app:**
1. Log in as a user
2. Try to access your data - should work ✅
3. Try to access another user's data - should fail ❌

## What These Rules Do

### ✅ Allowed:
- Users can read/write their own data in `/users/{their-uid}/`
- Users can read/write all subcollections under their user document
- Authenticated users only

### ❌ Denied:
- Reading other users' data
- Writing to other users' data
- Unauthenticated access
- Any access outside the `/users/` collection

## Important Notes

### 1. You Can Still See Data as Admin
As the Firebase project owner, you can still view all data in the Firebase Console. The security rules only apply to client-side access (your app).

### 2. Backend Access Still Works
Your backend (Node.js with Firebase Admin SDK) bypasses these rules and can still access all data. This is normal and expected.

### 3. Testing Rules
You can test rules in the Firebase Console:
```
Location: /users/USER_ID_HERE/journalEntries/ENTRY_ID
Authenticated: Yes
Auth UID: USER_ID_HERE
Operation: Read
Result: ✅ Allow
```

```
Location: /users/DIFFERENT_USER_ID/journalEntries/ENTRY_ID
Authenticated: Yes
Auth UID: USER_ID_HERE
Operation: Read
Result: ❌ Deny
```

## Advanced: More Restrictive Rules

If you want even more control, you can add validation:

```javascript
match /users/{userId}/journalEntries/{entryId} {
  allow read: if isOwner(userId);
  
  allow create: if isOwner(userId) 
    && request.resource.data.keys().hasAll(['date', 'content', 'mood'])
    && request.resource.data.mood >= 1 
    && request.resource.data.mood <= 5;
  
  allow update: if isOwner(userId)
    && request.resource.data.userId == userId;
  
  allow delete: if isOwner(userId);
}
```

This validates:
- Journal entries must have required fields
- Mood must be between 1-5
- User ID can't be changed

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause:** User is trying to access data they don't own

**Solution:** Check that your app is using the correct user ID:
```javascript
// Correct
const userId = auth.currentUser.uid;
const docRef = db.collection('users').doc(userId);

// Wrong - hardcoded user ID
const docRef = db.collection('users').doc('some-other-user-id');
```

### Error: "PERMISSION_DENIED"

**Cause:** User is not authenticated

**Solution:** Make sure user is logged in before accessing Firestore:
```javascript
if (!auth.currentUser) {
  console.error('User not logged in');
  return;
}
```

## Migration Checklist

- [ ] Backup your Firestore data (Export from Firebase Console)
- [ ] Copy the security rules above
- [ ] Paste into Firebase Console > Firestore > Rules
- [ ] Click Publish
- [ ] Test with your app
- [ ] Verify users can access their own data
- [ ] Verify users cannot access other users' data
- [ ] Check for any "permission denied" errors in console

## Summary

After applying these rules:
- ✅ User data is private
- ✅ Each user can only see their own data
- ✅ You can still see all data in Firebase Console (as admin)
- ✅ Your backend can still access all data (Admin SDK)
- ✅ Unauthorized access is blocked

Your user data is now secure! 🔒
