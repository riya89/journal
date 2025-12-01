// // // import { useEffect, useState } from "react";

// // // export default function Header({ theme, setTheme, user, onLogout }) {
// // //   const [time, setTime] = useState("");
// // //   const [menuOpen, setMenuOpen] = useState(false);
// // //   const [showProfile, setShowProfile] = useState(false);

// // //   useEffect(() => {
// // //     const fmt = () => {
// // //       const d = new Date();
// // //       let h = d.getHours();
// // //       const m = String(d.getMinutes()).padStart(2, "0");
// // //       const ampm = h >= 12 ? "pm" : "am";
// // //       h = h % 12 || 12;
// // //       setTime(`${h}:${m} ${ampm}`);
// // //     };
// // //     fmt();
// // //     const t = setInterval(fmt, 60000);
// // //     return () => clearInterval(t);
// // //   }, []);

// // //   useEffect(() => {
// // //     document.documentElement.classList.toggle("dark", theme === "dark");
// // //   }, [theme]);

// // //   const toggleTheme = () => {
// // //     const next = theme === "dark" ? "light" : "dark";
// // //     setTheme(next);
// // //     localStorage.setItem("theme", next);
// // //     document.body.dataset.theme = next;
// // //   };

// // //   return (
// // //     <header className="max-w-5xl w-full mx-auto px-6 pt-6 pb-3 relative">
// // //       <div className="grid grid-cols-[1fr_auto_1fr] items-center">
// // //         <div className="text-xl opacity-90">{time || "11:11 am"}</div>
// // //         <h1 className="text-4xl font-bold text-center">My Journal</h1>

// // //         <div className="justify-self-end flex items-center gap-3 relative">
// // //           {/* Month dropdown */}
// // //           <select className="bg-transparent border-2 border-leaf2 dark:border-sage text-inherit rounded-xl px-3 py-1 cursor-pointer">
// // //             <option>November</option>
// // //           </select>

// // //           {/* Settings gear */}
// // //           <button
// // //             className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 relative"
// // //             onClick={() => setMenuOpen((p) => !p)}
// // //           >
// // //             ⚙️
// // //           </button>

// // //           {/* Dropdown menu */}
// // //           {menuOpen && (
// // //             <div className="absolute right-0 top-12 bg-white dark:bg-[#151515] rounded-xl shadow-lg overflow-hidden z-50 border border-[#cdd6c0]/50 dark:border-[#3a3a3a]/60">
// // //               <button
// // //                 onClick={() => {
// // //                   setShowProfile(true);
// // //                   setMenuOpen(false);
// // //                 }}
// // //                 className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
// // //               >
// // //                 Profile
// // //               </button>
// // //               <button
// // //                 className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
// // //               >
// // //                 Billing
// // //               </button>
// // //             </div>
// // //           )}

// // //           {/* Theme toggle */}
// // //           <button
// // //             onClick={toggleTheme}
// // //             className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10"
// // //             title="Toggle theme"
// // //           >
// // //             {theme === "dark" ? "☀️" : "🌙"}
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* 🌿 Profile Modal */}
// // //       {showProfile && (
// // //         <ProfileModal
// // //           user={user}
// // //           theme={theme}
// // //           onLogout={onLogout}
// // //           onClose={() => setShowProfile(false)}
// // //         />
// // //       )}
// // //     </header>
// // //   );
// // // }

// // // /* ========== PROFILE MODAL ========== */
// // // function ProfileModal({ user, theme, onLogout, onClose }) {
// // //   const [avatar, setAvatar] = useState(
// // //     user?.photoURL ||
// // //       "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
// // //   );

// // //   const handleAvatarChange = (e) => {
// // //     const file = e.target.files[0];
// // //     if (file) {
// // //       const url = URL.createObjectURL(file);
// // //       setAvatar(url);
// // //     }
// // //   };

// // //   return (
// // //     <div
// // //       onClick={onClose}
// // //       className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center z-[1000]"
// // //     >
// // //       <div
// // //         onClick={(e) => e.stopPropagation()}
// // //         className={`rounded-2xl shadow-2xl p-6 w-[420px] max-w-[90%] text-center ${
// // //           theme === "dark"
// // //             ? "bg-[#2b241c] text-[#EBDDBF]"
// // //             : "bg-[#FFFBEA] text-[#6c7a5b]"
// // //         }`}
// // //       >
// // //         <h2 className="text-2xl font-bold mb-4">Your Profile 🌿</h2>

