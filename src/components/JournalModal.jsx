// // // import { useEffect, useState } from "react";

// // // export default function JournalModal({ isOpen, onClose, theme, selectedDate }) {
// // //   const [title, setTitle] = useState("");
// // //   const [content, setContent] = useState("");
// // //   const [mood, setMood] = useState("");
// // //   const [prompts, setPrompts] = useState([]);
// // //   const [answers, setAnswers] = useState(["", ""]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [saving, setSaving] = useState(false);
// // //   const [saved, setSaved] = useState(false);
// // //   const [soundEnabled, setSoundEnabled] = useState(
// // //     localStorage.getItem("soundEnabled") === "true"
// // //   );

// // //   useEffect(() => {
// // //     if (!isOpen || !selectedDate) return;
// // //     fetchJournal();
// // //   }, [isOpen, selectedDate]);

// // //   const fetchJournal = async () => {
// // //     setLoading(true);
// // //     const token = localStorage.getItem("token");
// // //     try {
// // //       const res = await fetch(`http://localhost:8000/journal/${selectedDate}`, {
// // //         headers: { Authorization: `Bearer ${token}` },
// // //       });
// // //       const data = await res.json();
// // //       if (data) {
// // //         // ✅ load saved prompts and answers
// // //         setTitle(data.title || "");
// // //         setContent(data.content || "");
// // //         setMood(data.mood || "");
// // //         setPrompts(data.prompts || []);
// // //         setAnswers(data.answers || ["", ""]);
// // //       } else {
// // //         // New date → fetch daily prompts
// // //         fetchPrompts();
// // //       }
// // //     } catch (err) {
// // //       console.error("❌ Failed to load journal:", err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const fetchPrompts = async () => {
// // //     try {
// // //       const res = await fetch("http://localhost:8000/prompts/daily");
// // //       const data = await res.json();
// // //       setPrompts(data.prompts || []);
// // //     } catch {
// // //       setPrompts([
// // //         "What made you smile today?",
// // //         "Describe one thing that gave you peace.",
// // //       ]);
// // //     }
// // //   };

// // //   const handleSave = async () => {
// // //     if (!title.trim() && !content.trim() && !answers[0].trim() && !answers[1].trim())
// // //       return alert("Write something first 💭");

// // //     setSaving(true);
// // //     const token = localStorage.getItem("token");

// // //     try {
// // //       const res = await fetch("http://localhost:8000/journal/add", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //         body: JSON.stringify({
// // //           title,
// // //           content,
// // //           mood,
// // //           answers,
// // //           prompts, // ✅ always save the prompts used that day
// // //           date: selectedDate,
// // //         }),
// // //       });
// // //       await res.json();
// // //       setSaving(false);
// // //       setSaved(true);
// // //       setTimeout(() => setSaved(false), 2000);
// // //     } catch (err) {
// // //       console.error("❌ Failed to save journal:", err);
// // //       alert("Could not save entry. Please try again.");
// // //       setSaving(false);
// // //     }
// // //   };

// // //   const playTypeSound = () => {
// // //     if (!soundEnabled) return;
// // //     const sounds = ["/sounds/type1.mp3", "/sounds/type2.mp3", "/sounds/type3.mp3"];
// // //     const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
// // //     sound.volume = theme === "dark" ? 0.15 : 0.25;
// // //     sound.play();
// // //   };

// // //   const handleSoundToggle = () => {
// // //     const newState = !soundEnabled;
// // //     setSoundEnabled(newState);
// // //     localStorage.setItem("soundEnabled", newState);
// // //   };

// // //   if (!isOpen) return null;

// // //   return (
// // //     <div
// // //       onClick={onClose}
// // //       className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200]"
// // //     >
// // //       <div
// // //         onClick={(e) => e.stopPropagation()}
// // //         className={`relative flex w-[850px] h-[620px] rounded-md overflow-hidden shadow-2xl transition-all duration-500 ${
// // //           theme === "dark"
// // //             ? "bg-[#2b241c] border border-[#3a2e20]"
// // //             : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf]"
// // //         }`}
// // //       >
// // //         {/* Spine */}
// // //         <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] -translate-x-1/2 z-10"></div>

// // //         {/* LEFT PAGE */}
// // //         <div className={`flex-1 p-10 pr-8 border-r overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"}`}>
// // //           <div className="flex justify-between items-center mb-4">
// // //             <div className="text-sm opacity-70">
// // //               {selectedDate ? `📅 ${selectedDate}` : ""}
// // //             </div>
// // //             <div className="flex items-center gap-2 text-sm opacity-70">
// // //               <label>🔊 Sound</label>
// // //               <input
// // //                 type="checkbox"
// // //                 checked={soundEnabled}
// // //                 onChange={handleSoundToggle}
// // //                 className="cursor-pointer accent-[#7A916C]"
// // //               />
// // //             </div>
// // //           </div>

