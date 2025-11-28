// // // // import express from "express";
// // // // import { db, auth } from "../firebase.js";

// // // // const router = express.Router();

// // // // // Middleware to verify token
// // // // async function verifyToken(req, res, next) {
// // // //   try {
// // // //     const token = req.headers.authorization?.split(" ")[1];
// // // //     const decoded = await auth.verifyIdToken(token);
// // // //     req.uid = decoded.uid;
// // // //     next();
// // // //   } catch {
// // // //     res.status(401).json({ error: "Unauthorized" });
// // // //   }
// // // // }

// // // // // Save journal entry
// // // // router.post("/add", verifyToken, async (req, res) => {
// // // //   const { title, content, mood } = req.body;
// // // //   const entry = { title, content, mood, createdAt: new Date() };
// // // //   await db.collection("users").doc(req.uid).collection("journals").add(entry);
// // // //   res.json({ message: "Journal saved successfully ✅" });
// // // // });

// // // // // Fetch user’s journal entries
// // // // router.get("/list", verifyToken, async (req, res) => {
// // // //   const snapshot = await db.collection("users").doc(req.uid).collection("journals").get();
// // // //   const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// // // //   res.json(entries);
// // // // });

// // // // export default router;
// // // import express from "express";
// // // import { db, auth } from "../firebase.js";

// // // const router = express.Router();

// // // // Middleware to verify token
// // // async function verifyToken(req, res, next) {
// // //   try {
// // //     const token = req.headers.authorization?.split(" ")[1];
// // //     const decoded = await auth.verifyIdToken(token);
// // //     req.uid = decoded.uid;
// // //     next();
// // //   } catch {
// // //     res.status(401).json({ error: "Unauthorized" });
// // //   }
// // // }

// // // // ✅ Save or update a journal entry (by date)
// // // router.post("/add", verifyToken, async (req, res) => {
// // //   const { title, content, mood, date } = req.body;
// // //   if (!date) return res.status(400).json({ error: "Missing date field" });

// // //   try {
// // //     const userRef = db.collection("users").doc(req.uid);
// // //     const journalRef = userRef.collection("journals").doc(date);

// // //     await journalRef.set({
// // //       title,
// // //       content,
// // //       mood,
// // //       date,
// // //       updatedAt: new Date(),
// // //     });

// // //     res.json({ message: "Journal saved successfully ✅", date });
// // //   } catch (err) {
// // //     console.error("Error saving journal:", err);
// // //     res.status(500).json({ error: "Failed to save journal" });
// // //   }
// // // });

// // // // ✅ Fetch journal entry for a specific date
// // // router.get("/:date", verifyToken, async (req, res) => {
// // //   try {
// // //     const { date } = req.params;
// // //     const doc = await db
// // //       .collection("users")
// // //       .doc(req.uid)
// // //       .collection("journals")
// // //       .doc(date)
// // //       .get();

// // //     if (!doc.exists) return res.json(null);
// // //     res.json(doc.data());
// // //   } catch (err) {
// // //     console.error("Error fetching journal:", err);
// // //     res.status(500).json({ error: "Failed to fetch journal" });
// // //   }
// // // });
// // // // Save or update journal entry (by date)
// // // router.post("/add", verifyToken, async (req, res) => {
// // //   const { title, content, mood, date, prompts = [], answers = [] } = req.body;
// // //   if (!date) return res.status(400).json({ error: "Missing date field" });

// // //   try {
// // //     const userRef = db.collection("users").doc(req.uid);
// // //     const journalRef = userRef.collection("journals").doc(date);

// // //     await journalRef.set({
// // //       title,
// // //       content,
// // //       mood,
// // //       date,
// // //       prompts,     // ✅ store daily reflection questions
// // //       answers,     // ✅ store user's responses
// // //       updatedAt: new Date(),
// // //     });

// // //     res.json({ message: "Journal saved successfully ✅", date });
// // //   } catch (err) {
// // //     console.error("Error saving journal:", err);
// // //     res.status(500).json({ error: "Failed to save journal" });
// // //   }
// // // });

// // // export default router;
// // import express from "express";
// // import { db, auth } from "../firebase.js";
// // import fetch from "node-fetch";

// // const router = express.Router();

// // // 🔐 Middleware: verify Firebase ID token
// // async function verifyToken(req, res, next) {
// //   try {
// //     const token = req.headers.authorization?.split(" ")[1];
// //     const decoded = await auth.verifyIdToken(token);
// //     req.uid = decoded.uid;
// //     next();
// //   } catch {
// //     res.status(401).json({ error: "Unauthorized" });
// //   }
// // }

// // // 🎯 Fallback reflection prompts
// // const fallbackPrompts = [
// //   "What made you smile today?",
// //   "What’s one thing you’re grateful for?",
// //   "Describe your day in a color or texture.",
// //   "What small act of kindness did you notice?",
// //   "If your mood were weather, what would it be?",
// // ];

