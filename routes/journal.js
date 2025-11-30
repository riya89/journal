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
router.post("/add", verifyToken, async (req, res) => {
  const { title, content, mood, date, prompts = [], answers = [], photoURL = null } = req.body;
  
  if (!date) return res.status(400).json({ error: "Missing date field" });

  try {
    const userRef = db.collection("users").doc(req.uid);
    const journalRef = userRef.collection("journals").doc(date);

    // Save journal entry
    await journalRef.set({
      title,
      content,
      mood,
      date,
      prompts,
      answers,
      photoURL,
      updatedAt: new Date(),
    });

    // ✨ UPDATE QUEST PROGRESS

    // 1. Journal entry quest
    try {
      const questsRef = userRef.collection("quests");
      const journalQuestSnapshot = await questsRef
        .where("status", "==", "active")
        .where("trackingType", "==", "journal_entry")
        .get();

      for (const doc of journalQuestSnapshot.docs) {
        const quest = doc.data();
        const newProgress = Math.min(quest.progress + 1, quest.target);
        const completed = newProgress >= quest.target;

        await doc.ref.update({
          progress: newProgress,
          status: completed ? "completed" : "active",
          completedAt: completed ? new Date() : null
        });

        // Award XP if completed
        if (completed && quest.status !== "completed") {
          await awardQuestXP(userRef, quest.reward.xp);
        }
      }
    } catch (questErr) {
      console.error("Error updating journal quest:", questErr);
    }

    // 2. ✅ FIXED: Word count quest
    if (content) {
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      if (wordCount > 0) {
        try {
          // ✅ Store daily word count (replaces if exists)
          await userRef.collection("dailyWordCounts").doc(date).set({
            date,
            wordCount,
            lastUpdated: new Date()
          }); // No merge - we want to REPLACE

          // ✅ Recalculate monthly total
          await updateMonthlyWordCountQuest(userRef);
          
        } catch (questErr) {
          console.error("Error updating word count quest:", questErr);
        }
      }
    }

    // 3. Mood log quest
    if (mood) {
      try {
        const moodQuestSnapshot = await userRef.collection("quests")
          .where("status", "==", "active")
          .where("trackingType", "==", "mood_log")
          .get();

        for (const doc of moodQuestSnapshot.docs) {
          const quest = doc.data();
          const newProgress = Math.min(quest.progress + 1, quest.target);
          const completed = newProgress >= quest.target;

          await doc.ref.update({
            progress: newProgress,
            status: completed ? "completed" : "active",
            completedAt: completed ? new Date() : null
          });

          // Award XP if completed
          if (completed && quest.status !== "completed") {
            await awardQuestXP(userRef, quest.reward.xp);
          }
        }
      } catch (questErr) {
        console.error("Error updating mood quest:", questErr);
      }
    }

    // Update user stats
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    await userRef.set({
      stats: {
        ...userData.stats,
        totalJournalEntries: (userData.stats?.totalJournalEntries || 0) + 1
      }
    }, { merge: true });

    res.json({ message: "Journal saved successfully ✅", date });
  } catch (err) {
    console.error("Error saving journal:", err);
    res.status(500).json({ error: "Failed to save journal" });
  }
});
// ✅ NEW: Helper function to update monthly word count quest
async function updateMonthlyWordCountQuest(userRef) {
  try {
    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthKey = startOfMonth.toISOString().split('T')[0];
    
    // Get ALL daily word counts for this month
    const dailyCountsSnapshot = await userRef
      .collection('dailyWordCounts')
      .where('date', '>=', monthKey)
      .get();
    
    // Sum up all daily word counts
    let monthlyTotal = 0;
    dailyCountsSnapshot.forEach(doc => {
      monthlyTotal += doc.data().wordCount || 0;
    });
    
    console.log(`Monthly word count total: ${monthlyTotal}`);
    
    // Find active monthly word count quest
    const questsSnapshot = await userRef
      .collection('quests')
      .where('type', '==', 'monthly')
      .where('trackingType', '==', 'word_count')
      .where('status', '==', 'active')
      .get();
    
    if (questsSnapshot.empty) {
      console.log('No active word count quest found');
      return;
    }
    
    // Update quest progress with TOTAL (not adding)
    for (const doc of questsSnapshot.docs) {
      const quest = doc.data();
      const isCompleted = monthlyTotal >= quest.target;
      const wasCompleted = quest.status === 'completed';
      
      await doc.ref.update({
        progress: monthlyTotal, // ✅ SET to total, don't add
        status: isCompleted ? 'completed' : 'active',
        completedAt: isCompleted ? new Date() : null
      });
      
      // Award XP if just completed (not already completed)
      if (isCompleted && !wasCompleted) {
        await awardQuestXP(userRef, quest.reward.xp);
      }
      
      console.log(`Updated word count quest: ${monthlyTotal}/${quest.target}`);
    }
  } catch (err) {
    console.error('Error updating monthly word count quest:', err);
  }
}

// ✅ NEW: Helper function to award XP (reduces code duplication)
async function awardQuestXP(userRef, xpAmount) {
  try {
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { 
      totalXP: 0, 
      currentLevel: 1, 
      questsCompleted: 0 
    };
    
    const newTotalXP = (userData.totalXP || 0) + xpAmount;
    const currentLevel = calculateLevel(newTotalXP);
    
    await userRef.set({
      totalXP: newTotalXP,
      currentLevel,
      questsCompleted: (userData.questsCompleted || 0) + 1
    }, { merge: true });
    
    console.log(`Awarded ${xpAmount} XP. New total: ${newTotalXP}`);
  } catch (err) {
    console.error('Error awarding XP:', err);
  }
}


