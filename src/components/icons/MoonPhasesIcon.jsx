export default function MoonPhasesIcon({ theme, className = "" }) {
  const color = theme === "dark" ? "#EBDDBF" : "#7A916C";
  const moonColor = theme === "dark" ? "#f4c27c" : "#7A916C";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Moon glow */}
        <filter id="moonGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Decorative circle frame */}
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.4"
        strokeDasharray="3,3"
      />
      
      {/* New Moon (top) */}
      <circle cx="50" cy="18" r="5" fill="none" stroke={moonColor} strokeWidth="1.5" opacity="0.6" />
      
      {/* Waxing Crescent (top right) */}
      <g transform="translate(72, 28)">
        <circle r="5" fill={moonColor} opacity="0.3" />
        <path d="M -3,-5 Q 0,0 -3,5" fill={moonColor} opacity="0.7" />
      </g>
      
      {/* First Quarter (right) */}
      <g transform="translate(82, 50)">
        <circle r="5" fill={moonColor} opacity="0.5" />
        <path d="M 0,-5 L 0,5 Z" stroke={color} strokeWidth="1" />
      </g>
      
      {/* Waxing Gibbous (bottom right) */}
      <g transform="translate(72, 72)">
        <circle r="5" fill={moonColor} opacity="0.7" />
        <ellipse rx="2" ry="5" fill={color} opacity="0.3" />
      </g>
      
      {/* Full Moon (bottom) - Main focus with glow */}
      <circle cx="50" cy="82" r="6" fill={moonColor} opacity="0.9" filter="url(#moonGlow)">
        <animate attributeName="opacity" values="0.7;0.9;0.7" dur="3s" repeatCount="indefinite" />
      </circle>
      
      {/* Waning Gibbous (bottom left) */}
      <g transform="translate(28, 72)">
        <circle r="5" fill={moonColor} opacity="0.7" />
        <ellipse rx="2" ry="5" fill={color} opacity="0.3" />
      </g>
      
      {/* Last Quarter (left) */}
      <g transform="translate(18, 50)">
        <circle r="5" fill={moonColor} opacity="0.5" />
        <path d="M 0,-5 L 0,5 Z" stroke={color} strokeWidth="1" />
      </g>
      
      {/* Waning Crescent (top left) */}
      <g transform="translate(28, 28)">
        <circle r="5" fill={moonColor} opacity="0.3" />
        <path d="M 3,-5 Q 0,0 3,5" fill={moonColor} opacity="0.7" />
      </g>
      
      {/* Center decorative star */}
      <path 
        d="M 50,45 L 51,48 L 54,48 L 52,50 L 53,53 L 50,51 L 47,53 L 48,50 L 46,48 L 49,48 Z"
        fill={moonColor}
        opacity="0.5"
      />
      
      {/* Tiny stars */}
      <circle cx="50" cy="35" r="0.8" fill={color} opacity="0.6" />
      <circle cx="60" cy="50" r="0.8" fill={color} opacity="0.6" />
      <circle cx="40" cy="50" r="0.8" fill={color} opacity="0.6" />
    </svg>
  );
}