// // //         <div className="flex flex-col items-center gap-3">
// // //           <img
// // //             src={avatar}
// // //             alt="avatar"
// // //             className="w-28 h-28 rounded-full object-cover shadow-md"
// // //           />
// // //           <label className="text-sm cursor-pointer underline opacity-80">
// // //             <input
// // //               type="file"
// // //               accept="image/*"
// // //               onChange={handleAvatarChange}
// // //               className="hidden"
// // //             />
// // //             Change Avatar
// // //           </label>

// // //           <div className="mt-4 space-y-1">
// // //             <p className="font-medium">{user?.displayName}</p>
// // //             <p className="text-sm opacity-75">{user?.email}</p>
// // //           </div>
// // //         </div>

// // //         <button
// // //           onClick={() => {
// // //             localStorage.clear();
// // //             onLogout();
// // //           }}
// // //           className="mt-6 px-5 py-2 bg-[#E6F0D1] dark:bg-[#3a2e20] rounded-xl text-[#6c7a5b] dark:text-[#EBDDBF] font-semibold shadow-md hover:scale-[1.02] transition"
// // //         >
// // //           Logout
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // import { useEffect, useState } from "react";

// // export default function Header({
// //   theme,
// //   setTheme,
// //   user,
// //   onLogout,
// //   selectedMonth,
// //   setSelectedMonth,
// //   selectedYear,
// //   setSelectedYear,
// // }) {
// //   const [time, setTime] = useState("");
// //   const [menuOpen, setMenuOpen] = useState(false);
// //   const [showProfile, setShowProfile] = useState(false);

// //   useEffect(() => {
// //     const fmt = () => {
// //       const d = new Date();
// //       let h = d.getHours();
// //       const m = String(d.getMinutes()).padStart(2, "0");
// //       const ampm = h >= 12 ? "pm" : "am";
// //       h = h % 12 || 12;
// //       setTime(`${h}:${m} ${ampm}`);
// //     };
// //     fmt();
// //     const t = setInterval(fmt, 60000);
// //     return () => clearInterval(t);
// //   }, []);

// //   useEffect(() => {
// //     document.documentElement.classList.toggle("dark", theme === "dark");
// //   }, [theme]);

// //   const toggleTheme = () => {
// //     const next = theme === "dark" ? "light" : "dark";
// //     setTheme(next);
// //     localStorage.setItem("theme", next);
// //     document.body.dataset.theme = next;
// //   };

// //   // 🗓 Create 3-year range (this year - 1, this year, this year + 1)
// //   const baseYear = new Date().getFullYear();
// //   const years = [baseYear, baseYear+1, baseYear + 2];
// //   const months = Array.from({ length: 12 }, (_, i) =>
// //     new Date(2000, i).toLocaleString("default", { month: "long" })
// //   );

// //   return (
// //     <header className="max-w-5xl w-full mx-auto px-6 pt-6 pb-3 relative">
// //       <div className="grid grid-cols-[1fr_auto_1fr] items-center">
// //         {/* Time */}
// //         <div className="text-xl opacity-90">{time || "11:11 am"}</div>

// //         {/* Title */}
// //         <h1 className="text-4xl font-bold text-center">My Journal</h1>

// //         {/* Right side controls */}
// //         <div className="justify-self-end flex items-center gap-3 relative">
// //           {/* Month-Year Dropdown */}
// //           <select
// //             value={`${selectedMonth}-${selectedYear}`}
// //             onChange={(e) => {
// //               const [m, y] = e.target.value.split("-");
// //               setSelectedMonth(Number(m));
// //               setSelectedYear(Number(y));
// //             }}
// //             className={`rounded-xl px-3 py-2 text-[15px] font-medium cursor-pointer transition-all duration-200 outline-none 
// //               ${
// //                 theme === "dark"
// //                   ? "bg-[#3a2e20] border border-[#5b4a3d] text-[#EBDDBF] hover:bg-[#4a3a28]"
// //                   : "bg-[#F3EFE2] border border-[#cdd6c0] text-[#6c7a5b] hover:bg-[#E6F0D1]"
// //               }`}
// //           >
// //             {years.map((yr) =>
// //               months.map((month, i) => (
// //                 <option
// //                   key={`${i}-${yr}`}
// //                   value={`${i}-${yr}`}
// //                   className={
// //                     theme === "dark"
// //                       ? "bg-[#2b241c] text-[#EBDDBF]"
// //                       : "bg-[#FFFBEA] text-[#6c7a5b]"
// //                   }
// //                 >
// //                   {month} {yr}
// //                 </option>
// //               ))
// //             )}
// //           </select>

