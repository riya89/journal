// // // import { useState } from "react";
// // // import Header from "../components/Header";
// // // import Layout from "../components/Layout";
// // // import JournalModal from "../components/JournalModal";
// // // import FlowerMeadow from "../components/FlowerMeadow";

// // // export default function Home({ user }) {
// // //   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
// // //   const [showModal, setShowModal] = useState(false);

// // //   const handleThemeToggle = () => {
// // //     const next = theme === "light" ? "dark" : "light";
// // //     setTheme(next);
// // //     localStorage.setItem("theme", next);
// // //     document.body.dataset.theme = next;
// // //   };

// // //   return (
// // //     <main
// // //       className="app transition-all duration-500"
// // //       data-theme={theme}
// // //     >
// // //       {/* 🕰 Header with month, theme toggle, and clock */}
// // //       <Header theme={theme} setTheme={setTheme} />

// // //       {/* 📒 Sidebar + Journal Grid */}
// // //       <Layout theme={theme} onCardClick={() => setShowModal(true)} />

// // //       {/* 🌸 Animated flowers (light) or candles (dark later) */}
// // //       <FlowerMeadow theme={theme} />

// // //       {/* 📖 Journal modal (opens book-like entry view) */}
// // //       <JournalModal isOpen={showModal} onClose={() => setShowModal(false)} theme={theme} />
// // //     </main>
// // //   );
// // // }
// // // import { useState } from "react";
// // // import Header from "../components/Header";
// // // import Layout from "../components/Layout";
// // // import JournalModal from "../components/JournalModal";
// // // import FlowerMeadow from "../components/FlowerMeadow";

// // // export default function Home({ user, setUser }) {
// // //   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
// // //   const [showModal, setShowModal] = useState(false);

// // //   return (
// // //     <main className="app transition-all duration-500" data-theme={theme}>
// // //       {/* 🕰 Header with theme toggle, month, and settings */}
// // //       <Header
// // //         theme={theme}
// // //         setTheme={setTheme}
// // //         user={user}
// // //         onLogout={() => setUser(null)}   // ✅ added this
// // //       />

// // //       {/* 📒 Sidebar + Journal Grid */}
// // //       <Layout theme={theme} onCardClick={() => setShowModal(true)} />

// // //       {/* 🌸 Animated flowers */}
// // //       <FlowerMeadow theme={theme} />

// // //       {/* 📖 Book-like Journal Modal */}
// // //       <JournalModal
// // //         isOpen={showModal}
// // //         onClose={() => setShowModal(false)}
// // //         theme={theme}
// // //       />
// // //     </main>
// // //   );
// // // }
// // import { useState, useEffect } from "react";  
// // import Header from "../components/Header";
// // import Layout from "../components/Layout";
// // import JournalModal from "../components/JournalModal";
// // import FlowerMeadow from "../components/FlowerMeadow";

// // export default function Home({ user, setUser }) {
// //   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
// //   const [showModal, setShowModal] = useState(false);
// //   const [selectedDate, setSelectedDate] = useState(null);
// //   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
// //   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

// //   const handleCardClick = (date) => {
// //     setSelectedDate(date);
// //     setShowModal(true);
// //   };

// //   useEffect(() => {
// //   const fetchAvatar = async () => {
// //     const token = localStorage.getItem("token");
// //     if (!token) return;
// //     const res = await fetch("http://localhost:8000/journal/avatar", {
// //       headers: { Authorization: `Bearer ${token}` },
// //     });
// //     const data = await res.json();
// //     if (data.avatarURL) {
// //       const updatedUser = { ...user, avatarURL: data.avatarURL };
// //       setUser(updatedUser);
// //       localStorage.setItem("user", JSON.stringify(updatedUser));
// //     }
// //   };
// //   fetchAvatar();
// // }, []);