// // // 🧠 Helper: fetch today's reflection questions (cached in Firestore)
// // async function getDailyPrompts() {
// //   const dateKey = new Date().toISOString().slice(0, 10);
// //   const promptRef = db.collection("dailyPrompts").doc(dateKey);
// //   const existingDoc = await promptRef.get();

// //   if (existingDoc.exists) {
// //     return existingDoc.data().prompts;
// //   }

// //   let prompts = [];
// //   try {
// //     const response = await fetch(
// //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
// //       {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           contents: [
// //             {
// //               parts: [
// //                 {
// //                   text: "Generate 2 short comforting self-reflection prompts for journaling. Each should sound natural, emotional, and under 15 words.",
// //                 },
// //               ],
// //             },
// //           ],
// //         }),
// //       }
// //     );

// //     const data = await response.json();
// //     prompts =
// //       data?.candidates?.[0]?.content?.parts?.map((p) => p.text.trim()) ||
// //       fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
// //   } catch {
// //     prompts = fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
// //   }

// //   // store in Firestore for the day
// //   await promptRef.set({
// //     date: dateKey,
// //     prompts,
// //     createdAt: new Date(),
// //   });

// //   return prompts;
// // }

// // // 📝 Save or update journal entry (for a specific date)
// // router.post("/add", verifyToken, async (req, res) => {
// //   const { title, content, mood, date, prompts = [], answers = [] } = req.body;
// //   if (!date) return res.status(400).json({ error: "Missing date field" });

// //   try {
// //     const userRef = db.collection("users").doc(req.uid);
// //     const journalRef = userRef.collection("journals").doc(date);

// //     await journalRef.set({
// //       title,
// //       content,
// //       mood,
// //       date,
// //       prompts,
// //       answers,
// //       updatedAt: new Date(),
// //     });

// //     res.json({ message: "Journal saved successfully ✅", date });
// //   } catch (err) {
// //     console.error("Error saving journal:", err);
// //     res.status(500).json({ error: "Failed to save journal" });
// //   }
// // });

// // // 📖 Fetch journal entry (auto-attach daily prompts if not saved yet)
// // router.get("/:date", verifyToken, async (req, res) => {
// //   try {
// //     const { date } = req.params;
// //     const journalRef = db
// //       .collection("users")
// //       .doc(req.uid)
// //       .collection("journals")
// //       .doc(date);

// //     const doc = await journalRef.get();

// //     if (doc.exists) {
// //       // return saved journal
// //       return res.json(doc.data());
// //     }

// //     // no journal yet → attach that day's reflection prompts automatically
// //     const prompts = await getDailyPrompts();
// //     const newJournal = {
// //       title: "",
// //       content: "",
// //       mood: "",
// //       date,
// //       prompts,
// //       answers: ["", ""],
// //     };

// //     // save the empty journal with today's prompts for consistency
// //     await journalRef.set(newJournal);
// //     res.json(newJournal);
// //   } catch (err) {
// //     console.error("Error fetching journal:", err);
// //     res.status(500).json({ error: "Failed to fetch journal" });
// //   }
// // });

// // export default router;
// import express from "express";
// import { db, auth } from "../firebase.js";
// import fetch from "node-fetch";

// const router = express.Router();

// // 🔐 Middleware
// async function verifyToken(req, res, next) {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     const decoded = await auth.verifyIdToken(token);
//     req.uid = decoded.uid;
//     next();
//   } catch {
//     res.status(401).json({ error: "Unauthorized" });
//   }
// }

// // 🌿 Fallback prompts
// const fallbackPrompts = [
//   "What made you smile today?",
//   "What’s one thing you’re grateful for?",
//   "Describe your day in a color or texture.",
//   "What small act of kindness did you notice?",
//   "If your mood were weather, what would it be?",
// ];

// // 🧠 Helper: fetch reflection prompts (for any given date)
// async function getDailyPromptsForDate(dateKey) {
//   const promptRef = db.collection("dailyPrompts").doc(dateKey);
//   const existingDoc = await promptRef.get();

//   if (existingDoc.exists) {
//     return existingDoc.data().prompts;
//   }

//   // ✨ Generate new prompts for this specific date
//   let prompts = [];
//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: "Generate 2 short comforting self-reflection prompts for journaling. Each should sound natural, emotional, and under 15 words.",
//                 },
//               ],
//             },
//           ],
//         }),
//       }
//     );

//     const data = await response.json();
//     prompts =
//       data?.candidates?.[0]?.content?.parts?.map((p) => p.text.trim()) ||
//       fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
//   } catch (err) {
//     console.error("Gemini fetch failed:", err);
//     prompts = fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
//   }

//   // ✅ Save new prompts for that date (so they stay same later)
//   await promptRef.set({
//     date: dateKey,
//     prompts,
//     createdAt: new Date(),
//   });

//   return prompts;
// }

// // 📝 Save or update journal entry
// router.post("/add", verifyToken, async (req, res) => {
//   const { title, content, mood, date, prompts = [], answers = [] } = req.body;
//   if (!date) return res.status(400).json({ error: "Missing date field" });

