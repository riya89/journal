/**
 * StarBadgeIcon Component
 * Icon for the Gamification Dashboard navigation
 */
export default function StarBadgeIcon({ theme, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill={theme === "dark" ? "rgba(235, 221, 191, 0.1)" : "rgba(122, 145, 108, 0.1)"}
        className="animate-pulse"
      />
      
      {/* Badge circle */}
      <circle
        cx="50"
        cy="50"
        r="35"
        fill={theme === "dark" ? "#3a2e20" : "#F3EFE2"}
        stroke={theme === "dark" ? "#EBDDBF" : "#7A916C"}
        strokeWidth="2"
      />
      
      {/* Star */}
      <path
        d="M50 25 L55 40 L70 42 L60 52 L62 67 L50 60 L38 67 L40 52 L30 42 L45 40 Z"
        fill={theme === "dark" ? "#EBDDBF" : "#7A916C"}
        className="group-hover:scale-110 transition-transform origin-center"
      />
      
      {/* Inner sparkles */}
      <circle
        cx="35"
        cy="35"
        r="2"
        fill={theme === "dark" ? "#EBDDBF" : "#7A916C"}
        opacity="0.6"
        className="animate-pulse"
      />
      <circle
        cx="65"
        cy="35"
        r="2"
        fill={theme === "dark" ? "#EBDDBF" : "#7A916C"}
        opacity="0.6"
        className="animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <circle
        cx="50"
        cy="70"
        r="2"
        fill={theme === "dark" ? "#EBDDBF" : "#7A916C"}
        opacity="0.6"
        className="animate-pulse"
        style={{ animationDelay: "1s" }}
      />
    </svg>
  );
}
