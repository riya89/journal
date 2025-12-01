import { useEffect, useRef } from "react";

/**
 * LiquidEffect - A dynamic liquid background animation using Canvas
 * 
 * This component creates an animated liquid/fluid effect background that responds
 * to mouse movement and creates a mesmerizing visual effect.
 * 
 * Features:
 * - Dynamic liquid distortion effect
 * - Mouse-responsive animation
 * - Smooth gradient waves
 * - No external dependencies
 * 
 * @param {Object} props - Component props
 * @param {string} [props.imageUrl] - URL of the image to use as texture
 * @param {number} [props.metalness=0.75] - Intensity of the effect (0-1)
 * @param {number} [props.roughness=0.25] - Smoothness of waves (0-1)
 * @param {number} [props.displacementScale=5] - Wave amplitude
 * @param {boolean} [props.enableRain=false] - Enable particle effect
 * @param {string} [props.className] - Additional CSS classes
 */
export default function LiquidEffect({
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
  metalness = 0.75,
  roughness = 0.25,
  displacementScale = 5,
  enableRain = false,
  className = "",
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("LiquidEffect: Canvas ref not found");
      return;
    }

    console.log("LiquidEffect: Initializing...");
    const ctx = canvas.getContext("2d");
    let particles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log(`LiquidEffect: Canvas resized to ${canvas.width}x${canvas.height}`);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Create particles for rain effect
    if (enableRain) {
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: Math.random() * 2 + 1,
          size: Math.random() * 2 + 1,
        });
      }
    }

    // Animation loop
    const animate = () => {
      timeRef.current += 0.01;
      const time = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient based on metalness
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      const intensity = metalness;
      const smoothness = 1 - roughness;
      
      gradient.addColorStop(0, `rgba(100, 150, 255, ${0.3 * intensity})`);
      gradient.addColorStop(0.5, `rgba(150, 100, 255, ${0.4 * intensity})`);
      gradient.addColorStop(1, `rgba(255, 100, 200, ${0.3 * intensity})`);

      // Draw liquid waves
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.fillStyle = gradient;

        const amplitude = displacementScale * 20 * (1 + i * 0.5);
        const frequency = 0.002 * smoothness;
        const phase = time + i * Math.PI * 0.5;

        for (let x = 0; x <= canvas.width; x += 10) {
          const mouseInfluence = 
            Math.exp(-Math.pow((x / canvas.width) - mouseRef.current.x, 2) * 5) * 
            amplitude * 0.5;

          const y =
            canvas.height / 2 +
            Math.sin(x * frequency + phase) * amplitude +
            Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude * 0.5) +
            mouseInfluence * Math.sin(time * 2);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.globalAlpha = 0.3 - i * 0.08;
        ctx.fill();
      }

      // Draw particles (rain effect)
      if (enableRain) {
        ctx.globalAlpha = 0.6;
        particles.forEach((particle) => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fill();

          particle.y += particle.speed;
          if (particle.y > canvas.height) {
            particle.y = 0;
            particle.x = Math.random() * canvas.width;
          }
        });
      }

      // Draw radial gradient at mouse position
      const mouseGradient = ctx.createRadialGradient(
        mouseRef.current.x * canvas.width,
        mouseRef.current.y * canvas.height,
        0,
        mouseRef.current.x * canvas.width,
        mouseRef.current.y * canvas.height,
        200
      );
      mouseGradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 * intensity})`);
      mouseGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = mouseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [metalness, roughness, displacementScale, enableRain]);

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
