import React from 'react';
import { useNavigate } from 'react-router-dom';
import GratitudeJar from '../components/GratitudeJar';
import FloatingParticles from '../components/FloatingParticles';
import FloatingGhosts from '../components/FloatingGhosts';
import Fireflies from '../components/Fireflies';
import FlowerMeadow from '../components/FlowerMeadow';

export default function GratitudeJarPage({ theme }) {
  const navigate = useNavigate();

  return (
    <main
      className="h-screen relative overflow-hidden"
      data-theme={theme}
    >
      {/* Floating Particles & Ghosts - background layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FloatingParticles theme={theme} />
        <FloatingGhosts theme={theme} />
        <Fireflies theme={theme} />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-30 px-3 py-1.5 rounded-lg shadow-sm
                   bg-white/40 dark:bg-black/20 backdrop-blur text-sm
                   hover:bg-white/60 dark:hover:bg-black/30 transition-colors"
      >
        ← Back
      </button>

      {/* Main Content - no scroll, fits viewport */}
      <div className="relative z-10 h-screen">
        <GratitudeJar theme={theme} />
      </div>

      {/* Flower Meadow (bottom) - stays at bottom */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-5 h-32">
        <FlowerMeadow theme={theme} />
      </div>
    </main>
  );
}
