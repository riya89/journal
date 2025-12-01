# Quick Guide: How to Make Any Feature Paid

This is a quick reference for gating features behind a paywall once you have Stripe integrated.

## Prerequisites
- Stripe integration completed (see PAYMENT_BILLING_INTEGRATION_GUIDE.md)
- StripeContext set up
- User subscription status tracked in Firestore

---

## Method 1: Wrap Entire Page/Component

**Use when:** You want to lock an entire feature (e.g., AI Assistant, Time Capsule)

```javascript
import FeatureGate from '../components/FeatureGate';

export default function YourFeature() {
  return (
    <FeatureGate feature="your_feature_name">
      {/* Your feature content here */}
      <div>
        <h1>Premium Feature Content</h1>
        {/* ... */}
      </div>
    </FeatureGate>
  );
}
```

**Example - Lock AI Assistant:**
```javascript
// src/pages/AIAssistant.jsx
import FeatureGate from '../components/FeatureGate';

export default function AIAssistant() {
  return (
    <FeatureGate feature="ai_assistant">
      <div className="ai-assistant-container">
        {/* AI chat interface */}
      </div>
    </FeatureGate>
  );
}
```

---

## Method 2: Conditional Rendering

**Use when:** You want to show limited version to free users

```javascript
import { useStripe } from '../contexts/StripeContext';

export default function YourComponent() {
  const { hasFeatureAccess, isPremium } = useStripe();

  return (
    <div>
      {/* Always visible content */}
      <h1>Feature Title</h1>
      
      {/* Premium-only content */}
      {hasFeatureAccess('feature_name') ? (
        <div>
          <p>Premium content here</p>
        </div>
      ) : (
        <div className="upgrade-prompt">
          <p>Upgrade to Premium to unlock this feature</p>
          <button onClick={() => navigate('/pricing')}>
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}
```

**Example - Limit Mood Analytics:**
```javascript
// src/pages/MoodDashboard.jsx
const { hasFeatureAccess } = useStripe();

const periods = hasFeatureAccess('advanced_analytics')
  ? ['7', '30', '90', '365']  // Premium: all periods
  : ['7'];                      // Free: only 7 days

return (
  <div>
    <select value={selectedPeriod} onChange={handlePeriodChange}>
      {periods.map(period => (
        <option key={period} value={period}>
          Last {period} days
        </option>
      ))}
    </select>
    
    {!hasFeatureAccess('advanced_analytics') && (
      <p className="text-sm text-gray-500 mt-2">
        Upgrade to Premium for 30, 90, and 365-day analytics
      </p>
    )}
  </div>
);
```

---

## Method 3: Usage Limits

**Use when:** Free users get limited usage (e.g., 10 tasks/month)

```javascript
import { useStripe } from '../contexts/StripeContext';
import { useState, useEffect } from 'react';

export default function TaskModal() {
  const { hasFeatureAccess } = useStripe();
  const [usageCount, setUsageCount] = useState(0);
  const FREE_LIMIT = 10;

  useEffect(() => {
    // Fetch current month's usage
    fetchMonthlyUsage();
  }, []);

  const handleCreate = async () => {
    // Check if user has unlimited access
    if (hasFeatureAccess('unlimited_tasks')) {
      await createTask();
      return;
    }

    // Check free tier limit
    if (usageCount >= FREE_LIMIT) {
      showUpgradePrompt();
      return;
    }

    await createTask();
    setUsageCount(prev => prev + 1);
  };

  const showUpgradePrompt = () => {
    alert(`You've reached the free limit of ${FREE_LIMIT} tasks per month. Upgrade to Premium for unlimited tasks!`);
    navigate('/pricing');
  };

  return (
    <div>
      {!hasFeatureAccess('unlimited_tasks') && (
        <p className="text-sm text-gray-500 mb-4">
          {usageCount}/{FREE_LIMIT} tasks used this month
        </p>
      )}
      
      <button onClick={handleCreate}>
        Create Task
      </button>
    </div>
  );
}
```

---

## Method 4: Feature Teaser

**Use when:** You want to show what's possible but lock functionality

```javascript
import { useStripe } from '../contexts/StripeContext';

