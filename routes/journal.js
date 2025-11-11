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
  const { title, content, mood, date, prompts = [], answers = [] } = req.body;
  if (!date) return res.status(400).json({ error: "Missing date field" });

  try {
    const userRef = db.collection("users").doc(req.uid);
    const journalRef = userRef.collection("journals").doc(date);

    await journalRef.set({
      title,
      content,
      mood,
      date,
      prompts,
      answers,
      updatedAt: new Date(),
    });

    res.json({ message: "Journal saved successfully ✅", date });
  } catch (err) {
    console.error("Error saving journal:", err);
    res.status(500).json({ error: "Failed to save journal" });
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
    const newJournal = {
      title: "",
      content: "",
      mood: "",
      date,
      prompts,
      answers: ["", ""],
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


export default router;