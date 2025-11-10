// // // // // // import { useEffect } from "react";

// // // // // // export default function JournalModal({ isOpen, onClose, theme }) {
// // // // // //   useEffect(() => {
// // // // // //     if (isOpen) document.body.style.overflow = "hidden";
// // // // // //     else document.body.style.overflow = "";
// // // // // //   }, [isOpen]);

// // // // // //   if (!isOpen) return null;

// // // // // //   return (
// // // // // //     <div
// // // // // //       onClick={onClose}
// // // // // //       className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200] animate-fadeIn"
// // // // // //     >
// // // // // //       {/* BOOK CONTAINER */}
// // // // // //       <div
// // // // // //         onClick={(e) => e.stopPropagation()}
// // // // // //         className={`relative flex w-[850px] h-[520px] rounded-md overflow-hidden cursor-default transform scale-[0.95] animate-bookOpen shadow-2xl
// // // // // //           ${
// // // // // //             theme === "dark"
// // // // // //               ? "bg-[#2b241c] border border-[#3a2e20] shadow-[inset_0_0_80px_rgba(0,0,0,0.6),_0_0_50px_rgba(0,0,0,0.8)]"
// // // // // //               : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf] shadow-[0_8px_25px_rgba(63,63,63,0.2)]"
// // // // // //           }`}
// // // // // //       >
// // // // // //         {/* BOOK SPINE */}
// // // // // //         <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] shadow-[0_0_25px_rgba(0,0,0,0.8)] -translate-x-1/2 z-10"></div>

// // // // // //         {/* LEFT PAGE */}
// // // // // //         <div
// // // // // //           className={`flex-1 overflow-y-auto p-10 pr-8 border-r border-[rgba(0,0,0,0.15)] font-['Shantell_Sans'] leading-relaxed
// // // // // //           ${
// // // // // //             theme === "dark"
// // // // // //               ? "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.6)_100%)] text-[#EBDDBF] text-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
// // // // // //               : "bg-transparent text-[#6c7a5b]"
// // // // // //           }`}
// // // // // //         >
// // // // // //           <h2 className="text-[22px] mb-2 tracking-wide font-semibold">
// // // // // //             A New Beginning...
// // // // // //           </h2>
// // // // // //           <p className="text-[16px] whitespace-pre-wrap">
// // // // // //             The morning sun filtered through my window, gently brushing across
// // // // // //             the pages. I held my pen for a while, thinking about where to start
// // // // // //             — every page feels like a new sunrise, a small chance to begin again.
// // // // // //           </p>
// // // // // //         </div>

// // // // // //         {/* RIGHT PAGE */}
// // // // // //         <div
// // // // // //           className={`flex-1 overflow-y-auto p-10 pl-8 font-['Shantell_Sans'] leading-relaxed
// // // // // //           ${
// // // // // //             theme === "dark"
// // // // // //               ? "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.6)_100%)] text-[#EBDDBF]"
// // // // // //               : "bg-transparent text-[#6c7a5b]"
// // // // // //           }`}
// // // // // //         >
// // // // // //           <h2 className="text-[22px] mb-2 tracking-wide font-semibold">
// // // // // //             Reflections
// // // // // //           </h2>
// // // // // //           <p className="text-[16px] whitespace-pre-wrap">
// // // // // //             Each word feels like a quiet promise. The ink settles into the paper
// // // // // //             like roots into soil, and I remember — growth isn’t loud, it’s gentle,
// // // // // //             patient, and deeply personal.
// // // // // //           </p>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }
// // // // // import { useEffect, useState } from "react";

// // // // // export default function JournalModal({ isOpen, onClose, theme }) {
// // // // //   const [title, setTitle] = useState("");
// // // // //   const [content, setContent] = useState("");
// // // // //   const [mood, setMood] = useState("");
// // // // //   const [saving, setSaving] = useState(false);
// // // // //   const [saved, setSaved] = useState(false);

// // // // //   useEffect(() => {
// // // // //     if (isOpen) document.body.style.overflow = "hidden";
// // // // //     else document.body.style.overflow = "";
// // // // //   }, [isOpen]);

// // // // //   if (!isOpen) return null;

