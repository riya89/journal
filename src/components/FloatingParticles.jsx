import { useEffect, useRef } from 'react';

export default function FloatingParticles({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.8; // 0.8 to 3.3px (slightly larger)
        this.speedX = (Math.random() - 0.5) * 0.3; // Slow horizontal drift
        this.speedY = -Math.random() * 0.5 - 0.2; // Slow upward float
        this.opacity = Math.random() * 0.6 + 0.5; // 0.5 to 1.1 (brighter)
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Pulse effect
        this.pulsePhase += this.pulseSpeed;

        // Reset if out of bounds
        if (this.y < -10) {
          this.y = canvas.height + 10;
          this.x = Math.random() * canvas.width;
        }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
      }

      draw() {
        const pulseFactor = Math.sin(this.pulsePhase) * 0.3 + 0.7; // 0.4 to 1.0
        const currentOpacity = this.opacity * pulseFactor;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Color based on theme
        if (theme === 'dark') {
          // Warm golden glow for dark mode - brighter
          ctx.fillStyle = `rgba(235, 221, 191, ${currentOpacity})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = `rgba(235, 221, 191, ${currentOpacity})`;
        } else {
          // Soft green glow for light mode - brighter
          ctx.fillStyle = `rgba(122, 145, 108, ${currentOpacity})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(122, 145, 108, ${currentOpacity * 0.9})`;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Create particles (increased for more magical effect)
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
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

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
