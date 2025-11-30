# Affirmation Card Usage Guide

## Quick Start

The `AffirmationCard` component is ready to use in any page. Here's how to integrate it:

## Basic Usage

```jsx
import AffirmationCard from '../components/AffirmationCard';

function YourPage({ theme }) {
  return (
    <div>
      <h1>Your Page Title</h1>
      <AffirmationCard theme={theme} />
    </div>
  );
}
```

## Recommended Placements

### 1. Home Page (Dashboard)
Perfect for greeting users with a personalized message.

```jsx
// src/pages/Home.jsx
import AffirmationCard from '../components/AffirmationCard';

export default function Home({ theme }) {
  return (
    <div className="home-page">
      {/* Welcome section */}
      <section className="welcome">
        <h1>Welcome Back!</h1>
        <AffirmationCard theme={theme} />
      </section>
      
      {/* Rest of your home page content */}
    </div>
  );
}
```

### 2. Mood Dashboard
Great for providing encouragement based on mood tracking.

```jsx
// src/pages/MoodDashboard.jsx
import AffirmationCard from '../components/AffirmationCard';

export default function MoodDashboard({ theme }) {
  return (
    <div className="mood-dashboard">
      <h1>Mood Tracker</h1>
      
      {/* Affirmation at the top */}
      <div className="mb-6">
        <AffirmationCard theme={theme} />
      </div>
      
      {/* Mood chart and other content */}
    </div>
  );
}
```

### 3. AI Assistant Page
Provides context-aware support during conversations.

```jsx
// src/pages/AIAssistant.jsx
import AffirmationCard from '../components/AffirmationCard';

export default function AIAssistant({ theme }) {
  return (
    <div className="ai-assistant">
      {/* Affirmation in sidebar or header */}
      <aside className="sidebar">
        <AffirmationCard theme={theme} />
      </aside>
      
      {/* Chat interface */}
    </div>
  );
}
```

## Styling Examples

### Full Width Card
```jsx
<div className="w-full max-w-4xl mx-auto">
  <AffirmationCard theme={theme} />
</div>
```

### Card in Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <AffirmationCard theme={theme} />
  <OtherCard theme={theme} />
</div>
```

### Card with Custom Spacing
```jsx
<div className="my-8">
  <AffirmationCard theme={theme} />
</div>
```

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `theme` | `string` | Yes | Current theme ("light" or "dark") |

## Component Features

- ✅ Automatic loading on mount
- ✅ Daily caching (one affirmation per day)
- ✅ Refresh button for new affirmation
- ✅ Loading skeleton
- ✅ Error handling with fallback
- ✅ Context hint based on mood trend
- ✅ Responsive design
- ✅ Theme-aware styling

## API Integration

The component automatically:
1. Fetches personalized affirmation from backend
2. Displays cached affirmation if available
3. Shows loading state while fetching
4. Handles errors gracefully
5. Allows manual refresh

## Backend Requirements

Ensure your backend has the `/journal/affirmation/personalized` endpoint implemented. See `backend-affirmations.md` for implementation details.

## Testing Checklist

- [ ] Component renders without errors
- [ ] Affirmation loads and displays correctly
- [ ] Refresh button generates new affirmation
- [ ] Loading skeleton shows during fetch
- [ ] Error state shows fallback affirmation
- [ ] Context hint displays appropriate mood trend
- [ ] Works in both light and dark themes
- [ ] Responsive on mobile devices

## Troubleshooting

### Affirmation not loading
- Check backend endpoint is running
- Verify `GEMINI_API_KEY` is set in backend
- Check browser console for errors
- Ensure user is authenticated

### Refresh button not working
- Check network tab for API errors
- Verify backend endpoint accepts `forceRefresh` parameter
- Check authentication token is valid

### Styling issues
- Ensure `theme` prop is passed correctly
- Check Tailwind CSS is configured
- Verify component has proper parent container

## Example Integration in Home Page

Here's a complete example of adding the affirmation card to your home page:

```jsx
// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import AffirmationCard from '../components/AffirmationCard';
import Header from '../components/Header';

export default function Home({ theme, setTheme }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-[#1a1410]' : 'bg-[#FFFBEA]'
    }`}>
      <Header theme={theme} setTheme={setTheme} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-[#EBDDBF]' : 'text-[#6c7a5b]'
          }`}>
            Welcome back, {user.displayName || 'friend'}!
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-[#EBDDBF]/70' : 'text-[#6c7a5b]/70'
          }`}>
            Here's something special for you today
          </p>
        </section>

        {/* Affirmation Card */}
        <section className="mb-12 max-w-2xl">
          <AffirmationCard theme={theme} />
        </section>

        {/* Rest of your home page content */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Your other cards and content */}
        </section>
      </main>
    </div>
  );
}
```

## Next Steps

1. Choose where to display the affirmation card
2. Import the component
3. Pass the `theme` prop
4. Test the integration
5. Deploy and enjoy personalized affirmations! ✨