// // //           <h2 className="text-[22px] mb-3 font-semibold">Title</h2>
// // //           <input
// // //             type="text"
// // //             value={title}
// // //             onChange={(e) => {
// // //               setTitle(e.target.value);
// // //               playTypeSound();
// // //             }}
// // //             placeholder="A New Beginning..."
// // //             className="w-full p-2 bg-transparent border-b outline-none"
// // //           />

// // //           <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
// // //           <input
// // //             type="text"
// // //             value={mood}
// // //             onChange={(e) => {
// // //               setMood(e.target.value);
// // //               playTypeSound();
// // //             }}
// // //             placeholder="Peaceful 🌿"
// // //             className="w-full p-2 bg-transparent border-b outline-none"
// // //           />

// // //           <div className="flex justify-end mt-6 mb-4">
// // //             <button
// // //               onClick={handleSave}
// // //               disabled={saving}
// // //               className={`px-5 py-2 rounded-xl font-semibold ${
// // //                 theme === "dark" ? "bg-[#EBDDBF] text-[#2b241c]" : "bg-[#7A916C] text-white"
// // //               }`}
// // //             >
// // //               {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
// // //             </button>
// // //           </div>

// // //           {/* 🌿 Reflection Section */}
// // //           <div className="mt-5">
// // //             <h3 className="text-[18px] font-medium mb-2">Today’s Reflections 🌙</h3>
// // //             {prompts.map((q, i) => (
// // //               <div key={i} className="mb-4">
// // //                 <p className="text-[15px] mb-2 opacity-90">• {q}</p>
// // //                 <textarea
// // //                   value={answers[i] || ""}
// // //                   onChange={(e) => {
// // //                     const newAns = [...answers];
// // //                     newAns[i] = e.target.value;
// // //                     setAnswers(newAns);
// // //                     playTypeSound();
// // //                   }}
// // //                   rows={3}
// // //                   placeholder="Your thoughts..."
// // //                   className={`w-full text-[14px] p-2 rounded-lg border outline-none resize-y ${
// // //                     theme === "dark"
// // //                       ? "bg-[#3a2e20]/50 border-[#EBDDBF]/30 text-[#EBDDBF]"
// // //                       : "bg-white/50 border-[#7A916C]/40 text-[#6c7a5b]"
// // //                   }`}
// // //                 />
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>

// // //         {/* RIGHT PAGE */}
// // //         <div className={`flex-1 p-10 pl-8 overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"}`}>
// // //           <h2 className="text-[22px] mb-3 font-semibold">Your Thoughts</h2>
// // //           {loading ? (
// // //             <p className="opacity-70 text-sm italic">Loading...</p>
// // //           ) : (
// // //             <textarea
// // //               value={content}
// // //               onChange={(e) => {
// // //                 setContent(e.target.value);
// // //                 playTypeSound();
// // //               }}
// // //               placeholder="Write your reflection here..."
// // //               rows={15}
// // //               className="w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed"
// // //             />
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // import { useEffect, useState } from "react";

// // export default function JournalModal({ isOpen, onClose, theme, selectedDate }) {
// //   const [title, setTitle] = useState("");
// //   const [content, setContent] = useState("");
// //   const [mood, setMood] = useState("");
// //   const [prompts, setPrompts] = useState([]);
// //   const [answers, setAnswers] = useState(["", ""]);
// //   const [loading, setLoading] = useState(false);
// //   const [saving, setSaving] = useState(false);
// //   const [saved, setSaved] = useState(false);
// //   const [soundEnabled, setSoundEnabled] = useState(
// //     localStorage.getItem("soundEnabled") === "true"
// //   );

// // useEffect(() => {
// //   if (isOpen && selectedDate) fetchJournal();
// // }, [isOpen, selectedDate]);


// //   // ✅ Fetch journal entry (backend will auto-create prompts if new)
// //   const fetchJournal = async () => {
// //     setLoading(true);
// //     const token = localStorage.getItem("token");
// //     try {
// //       const res = await fetch(`http://localhost:8000/journal/${selectedDate}`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       const data = await res.json();

// //       if (data) {
// //         setTitle(data.title || "");
// //         setContent(data.content || "");
// //         setMood(data.mood || "");
// //         setPrompts(data.prompts || []);
// //         setAnswers(data.answers || ["", ""]);
// //       }
// //     } catch (err) {
// //       console.error("❌ Failed to load journal:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ✅ Save entry
// //   const handleSave = async () => {
// //     if (!title.trim() && !content.trim() && !answers[0].trim() && !answers[1].trim())
// //       return alert("Write something first 💭");

// //     setSaving(true);
// //     const token = localStorage.getItem("token");

