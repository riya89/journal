// // import express from "express";
// // import fetch from "node-fetch"; // already built into node18+, else: npm i node-fetch

// // const router = express.Router();

// // // Simple static fallback prompts (for offline mode)
// // const fallbackPrompts = [
// //   "What made you smile today?",
// //   "What’s one thing you’re grateful for?",
// //   "Describe your day in a color or texture.",
// //   "What small act of kindness did you notice?",
// //   "If your mood were weather, what would it be?",
// // ];

// // // Gemini / AI-based daily prompt generation
// // router.get("/daily", async (req, res) => {
// //   try {
// //     const dateKey = new Date().toISOString().slice(0, 10);

// //     const response = await fetch(
// //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
// //   {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({
// //       contents: [
// //         {
// //           parts: [
// //             {
// //               text: "Generate 2 short comforting self-reflection prompts for journaling. Each should sound natural, emotional, and less than 15 words.",
// //             },
// //           ],
// //         },
// //       ],
// //     }),
// //   }
// // );

// // const data = await response.json();

// // const prompts =
// //   data?.candidates?.[0]?.content?.parts?.map((p) => p.text) ||
// //   fallbackPrompts.slice(0, 2);

// //     res.json({ date: dateKey, prompts });
// //   } catch (err) {
// //     console.error("Error fetching prompts:", err);
// //     res.json({ prompts: fallbackPrompts.slice(0, 2) });
// //   }
// // });

// // export default router;
// import express from "express";
// import fetch from "node-fetch";
// import { db } from "../firebase.js";  // ✅ use Firestore

// const router = express.Router();

// const fallbackPrompts = [
//   "What made you smile today?",
//   "What’s one thing you’re grateful for?",
//   "Describe your day in a color or texture.",
//   "What small act of kindness did you notice?",
//   "If your mood were weather, what would it be?",
// ];

// // ✅ Get or create daily prompts
// router.get("/daily", async (req, res) => {
//   try {
//     const dateKey = new Date().toISOString().slice(0, 10);
//     const promptRef = db.collection("dailyPrompts").doc(dateKey);
//     const existingDoc = await promptRef.get();

//     // ✅ 1️⃣ If already exists, return cached prompts
//     if (existingDoc.exists) {
//       return res.json({ date: dateKey, prompts: existingDoc.data().prompts });
//     }

//     // ✅ 2️⃣ Else, generate new prompts (via Gemini or fallback)
//     let prompts = [];
//     try {
//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               {
//                 parts: [
//                   {
//                     text: "Generate 2 short comforting self-reflection prompts for journaling. Each should sound natural, emotional, and under 15 words.",
//                   },
//                 ],
//               },
//             ],
//           }),
//         }
//       );

//       const data = await response.json();
//       prompts =
//         data?.candidates?.[0]?.content?.parts?.map((p) => p.text.trim()) ||
//         fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
//     } catch (apiError) {
//       console.error("Gemini error:", apiError);
//       prompts = fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
//     }

//     // ✅ 3️⃣ Store in Firestore so it’s consistent for that day
//     await promptRef.set({
//       date: dateKey,
//       prompts,
//       createdAt: new Date(),
//     });

//     res.json({ date: dateKey, prompts });
//   } catch (err) {
//     console.error("Error fetching prompts:", err);
//     res.json({ prompts: fallbackPrompts.slice(0, 2) });
//   }
// });

// export default router;
import express from "express";
import fetch from "node-fetch";
import { db } from "../firebase.js";

const router = express.Router();

const fallbackPrompts = [
  "What made you smile today?",
  "What’s one thing you’re grateful for?",
  "Describe your day in a color or texture.",
  "What small act of kindness did you notice?",
  "If your mood were weather, what would it be?",
];

// ✅ Get or create daily prompts
router.get("/daily", async (req, res) => {
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    const promptRef = db.collection("dailyPrompts").doc(dateKey);
    const existingDoc = await promptRef.get();

    if (existingDoc.exists) {
      return res.json({ date: dateKey, prompts: existingDoc.data().prompts });
    }

    let prompts = [];
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Generate 2 short comforting self-reflection prompts for journaling. Each should sound natural, emotional, and under 15 words.",
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      prompts =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text.trim()) ||
        fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
    } catch (apiError) {
      console.error("Gemini error:", apiError);
      prompts = fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
    }

    await promptRef.set({
      date: dateKey,
      prompts,
      createdAt: new Date(),
    });

    res.json({ date: dateKey, prompts });
  } catch (err) {
    console.error("Error fetching prompts:", err);
    res.json({ prompts: fallbackPrompts.slice(0, 2) });
  }
});

export default router;
