// // // // // // import { useNavigate } from "react-router-dom";

// // // // // // export default function GrowthGarden({ theme }) {
// // // // // //   const navigate = useNavigate();

// // // // // //   return (
// // // // // //     <div
// // // // // //       className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 ${
// // // // // //         theme === "dark"
// // // // // //           ? "bg-[#1a120c] text-[#EBDDBF]"
// // // // // //           : "bg-[#FFFBEA] text-[#6c7a5b]"
// // // // // //       }`}
// // // // // //     >
// // // // // //       <h1 className="text-4xl font-bold mb-4">🌳 Your Growth Garden</h1>
// // // // // //       <p className="max-w-md text-center opacity-80 mb-6">
// // // // // //         This serene space will bloom with your journaling progress.  
// // // // // //         Each day you write, a new flower, leaf, or tree will grow. 🌸
// // // // // //       </p>

// // // // // //       <button
// // // // // //         onClick={() => navigate(-1)}
// // // // // //         className={`px-5 py-2 rounded-xl font-semibold shadow-md ${
// // // // // //           theme === "dark"
// // // // // //             ? "bg-[#EBDDBF] text-[#2b241c]"
// // // // // //             : "bg-[#7A916C] text-white"
// // // // // //         }`}
// // // // // //       >
// // // // // //         ← Back to Journal
// // // // // //       </button>
// // // // // //     </div>
// // // // // //   );
// // // // // // }
// // // // // import { useEffect, useState } from "react";
// // // // // import { motion } from "framer-motion";
// // // // // import dayGarden from "../assets/garden-day.jpg";
// // // // // import nightGarden from "../assets/garden-night.png";

// // // // // // 🌼 Define points for 10 sample flowers (we’ll later expand to 31)
// // // // // const flowerSpots = [
// // // // //   { x: 48, y: 72 },
// // // // //   { x: 55, y: 71 },
// // // // //   { x: 60, y: 73 },
// // // // //   { x: 65, y: 70 },
// // // // //   { x: 70, y: 72 },
// // // // //   { x: 75, y: 71 },
// // // // //   { x: 80, y: 73 },
// // // // //   { x: 85, y: 70 },
// // // // //   { x: 42, y: 73 },
// // // // //   { x: 35, y: 72 },
// // // // // ];

// // // // // export default function GrowthGarden({ theme = "light", journalDates = [] }) {
// // // // //   const [flowers, setFlowers] = useState([]);

// // // // //   useEffect(() => {
// // // // //     const usedSpots = [];
// // // // //     const placed = journalDates.map((d, idx) => {
// // // // //       const spot = flowerSpots[idx % flowerSpots.length];
// // // // //       usedSpots.push(spot);
// // // // //       return { ...spot, id: idx };
// // // // //     });
// // // // //     setFlowers(placed);
// // // // //   }, [journalDates]);

// // // // //   const Flower = ({ x, y, index }) => {
// // // // //     const lightImg = `/assets/F${(index % 5) + 1}.png`;
// // // // //     const darkImg = `/assets/F${(index % 5) + 1}N.png`;
// // // // //     const img = theme === "dark" ? darkImg : lightImg;

// // // // //     return (
// // // // //       <motion.img
// // // // //         src={img}
// // // // //         alt="flower"
// // // // //         initial={{ rotate: 0, y: 0 }}
// // // // //         animate={{
// // // // //           rotate: [-1.5, 1.5, -1.2],
// // // // //           y: [0, -3, 0],
// // // // //         }}
// // // // //         transition={{
// // // // //           duration: 3 + Math.random() * 1.5,
// // // // //           repeat: Infinity,
// // // // //           repeatType: "mirror",
// // // // //           ease: "easeInOut",
// // // // //         }}
// // // // //         style={{
// // // // //           position: "absolute",
// // // // //           left: `${x}%`,
// // // // //           top: `${y}%`,
// // // // //           width: "80px",
// // // // //           transformOrigin: "bottom center",
// // // // //           zIndex: 10,
// // // // //           pointerEvents: "none",
// // // // //         }}
// // // // //       />
// // // // //     );
// // // // //   };

// // // // //   return (
// // // // //     <div className="relative w-full min-h-screen flex justify-center items-center overflow-hidden bg-[#bce1ff] dark:bg-[#1a1a2b]">
// // // // //       {/* 🌿 Background Garden */}
// // // // //       <div className="relative w-[90%] max-w-[1100px] mx-auto aspect-[16/9] overflow-hidden">
// // // // //         <img
// // // // //           src={theme === "dark" ? nightGarden : dayGarden}
// // // // //           alt="garden background"
// // // // //           className="absolute inset-0 w-full h-full object-contain"
// // // // //           style={{ zIndex: 1 }}
// // // // //         />

// // // // //         {/* 🌸 Flowers */}
// // // // //         {flowers.map((f, i) => (
// // // // //           <Flower key={i} x={f.x} y={f.y} index={i} />
// // // // //         ))}

// // // // //         {/* 🌿 Title */}
// // // // //         <h1
// // // // //           className={`absolute top-[4%] left-1/2 -translate-x-1/2 text-4xl font-bold z-20 ${
// // // // //             theme === "dark" ? "text-[#EBDDBF]" : "text-[#7A916C]"
// // // // //           }`}
// // // // //         >
// // // // //           Growth Garden 🌿
// // // // //         </h1>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // import { useEffect, useState } from "react";
// // // // import { motion } from "framer-motion";
// // // // import { useNavigate } from "react-router-dom";
// // // // import { ArrowLeft } from "lucide-react";
// // // // import dayGarden from "../assets/garden-day.jpg";
// // // // import nightGarden from "../assets/garden-night.png";

// // // // // Import all flower images
// // // // import F1 from "../assets/F1.png";
// // // // import F2 from "../assets/F2.png";
// // // // import F3 from "../assets/F3.png";
// // // // import F4 from "../assets/F4.png";
// // // // import F5 from "../assets/F5.png";
// // // // import F1N from "../assets/F1N.png";
// // // // import F2N from "../assets/F2N.png";
// // // // import F3N from "../assets/F3N.png";
// // // // import F4N from "../assets/F4N.png";
// // // // import F5N from "../assets/F5N.png";

// // // // // Flower image arrays
// // // // const lightFlowers = [F1, F2, F3, F4, F5];
// // // // const darkFlowers = [F1N, F2N, F3N, F4N, F5N];

// // // // // 🌼 31 FIXED flower positions on the garden landscape
// // // // // These positions follow the hill contour and never change
// // // // // x is horizontal position (0-100%), y is vertical position (0-100%)
// // // // const FIXED_FLOWER_SPOTS = [
// // // //   // Row 1 - Bottom/Front row (7 flowers)
// // // //   { x: 1, y: 77, flowerType: 1 },
// // // //   { x: 5, y: 75, flowerType: 2 },
// // // //   { x: 9, y: 75, flowerType: 3 },
// // // //   { x: 13, y: 77, flowerType: 4 },
// // // //   { x: 17, y: 79, flowerType: 5 },
// // // //   { x: 19, y: 80, flowerType: 1 },
// // // //   { x: 68, y: 72, flowerType: 2 },
  
// // // //   // Row 2 - Middle row (8 flowers)
// // // //   { x: 24, y: 73, flowerType: 3 },
// // // //   { x: 32, y: 70, flowerType: 4 },
// // // //   { x: 40, y: 67, flowerType: 5 },
// // // //   { x: 48, y: 65, flowerType: 1 },
// // // //   { x: 56, y: 65, flowerType: 2 },
// // // //   { x: 64, y: 67, flowerType: 3 },
// // // //   { x: 72, y: 70, flowerType: 4 },
// // // //   { x: 76, y: 75, flowerType: 5 },
  
