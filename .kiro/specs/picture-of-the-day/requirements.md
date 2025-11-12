# Requirements Document

## Introduction

This feature adds a "Picture of the Day" capability to the journal modal, allowing users to attach a single aesthetic photo to each journal entry. The photo will be displayed in a postcard-style frame positioned at a corner of the journal modal. Users can capture photos using their device camera or upload existing images from their device storage.

## Glossary

- **Journal Modal**: The book-like interface where users write their daily journal entries
- **Picture of the Day**: A single photo attachment associated with a specific journal entry
- **Postcard Frame**: An aesthetic border/frame styling applied to the displayed photo
- **Camera Capture**: The ability to take a photo using the device's camera through the browser
- **Media Upload**: The ability to select and upload an existing image file from device storage
- **Journal Entry**: A dated record containing title, mood, content, reflections, and optionally a photo
- **Backend API**: The Express.js server that handles journal data persistence in Firestore

## Requirements

### Requirement 1

**User Story:** As a journal user, I want to add a photo to my daily entry, so that I can visually capture memorable moments alongside my written reflections.

#### Acceptance Criteria

1. WHEN THE Journal Modal is open, THE Journal Modal SHALL display a picture upload interface in one corner
2. THE Journal Modal SHALL provide two options for adding photos: camera capture and device upload
3. WHEN a user selects the camera option, THE Journal Modal SHALL activate the device camera for photo capture
4. WHEN a user selects the upload option, THE Journal Modal SHALL open a file picker for image selection
5. THE Journal Modal SHALL display the selected photo within an aesthetic postcard-style frame

### Requirement 2

**User Story:** As a journal user, I want my photo to be saved with my journal entry, so that I can view it when I revisit that day's entry.

#### Acceptance Criteria

1. WHEN a user saves a journal entry with a photo, THE Backend API SHALL store the photo URL with the journal document
2. WHEN a user opens an existing journal entry, THE Journal Modal SHALL display the previously saved photo if one exists
3. THE Backend API SHALL accept photo data as part of the journal entry payload
4. THE Backend API SHALL return photo data when fetching a journal entry
5. THE Journal Modal SHALL persist the photo selection until the user saves or closes the modal

### Requirement 3

**User Story:** As a journal user, I want to remove or replace a photo, so that I can correct mistakes or update my visual memory.

#### Acceptance Criteria

1. WHEN a photo is displayed in the Journal Modal, THE Journal Modal SHALL provide a remove button
2. WHEN a user clicks the remove button, THE Journal Modal SHALL clear the photo and restore the upload interface
3. WHEN a user selects a new photo while one is already displayed, THE Journal Modal SHALL replace the existing photo
4. THE Journal Modal SHALL allow saving an entry without a photo
5. WHEN a user removes a photo and saves, THE Backend API SHALL update the entry to have no photo

### Requirement 4

**User Story:** As a journal user, I want the photo feature to match the app's aesthetic, so that it feels integrated and visually pleasing.

#### Acceptance Criteria

1. THE Journal Modal SHALL position the photo frame in a corner that does not obstruct journal content
2. THE Journal Modal SHALL apply theme-appropriate styling to the postcard frame based on light or dark mode
3. THE Journal Modal SHALL size the photo frame to be noticeable but not overwhelming
4. THE Journal Modal SHALL apply smooth transitions when showing or hiding the photo
5. THE Journal Modal SHALL maintain the book-like aesthetic of the existing modal design