// //     try {
// //       const res = await fetch("http://localhost:8000/journal/add", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({
// //           title,
// //           content,
// //           mood,
// //           answers,
// //           prompts,
// //           date: selectedDate,
// //         }),
// //       });
// //       await res.json();
// //       setSaving(false);
// //       setSaved(true);
// //       setTimeout(() => setSaved(false), 2000);
// //     } catch (err) {
// //       console.error("❌ Failed to save journal:", err);
// //       alert("Could not save entry. Please try again.");
// //       setSaving(false);
// //     }
// //   };

// //   // 🎧 Typewriter sound
// //   const playTypeSound = () => {
// //     if (!soundEnabled) return;
// //     const sounds = ["/sounds/type1.mp3", "/sounds/type2.mp3", "/sounds/type3.mp3"];
// //     const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
// //     sound.volume = theme === "dark" ? 0.15 : 0.25;
// //     sound.play();
// //   };

// //   // 🎛 Toggle sound on/off
// //   const handleSoundToggle = () => {
// //     const newState = !soundEnabled;
// //     setSoundEnabled(newState);
// //     localStorage.setItem("soundEnabled", newState);
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <div
// //       onClick={onClose}
// //       className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200]"
// //     >
// //       <div
// //         onClick={(e) => e.stopPropagation()}
// //         className={`relative flex w-[850px] h-[620px] rounded-md overflow-hidden shadow-2xl transition-all duration-500 ${
// //           theme === "dark"
// //             ? "bg-[#2b241c] border border-[#3a2e20]"
// //             : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf]"
// //         }`}
// //       >
// //         {/* Spine */}
// //         <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] -translate-x-1/2 z-10"></div>

// //         {/* LEFT PAGE */}
// //         <div
// //           className={`flex-1 p-10 pr-8 border-r overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${
// //             theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
// //           }`}
// //         >
// //           <div className="flex justify-between items-center mb-4">
// //             <div className="text-sm opacity-70">
// //               {selectedDate ? `📅 ${selectedDate}` : ""}
// //             </div>
// //             <div className="flex items-center gap-2 text-sm opacity-70">
// //               <label>🔊 Sound</label>
// //               <input
// //                 type="checkbox"
// //                 checked={soundEnabled}
// //                 onChange={handleSoundToggle}
// //                 className="cursor-pointer accent-[#7A916C]"
// //               />
// //             </div>
// //           </div>

// //           <h2 className="text-[22px] mb-3 font-semibold">Title</h2>
// //           <input
// //             type="text"
// //             value={title}
// //             onChange={(e) => {
// //               setTitle(e.target.value);
// //               playTypeSound();
// //             }}
// //             placeholder="A New Beginning..."
// //             className="w-full p-2 bg-transparent border-b outline-none"
// //           />

// //           <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
// //           <input
// //             type="text"
// //             value={mood}
// //             onChange={(e) => {
// //               setMood(e.target.value);
// //               playTypeSound();
// //             }}
// //             placeholder="Peaceful 🌿"
// //             className="w-full p-2 bg-transparent border-b outline-none"
// //           />

// //           <div className="flex justify-end mt-6 mb-4">
// //             <button
// //               onClick={handleSave}
// //               disabled={saving}
// //               className={`px-5 py-2 rounded-xl font-semibold ${
// //                 theme === "dark"
// //                   ? "bg-[#EBDDBF] text-[#2b241c]"
// //                   : "bg-[#7A916C] text-white"
// //               }`}
// //             >
// //               {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
// //             </button>
// //           </div>

// //           {/* 🌿 Reflection Section */}
// //           <div className="mt-5">
// //             <h3 className="text-[18px] font-medium mb-2">
// //               Today’s Reflections 🌙
// //             </h3>
// //             {prompts.map((q, i) => (
// //               <div key={i} className="mb-4">
// //                 <p className="text-[15px] mb-2 opacity-90">• {q}</p>
// //                 <textarea
// //                   value={answers[i] || ""}
// //                   onChange={(e) => {
// //                     const newAns = [...answers];
// //                     newAns[i] = e.target.value;
// //                     setAnswers(newAns);
// //                     playTypeSound();
// //                   }}
// //                   rows={3}
// //                   placeholder="Your thoughts..."
// //                   className={`w-full text-[14px] p-2 rounded-lg border outline-none resize-y ${
// //                     theme === "dark"
// //                       ? "bg-[#3a2e20]/50 border-[#EBDDBF]/30 text-[#EBDDBF]"
// //                       : "bg-white/50 border-[#7A916C]/40 text-[#6c7a5b]"
// //                   }`}
// //                 />
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         {/* RIGHT PAGE */}
// //         <div
// //           className={`flex-1 p-10 pl-8 overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${
// //             theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
// //           }`}
// //         >
// //           <h2 className="text-[22px] mb-3 font-semibold">Your Thoughts</h2>
// //           {loading ? (
// //             <p className="opacity-70 text-sm italic">Loading...</p>
// //           ) : (
// //             <textarea
// //               value={content}
// //               onChange={(e) => {
// //                 setContent(e.target.value);
// //                 playTypeSound();
// //               }}
// //               placeholder="Write your reflection here..."
// //               rows={15}
// //               className="w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed"
// //             />
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import { useEffect, useRef, useState } from "react";