// // // //   // Row 3 - Upper middle (8 flowers)
// // // // //   { x: 18, y: 70, flowerType: 1 },
// // // //   { x: 26, y: 67, flowerType: 2 },
// // // //   { x: 34, y: 64, flowerType: 3 },
// // // //   { x: 42, y: 62, flowerType: 4 },
// // // //   { x: 50, y: 60, flowerType: 5 },
// // // //   { x: 58, y: 62, flowerType: 1 },
// // // //   { x: 66, y: 64, flowerType: 2 },
// // // //   { x: 74, y: 67, flowerType: 3 },
  
// // // //   // Row 4 - Back row (8 flowers)
// // // //   { x: 22, y: 63, flowerType: 4 },
// // // //   { x: 30, y: 60, flowerType: 5 },
// // // //   { x: 38, y: 58, flowerType: 1 },
// // // //   { x: 46, y: 56, flowerType: 2 },
// // // //   { x: 54, y: 56, flowerType: 3 },
// // // //   { x: 62, y: 58, flowerType: 4 },
// // // //   { x: 70, y: 60, flowerType: 5 },
// // // //   { x: 78, y: 63, flowerType: 1 },
// // // // ];

// // // // export default function GrowthGarden({ theme = "light", journalDates = [] }) {
// // // //   const navigate = useNavigate();
// // // //   const [flowers, setFlowers] = useState([]);

// // // //   useEffect(() => {
// // // //     // For now, show all 31 flowers so you can adjust positions
// // // //     // Later, you'll use journalDates to show only specific flowers
// // // //     setFlowers(FIXED_FLOWER_SPOTS);
    
// // // //     // When ready to integrate with journal logic, use this instead:
// // // //     // const numFlowers = journalDates.length;
// // // //     // setFlowers(FIXED_FLOWER_SPOTS.slice(0, numFlowers));
// // // //   }, [journalDates]);

// // // //   const Flower = ({ x, y, flowerType, index }) => {
// // // //     const flowerImages = theme === "dark" ? darkFlowers : lightFlowers;
// // // //     const img = flowerImages[flowerType - 1];

// // // //     // Random animation variation for natural look
// // // //     const duration = 2.5 + Math.random() * 1.5;
// // // //     const delay = Math.random() * 2;

// // // //     return (
// // // //       <motion.img
// // // //         src={img}
// // // //         alt={`flower ${index + 1}`}
// // // //         initial={{ scale: 0, rotate: -20 }}
// // // //         animate={{
// // // //           scale: 1,
// // // //           rotate: [-2, 2, -1.5, 1.5, -2],
// // // //           y: [0, -4, 0, -3, 0],
// // // //         }}
// // // //         transition={{
// // // //           scale: { duration: 0.6, ease: "backOut" },
// // // //           rotate: {
// // // //             duration: duration,
// // // //             repeat: Infinity,
// // // //             repeatType: "mirror",
// // // //             ease: "easeInOut",
// // // //             delay: delay,
// // // //           },
// // // //           y: {
// // // //             duration: duration,
// // // //             repeat: Infinity,
// // // //             repeatType: "mirror",
// // // //             ease: "easeInOut",
// // // //             delay: delay,
// // // //           },
// // // //         }}
// // // //         style={{
// // // //           position: "absolute",
// // // //           left: `${x}%`,
// // // //           top: `${y}%`,
// // // //           width: "120px",
// // // //           height: "auto",
// // // //           transform: "translate(-50%, -100%)",
// // // //           transformOrigin: "bottom center",
// // // //           zIndex: 10,
// // // //           pointerEvents: "none",
// // // //           filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
// // // //         }}
// // // //       />
// // // //     );
// // // //   };

// // // //   return (
// // // //     <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100 dark:from-slate-900 dark:to-slate-800">
// // // //       {/* 🌿 Background Garden - Cropped from bottom to show sun/moon */}
// // // //       <div className="absolute inset-0">
// // // //         <img
// // // //           src={theme === "dark" ? nightGarden : dayGarden}
// // // //           alt="garden background"
// // // //           className="w-full h-full object-cover"
// // // //           style={{ 
// // // //             zIndex: 1,
// // // //             objectPosition: "center 20%", // Crop from bottom, keep top 20% centered
// // // //           }}
// // // //         />
// // // //       </div>

// // // //       {/* 🔙 Back Button */}
// // // //       <motion.button
// // // //         initial={{ opacity: 0, x: -20 }}
// // // //         animate={{ opacity: 1, x: 0 }}
// // // //         transition={{ duration: 0.6 }}
// // // //         onClick={() => navigate("/")}
// // // //         className={`absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all hover:scale-105 ${
// // // //           theme === "dark"
// // // //             ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80 border border-amber-900/30"
// // // //             : "bg-white/70 text-emerald-800 hover:bg-white/90 border border-emerald-200"
// // // //         }`}
// // // //       >
// // // //         <ArrowLeft size={20} />
// // // //         <span className="font-medium"></span>
// // // //       </motion.button>

// // // //       {/* 🌿 Title */}
// // // //       <motion.h1
// // // //         initial={{ opacity: 0, y: -20 }}
// // // //         animate={{ opacity: 1, y: 0 }}
// // // //         transition={{ duration: 0.8, delay: 0.3 }}
// // // //         className={`absolute top-6 left-1/2 -translate-x-1/2 text-5xl font-bold z-20 tracking-wide ${
// // // //           theme === "dark" 
// // // //             ? "text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" 
// // // //             : "text-emerald-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
// // // //         }`}
// // // //       >
// // // //         Growth Garden 🌿
// // // //       </motion.h1>

// // // //       {/* 🌸 Flowers Container */}
// // // //       <div className="absolute inset-0" style={{ zIndex: 5 }}>
// // // //         {flowers.map((flower, index) => (
// // // //           <Flower 
// // // //             key={`flower-${index}`} 
// // // //             x={flower.x} 
// // // //             y={flower.y} 
// // // //             flowerType={flower.flowerType}
// // // //             index={index}
// // // //           />
// // // //         ))}
// // // //       </div>

// // // //       {/* 📊 Flower Count */}
// // // //       <motion.div
// // // //         initial={{ opacity: 0, scale: 0.8 }}
// // // //         animate={{ opacity: 1, scale: 1 }}
// // // //         transition={{ duration: 0.6, delay: 0.5 }}
// // // //         className={`absolute bottom-8 right-8 px-6 py-3 rounded-full backdrop-blur-md z-20 ${
// // // //           theme === "dark"
// // // //             ? "bg-slate-800/70 text-amber-100 border border-amber-900/30"
// // // //             : "bg-white/70 text-emerald-800 border border-emerald-200"
// // // //         }`}
// // // //       >
// // // //         <span className="text-lg font-semibold">
// // // //           🌸 {flowers.length} {flowers.length === 1 ? "Flower" : "Flowers"}
// // // //         </span>
// // // //       </motion.div>
// // // //     </div>
// // // //   );
// // // // }
// // // import { useEffect, useState } from "react";
// // // import { motion } from "framer-motion";
// // // import { useNavigate } from "react-router-dom";
// // // import { ArrowLeft } from "lucide-react";
// // // import dayGarden from "../assets/garden-day.jpg";
// // // import nightGarden from "../assets/garden-night.png";