//   try {
//     const userRef = db.collection("users").doc(req.uid);
//     const journalRef = userRef.collection("journals").doc(date);

//     await journalRef.set({
//       title,
//       content,
//       mood,
//       date,
//       prompts,
//       answers,
//       updatedAt: new Date(),
//     });

//     res.json({ message: "Journal saved successfully ✅", date });
//   } catch (err) {
//     console.error("Error saving journal:", err);
//     res.status(500).json({ error: "Failed to save journal" });
//   }
// });

// // 📖 Fetch journal entry for a specific date
// router.get("/:date", verifyToken, async (req, res) => {
//   try {
//     const { date } = req.params;
//     const journalRef = db
//       .collection("users")
//       .doc(req.uid)
//       .collection("journals")
//       .doc(date);

//     const doc = await journalRef.get();

//     if (doc.exists) {
//       return res.json(doc.data());
//     }

//     // ⏳ No journal yet for this date → generate *new unique prompts for that date*
//     const prompts = await getDailyPromptsForDate(date);
//     const newJournal = {
//       title: "",
//       content: "",
//       mood: "",
//       date,
//       prompts,
//       answers: ["", ""],
//     };

//     await journalRef.set(newJournal);
//     res.json(newJournal);
//   } catch (err) {
//     console.error("Error fetching journal:", err);
//     res.status(500).json({ error: "Failed to fetch journal" });
//   }
// });

// export default router;
import express from "express";
import { db, auth } from "../firebase.js";
import fetch from "node-fetch";
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const router = express.Router();

// 🔐 Middleware
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// 🌿 Fallback prompts
const fallbackPrompts = [
  "What made you smile today?",
  "What's one thing you're grateful for?",
  "Describe your day in a color or texture.",
  "What small act of kindness did you notice?",
  "If your mood were weather, what would it be?",
  "What's a moment today you want to hold onto?",
  "How did you take care of yourself today?",
  "What surprised you about today?",
];

// 🧠 Helper: Generate fresh prompts using Gemini
async function generateNewPrompts() {
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY not found in environment variables!");
  }

  try {
    console.log("🔑 Using Gemini API key:", process.env.GEMINI_API_KEY.slice(0, 10) + "...");
    
const response = await fetch(
  // **CORRECTED LINE: Changed model name to gemini-2.5-flash**
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Generate exactly 2 unique, thoughtful journaling prompts. Format your response as:
1. [First prompt - under 15 words]
2. [Second prompt - under 15 words]

Make them emotionally engaging and different from common prompts. Focus on self-reflection, gratitude, or mindfulness.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 1024,
      },
    }),
  }
);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gemini API error:", response.status, errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("🤖 Full Gemini response:", JSON.stringify(data, null, 2));

    // Extract text from response
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      console.error("❌ No text in Gemini response");
      throw new Error("Empty response from Gemini");
    }

    console.log("📝 Raw text from Gemini:", rawText);

    // Parse the numbered list (handles various formats)
    const lines = rawText.split('\n').filter(line => line.trim());
    const prompts = [];

    for (const line of lines) {
      // Match patterns like "1. prompt" or "1) prompt" or "- prompt"
      const match = line.match(/^[\d\-\*\•]+[\.\)]\s*(.+)$/);
      if (match && match[1]) {
        prompts.push(match[1].trim());
      }
    }

    // If we couldn't parse numbered list, try splitting by common delimiters
    if (prompts.length < 2) {
      const altPrompts = rawText
        .split(/[\n\r]+/)
        .map(p => p.replace(/^[\d\-\*\•]+[\.\)\s]+/, '').trim())
        .filter(p => p.length > 10 && p.length < 100);
      
      if (altPrompts.length >= 2) {
        prompts.push(...altPrompts);
      }
    }

    if (prompts.length >= 2) {
      console.log("✅ Successfully generated prompts:", prompts.slice(0, 2));
      return prompts.slice(0, 2);
    }

    console.warn("⚠️ Could not parse prompts properly, using fallback");
    throw new Error("Could not parse prompts from response");
    
  } catch (err) {
    console.error("❌ Gemini generation failed:", err.message);
    console.error("Stack:", err.stack);
    
    // DON'T use fallback - throw error to see what's wrong
    throw new Error(`Gemini API failed: ${err.message}`);
  }
}

