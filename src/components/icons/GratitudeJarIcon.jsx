export default function GratitudeJarIcon({ theme, className = "" }) {
  const color = theme === "dark" ? "#EBDDBF" : "#7A916C";
  const heartColor = theme === "dark" ? "#ff9eb5" : "#e07a9e";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glass shine gradient */}
        <linearGradient id="jarShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      
      {/* Jar body */}
      <path
        d="M 35,35 L 35,75 Q 35,82 42,82 L 58,82 Q 65,82 65,75 L 65,35 Z"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      
      {/* Jar neck */}
      <rect x="40" y="28" width="20" height="7" rx="2" fill="none" stroke={color} strokeWidth="2.5" />
      
      {/* Jar lid */}
      <ellipse cx="50" cy="28" rx="12" ry="4" fill={color} opacity="0.3" />
      <ellipse cx="50" cy="28" rx="12" ry="4" fill="none" stroke={color} strokeWidth="2.5" />
      <rect x="47" y="23" width="6" height="5" rx="2" fill={color} />
      
      {/* Glass shine effect */}
      <path
        d="M 38,40 L 38,70 Q 38,75 42,75"
        fill="none"
        stroke="url(#jarShine)"
        strokeWidth="3"
        opacity="0.5"
      />
      
      {/* Hearts inside jar */}
      <g opacity="0.8">
        {/* Heart 1 */}
        <path
          d="M 45,50 Q 45,47 47,47 Q 49,47 49,50 Q 49,47 51,47 Q 53,47 53,50 Q 53,54 49,57 Q 45,54 45,50 Z"
          fill={heartColor}
        >
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </path>
        
        {/* Heart 2 */}
        <path
          d="M 42,62 Q 42,60 43.5,60 Q 45,60 45,62 Q 45,60 46.5,60 Q 48,60 48,62 Q 48,65 45,67 Q 42,65 42,62 Z"
          fill={heartColor}
          opacity="0.7"
        >
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
        </path>
        
        {/* Heart 3 */}
        <path
          d="M 52,65 Q 52,63 53.5,63 Q 55,63 55,65 Q 55,63 56.5,63 Q 58,63 58,65 Q 58,68 55,70 Q 52,68 52,65 Z"
          fill={heartColor}
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Label on jar */}
      <rect x="38" y="42" width="24" height="8" rx="2" fill={color} opacity="0.2" />
      <text x="50" y="48" fontSize="6" fill={color} textAnchor="middle" opacity="0.7">
        Gratitude
      </text>
      
      {/* Sparkles */}
      <circle cx="68" cy="40" r="1.5" fill={heartColor}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="32" cy="55" r="1" fill={heartColor}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
