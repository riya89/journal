# Color Palette Update Summary

## Overview
Updated the color palette for Time Capsule, Gratitude Jar, and Mood Dashboard pages to match the Home page's muted, earthy aesthetic. Removed all bright colors in favor of a cohesive, calming palette.

## Color Palette Reference

### Light Theme
- Primary Green: `#7A916C` (sage green)
- Dark Green: `#5C6F4C`, `#6B7A59`, `#6c7a5b`
- Muted Green: `#cdd6c0`
- Warm Brown: `#8b6f47`
- Beige/Gold: `#d4a574`, `#b8956a`, `#caa876`

### Dark Theme
- Primary Beige: `#EBDDBF` (warm beige)
- Light Beige: `#F4E9D8`
- Warm Gold: `#d4a574`
- Brown Tones: `#5b4a3d`, `#3a2e20`, `#6d5a4a`, `#9d7d52`

## Files Updated

### Time Capsule Components
**src/components/TimeCapsuleUI.jsx**
- Replaced bright green/blue colors with sage green and warm beige
- Updated locked capsule cards: `#EBDDBF`, `#d4a574`, `#5b4a3d`
- Updated unlocked capsule cards: muted gold and beige tones
- Changed button colors to match palette
- Updated mood comparison indicators
- Changed goal achievement colors from bright green to sage green

**src/components/CreateCapsuleModal.jsx**
- Updated mood selector borders to use earthy tones
- Changed button colors to match dark theme
- Updated hover states with muted colors

### Gratitude Jar Components
**src/components/GratitudeJar.jsx**
- Changed jar SVG colors from bright amber/yellow to warm beige/gold
- Updated jar gradient: `#EBDDBF` → `#d4a574`
- Changed jar lid from bright brown to muted `#5b4a3d`
- Updated button colors: sage green and warm brown
- Changed sparkles from bright yellow to muted gold
- Updated gratitude note colors in jar visualization
- Changed background gradients to earthy tones

**src/components/AddGratitudeModal.jsx**
- Updated mood selector to use sage green and warm gold
- Changed submit button to match palette

### Mood Dashboard Components
**src/pages/MoodDashboard.jsx**
- Already using earthy palette, no changes needed

**src/components/ExtendedMoodDashboard.jsx**
- Updated all insight card colors to use earthy palette
- Changed period selector active state from bright yellow to muted gold
- Updated comparison indicators from bright green/red to sage green/beige
- Changed error states to use muted colors

**src/components/MoodChart.jsx**
- Changed chart line color from bright yellow (`#fbbf24`) to warm gold (`#d4a574`)
- Updated point colors and hover states

**src/components/MoodConstellation.jsx**
- Updated mood star colors from bright purple/pink/yellow to brown/beige gradient
  - Low mood: `#8b6f47` (muted brown)
  - Medium mood: `#b8956a` (light brown)
  - High mood: `#d4a574` (warm gold)
- Changed shooting star effects from bright yellow to warm gold
- Updated legend colors to match new palette

## Color Replacements Made

### Removed Bright Colors
- ❌ Bright Yellow: `#fbbf24`, `#f59e0b`
- ❌ Bright Green: `#10b981`, `green-600`, `green-700`
- ❌ Bright Purple: `#8b5cf6`, `purple-600`
- ❌ Bright Pink: `#ec4899`
- ❌ Bright Blue: `#3b82f6`, `blue-600`
- ❌ Bright Red: `red-600`, `red-700`
- ❌ Bright Amber: `amber-600`, `amber-700`
- ❌ Bright Orange: `orange-600`

### Added Muted Colors
- ✅ Sage Green: `#7A916C`, `#6B7A59`, `#5C6F4C`
- ✅ Warm Beige: `#EBDDBF`, `#F4E9D8`
- ✅ Warm Gold: `#d4a574`, `#b8956a`, `#caa876`
- ✅ Muted Brown: `#8b6f47`, `#5b4a3d`, `#3a2e20`
- ✅ Soft Green: `#cdd6c0`

## Visual Impact

### Before
- Bright, vibrant colors (purple, pink, yellow, bright green)
- High contrast and energetic feel
- Inconsistent with Home page aesthetic

### After
- Muted, earthy tones throughout
- Calming, cohesive aesthetic
- Matches Home page perfectly
- Professional and soothing appearance
- Better for mood tracking and reflection

## Testing Recommendations

1. Test Time Capsule page in both light and dark themes
2. Test Gratitude Jar page in both themes
3. Test Mood Dashboard with all components visible
4. Verify mood constellation star colors
5. Check all button hover states
6. Verify modal appearances
7. Test mood selectors in all modals

## Notes

- All changes maintain accessibility and readability
- Dark theme uses warmer tones for comfort
- Light theme uses cooler sage greens for freshness
- Consistent color usage across all three pages
- No functionality changes, only visual updates
