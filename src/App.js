// // // import { useState, useEffect } from "react";
// // // import Login from "./pages/Login";
// // // import Home from "./pages/Home";

// // // export default function App() {
// // //   const [user, setUser] = useState(null);

// // //   useEffect(() => {
// // //     const storedUser = localStorage.getItem("user");
// // //     if (storedUser) setUser(JSON.parse(storedUser));
// // //   }, []);

// // //   const handleLoginSuccess = (firebaseUser) => {
// // //     setUser(firebaseUser);
// // //   };

// // //   return (
// // //     <>
// // //       {user ? (
// // //         // ✅ Pass setUser here
// // //         <Home user={user} setUser={setUser} />
// // //       ) : (
// // //         <Login onLoginSuccess={handleLoginSuccess} />
// // //       )}
// // //     </>
// // //   );
// // // }
// // // import { useState, useEffect } from "react";
// // // import Login from "./pages/Login";
// // // import Home from "./pages/Home";

// // // export default function App() {
// // //   const [user, setUser] = useState(null);

// // //   useEffect(() => {
// // //     const storedUser = localStorage.getItem("user");
// // //     if (storedUser) setUser(JSON.parse(storedUser));
// // //   }, []);

// // //   const handleLoginSuccess = (firebaseUser) => {
// // //     setUser(firebaseUser);
// // //   };

// // //   return user ? (
// // //     <Home user={user} setUser={setUser} /> 
// // //   ) : (
// // //     <Login onLoginSuccess={handleLoginSuccess} />
// // //   );
// // // }
// // import { useState, useEffect } from "react";
// // import Login from "./pages/Login";
// // import Home from "./pages/Home";
// // import AvatarSelectModal from "./components/AvatarSelectModal"; // 🌸 new modal

// // export default function App() {
// //   const [user, setUser] = useState(null);
// //   const [avatarURL, setAvatarURL] = useState(null);
// //   const [showAvatarModal, setShowAvatarModal] = useState(false);
// //   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

// //   // 🧠 On first load — restore user from localStorage
// //   useEffect(() => {
// //     const storedUser = localStorage.getItem("user");
// //     if (storedUser) setUser(JSON.parse(storedUser));
// //   }, []);

// //   // ✅ After user logs in, check if they already have an avatar
// //   useEffect(() => {
// //     if (!user) return;

// //     const fetchAvatar = async () => {
// //       try {
// //         const token = await user.getIdToken();
// //         const res = await fetch("http://localhost:8000/journal/avatar", {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //         const data = await res.json();

// //         if (data.avatarURL) {
// //           setAvatarURL(data.avatarURL);
// //           setShowAvatarModal(false);
// //         } else {
// //           setShowAvatarModal(true); // 🎨 new user → choose avatar
// //         }
// //       } catch (err) {
// //         console.error("❌ Failed to fetch avatar:", err);
// //       }
// //     };

// //     fetchAvatar();
// //   }, [user]);

// //   // 🎨 Handle avatar selection
// //   const handleAvatarSelect = async (url) => {
// //     try {
// //       const token = await user.getIdToken();
// //       await fetch("http://localhost:8000/journal/avatar", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({ avatarURL: url }),
// //       });

// //       setAvatarURL(url);
// //       setShowAvatarModal(false);
// //     } catch (err) {
// //       console.error("❌ Failed to save avatar:", err);
// //     }
// //   };

// //   // 🌿 Handle login
// //   const handleLoginSuccess = (firebaseUser) => {
// //     setUser(firebaseUser);
// //     localStorage.setItem("user", JSON.stringify(firebaseUser));
// //   };

// //   // 🌙 Theme setup
// //   useEffect(() => {
// //     document.documentElement.classList.toggle("dark", theme === "dark");
// //   }, [theme]);

// //   // ✨ Flow
// //   if (!user) {
// //     return <Login onLoginSuccess={handleLoginSuccess} />;
// //   }

// //   if (showAvatarModal) {
// //     return <AvatarSelectModal theme={theme} onSelect={handleAvatarSelect} />;
// //   }

// //   return (
// //     <Home
// //       user={{ ...user, avatarURL }}
// //       setUser={setUser}
// //       theme={theme}
// //       setTheme={setTheme}
// //     />
// //   );
// // }
// import { useState, useEffect } from "react";
// import Login from "./pages/Login";
// import Home from "./pages/Home";
// import AvatarSelectModal from "./components/AvatarSelectModal";

// export default function App() {
//   const [user, setUser] = useState(null);
//   const [showAvatarModal, setShowAvatarModal] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

