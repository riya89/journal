export default function GlowingMushroomIcon({ theme, className = "" }) {
  const color = theme === "dark" ? "#EBDDBF" : "#7A916C";
  const glowColor = theme === "dark" ? "#c7a8ff" : "#9de7bb";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Mushroom glow */}
        <radialGradient id="mushroomGlow" cx="50%" cy="40%">
          <stop offset="0%" style={{ stopColor: glowColor, stopOpacity: 0.8 }} />
          <stop offset="70%" style={{ stopColor: glowColor, stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: glowColor, stopOpacity: 0 }} />
        </radialGradient>
        
        {/* Spot gradient */}
        <radialGradient id="spotGlow">
          <stop offset="0%" style={{ stopColor: glowColor, stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: glowColor, stopOpacity: 0.3 }} />
        </radialGradient>
      </defs>
      
      {/* Ground/grass */}
      <ellipse cx="50" cy="85" rx="35" ry="3" fill={color} opacity="0.3" />
      <path d="M 20,85 Q 25,80 30,85 Q 35,80 40,85 Q 45,80 50,85 Q 55,80 60,85 Q 65,80 70,85 Q 75,80 80,85" 
            fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      
      {/* Mushroom glow aura */}
      <ellipse cx="50" cy="45" rx="35" ry="30" fill="url(#mushroomGlow)">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
      </ellipse>
      
      {/* Mushroom stem */}
      <path
        d="M 42,55 L 40,80 Q 40,83 45,83 L 55,83 Q 60,83 60,80 L 58,55 Z"
        fill={color}
        opacity="0.8"
      />
      
      {/* Stem texture lines */}
      <line x1="45" y1="60" x2="44" y2="78" stroke={color} strokeWidth="0.5" opacity="0.4" />
      <line x1="50" y1="60" x2="50" y2="78" stroke={color} strokeWidth="0.5" opacity="0.4" />
      <line x1="55" y1="60" x2="56" y2="78" stroke={color} strokeWidth="0.5" opacity="0.4" />
      
      {/* Mushroom cap */}
      <path
        d="M 25,45 Q 25,25 50,25 Q 75,25 75,45 Q 75,55 65,55 L 35,55 Q 25,55 25,45 Z"
        fill={theme === "dark" ? "#8b7355" : "#7A916C"}
        opacity="0.9"
      />
      
      {/* Cap outline */}
      <path
        d="M 25,45 Q 25,25 50,25 Q 75,25 75,45 Q 75,55 65,55 L 35,55 Q 25,55 25,45 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      
      {/* Glowing spots on cap */}
      <circle cx="38" cy="38" r="4" fill="url(#spotGlow)">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="33" r="3.5" fill="url(#spotGlow)">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="62" cy="38" r="4" fill="url(#spotGlow)">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="45" cy="45" r="2.5" fill="url(#spotGlow)">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="58" cy="46" r="2.5" fill="url(#spotGlow)">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.3s" repeatCount="indefinite" />
      </circle>
      
      {/* Gills under cap */}
      <path d="M 35,55 L 38,58" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <path d="M 42,55 L 44,58" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <path d="M 50,55 L 50,58" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <path d="M 58,55 L 56,58" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <path d="M 65,55 L 62,58" stroke={color} strokeWidth="0.8" opacity="0.5" />
      
      {/* Magical sparkles around mushroom */}
      <circle cx="30" cy="35" r="1" fill={glowColor} opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="70" cy="40" r="1" fill={glowColor} opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="20" r="0.8" fill={glowColor} opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}