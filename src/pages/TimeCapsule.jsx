import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TimeCapsuleUI from '../components/TimeCapsuleUI';
import FloatingParticles from '../components/FloatingParticles';
import FloatingGhosts from '../components/FloatingGhosts';
import Fireflies from '../components/Fireflies';
import FlowerMeadow from '../components/FlowerMeadow';

export default function TimeCapsule({ theme }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      data-theme={theme}
    >
      {/* Floating Particles & Ghosts */}
      <FloatingParticles theme={theme} />
      <FloatingGhosts theme={theme} />
      <Fireflies theme={theme} />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg shadow-sm
                   bg-white/40 dark:bg-black/20 backdrop-blur text-sm
                   hover:bg-white/60 dark:hover:bg-black/30 transition-colors"
      >
        ← Back
      </button>

      {/* Main Content */}
      <div className="relative z-10 pt-16 pb-32">
        <TimeCapsuleUI theme={theme} />
      </div>

      {/* Flower Meadow (bottom) */}
      <div className="fixed bottom-0 w-full pointer-events-none z-0">
        <FlowerMeadow theme={theme} />
      </div>
    </main>
  );
}