// 📝 Save or update journal entry
router.post("/add", verifyToken, async (req, res) => {
  // const { title, content, mood, date, prompts = [], answers = [] } = req.body;
  const { title, content, mood, date, prompts = [], answers = [], photoURL = null } = req.body;
  if (!date) return res.status(400).json({ error: "Missing date field" });

  try {
    const userRef = db.collection("users").doc(req.uid);
    const journalRef = userRef.collection("journals").doc(date);

    // await journalRef.set({
    //   title,
    //   content,
    //   mood,
    //   date,
    //   prompts,
    //   answers,
    //   updatedAt: new Date(),
    // });
    await journalRef.set({
  title,
  content,
  mood,
  date,
  prompts,
  answers,
  photoURL,  // ← ADD THIS LINE
  updatedAt: new Date(),
});


    res.json({ message: "Journal saved successfully ✅", date });
  } catch (err) {
    console.error("Error saving journal:", err);
    res.status(500).json({ error: "Failed to save journal" });
  }
});
// 🔹 Update Avatar
router.post("/avatar", verifyToken, async (req, res) => {
  const { avatarURL } = req.body;
  if (!avatarURL) return res.status(400).json({ error: "Missing avatarURL" });

  try {
    const userRef = db.collection("users").doc(req.uid);
    await userRef.set({ avatarURL }, { merge: true });
    res.json({ success: true, avatarURL });
  } catch (err) {
    console.error("Error updating avatar:", err);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

// 🔹 Fetch Avatar (on login)
router.get("/avatar", verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.uid).get();
    const avatarURL = userDoc.data()?.avatarURL || null;
    res.json({ avatarURL });
  } catch (err) {
    console.error("Error fetching avatar:", err);
    res.status(500).json({ error: "Failed to fetch avatar" });
  }
});
// 📖 Fetch journal entry for a specific date
router.get("/:date", verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const userRef = db.collection("users").doc(req.uid);
    const journalRef = userRef.collection("journals").doc(date);

    const doc = await journalRef.get();

    // ✅ If journal exists — return it directly
    if (doc.exists) {
      console.log(`📖 Returning existing journal for ${date}`);
      return res.json(doc.data());
    }

    // 🆕 No journal yet → Check if prompts already generated for today globally
    const promptCacheRef = db.collection("dailyPrompts").doc(date);
    const promptCache = await promptCacheRef.get();

    let prompts;
    if (promptCache.exists) {
      // ✅ Reuse today's prompts to keep consistent daily reflections
      prompts = promptCache.data().prompts;
      console.log(`♻️ Using cached prompts for ${date}`);
    } else {
      // 🧠 Generate new ones and store globally
      prompts = await generateNewPrompts();
      await promptCacheRef.set({
        date,
        prompts,
        createdAt: new Date(),
      });
      console.log(`✨ New prompts generated and cached for ${date}`);
    }

    // Return unsaved journal object (don’t save yet)
    // const newJournal = {
    //   title: "",
    //   content: "",
    //   mood: "",
    //   date,
    //   prompts,
    //   answers: ["", ""],
    // };
    const newJournal = {
  title: "",
  content: "",
  mood: "",
  date,
  prompts,
  answers: ["", ""],
  photoURL: null,  // ← ADD THIS LINE
};

    return res.json(newJournal);
  } catch (err) {
    console.error("Error fetching journal:", err);
    res.status(500).json({ error: "Failed to fetch journal" });
  }
});


// 🧪 TEST ENDPOINT - Remove after testing
router.get("/test/gemini", async (req, res) => {
  console.log("🧪 Testing Gemini API...");
  const prompts = await generateNewPrompts();
  res.json({ 
    success: true, 
    prompts,
    apiKeyExists: !!process.env.GEMINI_API_KEY,
  });
});

// 📅 Fetch all dates where user has journal entries (non-empty only)
router.get("/dates/all", verifyToken, async (req, res) => {
  try {
    const userRef = db.collection("users").doc(req.uid);
    const journalsRef = userRef.collection("journals");

    const snapshot = await journalsRef.get();

    // Filter only those with actual content or mood/title filled
    const filledDates = snapshot.docs
      .filter(doc => {
        const d = doc.data();
        return (
          (d.title && d.title.trim() !== "") ||
          (d.content && d.content.trim() !== "") ||
          (d.mood && d.mood.trim() !== "") ||
          (d.answers && d.answers.some(a => a && a.trim() !== ""))
        );
      })
      .map(doc => doc.id);

    res.json({ dates: filledDates });
  } catch (err) {
    console.error("Error fetching journal dates:", err);
    res.status(500).json({ error: "Failed to fetch journal dates" });
  }
});

