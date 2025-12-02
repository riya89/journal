// // // // import { useState, useRef, useEffect } from "react";
// // // // import AIAssistantMessage from "../components/AIAssistantMessage";
// // // // import AIAssistantInput from "../components/AIAssistantInput.jsx";
// // // // import assistantImg from "../assets/assistant.png";

// // // // export default function AIAssistant({ theme }) {
// // // //   const [messages, setMessages] = useState([
// // // //     {
// // // //       sender: "assistant",
// // // //       text: "Hi Riya 🌿 I'm here for you. What's on your mind?",
// // // //     },
// // // //   ]);

// // // //   const chatEndRef = useRef(null);

// // // //   useEffect(() => {
// // // //     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
// // // //   }, [messages]);

// // // //   return (
// // // //     <div
// // // //       className={`w-full h-screen flex flex-col px-5 py-6 transition-all duration-300 ${
// // // //         theme === "dark"
// // // //           ? "bg-[#1c1814] text-[#EBDDBF]"
// // // //           : "bg-[#FFFDF5] text-[#6c7a5b]"
// // // //       }`}
// // // //     >
// // // //       {/* Header */}
// // // //       <div className="text-center mb-3">
// // // //         <h1 className="text-3xl font-semibold">Your Companion</h1>
// // // //         <p className="opacity-70 text-sm mt-1">
// // // //           A gentle space to talk, vent, and feel heard 🫶
// // // //         </p>
// // // //       </div>

// // // //       {/* Assistant Floating Avatar */}
// // // //       <div className="flex justify-start mb-4 ml-3 animate-floatSlow">
// // // //         <img
// // // //           src={assistantImg}
// // // //           alt="assistant"
// // // //           className="w-12 h-12 opacity-90 drop-shadow-md"
// // // //         />
// // // //       </div>

// // // //       {/* Chat Messages */}
// // // //       <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-3">
// // // //         {messages.map((msg, i) => (
// // // //           <AIAssistantMessage key={i} msg={msg} theme={theme} />
// // // //         ))}
// // // //         <div ref={chatEndRef}></div>
// // // //       </div>

// // // //       {/* Input Box */}
// // // //       <AIAssistantInput
// // // //         onSend={(text) =>
// // // //           setMessages((prev) => [...prev, { sender: "user", text }])
// // // //         }
// // // //         theme={theme}
// // // //       />
// // // //     </div>
// // // //   );
// // // // }
// // // import { useEffect, useRef, useState } from "react";
// // // import { useNavigate } from "react-router-dom";

// // // export default function AiAssistant({ theme }) {
// // //   const navigate = useNavigate();

// // //   // Chat
// // //   const [messages, setMessages] = useState([
// // //     { sender: "ai", text: "Hi... I'm here. What's on your mind today?" },
// // //   ]);
// // //   const [input, setInput] = useState("");

// // //   // Speech
// // //   const recognitionRef = useRef(null);
// // //   const [listening, setListening] = useState(false);
// // //   const [aiSpeaking, setAiSpeaking] = useState(false);

// // //   // Particle effect timer
// // //   const [particles, setParticles] = useState([]);

// // //   // 🎙 Auto Speech Recognition Setup
// // //   useEffect(() => {
// // //     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// // //     if (!SR) {
// // //       console.warn("Speech recognition not supported.");
// // //       return;
// // //     }

// // //     const rec = new SR();
// // //     rec.lang = "en-US";
// // //     rec.continuous = false;
// // //     rec.interimResults = false;

// // //     rec.onstart = () => setListening(true);

// // //     rec.onresult = (e) => {
// // //       const text = e.results[0][0].transcript;
// // //       handleUserMessage(text);
// // //     };

// // //     rec.onend = () => {
// // //       setListening(false);
// // //       setTimeout(() => rec.start(), 400); // auto restart
// // //     };

// // //     recognitionRef.current = rec;
// // //   }, []);

// // //   useEffect(() => {
// // //     if (recognitionRef.current) recognitionRef.current.start();
// // //   }, []);

// // //   // ✉ Send User Message
// // //   const handleUserMessage = async (text) => {
// // //     const userMsg = { sender: "user", text };
// // //     setMessages((m) => [...m, userMsg]);
// // //     setInput("");

// // //     const reply = await fetchAiReply(text);
// // //     const aiMsg = { sender: "ai", text: reply };
// // //     setMessages((m) => [...m, aiMsg]);

// // //     speakAi(reply);
// // //   };

// // //   // 🤖 Call Raindrop AI backend (mock endpoint)
// // //   const fetchAiReply = async (userText) => {
// // //     try {
// // //       const res = await fetch("https://journal-6xfj.onrender.com/assistant/reply", {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({ message: userText }),
// // //       });
// // //       const data = await res.json();
// // //       return data.reply;
// // //     } catch {
// // //       return "I’m here with you… tell me more.";
// // //     }
// // //   };