// 🔹 GET /journal/post-save-check
// Fetch today's tasks from planner and return completion status
router.get('/post-save-check', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const uid = req.uid; // From verifyToken middleware

    if (!date) {
      return res.status(400).json({ error: 'Missing date parameter' });
    }

    // Extract year-month from date (YYYY-MM-DD -> YYYY-MM)
    const yearMonth = date.substring(0, 7);

    // Get planner data for the month
    const plannerRef = db.collection('planners').doc(uid).collection('months').doc(yearMonth);
    const plannerDoc = await plannerRef.get();

    if (!plannerDoc.exists) {
      return res.json({
        hasTasks: false,
        todaysTasks: [],
        completionStats: { total: 0, completed: 0, percentage: 0 }
      });
    }

    const plannerData = plannerDoc.data();
    const tasks = plannerData.tasks || [];
    const completions = plannerData.completions || {};
    const exceptions = plannerData.exceptions || {};

    // Filter tasks that apply to this specific date
    const todaysTasks = tasks.filter(task => {
      if (!task.isRecurring) {
        // Non-recurring tasks apply to all dates in their month
        return true;
      }

      // For recurring tasks, check applicableDates
      if (!task.applicableDates || !Array.isArray(task.applicableDates)) {
        return false;
      }

      // Check if date is in applicableDates
      if (!task.applicableDates.includes(date)) {
        return false;
      }

      // Check for exceptions (deleted occurrences)
      const taskExceptions = exceptions[task.id];
      if (taskExceptions && taskExceptions[date] && taskExceptions[date].isDeleted) {
        return false;
      }

      return true;
    });

    // Check completion status for each task
    const dateCompletions = completions[date] || [];
    const tasksWithStatus = todaysTasks.map(task => ({
      id: task.id,
      name: task.name,
      category: task.category,
      timeEstimate: task.timeEstimate,
      completed: dateCompletions.includes(task.id)
    }));

    // Calculate statistics
    const total = tasksWithStatus.length;
    const completed = tasksWithStatus.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      hasTasks: total > 0,
      todaysTasks: tasksWithStatus,
      completionStats: {
        total,
        completed,
        percentage
      }
    });
  } catch (error) {
    console.error('Error fetching post-save check:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 🔹 POST /journal/quick-complete-tasks
// Accept array of task IDs to mark complete
router.post('/quick-complete-tasks', verifyToken, async (req, res) => {
  try {
    const { date, taskIds } = req.body;
    const uid = req.uid; // From verifyToken middleware

    if (!date || !Array.isArray(taskIds)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Extract year-month from date
    const yearMonth = date.substring(0, 7);

    // Get planner reference
    const plannerRef = db.collection('planners').doc(uid).collection('months').doc(yearMonth);
    const plannerDoc = await plannerRef.get();

    if (!plannerDoc.exists) {
      return res.status(404).json({ error: 'Planner not found' });
    }

    const plannerData = plannerDoc.data();
    const completions = plannerData.completions || {};

    // Update completions for the date
    completions[date] = taskIds;

    // Save back to Firestore
    await plannerRef.update({ completions });

    res.json({
      success: true,
      completedCount: taskIds.length,
      message: `Marked ${taskIds.length} task(s) as complete`
    });
  } catch (error) {
    console.error('Error updating task completions:', error);
    res.status(500).json({ error: 'Failed to update task completions' });
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
router.post("/analyze-for-tasks", verifyToken, async (req, res) => {
  try {
    const { journalText, mood, date } = req.body;

    // Validate input
    if (!journalText || journalText.trim().length < 20) {
      return res.json({ 
        suggestedTasks: [],
        message: "Journal entry too short for analysis"
      });
    }

    // Build AI prompt for task analysis
    const prompt = `You are a helpful task planning assistant. Analyze this journal entry and suggest 2-3 actionable tasks.

Journal Entry:
"${journalText}"

Mood: ${mood}/5

Based on the journal content, suggest 2-3 specific, actionable tasks that would help the person.

Requirements:
- Tasks should be concrete and achievable
- Match the person's current emotional state (mood: ${mood}/5)
- Address themes or challenges mentioned in the journal
- Each task should take 15-60 minutes

Respond in this EXACT JSON format:
{
  "tasks": [
    {
      "name": "Task name (under 50 characters)",
      "category": "one of: Work, Personal, Health, Social, Creative, Learning",
      "timeEstimate": 30,
      "reason": "Why this task would help (one sentence)"
    }
  ]
}

Generate 2-3 tasks now:`;

    // Call Gemini AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse JSON from AI response
    let suggestedTasks = [];
    
    try {
      // Try to extract JSON from response (AI might wrap it in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestedTasks = parsed.tasks || [];
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr);
      console.log("AI Response:", aiResponse);
      
      // Fallback: return empty array
      return res.json({ 
        suggestedTasks: [],
        message: "Could not parse task suggestions"
      });
    }

    // Validate and clean up tasks
    const validTasks = suggestedTasks
      .filter(task => task.name && task.category)
      .map(task => ({
        name: task.name.substring(0, 100),
        category: task.category,
        timeEstimate: task.timeEstimate || 30,
        reason: task.reason || "Suggested based on your journal entry"
      }))
      .slice(0, 3); // Max 3 tasks

    console.log(`✅ Generated ${validTasks.length} task suggestions for journal entry`);

    res.json({
      suggestedTasks: validTasks,
      analyzedThemes: [], // Could add theme detection later
      message: validTasks.length > 0 ? "Tasks suggested successfully" : "No tasks suggested"
    });

  } catch (err) {
    console.error("Task analysis error:", err);
    
    // Return empty suggestions on error (don't break the flow)
    res.json({
      suggestedTasks: [],
      message: "Task analysis unavailable"
    });
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

  // ✅ ADD THIS: Save specificDate if provided
  if (req.body.specificDate) {
    newTask.specificDate = req.body.specificDate;
  }

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

// // 4. Toggle task completion (UNCHANGED - works with both types)
// router.post("/planner/toggle", verifyToken, async (req, res) => {
//   try {
//     const { yearMonth, taskId, date, completed } = req.body;
    
//     if (!yearMonth || !taskId || !date) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
    
//     const userRef = db.collection("users").doc(req.uid);
//     const plannerRef = userRef.collection("planners").doc(yearMonth);
//     const doc = await plannerRef.get();
    
//     const data = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    
//     if (!data.completions[date]) {
//       data.completions[date] = [];
//     }
    
//     if (completed) {
//       if (!data.completions[date].includes(taskId)) {
//         data.completions[date].push(taskId);
//       }
//     } else {
//       data.completions[date] = data.completions[date].filter(id => id !== taskId);
//     }
    
//     await plannerRef.set(data);
//     res.json({ success: true });
//   } catch (err) {
//     console.error("Error toggling task:", err);
//     res.status(500).json({ error: "Failed to toggle task" });
//   }
// });

router.get("/planner/stats/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);

    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();

    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();

    const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    const templates = [];
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });

    const dailyStats = [];
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${yearMonth}-${String(day).padStart(2, '0')}`;

      // Get ONLY recurring/regular tasks (exclude specificDate tasks)
      const recurringTasks = monthData.tasks.filter(task => !task.specificDate);
      
      templates.forEach(template => {
        const applicableDates = getApplicableDates(template, yearMonth);
        if (applicableDates.includes(date)) {
          const exception = monthData.exceptions?.[template.id]?.[date];
          if (!exception || !exception.isDeleted) {
            recurringTasks.push(template);
          }
        }
      });

      // Count completions ONLY for recurring tasks
      const completedRecurringTasks = recurringTasks.filter(task => 
        monthData.completions[date]?.includes(task.id)
      );

      const totalEstimatedTime = recurringTasks.reduce((sum, task) => {
        return sum + (task.timeEstimate || 0);
      }, 0);

      const completedTime = completedRecurringTasks.reduce((sum, task) => 
        sum + (task.timeEstimate || 0), 0
      );

      dailyStats.push({
        date,
        day,
        planned: recurringTasks.length,  // Only recurring tasks
        completed: completedRecurringTasks.length,  // Only recurring completions
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
// 5. Get stats for dopamine graph (ENHANCED with time estimates)
// router.get("/planner/stats/:yearMonth", verifyToken, async (req, res) => {
//   try {
//     const { yearMonth } = req.params;
//     const userRef = db.collection("users").doc(req.uid);
    
//     // Get month planner
//     const plannerRef = userRef.collection("planners").doc(yearMonth);
//     const doc = await plannerRef.get();
    
//     // Get templates
//     const templatesRef = userRef.collection("taskTemplates");
//     const templatesSnapshot = await templatesRef.get();
    
//     const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
//     const templates = [];
    
//     templatesSnapshot.forEach(doc => {
//       templates.push({ id: doc.id, ...doc.data() });
//     });
    
//     // Calculate stats for each day
//     const dailyStats = [];
//     const [year, month] = yearMonth.split('-');
//     const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = `${yearMonth}-${String(day).padStart(2, '0')}`;
      
//       // Get all tasks for this day (regular + recurring)
//       // const dayTasks = [...monthData.tasks];
//       const dayTasks = monthData.tasks.filter(task => {
//   // Exclude tasks that have a specificDate and it's not today
//   if (task.specificDate && task.specificDate !== date) {
//     return false;
//   }
//   return true;
// });

//       templates.forEach(template => {
//         const applicableDates = getApplicableDates(template, yearMonth);
//         if (applicableDates.includes(date)) {
//           // Check if not deleted via exception
//           const exception = monthData.exceptions?.[template.id]?.[date];
//           if (!exception || !exception.isDeleted) {
//             dayTasks.push(template);
//           }
//         }
//       });
      
//       const completed = monthData.completions[date]?.length || 0;
      
//       // Calculate time estimates
//       const totalEstimatedTime = dayTasks.reduce((sum, task) => {
//         return sum + (task.timeEstimate || 0);
//       }, 0);
      
//       const completedTime = dayTasks
//         .filter(task => monthData.completions[date]?.includes(task.id))
//         .reduce((sum, task) => sum + (task.timeEstimate || 0), 0);
      
//       dailyStats.push({
//         date,
//         day,
//         planned: dayTasks.length,
//         completed,
//         totalEstimatedTime,
//         completedTime
//       });
//     }
    
//     res.json({ dailyStats });
//   } catch (err) {
//     console.error("Error fetching stats:", err);
//     res.status(500).json({ error: "Failed to fetch stats" });
//   }
// });
// 4. Toggle task completion
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

    const wasCompleted = data.completions[date].includes(taskId);

    if (completed) {
      if (!wasCompleted) {
        data.completions[date].push(taskId);
        
        // ✨ UPDATE QUEST PROGRESS (only when completing, not uncompleting)
        try {
          const questsRef = userRef.collection("quests");
          const taskQuestSnapshot = await questsRef
            .where("status", "==", "active")
            .where("trackingType", "==", "task_completion")
            .get();

          for (const questDoc of taskQuestSnapshot.docs) {
            const quest = questDoc.data();
            const newProgress = Math.min(quest.progress + 1, quest.target);
            const questCompleted = newProgress >= quest.target;

            await questDoc.ref.update({
              progress: newProgress,
              status: questCompleted ? "completed" : "active",
              completedAt: questCompleted ? new Date() : null
            });

            // Award XP if quest completed
            if (questCompleted && quest.status !== "completed") {
              const userDoc = await userRef.get();
              const userData = userDoc.exists ? userDoc.data() : { totalXP: 0, currentLevel: 1, questsCompleted: 0 };
              const newTotalXP = (userData.totalXP || 0) + quest.reward.xp;
              const currentLevel = calculateLevel(newTotalXP);

              await userRef.set({
                totalXP: newTotalXP,
                currentLevel,
                questsCompleted: (userData.questsCompleted || 0) + 1
              }, { merge: true });
            }
          }
        } catch (questErr) {
          console.error("Error updating task quest:", questErr);
        }

        // Update user stats
        const userDoc = await userRef.get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        await userRef.set({
          stats: {
            ...userData.stats,
            totalTasksCompleted: (userData.stats?.totalTasksCompleted || 0) + 1
          }
        }, { merge: true });
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


router.get("/user/xp", verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.uid).get();
    const userData = userDoc.data() || { totalXP: 0, currentLevel: 1 };
    
    const xpForNextLevel = userData.currentLevel * 100;
    
    res.json({
      totalXP: userData.totalXP,
      currentLevel: userData.currentLevel,
      xpForNextLevel,
      xpProgress: userData.totalXP,
      levelUpThreshold: xpForNextLevel
    });
  } catch (err) {
    console.error("Error fetching XP:", err);
    res.status(500).json({ error: "Failed to fetch XP" });
  }
});

router.get("/post-save-check", verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const yearMonth = date.substring(0, 7);
    
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const plannerDoc = await plannerRef.get();
    
    if (!plannerDoc.exists) {
      return res.json({ hasTasks: false, todaysTasks: [] });
    }
    
    const plannerData = plannerDoc.data();
    const todaysTasks = plannerData.tasks.filter(task => {
      // Filter tasks for today (handle recurring tasks too)
      return true; // Simplified - implement your task filtering logic
    });
    
    const completions = plannerData.completions[date] || [];
    const tasksWithStatus = todaysTasks.map(task => ({
      ...task,
      completed: completions.includes(task.id)
    }));
    
    res.json({
      hasTasks: todaysTasks.length > 0,
      todaysTasks: tasksWithStatus,
      completionStats: {
        completed: completions.length,
        total: todaysTasks.length,
        percentage: Math.round((completions.length / todaysTasks.length) * 100)
      }
    });
  } catch (err) {
    console.error("Error fetching post-save check:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/quick-complete-tasks", verifyToken, async (req, res) => {
  try {
    const { date, taskIds } = req.body;
    const yearMonth = date.substring(0, 7);
    
    const plannerRef = db.collection("users").doc(req.uid).collection("planners").doc(yearMonth);
    const plannerDoc = await plannerRef.get();
    const plannerData = plannerDoc.data();
    
    if (!plannerData.completions[date]) {
      plannerData.completions[date] = [];
    }
    
    // Add task IDs to completions (avoid duplicates)
    taskIds.forEach(id => {
      if (!plannerData.completions[date].includes(id)) {
        plannerData.completions[date].push(id);
      }
    });
    
    await plannerRef.set(plannerData);
    
    const allTasksComplete = plannerData.tasks.length === plannerData.completions[date].length;
    
    res.json({
      success: true,
      completedCount: taskIds.length,
      allTasksComplete
    });
  } catch (err) {
    console.error("Error completing tasks:", err);
    res.status(500).json({ error: "Failed to complete tasks" });
  }
});
router.get("/summary/weekly", verifyToken, async (req, res) => {
  try {
    const { endDate } = req.query;
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    
    // Fetch journals
    const journalsRef = db.collection("users").doc(req.uid).collection("journals");
    const journalsSnapshot = await journalsRef
      .where("date", ">=", start.toISOString().split('T')[0])
      .where("date", "<=", endDate)
      .get();
    
    const journals = [];
    journalsSnapshot.forEach(doc => journals.push(doc.data()));
    
    // Fetch planner data
    const yearMonth = endDate.substring(0, 7);
    const plannerDoc = await db.collection("users")
      .doc(req.uid)
      .collection("planners")
      .doc(yearMonth)
      .get();
    
    const plannerData = plannerDoc.exists ? plannerDoc.data() : { tasks: [], completions: {} };
    
    // Calculate stats
    const entriesWritten = journals.length;
    const moods = journals.map(j => j.mood).filter(m => m);
    const averageMood = moods.reduce((a, b) => a + b, 0) / moods.length || 0;
    const totalWords = journals.reduce((sum, j) => {
      return sum + (j.content || "").split(/\s+/).length;
    }, 0);
    
    let tasksCompleted = 0;
    let tasksPlanned = 0;
    let perfectDays = 0;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = plannerData.tasks; // Simplified
      const dayCompletions = plannerData.completions[dateStr] || [];
      
      tasksPlanned += dayTasks.length;
      tasksCompleted += dayCompletions.length;
      
      if (dayTasks.length > 0 && dayCompletions.length === dayTasks.length) {
        perfectDays++;
      }
    }
    
    const completionRate = tasksPlanned > 0 ? (tasksCompleted / tasksPlanned * 100) : 0;
    
    const highlights = [];
    if (completionRate >= 80) {
      highlights.push(`You completed ${Math.round(completionRate)}% of your planned tasks`);
    }
    if (entriesWritten === 7) {
      highlights.push("You wrote every day this week! 🔥");
    }
    
    res.json({
      week: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.getDate()}`,
      stats: {
        entriesWritten,
        tasksCompleted,
        tasksPlanned,
        completionRate: Math.round(completionRate),
        averageMood: Math.round(averageMood * 10) / 10,
        totalWords,
        streakMaintained: entriesWritten >= 6,
        perfectDays
      },
      highlights,
      insights: {
        bestDay: journals[0] || null,
        improvement: "Keep up the great work!",
        suggestion: "Try adding a morning routine task"
      }
    });
  } catch (err) {
    console.error("Error generating weekly summary:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});
router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals } = req.body;
    
    const capsuleRef = db.collection("users")
      .doc(req.uid)
      .collection("timeCapsules")
      .doc();
    
    const unlockTimestamp = new Date(unlockDate);
    const daysUntilUnlock = Math.floor(
      (unlockTimestamp - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    await capsuleRef.set({
      capsuleId: capsuleRef.id,
      userId: req.uid,
      message,
      createdAt: new Date(),
      unlockDate: unlockTimestamp,
      currentMood,
      currentGoals,
      isUnlocked: false,
      unlockedAt: null,
      notificationSent: false
    });
    
    res.json({
      capsuleId: capsuleRef.id,
      unlockDate,
      daysUntilUnlock
    });
  } catch (err) {
    console.error("Error creating time capsule:", err);
    res.status(500).json({ error: "Failed to create time capsule" });
  }
});

router.get("/timecapsule/list", verifyToken, async (req, res) => {
  try {
    const capsulesRef = db.collection("users").doc(req.uid).collection("timeCapsules");
    const snapshot = await capsulesRef.orderBy("createdAt", "desc").get();
    
    const locked = [];
    const unlocked = [];
    const now = new Date();
    
    snapshot.forEach(doc => {
      const capsule = doc.data();
      const unlockDate = capsule.unlockDate.toDate();
      
      if (unlockDate <= now || capsule.isUnlocked) {
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0]
        });
      } else {
        const daysUntilUnlock = Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24));
        locked.push({
          capsuleId: capsule.capsuleId,
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          unlockDate: unlockDate.toISOString().split('T')[0],
          daysUntilUnlock
        });
      }
    });
    
    res.json({ locked, unlocked });
  } catch (err) {
    console.error("Error fetching time capsules:", err);
    res.status(500).json({ error: "Failed to fetch time capsules" });
  }
});
router.post("/gratitude/add", verifyToken, async (req, res) => {
  try {
    const { gratitudeText, mood } = req.body;
    
    if (!gratitudeText || !gratitudeText.trim()) {
      return res.status(400).json({ error: "Gratitude text is required" });
    }
    
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: "Mood must be between 1 and 5" });
    }
    
    const gratitudeRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries")
      .doc();
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    await gratitudeRef.set({
      gratitudeId: gratitudeRef.id,
      userId: req.uid,
      gratitudeText: gratitudeText.trim(),
      date: dateStr,
      mood,
      createdAt: now
    });
    
    res.json({
      gratitudeId: gratitudeRef.id,
      success: true
    });
  } catch (err) {
    console.error("Error adding gratitude:", err);
    res.status(500).json({ error: "Failed to add gratitude entry" });
  }
});