// // // // Import all flower images
// // // import F1 from "../assets/F1.png";
// // // import F2 from "../assets/F2.png";
// // // import F3 from "../assets/F3.png";
// // // import F4 from "../assets/F4.png";
// // // import F5 from "../assets/F5.png";
// // // import F1N from "../assets/F1N.png";
// // // import F2N from "../assets/F2N.png";
// // // import F3N from "../assets/F3N.png";
// // // import F4N from "../assets/F4N.png";
// // // import F5N from "../assets/F5N.png";

// // // // Flower image arrays
// // // const lightFlowers = [F1, F2, F3, F4, F5];
// // // const darkFlowers = [F1N, F2N, F3N, F4N, F5N];

// // // // 🌼 31 FIXED flower positions for DAY theme
// // // // Each flower has: x, y coordinates, flowerType (1-5), and size
// // // const DAY_FLOWER_SPOTS = [
// // //   // Row 1 - Bottom/Front row (7 flowers)
// // //   { x: 1, y: 81, flowerType: 1, size: 90 },
// // //   { x: 3, y: 73, flowerType: 2, size: 130 },
// // //   { x: 7, y: 70, flowerType: 3, size: 150 },
// // //   { x: 11, y: 73, flowerType: 4, size: 130 },
// // //   { x: 12, y: 80, flowerType: 5, size: 170 },
// // //   { x: 17, y: 60, flowerType: 1, size: 200 },
// // //   { x: 20, y: 60, flowerType: 2, size: 235 },
  
// // //   // Row 2 - Middle row (8 flowers)
// // //   { x: 26, y: 70, flowerType: 3, size: 215 },
// // //   { x: 32, y: 70, flowerType: 4, size: 205 },
// // //   { x: 40, y: 66, flowerType: 5, size: 225 },
// // //   { x: 48, y: 65, flowerType: 1, size: 110 },
// // //   { x: 56, y: 65, flowerType: 2, size: 120 },
// // //   { x: 64, y: 67, flowerType: 3, size: 115 },
// // //   { x: 72, y: 70, flowerType: 4, size: 105 },
// // //   { x: 76, y: 75, flowerType: 5, size: 125 },
  
// // //   // Row 3 - Upper middle (8 flowers)
// // //   { x: 23, y: 85, flowerType: 1, size: 100 },
// // //   { x: 36, y: 67, flowerType: 2, size: 95 },
// // //   { x: 34, y: 64, flowerType: 3, size: 105 },
// // //   { x: 42, y: 62, flowerType: 4, size: 100 },
// // //   { x: 50, y: 60, flowerType: 5, size: 10 },
// // //   { x: 58, y: 62, flowerType: 1, size: 105 },
// // //   { x: 66, y: 64, flowerType: 2, size: 100 },
// // //   { x: 74, y: 67, flowerType: 3, size: 95 },
  
// // //   // Row 4 - Back row (8 flowers)
// // //   { x: 17, y: 73, flowerType: 4, size: 150 },
// // //   { x: 30, y: 60, flowerType: 5, size: 90 },
// // //   { x: 38, y: 58, flowerType: 1, size: 85 },
// // //   { x: 46, y: 56, flowerType: 2, size: 80 },
// // //   { x: 54, y: 56, flowerType: 3, size: 90 },
// // //   { x: 62, y: 58, flowerType: 4, size: 85 },
// // //   { x: 70, y: 60, flowerType: 5, size: 90 },
// // //   { x: 78, y: 63, flowerType: 1, size: 85 },
// // // ];

// // // // 🌙 31 FIXED flower positions for NIGHT theme
// // // // Adjust these coordinates based on the night landscape
// // // const NIGHT_FLOWER_SPOTS = [
// // //   // Row 1 - Bottom/Front row (7 flowers)
// // //   { x: 20, y: 78, flowerType: 1, size: 130 },
// // //   { x: 28, y: 75, flowerType: 2, size: 110 },
// // //   { x: 36, y: 72, flowerType: 3, size: 140 },
// // //   { x: 44, y: 70, flowerType: 4, size: 120 },
// // //   { x: 52, y: 68, flowerType: 5, size: 150 },
// // //   { x: 60, y: 70, flowerType: 1, size: 125 },
// // //   { x: 68, y: 72, flowerType: 2, size: 135 },
  
// // //   // Row 2 - Middle row (8 flowers)
// // //   { x: 24, y: 73, flowerType: 3, size: 115 },
// // //   { x: 32, y: 70, flowerType: 4, size: 105 },
// // //   { x: 40, y: 67, flowerType: 5, size: 125 },
// // //   { x: 48, y: 65, flowerType: 1, size: 110 },
// // //   { x: 56, y: 65, flowerType: 2, size: 120 },
// // //   { x: 64, y: 67, flowerType: 3, size: 115 },
// // //   { x: 72, y: 70, flowerType: 4, size: 105 },
// // //   { x: 76, y: 75, flowerType: 5, size: 125 },
  
// // //   // Row 3 - Upper middle (8 flowers)
// // //   { x: 18, y: 70, flowerType: 1, size: 100 },
// // //   { x: 26, y: 67, flowerType: 2, size: 95 },
// // //   { x: 34, y: 64, flowerType: 3, size: 105 },
// // //   { x: 42, y: 62, flowerType: 4, size: 100 },
// // //   { x: 50, y: 60, flowerType: 5, size: 110 },
// // //   { x: 58, y: 62, flowerType: 1, size: 105 },
// // //   { x: 66, y: 64, flowerType: 2, size: 100 },
// // //   { x: 74, y: 67, flowerType: 3, size: 95 },
  
// // //   // Row 4 - Back row (8 flowers)
// // //   { x: 22, y: 63, flowerType: 4, size: 85 },
// // //   { x: 30, y: 60, flowerType: 5, size: 90 },
// // //   { x: 38, y: 58, flowerType: 1, size: 85 },
// // //   { x: 46, y: 56, flowerType: 2, size: 80 },
// // //   { x: 54, y: 56, flowerType: 3, size: 90 },
// // //   { x: 62, y: 58, flowerType: 4, size: 85 },
// // //   { x: 70, y: 60, flowerType: 5, size: 90 },
// // //   { x: 78, y: 63, flowerType: 1, size: 85 },
// // // ];

// // // export default function GrowthGarden({ theme = "light", journalDates = [] }) {
// // //   const navigate = useNavigate();
// // //   const [flowers, setFlowers] = useState([]);

// // //   useEffect(() => {
// // //     // Select the correct spot array based on theme
// // //     const spotArray = theme === "dark" ? NIGHT_FLOWER_SPOTS : DAY_FLOWER_SPOTS;
    
// // //     // For now, show all 31 flowers so you can adjust positions
// // //     setFlowers(spotArray);
    
// // //     // When ready to integrate with journal logic, use this instead:
// // //     // const numFlowers = journalDates.length;
// // //     // setFlowers(spotArray.slice(0, numFlowers));
// // //   }, [journalDates, theme]);

// // //   const Flower = ({ x, y, flowerType, size, index }) => {
// // //     const flowerImages = theme === "dark" ? darkFlowers : lightFlowers;
// // //     const img = flowerImages[flowerType - 1];

// // //     // Random animation variation for natural look
// // //     const duration = 2.5 + Math.random() * 1.5;
// // //     const delay = Math.random() * 2;

