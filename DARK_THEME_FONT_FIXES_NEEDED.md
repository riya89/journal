# Dark Theme Font Fixes Needed

## Files to Update

### 1. Monthly Planner Components
- [ ] `src/components/TaskModal.jsx` - Add task modal
- [ ] `src/components/TemplatesModal.jsx` - View templates modal

### 2. AI Companion
- [ ] `src/pages/AIAssistant.jsx` - Entire page

### 3. Mood Dashboard
- [ ] `src/pages/MoodDashboard.jsx` - Check all text elements

### 4. Time Capsule
- [ ] `src/components/TimeCapsuleUI.jsx` - Inside box text
- [ ] `src/components/CreateCapsuleModal.jsx` - Modal content

## Font Classes to Add

### For Headers
```javascript
${theme === 'dark' ? 'font-spooky-header' : ''}
```

### For Body Text
```javascript
${theme === 'dark' ? 'font-gothic-body' : ''}
```

## Quick Fix Pattern

Replace:
```javascript
<p className="text-gray-600">Text</p>
```

With:
```javascript
<p className={`text-gray-600 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>Text</p>
```

## Status
- ✅ Billing page - Fixed
- ✅ Mood Dashboard stats - Fixed  
- ✅ Time Capsule locks - Fixed
- ⏳ TaskModal - Needs fix
- ⏳ TemplatesModal - Needs fix
- ⏳ AIAssistant - Needs fix
- ⏳ TimeCapsuleUI boxes - Needs fix