// GET /journal/gratitude/random
router.get("/gratitude/random", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users")
      .doc(req.uid)
      .collection("gratitudeEntries");
    
    const snapshot = await gratitudesRef.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: "No gratitude entries found" });
    }
    
    // Get random entry
    const entries = [];
    snapshot.forEach(doc => {
      entries.push(doc.data());
    });
    
    const randomEntry = entries[Math.floor(Math.random() * entries.length)];
    
    res.json({
      gratitudeId: randomEntry.gratitudeId,
      gratitudeText: randomEntry.gratitudeText,
      date: randomEntry.date,
      mood: randomEntry.mood
    });
  } catch (err) {
    console.error("Error fetching random gratitude:", err);
    res.status(500).json({ error: "Failed to fetch random gratitude" });
  }
});
router.post("/assistant/reply-with-context", verifyToken, async (req, res) => {
  const { message, sessionId, includeHistory } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "I'm here, tell me what's on your mind 🌿" });
  }

  try {
    let context = [];
    
    // Load conversation history if requested
    if (includeHistory && sessionId) {
      const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
      const sessionDoc = await sessionRef.get();
      
      if (sessionDoc.exists) {
        const sessionData = sessionDoc.data();
        context = sessionData.messages?.slice(-10) || []; // Last 10 messages
      }
    }

    // Add current message to context
    context.push({ role: "user", content: message, timestamp: new Date().toISOString() });

    // Build prompt with context
    let contextPrompt = `You are a soft-spoken, gentle emotional companion.
Respond in under 2 sentences.
Tone: calming, validating, grounding.

`;

    // Add conversation history to prompt
    if (context.length > 1) {
      contextPrompt += "Previous conversation:\n";
      context.slice(0, -1).forEach(msg => {
        contextPrompt += `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}\n`;
      });
      contextPrompt += "\n";
    }

    contextPrompt += `User said: "${message}"

Reply like:
- "I'm here with you…"
- "That sounds heavy…"
- "You're doing the best you can."

Avoid:
- Questions unless needed
- Long paragraphs
- Overly formal tone`;

    // Call Gemini AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: contextPrompt }]
          }]
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here with you. Tell me more 🌿";

    // Save to session (async, don't wait)
    context.push({ role: "assistant", content: reply, timestamp: new Date().toISOString() });
    
    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    sessionRef.set({
      sessionId,
      messages: context.slice(-10), // Keep only last 10
      updatedAt: new Date(),
      lastMessage: reply.substring(0, 100)
    }, { merge: true }).catch(err => {
      console.error('Error saving session:', err);
    });

    res.json({
      reply,
      sessionId,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("AI Assistant Error:", err);
    res.json({ reply: "I'm here for you… even if my mind is a little foggy right now 🌫️" });
  }
});
// Get list of conversation sessions
router.get("/assistant/history", verifyToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0, search = '' } = req.query;
    const sessionsRef = db.collection("users").doc(req.uid).collection("aiSessions");
    
    let query = sessionsRef.orderBy("updatedAt", "desc");
    
    // Apply pagination
    const snapshot = await query.limit(parseInt(limit)).get();
    
    const sessions = [];
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    snapshot.forEach(doc => {
      const data = doc.data();
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
      const isArchived = updatedAt < ninetyDaysAgo;
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        const hasMatch = data.messages?.some(msg => 
          msg.content?.toLowerCase().includes(searchLower)
        );
        if (!hasMatch) return;
      }

      sessions.push({
        sessionId: doc.id,
        startedAt: data.messages?.[0]?.timestamp || (data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt),
        endedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        messageCount: data.messages?.length || 0,
        preview: data.messages?.[0]?.content?.substring(0, 100) || "",
        themes: data.themes || [],
        isArchived
      });
    });

    res.json({ sessions, total: sessions.length });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get specific conversation session