// // //     return (
// // //       <motion.img
// // //         src={img}
// // //         alt={`flower ${index + 1}`}
// // //         initial={{ scale: 0, rotate: -20 }}
// // //         animate={{
// // //           scale: 1,
// // //           rotate: [-2, 2, -1.5, 1.5, -2],
// // //           y: [0, -4, 0, -3, 0],
// // //         }}
// // //         transition={{
// // //           scale: { duration: 0.6, ease: "backOut" },
// // //           rotate: {
// // //             duration: duration,
// // //             repeat: Infinity,
// // //             repeatType: "mirror",
// // //             ease: "easeInOut",
// // //             delay: delay,
// // //           },
// // //           y: {
// // //             duration: duration,
// // //             repeat: Infinity,
// // //             repeatType: "mirror",
// // //             ease: "easeInOut",
// // //             delay: delay,
// // //           },
// // //         }}
// // //         style={{
// // //           position: "absolute",
// // //           left: `${x}%`,
// // //           top: `${y}%`,
// // //           width: `${size}px`,
// // //           height: "auto",
// // //           transform: "translate(-50%, -100%)",
// // //           transformOrigin: "bottom center",
// // //           zIndex: 10,
// // //           pointerEvents: "none",
// // //           filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
// // //         }}
// // //       />
// // //     );
// // //   };

// // //   return (
// // //     <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100 dark:from-slate-900 dark:to-slate-800">
// // //       {/* 🌿 Background Garden - Cropped from bottom to show sun/moon */}
// // //       <div className="absolute inset-0">
// // //         <img
// // //           src={theme === "dark" ? nightGarden : dayGarden}
// // //           alt="garden background"
// // //           className="w-full h-full object-cover"
// // //           style={{ 
// // //             zIndex: 1,
// // //             objectPosition: "center 20%", // Crop from bottom, keep top 20% centered
// // //           }}
// // //         />
// // //       </div>

// // //       {/* 🔙 Back Button */}
// // //       <motion.button
// // //         initial={{ opacity: 0, x: -20 }}
// // //         animate={{ opacity: 1, x: 0 }}
// // //         transition={{ duration: 0.6 }}
// // //         onClick={() => navigate("/")}
// // //         className={`absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all hover:scale-105 ${
// // //           theme === "dark"
// // //             ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80 border border-amber-900/30"
// // //             : "bg-white/70 text-emerald-800 hover:bg-white/90 border border-emerald-200"
// // //         }`}
// // //       >
// // //         <ArrowLeft size={20} />
// // //         <span className="font-medium">Back</span>
// // //       </motion.button>

// // //       {/* 🌿 Title */}
// // //       <motion.h1
// // //         initial={{ opacity: 0, y: -20 }}
// // //         animate={{ opacity: 1, y: 0 }}
// // //         transition={{ duration: 0.8, delay: 0.3 }}
// // //         className={`absolute top-6 left-1/2 -translate-x-1/2 text-5xl font-bold z-20 tracking-wide ${
// // //           theme === "dark" 
// // //             ? "text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" 
// // //             : "text-emerald-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
// // //         }`}
// // //       >
// // //         Growth Garden 🌿
// // //       </motion.h1>

// // //       {/* 🌸 Flowers Container */}
// // //       <div className="absolute inset-0" style={{ zIndex: 5 }}>
// // //         {flowers.map((flower, index) => (
// // //           <Flower 
// // //             key={`flower-${index}`} 
// // //             x={flower.x} 
// // //             y={flower.y} 
// // //             flowerType={flower.flowerType}
// // //             size={flower.size}
// // //             index={index}
// // //           />
// // //         ))}
// // //       </div>

// // //       {/* 📊 Flower Count */}
// // //       <motion.div
// // //         initial={{ opacity: 0, scale: 0.8 }}
// // //         animate={{ opacity: 1, scale: 1 }}
// // //         transition={{ duration: 0.6, delay: 0.5 }}
// // //         className={`absolute bottom-8 right-8 px-6 py-3 rounded-full backdrop-blur-md z-20 ${
// // //           theme === "dark"
// // //             ? "bg-slate-800/70 text-amber-100 border border-amber-900/30"
// // //             : "bg-white/70 text-emerald-800 border border-emerald-200"
// // //         }`}
// // //       >
// // //         <span className="text-lg font-semibold">
// // //           🌸 {flowers.length} {flowers.length === 1 ? "Flower" : "Flowers"}
// // //         </span>
// // //       </motion.div>
// // //     </div>
// // //   );
// // // }
// // import { useEffect, useState } from "react";
// // import { motion } from "framer-motion";
// // import { useNavigate } from "react-router-dom";
// // import { ArrowLeft } from "lucide-react";
// // import dayGarden from "../assets/garden-day.jpg";
// // import nightGarden from "../assets/garden-night.png";

// // // Import all flower images
// // import F1 from "../assets/F1.png";
// // import F2 from "../assets/F2.png";
// // import F3 from "../assets/F3.png";
// // import F4 from "../assets/F4.png";
// // import F5 from "../assets/F5.png";
// // import F1N from "../assets/F1N.png";
// // import F2N from "../assets/F2N.png";
// // import F3N from "../assets/F3N.png";
// // import F4N from "../assets/F4N.png";
// // import F5N from "../assets/F5N.png";

// // // Flower image arrays
// // const lightFlowers = [F1, F2, F3, F4, F5];
// // const darkFlowers = [F1N, F2N, F3N, F4N, F5N];

// // 🌼 31 FIXED flower positions for DAY theme
// // Each flower has: x, y coordinates, flowerType (1-5), size, and zIndex (layer order)
// // Higher zIndex = appears in front, Lower zIndex = appears behind
// const DAY_FLOWER_SPOTS = [
//   // Row 1 - Bottom/Front row (7 flowers) - HIGHEST zIndex (front)
//   { x: 2, y: 65, flowerType: 2, size: 170, zIndex: 40 },
// { x: 1, y: 80, flowerType: 1, size: 100, zIndex: 100 },
//   { x: 7, y: 72, flowerType: 3, size: 140, zIndex: 42 },
//     { x: 24, y: 60, flowerType: 4, size: 185, zIndex: 10 },
//         { x: 16, y:40, flowerType: 2, size: 300, zIndex: 18 },
//   { x: 12, y: 78, flowerType: 4, size: 120, zIndex: 39 },
//       { x: 14, y: 58, flowerType: 1, size: 225, zIndex: 40 },
//   { x: 15, y: 83, flowerType: 5, size: 150, zIndex: 30 },
//     { x: 24, y: 83, flowerType: 3, size: 115, zIndex: 30 },
//   { x: 20, y: 72, flowerType: 2, size: 155, zIndex: 41 },
  
//   // Row 2 - Middle row (8 flowers) - MEDIUM-HIGH zIndex
//     { x: 56, y: 55, flowerType: 2, size: 220, zIndex: 31 },
//       { x: 50, y: 65, flowerType: 5, size: 250, zIndex: 23 },

//   { x: 63, y: 67, flowerType: 1, size: 170, zIndex: 29 },
//   { x: 64, y: 67, flowerType: 3, size: 215, zIndex: 30 },
//   { x: 78, y: 60, flowerType: 4, size: 205, zIndex: 28 },
//   { x: 77, y: 80, flowerType: 5, size: 125, zIndex: 32 },
  
//   // Row 3 - Upper middle (8 flowers) - MEDIUM-LOW zIndex