// //           {/* Settings gear */}
// //           <button
// //             className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 relative"
// //             onClick={() => setMenuOpen((p) => !p)}
// //           >
// //             ⚙️
// //           </button>

// //           {/* Dropdown menu */}
// //           {menuOpen && (
// //             <div className="absolute right-0 top-12 bg-white dark:bg-[#151515] rounded-xl shadow-lg overflow-hidden z-50 border border-[#cdd6c0]/50 dark:border-[#3a3a3a]/60">
// //               <button
// //                 onClick={() => {
// //                   setShowProfile(true);
// //                   setMenuOpen(false);
// //                 }}
// //                 className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
// //               >
// //                 Profile
// //               </button>
// //               <button
// //                 className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
// //               >
// //                 Billing
// //               </button>
// //             </div>
// //           )}

// //           {/* Theme toggle */}
// //           <button
// //             onClick={toggleTheme}
// //             className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10"
// //             title="Toggle theme"
// //           >
// //             {theme === "dark" ? "☀️" : "🌙"}
// //           </button>
// //         </div>
// //       </div>

// //       {/* 🌿 Profile Modal */}
// //       {showProfile && (
// //         <ProfileModal
// //           user={user}
// //           theme={theme}
// //           onLogout={onLogout}
// //           onClose={() => setShowProfile(false)}
// //         />
// //       )}
// //     </header>
// //   );
// // }

// // /* ========== PROFILE MODAL (same as before) ========== */
// // function ProfileModal({ user, theme, onLogout, onClose }) {
// //   const [avatar, setAvatar] = useState(
// //     user?.photoURL ||
// //       "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
// //   );

// //   const handleAvatarChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       const url = URL.createObjectURL(file);
// //       setAvatar(url);
// //     }
// //   };

// //   return (
// //     <div
// //       onClick={onClose}
// //       className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center z-[1000]"
// //     >
// //       <div
// //         onClick={(e) => e.stopPropagation()}
// //         className={`rounded-2xl shadow-2xl p-6 w-[420px] max-w-[90%] text-center ${
// //           theme === "dark"
// //             ? "bg-[#2b241c] text-[#EBDDBF]"
// //             : "bg-[#FFFBEA] text-[#6c7a5b]"
// //         }`}
// //       >
// //         <h2 className="text-2xl font-bold mb-4">Your Profile 🌿</h2>

// //         <div className="flex flex-col items-center gap-3">
// //           <img
// //             src={avatar}
// //             alt="avatar"
// //             className="w-28 h-28 rounded-full object-cover shadow-md"
// //           />
// //           <label className="text-sm cursor-pointer underline opacity-80">
// //             <input
// //               type="file"
// //               accept="image/*"
// //               onChange={handleAvatarChange}
// //               className="hidden"
// //             />
// //             Change Avatar
// //           </label>

// //           <div className="mt-4 space-y-1">
// //             <p className="font-medium">{user?.displayName}</p>
// //             <p className="text-sm opacity-75">{user?.email}</p>
// //           </div>
// //         </div>

// //         <button
// //           onClick={() => {
// //             localStorage.clear();
// //             onLogout();
// //           }}
// //           className="mt-6 px-5 py-2 bg-[#E6F0D1] dark:bg-[#3a2e20] rounded-xl text-[#6c7a5b] dark:text-[#EBDDBF] font-semibold shadow-md hover:scale-[1.02] transition"
// //         >
// //           Logout
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }
// import { useEffect, useState } from "react";

// export default function Header({ theme, setTheme, user, setUser, onLogout, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) {
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