router.get("/assistant/history/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: "Session not found" });
    }

    const data = sessionDoc.data();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const isArchived = updatedAt < ninetyDaysAgo;

    res.json({
      sessionId: sessionDoc.id,
      messages: data.messages || [],
      themes: data.themes || [],
      startedAt: data.messages?.[0]?.timestamp || (data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt),
      endedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      messageCount: data.messages?.length || 0,
      isArchived
    });
  } catch (err) {
    console.error("Error fetching session:", err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Delete conversation session
router.delete("/assistant/history/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    
    await sessionRef.delete();
    
    res.json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});
// Get conversation context for a session
router.get("/assistant/context", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const sessionRef = db.collection("users").doc(req.uid).collection("aiSessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.json({
        messages: [],
        messageCount: 0,
        sessionStarted: null
      });
    }

    const sessionData = sessionDoc.data();

    res.json({
      messages: sessionData.messages || [],
      messageCount: sessionData.messageCount || 0,
      sessionStarted: sessionData.updatedAt
    });

  } catch (error) {
    console.error("Error fetching context:", error);
    res.status(500).json({ error: "Failed to fetch context" });
  }
});
// ==========================================
// 🎮 QUEST SYSTEM ENDPOINTS
// ==========================================

/**
 * GET /journal/quests/active
 * Get all active quests for a user
 */
router.get("/quests/active", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const now = new Date();

    // Check and generate new quests if needed
    await checkAndGenerateQuests(userId);

    // Get active quests
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");
    const snapshot = await questsRef
      .where("status", "==", "active")
      .where("expiresAt", ">", now)
      .get();

    const quests = { daily: [], weekly: [], monthly: [] };

    snapshot.forEach(doc => {
      const quest = { id: doc.id, ...doc.data() };
      // Convert Firestore Timestamp to ISO string
      if (quest.createdAt && quest.createdAt.toDate) {
        quest.createdAt = quest.createdAt.toDate().toISOString();
      }
      if (quest.expiresAt && quest.expiresAt.toDate) {
        quest.expiresAt = quest.expiresAt.toDate().toISOString();
      }
      if (quest.completedAt && quest.completedAt.toDate) {
        quest.completedAt = quest.completedAt.toDate().toISOString();
      }
      quests[quest.type].push(quest);
    });

    res.json(quests);
  } catch (err) {
    console.error("Error fetching active quests:", err);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});