//     { x: 40, y: 55, flowerType: 4, size: 200, zIndex: 19 },
//     { x: 37, y: 60, flowerType: 1, size: 185, zIndex: 9 },
//       { x: 44, y: 87, flowerType: 5, size: 125, zIndex: 32 },
//   { x: 40, y: 83, flowerType: 3, size: 115, zIndex: 22 },
//   { x: 88, y: 67, flowerType: 1, size: 205, zIndex: 21 },
//   { x: 83, y: 60, flowerType: 2, size: 200, zIndex: 20 },
//   { x: 84, y: 87, flowerType: 3, size: 95, zIndex: 18 },
  
//   // Row 4 - Back row (8 flowers) - LOWEST zIndex (back)
//     { x: 74, y: 60, flowerType: 1, size: 205, zIndex: 9 },
//     { x: 48, y: 70, flowerType: 3, size: 110, zIndex: 11 },
//     { x: 32, y: 70, flowerType: 4, size: 175, zIndex: 28 },
//   { x: 31, y: 78, flowerType: 5, size: 110, zIndex: 12 },
//     { x: 29, y: 85, flowerType: 1, size: 100, zIndex: 20 },
//       { x: 72, y: 86, flowerType: 5, size: 125, zIndex: 32 },
//   { x: 46, y: 75, flowerType: 2, size: 180, zIndex: 8 },
//   { x: 55, y: 70, flowerType: 4, size: 185, zIndex: 10 },
//   { x: 90, y: 85, flowerType: 5, size: 150, zIndex: 12 },
// ];

// // 🌙 31 FIXED flower positions for NIGHT theme
// const NIGHT_FLOWER_SPOTS = [
// // Row 1 - Bottom/Front row (7 flowers) - HIGHEST zIndex (front)
//   { x: 2, y: 65, flowerType: 2, size: 170, zIndex: 40 },
// { x: 1, y: 75, flowerType: 1, size: 100, zIndex: 100 },
//   { x: 7, y: 72, flowerType: 3, size: 140, zIndex: 42 },
//     { x: 24, y: 60, flowerType: 4, size: 185, zIndex: 10 },
//         { x: 16, y:40, flowerType: 2, size: 300, zIndex: 18 },
//   { x: 12, y: 78, flowerType: 4, size: 120, zIndex: 39 },
//       { x: 14, y: 58, flowerType: 1, size: 225, zIndex: 40 },
//   { x: 15, y: 78, flowerType: 5, size: 150, zIndex: 30 },
//     { x: 24, y: 83, flowerType: 3, size: 115, zIndex: 30 },
//   { x: 20, y: 72, flowerType: 2, size: 155, zIndex: 41 },
  
//   // Row 2 - Middle row (8 flowers) - MEDIUM-HIGH zIndex
//     { x: 56, y: 55, flowerType: 2, size: 220, zIndex: 31 },
//       { x: 50, y: 60, flowerType: 5, size: 250, zIndex: 23 },

//   { x: 63, y: 67, flowerType: 1, size: 170, zIndex: 29 },
//   { x: 64, y: 67, flowerType: 3, size: 215, zIndex: 30 },
//   { x: 78, y: 60, flowerType: 4, size: 205, zIndex: 28 },
//   { x: 77, y: 75, flowerType: 5, size: 125, zIndex: 32 },
  
//   // Row 3 - Upper middle (8 flowers) - MEDIUM-LOW zIndex

//     { x: 40, y: 55, flowerType: 4, size: 200, zIndex: 19 },
//     { x: 37, y: 60, flowerType: 1, size: 185, zIndex: 9 },
//       { x: 44, y: 82, flowerType: 5, size: 125, zIndex: 32 },
//   { x: 40, y: 83, flowerType: 3, size: 115, zIndex: 22 },
//   { x: 88, y: 67, flowerType: 1, size: 205, zIndex: 21 },
//   { x: 83, y: 60, flowerType: 2, size: 200, zIndex: 20 },
//   { x: 84, y: 87, flowerType: 3, size: 95, zIndex: 18 },
  
//   // Row 4 - Back row (8 flowers) - LOWEST zIndex (back)
//     { x: 74, y: 60, flowerType: 1, size: 205, zIndex: 9 },
//     { x: 48, y: 70, flowerType: 3, size: 110, zIndex: 11 },
//     { x: 32, y: 70, flowerType: 4, size: 175, zIndex: 28 },
//   { x: 31, y: 74, flowerType: 5, size: 110, zIndex: 12 },
//     { x: 29, y: 85, flowerType: 1, size: 100, zIndex: 20 },
//       { x: 72, y: 86, flowerType: 5, size: 125, zIndex: 32 },
//   { x: 46, y: 75, flowerType: 2, size: 180, zIndex: 8 },
//   { x: 55, y: 70, flowerType: 4, size: 185, zIndex: 10 },
//   { x: 90, y: 80, flowerType: 5, size: 150, zIndex: 12 },
// ];

// // export default function GrowthGarden({ theme = "light", journalDates = [] }) {
// //   const navigate = useNavigate();
// //   const [flowers, setFlowers] = useState([]);

// //   useEffect(() => {
// //     // Select the correct spot array based on theme
// //     const spotArray = theme === "dark" ? NIGHT_FLOWER_SPOTS : DAY_FLOWER_SPOTS;
    
// //     // For now, show all 31 flowers so you can adjust positions
// //     setFlowers(spotArray);
    
// //     // When ready to integrate with journal logic, use this instead:
// //     // const numFlowers = journalDates.length;
// //     // setFlowers(spotArray.slice(0, numFlowers));
// //   }, [journalDates, theme]);

// //   const Flower = ({ x, y, flowerType, size, index }) => {
// //     const flowerImages = theme === "dark" ? darkFlowers : lightFlowers;
// //     const img = flowerImages[flowerType - 1];

// //     // Random animation variation for natural look
// //     const duration = 2.5 + Math.random() * 1.5;
// //     const delay = Math.random() * 2;

// //     return (
// //       <motion.img
// //         src={img}
// //         alt={`flower ${index + 1}`}
// //         initial={{ scale: 0, rotate: -20 }}
// //         animate={{
// //           scale: 1,
// //           rotate: [-2, 2, -1.5, 1.5, -2],
// //           y: [0, -4, 0, -3, 0],
// //         }}
// //         transition={{
// //           scale: { duration: 0.6, ease: "backOut" },
// //           rotate: {
// //             duration: duration,
// //             repeat: Infinity,
// //             repeatType: "mirror",
// //             ease: "easeInOut",
// //             delay: delay,
// //           },
// //           y: {
// //             duration: duration,
// //             repeat: Infinity,
// //             repeatType: "mirror",
// //             ease: "easeInOut",
// //             delay: delay,
// //           },
// //         }}
// //         style={{
// //           position: "absolute",
// //           left: `${x}%`,
// //           top: `${y}%`,
// //           width: `${size}px`,
// //           height: "auto",
// //           transform: "translate(-50%, -100%)",
// //           transformOrigin: "bottom center",
// //           zIndex: 10,
// //           pointerEvents: "none",
// //           filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
// //         }}
// //       />
// //     );
// //   };

// //   return (
// //     <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100 dark:from-slate-900 dark:to-slate-800">
// //       {/* 🌿 Background Garden - Cropped from bottom to show sun/moon */}
// //       <div className="absolute inset-0">
// //         <img
// //           src={theme === "dark" ? nightGarden : dayGarden}
// //           alt="garden background"
// //           className="w-full h-full object-cover"
// //           style={{ 
// //             zIndex: 1,
// //             objectPosition: "center 20%", // Crop from bottom, keep top 20% centered
// //           }}
// //         />
// //       </div>