//   // 🗓 Year + Month dropdown options
//   const baseYear = new Date().getFullYear();
//   const years = [baseYear, baseYear + 1, baseYear + 2];
//   const months = Array.from({ length: 12 }, (_, i) =>
//     new Date(2000, i).toLocaleString("default", { month: "long" })
//   );

//   return (
//     <header className="max-w-5xl w-full mx-auto px-6 pt-6 pb-3 relative">
//       <div className="grid grid-cols-[1fr_auto_1fr] items-center">
//         {/* Time */}
//         <div className="text-xl opacity-90">{time || "11:11 am"}</div>

//         {/* Title */}
//         <h1 className="text-4xl font-bold text-center">My Journal</h1>

//         {/* Right side controls */}
//         <div className="justify-self-end flex items-center gap-3 relative">
//           {/* Month-Year Dropdown */}
//           <select
//             value={`${selectedMonth}-${selectedYear}`}
//             onChange={(e) => {
//               const [m, y] = e.target.value.split("-");
//               setSelectedMonth(Number(m));
//               setSelectedYear(Number(y));
//             }}
//             className={`rounded-xl px-3 py-2 text-[15px] font-medium cursor-pointer transition-all duration-200 outline-none 
//               ${
//                 theme === "dark"
//                   ? "bg-[#3a2e20] border border-[#5b4a3d] text-[#EBDDBF] hover:bg-[#4a3a28]"
//                   : "bg-[#F3EFE2] border border-[#cdd6c0] text-[#6c7a5b] hover:bg-[#E6F0D1]"
//               }`}
//           >
//             {years.map((yr) =>
//               months.map((month, i) => (
//                 <option
//                   key={`${i}-${yr}`}
//                   value={`${i}-${yr}`}
//                   className={
//                     theme === "dark"
//                       ? "bg-[#2b241c] text-[#EBDDBF]"
//                       : "bg-[#FFFBEA] text-[#6c7a5b]"
//                   }
//                 >
//                   {month} {yr}
//                 </option>
//               ))
//             )}
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
//        <ProfileModal
//   user={user}
//   theme={theme}
//   onLogout={onLogout}
//   onClose={() => setShowProfile(false)}
//   setUser={setUser} // ✅ add this
// />

//       )}
//     </header>
//   );
// }

// // /* ========== PROFILE MODAL ========== */
// // function ProfileModal({ user, theme, onLogout, onClose }) {
// //   const [avatar, setAvatar] = useState(
// //     user?.avatarURL ||
// //       "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
// //   );

// //   // 🌸 Handle avatar selection (from predefined set)
// //   const handleAvatarPick = async (url) => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       await fetch("http://localhost:8000/journal/avatar", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({ avatarURL: url }),
// //       });
// //       setAvatar(url);
// //     } catch (err) {
// //       console.error("❌ Failed to update avatar:", err);
// //     }
// //   };

// //   const avatarOptions = [
// //     "https://i.pinimg.com/736x/41/64/bc/4164bc4a4b20c1a14e40137999db2f87.jpg",
// //     "https://i.pinimg.com/736x/29/86/4e/29864e8539b2c6a086066531a470d02d.jpg",
// //     "https://i.pinimg.com/1200x/0d/31/8d/0d318d6e06870c332f84998e7cc23aa6.jpg",
// //     "https://i.pinimg.com/736x/e7/0e/37/e70e37a0816cd9f17876aaaf958309af.jpg",
// //     "https://i.pinimg.com/736x/85/ea/28/85ea284dfdb7ec7bdbdb9227d4f51271.jpg",
// //   ];

// //   return (
// //     <div
// //       onClick={onClose}
// //       className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center z-[1000]"
// //     >
// //       <div
// //         onClick={(e) => e.stopPropagation()}
// //         className={`rounded-2xl shadow-2xl p-6 w-[420px] max-w-[90%] text-center ${
// //           theme === "dark"
// //             ? "bg-[#2b241c] text-[#EBDDBF]"
// //             : "bg-[#FFFBEA] text-[#6c7a5b]"
// //         }`}
// //       >
// //         <h2 className="text-2xl font-bold mb-4">Your Profile 🌿</h2>

// //         <div className="flex flex-col items-center gap-3">
// //           <img
// //             src={avatar}
// //             alt="avatar"
// //             className="w-28 h-28 rounded-full object-cover shadow-md"
// //           />