router.get("/quests/all", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const now = new Date();
    
    // Check and generate new quests if needed
    await checkAndGenerateQuests(userId);
    
    // Get ALL quests (both active and completed) that haven't expired
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");
    
    // Fetch quests that are either:
    // 1. Active and not expired
    // 2. Completed today/this week/this month (depending on type)
    const snapshot = await questsRef
      .where("expiresAt", ">", now)
      .get();
    
    const quests = { daily: [], weekly: [], monthly: [] };
    
    snapshot.forEach(doc => {
      const quest = { id: doc.id, ...doc.data() };
      
      // Convert Firestore Timestamp to ISO string
      if (quest.createdAt && quest.createdAt.toDate) {
        quest.createdAt = quest.createdAt.toDate().toISOString();
      }
      if (quest.expiresAt && quest.expiresAt.toDate) {
        quest.expiresAt = quest.expiresAt.toDate().toISOString();
      }
      if (quest.completedAt && quest.completedAt.toDate) {
        quest.completedAt = quest.completedAt.toDate().toISOString();
      }
      
      // Include both active and completed quests
      if (quest.status === "active" || quest.status === "completed") {
        quests[quest.type].push(quest);
      }
    });
    
    res.json(quests);
  } catch (err) {
    console.error("Error fetching all quests:", err);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});
/**
 * POST /journal/quests/progress
 * Update progress for a specific quest
 */
// router.post("/quests/progress", verifyToken, async (req, res) => {
//   try {
//     const userId = req.uid;
//     const { questId, progress } = req.body;

//     if (!questId || progress === undefined) {
//       return res.status(400).json({ error: "Missing required fields: questId, progress" });
//     }

//     const userRef = db.collection("users").doc(userId);
//     const questRef = userRef.collection("quests").doc(questId);
//     const questDoc = await questRef.get();

//     if (!questDoc.exists) {
//       return res.status(404).json({ error: "Quest not found" });
//     }

//     const quest = questDoc.data();

//     // Check if quest is expired
//     const expiresAt = quest.expiresAt.toDate ? quest.expiresAt.toDate() : new Date(quest.expiresAt);
//     if (expiresAt < new Date()) {
//       return res.status(400).json({ error: "Quest has expired" });
//     }

//     // Update progress
//     const newProgress = Math.min(progress, quest.target);
//     const completed = newProgress >= quest.target;

//     await questRef.update({
//       progress: newProgress,
//       status: completed ? "completed" : "active",
//       completedAt: completed ? new Date() : null
//     });

//     let newLevel = null;

//     // Award XP if completed
//     if (completed && quest.status !== "completed") {
//       const userDoc = await userRef.get();
//       const userData = userDoc.exists ? userDoc.data() : {
//         totalXP: 0,
//         currentLevel: 1,
//         questsCompleted: 0
//       };

//       const newTotalXP = (userData.totalXP || 0) + quest.reward.xp;
//       const currentLevel = calculateLevel(newTotalXP);
//       const leveledUp = currentLevel > (userData.currentLevel || 1);

//       if (leveledUp) {
//         newLevel = currentLevel;
//       }

//       await userRef.set({
//         totalXP: newTotalXP,
//         currentLevel,
//         questsCompleted: (userData.questsCompleted || 0) + 1
//       }, { merge: true });
//     }

//     res.json({
//       completed,
//       reward: completed ? quest.reward : null,
//       newLevel
//     });
//   } catch (err) {
//     console.error("Error updating quest progress:", err);
//     res.status(500).json({ error: "Failed to update quest progress" });
//   }
// });

/**
 * POST /journal/quests/complete
 * Mark a quest as completed
 */
router.post("/quests/complete", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { questId } = req.body;

    if (!questId) {
      return res.status(400).json({ error: "Missing required field: questId" });
    }

    const userRef = db.collection("users").doc(userId);
    const questRef = userRef.collection("quests").doc(questId);
    const questDoc = await questRef.get();

    if (!questDoc.exists) {
      return res.status(404).json({ error: "Quest not found" });
    }

    const quest = questDoc.data();

    // Update quest to completed
    await questRef.update({
      progress: quest.target,
      status: "completed",
      completedAt: new Date()
    });

    // Award XP
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {
      totalXP: 0,
      currentLevel: 1,
      questsCompleted: 0
    };

    const newTotalXP = (userData.totalXP || 0) + quest.reward.xp;
    const currentLevel = calculateLevel(newTotalXP);
    const leveledUp = currentLevel > (userData.currentLevel || 1);

    await userRef.set({
      totalXP: newTotalXP,
      currentLevel,
      questsCompleted: (userData.questsCompleted || 0) + 1
    }, { merge: true });

    res.json({
      completed: true,
      reward: quest.reward,
      newLevel: leveledUp ? currentLevel : null
    });
  } catch (err) {
    console.error("Error completing quest:", err);
    res.status(500).json({ error: "Failed to complete quest" });
  }
});

/**
 * GET /journal/user/stats
 * Get detailed user statistics
 */
router.get("/user/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.json({
        totalXP: 0,
        currentLevel: 1,
        questsCompleted: 0,
        stats: {
          totalJournalEntries: 0,
          totalTasksCompleted: 0,
          longestStreak: 0,
          perfectDays: 0
        }
      });
    }

    const userData = userDoc.data();
    res.json({
      totalXP: userData.totalXP || 0,
      currentLevel: userData.currentLevel || 1,
      questsCompleted: userData.questsCompleted || 0,
      stats: userData.stats || {
        totalJournalEntries: 0,
        totalTasksCompleted: 0,
        longestStreak: 0,
        perfectDays: 0
      }
    });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

// ==========================================
// 📋 QUEST TEMPLATES
// ==========================================

const DAILY_QUEST_TEMPLATES = [
  {
    id: 'daily_write_100',
    title: 'Write 100 words',
    description: 'Express yourself with at least 100 words today',
    target: 100,
    reward: { xp: 10, badge: null },
    trackingType: 'word_count'
  },
  {
    id: 'daily_complete_3_tasks',
    title: 'Complete 3 tasks',
    description: 'Check off 3 tasks from your planner',
    target: 3,
    reward: { xp: 15, badge: null },
    trackingType: 'task_completion'
  },
  {
    id: 'daily_journal_entry',
    title: 'Write a journal entry',
    description: 'Create at least one journal entry today',
    target: 1,
    reward: { xp: 10, badge: null },
    trackingType: 'journal_entry'
  },
  {
    id: 'daily_mood_check',
    title: 'Log your mood',
    description: 'Record how you\'re feeling today',
    target: 1,
    reward: { xp: 5, badge: null },
    trackingType: 'mood_log'
  }
];

const WEEKLY_QUEST_TEMPLATES = [
  {
    id: 'weekly_journal_5_days',
    title: 'Journal 5 days this week',
    description: 'Write journal entries on 5 different days',
    target: 5,
    reward: { xp: 50, badge: null },
    trackingType: 'journal_days'
  },
  {
    id: 'weekly_maintain_streak',
    title: 'Maintain your streak',
    description: 'Don\'t miss a day of journaling this week',
    target: 7,
    reward: { xp: 75, badge: null },
    trackingType: 'streak_days'
  },
  {
    id: 'weekly_complete_20_tasks',
    title: 'Complete 20 tasks',
    description: 'Check off 20 tasks from your planner this week',
    target: 20,
    reward: { xp: 60, badge: null },
    trackingType: 'task_completion'
  },
  {
    id: 'weekly_try_3_categories',
    title: 'Try 3 task categories',
    description: 'Complete tasks from at least 3 different categories',
    target: 3,
    reward: { xp: 40, badge: null },
    trackingType: 'category_variety'
  }
];

const MONTHLY_QUEST_TEMPLATES = [
  {
    id: 'monthly_20_entries',
    title: 'Write 20 journal entries',
    description: 'Create 20 journal entries this month',
    target: 20,
    reward: { xp: 150, badge: null },
    trackingType: 'journal_entry'
  },
  {
    id: 'monthly_all_categories',
    title: 'Try all task categories',
    description: 'Complete tasks from every category',
    target: 6,
    reward: { xp: 100, badge: null },
    trackingType: 'category_variety'
  },
  {
    id: 'monthly_perfect_week',
    title: 'Achieve a perfect week',
    description: 'Complete all tasks for 7 consecutive days',
    target: 7,
    reward: { xp: 200, badge: 'perfect_week' },
    trackingType: 'perfect_days'
  },
  {
    id: 'monthly_5000_words',
    title: 'Write 5,000 words',
    description: 'Write a total of 5,000 words this month',
    target: 5000,
    reward: { xp: 175, badge: null },
    trackingType: 'word_count'
  }
];