//   // 🧠 On first load – restore user from localStorage
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       const parsed = JSON.parse(storedUser);
//       setUser(parsed);
//     }
//     setLoading(false);
//   }, []);

//   // ✅ After user logs in, check if they have an avatar in Firestore
//   useEffect(() => {
//     if (!user) return;

//     const checkAvatar = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;

//         const res = await fetch("http://localhost:8000/journal/avatar", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();

//         if (data.avatarURL) {
//           // ✅ User already has avatar – update user object
//           const updatedUser = { ...user, avatarURL: data.avatarURL };
//           setUser(updatedUser);
//           localStorage.setItem("user", JSON.stringify(updatedUser));
//           setShowAvatarModal(false);
//         } else {
//           // 🎨 New user – show avatar picker
//           setShowAvatarModal(true);
//         }
//       } catch (err) {
//         console.error("❌ Failed to fetch avatar:", err);
//         setShowAvatarModal(true); // Show picker on error
//       }
//     };

//     checkAvatar();
//   }, [user?.uid]); // Only run when user changes

//   // 🎨 Handle avatar selection for new users
//   const handleAvatarSelect = async (url) => {
//     try {
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
//         // ✅ Update user with new avatar
//         const updatedUser = { ...user, avatarURL: url };
//         setUser(updatedUser);
//         localStorage.setItem("user", JSON.stringify(updatedUser));
//         setShowAvatarModal(false);
//       }
//     } catch (err) {
//       console.error("❌ Failed to save avatar:", err);
//     }
//   };

//   // 🌿 Handle login
//   const handleLoginSuccess = async (firebaseUser) => {
//     try {
//       const token = await firebaseUser.getIdToken();
//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(firebaseUser));
//       setUser(firebaseUser);
//     } catch (err) {
//       console.error("❌ Login error:", err);
//     }
//   };

//   // 🌙 Theme setup
//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark");
//   }, [theme]);

//   // ⏳ Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FFFBEA] dark:bg-[#1a1410]">
//         <div className="animate-spin border-4 border-[#7A916C]/30 border-t-[#7A916C] rounded-full w-12 h-12"></div>
//       </div>
//     );
//   }

//   // ✨ Flow: Login → Avatar Selection (if new) → Home
//   if (!user) {
//     return <Login onLoginSuccess={handleLoginSuccess} />;
//   }

//   if (showAvatarModal && !user.avatarURL) {
//     return <AvatarSelectModal theme={theme} onSelect={handleAvatarSelect} />;
//   }

//   return (
//     <Home
//       user={user}
//       setUser={setUser}
//       theme={theme}
//       setTheme={setTheme}
//     />
//   );
// }
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import GrowthGarden from "./pages/GrowthGarden";
import AIAssistant from "./pages/AIAssistant";
import MoodDashboard from "./pages/MoodDashboard";
import MonthlyPlanner from "./pages/MonthlyPlanner";
import TimeCapsule from "./pages/TimeCapsule";
import GratitudeJarPage from "./pages/GratitudeJarPage";
import MoodTrackingHub from "./pages/MoodTrackingHub";
import Billing from "./pages/Billing";
import UserManual from "./pages/UserManual";
// import GamificationDashboard from "./pages/GamificationDashboard";

function AppContent() {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Sync theme with DOM
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.body.dataset.theme = theme;
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEA] dark:bg-[#1a1410]">
        <div className="animate-spin border-4 border-[#7A916C]/30 border-t-[#7A916C] rounded-full w-12 h-12"></div>
      </div>
    );
  }

  if (!user) {
    return <Login theme={theme} setTheme={setTheme} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Home user={user} theme={theme} setTheme={setTheme} />}
      />
      <Route 
        path="/growth-garden" 
        element={<GrowthGarden theme={theme} />}
      />
      <Route path="/ai-assistant" element={<AIAssistant theme={theme} />} />
      <Route
        path="/mood-dashboard"
        element={<MoodDashboard user={user} theme={theme} setTheme={setTheme} />}
      />
      <Route
        path="/monthly-planner"
        element={<MonthlyPlanner theme={theme} />}
      />
      <Route
        path="/time-capsule"
        element={<TimeCapsule theme={theme} />}
      />
      <Route
        path="/gratitude-jar"
        element={<GratitudeJarPage theme={theme} />}
      />
      <Route
        path="/mood-tracking-hub"
        element={<MoodTrackingHub theme={theme} />}
      />
      <Route
        path="/billing"
        element={<Billing theme={theme} />}
      />
      <Route
        path="/user-manual"
        element={<UserManual theme={theme} />}
      />
      {/* <Route
        path="/gamification"
        element={<GamificationDashboard theme={theme} setTheme={setTheme} />}
      /> */}
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
