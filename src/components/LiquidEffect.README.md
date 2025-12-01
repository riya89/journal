# LiquidEffect Component

A dynamic liquid background animation component using Three.js that creates mesmerizing fluid effects.

## Features

- 🌊 Dynamic liquid/fluid distortion effect
- 🖱️ Mouse-responsive animation
- 🎨 Customizable material properties (metalness, roughness)
- 🌧️ Optional rain effect
- 🖼️ Custom image texture support
- ⚡ Automatic cleanup on unmount
- 🎯 Zero pointer events (doesn't interfere with UI)

## Installation

No additional dependencies needed! The component uses pure Canvas API - works out of the box.

## Usage

### Basic Usage

```jsx
import LiquidEffect from "../components/LiquidEffect";

function MyPage() {
  return (
    <div className="relative min-h-screen">
      <LiquidEffect />
      {/* Your content here */}
    </div>
  );
}
```

### Advanced Usage with Custom Props

```jsx
<LiquidEffect
  imageUrl="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80"
  metalness={0.75}
  roughness={0.25}
  displacementScale={5}
  enableRain={false}
  className="opacity-30"
/>
```

### Theme-Aware Usage

```jsx
<LiquidEffect
  metalness={theme === "dark" ? 0.6 : 0.75}
  roughness={theme === "dark" ? 0.35 : 0.25}
  displacementScale={4}
  className="opacity-30"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageUrl` | string | Unsplash gradient | URL of the image to use as texture |
| `metalness` | number | 0.75 | Material metalness (0-1). Higher = more metallic |
| `roughness` | number | 0.25 | Material roughness (0-1). Higher = more rough |
| `displacementScale` | number | 5 | Displacement intensity (1-10). Higher = more distortion |
| `enableRain` | boolean | false | Enable rain particle effect |
| `className` | string | "" | Additional CSS classes (e.g., for opacity) |

## Styling Tips

### Opacity Control
Use the `className` prop to control opacity:
```jsx
<LiquidEffect className="opacity-20" />  // Subtle
<LiquidEffect className="opacity-50" />  // Medium
<LiquidEffect className="opacity-80" />  // Strong
```

### Z-Index
The component is automatically set to `z-index: 0` and uses `pointer-events-none`, so it won't interfere with your UI.

### Recommended Image URLs

Good stock images for liquid effects:
- Abstract gradients: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80`
- Colorful abstract: `https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80`
- Blue waves: `https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80`
- Purple gradient: `https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80`

## Performance Notes

- Pure Canvas API implementation (no external libraries)
- Hardware accelerated rendering
- Automatically cleans up resources on unmount
- Minimal performance impact on modern devices
- ~60 FPS on most devices

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ All modern browsers with Canvas support

## Troubleshooting

### Effect not showing
- Check browser console for errors
- Ensure Canvas is supported in browser
- Try increasing opacity with `className="opacity-50"`

### Performance issues
- Reduce `displacementScale` value
- Lower opacity with `className="opacity-20"`
- Disable rain effect

### Cleanup warnings
The component automatically handles cleanup. If you see warnings, ensure you're not unmounting/remounting rapidly.

## Demo

A demo page is available at `src/pages/LiquidEffectDemo.jsx` with interactive controls to test different configurations.

## Integration Example (Home Page)

```jsx
import LiquidEffect from "../components/LiquidEffect";

export default function Home({ theme }) {
  return (
    <main className="relative min-h-screen" data-theme={theme}>
      {/* Liquid background */}
      <LiquidEffect
        metalness={theme === "dark" ? 0.6 : 0.75}
        roughness={theme === "dark" ? 0.35 : 0.25}
        displacementScale={4}
        className="opacity-30"
      />
      
      {/* Your content */}
      <div className="relative z-10">
        {/* Content here */}
      </div>
    </main>
  );
}
```

## Credits

Built with pure Canvas API and JavaScript - no external dependencies required.