// // // // //   // 🪶 Save journal to backend
// // // // //   const handleSave = async () => {
// // // // //     if (!title.trim() || !content.trim()) return alert("Write something first 💭");

// // // // //     setSaving(true);
// // // // //     const token = localStorage.getItem("token");

// // // // //     try {
// // // // //       const res = await fetch("http://localhost:8000/journal/add", {
// // // // //         method: "POST",
// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //           Authorization: `Bearer ${token}`,
// // // // //         },
// // // // //         body: JSON.stringify({
// // // // //           title,
// // // // //           content,
// // // // //           mood,
// // // // //         }),
// // // // //       });

// // // // //       const data = await res.json();
// // // // //       console.log("✅ Journal saved:", data);

// // // // //       setSaving(false);
// // // // //       setSaved(true);
// // // // //       setTimeout(() => {
// // // // //         setSaved(false);
// // // // //         onClose();
// // // // //       }, 1200);
// // // // //     } catch (err) {
// // // // //       console.error("❌ Failed to save journal:", err);
// // // // //       alert("Could not save entry. Please try again.");
// // // // //       setSaving(false);
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div
// // // // //       onClick={onClose}
// // // // //       className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200] animate-fadeIn"
// // // // //     >
// // // // //       {/* BOOK CONTAINER */}
// // // // //       <div
// // // // //         onClick={(e) => e.stopPropagation()}
// // // // //         className={`relative flex w-[850px] h-[520px] rounded-md overflow-hidden cursor-default transform scale-[0.95] animate-bookOpen shadow-2xl transition-all duration-500
// // // // //           ${
// // // // //             theme === "dark"
// // // // //               ? "bg-[#2b241c] border border-[#3a2e20] shadow-[inset_0_0_80px_rgba(0,0,0,0.6),_0_0_50px_rgba(0,0,0,0.8)]"
// // // // //               : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf] shadow-[0_8px_25px_rgba(63,63,63,0.2)]"
// // // // //           }`}
// // // // //       >
// // // // //         {/* BOOK SPINE */}
// // // // //         <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] shadow-[0_0_25px_rgba(0,0,0,0.8)] -translate-x-1/2 z-10"></div>

// // // // //         {/* LEFT PAGE — Title + Mood */}
// // // // //         <div
// // // // //           className={`flex-1 overflow-y-auto p-10 pr-8 border-r border-[rgba(0,0,0,0.15)] font-['Shantell_Sans'] leading-relaxed flex flex-col justify-between
// // // // //           ${
// // // // //             theme === "dark"
// // // // //               ? "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.6)_100%)] text-[#EBDDBF]"
// // // // //               : "bg-transparent text-[#6c7a5b]"
// // // // //           }`}
// // // // //         >
// // // // //           <div>
// // // // //             <h2 className="text-[22px] mb-3 font-semibold">Title</h2>
// // // // //             <input
// // // // //               type="text"
// // // // //               value={title}
// // // // //               onChange={(e) => setTitle(e.target.value)}
// // // // //               placeholder="A New Beginning..."
// // // // //               className={`w-full p-2 text-[16px] bg-transparent outline-none border-b ${
// // // // //                 theme === "dark"
// // // // //                   ? "border-[#EBDDBF]/40 placeholder-[#EBDDBF]/50"
// // // // //                   : "border-[#6c7a5b]/40 placeholder-[#6c7a5b]/60"
// // // // //               }`}
// // // // //             />

// // // // //             <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
// // // // //             <input
// // // // //               type="text"
// // // // //               value={mood}
// // // // //               onChange={(e) => setMood(e.target.value)}
// // // // //               placeholder="Peaceful 🌿"
// // // // //               className={`w-full p-2 text-[16px] bg-transparent outline-none border-b ${
// // // // //                 theme === "dark"
// // // // //                   ? "border-[#EBDDBF]/40 placeholder-[#EBDDBF]/50"
// // // // //                   : "border-[#6c7a5b]/40 placeholder-[#6c7a5b]/60"
// // // // //               }`}
// // // // //             />
// // // // //           </div>

