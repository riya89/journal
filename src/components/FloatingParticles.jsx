import { useEffect, useRef } from 'react';
import petalImg from '../assets/petal.png';
import ghostImg from '../assets/ghost.png';

export default function FloatingParticles({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let particleImage = new Image();
    let imageLoaded = false;

    // Load the appropriate image based on theme
    particleImage.src = theme === 'dark' ? ghostImg : petalImg;
    particleImage.onload = () => {
      imageLoaded = true;
    };

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
        // Increase petal size by 15% in light theme
        const baseSize = theme === 'dark' ? 20 : 23; // 15% larger for petals
        this.size = Math.random() * 20 + baseSize; // 23-43px for petals, 20-40px for ghosts
        this.speedX = (Math.random() - 0.5) * 0.4; // Slow horizontal drift
        this.speedY = -Math.random() * 0.6 - 0.3; // Slow upward float
        this.opacity = Math.random() * 0.5 + 0.4; // 0.4 to 0.9
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      update() {
        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Pulse effect
        this.pulsePhase += this.pulseSpeed;
        
        // Rotation
        this.rotation += this.rotationSpeed;

        // Reset if out of bounds
        if (this.y < -50) {
          this.y = canvas.height + 50;
          this.x = Math.random() * canvas.width;
        }
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
      }

      draw() {
        if (!imageLoaded) return;
        
        const pulseFactor = Math.sin(this.pulsePhase) * 0.3 + 0.7; // 0.4 to 1.0
        const currentOpacity = this.opacity * pulseFactor;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = currentOpacity;
        
        // Draw the image centered
        ctx.drawImage(
          particleImage,
          -this.size / 2,
          -this.size / 2,
          this.size,
          this.size
        );
        
        ctx.restore();
      }
    }

    // Create particles - more petals in light theme, fewer in dark (handled by FloatingGhosts)
    const particleCount = theme === 'dark' ? 0 : 100; // Only show petals in light theme
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