// export default function JournalModal({ isOpen, onClose, theme, selectedDate }) {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [mood, setMood] = useState("");
//   const [prompts, setPrompts] = useState([]);
//   const [answers, setAnswers] = useState(["", ""]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   // 🔉 Typing sounds
//   const [soundEnabled, setSoundEnabled] = useState(
//     localStorage.getItem("soundEnabled") === "true"
//   );

//   // 🎵 BGM
//   const [bgmEnabled, setBgmEnabled] = useState(
//     localStorage.getItem("bgmEnabled") === "true"
//   );
//   const [bgmVolume, setBgmVolume] = useState(
//     Number(localStorage.getItem("bgmVolume") ?? 0.3)
//   );

//   const bgmRef = useRef(null);

//   useEffect(() => {
//     if (isOpen && selectedDate) fetchJournal();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, selectedDate]);

//   // --- API ---
//   const fetchJournal = async () => {
//     setLoading(true);
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch(`http://localhost:8000/journal/${selectedDate}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data) {
//         setTitle(data.title || "");
//         setContent(data.content || "");
//         setMood(data.mood || "");
//         setPrompts(data.prompts || []);
//         setAnswers(data.answers || ["", ""]);
//       }
//     } catch (err) {
//       console.error("❌ Failed to load journal:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!title.trim() && !content.trim() && !answers[0]?.trim() && !answers[1]?.trim()) {
//       alert("Write something first 💭");
//       return;
//     }
//     setSaving(true);
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch("http://localhost:8000/journal/add", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           title,
//           content,
//           mood,
//           answers,
//           prompts,
//           date: selectedDate,
//         }),
//       });
//       await res.json();
//       setSaving(false);
//       setSaved(true);
//       setTimeout(() => setSaved(false), 2000);
//     } catch (err) {
//       console.error("❌ Failed to save journal:", err);
//       alert("Could not save entry. Please try again.");
//       setSaving(false);
//     }
//   };

//   // --- Typing sound ---
//   const playTypeSound = () => {
//     if (!soundEnabled) return;
//     const sounds = ["/sounds/type1.mp3", "/sounds/type2.mp3", "/sounds/type3.mp3"];
//     const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
//     sound.volume = theme === "dark" ? 0.12 : 0.18;
//     sound.play().catch(() => {});
//   };

//   const handleSoundToggle = () => {
//     const next = !soundEnabled;
//     setSoundEnabled(next);
//     localStorage.setItem("soundEnabled", String(next));
//   };

//   // --- BGM Management ---
//   const getBgmSrc = () => theme === "dark" ? "/sounds/bgm1.mp3" : "/sounds/bgm2.mp3";

//   // ✅ Start or switch BGM based on theme
//   const startBgm = () => {
//     const newSrc = getBgmSrc();
    
//     // If audio doesn't exist or source changed, create new
//     if (!bgmRef.current || bgmRef.current.src !== window.location.origin + newSrc) {
//       // Stop existing audio if any
//       if (bgmRef.current) {
//         bgmRef.current.pause();
//         bgmRef.current.currentTime = 0;
//       }
      
//       // Create new audio
//       bgmRef.current = new Audio(newSrc);
//       bgmRef.current.loop = true;
//       bgmRef.current.volume = bgmVolume;
      
//       // Play with error handling
//       bgmRef.current.play().catch((err) => {
//         console.log("BGM autoplay blocked:", err);
//         // This is normal - browser blocks autoplay until user interaction
//       });
//     } else if (bgmRef.current.paused) {
//       // Same source, just resume
//       bgmRef.current.play().catch(() => {});
//     }
//   };

//   // ✅ Stop BGM
//   const stopBgm = () => {
//     if (bgmRef.current) {
//       bgmRef.current.pause();
//       bgmRef.current.currentTime = 0;
//     }
//   };

//   // ✅ Handle BGM when modal opens/closes
//   useEffect(() => {
//     if (isOpen && bgmEnabled) {
//       startBgm();
//     } else {
//       stopBgm();
//     }

//     // Cleanup when modal closes
//     return () => {
//       stopBgm();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, bgmEnabled]);

//   // ✅ Switch BGM when theme changes
//   useEffect(() => {
//     if (isOpen && bgmEnabled) {
//       startBgm();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [theme]);

//   // ✅ Update volume in real-time
//   useEffect(() => {
//     localStorage.setItem("bgmVolume", String(bgmVolume));
//     if (bgmRef.current) {
//       bgmRef.current.volume = bgmVolume;
//     }
//   }, [bgmVolume]);

//   // ✅ Toggle BGM on/off
//   const handleBgmToggle = () => {
//     const next = !bgmEnabled;
//     setBgmEnabled(next);
//     localStorage.setItem("bgmEnabled", String(next));
    
//     if (next) {
//       startBgm();
//     } else {
//       stopBgm();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       onClick={onClose}
//       className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200]"
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className={`relative flex w-[850px] h-[620px] rounded-md overflow-hidden shadow-2xl transition-all duration-500 ${
//           theme === "dark"
//             ? "bg-[#2b241c] border border-[#3a2e20]"
//             : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf]"
//         }`}
//       >
//         {/* Spine */}
//         <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] -translate-x-1/2 z-10"></div>

//         {/* LEFT PAGE */}
//         <div
//           className={`flex-1 p-10 pr-8 border-r overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${
//             theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
//           }`}
//         >
//           <div className="flex justify-between items-center mb-4 gap-4">
//             <div className="text-sm opacity-70">
//               {selectedDate ? `📅 ${selectedDate}` : ""}
//             </div>

//             {/* 🎛️ Audio Controls */}
//             <div className="flex items-center gap-4 text-sm opacity-80">
//               {/* Type Sound Toggle */}
//               <label className="flex items-center gap-2 cursor-pointer hover:opacity-100 transition">
//                 <span>Type</span>
//                 <input
//                   type="checkbox"
//                   checked={soundEnabled}
//                   onChange={handleSoundToggle}
//                   className="cursor-pointer accent-[#7A916C]"
//                 />
//               </label>

//               {/* BGM Toggle */}
//               <label className="flex items-center gap-2 cursor-pointer hover:opacity-100 transition">
//                 <span>BGM</span>
//                 <input
//                   type="checkbox"
//                   checked={bgmEnabled}
//                   onChange={handleBgmToggle}
//                   className="cursor-pointer accent-[#7A916C]"
//                 />
//               </label>

//               {/* Volume Slider */}
//               {bgmEnabled && (
//                 <div className="flex items-center gap-2 animate-fadeIn">
//                   <span className="opacity-70">🔉</span>
//                   <input
//                     type="range"
//                     min="0"
//                     max="1"
//                     step="0.05"
//                     value={bgmVolume}
//                     onChange={(e) => setBgmVolume(Number(e.target.value))}
//                     className="w-20 cursor-pointer"
//                     title="BGM volume"
//                   />
//                 </div>
//               )}
//             </div>
//           </div>

//           <h2 className="text-[22px] mb-3 font-semibold">Title</h2>
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => {
//               setTitle(e.target.value);
//               playTypeSound();
//             }}
//             placeholder="A New Beginning..."
//             className="w-full p-2 bg-transparent border-b outline-none"
//           />

//           <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
//           <input
//             type="text"
//             value={mood}
//             onChange={(e) => {
//               setMood(e.target.value);
//               playTypeSound();
//             }}
//             placeholder="Peaceful 🌿"
//             className="w-full p-2 bg-transparent border-b outline-none"
//           />

//           <div className="flex justify-end mt-6 mb-4">
//             <button
//               onClick={handleSave}
//               disabled={saving}
//               className={`px-5 py-2 rounded-xl font-semibold transition-all ${
//                 theme === "dark"
//                   ? "bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90"
//                   : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
//               } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
//             >
//               {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
//             </button>
//           </div>

//           {/* 🌿 Reflection Section */}
//           <div className="mt-5">
//             <h3 className="text-[18px] font-medium mb-2">Today's Reflections 🌙</h3>
//             {prompts.map((q, i) => (
//               <div key={i} className="mb-4">
//                 <p className="text-[15px] mb-2 opacity-90">• {q}</p>
//                 <textarea
//                   value={answers[i] || ""}
//                   onChange={(e) => {
//                     const newAns = [...answers];
//                     newAns[i] = e.target.value;
//                     setAnswers(newAns);
//                     playTypeSound();
//                   }}
//                   rows={3}
//                   placeholder="Your thoughts..."
//                   className={`w-full text-[14px] p-2 rounded-lg border outline-none resize-y ${
//                     theme === "dark"
//                       ? "bg-[#3a2e20]/50 border-[#EBDDBF]/30 text-[#EBDDBF]"
//                       : "bg-white/50 border-[#7A916C]/40 text-[#6c7a5b]"
//                   }`}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* RIGHT PAGE */}
//         <div
//           className={`flex-1 p-10 pl-8 overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${
//             theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
//           }`}
//         >
//           <h2 className="text-[22px] mb-3 font-semibold">Your Thoughts</h2>
//           {loading ? (
//             <p className="opacity-70 text-sm italic">Loading...</p>
//           ) : (
//             <textarea
//               value={content}
//               onChange={(e) => {
//                 setContent(e.target.value);
//                 playTypeSound();
//               }}
//               placeholder="Write your reflection here..."
//               rows={15}
//               className="w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed"
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useRef, useState, useCallback } from "react";
import PictureOfTheDay from "./PictureOfTheDay";
import tornPageCornerRight from "../assets/journalmodal.png";
import tornPageCornerLeft from "../assets/journalmodal1.png";

export default function JournalModal({ isOpen, onClose, theme, selectedDate , user}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // const [mood, setMood] = useState("");
  const [mood, setMood] = useState(0); // default starting mood

  const [prompts, setPrompts] = useState([]);
  const [answers, setAnswers] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 📷 Photo state management
  const [photoURL, setPhotoURL] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const handlePhotoChange = (url, file) => {
    setPhotoURL(url);
    setPhotoFile(file);
  };

  // 🎤 Voice-to-Text
  const [isRecording, setIsRecording] = useState(false);
  const [tempTranscript, setTempTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => console.log("🎙️ Voice recognition started");

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) finalText += transcript + " ";
        else interimText += transcript + " ";
      }

      setTempTranscript(interimText);
      setContent((prev) =>
        prev.endsWith(finalText.trim()) ? prev : `${prev} ${finalText}`.trim()
      );
    };

    recognition.onerror = (e) => {
      console.warn("🎤 Voice recognition error:", e.error);
      recognition.stop();
      setIsRecording(false);
      if (e.error === "not-allowed")
        alert("Please allow microphone permissions to record voice.");
    };

    recognition.onend = () => {
      console.log("🎙️ Voice recognition stopped");
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleVoiceToggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error("🎤 Could not start voice recognition:", err);
      }
    }
  };

  // 🔉 Typing sounds
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") === "true"
  );

  const playTypeSound = () => {
    if (!soundEnabled) return;
    const sounds = ["/sounds/type1.mp3", "/sounds/type2.mp3", "/sounds/type3.mp3"];
    const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
    sound.volume = theme === "dark" ? 0.12 : 0.18;
    sound.play().catch(() => {});
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("soundEnabled", String(next));
  };

  // 🎵 Background Music (BGM)
  const [bgmEnabled, setBgmEnabled] = useState(
    localStorage.getItem("bgmEnabled") === "true"
  );
  const [bgmVolume, setBgmVolume] = useState(
    Number(localStorage.getItem("bgmVolume") ?? 0.3)
  );
  const bgmRef = useRef(null);

  const getBgmSrc = () =>
    theme === "dark" ? "/sounds/bgm1.mp3" : "/sounds/bgm2.mp3";

  const startBgm = useCallback(() => {
    const newSrc = getBgmSrc();
    if (!bgmRef.current || bgmRef.current.src !== window.location.origin + newSrc) {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
      bgmRef.current = new Audio(newSrc);
      bgmRef.current.loop = true;
      bgmRef.current.volume = bgmVolume;
      bgmRef.current.play().catch(() => {});
    } else if (bgmRef.current.paused) {
      bgmRef.current.play().catch(() => {});
    }
  });

  const stopBgm = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (isOpen && bgmEnabled) startBgm();
    else stopBgm();
    return () => stopBgm();
  }, [isOpen, bgmEnabled, startBgm]);

  useEffect(() => {
    if (isOpen && bgmEnabled) startBgm();
  }, [bgmEnabled, isOpen, startBgm, theme]);

  useEffect(() => {
    localStorage.setItem("bgmVolume", String(bgmVolume));
    if (bgmRef.current) bgmRef.current.volume = bgmVolume;
  }, [bgmVolume]);

  const handleBgmToggle = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    localStorage.setItem("bgmEnabled", String(next));
    if (next) startBgm();
    else stopBgm();
  };

  // --- Fetch Journal ---
  const fetchJournal = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/journal/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setMood(data.mood !== undefined && data.mood !== null && data.mood !== "" ? data.mood : 0);
        setPrompts(data.prompts || []);
        setAnswers(data.answers || ["", ""]);
        setPhotoURL(data.photoURL || null);
      }
    } catch (err) {
      console.error("❌ Failed to load journal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedDate) fetchJournal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedDate]);

  // const handleSave = async () => {
  //   if (!title.trim() && !content.trim() && !answers.some(a => a.trim())) {
  //     alert("Write something first 💭");
  //     return;
  //   }
  //   setSaving(true);
  //   const token = localStorage.getItem("token");
    
  //   try {
  //     // Convert photo to base64 if it exists
  //     let photoData = photoURL;
      
  //     if (photoFile) {
  //       try {
  //         const reader = new FileReader();
  //         photoData = await new Promise((resolve, reject) => {
  //           reader.onload = () => resolve(reader.result);
  //           reader.onerror = reject;
  //           reader.readAsDataURL(photoFile);
  //         });
  //       } catch (photoErr) {
  //         console.error("❌ Failed to convert photo:", photoErr);
  //         alert("Failed to process photo. Saving without photo.");
  //         photoData = null;
  //       }
  //     }

  //     const res = await fetch("http://localhost:8000/journal/add", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         title,
  //         content,
  //         mood,
  //         answers,
  //         prompts,
  //         date: selectedDate,
  //         photoURL: photoData,
  //       }),
  //     });
  //     await res.json();
  //     setSaving(false);
  //     setSaved(true);
  //     setTimeout(() => setSaved(false), 2000);
  //   } catch (err) {
  //     console.error("❌ Failed to save journal:", err);
  //     alert("Could not save entry. Please try again.");
  //     setSaving(false);
  //   }
  // };
const handleSave = async () => {
  if (!title.trim() && !content.trim() && !answers.some(a => a.trim())) {
    alert("Write something first 💭");
    return;
  }

  setSaving(true);
  const token = localStorage.getItem("token");

  try {
    // Convert photo to base64
    let photoData = photoURL;
    if (photoFile) {
      photoData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });
    }

    // 1️⃣ Save to your NODE backend
    const res = await fetch("http://localhost:8000/journal/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        mood,
        answers,
        prompts,
        date: selectedDate,
        photoURL: photoData,
      }),
    });

    await res.json();

    // 2️⃣ Sync to RAINDROP analytics backend
    await fetch("http://localhost:8000/raindrop/sync", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    uid: user.uid,
    date: selectedDate,
    title,
    content,
    mood,
    ai_chat: ""
  })
});



    // UI success
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  } catch (err) {
    console.error("❌ Failed to save journal:", err);
    alert("Could not save entry. Please try again.");
    setSaving(false);
  }
};

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200]"
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Book Container with Vintage Paper Texture */}
        <div
          className="relative flex w-[850px] h-[620px] rounded-md overflow-hidden shadow-2xl transition-all duration-500"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #2a2520 0%, #1f1a15 50%, #2a2520 100%)'
              : 'linear-gradient(135deg, #f4ead5 0%, #e8dcc4 48%, #f4ead5 52%, #e8dcc4 100%)',
            boxShadow: theme === 'dark'
              ? '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(139, 115, 85, 0.3)'
              : '0 20px 60px rgba(101, 67, 33, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 0 0 2px rgba(139, 115, 85, 0.2)',
            border: theme === 'dark'
              ? '2px solid rgba(139, 115, 85, 0.4)'
              : '3px solid rgba(139, 115, 85, 0.3)',
          }}
        >
          {/* Parchment texture overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              opacity: theme === 'dark' ? 0.12 : 0.06,
              mixBlendMode: 'multiply',
            }}
          />
          
          {/* Aged paper spots/stains */}
          <div 
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: theme === 'dark'
                ? 'radial-gradient(circle at 20% 30%, rgba(101, 67, 33, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(101, 67, 33, 0.1) 0%, transparent 40%)'
                : 'radial-gradient(circle at 20% 30%, rgba(139, 115, 85, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 115, 85, 0.06) 0%, transparent 40%)',
            }}
          />

          {/* Torn/burnt edge effect */}
          <div 
            className="absolute inset-0 pointer-events-none z-[2]"
            style={{
              background: theme === 'dark'
                ? 'radial-gradient(circle at 3px 3px, transparent 2px, rgba(42, 37, 32, 0.6) 2px)'
                : 'radial-gradient(circle at 3px 3px, transparent 2px, rgba(244, 234, 213, 0.6) 2px)',
              backgroundSize: '6px 6px',
              opacity: 0.4,
              maskImage: 'linear-gradient(to right, black 2%, transparent 3%, transparent 97%, black 98%), linear-gradient(to bottom, black 2%, transparent 3%, transparent 97%, black 98%)',
              maskComposite: 'intersect',
            }}
          />

        {/* Book spine with vintage look */}
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-[6px] -translate-x-1/2 z-10"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.3), rgba(0,0,0,0.5))'
              : 'linear-gradient(to right, rgba(101,67,33,0.4), rgba(101,67,33,0.2), rgba(101,67,33,0.4))',
            boxShadow: theme === 'dark'
              ? '0 0 10px rgba(0,0,0,0.5), inset 0 0 3px rgba(0,0,0,0.8)'
              : '0 0 10px rgba(101,67,33,0.3), inset 0 0 3px rgba(101,67,33,0.4)',
          }}
        />

        {/* LEFT PAGE */}
        <div
          className={`flex-1 p-10 pr-8 border-r overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${
            theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
          }`}
        >
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="text-sm opacity-70">
              {selectedDate ? `📅 ${selectedDate}` : ""}
            </div>

            {/* 🎛️ Audio Controls */}
            <div className="flex items-center gap-4 text-sm opacity-80">
              <label className="flex items-center gap-2 cursor-pointer hover:opacity-100 transition">
                <span>Type</span>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={handleSoundToggle}
                  className="cursor-pointer accent-[#7A916C]"
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:opacity-100 transition">
                <span>BGM</span>
                <input
                  type="checkbox"
                  checked={bgmEnabled}
                  onChange={handleBgmToggle}
                  className="cursor-pointer accent-[#7A916C]"
                />
              </label>

              {bgmEnabled && (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <span className="opacity-70">🔉</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgmVolume}
                    onChange={(e) => setBgmVolume(Number(e.target.value))}
                    className="w-20 cursor-pointer"
                    title="BGM volume"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Title + Mood */}
          <h2 className="text-[22px] mb-3 font-semibold">Title</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              playTypeSound();
            }}
            placeholder="A New Beginning..."
            className="w-full p-2 bg-transparent border-b outline-none"
          />

          {/* <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
          <input
            type="text"
            value={mood}
            onChange={(e) => {
              setMood(e.target.value);
              playTypeSound();
            }}
            placeholder="Peaceful 🌿"
            className="w-full p-2 bg-transparent border-b outline-none"
          /> */}
