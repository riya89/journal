import { useEffect, useRef } from "react";

/**
 * Simple Liquid Effect - Minimal version for testing
 */
export default function LiquidEffectSimple({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;
    let animationId;

    const animate = () => {
      time += 0.02;

      // Clear with semi-transparent background for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw multiple wave layers
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        
        // Different colors for each layer
        const colors = [
          "rgba(100, 150, 255, 0.3)",
          "rgba(150, 100, 255, 0.3)",
          "rgba(255, 100, 200, 0.3)"
        ];
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 3;

        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + 
                   Math.sin(x * 0.01 + time + i) * 50 +
                   Math.sin(x * 0.02 + time * 1.5) * 30;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 1, mixBlendMode: "screen" }}
    />
  );
}
