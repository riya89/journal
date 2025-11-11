// // import { useState } from "react";
// // import Header from "../components/Header";
// // import Layout from "../components/Layout";
// // import JournalModal from "../components/JournalModal";
// // import FlowerMeadow from "../components/FlowerMeadow";

// // export default function Home({ user }) {
// //   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
// //   const [showModal, setShowModal] = useState(false);

// //   const handleThemeToggle = () => {
// //     const next = theme === "light" ? "dark" : "light";
// //     setTheme(next);
// //     localStorage.setItem("theme", next);
// //     document.body.dataset.theme = next;
// //   };

// //   return (
// //     <main
// //       className="app transition-all duration-500"
// //       data-theme={theme}
// //     >
// //       {/* 🕰 Header with month, theme toggle, and clock */}
// //       <Header theme={theme} setTheme={setTheme} />

// //       {/* 📒 Sidebar + Journal Grid */}
// //       <Layout theme={theme} onCardClick={() => setShowModal(true)} />

// //       {/* 🌸 Animated flowers (light) or candles (dark later) */}
// //       <FlowerMeadow theme={theme} />

// //       {/* 📖 Journal modal (opens book-like entry view) */}
// //       <JournalModal isOpen={showModal} onClose={() => setShowModal(false)} theme={theme} />
// //     </main>
// //   );
// // }
// // import { useState } from "react";
// // import Header from "../components/Header";
// // import Layout from "../components/Layout";
// // import JournalModal from "../components/JournalModal";
// // import FlowerMeadow from "../components/FlowerMeadow";

// // export default function Home({ user, setUser }) {
// //   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
// //   const [showModal, setShowModal] = useState(false);

// //   return (
// //     <main className="app transition-all duration-500" data-theme={theme}>
// //       {/* 🕰 Header with theme toggle, month, and settings */}
// //       <Header
// //         theme={theme}
// //         setTheme={setTheme}
// //         user={user}
// //         onLogout={() => setUser(null)}   // ✅ added this
// //       />

// //       {/* 📒 Sidebar + Journal Grid */}
// //       <Layout theme={theme} onCardClick={() => setShowModal(true)} />

// //       {/* 🌸 Animated flowers */}
// //       <FlowerMeadow theme={theme} />

// //       {/* 📖 Book-like Journal Modal */}
// //       <JournalModal
// //         isOpen={showModal}
// //         onClose={() => setShowModal(false)}
// //         theme={theme}
// //       />
// //     </main>
// //   );
// // }
// import { useState, useEffect } from "react";  
// import Header from "../components/Header";
// import Layout from "../components/Layout";
// import JournalModal from "../components/JournalModal";
// import FlowerMeadow from "../components/FlowerMeadow";

// export default function Home({ user, setUser }) {
//   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
//   const [showModal, setShowModal] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   const handleCardClick = (date) => {
//     setSelectedDate(date);
//     setShowModal(true);
//   };

//   useEffect(() => {
//   const fetchAvatar = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     const res = await fetch("http://localhost:8000/journal/avatar", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data = await res.json();
//     if (data.avatarURL) {
//       const updatedUser = { ...user, avatarURL: data.avatarURL };
//       setUser(updatedUser);
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//     }
//   };
//   fetchAvatar();
// }, []);

//   return (
//     <main className="app transition-all duration-500" data-theme={theme}>
//       {/* 🕰 Header with Theme + Month-Year */}
//       <Header
//         theme={theme}
//         setTheme={setTheme}
//         user={user}
//         setUser={setUser}
//         onLogout={() => setUser(null)}
//         selectedMonth={selectedMonth}
//         setSelectedMonth={setSelectedMonth}
//         selectedYear={selectedYear}
//         setSelectedYear={setSelectedYear}
//       />

//       {/* 📒 Sidebar + Grid */}
//       <Layout
//   theme={theme}
//   onCardClick={handleCardClick}
//   selectedMonth={selectedMonth}
//   selectedYear={selectedYear}
//   user={user}               
// />

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
import { useState } from "react";
import Header from "../components/Header";
import Layout from "../components/Layout";
import JournalModal from "../components/JournalModal";
import FlowerMeadow from "../components/FlowerMeadow";

export default function Home({ user, setUser, theme, setTheme }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleCardClick = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  return (
    <main className="app transition-all duration-500" data-theme={theme}>
      {/* 🕰 Header with Theme + Month-Year */}
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

      {/* 📖 Journal Modal */}
      {showModal && (
        <JournalModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          theme={theme}
          selectedDate={selectedDate}
        />
      )}
    </main>
  );
}