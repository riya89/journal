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
import Login from "./pages/Login";
import Home from "./pages/Home";
import GrowthGarden from "./pages/GrowthGarden";
import AvatarSelectModal from "./components/AvatarSelectModal";
import WelcomeModal from "./components/WelcomeModal";
import AIAssistant from "./pages/AIAssistant"; // 👈 add this at top
import MoodDashboard from "./pages/MoodDashboard";
import MonthlyPlanner from "./pages/MonthlyPlanner";
export default function App() {
  const [user, setUser] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [avatarChecked, setAvatarChecked] = useState(false); // Track if we've checked for avatar

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      
      // If user has avatar in localStorage, mark as checked to prevent re-checking
      if (parsed.avatarURL) {
        console.log("✅ User has avatar in localStorage, skipping backend check");
        setAvatarChecked(true);
        setShowAvatarModal(false);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log("🔄 useEffect triggered - user:", user.uid, "avatarChecked:", avatarChecked, "hasAvatar:", !!user.avatarURL);

    // ✅ If user already has avatarURL in localStorage, don't check again
    if (user.avatarURL) {
      console.log("✅ User already has avatar in state, skipping check");
      setShowAvatarModal(false);
      setAvatarChecked(true);
      return;
    }

    // ✅ If we've already checked for this user, don't check again
    if (avatarChecked) {
      console.log("✅ Already checked avatar for this user, skipping");
      return;
    }

    const checkAvatar = async () => {
      console.log("🔍 Checking avatar from backend...");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("❌ No token found");
          setAvatarChecked(true);
          return;
        }

        const res = await fetch("http://localhost:8000/journal/avatar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        console.log("🔍 useEffect Avatar API Response:", data);
        
        // Backend returns photoURL, not avatarURL
        const avatarUrl = data.avatarURL || data.photoURL;

        if (avatarUrl) {
          console.log("✅ Found avatar in backend, updating user");
          const updatedUser = { ...user, avatarURL: avatarUrl };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setShowAvatarModal(false);
        } else {
          console.log("🎨 No avatar found, showing modal");
          // Only show modal if backend confirms no avatar exists
          setShowAvatarModal(true);
        }
        setAvatarChecked(true);
      } catch (err) {
        console.error("❌ Failed to fetch avatar:", err);
        // Don't show modal on error - user might already have avatar
        setShowAvatarModal(false);
        setAvatarChecked(true);
      }
    };

    checkAvatar();
  }, [user, avatarChecked]);

  const handleAvatarSelect = async (url) => {
    try {
      const token = localStorage.getItem("token");
      console.log("💾 Saving avatar:", url);
      
      const res = await fetch("http://localhost:8000/journal/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          avatarURL: url, 
          photoURL: url,
          avatar: url // Try this too
        }),
      });

      const data = await res.json();
      console.log("💾 Save avatar response:", data);
      
      // Always update user state even if backend doesn't confirm success
      // This prevents modal from showing again in same session
      const updatedUser = { ...user, avatarURL: url };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowAvatarModal(false);
      setAvatarChecked(true);
      
      if (data.success) {
        console.log("✅ Avatar saved successfully to backend");
      } else {
        console.warn("⚠️ Backend returned success: false, but avatar saved locally");
      }
    } catch (err) {
      console.error("❌ Failed to save avatar:", err);
    }
  };

  const handleLoginSuccess = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem("token", token);
      
      // Reset avatar check flag for new login
      setAvatarChecked(false);
      
      // Check if user has avatar before setting user state
      const res = await fetch("http://localhost:8000/journal/avatar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      console.log("🔍 Avatar API Response:", data);
      
      // Check if response is actually a journal entry (wrong endpoint)
      let avatarUrl = null;
      if (data.date === 'avatar' || (data.title !== undefined && data.content !== undefined)) {
        console.warn("⚠️ Backend returned journal entry instead of avatar! Wrong endpoint being called.");
        console.warn("⚠️ Check if there's a route like /journal/:date that's catching /journal/avatar");
        // Treat as no avatar
        avatarUrl = null;
      } else {
        // Backend returns photoURL or avatarURL
        avatarUrl = data.avatarURL || data.photoURL;
      }
      console.log("🔍 Has avatar?", !!avatarUrl);
      
      // Add avatarURL to user object if it exists
      const userWithAvatar = avatarUrl 
        ? { ...firebaseUser, avatarURL: avatarUrl }
        : firebaseUser;
      
      console.log("🔍 User with avatar:", userWithAvatar);
      
      localStorage.setItem("user", JSON.stringify(userWithAvatar));
      setUser(userWithAvatar);
      
      // If user has avatar, mark as checked. If not, show modal
      if (avatarUrl) {
        console.log("✅ User has avatar, hiding modals");
        setAvatarChecked(true);
        setShowWelcomeModal(false);
        setShowAvatarModal(false);
      } else {
        console.log("🎨 New user, showing welcome modal first");
        // New user without avatar - show welcome modal first, then avatar modal
        setShowWelcomeModal(true);
        setAvatarChecked(true);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      // Still set user even if avatar fetch fails
      localStorage.setItem("user", JSON.stringify(firebaseUser));
      setUser(firebaseUser);
      setAvatarChecked(false); // Let useEffect try to check
    }
  };

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
    return <Login onLoginSuccess={handleLoginSuccess} theme={theme} />;
  }

  // Show welcome modal first for new users
  if (showWelcomeModal && !user.avatarURL) {
    return (
      <WelcomeModal 
        theme={theme} 
        onComplete={() => {
          setShowWelcomeModal(false);
          setShowAvatarModal(true);
        }} 
      />
    );
  }

  if (showAvatarModal && !user.avatarURL) {
    return <AvatarSelectModal theme={theme} onSelect={handleAvatarSelect} />;
  }

  return (
    <Routes>
  <Route
    path="/"
    element={<Home user={user} setUser={setUser} theme={theme} setTheme={setTheme} />}
  />
  <Route 
    path="/growth-garden" 
    element={<GrowthGarden theme={theme} />} // ✅ Pass theme prop
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
</Routes>


  );
}
