# Implementation Plan: Picture of the Day

- [ ] 1. Create PictureOfTheDay component
  - [x] 1.1 Create component file structure and basic props
    - Create `src/components/PictureOfTheDay.jsx`
    - Define component props interface (theme, photoURL, onPhotoChange, selectedDate)
    - Set up initial state management (showOptions, isCapturing, previewURL, uploading)
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Implement file upload functionality
    - Create hidden file input element with image accept filter
    - Implement file selection handler with validation (file type, size under 5MB)
    - Use FileReader to generate preview URL
    - Call onPhotoChange with preview URL
    - _Requirements: 1.4, 3.3_

  - [x] 1.3 Implement camera capture functionality
    - Request camera permissions using navigator.mediaDevices.getUserMedia()
    - Create video stream display in modal overlay
    - Implement capture button to draw video frame to canvas
    - Convert canvas to blob and generate preview URL
    - Handle camera permission errors and display appropriate messages
    - _Requirements: 1.3, 4.1_

  - [x] 1.4 Build postcard frame UI
    - Create postcard-style container with theme-appropriate styling
    - Position frame in bottom-right corner (200px x 150px, 20px margins)
    - Display photo preview or upload interface based on state
    - Add smooth fade transitions for photo changes
    - Apply light theme (cream border, drop shadow) and dark theme (sepia border, glow) styles
    - _Requirements: 1.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 1.5 Implement photo removal functionality
    - Add remove button that appears when photo is displayed
    - Clear preview URL and reset state on removal
    - Call onPhotoChange with null value
    - _Requirements: 3.1, 3.2, 3.4_

- [x] 2. Modify JournalModal component
  - [x] 2.1 Add photo state management
    - Add photoURL state variable
    - Add photoFile state variable for temporary file storage
    - Initialize photoURL from fetched journal data
    - _Requirements: 2.2, 2.5_

  - [x] 2.2 Integrate PictureOfTheDay component
    - Import and render PictureOfTheDay component in right page section
    - Pass theme, photoURL, onPhotoChange callback, and selectedDate as props
    - Handle onPhotoChange callback to update local state
    - _Requirements: 1.1, 1.5_

  - [x] 2.3 Update save handler to include photo data
    - Convert photo to base64 string if photo exists
    - Include photoURL (base64 or URL) in journal save payload
    - Handle errors and show appropriate alerts
    - _Requirements: 2.1, 2.3, 3.3, 3.5_

  - [x] 2.4 Update fetch handler to load photo
    - Extract photoURL from fetched journal data
    - Set photoURL state to display existing photo
    - _Requirements: 2.2, 2.4_

- [ ] 3. Update backend API endpoints
  - [ ] 3.1 Modify POST /journal/add endpoint
    - Accept photoURL field in request body
    - Save photoURL to Firestore journal document
    - Return success response with saved data
    - _Requirements: 2.1, 2.3_

  - [ ] 3.2 Modify GET /journal/:date endpoint
    - Include photoURL field in response data
    - Return null if no photo exists for the entry
    - _Requirements: 2.2, 2.4_

- [ ]* 4. Add error handling and validation
  - Implement file type validation (JPG, PNG, GIF only)
  - Implement file size validation (max 5MB)
  - Add error messages for camera permission denied
  - Add error messages for upload failures
  - Add error messages for storage quota exceeded
  - _Requirements: 1.3, 1.4_

- [ ]* 5. Enhance UI polish and accessibility
  - Add loading spinner during photo upload
  - Add success checkmark animation on upload complete
  - Add hover effects to camera and upload buttons
  - Add keyboard navigation support for photo controls
  - Add alt text to displayed photos
  - Ensure responsive layout on mobile devices
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