router.get("/dates/month/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params; // Format: "2025-11"
    const userRef = db.collection("users").doc(req.uid);
    const journalsRef = userRef.collection("journals");

    const snapshot = await journalsRef.get();

    // Filter dates that match the year-month and have content
    const monthDates = snapshot.docs
      .filter(doc => {
        const d = doc.data();
        const docDate = doc.id; // Format: "2025-11-12"
        const docYearMonth = docDate.substring(0, 7); // Extract "2025-11"
        
        const hasContent = (
          (d.title && d.title.trim() !== "") ||
          (d.content && d.content.trim() !== "") ||
          (d.mood && d.mood.trim() !== "") ||
          (d.answers && d.answers.some(a => a && a.trim() !== ""))
        );

        return docYearMonth === yearMonth && hasContent;
      })
      .map(doc => ({
        date: doc.id,
        day: parseInt(doc.id.split('-')[2]), // Extract day number (1-31)
        mood: doc.data().mood || "",
        title: doc.data().title || ""
      }));

    res.json({ dates: monthDates });
  } catch (err) {
    console.error("Error fetching monthly journal dates:", err);
    res.status(500).json({ error: "Failed to fetch journal dates" });
  }
});
// -----------------------------------------
// 🤖 AI ASSISTANT — Gemini reply
// -----------------------------------------
router.post("/assistant/reply", verifyToken, async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "I'm here, tell me what's on your mind 🌿" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a soft-spoken, gentle emotional companion.
Respond in under 2 sentences.
Tone: calming, validating, grounding.
User said: "${message}"

Reply like:
- “I’m here with you…”
- “That sounds heavy…”
- “You’re doing the best you can.”

Avoid:
- Questions unless needed
- Long paragraphs
- Overly formal tone
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm here with you. Tell me more 🌿";

    res.json({ reply });
  } catch (err) {
    console.error("AI Assistant Error:", err);
    res.json({ reply: "I'm here for you… even if my mind is a little foggy right now 🌫️" });
  }
});
// -----------------------------------------
// 🌸 AFFIRMATION OF THE DAY - Gemini
// -----------------------------------------
router.get("/affirmation/daily", verifyToken, async (req, res) => {
  try {
    // Get today's date to cache affirmation per day
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Check if we already generated an affirmation for today
    const cacheRef = db.collection("dailyAffirmations").doc(today);
    const cached = await cacheRef.get();
    
    if (cached.exists) {
      console.log("✨ Returning cached affirmation for", today);
      return res.json({ affirmation: cached.data().affirmation });
    }

    // Generate new affirmation using Gemini
    console.log("🌸 Generating new affirmation for", today);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a gentle, soft, and nurturing daily affirmation.

Requirements:
- 1-2 sentences maximum
- Warm, compassionate, and calming tone
- Focus on self-love, peace, or inner strength
- Use "you" or "I am" statements
- Avoid clichés or overly generic phrases
- Make it feel personal and heartfelt

Examples of the tone:
- "You are exactly where you need to be, and that's enough for today."
- "I am worthy of rest, and my pace is perfect."
- "Your gentle heart is your greatest strength."

Generate ONE unique affirmation now:`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 100,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const affirmation = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
                       "You are enough, just as you are. 🌿";

    // Cache the affirmation for today
    await cacheRef.set({
      date: today,
      affirmation,
      createdAt: new Date()
    });

    console.log("✅ Generated affirmation:", affirmation);
    res.json({ affirmation });

  } catch (err) {
    console.error("Affirmation generation error:", err);
    
    // Fallback affirmations if API fails
    const fallbacks = [
      "You are worthy of kindness, especially from yourself. 🌸",
      "Your presence is a gift to this world. 🌿",
      "You are doing better than you think. 💚",
      "It's okay to rest. You deserve peace. 🌙",
      "You are enough, exactly as you are. ✨"
    ];
    
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json({ affirmation: randomFallback });
  }
});
// -----------------------------------------
// 🔊 AI ASSISTANT — ElevenLabs TTS
// -----------------------------------------
router.post("/assistant/speak", verifyToken, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",   // Best free-tier friendly model
          voice_settings: {
            stability: 0.45,                    // Soft + gentle
            similarity_boost: 0.85,             // More emotional closeness
            style: 0.3,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!ttsRes.ok) {
      console.error("❌ ElevenLabs Error:", await ttsRes.text());
      return res.status(500).json({ error: "Failed to generate speech" });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("TTS Error:", err);
    res.status(500).json({ error: "Could not generate TTS audio" });
  }
});
// Add this new streaming endpoint to your backend
router.post("/assistant/reply-stream", verifyToken, async (req, res) => {
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a soft-spoken, gentle emotional companion.
Respond in under 2 sentences.
Tone: calming, validating, grounding.
User said: "${message}"
Reply like:
- "I'm here with you…"
- "That sounds heavy…"
- "You're doing the best you can."
Avoid:
- Questions unless needed
- Long paragraphs
- Overly formal tone`
            }]
          }]
        })
      }
    );

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              // Send each chunk to frontend
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error("Streaming error:", err);
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
  }
});
// Replace your /assistant/speak-stream endpoint with this:
router.post("/assistant/speak-stream", verifyToken, async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    console.log("🔊 Streaming TTS for:", text);

    // Use ElevenLabs streaming endpoint
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.85,
            style: 0.3,
            use_speaker_boost: true
          },
          optimize_streaming_latency: 3,
        }),
      }
    );

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text();
      console.error("❌ ElevenLabs Error:", errorText);
      return res.status(500).json({ error: "Failed to generate speech" });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    
    // Pipe the response body directly to the client
    // This works with node-fetch
    ttsRes.body.pipe(res);
    
    ttsRes.body.on('end', () => {
      console.log("✅ TTS streaming complete");
    });

    ttsRes.body.on('error', (err) => {
      console.error("❌ Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream failed" });
      }
    });

  } catch (err) {
    console.error("TTS Streaming Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Could not generate TTS audio" });
    }
  }
});

