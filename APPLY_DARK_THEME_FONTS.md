# Dark Theme Font Fixes - Apply These Changes

## Pattern to Apply

For ALL text elements in dark theme, add the gothic font class:

### Labels (Headers)
```javascript
// BEFORE:
<label className="block mb-2 font-semibold">Text</label>

// AFTER:
<label className={`block mb-2 font-semibold ${theme === 'dark' ? 'font-gothic-body' : ''}`}>Text</label>
```

### Body Text
```javascript
// BEFORE:
<p className="text-sm text-gray-600">Text</p>

// AFTER:
<p className={`text-sm text-gray-600 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>Text</p>
```

### Spans
```javascript
// BEFORE:
<span className="text-sm">Text</span>

// AFTER:
<span className={`text-sm ${theme === 'dark' ? 'font-gothic-body' : ''}`}>Text</span>
```

## Files to Fix

### 1. src/components/TaskModal.jsx
Lines to update (add `${theme === 'dark' ? 'font-gothic-body' : ''}` to className):
- Line 159: `<label className="block mb-2 font-semibold">Task Name:</label>`
- Line 178: `<label className="block mb-2 font-semibold">Category:</label>`
- Line 198: `<label className="block mb-2 font-semibold">`
- Line 224: `<label className="block mb-2 font-semibold">🔁 Repeat:</label>`
- Line 280: `<span className="text-sm">{label}</span>`
- Line 295: `<label className="block mb-2 font-semibold">Edit Scope:</label>`
- All error messages with `text-red-500 text-sm`

### 2. src/components/TemplatesModal.jsx
- All labels
- All text elements
- All descriptions

### 3. src/pages/AIAssistant.jsx
- ALL text elements throughout the entire page
- Chat messages
- Input placeholders
- Headers
- Buttons text

### 4. src/pages/MoodDashboard.jsx
- Check all remaining text elements
- Quest descriptions
- Badge text
- Any labels

### 5. src/components/TimeCapsuleUI.jsx
- Inside capsule boxes
- Descriptions
- Dates
- All text content

### 6. src/components/CreateCapsuleModal.jsx
- Form labels
- Input descriptions
- Button text
- Help text

## Quick Fix Script

Run this sed command for each file (example for TaskModal):

```bash
# Backup first
cp src/components/TaskModal.jsx src/components/TaskModal.jsx.backup

# Fix labels
sed -i '' 's/className="block mb-2 font-semibold"/className={`block mb-2 font-semibold ${theme === "dark" ? "font-gothic-body" : ""}`}/g' src/components/TaskModal.jsx

# Fix text-sm spans
sed -i '' 's/className="text-sm"/className={`text-sm ${theme === "dark" ? "font-gothic-body" : ""}`}/g' src/components/TaskModal.jsx
```

## Manual Fix Checklist

For each file:
- [ ] Open file
- [ ] Search for `className="`
- [ ] For each text element, check if it has font class
- [ ] If not, add `${theme === 'dark' ? 'font-gothic-body' : ''}`
- [ ] Test in dark theme
- [ ] Verify fonts look correct

## Priority Order

1. **TaskModal.jsx** - Most visible, used frequently
2. **TemplatesModal.jsx** - Also in monthly planner
3. **AIAssistant.jsx** - Entire page needs fixing
4. **TimeCapsuleUI.jsx** - Inside boxes
5. **MoodDashboard.jsx** - Remaining elements

## Testing

After each fix:
1. Switch to dark theme
2. Open the component/page
3. Check all text uses gothic fonts
4. Verify readability
5. Check no text is missing font class

## Notes

- Headers should use `font-spooky-header`
- Body text should use `font-gothic-body`
- Always use template literals when adding conditional classes
- Don't forget error messages and helper text