<h2 className="text-[22px] mb-3 font-semibold">Mood</h2>

<div className="flex items-center gap-4 mb-6">
  {/* Slider */}
  <input
    type="range"
    min="0"
    max="5"
    value={mood}
    onChange={(e) => setMood(Number(e.target.value))}
    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
    style={{
      background: theme === 'dark'
        ? 'linear-gradient(to right, #3a2e20 0%, #EBDDBF 100%)'
        : 'linear-gradient(to right, #E6F0D1 0%, #7A916C 100%)',
      accentColor: theme === 'dark' ? '#EBDDBF' : '#7A916C',
    }}
  />

  {/* Mood Number Display */}
  <span 
    className="text-lg font-semibold min-w-[20px] text-center"
    style={{
      color: theme === 'dark' ? '#EBDDBF' : '#7A916C',
    }}
  >
    {mood}
  </span>
</div>


          {/* Save Button */}
          <div className="flex justify-end mt-6 mb-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                theme === "dark"
                  ? "bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90"
                  : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
              } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
            </button>
          </div>

          {/* Reflection */}
          <div className="mt-5">
            <h3 className="text-[18px] font-medium mb-2">Today's Reflections 🌙</h3>
            {prompts.map((q, i) => (
              <div key={i} className="mb-4">
                <p className="text-[15px] mb-2 opacity-90">• {q}</p>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => {
                    const newAns = [...answers];
                    newAns[i] = e.target.value;
                    setAnswers(newAns);
                    playTypeSound();
                  }}
                  rows={3}
                  placeholder="Your thoughts..."
                  className={`w-full text-[14px] p-2 rounded-lg border outline-none resize-y ${
                    theme === "dark"
                      ? "bg-[#3a2e20]/50 border-[#EBDDBF]/30 text-[#EBDDBF]"
                      : "bg-white/50 border-[#7A916C]/40 text-[#6c7a5b]"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PAGE */}
        <div
          className={`flex-1 p-10 pl-8 overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${
            theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[22px] font-semibold">Your Thoughts</h2>
            <button
              onClick={handleVoiceToggle}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                isRecording
                  ? "bg-red-500/80 text-white animate-pulse"
                  : theme === "dark"
                  ? "bg-[#EBDDBF]/20 text-[#EBDDBF]"
                  : "bg-[#E6F0D1]/70 text-[#6c7a5b]"
              }`}
            >
              {isRecording ? "🎙️ Listening..." : "🎤 Speak"}
            </button>
          </div>

          {loading ? (
            <>
              <p className="opacity-70 text-sm italic">Loading...</p>
              <textarea value={content + tempTranscript} readOnly />
            </>
          ) : (
            <textarea
              value={content + tempTranscript}
              onChange={(e) => {
                setContent(e.target.value);
                playTypeSound();
              }}
              placeholder="Write your reflection here..."
              rows={15}
              className="w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed"
            />
          )}

          </div>
        </div>

        {/* 🎨 Torn Page Corner - Right Bottom */}
        <img 
          src={tornPageCornerRight}
          alt=""
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '200px',
            maxHeight: '200px',
            opacity: theme === 'dark' ? 0.6 : 0.8,
            zIndex: 1,
          }}
        />

        {/* 🎨 Torn Page Corner - Top Left */}
        <img 
          src={tornPageCornerLeft}
          alt=""
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '170px',
            maxHeight: '170px',
            opacity: theme === 'dark' ? 0.6 : 0.8,
            zIndex: 1,
          }}
        />

        {/* 📷 Picture of the Day - Above torn corner with higher z-index */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <PictureOfTheDay
            theme={theme}
            photoURL={photoURL}
            onPhotoChange={handlePhotoChange}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