// //   return (
// //     <main className="app transition-all duration-500" data-theme={theme}>
// //       {/* 🕰 Header with Theme + Month-Year */}
// //       <Header
// //         theme={theme}
// //         setTheme={setTheme}
// //         user={user}
// //         setUser={setUser}
// //         onLogout={() => setUser(null)}
// //         selectedMonth={selectedMonth}
// //         setSelectedMonth={setSelectedMonth}
// //         selectedYear={selectedYear}
// //         setSelectedYear={setSelectedYear}
// //       />

// //       {/* 📒 Sidebar + Grid */}
// //       <Layout
// //   theme={theme}
// //   onCardClick={handleCardClick}
// //   selectedMonth={selectedMonth}
// //   selectedYear={selectedYear}
// //   user={user}               
// // />

// //       {/* 🌸 Animated Flowers */}
// //       <FlowerMeadow theme={theme} />

// //       {/* 📖 Journal Modal */}
// //       {showModal && (
// //         <JournalModal
// //           isOpen={showModal}
// //           onClose={() => setShowModal(false)}
// //           theme={theme}
// //           selectedDate={selectedDate}
// //         />
// //       )}
// //     </main>
// //   );
// // }
// import { useState } from "react";
// import Header from "../components/Header";
// import Layout from "../components/Layout";
// import JournalModal from "../components/JournalModal";
// import FlowerMeadow from "../components/FlowerMeadow";

// export default function Home({ user, setUser, theme, setTheme }) {
//   const [showModal, setShowModal] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   const handleCardClick = (date) => {
//     setSelectedDate(date);
//     setShowModal(true);
//   };

//   return (
//     <main className="app transition-all duration-500" data-theme={theme}>
//       {/* 🕰 Header with Theme + Month-Year */}
//       <Header
//         theme={theme}
//         setTheme={setTheme}
//         user={user}
//         setUser={setUser}
//         onLogout={() => {
//           localStorage.clear();
//           setUser(null);
//         }}
//         selectedMonth={selectedMonth}
//         setSelectedMonth={setSelectedMonth}
//         selectedYear={selectedYear}
//         setSelectedYear={setSelectedYear}
//       />

//       {/* 📓 Sidebar + Grid */}
//       <Layout
//         theme={theme}
//         onCardClick={handleCardClick}
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         user={user}
//       />

//       {/* 🌸 Animated Flowers */}
//       <FlowerMeadow theme={theme} />


//       {/* 📖 Journal Modal */}
//       {showModal && (
//         <JournalModal
//           isOpen={showModal}
//           onClose={() => setShowModal(false)}
//           theme={theme}
//           selectedDate={selectedDate}
//         />
//       )}
//     </main>
//   );
// }
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Layout from "../components/Layout";
import JournalModal from "../components/JournalModal";
import FlowerMeadow from "../components/FlowerMeadow";
import FloatingParticles from "../components/FloatingParticles";
import FloatingGhosts from "../components/FloatingGhosts";
import Fireflies from "../components/Fireflies";
import CornerSpider from "../components/CornerSpider";
import HourglassIcon from "../components/icons/HourglassIcon";
import CrystalBallIcon from "../components/icons/CrystalBallIcon";
import MoonPhasesIcon from "../components/icons/MoonPhasesIcon";
import GlowingMushroomIcon from "../components/icons/GlowingMushroomIcon";