// ==========================================
// 🎮 HELPER FUNCTIONS
// ==========================================

/**
 * Calculate user level based on total XP
 */
function calculateLevel(totalXP) {
  const levels = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000, 26000, 33000, 41000, 50000];
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i]) {
      return i + 1;
    }
  }
  
  return 1;
}

/**
 * Calculate XP required for next level
 */
function calculateXPForNextLevel(currentLevel) {
  const levels = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000, 26000, 33000, 41000, 50000];
  
  if (currentLevel >= levels.length) {
    return levels[levels.length - 1] + (currentLevel - levels.length + 1) * 10000;
  }
  
  return levels[currentLevel];
}

/**
 * Select random templates ensuring variety
 */
function selectRandomTemplates(templates, count) {
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Calculate expiration date for quest period
 */
function calculateExpirationDate(period) {
  const now = new Date();
  
  switch (period) {
    case 'daily':
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay;
    
    case 'weekly':
      const endOfWeek = new Date(now);
      const daysUntilSaturday = 6 - now.getDay();
      endOfWeek.setDate(now.getDate() + daysUntilSaturday);
      endOfWeek.setHours(23, 59, 59, 999);
      return endOfWeek;
    
    case 'monthly':
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return endOfMonth;
    
    default:
      return now;
  }
}

/**
 * Check if new quests should be generated for a period
 */
function shouldGenerateNewQuests(lastGeneration, period) {
  if (!lastGeneration) return true;

  const now = new Date();
  const lastGen = new Date(lastGeneration);

  switch (period) {
    case 'daily':
      return now.toDateString() !== lastGen.toDateString();
    
    case 'weekly':
      const nowWeekStart = new Date(now);
      nowWeekStart.setDate(now.getDate() - now.getDay());
      nowWeekStart.setHours(0, 0, 0, 0);
      
      const lastWeekStart = new Date(lastGen);
      lastWeekStart.setDate(lastGen.getDate() - lastGen.getDay());
      lastWeekStart.setHours(0, 0, 0, 0);
      
      return nowWeekStart.getTime() > lastWeekStart.getTime();
    
    case 'monthly':
      return now.getMonth() !== lastGen.getMonth() || 
             now.getFullYear() !== lastGen.getFullYear();
    
    default:
      return false;
  }
}

/**
 * Generate quests for a specific period
 */
async function generateQuestsForPeriod(userId, period) {
  const userRef = db.collection("users").doc(userId);
  const questsRef = userRef.collection("quests");
  const generatedQuests = [];
  const now = new Date();

  let templates, count;
  
  if (period === 'daily') {
    templates = selectRandomTemplates(DAILY_QUEST_TEMPLATES, 2);
    count = 2;
  } else if (period === 'weekly') {
    templates = selectRandomTemplates(WEEKLY_QUEST_TEMPLATES, 2);
    count = 2;
  } else if (period === 'monthly') {
    templates = selectRandomTemplates(MONTHLY_QUEST_TEMPLATES, 1);
    count = 1;
  }

  const expiresAt = calculateExpirationDate(period);

  for (const template of templates) {
    const questRef = questsRef.doc();
    const quest = {
      userId,
      type: period,
      title: template.title,
      description: template.description,
      target: template.target,
      progress: 0,
      reward: template.reward,
      status: 'active',
      trackingType: template.trackingType,
      createdAt: now,
      expiresAt,
      completedAt: null,
      expiredAt: null
    };

    await questRef.set(quest);
    generatedQuests.push({ id: questRef.id, ...quest });
  }

  return generatedQuests;
}

/**
 * Check and generate new quests if needed
 */
async function checkAndGenerateQuests(userId) {
  const now = new Date();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};
  
  const lastGen = userData.lastQuestGeneration || {};
  const newQuests = [];

  // Check daily
  if (shouldGenerateNewQuests(lastGen.daily, 'daily')) {
    const dailyQuests = await generateQuestsForPeriod(userId, 'daily');
    newQuests.push(...dailyQuests);
    lastGen.daily = now.toISOString();
  }

  // Check weekly
  if (shouldGenerateNewQuests(lastGen.weekly, 'weekly')) {
    const weeklyQuests = await generateQuestsForPeriod(userId, 'weekly');
    newQuests.push(...weeklyQuests);
    lastGen.weekly = now.toISOString();
  }

  // Check monthly
  if (shouldGenerateNewQuests(lastGen.monthly, 'monthly')) {
    const monthlyQuests = await generateQuestsForPeriod(userId, 'monthly');
    newQuests.push(...monthlyQuests);
    lastGen.monthly = now.toISOString();
  }

  // Update last generation timestamps
  if (newQuests.length > 0) {
    await userRef.set({
      lastQuestGeneration: lastGen
    }, { merge: true });
  }

  return newQuests;
}

// ==========================================
// 🎯 QUEST ENDPOINTS
// ==========================================

/**
 * GET /journal/quests/active
 * Get all active quests for a user
 */
router.get("/quests/active", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const now = new Date();

    // Check and generate new quests if needed
    await checkAndGenerateQuests(userId);

    // Get active quests
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");
    const snapshot = await questsRef
      .where("status", "==", "active")
      .where("expiresAt", ">", now)
      .get();

    const quests = { daily: [], weekly: [], monthly: [] };

    snapshot.forEach(doc => {
      const quest = { id: doc.id, ...doc.data() };
      // Convert Firestore Timestamp to ISO string
      if (quest.createdAt && quest.createdAt.toDate) {
        quest.createdAt = quest.createdAt.toDate().toISOString();
      }
      if (quest.expiresAt && quest.expiresAt.toDate) {
        quest.expiresAt = quest.expiresAt.toDate().toISOString();
      }
      if (quest.completedAt && quest.completedAt.toDate) {
        quest.completedAt = quest.completedAt.toDate().toISOString();
      }
      quests[quest.type].push(quest);
    });

    res.json(quests);
  } catch (err) {
    console.error("Error fetching active quests:", err);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

/**
 * POST /journal/quests/progress
 * Update progress for a specific quest
 */
router.post("/quests/progress", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { questType, progress, date, metadata } = req.body;

    if (!questType || progress === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");
    
    // Find active quest of this type
    const snapshot = await questsRef
      .where("status", "==", "active")
      .where("trackingType", "==", questType)
      .get();

    if (snapshot.empty) {
      return res.json({ message: "No active quest found for this type" });
    }

    const completedQuests = [];

    for (const doc of snapshot.docs) {
      const quest = doc.data();
      const questRef = questsRef.doc(doc.id);

      // Check if quest is expired
      const expiresAt = quest.expiresAt.toDate ? quest.expiresAt.toDate() : new Date(quest.expiresAt);
      if (expiresAt < new Date()) {
        continue;
      }

      // Update progress
      const newProgress = Math.min(quest.progress + progress, quest.target);
      const completed = newProgress >= quest.target;

      await questRef.update({
        progress: newProgress,
        status: completed ? "completed" : "active",
        completedAt: completed ? new Date() : null
      });

      // Award XP if completed
      if (completed && quest.status !== "completed") {
        const userDoc = await userRef.get();
        const userData = userDoc.exists ? userDoc.data() : {
          totalXP: 0,
          currentLevel: 1,
          questsCompleted: 0
        };

        const newTotalXP = (userData.totalXP || 0) + quest.reward.xp;
        const currentLevel = calculateLevel(newTotalXP);
        const leveledUp = currentLevel > (userData.currentLevel || 1);

        await userRef.set({
          totalXP: newTotalXP,
          currentLevel,
          questsCompleted: (userData.questsCompleted || 0) + 1
        }, { merge: true });

        completedQuests.push({
          id: doc.id,
          title: quest.title,
          reward: quest.reward,
          leveledUp,
          newLevel: leveledUp ? currentLevel : null
        });
      }
    }

    res.json({
      success: true,
      completedQuests
    });
  } catch (err) {
    console.error("Error updating quest progress:", err);
    res.status(500).json({ error: "Failed to update quest progress" });
  }
});

