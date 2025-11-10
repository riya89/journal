// import { useEffect, useState } from "react";

// export default function Header({ theme, setTheme, user, onLogout }) {
//   const [time, setTime] = useState("");
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showProfile, setShowProfile] = useState(false);

//   useEffect(() => {
//     const fmt = () => {
//       const d = new Date();
//       let h = d.getHours();
//       const m = String(d.getMinutes()).padStart(2, "0");
//       const ampm = h >= 12 ? "pm" : "am";
//       h = h % 12 || 12;
//       setTime(`${h}:${m} ${ampm}`);
//     };
//     fmt();
//     const t = setInterval(fmt, 60000);
//     return () => clearInterval(t);
//   }, []);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark");
//   }, [theme]);

//   const toggleTheme = () => {
//     const next = theme === "dark" ? "light" : "dark";
//     setTheme(next);
//     localStorage.setItem("theme", next);
//     document.body.dataset.theme = next;
//   };

//   return (
//     <header className="max-w-5xl w-full mx-auto px-6 pt-6 pb-3 relative">
//       <div className="grid grid-cols-[1fr_auto_1fr] items-center">
//         <div className="text-xl opacity-90">{time || "11:11 am"}</div>
//         <h1 className="text-4xl font-bold text-center">My Journal</h1>

//         <div className="justify-self-end flex items-center gap-3 relative">
//           {/* Month dropdown */}
//           <select className="bg-transparent border-2 border-leaf2 dark:border-sage text-inherit rounded-xl px-3 py-1 cursor-pointer">
//             <option>November</option>
//           </select>

//           {/* Settings gear */}
//           <button
//             className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 relative"
//             onClick={() => setMenuOpen((p) => !p)}
//           >
//             ⚙️
//           </button>

//           {/* Dropdown menu */}
//           {menuOpen && (
//             <div className="absolute right-0 top-12 bg-white dark:bg-[#151515] rounded-xl shadow-lg overflow-hidden z-50 border border-[#cdd6c0]/50 dark:border-[#3a3a3a]/60">
//               <button
//                 onClick={() => {
//                   setShowProfile(true);
//                   setMenuOpen(false);
//                 }}
//                 className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
//               >
//                 Profile
//               </button>
//               <button
//                 className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
//               >
//                 Billing
//               </button>
//             </div>
//           )}

//           {/* Theme toggle */}
//           <button
//             onClick={toggleTheme}
//             className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10"
//             title="Toggle theme"
//           >
//             {theme === "dark" ? "☀️" : "🌙"}
//           </button>
//         </div>
//       </div>

//       {/* 🌿 Profile Modal */}
//       {showProfile && (
//         <ProfileModal
//           user={user}
//           theme={theme}
//           onLogout={onLogout}
//           onClose={() => setShowProfile(false)}
//         />
//       )}
//     </header>
//   );
// }

// /* ========== PROFILE MODAL ========== */
// function ProfileModal({ user, theme, onLogout, onClose }) {
//   const [avatar, setAvatar] = useState(
//     user?.photoURL ||
//       "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
//   );

//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setAvatar(url);
//     }
//   };

//   return (
//     <div
//       onClick={onClose}
//       className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center z-[1000]"
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className={`rounded-2xl shadow-2xl p-6 w-[420px] max-w-[90%] text-center ${
//           theme === "dark"
//             ? "bg-[#2b241c] text-[#EBDDBF]"
//             : "bg-[#FFFBEA] text-[#6c7a5b]"
//         }`}
//       >
//         <h2 className="text-2xl font-bold mb-4">Your Profile 🌿</h2>

//         <div className="flex flex-col items-center gap-3">
//           <img
//             src={avatar}
//             alt="avatar"
//             className="w-28 h-28 rounded-full object-cover shadow-md"
//           />
//           <label className="text-sm cursor-pointer underline opacity-80">
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleAvatarChange}
//               className="hidden"
//             />
//             Change Avatar
//           </label>

//           <div className="mt-4 space-y-1">
//             <p className="font-medium">{user?.displayName}</p>
//             <p className="text-sm opacity-75">{user?.email}</p>
//           </div>
//         </div>