// // //   // 🔊 ElevenLabs Voice Output
// // //   const speakAi = async (text) => {
// // //     setAiSpeaking(true);
// // //     spawnParticles();

// // //     try {
// // //       const res = await fetch("https://journal-6xfj.onrender.com/assistant/speak", {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({ text }),
// // //       });

// // //       const blob = await res.blob();
// // //       const url = URL.createObjectURL(blob);
// // //       const audio = new Audio(url);

// // //       audio.onended = () => {
// // //         setAiSpeaking(false);
// // //       };
// // //       audio.play();
// // //     } catch (e) {
// // //       console.error("Speech error:", e);
// // //       setAiSpeaking(false);
// // //     }
// // //   };

// // //   // 🌟 Orb Particles
// // //   const spawnParticles = () => {
// // //     let id = Math.random();
// // //     setParticles((p) => [...p, id]);
// // //     setTimeout(() => {
// // //       setParticles((p) => p.filter((x) => x !== id));
// // //     }, 1200);
// // //   };

// // //   return (
// // //     <main
// // //       className="min-h-screen w-full flex flex-col items-center justify-between p-6 relative"
// // //       style={{
// // //         background: theme === "dark" ? "#1c1822" : "#faf7ef",
// // //         transition: "0.4s",
// // //       }}
// // //     >
// // //       {/* 🔙 Back Button */}
// // //       <button
// // //         onClick={() => navigate("/")}
// // //         className="absolute top-6 left-6 text-xl px-4 py-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-black/20 hover:bg-white/50 transition"
// // //       >
// // //         ← Home
// // //       </button>

// // //       {/* Chat Section */}
// // //       <div className="w-full max-w-2xl flex-1 overflow-y-auto mb-6 space-y-4 p-4">
// // //         {messages.map((m, i) => (
// // //           <div
// // //             key={i}
// // //             className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
// // //               m.sender === "ai"
// // //                 ? theme === "dark"
// // //                   ? "bg-[#2d2537] text-[#EBDDFB] self-start"
// // //                   : "bg-[#eaf6e8] text-[#5d745f] self-start"
// // //                 : "bg-[#c7e9ff] text-[#1d3b4f] self-end ml-auto"
// // //             }`}
// // //           >
// // //             {m.text}
// // //           </div>
// // //         ))}
// // //       </div>

// // //       {/* 🌌 AI Orb */}
// // //       <div className="relative mb-10">
// // //         <div
// // //           className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
// // //             theme === "dark"
// // //               ? aiSpeaking
// // //                 ? "animate-pulse shadow-[0_0_40px_15px_#d5b4ff]"
// // //                 : "shadow-[0_0_25px_10px_#9a73c9]"
// // //               : aiSpeaking
// // //               ? "animate-pulse shadow-[0_0_40px_15px_#b1f7c7]"
// // //               : "shadow-[0_0_25px_10px_#9debc0]"
// // //           }`}
// // //           style={{
// // //             background:
// // //               theme === "dark"
// // //                 ? "radial-gradient(circle, #c7a8ff, #7e5ab3)"
// // //                 : "radial-gradient(circle, #d3ffe8, #8dd5a5)",
// // //           }}
// // //         ></div>

// // //         {/* Particle effects */}
// // //         {particles.map((id) => (
// // //           <div
// // //             key={id}
// // //             className="absolute w-3 h-3 rounded-full animate-ping"
// // //             style={{
// // //               top: `${60 + Math.random() * 40}px`,
// // //               left: `${60 + Math.random() * 40}px`,
// // //               background:
// // //                 theme === "dark" ? "#e7d1ff" : "#c8ffe2",
// // //             }}
// // //           ></div>
// // //         ))}
// // //       </div>

// // //       {/* Input Box */}
// // //       <div className="w-full max-w-2xl flex gap-3 items-center mb-6">
// // //         <input
// // //           value={input}
// // //           onChange={(e) => setInput(e.target.value)}
// // //           onKeyDown={(e) => e.key === "Enter" && handleUserMessage(input)}
// // //           placeholder="Say something… or type here"
// // //           className={`flex-1 px-4 py-3 rounded-2xl outline-none shadow-inner text-sm ${
// // //             theme === "dark"
// // //               ? "bg-[#2d2537] text-[#EBDDFB]"
// // //               : "bg-white text-[#5d6a57]"
// // //           }`}
// // //         />

// // //         <button
// // //           onClick={() => handleUserMessage(input)}
// // //           className="px-4 py-3 rounded-2xl bg-[#7A916C] text-white hover:bg-[#6a825c] transition"
// // //         >
// // //           Send
// // //         </button>
// // //       </div>
// // //     </main>
// // //   );
// // // }
// // import { useEffect, useRef, useState } from "react";
// // import { useNavigate } from "react-router-dom";

