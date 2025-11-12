# Backend Changes for Picture of the Day

## Overview
You need to make minimal changes to your existing backend code to support storing and retrieving photo URLs with journal entries.

## Changes Required

### 1. Modify POST /journal/add endpoint

**Location:** In your `router.post("/add", verifyToken, async (req, res) => {...})`

**Change:** Add `photoURL` to the destructured request body and save it to Firestore.

**Before:**
```javascript
const { title, content, mood, date, prompts = [], answers = [] } = req.body;
```

**After:**
```javascript
const { title, content, mood, date, prompts = [], answers = [], photoURL = null } = req.body;
```

**Before:**
```javascript
await journalRef.set({
  title,
  content,
  mood,
  date,
  prompts,
  answers,
  updatedAt: new Date(),
});
```

**After:**
```javascript
await journalRef.set({
  title,
  content,
  mood,
  date,
  prompts,
  answers,
  photoURL,  // ADD THIS LINE
  updatedAt: new Date(),
});
```

### 2. GET /journal/:date endpoint

**No changes needed!** Your existing code already returns all fields from the document, so `photoURL` will automatically be included when it exists.

The frontend will receive `photoURL: null` for entries without photos, and the actual URL/base64 string for entries with photos.

## Summary

That's it! Just add `photoURL` to two places in your `/add` endpoint:
1. Extract it from request body
2. Save it to Firestore

The rest of your backend code remains unchanged.
