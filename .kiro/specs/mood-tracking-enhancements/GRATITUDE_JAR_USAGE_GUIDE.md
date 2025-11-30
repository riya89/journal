# Gratitude Jar Usage Guide

## Overview
The Gratitude Jar feature allows users to collect and revisit moments of gratitude. This guide explains how to use the feature and integrate it into your application.

## Components Created

### 1. GratitudeJar.jsx
Main component that displays the gratitude jar with visual representation and manages all gratitude-related functionality.

**Features:**
- Visual jar that fills as gratitudes are added
- Display gratitude count and fill percentage
- Read random gratitude from the jar
- Add new gratitudes
- View recent gratitudes list
- Empty state for new users

### 2. AddGratitudeModal.jsx
Modal component for adding new gratitude entries.

**Features:**
- Text input for gratitude message
- Mood selector (1-5 scale)
- Character count
- Form validation
- Loading states

## Backend Requirements

The following backend endpoints must be implemented (see GRATITUDE_JAR_BACKEND.md):

1. **POST** `/journal/gratitude/add` - Add new gratitude entry
2. **GET** `/journal/gratitude/random` - Get random gratitude
3. **GET** `/journal/gratitude/all` - Get all gratitudes with optional filters

## Integration Steps

### Step 1: Add Backend Endpoints
Copy the code from `GRATITUDE_JAR_BACKEND.md` and add it to your Node.js backend server.

### Step 2: Add Route to App
Add a route for the Gratitude Jar page in your `App.js`:

```javascript
import GratitudeJar from './components/GratitudeJar';

// In your routes:
<Route path="/gratitude-jar" element={<GratitudeJar />} />
```

### Step 3: Add Navigation Link
Add a link to the Gratitude Jar in your navigation menu:

```javascript
<Link to="/gratitude-jar" className="nav-link">
  🏺 Gratitude Jar
</Link>
```

### Step 4: Optional - Add to Mood Dashboard
You can also integrate the Gratitude Jar into your Mood Dashboard:

```javascript
import GratitudeJar from '../components/GratitudeJar';

// In MoodDashboard.jsx:
<div className="gratitude-section">
  <GratitudeJar />
</div>
```

## Usage Examples

### Adding a Gratitude
1. Click "Add Gratitude" button
2. Write what you're grateful for
3. Select your current mood
4. Click "Add to Jar"

### Reading Random Gratitude
1. Click "Read Random Gratitude" button
2. A random gratitude from your collection will be displayed
3. Click "Read Another" to see a different one

### Viewing Recent Gratitudes
Scroll down to see your 5 most recent gratitude entries.

## Visual Features

### Jar Visualization
- **Empty Jar**: Shows when no gratitudes have been added
- **Filling Animation**: Jar fills up as more gratitudes are added (up to 100%)
- **Gratitude Notes**: Visual representation of individual gratitudes as colored circles with mood emojis
- **Sparkles**: Animated sparkles appear when jar contains gratitudes

### Color Scheme
- Primary: Amber/Gold tones (#fbbf24, #f59e0b)
- Accent: Purple for action buttons (#7c3aed)
- Mood indicators: Emoji-based (😢 😕 😐 🙂 😊)

## API Configuration

The component uses the following environment variable:
```
REACT_APP_API_BASE_URL=http://localhost:8000/journal
```

Make sure this is set in your `.env` file.

## Error Handling

The component handles the following scenarios:
- Empty gratitude list (shows empty state)
- Failed API requests (shows error toast)
- Loading states (shows loading spinner)
- No random gratitude available (shows error message)

## Styling

The component uses Tailwind CSS classes and includes:
- Dark mode support
- Responsive design
- Smooth animations and transitions
- Hover effects
- Loading states

## Requirements Met

This implementation satisfies the following requirements from the spec:

✅ **Requirement 4.1**: Gratitude entries stored with date and mood
✅ **Requirement 4.2**: Visual jar representation that fills as entries are added
✅ **Requirement 4.3**: Random gratitude retrieval
✅ **Requirement 4.4**: Display text, date, and mood for gratitudes
✅ **Requirement 4.5**: Filtering options (implemented in backend API)

## Future Enhancements

Potential improvements for future versions:
- Export gratitudes to PDF or text file
- Search and filter gratitudes in the UI
- Share gratitudes with friends
- Gratitude streaks and statistics
- Themed jar designs
- Audio recordings of gratitudes
- Photo attachments

## Troubleshooting

### Gratitudes not loading
- Check that backend endpoints are running
- Verify Firebase authentication token is valid
- Check browser console for errors

### Jar not filling
- Verify gratitudes are being saved to database
- Check that `fillPercentage` calculation is correct
- Ensure SVG is rendering properly

### Random gratitude not working
- Ensure at least one gratitude exists
- Check backend endpoint is returning data
- Verify API_BASE_URL is configured correctly

## Testing Checklist

- [ ] Add a gratitude entry
- [ ] View gratitude in recent list
- [ ] Read random gratitude
- [ ] Read multiple random gratitudes
- [ ] Check jar fill animation
- [ ] Test empty state
- [ ] Test error handling
- [ ] Test dark mode
- [ ] Test responsive design
- [ ] Verify data persists after refresh