// //       {/* 🔙 Back Button */}
// //       <motion.button
// //         initial={{ opacity: 0, x: -20 }}
// //         animate={{ opacity: 1, x: 0 }}
// //         transition={{ duration: 0.6 }}
// //         onClick={() => navigate("/")}
// //         className={`absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all hover:scale-105 ${
// //           theme === "dark"
// //             ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80 border border-amber-900/30"
// //             : "bg-white/70 text-emerald-800 hover:bg-white/90 border border-emerald-200"
// //         }`}
// //       >
// //         <ArrowLeft size={20} />
// //         <span className="font-medium">Back</span>
// //       </motion.button>

// //       {/* 🌿 Title */}
// //       <motion.h1
// //         initial={{ opacity: 0, y: -20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.8, delay: 0.3 }}
// //         className={`absolute top-6 left-1/2 -translate-x-1/2 text-5xl font-bold z-20 tracking-wide ${
// //           theme === "dark" 
// //             ? "text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" 
// //             : "text-emerald-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
// //         }`}
// //       >
// //         Growth Garden 🌿
// //       </motion.h1>

// //       {/* 🌸 Flowers Container */}
// //       <div className="absolute inset-0" style={{ zIndex: 5 }}>
// //         {flowers.map((flower, index) => (
// //           <Flower 
// //             key={`flower-${index}`} 
// //             x={flower.x} 
// //             y={flower.y} 
// //             flowerType={flower.flowerType}
// //             size={flower.size}
// //             index={index}
// //           />
// //         ))}
// //       </div>

// //       {/* 📊 Flower Count */}
// //       {/* <motion.div
// //         initial={{ opacity: 0, scale: 0.8 }}
// //         animate={{ opacity: 1, scale: 1 }}
// //         transition={{ duration: 0.6, delay: 0.5 }}
// //         className={`absolute bottom-8 right-8 px-6 py-3 rounded-full backdrop-blur-md z-20 ${
// //           theme === "dark"
// //             ? "bg-slate-800/70 text-amber-100 border border-amber-900/30"
// //             : "bg-white/70 text-emerald-800 border border-emerald-200"
// //         }`}
// //       >
// //         <span className="text-lg font-semibold">
// //           🌸 {flowers.length} {flowers.length === 1 ? "Flower" : "Flowers"}
// //         </span>
// //       </motion.div> */}
// //     </div>
// //   );
// // }
// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
// import dayGarden from "../assets/garden-day.jpg";
// import nightGarden from "../assets/garden-night.png";

// // Import all flower images
// import F1 from "../assets/F1.png";
// import F2 from "../assets/F2.png";
// import F3 from "../assets/F3.png";
// import F4 from "../assets/F4.png";
// import F5 from "../assets/F5.png";
// import F1N from "../assets/F1N.png";
// import F2N from "../assets/F2N.png";
// import F3N from "../assets/F3N.png";
// import F4N from "../assets/F4N.png";
// import F5N from "../assets/F5N.png";

// // Flower image arrays
// const lightFlowers = [F1, F2, F3, F4, F5];
// const darkFlowers = [F1N, F2N, F3N, F4N, F5N];

// // 🌼 31 FIXED flower positions for DAY theme
// const DAY_FLOWER_SPOTS = [
//   { x: 2, y: 80, size: 170, zIndex: 40 },
//   { x: 1, y: 80, size: 100, zIndex: 100 },
//   { x: 7, y: 72, size: 140, zIndex: 42 },
//   { x: 24, y: 60, size: 185, zIndex: 10 },
//   { x: 16, y: 40, size: 300, zIndex: 18 },
//   { x: 12, y: 78, size: 120, zIndex: 39 },
//   { x: 14, y: 58, size: 225, zIndex: 40 },
//   { x: 15, y: 83, size: 150, zIndex: 30 },
//   { x: 24, y: 83, size: 115, zIndex: 30 },
//   { x: 20, y: 72, size: 155, zIndex: 41 },
//   { x: 56, y: 55, size: 220, zIndex: 31 },
//   { x: 50, y: 65, size: 250, zIndex: 23 },
//   { x: 63, y: 67, size: 170, zIndex: 29 },
//   { x: 64, y: 67, size: 215, zIndex: 30 },
//   { x: 78, y: 60, size: 205, zIndex: 28 },
//   { x: 77, y: 80, size: 125, zIndex: 32 },
//   { x: 40, y: 55, size: 200, zIndex: 19 },
//   { x: 37, y: 60, size: 185, zIndex: 9 },
//   { x: 44, y: 87, size: 125, zIndex: 32 },
//   { x: 40, y: 83, size: 115, zIndex: 22 },
//   { x: 88, y: 67, size: 205, zIndex: 21 },
//   { x: 83, y: 60, size: 200, zIndex: 20 },
//   { x: 84, y: 87, size: 95, zIndex: 18 },
//   { x: 74, y: 60, size: 205, zIndex: 9 },
//   { x: 48, y: 70, size: 110, zIndex: 11 },
//   { x: 32, y: 70, size: 175, zIndex: 28 },
//   { x: 31, y: 78, size: 110, zIndex: 12 },
//   { x: 29, y: 85, size: 100, zIndex: 20 },
//   { x: 72, y: 86, size: 125, zIndex: 32 },
//   { x: 46, y: 75, size: 180, zIndex: 8 },
//   { x: 55, y: 70, size: 185, zIndex: 10 },
// ];

// // 🌙 31 FIXED flower positions for NIGHT theme
// const NIGHT_FLOWER_SPOTS = [
//   { x: 2, y: 65, size: 170, zIndex: 40 },
//   { x: 1, y: 75, size: 100, zIndex: 100 },
//   { x: 7, y: 72, size: 140, zIndex: 42 },
//   { x: 24, y: 60, size: 185, zIndex: 10 },
//   { x: 16, y: 40, size: 300, zIndex: 18 },
//   { x: 12, y: 78, size: 120, zIndex: 39 },
//   { x: 14, y: 58, size: 225, zIndex: 40 },
//   { x: 15, y: 78, size: 150, zIndex: 30 },
//   { x: 24, y: 83, size: 115, zIndex: 30 },
//   { x: 20, y: 72, size: 155, zIndex: 41 },
//   { x: 56, y: 55, size: 220, zIndex: 31 },
//   { x: 50, y: 60, size: 250, zIndex: 23 },
//   { x: 63, y: 67, size: 170, zIndex: 29 },
//   { x: 64, y: 67, size: 215, zIndex: 30 },
//   { x: 78, y: 60, size: 205, zIndex: 28 },
//   { x: 77, y: 75, size: 125, zIndex: 32 },
//   { x: 40, y: 55, size: 200, zIndex: 19 },
//   { x: 37, y: 60, size: 185, zIndex: 9 },
//   { x: 44, y: 82, size: 125, zIndex: 32 },
//   { x: 40, y: 83, size: 115, zIndex: 22 },
//   { x: 88, y: 67, size: 205, zIndex: 21 },
//   { x: 83, y: 60, size: 200, zIndex: 20 },
//   { x: 84, y: 87, size: 95, zIndex: 18 },
//   { x: 74, y: 60, size: 205, zIndex: 9 },
//   { x: 48, y: 70, size: 110, zIndex: 11 },
//   { x: 32, y: 70, size: 175, zIndex: 28 },
//   { x: 31, y: 74, size: 110, zIndex: 12 },
//   { x: 29, y: 85, size: 100, zIndex: 20 },
//   { x: 72, y: 86, size: 125, zIndex: 32 },
//   { x: 46, y: 75, size: 180, zIndex: 8 },
//   { x: 55, y: 70, size: 185, zIndex: 10 },
// ];

