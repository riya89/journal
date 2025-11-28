import { useEffect, useRef } from 'react';

export default function Fireflies({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only show fireflies in dark theme
    if (theme !== 'dark') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let fireflies = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Firefly class
    class Firefly {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1.5; // 1.5 to 3.5px
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
        this.pulseSpeed = Math.random() * 0.03 + 0.02;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.glowRadius = Math.random() * 15 + 10; // 10 to 25px glow
      }

      update() {
        // Move firefly
        this.x += this.speedX;
        this.y += this.speedY;

        // Pulse effect (fade in and out)
        this.pulsePhase += this.pulseSpeed;
        this.opacity = (Math.sin(this.pulsePhase) + 1) / 2 * this.maxOpacity;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        // Draw glow
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.glowRadius
        );
        
        // Warm yellow glow for dark theme
        gradient.addColorStop(0, `rgba(255, 220, 100, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 200, 80, ${this.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 200, 80, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw bright center
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 150, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Create fireflies (only in dark theme)
    const fireflyCount = 60; // Increased for more atmosphere
    for (let i = 0; i < fireflyCount; i++) {
      fireflies.push(new Firefly());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      fireflies.forEach(firefly => {
        firefly.update();
        firefly.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Don't render anything if not dark theme
  if (theme !== 'dark') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 3 }}
    />
  );
}