// //           {/* Avatar grid */}
// //           <div className="grid grid-cols-5 gap-3 mt-4">
// //             {avatarOptions.map((url) => (
// //               <img
// //                 key={url}
// //                 src={url}
// //                 alt="avatar option"
// //                 onClick={() => handleAvatarPick(url)}
// //                 className={`w-14 h-14 rounded-xl object-cover cursor-pointer transition-transform hover:scale-[1.05] border-2 ${
// //                   avatar === url
// //                     ? theme === "dark"
// //                       ? "border-[#EBDDBF]"
// //                       : "border-[#7A916C]"
// //                     : "border-transparent"
// //                 }`}
// //               />
// //             ))}
// //           </div>

// //           <div className="mt-4 space-y-1">
// //             <p className="font-medium">{user?.displayName}</p>
// //             <p className="text-sm opacity-75">{user?.email}</p>
// //           </div>
// //         </div>

// //         <button
// //           onClick={() => {
// //             localStorage.clear();
// //             onLogout();
// //           }}
// //           className="mt-6 px-5 py-2 bg-[#E6F0D1] dark:bg-[#3a2e20] rounded-xl text-[#6c7a5b] dark:text-[#EBDDBF] font-semibold shadow-md hover:scale-[1.02] transition"
// //         >
// //           Logout
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }
// // function ProfileModal({ user, theme, onLogout, onClose, setUser }) {
// //   useEffect(() => {
// //   if (user?.avatarURL) {
// //     setAvatar(user.avatarURL);
// //   }
// // }, [user?.avatarURL]);

// //   const [avatar, setAvatar] = useState(
// //     user?.avatarURL ||
// //       "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
// //   );
// //   const [showAvatarDialog, setShowAvatarDialog] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [successMsg, setSuccessMsg] = useState("");

// //   // 🌸 Handle avatar selection (from predefined set)
// //   const handleAvatarPick = async (url) => {
// //     try {
// //       setLoading(true);
// //       const token = localStorage.getItem("token");
// //       const res = await fetch("http://localhost:8000/journal/avatar", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({ avatarURL: url }),
// //       });

// //       const data = await res.json();
// //       if (data.success) {
// //         setAvatar(url);
// //         setSuccessMsg("✨ Avatar updated!");
// //         setShowAvatarDialog(false);

// //         // ✅ Update global user and save to localStorage
// //         const updatedUser = { ...user, avatarURL: url };
// //         setUser(updatedUser);
// //         localStorage.setItem("user", JSON.stringify(updatedUser));

// //         // Auto-hide success message after 2s
// //         setTimeout(() => setSuccessMsg(""), 2000);
// //       }
// //     } catch (err) {
// //       console.error("❌ Failed to update avatar:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// function ProfileModal({ user, theme, onLogout, onClose, setUser }) {
//   const [avatar, setAvatar] = useState(
//     user?.avatarURL ||
//       "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
//   );
//   const [showAvatarDialog, setShowAvatarDialog] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [successMsg, setSuccessMsg] = useState("");

//   // ✅ move this below state
//   useEffect(() => {
//     if (user?.avatarURL) {
//       setAvatar(user.avatarURL);
//     }
//   }, [user?.avatarURL]);

//   // 🌸 Handle avatar selection (from predefined set)
//   const handleAvatarPick = async (url) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:8000/journal/avatar", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ avatarURL: url }),
//       });

//       const data = await res.json();
//       if (data.success) {
//         setAvatar(url);
//         setSuccessMsg("✨ Avatar updated!");
//         setShowAvatarDialog(false);

//         // ✅ Update global user and save to localStorage
//         const updatedUser = { ...user, avatarURL: url };
//         setUser(updatedUser);
//         localStorage.setItem("user", JSON.stringify(updatedUser));