export default function ExportButton() {
  const { hasFeatureAccess } = useStripe();
  const navigate = useNavigate();

  const handleExport = () => {
    if (!hasFeatureAccess('export_data')) {
      // Show what they're missing
      alert('Export your journal entries, tasks, and mood data to PDF or CSV. Upgrade to Premium to unlock this feature!');
      navigate('/pricing');
      return;
    }

    // Actual export logic
    exportData();
  };

  return (
    <button
      onClick={handleExport}
      className={`export-button ${!hasFeatureAccess('export_data') ? 'opacity-75' : ''}`}
    >
      {hasFeatureAccess('export_data') ? '📥 Export Data' : '🔒 Export Data (Premium)'}
    </button>
  );
}
```

---

## Method 5: Inline Upgrade Prompts

**Use when:** You want to encourage upgrades at point of use

```javascript
export default function AdvancedFeature() {
  const { hasFeatureAccess } = useStripe();

  return (
    <div className="feature-container">
      <h2>Advanced Analytics</h2>
      
      {hasFeatureAccess('advanced_analytics') ? (
        <div>
          {/* Full feature */}
          <AdvancedCharts />
          <DetailedInsights />
        </div>
      ) : (
        <div className="relative">
          {/* Blurred preview */}
          <div className="blur-sm pointer-events-none">
            <AdvancedCharts />
            <DetailedInsights />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold mb-2">Unlock Advanced Analytics</h3>
              <p className="mb-4">Get deeper insights into your mood patterns</p>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-sage-600 text-white px-6 py-2 rounded-lg"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Feature Access Configuration

Define all your features in one place for easy management:

**File: `src/config/features.js`**
```javascript
export const FEATURES = {
  // Free features
  BASIC_JOURNAL: 'basic_journal',
  BASIC_MOOD: 'basic_mood',
  BASIC_TASKS: 'basic_tasks',
  BASIC_STATS: 'basic_stats',
  
  // Premium features
  AI_ASSISTANT: 'ai_assistant',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  TIME_CAPSULE: 'time_capsule',
  GRATITUDE_JAR: 'gratitude_jar',
  UNLIMITED_TASKS: 'unlimited_tasks',
  RECURRING_TASKS: 'recurring_tasks',
  EXPORT_DATA: 'export_data',
  CUSTOM_THEMES: 'custom_themes',
  PRIORITY_SUPPORT: 'priority_support',
};

export const FEATURE_DESCRIPTIONS = {
  [FEATURES.AI_ASSISTANT]: 'Chat with AI for mental wellness support',
  [FEATURES.ADVANCED_ANALYTICS]: 'View 30, 90, and 365-day mood trends',
  [FEATURES.TIME_CAPSULE]: 'Create messages to your future self',
  [FEATURES.GRATITUDE_JAR]: 'Collect and reflect on gratitudes',
  [FEATURES.UNLIMITED_TASKS]: 'Create unlimited tasks',
  [FEATURES.RECURRING_TASKS]: 'Set up daily, weekly, monthly tasks',
  [FEATURES.EXPORT_DATA]: 'Export your data to PDF or CSV',
  [FEATURES.CUSTOM_THEMES]: 'Customize app appearance',
};

export const FREE_FEATURES = [
  FEATURES.BASIC_JOURNAL,
  FEATURES.BASIC_MOOD,
  FEATURES.BASIC_TASKS,
  FEATURES.BASIC_STATS,
];

export const PREMIUM_FEATURES = [
  FEATURES.AI_ASSISTANT,
  FEATURES.ADVANCED_ANALYTICS,
  FEATURES.TIME_CAPSULE,
  FEATURES.GRATITUDE_JAR,
  FEATURES.UNLIMITED_TASKS,
  FEATURES.RECURRING_TASKS,
  FEATURES.EXPORT_DATA,
  FEATURES.CUSTOM_THEMES,
  FEATURES.PRIORITY_SUPPORT,
];
```

---

## Quick Implementation Checklist

To make any feature paid:

### 1. Define the Feature
```javascript
// Add to src/config/features.js
export const FEATURES = {
  YOUR_NEW_FEATURE: 'your_new_feature',
  // ...
};
```

### 2. Add to Premium List
```javascript
export const PREMIUM_FEATURES = [
  // ...
  FEATURES.YOUR_NEW_FEATURE,
];
```

### 3. Update StripeContext
```javascript
// In src/contexts/StripeContext.jsx
const hasFeatureAccess = (feature) => {
  if (FREE_FEATURES.includes(feature)) return true;
  if (PREMIUM_FEATURES.includes(feature)) return isPremium();
  return false;
};
```

### 4. Gate the Feature
Choose one of the methods above and implement in your component.

### 5. Update Pricing Page
```javascript
// Add to Premium features list in src/pages/Pricing.jsx
features: [
  // ...
  'Your New Feature',
]
```

---

## Examples for Raindrop Journal Features

### Make AI Assistant Premium
```javascript
// src/pages/AIAssistant.jsx
import FeatureGate from '../components/FeatureGate';
import { FEATURES } from '../config/features';

export default function AIAssistant() {
  return (
    <FeatureGate feature={FEATURES.AI_ASSISTANT}>
      {/* AI Assistant content */}
    </FeatureGate>
  );
}
```

### Make Time Capsule Premium
```javascript
// src/components/TimeCapsuleUI.jsx
import FeatureGate from '../components/FeatureGate';
import { FEATURES } from '../config/features';

export default function TimeCapsuleUI() {
  return (
    <FeatureGate feature={FEATURES.TIME_CAPSULE}>
      {/* Time Capsule content */}
    </FeatureGate>
  );
}
```

### Limit Tasks for Free Users
```javascript
// src/components/TaskModal.jsx
import { useStripe } from '../contexts/StripeContext';
import { FEATURES } from '../config/features';

export default function TaskModal() {
  const { hasFeatureAccess } = useStripe();
  const [monthlyTaskCount, setMonthlyTaskCount] = useState(0);
  const FREE_TASK_LIMIT = 10;

  const canCreateTask = () => {
    if (hasFeatureAccess(FEATURES.UNLIMITED_TASKS)) {
      return true;
    }
    return monthlyTaskCount < FREE_TASK_LIMIT;
  };

  const handleCreateTask = () => {
    if (!canCreateTask()) {
      alert(`Free users can create up to ${FREE_TASK_LIMIT} tasks per month. Upgrade to Premium for unlimited tasks!`);
      navigate('/pricing');
      return;
    }
    // Create task
  };

  return (
    <div>
      {!hasFeatureAccess(FEATURES.UNLIMITED_TASKS) && (
        <p className="text-sm text-gray-500">
          {monthlyTaskCount}/{FREE_TASK_LIMIT} tasks this month
        </p>
      )}
      <button onClick={handleCreateTask}>Create Task</button>
    </div>
  );
}
```

### Make Gratitude Jar Premium
```javascript
// src/pages/GratitudeJarPage.jsx
import FeatureGate from '../components/FeatureGate';
import { FEATURES } from '../config/features';

export default function GratitudeJarPage() {
  return (
    <FeatureGate feature={FEATURES.GRATITUDE_JAR}>
      <GratitudeJar />
    </FeatureGate>
  );
}
```

### Limit Mood Analytics
```javascript
// src/pages/MoodDashboard.jsx
import { useStripe } from '../contexts/StripeContext';
import { FEATURES } from '../config/features';

export default function MoodDashboard() {
  const { hasFeatureAccess } = useStripe();

  const availablePeriods = hasFeatureAccess(FEATURES.ADVANCED_ANALYTICS)
    ? [7, 30, 90, 365]
    : [7];

  return (
    <div>
      <select>
        {availablePeriods.map(days => (
          <option key={days} value={days}>
            Last {days} days
          </option>
        ))}
      </select>
      
      {!hasFeatureAccess(FEATURES.ADVANCED_ANALYTICS) && (
        <div className="mt-4 p-4 bg-sage-50 rounded-lg">
          <p className="text-sm">
            📊 Upgrade to Premium to view 30, 90, and 365-day analytics
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="mt-2 text-sage-600 underline"
          >
            Learn More
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Testing Your Feature Gates

### Test Checklist
- [ ] Free user cannot access premium feature
- [ ] Premium user can access feature
- [ ] Upgrade prompt shows correctly
- [ ] Navigation to pricing page works
- [ ] Feature unlocks immediately after payment
- [ ] Feature locks after subscription cancellation
- [ ] Usage limits work correctly
- [ ] Error messages are clear

### Test Script
```javascript
// Test as free user
1. Log in as free user
2. Try to access premium feature
3. Verify upgrade prompt appears
4. Click upgrade button
5. Verify redirect to pricing page

// Test as premium user
1. Subscribe to premium
2. Verify feature unlocks
3. Test full functionality
4. Cancel subscription
5. Verify feature locks at period end
```

---

## Common Patterns

### Pattern 1: Soft Gate (Show Preview)
```javascript
<div>
  <BasicVersion />
  {!isPremium() && <UpgradePrompt />}
  {isPremium() && <AdvancedVersion />}
</div>
```

### Pattern 2: Hard Gate (Block Completely)
```javascript
<FeatureGate feature="premium_feature">
  <FullFeature />
</FeatureGate>
```

### Pattern 3: Usage Limit
```javascript
if (usageCount >= limit && !isPremium()) {
  showUpgradePrompt();
  return;
}
```

### Pattern 4: Feature Teaser
```javascript
<div className="relative">
  <div className="blur-sm">
    <FeaturePreview />
  </div>
  <UpgradeOverlay />
</div>
```

---

## Best Practices

### DO:
✅ Make upgrade path obvious
✅ Show value before asking for payment
✅ Be transparent about what's included
✅ Allow easy cancellation
✅ Keep free tier useful
✅ Test thoroughly

### DON'T:
❌ Hide features without explanation
❌ Make free tier frustrating
❌ Use dark patterns
❌ Lock basic functionality
❌ Surprise users with charges
❌ Make cancellation difficult

---

## Quick Reference: Feature Gate Syntax

```javascript
// Import
import { useStripe } from '../contexts/StripeContext';
import FeatureGate from '../components/FeatureGate';
import { FEATURES } from '../config/features';

// Check access
const { hasFeatureAccess, isPremium } = useStripe();
const canAccess = hasFeatureAccess(FEATURES.YOUR_FEATURE);

// Wrap component
<FeatureGate feature={FEATURES.YOUR_FEATURE}>
  <YourComponent />
</FeatureGate>

// Conditional render
{hasFeatureAccess(FEATURES.YOUR_FEATURE) ? (
  <PremiumContent />
) : (
  <UpgradePrompt />
)}

// Check in function
const handleAction = () => {
  if (!hasFeatureAccess(FEATURES.YOUR_FEATURE)) {
    navigate('/pricing');
    return;
  }
  // Do action
};
```

---

## Summary

Making a feature paid is as simple as:
1. Define the feature name
2. Add to premium features list
3. Wrap with `<FeatureGate>` or use `hasFeatureAccess()`
4. Add to pricing page
5. Test!

The key is to make the upgrade path clear and valuable. Show users what they're missing, make it easy to upgrade, and deliver immediate value when they do.