// // // // //           {/* Save Button */}
// // // // //           <div className="flex justify-end mt-6">
// // // // //             <button
// // // // //               onClick={handleSave}
// // // // //               disabled={saving}
// // // // //               className={`px-5 py-2 rounded-xl font-semibold transition-all duration-300 ${
// // // // //                 saving
// // // // //                   ? "opacity-70 cursor-not-allowed"
// // // // //                   : "hover:scale-[1.03] shadow-md"
// // // // //               } ${
// // // // //                 theme === "dark"
// // // // //                   ? "bg-[#EBDDBF] text-[#2b241c]"
// // // // //                   : "bg-[#7A916C] text-white"
// // // // //               }`}
// // // // //             >
// // // // //               {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* RIGHT PAGE — Journal Text */}
// // // // //         <div
// // // // //           className={`flex-1 overflow-y-auto p-10 pl-8 font-['Shantell_Sans'] leading-relaxed
// // // // //           ${
// // // // //             theme === "dark"
// // // // //               ? "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.6)_100%)] text-[#EBDDBF]"
// // // // //               : "bg-transparent text-[#6c7a5b]"
// // // // //           }`}
// // // // //         >
// // // // //           <h2 className="text-[22px] mb-3 font-semibold">Your Thoughts</h2>
// // // // //           <textarea
// // // // //             value={content}
// // // // //             onChange={(e) => setContent(e.target.value)}
// // // // //             placeholder="Write your reflection here..."
// // // // //             rows={13}
// // // // //             className={`w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed ${
// // // // //               theme === "dark"
// // // // //                 ? "placeholder-[#EBDDBF]/50"
// // // // //                 : "placeholder-[#6c7a5b]/60"
// // // // //             }`}
// // // // //           />
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // import { useEffect, useState } from "react";

// // // // export default function JournalModal({ isOpen, onClose, theme, selectedDate }) {
// // // //   const [title, setTitle] = useState("");
// // // //   const [content, setContent] = useState("");
// // // //   const [mood, setMood] = useState("");
// // // //   const [saving, setSaving] = useState(false);
// // // //   const [saved, setSaved] = useState(false);

// // // //   useEffect(() => {
// // // //     if (isOpen) document.body.style.overflow = "hidden";
// // // //     else document.body.style.overflow = "";
// // // //   }, [isOpen]);

// // // //   if (!isOpen) return null;

// // // //   const handleSave = async () => {
// // // //     if (!title.trim() || !content.trim()) return alert("Write something first 💭");

// // // //     setSaving(true);
// // // //     const token = localStorage.getItem("token");

// // // //     try {
// // // //       const res = await fetch("http://localhost:8000/journal/add", {
// // // //         method: "POST",
// // // //         headers: {
// // // //           "Content-Type": "application/json",
// // // //           Authorization: `Bearer ${token}`,
// // // //         },
// // // //         body: JSON.stringify({
// // // //           title,
// // // //           content,
// // // //           mood,
// // // //           date: selectedDate, // ✅ date-linked entry
// // // //         }),
// // // //       });

// // // //       const data = await res.json();
// // // //       console.log("✅ Journal saved:", data);

// // // //       setSaving(false);
// // // //       setSaved(true);
// // // //       setTimeout(() => {
// // // //         setSaved(false);
// // // //         onClose();
// // // //       }, 1200);
// // // //     } catch (err) {
// // // //       console.error("❌ Failed to save journal:", err);
// // // //       alert("Could not save entry. Please try again.");
// // // //       setSaving(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div
// // // //       onClick={onClose}
// // // //       className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200] animate-fadeIn"
// // // //     >
// // // //       <div
// // // //         onClick={(e) => e.stopPropagation()}
// // // //         className={`relative flex w-[850px] h-[520px] rounded-md overflow-hidden cursor-default transform scale-[0.95] animate-bookOpen shadow-2xl transition-all duration-500 ${
// // // //           theme === "dark"
// // // //             ? "bg-[#2b241c] border border-[#3a2e20]"
// // // //             : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf]"
// // // //         }`}
// // // //       >
// // // //         <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] -translate-x-1/2 z-10"></div>

