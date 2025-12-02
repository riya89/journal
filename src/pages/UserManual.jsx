import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserManual({ theme }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3EFE2] to-[#E6F0D1] dark:from-[#1a1410] dark:to-[#2b241c] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/10 border-2 border-[#cdd6c0] dark:border-[#5b4a3d] text-[#6c7a5b] dark:text-[#EBDDBF] hover:opacity-70 transition shadow-sm"
          title="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E6F0D1] dark:bg-[#3a2e20] mb-4">
            <svg className="w-12 h-12 text-[#7A916C] dark:text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className={`text-4xl font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-4 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            User Manual
          </h1>
          <p className={`text-lg text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
            Your guide to {theme === 'dark' ? 'Echo' : 'Opal'}
          </p>
          <p className={`text-sm text-[#6c7a5b]/70 dark:text-[#EBDDBF]/70 italic mt-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
            A calm space to meet yourself, one page, one feeling, one gentle moment at a time.
          </p>
        </div>

        {/* Content - Feature Cards */}
        <div className="space-y-6 mb-12">
          <h2 className={`text-2xl font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-6 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Page */}
            <div className="bg-white dark:bg-[#2b241c] rounded-xl shadow-md p-6 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30 hover:shadow-lg transition-shadow">
              <svg className="w-12 h-12 text-[#7A916C] dark:text-[#d4a574] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h3 className={`text-xl font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Home Page
              </h3>
              <p className={`text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Tap any day on the calendar to open your daily page.
Write freely, note how you feel, and let your streaks grow naturally, one honest entry at a time.
              </p>
            </div>

            {/* Monthly Planner */}
            <div className="bg-white dark:bg-[#2b241c] rounded-xl shadow-md p-6 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30 hover:shadow-lg transition-shadow">
              <svg className="w-12 h-12 text-[#7A916C] dark:text-[#d4a574] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className={`text-xl font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Monthly Planner
              </h3>
              <p className={`text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Plan your days softly.
Create small goals, set kind reminders, and celebrate every completion, no matter how small.
              </p>
            </div>

            {/* AI Companion */}
            <div className="bg-white dark:bg-[#2b241c] rounded-xl shadow-md p-6 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30 hover:shadow-lg transition-shadow">
              <svg className="w-12 h-12 text-[#7A916C] dark:text-[#d4a574] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className={`text-xl font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Companion
              </h3>
              <p className={`text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                When your mind feels heavy or unclear, your companion is here to listen.
You can talk, reflect, or simply breathe together in words.
              </p>
            </div>

            {/* Mood Dashboard */}
            <div className="bg-white dark:bg-[#2b241c] rounded-xl shadow-md p-6 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30 hover:shadow-lg transition-shadow">
              <svg className="w-12 h-12 text-[#7A916C] dark:text-[#d4a574] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className={`text-xl font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Mood Dashboard
              </h3>
              <p className={`text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Watch your moods form gentle patterns over time.
Earn XP, complete little quests, and unlock milestones that remind you how steady you’ve become.</p>
            </div>

            {/* Gratitude Jar */}
            <div className="bg-white dark:bg-[#2b241c] rounded-xl shadow-md p-6 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30 hover:shadow-lg transition-shadow">
              <svg className="w-12 h-12 text-[#7A916C] dark:text-[#d4a574] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className={`text-xl font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Gratitude Jar
              </h3>
              <p className={`text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Add the small joys that make your days lighter.
When you need a lift, open your jar and revisit your collection of quiet brightness.
              </p>
            </div>

            {/* Time Capsule */}
            <div className="bg-white dark:bg-[#2b241c] rounded-xl shadow-md p-6 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30 hover:shadow-lg transition-shadow">
              <svg className="w-12 h-12 text-[#7A916C] dark:text-[#d4a574] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className={`text-xl font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Time Capsule
              </h3>
              <p className={`text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Write a note to your future self. Seal it with intention and open it when it’s time to see how much you’ve grown.
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white dark:bg-[#2b241c] rounded-xl shadow-md p-8 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-8 h-8 text-[#7A916C] dark:text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className={`text-2xl font-bold text-[#6c7a5b] dark:text-[#EBDDBF] ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
              Tips for a Kind Routine
            </h2>
          </div>
          <div className="space-y-4">
            <div className={`flex gap-3 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              <span className="text-[#7A916C] dark:text-[#d4a574] font-bold">•</span>
              <p className="text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80">
                <strong>Be consistent.</strong> A few honest words each day matter more than perfect ones.
              </p>
            </div>
            <div className={`flex gap-3 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              <span className="text-[#7A916C] dark:text-[#d4a574] font-bold">•</span>
              <p className="text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80">
                <strong>Explore gently.</strong> Try journaling, planning, or gratitude and notice what feels natural.
              </p>
            </div>
            <div className={`flex gap-3 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              <span className="text-[#7A916C] dark:text-[#d4a574] font-bold">•</span>
              <p className="text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80">
                <strong>Track gently.</strong> Your Mood Dashboard isn't about numbers; it's about awareness.
              </p>
            </div>
            <div className={`flex gap-3 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              <span className="text-[#7A916C] dark:text-[#d4a574] font-bold">•</span>
              <p className="text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80">
                <strong>Use support.</strong> Talk to your companion when you need clarity, calm, or care.
              </p>
            </div>
            <div className={`flex gap-3 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
              <span className="text-[#7A916C] dark:text-[#d4a574] font-bold">•</span>
              <p className="text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80">
                <strong>Celebrate small wins.</strong> Each page you write is proof that you're showing up for yourself.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-[#7A916C] dark:text-[#d4a574]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <p className={`text-sm text-[#6c7a5b]/70 dark:text-[#EBDDBF]/70 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
            Made with calm and care for your wellbeing, your rhythm, and your quiet growth.
          </p>
        </div>
      </div>
    </div>
  );
}