// // // temporary AI reply generator (replace with Raindrop later)
// // const FAKE_AI_REPLY = async () =>
// //   new Promise((res) =>
// //     setTimeout(() => res("I'm here with you. Tell me more… 🌿"), 900)
// //   );

// // export default function AiAssistant({ theme }) {
// //   const navigate = useNavigate();
// //   const [messages, setMessages] = useState([]);
// //   const [input, setInput] = useState("");
// //   const [aiSpeaking, setAiSpeaking] = useState(false);
// //   const [isListening, setIsListening] = useState(false);

// //   const scrollRef = useRef(null);
// //   const recognitionRef = useRef(null);

// //   // ---------------------------------------------------------
// //   // 🎤 Auto-voice start (continuous STT)
// //   // ---------------------------------------------------------
// //   useEffect(() => {
// //     const SpeechRecognition =
// //       window.SpeechRecognition || window.webkitSpeechRecognition;
// //     if (!SpeechRecognition) return;

// //     const rec = new SpeechRecognition();
// //     rec.lang = "en-US";
// //     rec.continuous = true;
// //     rec.interimResults = false;

// //     rec.onstart = () => setIsListening(true);

// //     rec.onresult = (e) => {
// //       const text = e.results[e.resultIndex][0].transcript.trim();
// //       handleUserMessage(text);
// //     };

// //     rec.onerror = () => {
// //       rec.stop();
// //       setIsListening(false);
// //     };

// //     rec.onend = () => {
// //       setIsListening(false);
// //       setTimeout(() => rec.start(), 400);
// //     };

// //     recognitionRef.current = rec;
// //     rec.start();

// //     return () => rec.stop();
// //   }, []);

// //   // ---------------------------------------------------------
// //   // 🤖 Handle user -> AI flow
// //   // ---------------------------------------------------------
// //   const handleUserMessage = async (text) => {
// //     if (!text.trim()) return;

// //     setMessages((m) => [...m, { from: "user", text }]);

// //     const reply = await FAKE_AI_REPLY(text);
// //     setMessages((m) => [...m, { from: "ai", text: reply }]);

// //     speak(reply);
// //   };

// //   // ---------------------------------------------------------
// //   // 🔊 AI voice
// //   // ---------------------------------------------------------
// //   const speak = (text) => {
// //     setAiSpeaking(true);
// //     const u = new SpeechSynthesisUtterance(text);
// //     u.onend = () => setAiSpeaking(false);
// //     speechSynthesis.speak(u);
// //   };

// //   // ---------------------------------------------------------
// //   // 📜 Auto-scroll
// //   // ---------------------------------------------------------
// //   useEffect(() => {
// //     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages]);

// //   // ---------------------------------------------------------
// //   // ✉️ Send button handler
// //   // ---------------------------------------------------------
// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     handleUserMessage(input);
// //     setInput("");
// //   };

// //   return (
// //     <div
// //       className={`min-h-screen flex flex-col ${
// //         theme === "dark"
// //           ? "bg-[#1a1410] text-[#EBDDBF]"
// //           : "bg-[#FFFDF6] text-[#6c7a5b]"
// //       }`}
// //     >
// //       {/* BACK BUTTON */}
// //       <button
// //         onClick={() => navigate("/")}
// //         className="absolute top-5 left-5 bg-white/20 dark:bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm shadow hover:scale-105 transition"
// //       >
// //         ← Home
// //       </button>

// //       {/* ORB */}
// //       <div className="flex flex-col items-center mt-28 mb-5">
// //         <div
// //           className={`w-44 h-44 rounded-full shadow-2xl transition-all duration-500 ${
// //             theme === "dark"
// //               ? aiSpeaking
// //                 ? "shadow-[0_0_40px_20px_#ffcc84]"
// //                 : "shadow-[0_0_25px_10px_#cfa96b]"
// //               : aiSpeaking
// //               ? "shadow-[0_0_40px_20px_#b1f7c7]"
// //               : "shadow-[0_0_25px_10px_#9debc0]"
// //           }`}
// //           style={{
// //             background:
// //               theme === "dark"
// //                 ? "radial-gradient(circle, #ffdca1, #e2a857, #b57624)"
// //                 : "radial-gradient(circle, #d8ffe9, #9de7bb)",
// //           }}
// //         />

// //         <p className="mt-3 text-xs opacity-60">
// //           🎤 {isListening ? "Listening…" : "Starting mic…"}
// //         </p>
// //       </div>