// // 🎨 Cute messages for flowers
// const cuteMessages = [
//   "You bloomed today! 🌸",
//   "A beautiful thought planted ✨",
//   "Growth in progress 🌱",
//   "Your words took root 🌿",
//   "Reflection blossomed here 🌺",
//   "Seeds of mindfulness 🌼",
//   "A moment captured 🌷",
//   "Your journey grows 🌹",
// ];

// export default function GrowthGarden({ theme = "light" }) {
//   const navigate = useNavigate();
//   const [flowers, setFlowers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [hoveredFlower, setHoveredFlower] = useState(null);
  
//   // Month navigation
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const currentYear = currentDate.getFullYear();
//   const currentMonth = currentDate.getMonth(); // 0-11

//   useEffect(() => {
//     fetchJournalDates();
//   }, [currentYear, currentMonth]);

//   const fetchJournalDates = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const yearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
      
//       const res = await fetch(`http://localhost:8000/journal/dates/month/${yearMonth}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       const data = await res.json();
      
//       // Map journal dates to flower positions
//       const spotArray = theme === "dark" ? NIGHT_FLOWER_SPOTS : DAY_FLOWER_SPOTS;
      
//       const flowersToShow = data.dates.map((entry) => {
//         const dayIndex = entry.day - 1; // Day 1 = index 0
//         const spot = spotArray[dayIndex];
        
//         // Assign flower type based on day
//         const flowerType = ((entry.day - 1) % 5) + 1;
        
//         return {
//           ...spot,
//           flowerType,
//           date: entry.date,
//           day: entry.day,
//           mood: entry.mood,
//           title: entry.title,
//           message: cuteMessages[Math.floor(Math.random() * cuteMessages.length)],
//         };
//       });
      
//       setFlowers(flowersToShow);
//     } catch (err) {
//       console.error("❌ Failed to fetch journal dates:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrevMonth = () => {
//     setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
//   };

//   const handleNextMonth = () => {
//     const today = new Date();
//     // Don't allow going beyond current month
//     if (currentYear < today.getFullYear() || 
//         (currentYear === today.getFullYear() && currentMonth < today.getMonth())) {
//       setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
//     }
//   };

//   const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
//   const isCurrentMonth = currentYear === new Date().getFullYear() && 
//                          currentMonth === new Date().getMonth();

//   const Flower = ({ x, y, flowerType, size, zIndex, date, day, mood, title, message, index }) => {
//     const flowerImages = theme === "dark" ? darkFlowers : lightFlowers;
//     const img = flowerImages[flowerType - 1];
//     const isHovered = hoveredFlower === index;

//     const duration = 2.5 + Math.random() * 1.5;
//     const delay = Math.random() * 2;

//     return (
//       <div
//         style={{
//           position: "absolute",
//           left: `${x}%`,
//           top: `${y}%`,
//           transform: "translate(-50%, -100%)",
//           zIndex: isHovered ? 999 : zIndex,
//         }}
//         onMouseEnter={() => setHoveredFlower(index)}
//         onMouseLeave={() => setHoveredFlower(null)}
//       >
//         <motion.img
//           src={img}
//           alt={`flower ${day}`}
//           initial={{ scale: 0, rotate: -20 }}
//           animate={{
//             scale: isHovered ? 1.15 : 1,
//             rotate: [-2, 2, -1.5, 1.5, -2],
//             y: [0, -4, 0, -3, 0],
//           }}
//           transition={{
//             scale: { duration: 0.3, ease: "easeOut" },
//             rotate: {
//               duration: duration,
//               repeat: Infinity,
//               repeatType: "mirror",
//               ease: "easeInOut",
//               delay: delay,
//             },
//             y: {
//               duration: duration,
//               repeat: Infinity,
//               repeatType: "mirror",
//               ease: "easeInOut",
//               delay: delay,
//             },
//           }}
//           style={{
//             width: `${size}px`,
//             height: "auto",
//             transformOrigin: "bottom center",
//             pointerEvents: "auto",
//             cursor: "pointer",
//             filter: isHovered 
//               ? "drop-shadow(0 4px 12px rgba(122, 145, 108, 0.5))" 
//               : "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
//           }}
//         />
        
//         {/* Tooltip */}
//         <AnimatePresence>
//           {isHovered && (
//             <motion.div
//               initial={{ opacity: 0, y: 10, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: 10, scale: 0.9 }}
//               transition={{ duration: 0.2 }}
//               className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-3 rounded-xl backdrop-blur-md whitespace-nowrap pointer-events-none shadow-xl ${
//                 theme === "dark"
//                   ? "bg-slate-800/90 text-amber-100 border border-amber-900/30"
//                   : "bg-white/90 text-emerald-800 border border-emerald-200"
//               }`}
//               style={{ zIndex: 1000 }}
//             >
//               <div className="text-center">
//                 <div className="font-bold text-lg mb-1">
//                   {new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
//                 </div>
//                 {title && <div className="text-sm opacity-90 mb-1">{title}</div>}
//                 {mood && <div className="text-sm opacity-80 mb-1">Mood: {mood}</div>}
//                 <div className="text-xs opacity-70 italic mt-2">{message}</div>
//               </div>
//               {/* Arrow */}
//               <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent ${
//                 theme === "dark" ? "border-t-slate-800/90" : "border-t-white/90"
//               }`} />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     );
//   };

//   return (
//     <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100 dark:from-slate-900 dark:to-slate-800">
//       {/* Background */}
//       <div className="absolute inset-0">
//         <img
//           src={theme === "dark" ? nightGarden : dayGarden}
//           alt="garden background"
//           className="w-full h-full object-cover"
//           style={{ zIndex: 1, objectPosition: "center 20%" }}
//         />
//       </div>

//       {/* Back Button */}
//       <motion.button
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.6 }}
//         onClick={() => navigate("/")}
//         className={`absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all hover:scale-105 ${
//           theme === "dark"
//             ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80 border border-amber-900/30"
//             : "bg-white/70 text-emerald-800 hover:bg-white/90 border border-emerald-200"
//         }`}
//       >
//         <ArrowLeft size={20} />
//         <span className="font-medium">Back</span>
//       </motion.button>

//       {/* Title & Month Navigation */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, delay: 0.3 }}
//         className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4"
//       >
//         <button
//           onClick={handlePrevMonth}
//           className={`p-2 rounded-lg backdrop-blur-md transition-all hover:scale-110 ${
//             theme === "dark"
//               ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80"
//               : "bg-white/70 text-emerald-800 hover:bg-white/90"
//           }`}
//         >
//           <ChevronLeft size={24} />
//         </button>
        
//         <h1 className={`text-4xl font-bold tracking-wide ${
//           theme === "dark" 
//             ? "text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" 
//             : "text-emerald-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
//         }`}>
//           {monthName} 🌿
//         </h1>

//         <button
//           onClick={handleNextMonth}
//           disabled={isCurrentMonth}
//           className={`p-2 rounded-lg backdrop-blur-md transition-all ${
//             isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
//           } ${
//             theme === "dark"
//               ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80"
//               : "bg-white/70 text-emerald-800 hover:bg-white/90"
//           }`}
//         >
//           <ChevronRight size={24} />
//         </button>
//       </motion.div>