// // // //         {/* LEFT PAGE */}
// // // //         <div
// // // //           className={`flex-1 overflow-y-auto p-10 pr-8 border-r font-['Shantell_Sans'] leading-relaxed ${
// // // //             theme === "dark"
// // // //               ? "text-[#EBDDBF]"
// // // //               : "text-[#6c7a5b]"
// // // //           }`}
// // // //         >
// // // //           <h2 className="text-[22px] mb-3 font-semibold">Title</h2>
// // // //           <input
// // // //             type="text"
// // // //             value={title}
// // // //             onChange={(e) => setTitle(e.target.value)}
// // // //             placeholder="A New Beginning..."
// // // //             className="w-full p-2 bg-transparent border-b outline-none"
// // // //           />

// // // //           <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
// // // //           <input
// // // //             type="text"
// // // //             value={mood}
// // // //             onChange={(e) => setMood(e.target.value)}
// // // //             placeholder="Peaceful 🌿"
// // // //             className="w-full p-2 bg-transparent border-b outline-none"
// // // //           />

// // // //           <div className="flex justify-end mt-6">
// // // //             <button
// // // //               onClick={handleSave}
// // // //               disabled={saving}
// // // //               className={`px-5 py-2 rounded-xl font-semibold ${
// // // //                 theme === "dark"
// // // //                   ? "bg-[#EBDDBF] text-[#2b241c]"
// // // //                   : "bg-[#7A916C] text-white"
// // // //               }`}
// // // //             >
// // // //               {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
// // // //             </button>
// // // //           </div>
// // // //         </div>

// // // //         {/* RIGHT PAGE */}
// // // //         <div className={`flex-1 overflow-y-auto p-10 pl-8 font-['Shantell_Sans']`}>
// // // //           <h2 className="text-[22px] mb-3 font-semibold">Your Thoughts</h2>
// // // //           <textarea
// // // //             value={content}
// // // //             onChange={(e) => setContent(e.target.value)}
// // // //             placeholder="Write your reflection here..."
// // // //             rows={13}
// // // //             className="w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed"
// // // //           />
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // import { useEffect, useState } from "react";

// // // export default function JournalModal({ isOpen, onClose, theme, selectedDate }) {
// // //   const [title, setTitle] = useState("");
// // //   const [content, setContent] = useState("");
// // //   const [mood, setMood] = useState("");
// // //   const [loading, setLoading] = useState(false);
// // //   const [saving, setSaving] = useState(false);
// // //   const [saved, setSaved] = useState(false);

// // //   // Fetch existing journal when opened
// // //   useEffect(() => {
// // //     if (!isOpen || !selectedDate) return;

// // //     const fetchJournal = async () => {
// // //       setLoading(true);
// // //       const token = localStorage.getItem("token");

// // //       try {
// // //         const res = await fetch(`http://localhost:8000/journal/${selectedDate}`, {
// // //           headers: { Authorization: `Bearer ${token}` },
// // //         });
// // //         const data = await res.json();

// // //         if (data) {
// // //           setTitle(data.title || "");
// // //           setContent(data.content || "");
// // //           setMood(data.mood || "");
// // //         } else {
// // //           setTitle("");
// // //           setContent("");
// // //           setMood("");
// // //         }
// // //       } catch (err) {
// // //         console.error("❌ Failed to load journal:", err);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchJournal();
// // //   }, [isOpen, selectedDate]);

// // //   // Handle save (no auto-close)
// // //   const handleSave = async () => {
// // //     if (!title.trim() && !content.trim()) return alert("Write something first 💭");

// // //     setSaving(true);
// // //     const token = localStorage.getItem("token");

// // //     try {
// // //       const res = await fetch("http://localhost:8000/journal/add", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //         body: JSON.stringify({ title, content, mood, date: selectedDate }),
// // //       });

// // //       const data = await res.json();
// // //       console.log("✅ Journal saved:", data);

// // //       setSaving(false);
// // //       setSaved(true);
// // //       setTimeout(() => setSaved(false), 2000);
// // //     } catch (err) {
// // //       console.error("❌ Failed to save journal:", err);
// // //       alert("Could not save entry. Please try again.");
// // //       setSaving(false);
// // //     }
// // //   };

// // //   if (!isOpen) return null;

