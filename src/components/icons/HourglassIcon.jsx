export default function HourglassIcon({ theme, className = "" }) {
  const color = theme === "dark" ? "#EBDDBF" : "#7A916C";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hourglass frame */}
      <path
        d="M 30,15 L 70,15 L 70,20 L 65,20 L 65,35 Q 50,45 50,50 Q 50,55 65,65 L 65,80 L 70,80 L 70,85 L 30,85 L 30,80 L 35,80 L 35,65 Q 50,55 50,50 Q 50,45 35,35 L 35,20 L 30,20 Z"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Top sand */}
      <path
        d="M 38,23 L 62,23 L 62,32 Q 50,40 50,45 Q 50,40 38,32 Z"
        fill={theme === "dark" ? "#f4c27c" : "#7A916C"}
        opacity="0.7"
      />
      
      {/* Bottom sand */}
      <path
        d="M 38,77 L 62,77 L 62,68 Q 50,60 50,55 Q 50,60 38,68 Z"
        fill={theme === "dark" ? "#f4c27c" : "#7A916C"}
        opacity="0.5"
      />
      
      {/* Falling sand particles */}
      <circle cx="50" cy="48" r="1" fill={theme === "dark" ? "#f4c27c" : "#7A916C"} opacity="0.8">
        <animate attributeName="cy" from="45" to="55" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Decorative top */}
      <rect x="28" y="12" width="44" height="3" rx="1" fill={color} />
      <rect x="28" y="85" width="44" height="3" rx="1" fill={color} />
    </svg>
  );
}