//       {/* Flowers */}
//       <div className="absolute inset-0" style={{ zIndex: 5 }}>
//         {loading ? (
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
//             <div className="animate-spin border-4 border-emerald-300/30 border-t-emerald-600 rounded-full w-12 h-12"></div>
//           </div>
//         ) : (
//           flowers.map((flower, index) => (
//             <Flower key={`flower-${index}`} {...flower} index={index} />
//           ))
//         )}
//       </div>

//       {/* Flower Count */}
//       <motion.div
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.6, delay: 0.5 }}
//         className={`absolute bottom-8 right-8 px-6 py-3 rounded-full backdrop-blur-md z-20 ${
//           theme === "dark"
//             ? "bg-slate-800/70 text-amber-100 border border-amber-900/30"
//             : "bg-white/70 text-emerald-800 border border-emerald-200"
//         }`}
//       >
//         <span className="text-lg font-semibold">
//           🌸 {flowers.length} {flowers.length === 1 ? "Day" : "Days"}
//         </span>
//       </motion.div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import dayGarden from "../assets/garden-day.jpg";
import nightGarden from "../assets/garden-night.png";
import F1 from "../assets/F1.png";
import F2 from "../assets/F2.png";
import F3 from "../assets/F3.png";
import F4 from "../assets/F4.png";
import F5 from "../assets/F5.png";
import F1N from "../assets/F1N.png";
import F2N from "../assets/F2N.png";
import F3N from "../assets/F3N.png";
import F4N from "../assets/F4N.png";
import F5N from "../assets/F5N.png";
import { DAY_FLOWER_SPOTS, NIGHT_FLOWER_SPOTS } from "./FlowerSpots";

const lightFlowers = [F1, F2, F3, F4, F5];
const darkFlowers = [F1N, F2N, F3N, F4N, F5N];

const cuteMessages = [
  "You bloomed today! 🌸",
  "A beautiful thought planted ✨",
  "Growth in progress 🌱",
  "Your words took root 🌿",
  "Reflection blossomed here 🌺",
  "Seeds of mindfulness 🌼",
  "A moment captured 🌷",
  "Your journey grows 🌹",
];

export default function GrowthGarden({ theme = "light" }) {
  const navigate = useNavigate();
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    fetchJournalDates();
  }, [currentYear, currentMonth, theme]);

  const fetchJournalDates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const yearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

      const res = await fetch(`http://localhost:8000/journal/dates/month/${yearMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const spotArray = theme === "dark" ? NIGHT_FLOWER_SPOTS : DAY_FLOWER_SPOTS;

      const flowersToShow = data.dates.map((entry, i) => {
        const dayIndex = (entry.day - 1) % spotArray.length;
        const spot = spotArray[dayIndex];
        return {
          ...spot,
          flowerType: spot.flowerType || ((entry.day - 1) % 5) + 1,
          date: entry.date,
          day: entry.day,
          mood: entry.mood,
          title: entry.title,
          message: cuteMessages[i % cuteMessages.length],
        };
      });

      setFlowers(flowersToShow);
    } catch (err) {
      console.error("❌ Failed to fetch journal dates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));

  const handleNextMonth = () => {
    const today = new Date();
    if (
      currentYear < today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth < today.getMonth())
    ) {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const isCurrentMonth =
    currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth();

  // 🌸 Flower Component
  const Flower = ({
    x,
    y,
    flowerType,
    size,
    zIndex,
    date,
    day,
    mood,
    title,
    message,
    index,
  }) => {
    const flowerImages = theme === "dark" ? darkFlowers : lightFlowers;
    const img = flowerImages[flowerType - 1];
    const [hovered, setHovered] = useState(false);

    const duration = 2.5 + Math.random() * 1.5;
    const delay = Math.random() * 2;

    return (
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -100%)",
          zIndex: hovered ? 999 : zIndex,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.img
          src={img}
          alt={`flower ${day}`}
          animate={{
            scale: hovered ? 1.15 : 1,
            rotate: [-2, 2, -1.5, 1.5, -2],
            y: [0, -4, 0, -3, 0],
          }}
          transition={{
            scale: { duration: 0.3, ease: "easeOut" },
            rotate: {
              duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay,
            },
            y: {
              duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay,
            },
          }}
          style={{
            width: `${size}px`,
            height: "auto",
            transformOrigin: "bottom center",
            pointerEvents: "auto",
            cursor: "pointer",
            filter: hovered
              ? "drop-shadow(0 4px 12px rgba(122, 145, 108, 0.5))"
              : "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
          }}
        />

        {/* 🪶 Tooltip — no animation now */}
        {hovered && (
          <div
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-3 rounded-xl backdrop-blur-md whitespace-nowrap shadow-xl ${
              theme === "dark"
                ? "bg-slate-800/90 text-amber-100 border border-amber-900/30"
                : "bg-white/90 text-emerald-800 border border-emerald-200"
            }`}
            style={{ zIndex: 1000 }}
          >
            <div className="text-center">
              <div className="font-bold text-lg mb-1">
                {new Date(date).toLocaleDateString("default", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              {title && <div className="text-sm opacity-90 mb-1">{title}</div>}
              {mood && <div className="text-sm opacity-80 mb-1">Mood: {mood}</div>}
              <div className="text-xs opacity-70 italic mt-2">{message}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100 dark:from-slate-900 dark:to-slate-800">
      {/* 🌿 Background */}
      <img
        src={theme === "dark" ? nightGarden : dayGarden}
        alt="garden background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 1, objectPosition: "center 20%" }}
      />

      {/* 🔙 Back Button */}
      <motion.button
        onClick={() => navigate("/")}
        className={`absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all hover:scale-105 ${
          theme === "dark"
            ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80 border border-amber-900/30"
            : "bg-white/70 text-emerald-800 hover:bg-white/90 border border-emerald-200"
        }`}
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </motion.button>

      {/* 🌸 Title + Month Nav */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <button
          onClick={handlePrevMonth}
          className={`p-2 rounded-lg backdrop-blur-md transition-all hover:scale-110 ${
            theme === "dark"
              ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80"
              : "bg-white/70 text-emerald-800 hover:bg-white/90"
          }`}
        >
          <ChevronLeft size={24} />
        </button>

        <h1
          className={`text-4xl font-bold tracking-wide ${
            theme === "dark"
              ? "text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              : "text-emerald-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
          }`}
        >
          {monthName} 🌿
        </h1>

        <button
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
          className={`p-2 rounded-lg backdrop-blur-md transition-all ${
            isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
          } ${
            theme === "dark"
              ? "bg-slate-800/70 text-amber-100 hover:bg-slate-700/80"
              : "bg-white/70 text-emerald-800 hover:bg-white/90"
          }`}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 🌷 Flowers */}
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        {loading ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin border-4 border-emerald-300/30 border-t-emerald-600 rounded-full w-12 h-12"></div>
          </div>
        ) : (
          flowers.map((flower, index) => (
            <Flower key={index} {...flower} index={index} />
          ))
        )}
      </div>

      {/* 🌸 Flower Count */}
      <div
        className={`absolute bottom-8 right-8 px-6 py-3 rounded-full backdrop-blur-md z-20 ${
          theme === "dark"
            ? "bg-slate-800/70 text-amber-100 border border-amber-900/30"
            : "bg-white/70 text-emerald-800 border border-emerald-200"
        }`}
      >
        <span className="text-lg font-semibold">
          🌸 {flowers.length} {flowers.length === 1 ? "Day" : "Days"}
        </span>
      </div>
    </div>
  );
}
