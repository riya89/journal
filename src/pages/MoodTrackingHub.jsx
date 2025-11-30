import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ExtendedMoodDashboard from '../components/ExtendedMoodDashboard';
import MoodConstellation from '../components/MoodConstellation';
import FloatingParticles from '../components/FloatingParticles';
import FloatingGhosts from '../components/FloatingGhosts';
import Fireflies from '../components/Fireflies';
import FlowerMeadow from '../components/FlowerMeadow';

export default function MoodTrackingHub({ theme }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      id: 'constellation',
      title: 'Mood Constellation',
      description: 'Visualize your emotional journey as a beautiful constellation of stars',
      icon: '✨',
      color: 'from-[#7A916C] to-[#94A786]',
      action: () => {
        // Scroll to constellation section
        document.getElementById('constellation-section')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      },
      buttonText: 'View Constellation'
    },
    {
      id: 'timecapsule',
      title: 'Time Capsules',
      description: 'Write letters to your future self and unlock them later',
      icon: '🕰️',
      color: 'from-[#EBDDBF] to-[#d4a574]',
      action: () => navigate('/time-capsule'),
      buttonText: 'Open Time Capsules'
    },
    {
      id: 'gratitude',
      title: 'Gratitude Jar',
      description: 'Collect moments of gratitude and revisit them when you need support',
      icon: '🏺',
      color: 'from-[#fbbf24] to-[#d4a574]',
      action: () => navigate('/gratitude-jar'),
      buttonText: 'View Gratitude Jar'
    },
    {
      id: 'history',
      title: 'Extended History',
      description: 'Explore your mood patterns over 7, 30, 90, or 365 days',
      icon: '📊',
      color: 'from-[#94A786] to-[#7A916C]',
      action: () => {
        // Scroll to extended history section
        document.getElementById('extended-history-section')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      },
      buttonText: 'View History'
    }
  ];

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
      <div className="relative z-10 pt-16 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-4 ${
              theme === "dark" ? "text-[#F4E9D8] font-spooky-header" : "text-[#5C6F4C]"
            }`}>
              Mood Tracking Hub 🌙
            </h1>
            <p className={`text-lg opacity-80 ${
              theme === "dark" ? "text-[#EBDDBF] font-gothic-body" : "text-[#6B7A59]"
            }`}>
              Explore your emotional journey through beautiful visualizations and meaningful reflections
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="bg-white/40 dark:bg-black/20 backdrop-blur-lg rounded-xl 
                         shadow-lg hover:shadow-2xl transition-all duration-300 
                         transform hover:scale-105 overflow-hidden"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-br ${feature.color} p-6 text-white`}>
                  <div className="text-5xl mb-3">{feature.icon}</div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className={`text-sm mb-4 leading-relaxed ${
                    theme === "dark" ? "text-[#D0D0D0] font-gothic-body" : "text-gray-700"
                  }`}>
                    {feature.description}
                  </p>
                  
                  <button
                    onClick={feature.action}
                    className={`w-full py-2 px-4 rounded-lg font-medium 
                              transition-colors shadow-md hover:shadow-lg
                              bg-gradient-to-r ${feature.color} text-white
                              hover:opacity-90`}
                  >
                    {feature.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Extended History Section */}
          <div id="extended-history-section" className="mb-16 scroll-mt-20">
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-lg rounded-xl 
                          shadow-lg p-6">
              <h2 className={`text-2xl font-bold mb-6 text-center ${
                theme === "dark" ? "text-[#F4E9D8] font-spooky-header" : "text-[#5C6F4C]"
              }`}>
                Extended Mood History 📊
              </h2>
              <ExtendedMoodDashboard user={user} theme={theme} />
            </div>
          </div>

          {/* Constellation Section */}
          <div id="constellation-section" className="mb-16 scroll-mt-20">
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-lg rounded-xl 
                          shadow-lg p-6">
              <MoodConstellation user={user} theme={theme} />
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-6 ${
              theme === "dark" ? "text-[#F4E9D8] font-spooky-header" : "text-[#5C6F4C]"
            }`}>
              Quick Access
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/mood-dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-[#7A916C] to-[#94A786] 
                         text-white rounded-lg hover:opacity-90 
                         transition-all shadow-lg hover:shadow-xl 
                         transform hover:scale-105 font-medium"
              >
                📈 Full Mood Dashboard
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-[#94A786] to-[#7A916C] 
                         text-white rounded-lg hover:opacity-90 
                         transition-all shadow-lg hover:shadow-xl 
                         transform hover:scale-105 font-medium"
              >
                🏠 Back to Home
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Flower Meadow (bottom) */}
      <div className="fixed bottom-0 w-full pointer-events-none z-0">
        <FlowerMeadow theme={theme} />
      </div>
    </main>
  );
}