// //       {/* CHAT SECTION */}
// //       <div
// //         className="flex-1 overflow-y-auto px-12 py-6 space-y-4 pb-32"
// //         // ↑ pb-32 ensures last message never hides under input bar
// //       >
// //         {messages.map((m, i) => (
// //   <div
// //     key={i}
// //     className={`max-w-[70%] px-4 py-2 rounded-xl shadow-md text-sm leading-relaxed ${
// //       m.from === "user"
// //         ? theme === "dark"
// //           ? "ml-auto bg-[#444034] text-[#EBDDBF] border border-[#6b5a45]"
// //           : "ml-auto bg-[#7A916C] text-white"
// //         : theme === "dark"
// //         ? "mr-auto bg-[#2b241c] text-[#EBDDBF] border border-[#4a3a2e]"
// //         : "mr-auto bg-white text-[#6c7a5b]"
// //     }`}
// //   >
// //     {m.text}
// //   </div>
// // ))}

// //         <div ref={scrollRef} />
// //       </div>

// //       {/* INPUT BAR (FIXED) */}
// //       <form
// //         onSubmit={handleSubmit}
// //         className={`w-full px-10 py-4 flex items-center gap-3 fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t ${
// //           theme === "dark"
// //             ? "bg-black/30 border-[#3a2e20]"
// //             : "bg-white/70 border-[#e8ecd9]"
// //         }`}
// //       >
// //         {/* INPUT FIELD */}
// //         <input
// //           type="text"
// //           placeholder="Type your feelings… or just speak ✨"
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //           className={`flex-1 p-3 rounded-xl outline-none text-sm shadow-inner ${
// //             theme === "dark"
// //               ? "bg-[#3a2e20] text-[#EBDDBF] placeholder-[#cabfaa]"
// //               : "bg-white text-[#6c7a5b]"
// //           }`}
// //         />

