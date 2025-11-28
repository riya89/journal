export default function CrystalBallIcon({ theme, className = "" }) {
  const color = theme === "dark" ? "#EBDDBF" : "#7A916C";
  const glowColor = theme === "dark" ? "#c7a8ff" : "#9de7bb";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glow effect */}
        <radialGradient id="crystalGlow" cx="50%" cy="40%">
          <stop offset="0%" style={{ stopColor: glowColor, stopOpacity: 0.8 }} />
          <stop offset="50%" style={{ stopColor: glowColor, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: glowColor, stopOpacity: 0 }} />
        </radialGradient>
        
        {/* Glass shine */}
        <radialGradient id="glassShine" cx="35%" cy="35%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      
      {/* Stand base */}
      <ellipse cx="50" cy="85" rx="20" ry="4" fill={color} opacity="0.7" />
      
      {/* Stand stem */}
      <path
        d="M 45,70 L 43,85 L 57,85 L 55,70 Z"
        fill={color}
        opacity="0.8"
      />
      
      {/* Crystal ball glow */}
      <circle cx="50" cy="45" r="28" fill="url(#crystalGlow)">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      
      {/* Crystal ball */}
      <circle 
        cx="50" 
        cy="45" 
        r="25" 
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      
      {/* Inner mystical swirl */}
      <path
        d="M 35,45 Q 40,35 50,40 T 65,45"
        fill="none"
        stroke={glowColor}
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      >
        <animate attributeName="d" 
          values="M 35,45 Q 40,35 50,40 T 65,45;M 35,45 Q 40,50 50,45 T 65,45;M 35,45 Q 40,35 50,40 T 65,45" 
          dur="4s" 
          repeatCount="indefinite" 
        />
      </path>
      
      {/* Glass shine effect */}
      <ellipse cx="42" cy="38" rx="8" ry="12" fill="url(#glassShine)" opacity="0.5" />
      
      {/* Mystical sparkles */}
      <circle cx="55" cy="42" r="1.5" fill={glowColor} opacity="0.8">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="45" cy="50" r="1" fill={glowColor} opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}