//         setTimeout(() => setSuccessMsg(""), 2000);
//       }
//     } catch (err) {
//       console.error("❌ Failed to update avatar:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const avatarOptions = [
//     "https://i.pinimg.com/736x/41/64/bc/4164bc4a4b20c1a14e40137999db2f87.jpg",
//     "https://i.pinimg.com/736x/29/86/4e/29864e8539b2c6a086066531a470d02d.jpg",
//     "https://i.pinimg.com/1200x/0d/31/8d/0d318d6e06870c332f84998e7cc23aa6.jpg",
//     "https://i.pinimg.com/736x/e7/0e/37/e70e37a0816cd9f17876aaaf958309af.jpg",
//     "https://i.pinimg.com/736x/85/ea/28/85ea284dfdb7ec7bdbdb9227d4f51271.jpg",
//     "https://i.pinimg.com/1200x/84/4a/f8/844af84b8a77b9dc2ca8c5226ba2431f.jpg",
//     "https://i.pinimg.com/736x/b2/55/97/b255979be38edf1a8ebfd82f847e9baf.jpg",
//     "https://i.pinimg.com/736x/0e/53/f3/0e53f313562880bfa62dccc6ab10b7c8.jpg",
//     "https://i.pinimg.com/736x/9f/53/54/9f5354b59fcceb74ad6901369a9095f6.jpg",
//     "https://i.pinimg.com/736x/98/05/63/980563de9d8c8b7c72a4035a718ff5d4.jpg",
//   ];