//         <button
//           onClick={() => {
//             localStorage.clear();
//             onLogout();
//           }}
//           className="mt-6 px-5 py-2 bg-[#E6F0D1] dark:bg-[#3a2e20] rounded-xl text-[#6c7a5b] dark:text-[#EBDDBF] font-semibold shadow-md hover:scale-[1.02] transition"
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";

export default function Header({
  theme,
  setTheme,
  user,
  onLogout,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) {
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "pm" : "am";
      h = h % 12 || 12;
      setTime(`${h}:${m} ${ampm}`);
    };
    fmt();
    const t = setInterval(fmt, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.body.dataset.theme = next;
  };

  // 🗓 Create 3-year range (this year - 1, this year, this year + 1)
  const baseYear = new Date().getFullYear();
  const years = [baseYear, baseYear+1, baseYear + 2];
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i).toLocaleString("default", { month: "long" })
  );

  return (
    <header className="max-w-5xl w-full mx-auto px-6 pt-6 pb-3 relative">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Time */}
        <div className="text-xl opacity-90">{time || "11:11 am"}</div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center">My Journal</h1>

        {/* Right side controls */}
        <div className="justify-self-end flex items-center gap-3 relative">
          {/* Month-Year Dropdown */}
          <select
            value={`${selectedMonth}-${selectedYear}`}
            onChange={(e) => {
              const [m, y] = e.target.value.split("-");
              setSelectedMonth(Number(m));
              setSelectedYear(Number(y));
            }}
            className={`rounded-xl px-3 py-2 text-[15px] font-medium cursor-pointer transition-all duration-200 outline-none 
              ${
                theme === "dark"
                  ? "bg-[#3a2e20] border border-[#5b4a3d] text-[#EBDDBF] hover:bg-[#4a3a28]"
                  : "bg-[#F3EFE2] border border-[#cdd6c0] text-[#6c7a5b] hover:bg-[#E6F0D1]"
              }`}
          >
            {years.map((yr) =>
              months.map((month, i) => (
                <option
                  key={`${i}-${yr}`}
                  value={`${i}-${yr}`}
                  className={
                    theme === "dark"
                      ? "bg-[#2b241c] text-[#EBDDBF]"
                      : "bg-[#FFFBEA] text-[#6c7a5b]"
                  }
                >
                  {month} {yr}
                </option>
              ))
            )}
          </select>

          {/* Settings gear */}
          <button
            className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 relative"
            onClick={() => setMenuOpen((p) => !p)}
          >
            ⚙️
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-12 bg-white dark:bg-[#151515] rounded-xl shadow-lg overflow-hidden z-50 border border-[#cdd6c0]/50 dark:border-[#3a3a3a]/60">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
              >
                Profile
              </button>
              <button
                className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
              >
                Billing
              </button>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10"
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* 🌿 Profile Modal */}
      {showProfile && (
        <ProfileModal
          user={user}
          theme={theme}
          onLogout={onLogout}
          onClose={() => setShowProfile(false)}
        />
      )}
    </header>
  );
}

/* ========== PROFILE MODAL (same as before) ========== */
function ProfileModal({ user, theme, onLogout, onClose }) {
  const [avatar, setAvatar] = useState(
    user?.photoURL ||
      "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center z-[1000]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded-2xl shadow-2xl p-6 w-[420px] max-w-[90%] text-center ${
          theme === "dark"
            ? "bg-[#2b241c] text-[#EBDDBF]"
            : "bg-[#FFFBEA] text-[#6c7a5b]"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">Your Profile 🌿</h2>

        <div className="flex flex-col items-center gap-3">
          <img
            src={avatar}
            alt="avatar"
            className="w-28 h-28 rounded-full object-cover shadow-md"
          />
          <label className="text-sm cursor-pointer underline opacity-80">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            Change Avatar
          </label>

          <div className="mt-4 space-y-1">
            <p className="font-medium">{user?.displayName}</p>
            <p className="text-sm opacity-75">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            onLogout();
          }}
          className="mt-6 px-5 py-2 bg-[#E6F0D1] dark:bg-[#3a2e20] rounded-xl text-[#6c7a5b] dark:text-[#EBDDBF] font-semibold shadow-md hover:scale-[1.02] transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