// // //   return (
// // //     <div
// // //       onClick={onClose}
// // //       className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200] animate-fadeIn"
// // //     >
// // //       <div
// // //         onClick={(e) => e.stopPropagation()}
// // //         className={`relative flex w-[850px] h-[520px] rounded-md overflow-hidden cursor-default transform scale-[0.95] animate-bookOpen shadow-2xl transition-all duration-500 ${
// // //           theme === "dark"
// // //             ? "bg-[#2b241c] border border-[#3a2e20]"
// // //             : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf]"
// // //         }`}
// // //       >
// // //         {/* BOOK SPINE */}
// // //         <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] -translate-x-1/2 z-10"></div>

// // //         {/* LEFT PAGE */}
// // //         <div
// // //           className={`flex-1 overflow-y-auto p-10 pr-8 border-r font-['Shantell_Sans'] leading-relaxed ${
// // //             theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
// // //           }`}
// // //         >
// // //           <h2 className="text-[22px] mb-3 font-semibold">Title</h2>
// // //           <input
// // //             type="text"
// // //             value={title}
// // //             onChange={(e) => setTitle(e.target.value)}
// // //             placeholder="A New Beginning..."
// // //             className="w-full p-2 bg-transparent border-b outline-none"
// // //           />

// // //           <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
// // //           <input
// // //             type="text"
// // //             value={mood}
// // //             onChange={(e) => setMood(e.target.value)}
// // //             placeholder="Peaceful 🌿"
// // //             className="w-full p-2 bg-transparent border-b outline-none"
// // //           />

// // //           <div className="flex justify-between items-center mt-6">
// // //             <div className="text-sm opacity-70">
// // //               {selectedDate ? `📅 ${selectedDate}` : ""}
// // //             </div>
// // //             <button
// // //               onClick={handleSave}
// // //               disabled={saving}
// // //               className={`px-5 py-2 rounded-xl font-semibold ${
// // //                 theme === "dark"
// // //                   ? "bg-[#EBDDBF] text-[#2b241c]"
// // //                   : "bg-[#7A916C] text-white"
// // //               }`}
// // //             >
// // //               {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
// // //             </button>
// // //           </div>
// // //         </div>

// // //         {/* RIGHT PAGE */}
// // //         <div
// // //           className={`flex-1 overflow-y-auto p-10 pl-8 font-['Shantell_Sans'] leading-relaxed ${
// // //             theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
// // //           }`}
// // //         >
// // //           <h2 className="text-[22px] mb-3 font-semibold">Your Thoughts</h2>
// // //           {loading ? (
// // //             <p className="opacity-70 text-sm italic">Loading...</p>
// // //           ) : (
// // //             <textarea
// // //               value={content}
// // //               onChange={(e) => setContent(e.target.value)}
// // //               placeholder="Write your reflection here..."
// // //               rows={13}
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

// //   const today = new Date().toISOString().slice(0, 10);
// //   const isEditable = selectedDate === today;

// //   useEffect(() => {
// //     if (!isOpen || !selectedDate) return;
// //     fetchJournal();
// //   }, [isOpen, selectedDate]);

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
// //         setAnswers(data.answers || ["", ""]);
// //         setPrompts(data.prompts || []);
// //       } else {
// //         // only fetch prompts if new entry
// //         fetchPrompts();
// //       }
// //     } catch (err) {
// //       console.error("❌ Failed to load journal:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchPrompts = async () => {
// //     try {
// //       const res = await fetch("http://localhost:8000/prompts/daily");
// //       const data = await res.json();
// //       setPrompts(data.prompts || []);
// //     } catch {
// //       setPrompts([
// //         "What made you smile today?",
// //         "Describe one thing that gave you peace.",
// //       ]);
// //     }
// //   };

// //   const handleSave = async () => {
// //     if (!isEditable) return alert("You can only write for today 🌿");
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
// //           prompts, // ✅ Save the prompts shown that day
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

// //   const playTypeSound = () => {
// //     if (!soundEnabled) return;
// //     const sounds = ["/sounds/type1.mp3", "/sounds/type2.mp3", "/sounds/type3.mp3"];
// //     const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
// //     sound.volume = theme === "dark" ? 0.15 : 0.25;
// //     sound.play();
// //   };

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
// //         {/* Book spine */}
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
// //             disabled={!isEditable}
// //             placeholder="A New Beginning..."
// //             className={`w-full p-2 bg-transparent border-b outline-none ${
// //               !isEditable ? "opacity-60 cursor-not-allowed" : ""
// //             }`}
// //           />

