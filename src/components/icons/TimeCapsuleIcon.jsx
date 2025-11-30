export default function TimeCapsuleIcon({ theme, className = "" }) {
  const color = theme === "dark" ? "#EBDDBF" : "#7A916C";
  const accentColor = theme === "dark" ? "#c7a8ff" : "#9de7bb";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Capsule body */}
      <rect 
        x="30" 
        y="25" 
        width="40" 
        height="50" 
        rx="20" 
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      
      {/* Top cap */}
      <ellipse cx="50" cy="25" rx="20" ry="6" fill={color} opacity="0.3" />
      <ellipse cx="50" cy="25" rx="20" ry="6" fill="none" stroke={color} strokeWidth="2.5" />
      
      {/* Bottom cap */}
      <ellipse cx="50" cy="75" rx="20" ry="6" fill={color} opacity="0.3" />
      <ellipse cx="50" cy="75" rx="20" ry="6" fill="none" stroke={color} strokeWidth="2.5" />
      
      {/* Lock symbol */}
      <circle cx="50" cy="50" r="8" fill="none" stroke={accentColor} strokeWidth="2" />
      <rect x="47" y="50" width="6" height="8" rx="1" fill={accentColor} />
      
      {/* Time indicator lines */}
      <line x1="38" y1="35" x2="42" y2="35" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <line x1="38" y1="42" x2="44" y2="42" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <line x1="38" y1="49" x2="42" y2="49" stroke={color} strokeWidth="1.5" opacity="0.6" />
      
      <line x1="58" y1="35" x2="62" y2="35" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <line x1="56" y1="42" x2="62" y2="42" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <line x1="58" y1="49" x2="62" y2="49" stroke={color} strokeWidth="1.5" opacity="0.6" />
      
      {/* Sparkle effect */}
      <circle cx="65" cy="30" r="1.5" fill={accentColor}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="35" cy="65" r="1" fill={accentColor}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
