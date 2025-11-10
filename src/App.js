// // // import { useEffect, useState } from 'react';
// // // import Header from './components/Header';
// // // import Layout from './components/Layout';
// // // import JournalModal from './components/JournalModal';
// // // import FlowerMeadow from './components/FlowerMeadow';

// // // export default function App() {
// // //   const [theme, setTheme] = useState('light');
// // //   const [open, setOpen] = useState(false);

// // //   useEffect(() => {
// // //     const saved = localStorage.getItem('theme');
// // //     if (saved === 'dark') setTheme('dark');
// // //   }, []);

// // //   return (
// // //     <div className="min-h-screen relative">
// // //       <Header theme={theme} setTheme={setTheme} />
// // //       <Layout theme={theme} onCardClick={() => setOpen(true)} />
// // //       <FlowerMeadow />
// // //       <JournalModal isOpen={open} onClose={() => setOpen(false)} theme={theme} />
// // //     </div>
// // //   );
// // // }
// // import { useState, useEffect } from "react";
// // import Login from "./pages/Login";
// // import Home from "./pages/Home";

// // export default function App() {
// //   const [user, setUser] = useState(null);

// //   useEffect(() => {
// //     const storedUser = localStorage.getItem("user");
// //     if (storedUser) setUser(JSON.parse(storedUser));
// //   }, []);

// //   const handleLoginSuccess = (firebaseUser) => {
// //     setUser(firebaseUser);
// //   };

// //   return (
// //     <>
// //       {user ? (
// //         <Home user={user} />
// //       ) : (
// //         <Login onLoginSuccess={handleLoginSuccess} />
// //       )}
// //     </>
// //   );
// // }
// import { useState, useEffect } from "react";
// import Login from "./pages/Login";
// import Home from "./pages/Home";

// export default function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) setUser(JSON.parse(storedUser));
//   }, []);

//   const handleLoginSuccess = (firebaseUser) => {
//     setUser(firebaseUser);
//   };

//   return (
//     <>
//       {user ? (
//         // ✅ Pass setUser here
//         <Home user={user} setUser={setUser} />
//       ) : (
//         <Login onLoginSuccess={handleLoginSuccess} />
//       )}
//     </>
//   );
// }
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLoginSuccess = (firebaseUser) => {
    setUser(firebaseUser);
  };

  return user ? (
    <Home user={user} setUser={setUser} /> 
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}
