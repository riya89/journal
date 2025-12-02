import { useState, useEffect, useRef, useCallback } from "react";
import { apiGet } from "../utils/api";

export default function MoodConstellation({ user, theme }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [starPositions, setStarPositions] = useState([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const shootingStarsRef = useRef([]);

  const BASE = "https://journal-6xfj.onrender.com/raindrop";

  // Load mood data for last 90 days
  useEffect(() => {
    if (!user) return;

    const loadEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiGet(
          `${BASE}/analytics/mood/extended?uid=${user.uid}&days=90`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mood data");
        }

        const data = await response.json();
        setEntries(data.moodData || []);
      } catch (err) {
        console.error("Error loading mood data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [user]);

  // Render constellation when entries change
  useEffect(() => {
    if (entries.length > 0 && canvasRef.current) {
      renderConstellation();
    }
  }, [entries, theme]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (entries.length > 0 && canvasRef.current) {
        renderConstellation();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [entries, theme]);

  const getMoodColor = (mood) => {
    const colors = {
      1: "#8b6f47", // muted brown (low)
      2: "#9d7d52", // warm brown
      3: "#b8956a", // light brown
      4: "#caa876", // beige
      5: "#d4a574", // warm gold (high)
    };
    return colors[mood] || "#ffffff";
  };

  const drawStar = (ctx, x, y, size, color, glow = true) => {
    if (glow) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawConnections = (ctx, positions) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;

    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];

      // Check if consecutive days
      const prevDate = new Date(prev.date);
      const currDate = new Date(curr.date);
      const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }
    }
  };

  const animateShootingStars = useCallback((ctx, canvas) => {
    // Update and draw shooting stars
    shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
      star.x += star.vx;
      star.y += star.vy;
      star.life -= 1;

      if (star.life <= 0) return false;

      // Draw shooting star trail
      const alpha = star.life / star.maxLife;
      ctx.strokeStyle = `rgba(212, 165, 116, ${alpha * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x - star.vx * 5, star.y - star.vy * 5);
      ctx.stroke();

      // Draw shooting star head
      ctx.fillStyle = `rgba(212, 165, 116, ${alpha})`;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#d4a574";
      ctx.beginPath();
      ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      return true;
    });

    // Continue animation if there are active shooting stars
    if (shootingStarsRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(() =>
        animateShootingStars(ctx, canvas)
      );
    }
  });

  const createShootingStar = useCallback((x, y) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 2;

    shootingStarsRef.current.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 60,
      maxLife: 60,
    });

    // Start animation if not already running
    if (canvasRef.current && shootingStarsRef.current.length === 1) {
      const ctx = canvasRef.current.getContext("2d");
      animateShootingStars(ctx, canvasRef.current);
    }
  }, [animateShootingStars]);

  const renderConstellation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Night sky background
    const bgColor = theme === "dark" ? "#0a0e27" : "#1a1f3a";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add background stars
    for (let i = 0; i < 150; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Calculate positions for mood entries
    const positions = [];
    const padding = 60;
    const usableWidth = canvas.width - padding * 2;
    const usableHeight = canvas.height - padding * 2;

    entries.forEach((entry, idx) => {
      // Distribute horizontally based on index
      const x = padding + (idx / Math.max(entries.length - 1, 1)) * usableWidth;

      // Position vertically based on mood (inverted so higher mood is higher on canvas)
      const y =
        canvas.height - padding - (entry.mood / 5) * usableHeight;

      positions.push({
        x,
        y,
        mood: entry.mood,
        date: entry.date,
      });
    });

    setStarPositions(positions);

    // Draw connections between consecutive days
    drawConnections(ctx, positions);

    // Draw mood entry stars
    positions.forEach((pos) => {
      const color = getMoodColor(pos.mood);
      const size = pos.mood === 5 ? 8 : 5;
      drawStar(ctx, pos.x, pos.y, size, color);

      // Trigger shooting star animation for perfect days (only once)
      if (pos.mood === 5 && Math.random() < 0.3) {
        createShootingStar(pos.x, pos.y);
      }
    });
  }, [entries, theme, createShootingStar]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is near any star
    const clickedStar = starPositions.find((pos) => {
      const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
      return distance < 15;
    });

    if (clickedStar) {
      // Could navigate to journal entry for that day
      console.log("Clicked star:", clickedStar);
      // TODO: Navigate to journal entry or show modal
    }
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if hovering over any star
    const hoveredPos = starPositions.find((pos) => {
      const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
      return distance < 15;
    });

    setHoveredStar(hoveredPos || null);

    // Change cursor if hovering
    canvas.style.cursor = hoveredPos ? "pointer" : "default";
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-[#cdd6c0]/20 dark:bg-[#3a2e20]/30 rounded-xl text-center">
        <p className="text-[#8b6f47] dark:text-[#EBDDBF]">
          Failed to load constellation data. Please try again.
        </p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="w-full p-6 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl text-center">
        <p
          className={`${
            theme === "dark" ? "text-[#EBDDBF]" : "text-[#6B7A59]"
          }`}
        >
          No mood data available yet. Start journaling to create your
          constellation! ✨
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl p-6 shadow-lg">
        <h2
          className={`text-2xl font-bold mb-2 ${
            theme === "dark"
              ? "text-[#EBDDBF] font-spooky-header"
              : "text-[#6B7A59]"
          }`}
        >
          Your Mood Constellation ✨
        </h2>
        <p
          className={`text-sm mb-4 opacity-70 ${
            theme === "dark" ? "font-gothic-body" : ""
          }`}
        >
          Each star represents a day in your journey. Hover to see details.
        </p>

        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="w-full h-96 rounded-lg"
            style={{ minHeight: "400px" }}
          />

          {/* Hover Tooltip */}
          {hoveredStar && (
            <div
              className="absolute bg-black/80 text-white px-3 py-2 rounded-lg text-sm pointer-events-none"
              style={{
                left: `${(hoveredStar.x / canvasRef.current.width) * 100}%`,
                top: `${(hoveredStar.y / canvasRef.current.height) * 100}%`,
                transform: "translate(-50%, -120%)",
              }}
            >
              <div className="font-semibold">{formatDate(hoveredStar.date)}</div>
              <div>Mood: {hoveredStar.mood}/5</div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#8b6f47" }}
            />
            <span className={theme === "dark" ? "font-gothic-body" : ""}>
              Low Mood
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#b8956a" }}
            />
            <span className={theme === "dark" ? "font-gothic-body" : ""}>
              Medium Mood
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#d4a574" }}
            />
            <span className={theme === "dark" ? "font-gothic-body" : ""}>
              High Mood
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className={theme === "dark" ? "font-gothic-body" : ""}>
              Perfect Day (5/5)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">━</span>
            <span className={theme === "dark" ? "font-gothic-body" : ""}>
              Consecutive Days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