function getApplicableDates(task, yearMonth) {
  if (!task.isRecurring) {
    return [];
  }
  
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const applicableDates = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`;
    
    if (task.recurrenceType === 'daily') {
      applicableDates.push(dateStr);
    } else if (task.recurrenceType === 'weekly') {
      if (task.recurrenceDays && task.recurrenceDays.includes(dayOfWeek)) {
        applicableDates.push(dateStr);
      }
    }
  }
  
  return applicableDates;
}

// Helper function to apply exceptions to recurring tasks
function applyExceptions(task, date, exceptions) {
  if (!exceptions || !exceptions[task.id] || !exceptions[task.id][date]) {
    return task;
  }
  
  const exception = exceptions[task.id][date];
  
  // If deleted, return null to filter out
  if (exception.isDeleted) {
    return null;
  }
  
  // Apply overrides
  return {
    ...task,
    name: exception.nameOverride || task.name,
    category: exception.categoryOverride || task.category,
    timeEstimate: exception.timeEstimateOverride !== undefined ? exception.timeEstimateOverride : task.timeEstimate
  };
}

// 1. Get planner data for a specific month (ENHANCED)
router.get("/planner/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);
    
    // Get month-specific planner
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();
    
    // Get recurring task templates (stored separately)
    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();
    
    const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    const templates = [];
    
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });
    
    // Combine regular tasks and recurring tasks
    const allTasks = [...monthData.tasks];
    
    // Add recurring tasks with their applicable dates
    templates.forEach(template => {
      const applicableDates = getApplicableDates(template, yearMonth);
      
      // Filter out deleted dates from exceptions
      const filteredDates = applicableDates.filter(date => {
        const exception = monthData.exceptions?.[template.id]?.[date];
        return !exception || !exception.isDeleted;
      });
      
      if (filteredDates.length > 0) {
        allTasks.push({
          ...template,
          applicableDates: filteredDates
        });
      }
    });
    
    // Sort by sortOrder
    allTasks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    res.json({
      yearMonth,
      tasks: allTasks,
      completions: monthData.completions || {},
      exceptions: monthData.exceptions || {}
    });
  } catch (err) {
    console.error("Error fetching planner:", err);
    res.status(500).json({ error: "Failed to fetch planner" });
  }
});

// 2. Add/Update task (ENHANCED)
router.post("/planner/task", verifyToken, async (req, res) => {
  try {
    const { 
      yearMonth, 
      name, 
      category,
      isRecurring = false,
      recurrenceType = 'none',
      recurrenceDays = [],
      timeEstimate = null,
      editScope = 'all',
      specificDate = null,
      taskId = null // For editing existing tasks
    } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Validate recurrence
    if (recurrenceType === 'weekly' && (!recurrenceDays || recurrenceDays.length === 0)) {
      return res.status(400).json({ error: "Weekly recurrence requires at least one day selected" });
    }
    
    const userRef = db.collection("users").doc(req.uid);
    
    // EDITING EXISTING TASK
    if (taskId) {
      // Check if it's a recurring task template
      const templateRef = userRef.collection("taskTemplates").doc(taskId);
      const templateDoc = await templateRef.get();
      
      if (templateDoc.exists) {
        // Editing recurring task
        if (editScope === 'single' && specificDate) {
          // Create exception for single occurrence
          const plannerRef = userRef.collection("planners").doc(yearMonth);
          const plannerDoc = await plannerRef.get();
          const plannerData = plannerDoc.exists ? plannerDoc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
          
          if (!plannerData.exceptions) plannerData.exceptions = {};
          if (!plannerData.exceptions[taskId]) plannerData.exceptions[taskId] = {};
          
          plannerData.exceptions[taskId][specificDate] = {
            nameOverride: name,
            categoryOverride: category,
            timeEstimateOverride: timeEstimate,
            isDeleted: false,
            updatedAt: new Date().toISOString()
          };
          
          await plannerRef.set(plannerData);
          
          res.json({ 
            success: true, 
            message: "Single occurrence updated",
            affectedDates: [specificDate]
          });
        } else {
          // Update template (affects all future occurrences)
          await templateRef.update({
            name,
            category,
            timeEstimate,
            recurrenceType,
            recurrenceDays,
            updatedAt: new Date().toISOString()
          });
          
          const affectedDates = getApplicableDates({
            isRecurring: true,
            recurrenceType,
            recurrenceDays
          }, yearMonth);
          
          res.json({ 
            success: true, 
            message: "Template updated",
            affectedDates
          });
        }
      } else {
        // Editing non-recurring task
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const doc = await plannerRef.get();
        
        if (!doc.exists) {
          return res.status(404).json({ error: "Planner not found" });
        }
        
        const data = doc.data();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
          return res.status(404).json({ error: "Task not found" });
        }
        
        data.tasks[taskIndex] = {
          ...data.tasks[taskIndex],
          name,
          category,
          timeEstimate,
          updatedAt: new Date().toISOString()
        };
        
        await plannerRef.set(data);
        
        res.json({ 
          success: true, 
          task: data.tasks[taskIndex]
        });
      }
    } 
    // CREATING NEW TASK
    else {
      if (isRecurring) {
        // Create recurring task template
        const templatesRef = userRef.collection("taskTemplates");
        const newTemplateRef = templatesRef.doc();
        
        // Get current max sortOrder
        const allTemplatesSnapshot = await templatesRef.get();
        const maxOrder = allTemplatesSnapshot.docs.reduce((max, doc) => {
          const order = doc.data().sortOrder || 0;
          return order > max ? order : max;
        }, -1);
        
        const newTemplate = {
          name,
          category,
          isRecurring: true,
          recurrenceType,
          recurrenceDays,
          timeEstimate,
          sortOrder: maxOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await newTemplateRef.set(newTemplate);
        
        const affectedDates = getApplicableDates(newTemplate, yearMonth);
        
        res.json({ 
          success: true, 
          task: { id: newTemplateRef.id, ...newTemplate },
          affectedDates
        });
      } else {
        // Create regular non-recurring task
        if (!yearMonth) {
          return res.status(400).json({ error: "yearMonth required for non-recurring tasks" });
        }
        
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const doc = await plannerRef.get();
        const data = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
        
        const newTask = {
          id: `task_${Date.now()}`,
          name,
          category,
          isRecurring: false,
          timeEstimate,
          sortOrder: data.tasks.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.tasks.push(newTask);
        await plannerRef.set(data);
        
        res.json({ success: true, task: newTask });
      }
    }
  } catch (err) {
    console.error("Error adding/updating task:", err);
    res.status(500).json({ error: "Failed to save task" });
  }
});

// 3. Delete task (ENHANCED)
router.delete("/planner/task/:yearMonth/:taskId", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskId } = req.params;
    const { scope = 'all', date = null } = req.query;
    
    const userRef = db.collection("users").doc(req.uid);
    
    // Check if it's a recurring task template
    const templateRef = userRef.collection("taskTemplates").doc(taskId);
    const templateDoc = await templateRef.get();
    
    if (templateDoc.exists) {
      // Deleting recurring task
      const template = templateDoc.data();
      
      if (scope === 'single' && date) {
        // Mark single occurrence as deleted via exception
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const plannerDoc = await plannerRef.get();
        const plannerData = plannerDoc.exists ? plannerDoc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
        
        if (!plannerData.exceptions) plannerData.exceptions = {};
        if (!plannerData.exceptions[taskId]) plannerData.exceptions[taskId] = {};
        
        plannerData.exceptions[taskId][date] = {
          isDeleted: true,
          deletedAt: new Date().toISOString()
        };
        
        // Remove completion for this date
        if (plannerData.completions[date]) {
          plannerData.completions[date] = plannerData.completions[date].filter(id => id !== taskId);
        }
        
        await plannerRef.set(plannerData);
        
        res.json({ success: true, message: "Single occurrence deleted" });
      } else if (scope === 'month') {
        // Delete all occurrences in this month only
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const plannerDoc = await plannerRef.get();
        const plannerData = plannerDoc.exists ? plannerDoc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
        
        if (!plannerData.exceptions) plannerData.exceptions = {};
        if (!plannerData.exceptions[taskId]) plannerData.exceptions[taskId] = {};
        
        // Get all applicable dates for this task in this month
        const applicableDates = getApplicableDates(template, yearMonth);
        
        // Mark all dates in this month as deleted
        applicableDates.forEach(dateStr => {
          plannerData.exceptions[taskId][dateStr] = {
            isDeleted: true,
            deletedAt: new Date().toISOString()
          };
          
          // Remove completion for this date
          if (plannerData.completions[dateStr]) {
            plannerData.completions[dateStr] = plannerData.completions[dateStr].filter(id => id !== taskId);
          }
        });
        
        await plannerRef.set(plannerData);
        
        res.json({ success: true, message: "All occurrences in this month deleted", deletedCount: applicableDates.length });
      } else {
        // Delete entire template (scope === 'all')
        await templateRef.delete();
        
        // Remove all completions for this task across all months
        // (You might want to clean up old planners, but for now just current month)
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const plannerDoc = await plannerRef.get();
        
        if (plannerDoc.exists) {
          const plannerData = plannerDoc.data();
          
          // Remove completions
          Object.keys(plannerData.completions || {}).forEach(date => {
            plannerData.completions[date] = plannerData.completions[date].filter(id => id !== taskId);
          });
          
          // Remove exceptions
          if (plannerData.exceptions && plannerData.exceptions[taskId]) {
            delete plannerData.exceptions[taskId];
          }
          
          await plannerRef.set(plannerData);
        }
        
        res.json({ success: true, message: "Template and all occurrences deleted" });
      }
    } else {
      // Deleting non-recurring task
      const plannerRef = userRef.collection("planners").doc(yearMonth);
      const doc = await plannerRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: "Planner not found" });
      }
      
      const data = doc.data();
      data.tasks = data.tasks.filter(t => t.id !== taskId);
      
      // Remove completions for this task
      Object.keys(data.completions).forEach(date => {
        data.completions[date] = data.completions[date].filter(id => id !== taskId);
      });
      
      await plannerRef.set(data);
      res.json({ success: true });
    }
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// 4. Toggle task completion (UNCHANGED - works with both types)
router.post("/planner/toggle", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskId, date, completed } = req.body;
    
    if (!yearMonth || !taskId || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();
    
    const data = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    
    if (!data.completions[date]) {
      data.completions[date] = [];
    }
    
    if (completed) {
      if (!data.completions[date].includes(taskId)) {
        data.completions[date].push(taskId);
      }
    } else {
      data.completions[date] = data.completions[date].filter(id => id !== taskId);
    }
    
    await plannerRef.set(data);
    res.json({ success: true });
  } catch (err) {
    console.error("Error toggling task:", err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

// 5. Get stats for dopamine graph (ENHANCED with time estimates)
router.get("/planner/stats/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);
    
    // Get month planner
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();
    
    // Get templates
    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();
    
    const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    const templates = [];
    
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });
    
    // Calculate stats for each day
    const dailyStats = [];
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${yearMonth}-${String(day).padStart(2, '0')}`;
      
      // Get all tasks for this day (regular + recurring)
      const dayTasks = [...monthData.tasks];
      
      templates.forEach(template => {
        const applicableDates = getApplicableDates(template, yearMonth);
        if (applicableDates.includes(date)) {
          // Check if not deleted via exception
          const exception = monthData.exceptions?.[template.id]?.[date];
          if (!exception || !exception.isDeleted) {
            dayTasks.push(template);
          }
        }
      });
      
      const completed = monthData.completions[date]?.length || 0;
      
      // Calculate time estimates
      const totalEstimatedTime = dayTasks.reduce((sum, task) => {
        return sum + (task.timeEstimate || 0);
      }, 0);
      
      const completedTime = dayTasks
        .filter(task => monthData.completions[date]?.includes(task.id))
        .reduce((sum, task) => sum + (task.timeEstimate || 0), 0);
      
      dailyStats.push({
        date,
        day,
        planned: dayTasks.length,
        completed,
        totalEstimatedTime,
        completedTime
      });
    }
    
    res.json({ dailyStats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 6. NEW: Reorder tasks
router.put("/planner/task/reorder", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskOrders } = req.body;
    
    if (!taskOrders || !Array.isArray(taskOrders)) {
      return res.status(400).json({ error: "taskOrders array required" });
    }
    
    const userRef = db.collection("users").doc(req.uid);
    const batch = db.batch();
    
    // Update both regular tasks and templates
    for (const { taskId, sortOrder } of taskOrders) {
      // Check if it's a template
      const templateRef = userRef.collection("taskTemplates").doc(taskId);
      const templateDoc = await templateRef.get();
      
      if (templateDoc.exists) {
        batch.update(templateRef, { sortOrder });
      } else {
        // It's a regular task - update in planner document
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const plannerDoc = await plannerRef.get();
        
        if (plannerDoc.exists) {
          const data = plannerDoc.data();
          const taskIndex = data.tasks.findIndex(t => t.id === taskId);
          
          if (taskIndex !== -1) {
            data.tasks[taskIndex].sortOrder = sortOrder;
            batch.set(plannerRef, data);
          }
        }
      }
    }
    
    await batch.commit();
    res.json({ success: true });
  } catch (err) {
    console.error("Error reordering tasks:", err);
    res.status(500).json({ error: "Failed to reorder tasks" });
  }
});