// //           <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
// //           <input
// //             type="text"
// //             value={mood}
// //             onChange={(e) => {
// //               setMood(e.target.value);
// //               playTypeSound();
// //             }}
// //             disabled={!isEditable}
// //             placeholder="Peaceful 🌿"
// //             className={`w-full p-2 bg-transparent border-b outline-none ${
// //               !isEditable ? "opacity-60 cursor-not-allowed" : ""
// //             }`}
// //           />

// //           <div className="flex justify-end mt-6 mb-4">
// //             <button
// //               onClick={handleSave}
// //               disabled={saving || !isEditable}
// //               className={`px-5 py-2 rounded-xl font-semibold ${
// //                 theme === "dark" ? "bg-[#EBDDBF] text-[#2b241c]" : "bg-[#7A916C] text-white"
// //               } ${!isEditable ? "opacity-50 cursor-not-allowed" : ""}`}
// //             >
// //               {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
// //             </button>
// //           </div>

// //           {/* 🌿 Daily Questions */}
// //           <div className="mt-5">
// //             <h3 className="text-[18px] font-medium mb-2">Today’s Reflections 🌙</h3>
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
// //                   disabled={!isEditable}
// //                   rows={3}
// //                   placeholder="Your thoughts..."
// //                   className={`w-full text-[14px] p-2 rounded-lg border outline-none resize-y ${
// //                     theme === "dark"
// //                       ? "bg-[#3a2e20]/50 border-[#EBDDBF]/30 text-[#EBDDBF]"
// //                       : "bg-white/50 border-[#7A916C]/40 text-[#6c7a5b]"
// //                   } ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}
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
// //               disabled={!isEditable}
// //               placeholder="Write your reflection here..."
// //               rows={15}
// //               className={`w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed ${
// //                 !isEditable ? "opacity-60 cursor-not-allowed" : ""
// //               }`}
// //             />
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import { useEffect, useState } from "react";

// export default function JournalModal({ isOpen, onClose, theme, selectedDate }) {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [mood, setMood] = useState("");
//   const [prompts, setPrompts] = useState([]);
//   const [answers, setAnswers] = useState(["", ""]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(
//     localStorage.getItem("soundEnabled") === "true"
//   );

//   useEffect(() => {
//     if (!isOpen || !selectedDate) return;
//     fetchJournal();
//   }, [isOpen, selectedDate]);