/**
 * POST /journal/quests/check-completions
 * Check for completed quests and return rewards
 */
router.post("/quests/check-completions", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");

    // Get all completed quests that haven't been acknowledged
    const snapshot = await questsRef
      .where("status", "==", "completed")
      .get();

    const completedQuests = [];
    let totalXP = 0;

    snapshot.forEach(doc => {
      const quest = doc.data();
      completedQuests.push({
        id: doc.id,
        title: quest.title,
        reward: quest.reward
      });
      totalXP += quest.reward.xp;
    });

    res.json({
      completedQuests,
      xpAwarded: totalXP,
      leveledUp: false // This would be calculated based on XP
    });
  } catch (err) {
    console.error("Error checking quest completions:", err);
    res.status(500).json({ error: "Failed to check completions" });
  }
});

/**
 * POST /journal/quests/check-expiration
 * Check for expired quests and generate new ones
 */
router.post("/quests/check-expiration", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const now = new Date();
    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");

    // Find all active quests
    const activeQuests = await questsRef
      .where("status", "==", "active")
      .get();

    const expiredQuests = [];

    // Check each quest for expiration
    for (const doc of activeQuests.docs) {
      const quest = doc.data();
      const expiresAt = quest.expiresAt.toDate ? quest.expiresAt.toDate() : new Date(quest.expiresAt);
      
      if (now > expiresAt) {
        // Mark quest as expired
        await questsRef.doc(doc.id).update({
          status: 'expired',
          expiredAt: now
        });
        
        expiredQuests.push({
          id: doc.id,
          type: quest.type,
          title: quest.title,
          status: 'expired'
        });
      }
    }

    // Generate new quests if needed
    const newQuests = await checkAndGenerateQuests(userId);

    res.json({
      success: true,
      expiredQuests,
      newQuests,
      message: `Expired ${expiredQuests.length} quest(s) and generated ${newQuests.length} new quest(s)`
    });
  } catch (err) {
    console.error("Error checking quest expiration:", err);
    res.status(500).json({ error: "Failed to check quest expiration" });
  }
});

/**
 * GET /journal/quests/last-generation
 * Get last quest generation timestamps
 */
router.get("/quests/last-generation", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const lastGeneration = userData.lastQuestGeneration || {};
    
    res.json({
      daily: lastGeneration.daily || null,
      weekly: lastGeneration.weekly || null,
      monthly: lastGeneration.monthly || null
    });
  } catch (err) {
    console.error("Error fetching last generation:", err);
    res.status(500).json({ error: "Failed to fetch last generation" });
  }
});

/**
 * POST /journal/quests/rotate
 * Manually rotate quests for a specific period (testing)
 */
router.post("/quests/rotate", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { period } = req.body;

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: "Invalid period" });
    }

    const userRef = db.collection("users").doc(userId);
    const questsRef = userRef.collection("quests");

    // Mark all active quests of this period as expired
    const activeQuests = await questsRef
      .where("type", "==", period)
      .where("status", "==", "active")
      .get();

    const batch = db.batch();
    activeQuests.forEach(doc => {
      batch.update(doc.ref, {
        status: 'expired',
        expiredAt: new Date()
      });
    });
    await batch.commit();

    // Generate new quests
    const newQuests = await generateQuestsForPeriod(userId, period);

    // Update last generation timestamp
    await userRef.set({
      lastQuestGeneration: {
        [period]: new Date().toISOString()
      }
    }, { merge: true });

    res.json({
      success: true,
      newQuests,
      message: `Generated ${newQuests.length} new ${period} quest(s)`
    });
  } catch (err) {
    console.error("Error rotating quests:", err);
    res.status(500).json({ error: "Failed to rotate quests" });
  }
});

// ==========================================
// 💎 XP AND LEVELING ENDPOINTS
// ==========================================

/**
 * GET /journal/user/xp
 * Get user's XP and level information
 */
router.get("/user/xp", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    const userData = userDoc.exists ? userDoc.data() : {
      totalXP: 0,
      currentLevel: 1
    };

    const totalXP = userData.totalXP || 0;
    const currentLevel = userData.currentLevel || 1;
    const xpForNextLevel = calculateXPForNextLevel(currentLevel);

    res.json({
      totalXP,
      currentLevel,
      xpForNextLevel,
      xpProgress: totalXP,
      levelUpThreshold: xpForNextLevel
    });
  } catch (err) {
    console.error("Error fetching user XP:", err);
    res.status(500).json({ error: "Failed to fetch user XP" });
  }
});

/**
 * GET /journal/user/stats
 * Get detailed user statistics
 */
router.get("/user/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.json({
        totalXP: 0,
        currentLevel: 1,
        questsCompleted: 0,
        earnedBadges: [],
        stats: {
          totalJournalEntries: 0,
          totalTasksCompleted: 0,
          longestStreak: 0,
          perfectDays: 0
        }
      });
    }

    const userData = userDoc.data();
    res.json({
      totalXP: userData.totalXP || 0,
      currentLevel: userData.currentLevel || 1,
      questsCompleted: userData.questsCompleted || 0,
      earnedBadges: userData.earnedBadges || [],
      stats: userData.stats || {
        totalJournalEntries: 0,
        totalTasksCompleted: 0,
        longestStreak: 0,
        perfectDays: 0
      }
    });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

// ==========================================
// 🏆 BADGE ENDPOINTS
// ==========================================

/**
 * POST /journal/user/badge/award
 * Award a badge to a user
 */