// //         {/* SEND BUTTON */}
// //         <button
// //           type="submit"
// //           className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
// //             theme === "dark"
// //               ? "bg-[#EBDDBF] text-[#2b241c] hover:bg-[#e8d7ba]"
// //               : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
// //           }`}
// //         >
// //           Send
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function AIAssistant({ theme }) {
//   const navigate = useNavigate();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- AUTO SCROLL ---
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // --- TEMPORARY TTS UNTIL ELEVENLABS ---
//   const speak = (text) => {
//     if (!window.speechSynthesis) return;

//     const utter = new SpeechSynthesisUtterance(text);
//     utter.rate = 1.02;
//     utter.pitch = 1;
//     utter.volume = 1;

//     setIsSpeaking(true);
//     utter.onend = () => setIsSpeaking(false);

//     window.speechSynthesis.speak(utter);
//   };

//   // --- SEND MESSAGE ---
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userText = input.trim();
//     setMessages((prev) => [...prev, { sender: "user", text: userText }]);
//     setInput("");

//     // Assistant thinking:
//     setIsSpeaking(true);

//     setTimeout(() => {
//       const reply = "I'm here with you 🌿 I'm listening.";
//       setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      
//       // AI SPEAKS
//       speak(reply);

//     }, 800);
//   };

//   // ENTER KEY
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   return (
//     <div
//       className={`min-h-screen w-full relative flex flex-col items-center pt-20 px-6 transition-all duration-500 ${
//         theme === "dark" ? "bg-[#1a1410] text-[#EBDDBF]" : "bg-[#FFFBEA] text-[#6c7a5b]"
//       }`}
//     >

//       {/* ← BACK BUTTON */}
//       <button
//         onClick={() => navigate("/")}
//         className={`fixed top-6 left-6 px-4 py-2 rounded-xl font-medium shadow-md z-50 ${
//           theme === "dark"
//             ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3b2b]"
//             : "bg-white text-[#6c7a5b] hover:bg-[#f4f0d8]"
//         }`}
//       >
//         ← Home
//       </button>

//       {/* ⭐ CENTER ORB — NOW GLOWING PROPERLY */}
//       <div className="pointer-events-none fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-0">
//         <div
//           className={`w-[260px] h-[260px] rounded-full blur-[40px] ${
//             theme === "dark"
//               ? isSpeaking
//                 ? "bg-[rgba(255,180,90,0.9)] animate-orbPulse"
//                 : "bg-[rgba(255,180,90,0.5)]"
//               : isSpeaking
//               ? "bg-[rgba(180,240,200,0.9)] animate-orbPulse"
//               : "bg-[rgba(180,240,200,0.6)]"
//           }`}
//         ></div>

//         {/* Inner bright core */}
//         <div
//           className={`absolute left-1/2 top-1/2 w-[120px] h-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
//             theme === "dark"
//               ? "bg-[rgba(255,210,120,0.95)]"
//               : "bg-[rgba(210,250,230,0.95)]"
//           }`}
//         ></div>
//       </div>

//       {/* CHAT LIST */}
//       <div
//         className="w-full max-w-3xl flex-1 overflow-y-auto pb-40 px-2 z-10"
//         style={{ marginTop: "40px" }}
//       >
//         {messages.map((msg, i) => (
//           <div key={i} className={`my-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
//             <div
//               className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-md text-[15px] ${
//                 msg.sender === "user"
//                   ? theme === "dark"
//                     ? "bg-[#4a3b2b] text-[#EBDDBF]"
//                     : "bg-[#d8e8c8] text-[#44533a]"
//                   : theme === "dark"
//                   ? "bg-[#2e241b] text-[#EBDDBF]"
//                   : "bg-white text-[#6c7a5b]"
//               }`}
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}
//         <div ref={chatEndRef}></div>
//       </div>

//       {/* INPUT BOX (fixed at bottom) */}
//       <div
//         className={`fixed bottom-0 left-0 w-full flex justify-center pb-6 backdrop-blur-md pt-3 z-20 ${
//           theme === "dark" ? "bg-[#1a1410]/80" : "bg-[#FFFBEA]/80"
//         }`}
//       >
//         <div className="w-full max-w-3xl flex gap-3 px-4">
//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Say what's on your mind..."
//             className={`flex-1 px-4 py-3 rounded-xl shadow-md ${
//               theme === "dark"
//                 ? "bg-[#2e241b] text-[#EBDDBF] placeholder-[#EBDDBF]/40"
//                 : "bg-white text-[#6c7a5b] placeholder-[#6c7a5b]/40"
//             }`}
//           />
//           <button
//             onClick={sendMessage}
//             className={`px-6 py-3 rounded-xl font-semibold shadow-md ${
//               theme === "dark"
//                 ? "bg-[#f4c27c] text-[#2e241b] hover:bg-[#e8b36a]"
//                 : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
//             }`}
//           >
//             Send
//           </button>
//         </div>
//       </div>

//       {/* ORB ANIMATION */}
//       <style>{`
//         @keyframes orbPulse {
//           0%   { transform: scale(1);   opacity: 0.85; }
//           50%  { transform: scale(1.12); opacity: 1; }
//           100% { transform: scale(1);   opacity: 0.85; }
//         }
//         .animate-orbPulse {
//           animation: orbPulse 2.4s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase"; // ⬅️ IMPORTANT: import Firebase
import FloatingParticles from "../components/FloatingParticles";
import FloatingGhosts from "../components/FloatingGhosts";
import Fireflies from "../components/Fireflies";
import { apiPost } from "../utils/api";
import ConversationContext from "../utils/conversationContext";
import HistoryPanel from "../components/HistoryPanel";
import { API_BASE_URL } from "../config/api";
import FollowUpSuggestions from "../components/FollowUpSuggestions";

export default function AIAssistant({ theme }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [contextLoaded, setContextLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const conversationContextRef = useRef(null);

  // 📌 Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📌 Initialize session and load context with daily reset
  useEffect(() => {
    const initializeSession = async () => {
      if (!auth.currentUser) return;

      // Get today's date as a string (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      // Get stored session info
      let sid = sessionStorage.getItem('aiSessionId');
      const lastSessionDate = sessionStorage.getItem('aiSessionDate');
      
      // Check if we need to start a new session (new day)
      if (!sid || lastSessionDate !== today) {
        // Generate new session ID for today
        sid = ConversationContext.generateSessionId();
        sessionStorage.setItem('aiSessionId', sid);
        sessionStorage.setItem('aiSessionDate', today);
        
        console.log('🌅 New day detected - starting fresh conversation');
        console.log('📅 Session date:', today);
      } else {
        console.log('📅 Continuing today\'s conversation');
      }

      setSessionId(sid);

      // Initialize conversation context
      conversationContextRef.current = new ConversationContext(
        sid,
        auth.currentUser.uid
      );

      // Try to load existing context from backend
      try {
        const loadedContext = await ConversationContext.load(
          auth.currentUser.uid,
          sid
        );

        if (loadedContext && loadedContext.getMessageCount() > 0) {
          // Load messages into UI
          const loadedMessages = loadedContext.getAllMessages().map(msg => ({
            sender: msg.role,
            text: msg.content,
            timestamp: msg.timestamp
          }));
          
          setMessages(loadedMessages);
          conversationContextRef.current = loadedContext;
          console.log('📚 Loaded conversation context:', loadedMessages.length, 'messages');
        } else {
          console.log('🆕 Starting new conversation session');
        }
      } catch (error) {
        console.error('Error loading context:', error);
      }

      setContextLoaded(true);
    };

    initializeSession();
  }, []);

  // 🎤 Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("🎤 Listening...");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Heard:", transcript);
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("🎤 Stopped listening");
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 🎤 Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // -------------------------------------------------
  // 🔊 Streaming AI reply with SIMULTANEOUS text and voice
  // -------------------------------------------------
  const sendToBackend = async (userText) => {
    try {
      const token = await auth.currentUser.getIdToken();

      // Add user message to context
      if (conversationContextRef.current) {
        conversationContextRef.current.addMessage('user', userText);
      }

      // Add empty AI message that we'll update
      const aiMessageIndex = messages.length + 1;
      setMessages((prev) => [...prev, { sender: "ai", text: "", streaming: true }]);

      // 1️⃣ Fetch AI text reply WITH CONTEXT
      const replyRes = await apiPost(`${API_BASE_URL}/assistant/reply-with-context`, { 
        message: userText,
        sessionId: sessionId,
        includeHistory: true
      });

      const replyData = await replyRes.json();
      const fullText = replyData.reply || "I'm here with you 🌿";
      
      // Store follow-up suggestions
      if (replyData.followUpSuggestions && replyData.followUpSuggestions.length > 0) {
        setFollowUpSuggestions(replyData.followUpSuggestions);
      } else {
        setFollowUpSuggestions([]);
      }

      // Add AI response to context
      if (conversationContextRef.current) {
        conversationContextRef.current.addMessage('assistant', fullText);
        
        // Persist to Firebase (async, don't wait)
        conversationContextRef.current.persist().catch(err => {
          console.error('Error persisting context:', err);
        });
      }

      // 2️⃣ Start voice generation IMMEDIATELY (parallel with text animation)
      // Don't await - let it run in parallel
      speakStreaming(fullText, token);

      // 3️⃣ Wait 2 seconds for audio to start generating
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 4️⃣ Now animate text word-by-word (should sync with audio)
      const words = fullText.split(' ');
      
      // Show first word
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[aiMessageIndex] = { 
          sender: "ai", 
          text: words[0], 
          streaming: true 
        };
        return newMessages;
      });

      // Then show rest of words
      for (let i = 1; i < words.length; i++) {
        const currentText = words.slice(0, i + 1).join(' ');
        
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[aiMessageIndex] = { 
            sender: "ai", 
            text: currentText, 
            streaming: i < words.length - 1 
          };
          return newMessages;
        });

        // Slower animation to match speech pace - 1100ms per word
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Mark streaming as complete
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[aiMessageIndex] = { sender: "ai", text: fullText, streaming: false };
        return newMessages;
      });

    } catch (e) {
      console.error("Backend error:", e);

      // Fallback to old endpoint if new one fails
      try {
        console.log("🔄 Falling back to old endpoint...");
        const fallbackRes = await apiPost(`${API_BASE_URL}/assistant/reply`, { 
          message: userText 
        });
        const fallbackData = await fallbackRes.json();
        const fallbackText = fallbackData.reply || "I'm here with you 🌿 I'm listening.";

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { sender: "ai", text: fallbackText, streaming: false };
          return newMessages;
        });

        // Add to context
        if (conversationContextRef.current) {
          conversationContextRef.current.addMessage('assistant', fallbackText);
        }

        const token = await auth.currentUser.getIdToken();
        speakStreaming(fallbackText, token);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        
        const fallback = "I'm here with you 🌿 I'm listening.";
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { sender: "ai", text: fallback, streaming: false };
          return newMessages;
        });
        
        const token = await auth.currentUser.getIdToken();
        speakStreaming(fallback, token);
      }
    }
  };

  // -------------------------------------------------
  // 🔈 Michelle TTS with ElevenLabs Fallback
  // -------------------------------------------------
  const speakStreaming = async (text, token) => {
    try {
      setIsSpeaking(true);
      console.log("🔊 Speaking:", text.substring(0, 50));
      
      // Use browser's built-in voice with female voice selection
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = speechSynthesis.getVoices();
      
      // Try to find a good female voice
      const femaleVoice = voices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('Samantha') || 
        v.name.includes('Victoria') ||
        v.name.includes('Karen') ||
        v.name.includes('Moira') ||
        (v.lang.startsWith('en') && v.name.includes('Google') && v.name.includes('US'))
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log("✅ Using voice:", femaleVoice.name);
      }
      
      utterance.rate = 0.85; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        console.log("🔇 Speech finished");
        setIsSpeaking(false);
      };
      
      utterance.onerror = (e) => {
        console.error("❌ Speech error:", e);
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
      
    } catch (err) {
      console.error("❌ Speech failed:", err);
      setIsSpeaking(false);
    }
  };

  // -------------------------------------------------
  // ✉️ Sending Message
  // -------------------------------------------------
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    // Clear follow-up suggestions when user sends a new message
    setFollowUpSuggestions([]);

    // Add user bubble
    setMessages((prev) => [...prev, { sender: "user", text }]);

    // AI thinking → then reply
    await sendToBackend(text);
  };

  // Handle follow-up suggestion selection
  const handleFollowUpSelect = async (suggestion) => {
    // Clear suggestions immediately
    setFollowUpSuggestions([]);
    
    // Add user bubble with the selected suggestion
    setMessages((prev) => [...prev, { sender: "user", text: suggestion }]);

    // Send to backend
    await sendToBackend(suggestion);
  };

  // ENTER key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Load a session from history
  const loadSessionFromHistory = async (session) => {
    try {
      // Clear current session
      sessionStorage.removeItem('aiSessionId');
      sessionStorage.removeItem('aiSessionDate');
      
      // Set the loaded session
      setSessionId(session.sessionId);
      sessionStorage.setItem('aiSessionId', session.sessionId);
      
      // Extract and store date from session ID (format: session_YYYY-MM-DD_...)
      const sessionDate = session.sessionId.split('_')[1]; // Get YYYY-MM-DD part
      if (sessionDate && sessionDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        sessionStorage.setItem('aiSessionDate', sessionDate);
        console.log('📅 Loaded conversation from:', sessionDate);
      }
      
      // Load messages into UI
      const loadedMessages = session.messages.map(msg => ({
        sender: msg.role,
        text: msg.content,
        timestamp: msg.timestamp
      }));
      
      setMessages(loadedMessages);
      
      // Update conversation context
      conversationContextRef.current = new ConversationContext(
        session.sessionId,
        auth.currentUser.uid
      );
      conversationContextRef.current.loadMessages(session.messages);
      
      console.log('📚 Loaded session from history:', session.sessionId);
    } catch (error) {
      console.error('Error loading session from history:', error);
    }
  };

  return (
    <div
      className={`min-h-screen w-full relative flex flex-col items-center transition-all duration-500 ${
        theme === "dark"
          ? "bg-[#1a1410] text-[#EBDDBF]"
          : "bg-[#FFFBEA] text-[#6c7a5b]"
      }`}
    >
      {/* ✨ Floating Particles & Ghosts */}
      <FloatingParticles theme={theme} />
      <FloatingGhosts theme={theme} />
      <Fireflies theme={theme} />

      {/* HEADER BAR */}
      <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${
        theme === "dark"
          ? "bg-[#1a1410]/90 border-[#3a2e20]"
          : "bg-[#FFFBEA]/90 border-[#e8ecd9]"
      }`}>
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Back Button */}
          <button
            onClick={() => navigate("/")}
            className={`px-4 py-2 rounded-xl font-medium shadow-sm transition-all ${
              theme === "dark"
                ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3b2b] font-gothic-body"
                : "bg-white text-[#6c7a5b] hover:bg-[#f4f0d8]"
            }`}
          >
            ← Home
          </button>

          {/* Center: Session Indicator with Date */}
          {contextLoaded && sessionId && (
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm ${
              theme === "dark"
                ? "bg-[#3a2e20]/60 text-[#EBDDBF]/80 font-gothic-body"
                : "bg-white/60 text-[#6c7a5b]/80"
            }`}>
              {/* Date Badge */}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                theme === "dark"
                  ? "bg-[#2b241c] text-[#f4c27c] font-gothic-body"
                  : "bg-[#f4f0d8] text-[#7A916C]"
              }`}>
                <span></span>
                <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              
              {/* Message Count */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  messages.length > 0
                    ? theme === "dark"
                      ? "bg-[#f4c27c]"
                      : "bg-[#7A916C]"
                    : "bg-gray-400"
                }`}></span>
                <span className="font-medium">
                  {messages.length > 0 ? `${messages.length} messages` : 'New conversation'}
                </span>
              </div>
            </div>
          )}

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {contextLoaded && messages.length > 0 && (
              <button
                onClick={() => {
                  // Clear session and start fresh
                  sessionStorage.removeItem('aiSessionId');
                  sessionStorage.removeItem('aiSessionDate');
                  setMessages([]);
                  setSessionId(null);
                  setContextLoaded(false);
                  setFollowUpSuggestions([]);
                  
                  // Reinitialize with new session
                  const today = new Date().toISOString().split('T')[0];
                  const newSid = ConversationContext.generateSessionId();
                  sessionStorage.setItem('aiSessionId', newSid);
                  sessionStorage.setItem('aiSessionDate', today);
                  setSessionId(newSid);
                  conversationContextRef.current = new ConversationContext(
                    newSid,
                    auth.currentUser.uid
                  );
                  setContextLoaded(true);
                  
                  console.log('🆕 Started new conversation');
                }}
                className={`px-4 py-2 rounded-xl font-medium shadow-sm text-sm transition-all ${
                  theme === "dark"
                    ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3b2b] font-gothic-body"
                    : "bg-white text-[#6c7a5b] hover:bg-[#f4f0d8]"
                }`}
                title="Start a new conversation"
              >
                ✨ New Chat
              </button>
            )}
            
            <button
              onClick={() => setShowHistory(true)}
              className={`px-4 py-2 rounded-xl font-medium shadow-sm text-sm transition-all ${
                theme === "dark"
                  ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3b2b] font-gothic-body"
                  : "bg-white text-[#6c7a5b] hover:bg-[#f4f0d8]"
              }`}
              title="View conversation history"
            >
              History
            </button>
          </div>
        </div>
      </div>



      {/* ⭐ ORB - Centered in viewport */}
      <div className="pointer-events-none fixed left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 z-0">
        <div
          className={`w-[260px] h-[260px] rounded-full blur-[40px] transition-all duration-500 ${
            theme === "dark"
              ? isSpeaking
                ? "bg-[rgba(255,180,90,0.9)] animate-orbPulse"
                : "bg-[rgba(255,180,90,0.5)]"
              : isSpeaking
              ? "bg-[rgba(180,240,200,0.9)] animate-orbPulse"
              : "bg-[rgba(180,240,200,0.6)]"
          }`}
        ></div>

        <div
          className={`absolute left-1/2 top-1/2 w-[120px] h-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
            theme === "dark"
              ? "bg-[rgba(255,210,120,0.95)]"
              : "bg-[rgba(210,250,230,0.95)]"
          }`}
        ></div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="w-full max-w-3xl flex-1 overflow-y-auto pb-40 pt-24 px-2 z-10">
        {messages.length === 0 && contextLoaded && (
          <div className={`text-center py-12 opacity-60 ${
            theme === "dark" ? "text-[#EBDDBF] font-gothic-body" : "text-[#6c7a5b]"
          }`}>
            <p className={`text-lg mb-2 ${theme === "dark" ? "font-spooky-header" : ""}`}>✨ Welcome to Echo.</p>
            <p className={`text-sm ${theme === "dark" ? "font-gothic-body" : ""}`}>Let your mind wander; I’ll stay with you.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-3 flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-md text-[15px] transition-all ${
                msg.sender === "user"
                  ? theme === "dark"
                    ? "bg-[#4a3b2b] text-[#EBDDBF] font-gothic-body"
                    : "bg-[#d8e8c8] text-[#44533a]"
                  : theme === "dark"
                  ? "bg-[#2e241b] text-[#EBDDBF] font-gothic-body"
                  : "bg-white text-[#6c7a5b]"
              }`}
            >
              {msg.text}
              {msg.streaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"></span>
              )}
            </div>
          </div>
        ))}
        
        {/* FOLLOW-UP SUGGESTIONS */}
        {followUpSuggestions.length > 0 && (
          <FollowUpSuggestions
            suggestions={followUpSuggestions}
            onSelect={handleFollowUpSelect}
            theme={theme}
          />
        )}
        
        <div ref={chatEndRef}></div>
      </div>

      {/* INPUT AREA */}
      <div
        className={`fixed bottom-0 left-0 w-full flex justify-center pb-6 backdrop-blur-md pt-3 z-20 ${
          theme === "dark" ? "bg-[#1a1410]/80" : "bg-[#FFFBEA]/80"
        }`}
      >
        <div className="w-full max-w-3xl flex gap-3 px-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say what's on your mind..."
            className={`flex-1 px-4 py-3 rounded-xl shadow-md ${
              theme === "dark"
                ? "bg-[#2e241b] text-[#EBDDBF] placeholder-[#EBDDBF]/40 font-gothic-body"
                : "bg-white text-[#6c7a5b] placeholder-[#6c7a5b]/40"
            }`}
          />
          
          {/* Microphone Button */}
          <button
            onClick={toggleVoiceInput}
            className={`px-4 py-3 rounded-xl font-semibold shadow-md transition-all ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : theme === "dark"
                ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3a28] font-gothic-body"
                : "bg-[#E6F0D1] text-[#6c7a5b] hover:bg-[#d8e8c8]"
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? "🔴" : "🎤"}
          </button>

          <button
            onClick={sendMessage}
            className={`px-6 py-3 rounded-xl font-semibold shadow-md ${
              theme === "dark"
                ? "bg-[#f4c27c] text-[#2e241b] hover:bg-[#e8b36a] font-gothic-body"
                : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
            }`}
          >
            Send
          </button>
        </div>
      </div>

      {/* HISTORY PANEL */}
      {showHistory && (
        <HistoryPanel
          theme={theme}
          onClose={() => setShowHistory(false)}
          onLoadSession={loadSessionFromHistory}
        />
      )}

      {/* ORB ANIMATION */}
      <style>{`
        @keyframes orbPulse {
          0%   { transform: scale(1); opacity: 0.85; }
          50%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 0.85; }
        }
        .animate-orbPulse {
          animation: orbPulse 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