//   const fetchJournal = async () => {
//     setLoading(true);
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch(`http://localhost:8000/journal/${selectedDate}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data) {
//         // ✅ load saved prompts and answers
//         setTitle(data.title || "");
//         setContent(data.content || "");
//         setMood(data.mood || "");
//         setPrompts(data.prompts || []);
//         setAnswers(data.answers || ["", ""]);
//       } else {
//         // New date → fetch daily prompts
//         fetchPrompts();
//       }
//     } catch (err) {
//       console.error("❌ Failed to load journal:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPrompts = async () => {
//     try {
//       const res = await fetch("http://localhost:8000/prompts/daily");
//       const data = await res.json();
//       setPrompts(data.prompts || []);
//     } catch {
//       setPrompts([
//         "What made you smile today?",
//         "Describe one thing that gave you peace.",
//       ]);
//     }
//   };

//   const handleSave = async () => {
//     if (!title.trim() && !content.trim() && !answers[0].trim() && !answers[1].trim())
//       return alert("Write something first 💭");

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
//           prompts, // ✅ always save the prompts used that day
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

//   const playTypeSound = () => {
//     if (!soundEnabled) return;
//     const sounds = ["/sounds/type1.mp3", "/sounds/type2.mp3", "/sounds/type3.mp3"];
//     const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
//     sound.volume = theme === "dark" ? 0.15 : 0.25;
//     sound.play();
//   };

//   const handleSoundToggle = () => {
//     const newState = !soundEnabled;
//     setSoundEnabled(newState);
//     localStorage.setItem("soundEnabled", newState);
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
//         <div className={`flex-1 p-10 pr-8 border-r overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"}`}>
//           <div className="flex justify-between items-center mb-4">
//             <div className="text-sm opacity-70">
//               {selectedDate ? `📅 ${selectedDate}` : ""}
//             </div>
//             <div className="flex items-center gap-2 text-sm opacity-70">
//               <label>🔊 Sound</label>
//               <input
//                 type="checkbox"
//                 checked={soundEnabled}
//                 onChange={handleSoundToggle}
//                 className="cursor-pointer accent-[#7A916C]"
//               />
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
//               className={`px-5 py-2 rounded-xl font-semibold ${
//                 theme === "dark" ? "bg-[#EBDDBF] text-[#2b241c]" : "bg-[#7A916C] text-white"
//               }`}
//             >
//               {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
//             </button>
//           </div>

//           {/* 🌿 Reflection Section */}
//           <div className="mt-5">
//             <h3 className="text-[18px] font-medium mb-2">Today’s Reflections 🌙</h3>
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
//         <div className={`flex-1 p-10 pl-8 overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"}`}>
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
import { useEffect, useState } from "react";

export default function JournalModal({ isOpen, onClose, theme, selectedDate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [answers, setAnswers] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") === "true"
  );

  useEffect(() => {
    if (!isOpen || !selectedDate) return;
    fetchJournal();
  }, [isOpen, selectedDate]);

  // ✅ Fetch journal entry (backend will auto-create prompts if new)
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
        setMood(data.mood || "");
        setPrompts(data.prompts || []);
        setAnswers(data.answers || ["", ""]);
      }
    } catch (err) {
      console.error("❌ Failed to load journal:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save entry
  const handleSave = async () => {
    if (!title.trim() && !content.trim() && !answers[0].trim() && !answers[1].trim())
      return alert("Write something first 💭");

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
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
        }),
      });
      await res.json();
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("❌ Failed to save journal:", err);
      alert("Could not save entry. Please try again.");
      setSaving(false);
    }
  };

  // 🎧 Typewriter sound
  const playTypeSound = () => {
    if (!soundEnabled) return;
    const sounds = ["/sounds/type1.mp3", "/sounds/type2.mp3", "/sounds/type3.mp3"];
    const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
    sound.volume = theme === "dark" ? 0.15 : 0.25;
    sound.play();
  };

  // 🎛 Toggle sound on/off
  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem("soundEnabled", newState);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-[850px] h-[620px] rounded-md overflow-hidden shadow-2xl transition-all duration-500 ${
          theme === "dark"
            ? "bg-[#2b241c] border border-[#3a2e20]"
            : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf]"
        }`}
      >
        {/* Spine */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] -translate-x-1/2 z-10"></div>

        {/* LEFT PAGE */}
        <div
          className={`flex-1 p-10 pr-8 border-r overflow-y-auto font-['Shantell_Sans'] leading-relaxed ${
            theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm opacity-70">
              {selectedDate ? `📅 ${selectedDate}` : ""}
            </div>
            <div className="flex items-center gap-2 text-sm opacity-70">
              <label>🔊 Sound</label>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={handleSoundToggle}
                className="cursor-pointer accent-[#7A916C]"
              />
            </div>
          </div>

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

          <h2 className="text-[22px] mt-8 mb-3 font-semibold">Mood</h2>
          <input
            type="text"
            value={mood}
            onChange={(e) => {
              setMood(e.target.value);
              playTypeSound();
            }}
            placeholder="Peaceful 🌿"
            className="w-full p-2 bg-transparent border-b outline-none"
          />

          <div className="flex justify-end mt-6 mb-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-5 py-2 rounded-xl font-semibold ${
                theme === "dark"
                  ? "bg-[#EBDDBF] text-[#2b241c]"
                  : "bg-[#7A916C] text-white"
              }`}
            >
              {saving ? "Saving..." : saved ? "Saved ✅" : "Save Entry"}
            </button>
          </div>

          {/* 🌿 Reflection Section */}
          <div className="mt-5">
            <h3 className="text-[18px] font-medium mb-2">
              Today’s Reflections 🌙
            </h3>
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
          <h2 className="text-[22px] mb-3 font-semibold">Your Thoughts</h2>
          {loading ? (
            <p className="opacity-70 text-sm italic">Loading...</p>
          ) : (
            <textarea
              value={content}
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
    </div>
  );
}
