// // import { useEffect, useState } from "react";
// // import Header from "../components/Header";
// // import { Line } from "react-chartjs-2";
// // import Modal from "../components/Modal";
// // import "chart.js/auto";

// // export default function MoodDashboard({ user, theme }) {
// //   const [badges, setBadges] = useState([]);
// //   const [insights, setInsights] = useState([]);
// //   const [moodData, setMoodData] = useState([]);
// //   const [newBadge, setNewBadge] = useState(null);

// //   const BASE = "https://hello-service.01k9ppzcfjfvyc4cwm4p0ccypp.lmapp.run";

// //   useEffect(() => {
// //     if (!user) return;

// //     // Fetch badges
// //     fetch(`${BASE}/analytics/badges?uid=${user.uid}`)
// //       .then((res) => res.json())
// //       .then((data) => setBadges(data.badges || []));

// //     // Fetch mood + insights
// //     fetch(`${BASE}/analytics/insights?uid=${user.uid}`)
// //   .then((res) => res.json())
// //   .then((data) => {
// //     setInsights(Array.isArray(data.insights) ? data.insights : []);
// //     setMoodData(Array.isArray(data.moodData) ? data.moodData : []);
// //   });

// //     // Fetch streaks → new badge?
// //     fetch(`${BASE}/analytics/streaks?uid=${user.uid}`)
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.newlyEarned?.length > 0) {
// //           setNewBadge(data.newlyEarned[0]);
// //         }
// //       });

// //   }, [user]);

// //   const lockedBadges = [3, 4, 5, 6, 7, 8].filter(
// //     (id) => !badges.find((b) => b.id === `badge${id}`)
// //   );

// //   return (
// //     <main
// //       className="min-h-screen p-4 transition-all duration-500"
// //       data-theme={theme}
// //     >

// //       <h1
// //         className={`text-3xl font-bold mt-6 mb-4 ${
// //           theme === "dark" ? "text-[#F4E9D8]" : "text-[#5C6F4C]"
// //         }`}
// //       >
// //         Mood Dashboard 🌙
// //       </h1>

// //       {/* 🎖 Badge Section */}
// //       <div className="mt-6">
// //         <h2 className="text-xl font-semibold mb-3">Your Badges</h2>

// //         <div className="flex flex-wrap gap-4">
// //           {badges.map((b) => (
// //             <div
// //               key={b.id}
// //               className="w-20 h-20 rounded-xl shadow-lg p-2 flex items-center justify-center
// //                          bg-white/40 backdrop-blur-sm animate-glow"
// //             >
// //               <img src={b.url} alt={b.id} className="w-14 h-14" />
// //             </div>
// //           ))}

// //           {/* Locked Badges */}
// //           {lockedBadges.map((id) => (
// //             <div
// //               key={`locked-${id}`}
// //               className="w-20 h-20 rounded-xl shadow-lg p-2 flex items-center justify-center
// //                          opacity-40 bg-gray-200/40 backdrop-blur-sm"
// //             >
// //               <span className="text-2xl">🔒</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* 📈 Mood Graph */}
// //       <div className="mt-10">
// //         <h2 className="text-xl font-semibold mb-3">Mood (Past 7 Days)</h2>

// //         <div className="bg-white/40 backdrop-blur-lg rounded-xl p-4 shadow-lg">
// //           <Line
// //             data={{
// //               labels: moodData.map((d) => d.date),
// //               datasets: [
// //                 {
// //                   label: "Mood",
// //                   data: moodData.map((d) => d.mood),
// //                   tension: 0.4
// //                 }
// //               ]
// //             }}
// //           />
// //         </div>
// //       </div>

// //       {/* 🔮 Insights */}
// //       <div className="mt-10 mb-20">
// //         <h2 className="text-xl font-semibold mb-3">
// //           Your Weekly Reflections ✨
// //         </h2>

// //         <ul className="space-y-3">
// //           {insights.map((text, idx) => (
// //             <li
// //               key={idx}
// //               className="p-4 rounded-lg shadow bg-white/40 backdrop-blur-md"
// //             >
// //               🌱 {text}
// //             </li>
// //           ))}
// //         </ul>
// //       </div>

// //       {/* ⭐ New Badge Modal */}
// //       {newBadge && (
// //         <Modal onClose={() => setNewBadge(null)}>
// //           <div className="text-center">
// //             <h2 className="text-2xl font-bold mb-4">🏅 New Badge Earned!</h2>
// //             <img
// //               src={newBadge.url}
// //               alt={newBadge.id}
// //               className="w-28 h-28 mx-auto animate-bounce"
// //             />
// //             <p className="mt-3 font-medium">
// //               You unlocked <strong>{newBadge.id}</strong> for a{" "}
// //               <strong>{newBadge.streak}-day streak!</strong>
// //             </p>
// //           </div>
// //         </Modal>
// //       )}
// //     </main>
// //   );
// // }
// import { useEffect, useState } from "react";
// import Modal from "../components/Modal";
// import { Line } from "react-chartjs-2";
// import "chart.js/auto";

// export default function MoodDashboard({ user, theme }) {
//   const [badges, setBadges] = useState([]);
//   const [insights, setInsights] = useState([]);
//   const [moodData, setMoodData] = useState([]);
//   const [newBadge, setNewBadge] = useState(null);
// const [streaks, setStreaks] = useState({ currentStreak: 0, longestStreak: 0, totalEntries: 0 });

//   const BASE = "https://journal-6xfj.onrender.com/raindrop";

//   useEffect(() => {
//     if (!user) return;

// fetch(`${BASE}/badges?uid=${user.uid}`)
//   .then(res => res.json())
//   .then(data => setBadges(Array.isArray(data.badges) ? data.badges : []));


// fetch(`${BASE}/insights?uid=${user.uid}`)
//   .then(res => res.json())
//   .then(data => {
//     // Parse insights if it's a string
//     let parsedInsights = [];

//     if (typeof data.insights === "string") {
//       try {
//         const parsed = JSON.parse(data.insights);
//         parsedInsights = parsed.insights || [];
//       } catch (e) {
//         console.error("Failed to parse insights:", e);
//       }
//     } else if (Array.isArray(data.insights)) {
//       parsedInsights = data.insights;
//     }

//     setInsights(parsedInsights);
//   });

// // Fetch Mood Data
// fetch(`${BASE}/mood?uid=${user.uid}`)
//   .then(res => res.json())
//   .then(data => {
//     setMoodData(normalizeMoodData(data.moodData || []));
//   });

//     // ⭐ Streaks
// fetch(`${BASE}/streaks?uid=${user.uid}`)
//   .then(res => res.json())
//   .then(data => {
//     setStreaks({
//       currentStreak: data.currentStreak || 0,
//       longestStreak: data.longestStreak || 0,
//       totalEntries: data.totalEntries || 0,
//     });

//     if (data.newlyEarned?.length > 0) {
//       setNewBadge(data.newlyEarned[0]);
//     }
//   });


//   }, [user]);

//   const lockedBadges = [3,4,5,6,7,8].filter(
//     id => !badges.find(b => b.id === `badge${id}`)
//   );

//   const normalizeMoodData = (raw) => {
//   if (!Array.isArray(raw)) return [];

//   // Reduce to last mood per date
//   const byDate = {};
//   raw.forEach(entry => {
//     byDate[entry.date] = entry.mood; // last one wins
//   });

//   // Create past 7 days list
//   const days = [];
//   for (let i = 6; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(d.getDate() - i);
//     const formatted = d.toISOString().slice(0, 10);

//     days.push({
//       date: formatted,
//       mood: byDate[formatted] ?? null
//     });
//   }

//   return days;
// };

//   return (
//     <main
//       className="min-h-screen py-10 px-4 flex flex-col items-center 
//                  transition-all duration-500"
//       data-theme={theme}
//     >

//       {/* 🌙 Title */}
//       <h1 className="text-3xl font-bold mb-8 text-center
//           dark:text-[#F4E9D8] text-[#5C6F4C]">
//         Mood Dashboard 🌙
//       </h1>

//       {/* 🎖 BADGES */}
//       <section className="w-full max-w-2xl text-center mb-10">
//         <h2 className="text-xl font-semibold mb-4 
//             dark:text-[#EBDDBF] text-[#6B7A59]">
//           Your Badges
//         </h2>

//         <div className="flex gap-6 overflow-x-auto py-3 px-2 justify-center scrollbar-hide">

//   {/* Unlocked Badges */}
//   {badges.map((b) => (
//     <div key={b.id} className="flex flex-col items-center flex-shrink-0">
//       <img
//         src={b.url}
//         className="w-16 h-16 drop-shadow-md animate-glow"
//       />
//      <p className={`mt-2 text-sm font-semibold 
//   ${theme === "dark" ? "text-white" : "text-[#2F3A24]"}`}>
//   {b.streak}-day streak
// </p>


//     </div>
//   ))}

//   {/* Locked Badges */}
//   {lockedBadges.map((id) => (
//     <div key={id} className="flex flex-col items-center opacity-40 flex-shrink-0">
//       <div className="w-16 h-16 rounded-xl bg-gray-300/30 flex items-center justify-center">
//         🔒
//       </div>
//       <p className={`mt-2 text-sm font-semibold 
//   ${theme === "dark" ? "text-[#D0D0D0]" : "text-[#6B6B6B]"}`}>
//   {id}-day streak
// </p>


//     </div>
//   ))}

// </div>

//       </section>

// {/* 🔥 STREAK SUMMARY */}
// <section className="w-full max-w-2xl text-center mb-10">
//   <h2 className="text-xl font-semibold mb-4 
//       dark:text-[#EBDDBF] text-[#6B7A59]">
//     Your Streak Summary 🔥
//   </h2>

//   <div className="flex justify-center gap-6">
//     <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl 
//                     shadow p-4 px-6 rounded-xl text-center">
//       <p className="text-md opacity-70">Current Streak</p>
//       <p className="text-2xl font-bold">{streaks.currentStreak} 🔥</p>
//     </div>

//     <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl 
//                     shadow p-4 px-6 rounded-xl text-center">
//       <p className="text-md opacity-70">Longest Streak</p>
//       <p className="text-2xl font-bold">{streaks.longestStreak} 🌙</p>
//     </div>

//     <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl 
//                     shadow p-4 px-6 rounded-xl text-center">
//       <p className="text-md opacity-70">Total Entries</p>
//       <p className="text-2xl font-bold">{streaks.totalEntries} 📘</p>
//     </div>
//   </div>
// </section>

//       {/* 📉 MOOD GRAPH */}
//       <section className="w-full max-w-xl text-center mb-12">
//         <h2 className="text-xl font-semibold mb-4 
//             dark:text-[#EBDDBF] text-[#6B7A59]">
//           Past 7 Days Mood
//         </h2>

//         <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl 
//                         rounded-xl p-4 shadow-md">
//           <Line
//             data={{
//               labels: moodData.map(d => d.date),
//               datasets: [
//                 {
//                   label: "",
//                   data: moodData.map(d => d.mood),
//                   borderColor: "#7A916C",
//                   backgroundColor: "#7A916C30",
//                   pointRadius: 4,
//                   pointHoverRadius: 6,
//                   tension: 0.4,
//                 },
//               ],
//             }}
//             options={{
//               plugins: { legend: { display: false } },
//               scales: {
//                 x: { grid: { display: false } },
//                 y: { grid: { display: false }, suggestedMin: 0, suggestedMax: 5 }
//               }
//             }}
//           />
//         </div>
//       </section>

//       {/* 🌱 INSIGHTS */}
//       <section className="w-full max-w-2xl text-center">
//         <h2 className="text-xl font-semibold mb-4 
//             dark:text-[#EBDDBF] text-[#6B7A59]">
//           Your Weekly Reflections ✨
//         </h2>

//         <div className="space-y-4">
//   {insights.map((item, idx) => {
//     // If it's already a string
//     if (typeof item === "string") {
//       return (
//         <p key={idx}
//            className="p-4 rounded-xl bg-white/30 dark:bg-black/20 
//                       backdrop-blur-xl shadow">
//           🌱 {item}
//         </p>
//       );
//     }

//     // If it's an object → pretty format it
//     return (
//       <p key={idx}
//          className="p-4 rounded-xl bg-white/30 dark:bg-black/20 
//                     backdrop-blur-xl shadow">
//         🌱 {`On ${item.date}, mood: ${item.mood}, journal: ${item.journal || "—"}`}
//       </p>
//     );
//   })}
// </div>

//       </section>

//       {/* ⭐ New Badge Modal */}
//       {newBadge && (
//         <Modal onClose={() => setNewBadge(null)}>
//           <div className="text-center">
//             <h2 className="text-2xl font-bold mb-4">🏅 New Badge Earned!</h2>
//             <img
//               src={newBadge.url}
//               className="w-28 h-28 mx-auto animate-bounce"
//             />
//             <p className="mt-3 text-lg">
//               You unlocked <strong>{newBadge.id}</strong>  
//               for a <strong>{newBadge.streak}-day streak!</strong>
//             </p>
//           </div>
//         </Modal>
//       )}

//     </main>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import FlowerMeadow from "../components/FlowerMeadow";
import FloatingParticles from "../components/FloatingParticles";
import FloatingGhosts from "../components/FloatingGhosts";
import Fireflies from "../components/Fireflies";
import { apiGet } from "../utils/api";
import XPBar from "../components/XPBar";
import QuestPanel from "../components/QuestPanel";
import BadgeGallery from "../components/BadgeGallery";
import ExtendedMoodDashboard from "../components/ExtendedMoodDashboard";
export default function MoodDashboard({ user, theme }) {
  const navigate = useNavigate();

  const [badges, setBadges] = useState([]);
  const [insights, setInsights] = useState([]);
  const [newBadge, setNewBadge] = useState(null);
  const [streaks, setStreaks] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
  });
  const [earnedBadges, setEarnedBadges] = useState([]);

  const BASE = "https://journal-6xfj.onrender.com/raindrop";
  

  // ---------- FETCH DATA ----------
  useEffect(() => {
    if (!user) return;

    // Badges
    apiGet(`${BASE}/badges?uid=${user.uid}`)
      .then((r) => r.json())
      .then((d) => setBadges(d.badges || []));

    // Streaks
    apiGet(`${BASE}/streaks?uid=${user.uid}`)
      .then((r) => r.json())
      .then((d) => {
        setStreaks({
          currentStreak: d.currentStreak,
          longestStreak: d.longestStreak,
          totalEntries: d.totalEntries,
        });
        if (d.newlyEarned?.length > 0) setNewBadge(d.newlyEarned[0]);
      });

    // Mood data is now handled by ExtendedMoodDashboard component

    // Insights
    apiGet(`${BASE}/insights?uid=${user.uid}`)
      .then((r) => r.json())
      .then((d) => {
        let parsed = [];
        if (typeof d.insights === "string") {
          try {
            parsed = JSON.parse(d.insights).insights || [];
          } catch {}
        } else if (Array.isArray(d.insights)) {
          parsed = d.insights;
        }
        setInsights(parsed);
      });

    // Fetch earned badges for gamification
    apiGet('https://journal-6xfj.onrender.com/journal/user/stats')
      .then((r) => r.json())
      .then((d) => {
        setEarnedBadges(d.earnedBadges || []);
      })
      .catch((err) => console.error('Error fetching gamification badges:', err));
  }, [user]);

  const lockedBadges = [7, 14, 21, 30, 60, 90].filter(
    (s) => !badges.find((b) => b.streak === s)
  );

  return (
    <main
      className="h-screen overflow-hidden flex flex-col relative"
      data-theme={theme}
    >
      {/* ✨ Floating Particles & Ghosts */}
      <FloatingParticles theme={theme} />
      <FloatingGhosts theme={theme} />
      <Fireflies theme={theme} />

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg shadow-sm
                   bg-white/40 dark:bg-black/20 backdrop-blur text-sm ${
                     theme === "dark" ? "font-gothic-body" : ""
                   }`}
      >
        ←
      </button>

      {/* TITLE */}
      <div className="pt-4 pb-2 text-center">
        <h1 className={`text-xl font-bold ${
          theme === "dark" ? "text-[#F4E9D8] font-spooky-header" : "text-[#5C6F4C]"
        }`}>
          Mood Dashboard 🌙
        </h1>
      </div>

      {/* MAIN CONTENT - SCROLLABLE CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="max-w-7xl mx-auto space-y-3">
          
          {/* TOP ROW: XP Bar + Streak Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* XP Bar */}
            <div className="bg-white/40 dark:bg-black/20 shadow rounded-xl p-3">
              <XPBar theme={theme} />
            </div>

            {/* STREAK SUMMARY */}
            <div className="bg-white/40 dark:bg-black/20 shadow rounded-xl p-3">
              <h2 className={`text-sm font-semibold mb-2 ${
                theme === "dark" ? "text-[#EBDDBF] font-spooky-header" : "text-[#6B7A59]"
              }`}>
                Streak Summary 
              </h2>
              <div className="grid grid-cols-3 text-center gap-2">
                <div>
                  <p className={`text-xs opacity-60 ${theme === "dark" ? "font-gothic-body" : ""}`}>Current</p>
                  <p className={`text-lg font-bold ${theme === "dark" ? "font-gothic-body" : ""}`}>{streaks.currentStreak}</p>
                </div>
                <div>
                  <p className={`text-xs opacity-60 ${theme === "dark" ? "font-gothic-body" : ""}`}>Longest</p>
                  <p className={`text-lg font-bold ${theme === "dark" ? "font-gothic-body" : ""}`}>{streaks.longestStreak}</p>
                </div>
                <div>
                  <p className={`text-xs opacity-60 ${theme === "dark" ? "font-gothic-body" : ""}`}>Entries</p>
                  <p className={`text-lg font-bold ${theme === "dark" ? "font-gothic-body" : ""}`}>{streaks.totalEntries}</p>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE ROW: Quest Panel + Streak Badges & Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Quest Panel */}
            {user && (
              <div className="bg-white/40 dark:bg-black/20 shadow rounded-xl p-3">
                <QuestPanel theme={theme} userId={user.uid} compact={true} />
              </div>
            )}

            {/* STREAK BADGES & ACHIEVEMENTS COMBINED */}
            <div className="bg-white/40 dark:bg-black/20 shadow rounded-xl p-3">
              <h2 className={`text-sm font-semibold mb-2 ${
                theme === "dark" ? "text-[#EBDDBF] font-spooky-header" : "text-[#6B7A59]"
              }`}>
                Your Badges
              </h2>
              
              {/* Streak Badges */}
              <div className="mb-3">
                <p className={`text-xs opacity-70 mb-1 ${theme === "dark" ? "font-gothic-body" : ""}`}>Streak Badges</p>
                <div className="grid grid-cols-6 gap-2">
                  {badges.map((b) => (
                    <div key={b.id} className="flex flex-col items-center">
                      <img src={b.url} className="w-10 h-10" alt={`${b.streak} day badge`} />
                      <p className={`text-[10px] mt-0.5 opacity-80 ${theme === "dark" ? "font-gothic-body" : ""}`}>
                        {b.streak}d
                      </p>
                    </div>
                  ))}
                  {lockedBadges.map((id) => (
                    <div key={id} className="flex flex-col items-center opacity-40">
                      <div className="w-10 h-10 rounded-lg bg-gray-300/30 flex items-center justify-center text-sm">
                        🔒
                      </div>
                      <p className={`text-[10px] mt-0.5 ${theme === "dark" ? "font-gothic-body" : ""}`}>{id}d</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Achievement Badges */}
              <div>
                <p className={`text-xs opacity-70 mb-1 ${theme === "dark" ? "font-gothic-body" : ""}`}>Achievement Badges</p>
                <div className="max-h-32 overflow-hidden">
                  <BadgeGallery earnedBadges={earnedBadges} theme={theme} compact={true} />
                </div>
              </div>
            </div>
          </div>

          {/* INSIGHTS & STATS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* INSIGHTS & REFLECTIONS */}
            <div className="bg-white/40 dark:bg-black/20 shadow rounded-xl p-3">
              <h2 className={`text-sm font-semibold mb-2 ${
                theme === "dark" ? "text-[#EBDDBF] font-spooky-header" : "text-[#6B7A59]"
              }`}>
                💡 Insights & Reflections
              </h2>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {insights.slice(0, 5).map((text, idx) => (
                  <p
                    key={idx}
                    className={`p-2 rounded-lg bg-white/60 dark:bg-black/30 
                               text-xs leading-snug shadow-sm ${theme === "dark" ? "font-gothic-body" : ""}`}
                  >
                    🌿 {text}
                  </p>
                ))}
              </div>
            </div>

            {/* AVERAGE MOOD */}
            <div className="bg-white/40 dark:bg-black/20 shadow rounded-xl p-3 text-center">
              <div className="mb-2 flex justify-center">
                <svg className={`w-8 h-8 ${theme === "dark" ? "text-[#fbbf24]" : "text-[#7A916C]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className={`text-xs opacity-70 mb-1 ${theme === "dark" ? "font-gothic-body" : ""}`}>
                Average Mood
              </p>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-[#fbbf24] font-gothic-body" : "text-[#7A916C]"}`}>
                4.4/5
              </p>
            </div>

            {/* TREND */}
            <div className="bg-white/40 dark:bg-black/20 shadow rounded-xl p-3 text-center">
              <div className="mb-2 flex justify-center">
                <svg className={`w-8 h-8 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className={`text-xs opacity-70 mb-1 ${theme === "dark" ? "font-gothic-body" : ""}`}>
                Trend
              </p>
              <p className={`text-2xl font-bold capitalize ${theme === "dark" ? "text-gray-300 font-gothic-body" : "text-gray-700"}`}>
                Stable
              </p>
            </div>
          </div>

          {/* EXTENDED MOOD HISTORY */}
          <div className="mt-6">
            <h2 className={`text-lg font-semibold mb-4 text-center ${
              theme === "dark" ? "text-[#EBDDBF] font-spooky-header" : "text-[#6B7A59]"
            }`}>
              Mood History 
            </h2>
            <ExtendedMoodDashboard user={user} theme={theme} />
          </div>

        </div>
      </div>

      {/* FLOWER MEADOW (bottom) */}
      <div className="fixed bottom-0 w-full pointer-events-none z-0">
        <FlowerMeadow theme={theme} />
      </div>

      {/* New Badge Modal */}
      {newBadge && (
        <Modal onClose={() => setNewBadge(null)}>
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "font-spooky-header" : ""}`}>🏅 New Badge Earned!</h2>
            <img
              src={newBadge.url}
              className="w-28 h-28 mx-auto animate-bounce"
              alt="New badge"
            />
            <p className={`mt-3 text-lg ${theme === "dark" ? "font-gothic-body" : ""}`}>
              You unlocked <strong>{newBadge.id}</strong>  
              for a <strong>{newBadge.streak}-day streak!</strong>
            </p>
          </div>
        </Modal>
      )}
    </main>
  );
}