router.post("/user/badge/award", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { badgeId } = req.body;

    if (!badgeId) {
      return res.status(400).json({ error: "Missing badgeId" });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { earnedBadges: [] };

    // Check if badge already earned
    if (userData.earnedBadges && userData.earnedBadges.includes(badgeId)) {
      return res.json({
        success: false,
        message: "Badge already earned"
      });
    }

    // Add badge to user's earned badges
    const earnedBadges = userData.earnedBadges || [];
    earnedBadges.push(badgeId);

    await userRef.set({
      earnedBadges
    }, { merge: true });

    res.json({
      success: true,
      badge: {
        id: badgeId,
        earnedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("Error awarding badge:", err);
    res.status(500).json({ error: "Failed to award badge" });
  }
});

// ==========================================
// 🎉 CELEBRATION ENDPOINT
// ==========================================

/**
 * GET /journal/planner/daily-status
 * Check if all tasks are completed for a specific day
 */
router.get("/planner/daily-status", verifyToken, async (req, res) => {
  try {
    const userId = req.uid;
    const dateParam = req.query.date;
    const yearMonth = dateParam ? dateParam.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const dateStr = dateParam || new Date().toISOString().split('T')[0];

    const userRef = db.collection("users").doc(userId);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const plannerDoc = await plannerRef.get();

    if (!plannerDoc.exists) {
      return res.json({
        allTasksComplete: false,
        stats: {
          totalTime: "0h 0m",
          tasksCompleted: 0,
          totalTasks: 0,
          streakDays: 0
        },
        reward: null
      });
    }

    const plannerData = plannerDoc.data();
    const dayTasks = plannerData.tasks || [];
    const dayCompletions = plannerData.completions?.[dateStr] || [];

    const totalTasks = dayTasks.length;
    const completedTasks = dayCompletions.length;
    const allTasksComplete = totalTasks > 0 && completedTasks === totalTasks;

    // Calculate total time
    let totalMinutes = 0;
    dayTasks.forEach(task => {
      if (dayCompletions.includes(task.id)) {
        totalMinutes += task.timeEstimate || 0;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Get streak from user data
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const streakDays = userData.currentStreak || 0;

    // Award Perfect Day badge if all tasks complete
    let reward = null;
    if (allTasksComplete) {
      const earnedBadges = userData.earnedBadges || [];
      const perfectDayBadgeId = `perfect_day_${dateStr}`;
      
      if (!earnedBadges.includes(perfectDayBadgeId)) {
        reward = {
          type: "badge",
          name: "Perfect Day",
          icon: "⭐",
          rarity: "rare"
        };

        earnedBadges.push(perfectDayBadgeId);
        const currentPerfectDays = userData.stats?.perfectDays || 0;

        await userRef.set({
          earnedBadges,
          stats: {
            ...userData.stats,
            perfectDays: currentPerfectDays + 1
          }
        }, { merge: true });
      }
    }

    res.json({
      allTasksComplete,
      stats: {
        totalTime,
        tasksCompleted: completedTasks,
        totalTasks,
        streakDays
      },
      reward
    });
  } catch (err) {
    console.error("Error checking daily status:", err);
    res.status(500).json({ error: "Failed to check daily status" });
  }
});

// ==========================================
// 💙 STREAK RECOVERY ENDPOINT
// ==========================================

/**
 * GET /journal/streak/recovery-message
 * Get compassionate message for broken streak
 */
router.get("/streak/recovery-message", verifyToken, async (req, res) => {
  try {
    // Fetch streak data from Raindrop
    const streakResponse = await fetch(`${process.env.RAINDROP_URL}/analytics/streaks?uid=${req.uid}`);
    
    if (!streakResponse.ok) {
      throw new Error('Failed to fetch streak data');
    }

    const streakData = await streakResponse.json();

    if (!streakData.streakBroken) {
      return res.json({ message: null });
    }

    const messages = {
      title: "Hey, are you okay? 💙",
      body: "We noticed you missed yesterday. Life happens, and that's completely okay.",
      encouragement: `Your ${streakData.previousStreak}-day streak was amazing! Ready to start fresh today?`,
      previousStreak: streakData.previousStreak
    };

    res.json(messages);
  } catch (err) {
    console.error("Error generating recovery message:", err);
    res.status(500).json({ error: "Failed to generate recovery message" });
  }
});
// ===========================================
// 🕰️ TIME CAPSULE FEATURE
// ===========================================

// Create time capsule
router.post("/timecapsule/create", verifyToken, async (req, res) => {
  try {
    const { message, unlockDate, currentMood, currentGoals } = req.body;
    
    if (!message || !unlockDate) {
      return res.status(400).json({ error: "Message and unlock date required" });
    }
    
    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc();
    const unlockTimestamp = new Date(unlockDate);
    const now = new Date();
    const daysUntilUnlock = Math.floor((unlockTimestamp - now) / (1000 * 60 * 60 * 24));
    
    await capsuleRef.set({
      capsuleId: capsuleRef.id,
      userId: req.uid,
      message,
      createdAt: new Date(),
      unlockDate: unlockTimestamp,
      currentMood: currentMood || null,
      currentGoals: currentGoals || [],
      isUnlocked: false,
      unlockedAt: null,
      notificationSent: false
    });
    
    res.json({
      capsuleId: capsuleRef.id,
      unlockDate,
      daysUntilUnlock
    });
  } catch (err) {
    console.error("Error creating time capsule:", err);
    res.status(500).json({ error: "Failed to create time capsule" });
  }
});

// List time capsules (locked and unlocked)
router.get("/timecapsule/list", verifyToken, async (req, res) => {
  try {
    const capsulesRef = db.collection("users").doc(req.uid).collection("timeCapsules");
    const snapshot = await capsulesRef.orderBy("createdAt", "desc").get();
    
    const locked = [];
    const unlocked = [];
    const now = new Date();
    
    snapshot.forEach(doc => {
      const capsule = doc.data();
      const unlockDate = capsule.unlockDate.toDate();
      
      if (unlockDate <= now || capsule.isUnlocked) {
        // Capsule is unlocked
        unlocked.push({
          ...capsule,
          unlockDate: unlockDate.toISOString().split('T')[0],
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0]
        });
      } else {
        // Capsule is still locked
        const daysUntilUnlock = Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24));
        locked.push({
          capsuleId: capsule.capsuleId,
          createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
          unlockDate: unlockDate.toISOString().split('T')[0],
          daysUntilUnlock
        });
      }
    });
    
    res.json({ locked, unlocked });
  } catch (err) {
    console.error("Error fetching time capsules:", err);
    res.status(500).json({ error: "Failed to fetch time capsules" });
  }
});

// Get specific time capsule (only if unlocked)
router.get("/timecapsule/:capsuleId", verifyToken, async (req, res) => {
  try {
    const { capsuleId } = req.params;
    const capsuleRef = db.collection("users").doc(req.uid).collection("timeCapsules").doc(capsuleId);
    const capsuleDoc = await capsuleRef.get();
    
    if (!capsuleDoc.exists) {
      return res.status(404).json({ error: "Time capsule not found" });
    }
    
    const capsule = capsuleDoc.data();
    const unlockDate = capsule.unlockDate.toDate();
    const now = new Date();
    
    // Check if capsule is still locked
    if (unlockDate > now && !capsule.isUnlocked) {
      return res.status(403).json({ 
        error: "Time capsule is still locked",
        unlockDate: unlockDate.toISOString().split('T')[0],
        daysUntilUnlock: Math.floor((unlockDate - now) / (1000 * 60 * 60 * 24))
      });
    }
    
    // Mark as unlocked if it wasn't already
    if (!capsule.isUnlocked) {
      await capsuleRef.update({
        isUnlocked: true,
        unlockedAt: new Date()
      });
    }
    
    res.json({
      ...capsule,
      unlockDate: unlockDate.toISOString().split('T')[0],
      createdAt: capsule.createdAt.toDate().toISOString().split('T')[0],
      unlockedAt: capsule.unlockedAt ? capsule.unlockedAt.toDate().toISOString().split('T')[0] : null
    });
  } catch (err) {
    console.error("Error fetching time capsule:", err);
    res.status(500).json({ error: "Failed to fetch time capsule" });
  }
});

// ===========================================
// 🙏 GRATITUDE JAR FEATURE
// ===========================================

// Add gratitude entry
router.post("/gratitude/add", verifyToken, async (req, res) => {
  try {
    const { gratitudeText, mood } = req.body;
    
    if (!gratitudeText || !gratitudeText.trim()) {
      return res.status(400).json({ error: "Gratitude text required" });
    }
    
    const gratitudeRef = db.collection("users").doc(req.uid).collection("gratitudeEntries").doc();
    
    await gratitudeRef.set({
      gratitudeId: gratitudeRef.id,
      userId: req.uid,
      gratitudeText: gratitudeText.trim(),
      date: new Date().toISOString().split('T')[0],
      mood: mood || null,
      createdAt: new Date()
    });
    
    res.json({
      gratitudeId: gratitudeRef.id,
      success: true
    });
  } catch (err) {
    console.error("Error adding gratitude:", err);
    res.status(500).json({ error: "Failed to add gratitude" });
  }
});

// Get random gratitude entry
router.get("/gratitude/random", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users").doc(req.uid).collection("gratitudeEntries");
    const snapshot = await gratitudesRef.get();
    
    if (snapshot.empty) {
      return res.json({ gratitude: null });
    }
    
    const gratitudes = [];
    snapshot.forEach(doc => gratitudes.push(doc.data()));
    
    // Pick random gratitude
    const random = gratitudes[Math.floor(Math.random() * gratitudes.length)];
    
    res.json({
      gratitudeId: random.gratitudeId,
      gratitudeText: random.gratitudeText,
      date: random.date,
      mood: random.mood
    });
  } catch (err) {
    console.error("Error fetching random gratitude:", err);
    res.status(500).json({ error: "Failed to fetch gratitude" });
  }
});

// Get all gratitude entries
router.get("/gratitude/all", verifyToken, async (req, res) => {
  try {
    const gratitudesRef = db.collection("users").doc(req.uid).collection("gratitudeEntries");
    const snapshot = await gratitudesRef.orderBy("createdAt", "desc").get();
    
    const gratitudes = [];
    snapshot.forEach(doc => gratitudes.push(doc.data()));
    
    res.json({
      gratitudes,
      total: gratitudes.length
    });
  } catch (err) {
    console.error("Error fetching gratitudes:", err);
    res.status(500).json({ error: "Failed to fetch gratitudes" });
  }
});
export default router;

