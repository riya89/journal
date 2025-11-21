import { useState, useEffect } from "react";
import spider from "../assets/spider.png";

export default function CornerSpider({ theme }) {
  const [isDescending, setIsDescending] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    // Only show spider in dark theme
    if (theme !== "dark") return;

    // Random spider descent animation
    const interval = setInterval(() => {
      const shouldDescend = Math.random() > 0.7; // 30% chance
      if (shouldDescend) {
        setIsDescending(true);
        setPosition(Math.random() * 100 + 50); // Descend 50-150px
        
        // Return to corner after 3-5 seconds
        setTimeout(() => {
          setIsDescending(false);
          setPosition(0);
        }, 3000 + Math.random() * 2000);
      }
    }, 8000); // Check every 8 seconds

    return () => clearInterval(interval);
  }, [theme]);

  if (theme !== "dark") return null;

  return (
    <div className="fixed top-0 left-8 z-50 pointer-events-none">
      {/* Spider web silk thread */}
      <div
        className="absolute left-1/2 top-0 w-[1.5px] transition-all duration-1000 ease-in-out"
        style={{
          height: isDescending ? `${position}px` : "0px",
          transform: "translateX(-50%)",
          background: "linear-gradient(to bottom, rgba(200, 200, 200, 0.4), rgba(200, 200, 200, 0.2))",
          boxShadow: "0 0 2px rgba(200, 200, 200, 0.3)",
        }}
      />
      
      {/* Spider */}
      <div
        className="relative transition-all duration-1000 ease-in-out"
        style={{
          transform: `translateY(${position}px)`,
        }}
      >
        <img
          src={spider}
          alt="spider"
          className="w-24 h-24 animate-spiderSway drop-shadow-lg"
          style={{
            filter: "drop-shadow(0 0 12px rgba(139, 0, 0, 0.6))",
          }}
        />
      </div>
    </div>
  );
}
