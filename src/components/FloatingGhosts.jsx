import { useEffect, useRef } from 'react';
import ghostImage from '../assets/ghost.png';

export default function FloatingGhosts({ theme }) {
  const containerRef = useRef(null);
  const ghostsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create ghost elements
    const ghostCount = 5; // Fewer ghosts for subtlety
    const ghosts = [];

    for (let i = 0; i < ghostCount; i++) {
      const ghost = document.createElement('img');
      ghost.src = ghostImage;
      ghost.className = 'floating-ghost';
      
      // Random starting position
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      
      // Random animation duration (slower = more peaceful)
      const duration = 20 + Math.random() * 15; // 20-35 seconds
      const delay = Math.random() * 10; // 0-10 seconds delay
      
      // Random horizontal drift
      const driftX = (Math.random() - 0.5) * 200; // -100 to 100px drift
      
      ghost.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        width: 40px;
        height: 40px;
        opacity: ${theme === 'dark' ? 0.4 : 0.3};
        pointer-events: none;
        animation: floatGhost ${duration}s ease-in-out ${delay}s infinite;
        filter: ${theme === 'dark' ? 'brightness(1.2)' : 'brightness(0.9)'};
        transform-origin: center;
      `;
      
      // Set custom properties for animation
      ghost.style.setProperty('--drift-x', `${driftX}px`);
      
      container.appendChild(ghost);
      ghosts.push(ghost);
    }

    ghostsRef.current = ghosts;

    // Cleanup
    return () => {
      ghosts.forEach(ghost => ghost.remove());
    };
  }, [theme]);

  return (
    <>
      <style>{`
        @keyframes floatGhost {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-30px) translateX(var(--drift-x)) rotate(5deg) scale(1.05);
          }
          50% {
            transform: translateY(-60px) translateX(calc(var(--drift-x) * 0.5)) rotate(-5deg) scale(0.95);
          }
          75% {
            transform: translateY(-30px) translateX(calc(var(--drift-x) * -0.5)) rotate(3deg) scale(1.02);
          }
        }
      `}</style>
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 2 }}
      />
    </>
  );
}
