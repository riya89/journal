# Dark Theme Color Palette Fix

## Problem
Purple, yellow, and orange colors in Mood Dashboard, Gratitude Jar, and Time Capsule don't match the app's core earthy theme.

## Core App Theme Colors

### Light Theme
- Primary: `#7A916C` (Sage Green)
- Background: `#F3EFE2` (Cream)
- Text: `#6c7a5b` (Olive Green)
- Accent: `#cdd6c0` (Light Sage)

### Dark Theme
- Primary: `#EBDDBF` (Warm Beige)
- Secondary: `#fbbf24` (Warm Gold)
- Background: `#2b241c` (Dark Brown)
- Surface: `#3a2e20` (Medium Brown)
- Border: `#5b4a3d` (Light Brown)
- Text: `#EBDDBF` (Warm Beige)

---

## Colors to Replace

### ❌ Remove These (Don't Match Theme):
- Purple: `purple-500`, `purple-600`, `purple-700`, `purple-900`
- Bright Yellow: `yellow-*`
- Orange: `orange-*`
- Bright Blue: `blue-500`, `blue-600`
- Bright Pink: `pink-*`
- Bright Indigo: `indigo-*`

### ✅ Use These Instead:
- Primary Action: `#7A916C` (Sage Green) / `#EBDDBF` (Warm Beige)
- Accent: `#fbbf24` (Warm Gold) for dark theme
- Success: `#7A916C` (Sage Green)
- Info: `#94A786` (Light Sage)
- Warm Accent: `#c7a8ff` → `#d4a574` (Warm Tan)

---

## File-by-File Changes

### 1. MoodDashboard.jsx
**Current**: Uses purple, yellow, orange gradients
**Fix**: Use sage green and warm beige

### 2. ExtendedMoodDashboard.jsx  
**Current**: Purple buttons, bright colors
**Fix**: Sage green buttons, earthy tones

### 3. MoodTrackingHub.jsx
**Current**: Bright purple, pink, orange, indigo gradients
**Fix**: Earthy gradient variations

### 4. GratitudeJarPage.jsx / GratitudeJar.jsx
**Current**: Amber/orange colors
**Fix**: Warm gold and sage green

### 5. TimeCapsuleUI.jsx
**Current**: Purple colors
**Fix**: Sage green and warm beige

### 6. CreateCapsuleModal.jsx
**Current**: Purple accents
**Fix**: Sage green accents

---

## New Color Palette

```javascript
// Dark Theme Colors
const DARK_THEME = {
  primary: '#EBDDBF',      // Warm Beige
  accent: '#fbbf24',       // Warm Gold
  success: '#7A916C',      // Sage Green
  background: '#2b241c',   // Dark Brown
  surface: '#3a2e20',      // Medium Brown
  border: '#5b4a3d',       // Light Brown
  text: '#EBDDBF',         // Warm Beige
  textMuted: '#EBDDBF99',  // Warm Beige 60%
  
  // Gradients
  gradientPrimary: 'from-[#7A916C] to-[#94A786]',
  gradientAccent: 'from-[#fbbf24] to-[#d4a574]',
  gradientWarm: 'from-[#EBDDBF] to-[#d4a574]',
};

// Light Theme Colors
const LIGHT_THEME = {
  primary: '#7A916C',      // Sage Green
  accent: '#94A786',       // Light Sage
  success: '#7A916C',      // Sage Green
  background: '#F3EFE2',   // Cream
  surface: '#ffffff',      // White
  border: '#cdd6c0',       // Light Sage
  text: '#6c7a5b',         // Olive Green
  textMuted: '#6c7a5b99',  // Olive Green 60%
  
  // Gradients
  gradientPrimary: 'from-[#7A916C] to-[#94A786]',
  gradientAccent: 'from-[#94A786] to-[#cdd6c0]',
};
```

---

## Replacement Map

| Old Color | New Color (Dark) | New Color (Light) |
|-----------|------------------|-------------------|
| `purple-500` | `#7A916C` | `#7A916C` |
| `purple-600` | `#EBDDBF` | `#7A916C` |
| `purple-900` | `#3a2e20` | `#F3EFE2` |
| `yellow-500` | `#fbbf24` | `#94A786` |
| `orange-500` | `#d4a574` | `#94A786` |
| `amber-500` | `#fbbf24` | `#94A786` |
| `pink-500` | `#d4a574` | `#94A786` |
| `indigo-500` | `#7A916C` | `#7A916C` |
| `blue-500` | `#94A786` | `#7A916C` |

---

## Implementation Priority

1. **High**: MoodTrackingHub (most visible)
2. **High**: ExtendedMoodDashboard (period selector buttons)
3. **Medium**: GratitudeJar/TimeCapsule
4. **Low**: Modal accents

---

## Testing Checklist

- [ ] MoodDashboard looks cohesive with app theme
- [ ] Gratitude Jar uses warm gold instead of orange
- [ ] Time Capsule uses sage green instead of purple
- [ ] All buttons match theme colors
- [ ] Gradients use earthy tones
- [ ] No bright purple/pink/orange visible
- [ ] Dark theme feels warm and cozy
- [ ] Light theme feels natural and calm