export default function Home({ user, setUser, theme, setTheme }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleCardClick = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  return (
    <main className="app transition-all duration-500 relative" data-theme={theme}>
      {/* 📜 Antique Texture Overlay for Dark Mode */}
      {theme === "dark" && (
        <>
          {/* Aged Paper/Vellum Texture */}
          <div 
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.04) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(101, 67, 33, 0.04) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(160, 82, 45, 0.03) 0%, transparent 50%),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(235, 221, 191, 0.015) 2px,
                  rgba(235, 221, 191, 0.015) 4px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(235, 221, 191, 0.015) 2px,
                  rgba(235, 221, 191, 0.015) 4px
                )
              `,
              backgroundBlendMode: 'overlay',
              opacity: 0.5,
            }}
          />
          
          {/* Fine Grain Noise Texture */}
          <div 
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              opacity: 0.08,
              mixBlendMode: 'overlay',
            }}
          />
        </>
      )}
      
      {/* ✨ Floating Dust Particles Background */}
      <FloatingParticles theme={theme} />
      
      {/* 👻 Cute Floating Ghosts */}
      <FloatingGhosts theme={theme} />
      <Fireflies theme={theme} />
      
      {/* 🕷️ Corner Spider */}
      <CornerSpider theme={theme} />

      {/* 🕰 Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        user={user}
        setUser={setUser}
        onLogout={() => {
          localStorage.clear();
          setUser(null);
        }}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      {/* 📓 Sidebar + Grid */}
      <Layout
        theme={theme}
        onCardClick={handleCardClick}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        user={user}
      />

      {/* 🌸 Animated Flowers */}
      <FlowerMeadow theme={theme} />
      
      {/* ⏳ Monthly Planner Icon - Far Left */}
<div
  className="fixed bottom-[70px] right-[410px] cursor-pointer group transition-transform duration-300 hover:scale-105 z-10 flex flex-col items-center animate-floatSlow"
  onClick={() => navigate("/monthly-planner")}
>
  <div className="w-[100px] h-[100px] flex items-end justify-center">
    <HourglassIcon theme={theme} className="w-20 h-20 drop-shadow-lg" />
  </div>
  <p
    className={`text-center text-sm font-medium mt-1 tracking-wide ${
      theme === "dark" ? "text-[#EBDDBF] font-gothic-body" : "text-[#7A916C]"
    }`}
  >
    Planner
  </p>
</div>

      {/* 🔮 AI Assistant Floating Icon - Left */}
<div
  className="fixed bottom-[70px] right-[300px] cursor-pointer group transition-transform duration-300 hover:scale-105 z-10 flex flex-col items-center animate-floatSlow"
  onClick={() => navigate("/ai-assistant")}
>
  <div className="w-[100px] h-[100px] flex items-end justify-center">
    <CrystalBallIcon theme={theme} className="w-20 h-20 drop-shadow-lg" />
  </div>
  <p
    className={`text-center text-sm font-medium mt-1 tracking-wide ${
      theme === "dark" ? "text-[#EBDDBF] font-gothic-body" : "text-[#7A916C]"
    }`}
  >
    AI Friend
  </p>
</div>

{/* 🌙 Mood Dashboard Icon - Center */}
<div
  className="fixed bottom-[70px] right-[190px] cursor-pointer group transition-transform duration-300 hover:scale-105 z-10 flex flex-col items-center animate-floatSlow"
  onClick={() => navigate("/mood-dashboard")}
>
  <div className="w-[100px] h-[100px] flex items-end justify-center">
    <MoonPhasesIcon theme={theme} className="w-20 h-20 drop-shadow-lg" />
  </div>
  <p
    className={`text-center text-sm font-medium mt-1 tracking-wide ${
      theme === "dark" ? "text-[#EBDDBF] font-gothic-body" : "text-[#7A916C]"
    }`}
  >
    Moodboard
  </p>
</div>

{/* � Growwth Garden - Right */}
<div
  className="fixed bottom-[70px] right-[60px] cursor-pointer group transition-transform duration-300 hover:scale-105 z-10 flex flex-col items-center animate-floatSlow"
  onClick={() => navigate("/growth-garden")}
>
  <div className="w-[100px] h-[100px] flex items-end justify-center">
    <GlowingMushroomIcon theme={theme} className="w-20 h-20 drop-shadow-lg" />
  </div>
  <p
    className={`text-center text-sm font-medium mt-1 tracking-wide ${
      theme === "dark" ? "text-[#EBDDBF] font-gothic-body" : "text-[#7A916C]"
    }`}
  >
    Growth Garden 
  </p>
</div>


      {/* 📖 Journal Modal */}
      {showModal && (
        // <JournalModal
        //   isOpen={showModal}
        //   onClose={() => setShowModal(false)}
        //   theme={theme}
        //   selectedDate={selectedDate}
        // />
        <JournalModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  theme={theme}
  selectedDate={selectedDate}
  user={user}          // ✅ Add this
/>

      )}
    </main>
  );
}
