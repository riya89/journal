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
import tree from "../assets/plant1.png"; 
import { useState } from "react";
import Header from "../components/Header";
import Layout from "../components/Layout";
import JournalModal from "../components/JournalModal";
import FlowerMeadow from "../components/FlowerMeadow";

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

      {/* 🌳 Growth Garden Tree */}
<div
  className="fixed bottom-[80px] right-[60px] cursor-pointer group transition-transform duration-300 hover:scale-105 z-10 flex flex-col items-center"
  onClick={() => navigate("/growth-garden")}
>
  <img
    src={tree}
    alt="growth garden"
    className="w-[90px] h-auto drop-shadow-lg animate-sway block leading-none mb-0 pb-0"
    style={{ display: "block", marginBottom: "-4px" }} // <-- removes that hidden gap
  />
  <p
    className={`text-center text-sm font-medium opacity-90 group-hover:opacity-100 tracking-wide ${
      theme === "dark" ? "text-[#EBDDBF]" : "text-[#7A916C]"
    }`}
    style={{ lineHeight: "1" }} // keeps the label snug
  >
    Growth Garden 🌿
  </p>
</div>
{/* 🤖 AI Assistant Floating Icon */}
<div
  className="fixed bottom-[80px] left-[60px] cursor-pointer group transition-transform duration-300 hover:scale-105 z-10 flex flex-col items-center"
  onClick={() => navigate("/ai-assistant")}
>
  <div
    className={`w-[70px] h-[70px] rounded-full shadow-lg flex items-center justify-center animate-floatSlow ${
      theme === "dark" ? "bg-[#3b3127]" : "bg-[#FFF3E6]"
    }`}
  >
    <span className="text-3xl">💬</span>
  </div>
  <p
    className={`text-center text-sm font-medium mt-1 tracking-wide ${
      theme === "dark" ? "text-[#EBDDBF]" : "text-[#7A916C]"
    }`}
  >
    AI Friend 💖
  </p>
</div>

{/* 📊 Mood Dashboard Icon */}
<div
  className="fixed bottom-[160px] right-[60px] cursor-pointer group transition-transform duration-300 hover:scale-105 z-10 flex flex-col items-center"
  onClick={() => navigate("/mood-dashboard")}
>
  <div
    className={`w-[70px] h-[70px] rounded-2xl shadow-lg flex items-center justify-center animate-floatSlow ${
      theme === "dark" ? "bg-[#3b3127]" : "bg-[#FFF3E6]"
    }`}
  >
    <span className="text-3xl">📊</span>
  </div>
  <p
    className={`text-center text-sm font-medium mt-1 tracking-wide ${
      theme === "dark" ? "text-[#EBDDBF]" : "text-[#7A916C]"
    }`}
  >
    Mood Dashboard
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
