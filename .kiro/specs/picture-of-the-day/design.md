# Design Document: Picture of the Day

## Overview

The Picture of the Day feature enhances journal entries by allowing users to attach a single photo per entry. The photo will be displayed in a postcard-style frame positioned in the bottom-right corner of the journal modal's right page. Users can capture photos via camera or upload from their device. Photos will be stored in Firebase Storage and referenced in Firestore journal documents.

## Architecture

### Frontend Components

**JournalModal.jsx** (Modified)
- Add state management for photo data
- Integrate PictureOfTheDay component
- Handle photo data in save/fetch operations

**PictureOfTheDay.jsx** (New Component)
- Manages photo capture/upload UI
- Handles camera access and file selection
- Displays photo in postcard frame
- Provides remove/replace functionality

### Backend API

**journal.js routes** (Modified)
- Update `/add` endpoint to accept `photoURL` field
- Update `/:date` endpoint to return `photoURL` field
- No additional endpoints needed (using existing structure)

### Storage Strategy

**Firebase Storage**
- Store photos in `/journal-photos/{uid}/{date}.jpg` path
- Use Firebase Storage SDK for upload
- Generate download URLs for Firestore storage

**Firestore Schema Update**
```javascript
{
  title: string,
  content: string,
  mood: string,
  date: string,
  prompts: array,
  answers: array,
  photoURL: string | null,  // NEW FIELD
  updatedAt: timestamp
}
```

## Components and Interfaces

### PictureOfTheDay Component

**Props:**
```typescript
{
  theme: 'light' | 'dark',
  photoURL: string | null,
  onPhotoChange: (url: string | null) => void,
  selectedDate: string
}
```

**State:**
```typescript
{
  showOptions: boolean,        // Show camera/upload buttons
  isCapturing: boolean,        // Camera is active
  previewURL: string | null,   // Local preview before upload
  uploading: boolean           // Upload in progress
}
```

**UI Structure:**
```
┌─────────────────────────────┐
│  Postcard Frame             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   Photo or            │  │
│  │   Upload Interface    │  │
│  │                       │  │
│  └───────────────────────┘  │
│  [📷 Camera] [📁 Upload]    │
│  [❌ Remove] (if photo)     │
└─────────────────────────────┘
```

### Camera Capture Flow

1. User clicks "📷 Camera" button
2. Request camera permissions via `navigator.mediaDevices.getUserMedia()`
3. Display video stream in modal overlay
4. User clicks capture button
5. Draw video frame to canvas, convert to blob
6. Display preview in postcard frame
7. Upload to Firebase Storage on save

### File Upload Flow

1. User clicks "📁 Upload" button
2. Trigger hidden file input with `accept="image/*"`
3. Read file using FileReader
4. Display preview in postcard frame
5. Upload to Firebase Storage on save

### Firebase Storage Integration

**Upload Function:**
```javascript
async function uploadPhoto(file, uid, date) {
  const storage = getStorage();
  const storageRef = ref(storage, `journal-photos/${uid}/${date}.jpg`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
```

**Delete Function:**
```javascript
async function deletePhoto(uid, date) {
  const storage = getStorage();
  const storageRef = ref(storage, `journal-photos/${uid}/${date}.jpg`);
  await deleteObject(storageRef);
}
```

## Data Models

### Modified Journal Entry Model

```javascript
{
  title: "",
  content: "",
  mood: "",
  date: "2025-11-12",
  prompts: ["prompt1", "prompt2"],
  answers: ["answer1", "answer2"],
  photoURL: "https://firebasestorage.googleapis.com/...",  // NEW
  updatedAt: Timestamp
}
```

### Photo Upload Payload

```javascript
// Client stores file temporarily
// On save, upload to Firebase Storage
// Then save journal with photoURL
```

## Error Handling

### Camera Access Errors

- **Permission Denied**: Show alert "Camera access denied. Please enable camera permissions."
- **No Camera Available**: Hide camera button, show only upload option
- **Camera in Use**: Show alert "Camera is being used by another application"

### Upload Errors

- **Invalid File Type**: Show alert "Please select an image file (JPG, PNG, GIF)"
- **File Too Large**: Show alert "Image must be under 5MB"
- **Upload Failed**: Show alert "Failed to upload photo. Please try again."

### Storage Errors

- **Storage Quota Exceeded**: Show alert "Storage limit reached. Please delete old photos."
- **Network Error**: Show alert "Network error. Please check your connection."

## Testing Strategy

### Unit Tests (Optional)

- Test photo state management in JournalModal
- Test file validation logic
- Test URL generation and cleanup

### Integration Tests (Optional)

- Test camera capture flow end-to-end
- Test file upload flow end-to-end
- Test photo persistence with journal save
- Test photo removal and replacement

### Manual Testing Checklist

1. Verify camera capture works on desktop and mobile
2. Verify file upload accepts valid image formats
3. Verify photo displays correctly in both themes
4. Verify photo saves with journal entry
5. Verify photo loads when reopening entry
6. Verify photo removal works correctly
7. Verify photo replacement works correctly
8. Verify error messages display appropriately
9. Verify responsive layout on different screen sizes
10. Verify photo frame doesn't obstruct journal content

## UI/UX Considerations

### Positioning

- Bottom-right corner of right page
- Fixed position within modal scroll
- 200px x 150px frame size
- 20px margin from edges

### Styling

**Light Theme:**
- Cream/beige postcard border
- Subtle drop shadow
- Warm color accents

**Dark Theme:**
- Dark brown/sepia postcard border
- Soft glow effect
- Muted color accents

### Interactions

- Hover effects on buttons
- Smooth fade transitions
- Loading spinner during upload
- Success checkmark on upload complete

### Accessibility

- Alt text for images
- Keyboard navigation support
- Screen reader announcements
- Focus indicators on buttons
