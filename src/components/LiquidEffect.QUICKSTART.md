# LiquidEffect - Quick Start

## 🚀 Basic Usage

```jsx
import LiquidEffect from "../components/LiquidEffect";

<LiquidEffect />
```

## 🎨 Common Configurations

### Subtle Background
```jsx
<LiquidEffect className="opacity-20" />
```

### Theme-Aware
```jsx
<LiquidEffect
  metalness={theme === "dark" ? 0.6 : 0.75}
  roughness={theme === "dark" ? 0.35 : 0.25}
  className="opacity-30"
/>
```

### Custom Image
```jsx
<LiquidEffect
  imageUrl="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80"
/>
```

### With Rain
```jsx
<LiquidEffect enableRain={true} />
```

## 📊 Props Cheat Sheet

| Prop | Range | Default | Effect |
|------|-------|---------|--------|
| metalness | 0-1 | 0.75 | Metallic look |
| roughness | 0-1 | 0.25 | Surface texture |
| displacementScale | 1-10 | 5 | Distortion amount |
| enableRain | bool | false | Rain particles |
| className | string | "" | CSS classes |

## 🎯 Recommended Settings

**Subtle**: metalness=0.6, roughness=0.3, opacity=20%
**Medium**: metalness=0.75, roughness=0.25, opacity=30%
**Strong**: metalness=0.9, roughness=0.15, opacity=50%

## 📍 Where to Use

- Background layers
- Hero sections
- Landing pages
- Modal backdrops
- Loading screens

## ⚡ Performance Tips

- Use opacity 20-40% for best performance
- Lower displacementScale if laggy
- Disable rain on mobile
- One instance per page recommended