//   return (
//     <div
//       onClick={onClose}
//       className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center z-[1000]"
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className={`rounded-2xl shadow-2xl p-6 w-[420px] max-w-[90%] text-center relative ${
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
//             className="w-28 h-28 rounded-full object-cover shadow-md transition-transform duration-300 hover:scale-105"
//           />

//           <button
//             onClick={() => setShowAvatarDialog(true)}
//             className="text-sm underline opacity-80 hover:opacity-100 transition"
//           >
//             Change Avatar
//           </button>

//           {successMsg && (
//             <p className="text-sm text-green-600 dark:text-green-400 mt-1">
//               {successMsg}
//             </p>
//           )}

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

//         {/* Loading spinner */}
//         {loading && (
//           <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white rounded-2xl">
//             <div className="animate-spin border-4 border-white/60 border-t-transparent rounded-full w-10 h-10"></div>
//           </div>
//         )}
//       </div>

//       {/* 🌸 Avatar selection dialog */}
//       {showAvatarDialog && (
//         <div
//           onClick={() => setShowAvatarDialog(false)}
//           className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-[1100]"
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             className={`p-5 rounded-xl shadow-2xl ${
//               theme === "dark"
//                 ? "bg-[#2b241c] text-[#EBDDBF]"
//                 : "bg-[#FFFBEA] text-[#6c7a5b]"
//             }`}
//           >
//             <h3 className="text-xl font-semibold mb-3 text-center">
//               Choose Your Avatar 🌷
//             </h3>
//             <div className="grid grid-cols-5 gap-3">
//               {avatarOptions.map((url) => (
//                 <img
//                   key={url}
//                   src={url}
//                   alt="avatar option"
//                   onClick={() => handleAvatarPick(url)}
//                   className={`w-16 h-16 rounded-xl object-cover cursor-pointer transition-transform hover:scale-[1.08] border-2 ${
//                     avatar === url
//                       ? theme === "dark"
//                         ? "border-[#EBDDBF] shadow-[0_0_10px_#EBDDBF99]"
//                         : "border-[#7A916C] shadow-[0_0_8px_#7A916C99]"
//                       : "border-transparent"
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

export default function Header({ theme, setTheme, user, onLogout, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) {
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();
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

  const baseYear = new Date().getFullYear();
  const years = [baseYear, baseYear + 1, baseYear + 2];
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i).toLocaleString("default", { month: "long" })
  );

  return (
    <header className="max-w-5xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-3 relative">
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className={`text-lg lg:text-xl opacity-90 ${theme === "dark" ? "font-gothic-body" : ""}`}>
          {time || "11:11 am"}
        </div>
        <h1 className={`text-3xl lg:text-4xl font-bold text-center ${theme === "dark" ? "font-spooky-header" : ""}`}>
          Your Space
        </h1>

        <div className="justify-self-end flex items-center gap-2 lg:gap-3 relative">
          <select
            value={`${selectedMonth}-${selectedYear}`}
            onChange={(e) => {
              const [m, y] = e.target.value.split("-");
              setSelectedMonth(Number(m));
              setSelectedYear(Number(y));
            }}
            className={`rounded-xl px-2 lg:px-3 py-2 text-sm lg:text-[15px] font-medium cursor-pointer transition-all duration-200 outline-none 
              ${
                theme === "dark"
                  ? "bg-[#3a2e20] border border-[#5b4a3d] text-[#EBDDBF] hover:bg-[#4a3a28] font-gothic-body"
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
                      ? "bg-[#2b241c] text-[#EBDDBF] font-gothic-body"
                      : "bg-[#FFFBEA] text-[#6c7a5b]"
                  }
                >
                  {month} {yr}
                </option>
              ))
            )}
          </select>

          {/* User Manual Button */}
          <button
            onClick={() => navigate('/user-manual')}
            className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 transition-all hover:scale-110"
            title="User Manual"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>

          <button
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark";
              setTheme(next);
              localStorage.setItem("theme", next);
              document.body.dataset.theme = next;
              if (next === "dark") {
                document.documentElement.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
              }
            }}
            className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 transition-all hover:scale-110"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 relative"
            onClick={() => setMenuOpen((p) => !p)}
          >
            ⚙️
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 bg-white dark:bg-[#151515] rounded-xl shadow-lg overflow-hidden z-50 border border-[#cdd6c0]/50 dark:border-[#3a3a3a]/60 min-w-[150px]">
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
                onClick={() => {
                  navigate('/billing');
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
              >
                Billing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Top Row: Title and Controls */}
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl sm:text-3xl font-bold ${theme === "dark" ? "font-spooky-header" : ""}`}>
            Your Space
          </h1>
          
          <div className="flex items-center gap-2">
            {/* User Manual Button */}
            <button
              onClick={() => navigate('/user-manual')}
              className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 transition-all"
              title="User Manual"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>

            <button
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                localStorage.setItem("theme", next);
                document.body.dataset.theme = next;
                if (next === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              }}
              className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 transition-all"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <button
              className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10 relative"
              onClick={() => setMenuOpen((p) => !p)}
            >
              ⚙️
            </button>

            {menuOpen && (
              <div className="absolute right-3 top-16 bg-white dark:bg-[#151515] rounded-xl shadow-lg overflow-hidden z-50 border border-[#cdd6c0]/50 dark:border-[#3a3a3a]/60 min-w-[150px]">
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
                  onClick={() => {
                    navigate('/billing');
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-5 py-3 text-[#6c7a5b] dark:text-[#EBDDBF] hover:bg-[#E6F0D1] dark:hover:bg-[#3a2e20] transition"
                >
                  Billing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Time and Month Selector */}
        <div className="flex items-center justify-between">
          <div className={`text-base opacity-90 ${theme === "dark" ? "font-gothic-body" : ""}`}>
            {time || "11:11 am"}
          </div>
          
          <select
            value={`${selectedMonth}-${selectedYear}`}
            onChange={(e) => {
              const [m, y] = e.target.value.split("-");
              setSelectedMonth(Number(m));
              setSelectedYear(Number(y));
            }}
            className={`rounded-xl px-3 py-2 text-sm font-medium cursor-pointer transition-all duration-200 outline-none 
              ${
                theme === "dark"
                  ? "bg-[#3a2e20] border border-[#5b4a3d] text-[#EBDDBF] hover:bg-[#4a3a28] font-gothic-body"
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
                      ? "bg-[#2b241c] text-[#EBDDBF] font-gothic-body"
                      : "bg-[#FFFBEA] text-[#6c7a5b]"
                  }
                >
                  {month} {yr}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {showProfile && (
        <ProfileModal
          user={user}
          theme={theme}
          logout={logout}
          onClose={() => setShowProfile(false)}
          updateUser={updateUser}
        />
      )}
    </header>
  );
}

/* ========== PROFILE MODAL ========== */
function ProfileModal({ user, theme, logout, onClose, updateUser }) {
  const [avatar, setAvatar] = useState(
    user?.avatarURL ||
      "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
  );
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ Sync avatar with user prop changes
  useEffect(() => {
    if (user?.avatarURL) {
      setAvatar(user.avatarURL);
    }
  }, [user?.avatarURL]);

  // 🌸 Handle avatar selection
  const handleAvatarPick = async (url) => {
    try {
      setLoading(true);
      const res = await apiPost("http://localhost:8000/journal/avatar", { avatarURL: url });

      const data = await res.json();
      if (data.success) {
        setAvatar(url);
        setSuccessMsg("✨ Avatar updated!");
        setShowAvatarDialog(false);

        // ✅ Update user in AuthContext (which also updates localStorage)
        updateUser({ avatarURL: url });

        setTimeout(() => setSuccessMsg(""), 2000);
      }
    } catch (err) {
      console.error("❌ Failed to update avatar:", err);
    } finally {
      setLoading(false);
    }
  };

  const avatarOptions = [
    "https://i.pinimg.com/736x/41/64/bc/4164bc4a4b20c1a14e40137999db2f87.jpg",
    "https://i.pinimg.com/736x/29/86/4e/29864e8539b2c6a086066531a470d02d.jpg",
    "https://i.pinimg.com/1200x/0d/31/8d/0d318d6e06870c332f84998e7cc23aa6.jpg",
    "https://i.pinimg.com/736x/e7/0e/37/e70e37a0816cd9f17876aaaf958309af.jpg",
    "https://i.pinimg.com/736x/85/ea/28/85ea284dfdb7ec7bdbdb9227d4f51271.jpg",
    "https://i.pinimg.com/1200x/84/4a/f8/844af84b8a77b9dc2ca8c5226ba2431f.jpg",
    "https://i.pinimg.com/736x/b2/55/97/b255979be38edf1a8ebfd82f847e9baf.jpg",
    "https://i.pinimg.com/736x/0e/53/f3/0e53f313562880bfa62dccc6ab10b7c8.jpg",
    "https://i.pinimg.com/736x/9f/53/54/9f5354b59fcceb74ad6901369a9095f6.jpg",
    "https://i.pinimg.com/736x/98/05/63/980563de9d8c8b7c72a4035a718ff5d4.jpg",
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center z-[1000] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-[420px] text-center relative ${
          theme === "dark"
            ? "bg-[#2b241c] text-[#EBDDBF]"
            : "bg-[#FFFBEA] text-[#6c7a5b]"
        }`}
      >
        <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${theme === "dark" ? "font-spooky-header" : ""}`}>
          Your Profile 🌿
        </h2>

        <div className="flex flex-col items-center gap-3">
          <img
            src={avatar}
            alt="avatar"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-md transition-transform duration-300 hover:scale-105"
          />

          <button
            onClick={() => setShowAvatarDialog(true)}
            className="text-sm underline opacity-80 hover:opacity-100 transition"
          >
            Change Avatar
          </button>

          {successMsg && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {successMsg}
            </p>
          )}

          <div className="mt-4 space-y-1">
            <p className={`font-medium text-sm sm:text-base ${theme === "dark" ? "font-gothic-body" : ""}`}>
              {user?.displayName}
            </p>
            <p className={`text-xs sm:text-sm opacity-75 ${theme === "dark" ? "font-gothic-body" : ""}`}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-6 px-5 py-2 bg-[#E6F0D1] dark:bg-[#3a2e20] rounded-xl text-[#6c7a5b] dark:text-[#EBDDBF] font-semibold shadow-md hover:scale-[1.02] transition text-sm sm:text-base"
        >
          Logout
        </button>

        {loading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white rounded-2xl">
            <div className="animate-spin border-4 border-white/60 border-t-transparent rounded-full w-10 h-10"></div>
          </div>
        )}
      </div>

      {/* 🌸 Avatar selection dialog */}
      {showAvatarDialog && (
        <div
          onClick={() => setShowAvatarDialog(false)}
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-[1100] p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`p-4 sm:p-5 rounded-xl shadow-2xl max-w-[90vw] sm:max-w-md ${
              theme === "dark"
                ? "bg-[#2b241c] text-[#EBDDBF]"
                : "bg-[#FFFBEA] text-[#6c7a5b]"
            }`}
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center">
              Choose Your Avatar 🌷
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {avatarOptions.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="avatar option"
                  onClick={() => handleAvatarPick(url)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover cursor-pointer transition-transform hover:scale-[1.08] border-2 ${
                    avatar === url
                      ? theme === "dark"
                        ? "border-[#EBDDBF] shadow-[0_0_10px_#EBDDBF99]"
                        : "border-[#7A916C] shadow-[0_0_8px_#7A916C99]"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}