// 7. NEW: Get all recurring task templates
router.get("/planner/templates", verifyToken, async (req, res) => {
  try {
    const userRef = db.collection("users").doc(req.uid);
    const templatesRef = userRef.collection("taskTemplates");
    const snapshot = await templatesRef.orderBy("sortOrder", "asc").get();
    
    const templates = [];
    snapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ templates });
  } catch (err) {
    console.error("Error fetching templates:", err);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/assistant/speak-edge", verifyToken, async (req, res) => {
  try {
    const { text, voice = "en-US-MichelleNeural" } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    
    // Create temp file path
    const tempFile = path.join(__dirname, `temp_${Date.now()}.mp3`);
    
    // Generate audio with Edge TTS command
    const command = `edge-tts --voice "${voice}" --text "${text.replace(/"/g, '\\"')}" --write-media "${tempFile}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Edge TTS error:", error);
        return res.status(500).json({ error: "TTS generation failed" });
      }
      
      // Check if file was created
      if (!fs.existsSync(tempFile)) {
        return res.status(500).json({ error: "Audio file not generated" });
      }
      
      // Send the audio file
      res.setHeader('Content-Type', 'audio/mpeg');
      const audioStream = fs.createReadStream(tempFile);
      
      audioStream.pipe(res);
      
      // Clean up temp file after sending
      audioStream.on('end', () => {
        fs.unlink(tempFile, (err) => {
          if (err) console.error("Failed to delete temp file:", err);
        });
      });
    });
    
  } catch (err) {
    console.error("Edge TTS endpoint error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
