// // // // import { Service } from "@liquidmetal-ai/raindrop-framework";
// // // // import { Env } from "./raindrop.gen";

// // // // export default class extends Service<Env> {
// // // //   async fetch(request: Request): Promise<Response> {
// // // //     const url = new URL(request.url);
// // // //     const path = url.pathname;
// // // //     const method = request.method;

// // // //     // CORS Preflight
// // // //     if (method === "OPTIONS") {
// // // //       return new Response(null, {
// // // //         status: 204,
// // // //         headers: {
// // // //           "Access-Control-Allow-Origin": "*",
// // // //           "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
// // // //           "Access-Control-Allow-Headers": "Content-Type",
// // // //         },
// // // //       });
// // // //     }

// // // //     // Health checkpoint
// // // //     if (path === "/" && method === "GET") {
// // // //       return new Response("Journal Analytics Running ✔️");
// // // //     }

// // // //     // INIT DB
// // // //     if (path === "/analytics/init" && method === "POST") {
// // // //       return this.initSQL();
// // // //     }

// // // //     // INSERT ENTRY
// // // //     if (path === "/analytics/sync" && method === "POST") {
// // // //       return this.syncJournal(request);
// // // //     }

// // // //     // GET STREAKS
// // // //     if (path === "/analytics/streaks" && method === "GET") {
// // // //       const uid = url.searchParams.get("uid");
// // // //       if (!uid) return this.json({ error: "uid required" }, 400);
// // // //       return this.getStreaks(uid);
// // // //     }

// // // //     // DEBUG
// // // //     if (path === "/analytics/debug" && method === "GET") {
// // // //       const uid = url.searchParams.get("uid") || "";
// // // //       return this.debugDump(uid);
// // // //     }

// // // //     return this.json({ error: "Not Found" }, 404);
// // // //   }

// // // //   // -----------------------------------------
// // // //   // Helpers
// // // //   // -----------------------------------------
// // // //   json(data: any, status = 200): Response {
// // // //     return new Response(JSON.stringify(data), {
// // // //       status,
// // // //       headers: {
// // // //         "Content-Type": "application/json",
// // // //         "Access-Control-Allow-Origin": "*",
// // // //       },
// // // //     });
// // // //   }

// // // //   // -----------------------------------------
// // // //   // 0️⃣ INIT SQL DATABASE
// // // //   // -----------------------------------------
// // // //   async initSQL(): Promise<Response> {
// // // //     try {
// // // //       const db = this.env.JOURNALDB;

// // // //       const stmt = db.prepare(`
// // // //         CREATE TABLE IF NOT EXISTS journal_entries (
// // // //           id TEXT PRIMARY KEY,
// // // //           uid TEXT NOT NULL,
// // // //           entry_date TEXT NOT NULL,
// // // //           created_at TEXT DEFAULT CURRENT_TIMESTAMP
// // // //         )
// // // //       `);

// // // //       await stmt.run();

// // // //       return this.json({ status: "SQL DB initialized" });
// // // //     } catch (e) {
// // // //       console.error("INIT ERROR:", e);
// // // //       return this.json({ error: "init failed", details: String(e) }, 500);
// // // //     }
// // // //   }

// // // //   // -----------------------------------------
// // // //   // 1️⃣ INSERT ENTRY INTO SQL
// // // //   // -----------------------------------------
// // // //   async syncJournal(request: Request): Promise<Response> {
// // // //     try {
// // // //       const rawBody: unknown = await request.json();

// // // //       if (
// // // //         typeof rawBody !== "object" ||
// // // //         rawBody === null ||
// // // //         !("uid" in rawBody) ||
// // // //         !("date" in rawBody)
// // // //       ) {
// // // //         return this.json({ error: "uid and date required" }, 400);
// // // //       }

// // // //       const body = rawBody as { uid: string; date: string };

// // // //       const uid = body.uid;
// // // //       const date = body.date;
// // // //       const id = crypto.randomUUID();

// // // //       const stmt = this.env.JOURNALDB.prepare(
// // // //         "INSERT INTO journal_entries (id, uid, entry_date) VALUES (?, ?, ?)"
// // // //       );

// // // //       await stmt.bind(id, uid, date).run();

// // // //       return this.json({ status: "synced", id, uid, date });
// // // //     } catch (e) {
// // // //       console.error("SYNC ERROR:", e);
// // // //       return this.json({ error: "sync failed", details: String(e) }, 500);
// // // //     }
// // // //   }

// // // //   // -----------------------------------------
// // // //   // 2️⃣ CALCULATE STREAKS
// // // //   // -----------------------------------------
// // // //   async getStreaks(uid: string): Promise<Response> {
// // // //     try {
// // // //       const stmt = this.env.JOURNALDB.prepare(
// // // //         "SELECT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
// // // //       );

// // // //       const result = await stmt.bind(uid).all<{ entry_date: string }>();

// // // //       if (!result.results.length) {
// // // //         return this.json({
// // // //           uid,
// // // //           currentStreak: 0,
// // // //           longestStreak: 0,
// // // //           lastEntryDate: null,
// // // //         });
// // // //       }

// // // //       const dates = result.results
// // // //         .map((r: { entry_date: string }) => r.entry_date)
// // // //         .sort()
// // // //         .reverse();

// // // //       const dayDiff = (a: string, b: string) =>
// // // //         Math.floor(
// // // //           (new Date(a).getTime() - new Date(b).getTime()) / 86400000
// // // //         );

// // // //       let current = 1;
// // // //       let longest = 1;

// // // //       for (let i = 1; i < dates.length; i++) {
// // // //         const prev = dates[i - 1]!;
// // // //         const curr = dates[i]!;
// // // //         if (dayDiff(prev, curr) === 1) {
// // // //           current++;
// // // //         } else {
// // // //           longest = Math.max(longest, current);
// // // //           current = 1;
// // // //         }
// // // //       }

// // // //       longest = Math.max(longest, current);

// // // //       return this.json({
// // // //         uid,
// // // //         currentStreak: current,
// // // //         longestStreak: longest,
// // // //         lastEntryDate: dates[0],
// // // //         totalEntries: dates.length,
// // // //       });
// // // //     } catch (e) {
// // // //       console.error("STREAKS ERROR:", e);
// // // //       return this.json({ error: "streaks failed", details: String(e) }, 500);
// // // //     }
// // // //   }

// // // //   // -----------------------------------------
// // // //   // 3️⃣ DEBUG DUMP
// // // //   // -----------------------------------------
// // // //   async debugDump(uid: string): Promise<Response> {
// // // //     try {
// // // //       const stmt = this.env.JOURNALDB.prepare(
// // // //         "SELECT id, uid, entry_date, created_at FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
// // // //       );

// // // //       const rows = await stmt.bind(uid).all();

// // // //       return this.json({
// // // //         uid,
// // // //         count: rows.results.length,
// // // //         entries: rows.results,
// // // //       });
// // // //     } catch (e) {
// // // //       console.error("DEBUG ERROR:", e);
// // // //       return this.json({ error: "debug failed", details: String(e) }, 500);
// // // //     }
// // // //   }
// // // // }
// // // import { Service } from "@liquidmetal-ai/raindrop-framework";
// // // import { Env } from "./raindrop.gen";

// // // export default class extends Service<Env> {
// // //   async fetch(request: Request): Promise<Response> {
// // //     const url = new URL(request.url);
// // //     const path = url.pathname;
// // //     const method = request.method;

// // //     // CORS Preflight
// // //     if (method === "OPTIONS") {
// // //       return new Response(null, {
// // //         status: 204,
// // //         headers: {
// // //           "Access-Control-Allow-Origin": "*",
// // //           "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
// // //           "Access-Control-Allow-Headers": "Content-Type",
// // //         },
// // //       });
// // //     }

// // //     // Health checkpoint
// // //     if (path === "/" && method === "GET") {
// // //       return new Response("Journal Analytics Running ✔️");
// // //     }

// // //     // INIT DB
// // //     if (path === "/analytics/init" && method === "POST") {
// // //       return this.initSQL();
// // //     }

// // //     // INSERT ENTRY
// // //     if (path === "/analytics/sync" && method === "POST") {
// // //       return this.syncJournal(request);
// // //     }

// // //     // GET STREAKS
// // //     if (path === "/analytics/streaks" && method === "GET") {
// // //       const uid = url.searchParams.get("uid");
// // //       if (!uid) return this.json({ error: "uid required" }, 400);
// // //       return this.getStreaks(uid);
// // //     }

// // //     // DEBUG
// // //     if (path === "/analytics/debug" && method === "GET") {
// // //       const uid = url.searchParams.get("uid") || "";
// // //       return this.debugDump(uid);
// // //     }

// // //     // DROP TABLE (for development only)
// // //     if (path === "/analytics/reset" && method === "POST") {
// // //       return this.resetDatabase();
// // //     }

// // //     if (path === "/analytics/insights" && method === "GET") {
// // //   const uid = url.searchParams.get("uid");
// // //   if (!uid) return this.json({ error: "uid required" }, 400);
// // //   return this.getInsights(uid);
// // // }

// // //     if (path === "/analytics/mood" && method === "GET") {
// // //   const uid = url.searchParams.get("uid");
// // //   if (!uid) return this.json({ error: "uid required" }, 400);
// // //   return this.getMoodLast7(uid);
// // // }
// // //     return this.json({ error: "Not Found" }, 404);
// // //   }

// // //   // -----------------------------------------
// // //   // Helpers
// // //   // -----------------------------------------
// // //   json(data: any, status = 200): Response {
// // //     return new Response(JSON.stringify(data), {
// // //       status,
// // //       headers: {
// // //         "Content-Type": "application/json",
// // //         "Access-Control-Allow-Origin": "*",
// // //       },
// // //     });
// // //   }

// // //   // -----------------------------------------
// // //   // 0️⃣ INIT SQL DATABASE
// // //   // -----------------------------------------
// // //   async initSQL(): Promise<Response> {
// // //     try {
// // //       const db = this.env.JOURNALDB;

// // //       const stmt = db.prepare(`
// // //         CREATE TABLE IF NOT EXISTS journal_entries (
// // //           id TEXT PRIMARY KEY,
// // //           uid TEXT NOT NULL,
// // //           entry_date TEXT NOT NULL,
// // //           title TEXT,
// // //           content TEXT,
// // //           mood INTEGER,
// // //           ai_chat TEXT,
// // //           created_at TEXT DEFAULT CURRENT_TIMESTAMP
// // //         )
// // //       `);

// // //       await stmt.run();

// // //       return this.json({ status: "SQL DB initialized" });
// // //     } catch (e) {
// // //       console.error("INIT ERROR:", e);
// // //       return this.json({ error: "init failed", details: String(e) }, 500);
// // //     }
// // //   }

// // //   // -----------------------------------------
// // //   // 1️⃣ INSERT ENTRY INTO SQL
// // //   // -----------------------------------------
// // // async syncJournal(request: Request): Promise<Response> {
// // //   try {
// // //     const rawBody: unknown = await request.json();

// // //     // Validate minimum required fields
// // //     if (
// // //       typeof rawBody !== "object" ||
// // //       rawBody === null ||
// // //       !("uid" in rawBody) ||
// // //       !("date" in rawBody)
// // //     ) {
// // //       return this.json({ error: "uid and date required" }, 400);
// // //     }

// // //     const body = rawBody as {
// // //       uid: string;
// // //       date: string;
// // //       title?: string;
// // //       content?: string;
// // //       mood?: number;
// // //       ai_chat?: string;
// // //     };

// // //     const uid = body.uid;
// // //     const date = body.date;
// // //     const id = crypto.randomUUID();

// // //     // Insert with mood + ai_chat
// // //     const stmt = this.env.JOURNALDB.prepare(
// // //       `INSERT INTO journal_entries 
// // //         (id, uid, entry_date, title, content, mood, ai_chat) 
// // //        VALUES (?, ?, ?, ?, ?, ?, ?)`
// // //     );

// // //     await stmt
// // //       .bind(
// // //         id,
// // //         uid,
// // //         date,
// // //         body.title || null,
// // //         body.content || null,
// // //         body.mood ?? null,
// // //         body.ai_chat ?? null
// // //       )
// // //       .run();

// // //     return this.json({
// // //       status: "synced",
// // //       id,
// // //       uid,
// // //       date,
// // //       title: body.title || null,
// // //       content: body.content || null,
// // //       mood: body.mood ?? null,
// // //       ai_chat: body.ai_chat ?? null,
// // //     });
// // //   } catch (e) {
// // //     console.error("SYNC ERROR:", e);
// // //     return this.json({ error: "sync failed", details: String(e) }, 500);
// // //   }
// // // }

// // //   // -----------------------------------------
// // //   // 2️⃣ CALCULATE STREAKS
// // //   // -----------------------------------------
// // //   async getStreaks(uid: string): Promise<Response> {
// // //     try {
// // //       const stmt = this.env.JOURNALDB.prepare(
// // //         "SELECT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
// // //       );

// // //       const result = await stmt.bind(uid).all<{ entry_date: string }>();

// // //       if (!result.results.length) {
// // //         return this.json({
// // //           uid,
// // //           currentStreak: 0,
// // //           longestStreak: 0,
// // //           lastEntryDate: null,
// // //         });
// // //       }

// // //       const dates = result.results
// // //         .map((r: { entry_date: string }) => r.entry_date)
// // //         .sort()
// // //         .reverse();

// // //       const dayDiff = (a: string, b: string) =>
// // //         Math.floor(
// // //           (new Date(a).getTime() - new Date(b).getTime()) / 86400000
// // //         );

// // //       let current = 1;
// // //       let longest = 1;

// // //       for (let i = 1; i < dates.length; i++) {
// // //         const prev = dates[i - 1]!;
// // //         const curr = dates[i]!;
// // //         if (dayDiff(prev, curr) === 1) {
// // //           current++;
// // //         } else {
// // //           longest = Math.max(longest, current);
// // //           current = 1;
// // //         }
// // //       }

// // //       longest = Math.max(longest, current);

// // //       return this.json({
// // //         uid,
// // //         currentStreak: current,
// // //         longestStreak: longest,
// // //         lastEntryDate: dates[0],
// // //         totalEntries: dates.length,
// // //       });
// // //     } catch (e) {
// // //       console.error("STREAKS ERROR:", e);
// // //       return this.json({ error: "streaks failed", details: String(e) }, 500);
// // //     }
// // //   }

// // //   // -----------------------------------------
// // // // 6️⃣ WEEKLY INSIGHTS USING AI
// // // // -----------------------------------------
// // // async getInsights(uid: string): Promise<Response> {
// // //   try {
// // //     const db = this.env.JOURNALDB;

// // //     // Fetch last 7 days
// // //     const stmt = db.prepare(`
// // //       SELECT entry_date, mood, title, content, ai_chat
// // //       FROM journal_entries
// // //       WHERE uid = ?
// // //         AND entry_date >= date('now', '-7 days')
// // //       ORDER BY entry_date ASC
// // //     `);

// // //     const rows = await stmt.bind(uid).all<{
// // //       entry_date: string;
// // //       mood: number | null;
// // //       title: string | null;
// // //       content: string | null;
// // //       ai_chat: string | null;
// // //     }>();

// // //     const entries = rows.results;

// // //     // Count journals
// // //     const journalCount = entries.length;

// // //     // Count AI chats
// // //     const aiChatCount = entries.filter(
// // //       (e: { ai_chat: string | null }) =>
// // //         e.ai_chat !== null && e.ai_chat.trim() !== ""
// // //     ).length;

// // //     // Mood average
// // //     const moods = entries
// // //       .map((e: { mood: number | null }) => e.mood)
// // //       .filter((m: number | null): m is number => m !== null);

// // //     const avgMood =
// // //       moods.length > 0
// // //         ? moods.reduce((a: number, b: number) => a + b, 0) / moods.length
// // //         : null;

// // //     // Streaks
// // //     const streakResponse = await this.getStreaks(uid);
// // //     const streakData = (await streakResponse.json()) as {
// // //       currentStreak: number;
// // //       longestStreak: number;
// // //     };

// // //     // Prepare text for AI
// // //     const textSummary = entries
// // //       .map(
// // //         (e: {
// // //           entry_date: string;
// // //           mood: number | null;
// // //           title: string | null;
// // //           content: string | null;
// // //           ai_chat: string | null;
// // //         }) => `
// // // Date: ${e.entry_date}
// // // Mood: ${e.mood ?? "N/A"}
// // // Journal: ${e.title ?? ""} — ${e.content ?? ""}
// // // AI Chat: ${e.ai_chat ?? ""}
// // //       `.trim()
// // //       )
// // //       .join("\n\n");

// // //     // AI Model call
// // //    const aiResponse = await this.env.AI.run("llama-3.1-8b-instant", {
// // //   model: "llama-3.1-8b-instant",
// // //   response_format: { type: "json_object" },
// // //   messages: [
// // //     {
// // //       role: "system",
// // //       content: `
// // // You are a warm, emotionally intelligent journaling companion.
// // // Your tone is soft, comforting, and non-judgmental — like a supportive therapist or a kind friend.

// // // Your role: 
// // // Gently notice patterns in the user's moods, journaling behavior, and thoughts from the week.
// // // Offer encouragement, validation, and small meaningful insights.

// // // Stay away from clinical language.  
// // // Avoid giving commands or instructions.
// // // Use phrases like:
// // // - "it seems like..."
// // // - "you might be feeling..."
// // // - "you've been trying your best..."
// // // - "it's okay to..."
// // // - "something I notice is..."

// // // Your entire response MUST be valid JSON in this exact format:

// // // {
// // //   "insights": ["sentence 1", "sentence 2", "sentence 3"]
// // // }

// // // Each insight should be:
// // // - short (1–2 sentences)
// // // - kind
// // // - emotionally aware
// // // - uplifting but realistic
// // // - safe and non-directive
// // // `
// // //     },
// // //     {
// // //       role: "user",
// // //       content: `
// // // Here is the past 7 days of journaling and mood data:

// // // ${textSummary}

// // // Return only the JSON.
// // // `
// // //     }
// // //   ]
// // // });


// // //     const insights =
// // //       (aiResponse as any).insights ||
// // //       (aiResponse as any).choices?.[0]?.message?.content ||
// // //       [];

// // //     return this.json({
// // //       uid,
// // //       avgMood,
// // //       journalCount,
// // //       aiChatCount,
// // //       currentStreak: streakData.currentStreak,
// // //       insights
// // //     });
// // //   } catch (e) {
// // //     console.error("INSIGHTS ERROR:", e);
// // //     return this.json({ error: "insights failed", details: String(e) }, 500);
// // //   }
// // // }

// // //   // -----------------------------------------
// // // // 5️⃣ GET MOOD (LAST 7 DAYS)
// // // // -----------------------------------------
// // // async getMoodLast7(uid: string): Promise<Response> {
// // //   try {
// // //     const stmt = this.env.JOURNALDB.prepare(`
// // //       SELECT entry_date, mood
// // //       FROM journal_entries
// // //       WHERE uid = ?
// // //       AND mood IS NOT NULL
// // //       AND entry_date >= date('now', '-7 days')
// // //       ORDER BY entry_date ASC
// // //     `);

// // //     const rows = await stmt.bind(uid).all<{ entry_date: string; mood: number }>();

// // //     // FIX: explicitly type r to avoid TS7006 error
// // //     const moodData = rows.results.map((r: { entry_date: string; mood: number }) => ({
// // //       date: r.entry_date,
// // //       mood: r.mood,
// // //     }));

// // //     return this.json({
// // //       uid,
// // //       moodData,
// // //     });
// // //   } catch (e) {
// // //     console.error("MOOD ERROR:", e);
// // //     return this.json({ error: "mood fetch failed", details: String(e) }, 500);
// // //   }
// // // }

// // //   // -----------------------------------------
// // //   // 3️⃣ DEBUG DUMP
// // //   // -----------------------------------------
// // //   async debugDump(uid: string): Promise<Response> {
// // //     try {
// // //       const stmt = this.env.JOURNALDB.prepare(
// // //         "SELECT id, uid, entry_date, title, content, created_at FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
// // //       );

// // //       const rows = await stmt.bind(uid).all();

// // //       return this.json({
// // //         uid,
// // //         count: rows.results.length,
// // //         entries: rows.results,
// // //       });
// // //     } catch (e) {
// // //       console.error("DEBUG ERROR:", e);
// // //       return this.json({ error: "debug failed", details: String(e) }, 500);
// // //     }
// // //   }

// // //   // -----------------------------------------
// // //   // 4️⃣ RESET DATABASE (Development Only)
// // //   // -----------------------------------------
// // //   async resetDatabase(): Promise<Response> {
// // //     try {
// // //       const db = this.env.JOURNALDB;

// // //       // Drop existing table
// // //       const dropStmt = db.prepare("DROP TABLE IF EXISTS journal_entries");
// // //       await dropStmt.run();

// // //       // Recreate with new schema
// // //       const createStmt = db.prepare(`
// // //         CREATE TABLE journal_entries (
// // //           id TEXT PRIMARY KEY,
// // //           uid TEXT NOT NULL,
// // //           entry_date TEXT NOT NULL,
// // //           title TEXT,
// // //           content TEXT,
// // //           mood INTEGER,
// // //           ai_chat TEXT,
// // //           created_at TEXT DEFAULT CURRENT_TIMESTAMP
// // //         )
// // //       `);
// // //       await createStmt.run();

// // //       return this.json({ status: "Database reset successfully" });
// // //     } catch (e) {
// // //       console.error("RESET ERROR:", e);
// // //       return this.json({ error: "reset failed", details: String(e) }, 500);
// // //     }
// // //   }
// // // }
// import { Service } from "@liquidmetal-ai/raindrop-framework";
// import { Env } from "./raindrop.gen";

// type Badge = { id: string; streak: number; url: string };

// export default class extends Service<Env> {
//   // -----------------------------
//   // 🎖️ BADGE DEFINITIONS
//   // -----------------------------
//   BADGES: Badge[] = [
//     { id: "badge3", streak: 7, url: "https://blr1.vultrobjects.com/badges/badge3.png" },
//     { id: "badge4", streak: 14, url: "https://blr1.vultrobjects.com/badges/badge4.png" },
//     { id: "badge5", streak: 21, url: "https://blr1.vultrobjects.com/badges/badge5.png" },
//     { id: "badge6", streak: 30, url: "https://blr1.vultrobjects.com/badges/badge6.png" },
//     { id: "badge7", streak: 60, url: "https://blr1.vultrobjects.com/badges/badge7.png" },
//     { id: "badge8", streak: 90, url: "https://blr1.vultrobjects.com/badges/badge8.png" },
//   ];

//   // -----------------------------
//   // Router
//   // -----------------------------
//   async fetch(request: Request): Promise<Response> {
//   const url = new URL(request.url);
//   const path = url.pathname;
//   const method = request.method;

//   // ✅ CORS headers helper
//   const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
//   "Access-Control-Max-Age": "86400",
// };


//   // ✅ Handle OPTIONS preflight for ALL routes
//   if (method === "OPTIONS") {
//     return new Response(null, {
//       status: 204,
//       headers: corsHeaders,
//     });
//   }

//   // Regular route handling
//   if (path === "/" && method === "GET") {
//     return new Response("Journal Analytics Running ✔️", {
//       headers: corsHeaders,
//     });
//   }

//   if (path === "/analytics/init" && method === "POST") {
//     return this.initSQL();
//   }

//   if (path === "/analytics/sync" && method === "POST") {
//     return this.syncJournal(request);
//   }

//   if (path === "/analytics/streaks" && method === "GET") {
//     const uid = url.searchParams.get("uid");
//     if (!uid) return this.json({ error: "uid required" }, 400);
//     return this.getStreaks(uid);
//   }

//   if (path === "/analytics/badges" && method === "GET") {
//     const uid = url.searchParams.get("uid");
//     if (!uid) return this.json({ error: "uid required" }, 400);
//     return this.getUserBadges(uid);
//   }

//   if (path === "/analytics/insights" && method === "GET") {
//     const uid = url.searchParams.get("uid");
//     if (!uid) return this.json({ error: "uid required" }, 400);
//     return this.getInsights(uid);
//   }

//   if (path === "/analytics/mood" && method === "GET") {
//     const uid = url.searchParams.get("uid");
//     if (!uid) return this.json({ error: "uid required" }, 400);
//     return this.getMoodLast7(uid);
//   }

//   if (path === "/analytics/debug" && method === "GET") {
//     const uid = url.searchParams.get("uid") || "";
//     return this.debugDump(uid);
//   }

//   if (path === "/analytics/reset" && method === "POST") {
//     return this.resetDatabase();
//   }

//   return this.json({ error: "Not Found" }, 404);
// }

// // ✅ Updated json helper
// json(data: any, status = 200): Response {
//   return new Response(JSON.stringify(data), {
//     status,
//     headers: {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//       "Access-Control-Allow-Headers": "*",
//     },
//   });
// }
//   // async fetch(request: Request): Promise<Response> {
//   //   const url = new URL(request.url);
//   //   const path = url.pathname;
//   //   const method = request.method;

//   //   // CORS preflight
//   //   if (method === "OPTIONS") {
//   //     return new Response(null, {
//   //       status: 204,
//   //       headers: {
//   //         "Access-Control-Allow-Origin": "*",
//   //         "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
//   //         "Access-Control-Allow-Headers": "Content-Type",
//   //       },
//   //     });
//   //   }

//   //   if (path === "/" && method === "GET") {
//   //     return new Response("Journal Analytics Running ✔️");
//   //   }

//   //   if (path === "/analytics/init" && method === "POST") {
//   //     return this.initSQL();
//   //   }

//   //   if (path === "/analytics/sync" && method === "POST") {
//   //     return this.syncJournal(request);
//   //   }

//   //   if (path === "/analytics/streaks" && method === "GET") {
//   //     const uid = url.searchParams.get("uid");
//   //     if (!uid) return this.json({ error: "uid required" }, 400);
//   //     return this.getStreaks(uid);
//   //   }

//   //   if (path === "/analytics/badges" && method === "GET") {
//   //     const uid = url.searchParams.get("uid");
//   //     if (!uid) return this.json({ error: "uid required" }, 400);
//   //     return this.getUserBadges(uid);
//   //   }

//   //   if (path === "/analytics/insights" && method === "GET") {
//   //     const uid = url.searchParams.get("uid");
//   //     if (!uid) return this.json({ error: "uid required" }, 400);
//   //     return this.getInsights(uid);
//   //   }

//   //   if (path === "/analytics/mood" && method === "GET") {
//   //     const uid = url.searchParams.get("uid");
//   //     if (!uid) return this.json({ error: "uid required" }, 400);
//   //     return this.getMoodLast7(uid);
//   //   }

//   //   if (path === "/analytics/debug" && method === "GET") {
//   //     const uid = url.searchParams.get("uid") || "";
//   //     return this.debugDump(uid);
//   //   }

//   //   if (path === "/analytics/reset" && method === "POST") {
//   //     return this.resetDatabase();
//   //   }

//   //   return this.json({ error: "Not Found" }, 404);
//   // }

//   // // helper for JSON responses
//   // json(data: any, status = 200): Response {
//   //   return new Response(JSON.stringify(data), {
//   //     status,
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //       "Access-Control-Allow-Origin": "*",
//   //     },
//   //   });
//   // }

//   // -----------------------------------------
//   // 0️⃣ INIT SQL DATABASE
//   // -----------------------------------------
//   async initSQL(): Promise<Response> {
//     try {
//       const db = this.env.JOURNALDB;

//       await db.prepare(`
//         CREATE TABLE IF NOT EXISTS journal_entries (
//           id TEXT PRIMARY KEY,
//           uid TEXT NOT NULL,
//           entry_date TEXT NOT NULL,
//           title TEXT,
//           content TEXT,
//           mood INTEGER,
//           ai_chat TEXT,
//           created_at TEXT DEFAULT CURRENT_TIMESTAMP
//         )
//       `).run();

//       await db.prepare(`
//         CREATE TABLE IF NOT EXISTS user_badges (
//           uid TEXT NOT NULL,
//           badge_id TEXT NOT NULL,
//           earned_at TEXT DEFAULT CURRENT_TIMESTAMP
//         )
//       `).run();

//       return this.json({ status: "SQL DB initialized" });
//     } catch (e: unknown) {
//       return this.json({ error: "init failed", details: String(e) }, 500);
//     }
//   }

//   // -----------------------------------------
//   // 1️⃣ INSERT JOURNAL ENTRY
//   // -----------------------------------------
//   async syncJournal(request: Request): Promise<Response> {
//     try {
//       const raw: any = await request.json();
//       if (!raw?.uid || !raw?.date) return this.json({ error: "uid and date required" }, 400);

//       const id = crypto.randomUUID();

//       await this.env.JOURNALDB.prepare(
//         `INSERT INTO journal_entries (id, uid, entry_date, title, content, mood, ai_chat)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`
//       )
//         .bind(
//           id,
//           raw.uid,
//           raw.date,
//           raw.title || null,
//           raw.content || null,
//           raw.mood ?? null,
//           raw.ai_chat ?? null
//         )
//         .run();

//       return this.json({ status: "synced", id });
//     } catch (e: unknown) {
//       return this.json({ error: "sync failed", details: String(e) }, 500);
//     }
//   }

//   // -----------------------------------------
//   // 2️⃣ CALCULATE STREAKS + AWARD BADGES
//   // -----------------------------------------
//   async getStreaks(uid: string): Promise<Response> {
//     try {
//       const stmt = this.env.JOURNALDB.prepare(
//         "SELECT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
//       );
//       const rows = await stmt.bind(uid).all<{ entry_date: string }>();

//       if (!rows.results.length) {
//         return this.json({
//           uid,
//           currentStreak: 0,
//           longestStreak: 0,
//           lastEntryDate: null,
//         });
//       }

//       const dates: string[] = rows.results.map((r: { entry_date: string }) => r.entry_date)
//         .sort()
//         .reverse();

//       const dayDiff = (a: string, b: string) =>
//         Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 86400000);

//       let current = 1;
//       let longest = 1;

//       for (let i = 1; i < dates.length; i++) {
//         const prev = dates[i - 1]!;
//         const curr = dates[i]!;
//         if (dayDiff(prev, curr) === 1) {
//           current++;
//         } else {
//           longest = Math.max(longest, current);
//           current = 1;
//         }
//       }

//       longest = Math.max(longest, current);

//       // award badges (inserts into user_badges if new)
//       const newlyEarned = await this.awardBadges(uid, current);

//       return this.json({
//         uid,
//         currentStreak: current,
//         longestStreak: longest,
//         lastEntryDate: dates[0],
//         totalEntries: dates.length,
//         newlyEarned,
//       });
//     } catch (e: unknown) {
//       return this.json({ error: "streaks failed", details: String(e) }, 500);
//     }
//   }

//   // -----------------------------------------
//   // Award badges helper
//   // -----------------------------------------
//   async awardBadges(uid: string, streak: number): Promise<Badge[]> {
//     try {
//       const db = this.env.JOURNALDB;
//       const rows = await db.prepare("SELECT badge_id FROM user_badges WHERE uid = ?").bind(uid).all<{ badge_id: string }>();
//       const earnedSet = new Set<string>(rows.results.map((r: { badge_id: string }) => r.badge_id));
//       const newly: Badge[] = [];

//       for (const badge of this.BADGES) {
//         if (streak >= badge.streak && !earnedSet.has(badge.id)) {
//           await db.prepare("INSERT INTO user_badges (uid, badge_id) VALUES (?, ?)").bind(uid, badge.id).run();
//           newly.push(badge);
//         }
//       }

//       return newly;
//     } catch (e: unknown) {
//       // don't fail the whole flow if insertion fails; return empty list
//       console.error("awardBadges error:", String(e));
//       return [];
//     }
//   }

//   // -----------------------------------------
//   // GET ALL BADGES EARNED BY A USER
//   // -----------------------------------------
//   async getUserBadges(uid: string): Promise<Response> {
//     try {
//       const rows = await this.env.JOURNALDB.prepare("SELECT badge_id FROM user_badges WHERE uid = ?").bind(uid).all<{ badge_id: string }>();
//       const earnedIds: string[] = rows.results.map((r: { badge_id: string }) => r.badge_id);
//       const earnedBadges: Badge[] = this.BADGES.filter((b: Badge) => earnedIds.includes(b.id));
//       return this.json({ uid, badges: earnedBadges });
//     } catch (e: unknown) {
//       return this.json({ error: "get badges failed", details: String(e) }, 500);
//     }
//   }

//   // -----------------------------------------
//   // 3️⃣ WEEKLY INSIGHTS (uses AI)
//   // -----------------------------------------
//   async getInsights(uid: string): Promise<Response> {
//     try {
//       const db = this.env.JOURNALDB;
//       const rows = await db.prepare(`
//         SELECT entry_date, mood, title, content, ai_chat
//         FROM journal_entries
//         WHERE uid = ?
//           AND entry_date >= date('now', '-7 days')
//         ORDER BY entry_date ASC
//       `).bind(uid).all<{
//         entry_date: string;
//         mood: number | null;
//         title: string | null;
//         content: string | null;
//         ai_chat: string | null;
//       }>();

//       const entries = rows.results;

//       const journalCount = entries.length;
//       const aiChatCount = entries.filter(
//   (e: { ai_chat: string | null }) =>
//     e.ai_chat !== null && e.ai_chat.trim() !== ""
// ).length;


//       const moods = entries
//   .map((e: { mood: number | null }) => e.mood)
//   .filter((m: number | null): m is number => m !== null);

//       const avgMood = moods.length ? moods.reduce((a: number, b: number) => a + b, 0) / moods.length : null;

//       // get streaks (call internal function and parse)
//       const streakResp = await this.getStreaks(uid);
//       const streakData = (await streakResp.json()) as { currentStreak?: number; longestStreak?: number } | null;

//       const textSummary = entries
//   .map((e: {
//     entry_date: string;
//     mood: number | null;
//     title: string | null;
//     content: string | null;
//     ai_chat: string | null;
//   }) => `
// Date: ${e.entry_date}
// Mood: ${e.mood ?? "N/A"}
// Journal: ${e.title ?? ""} — ${e.content ?? ""}
// AI Chat: ${e.ai_chat ?? ""}
// `.trim())
//   .join("\n\n");


//       const aiResponse = await this.env.AI.run("llama-3.1-8b-instant", {
//         model: "llama-3.1-8b-instant",
//         response_format: { type: "json_object" },
//         messages: [
//           {
//             role: "system",
//             content: `
// You are a warm, emotionally intelligent journaling companion.
// Your tone is soft and kind. Return only JSON: { "insights": ["...","..."] }
// `
//           },
//           {
//             role: "user",
//             content: textSummary
//           }
//         ]
//       });

//       const insights =
//         (aiResponse as any).insights ||
//         (aiResponse as any).choices?.[0]?.message?.content ||
//         [];

//       return this.json({
//         uid,
//         avgMood,
//         journalCount,
//         aiChatCount,
//         currentStreak: streakData?.currentStreak ?? null,
//         insights
//       });
//     } catch (e: unknown) {
//       return this.json({ error: "insights failed", details: String(e) }, 500);
//     }
//   }

//   // -----------------------------------------
//   // 4️⃣ GET MOOD LAST 7 DAYS
//   // -----------------------------------------
//   async getMoodLast7(uid: string): Promise<Response> {
//     try {
//       const rows = await this.env.JOURNALDB.prepare(`
//         SELECT entry_date, mood
//         FROM journal_entries
//         WHERE uid = ?
//           AND mood IS NOT NULL
//           AND entry_date >= date('now', '-7 days')
//         ORDER BY entry_date ASC
//       `).bind(uid).all<{ entry_date: string; mood: number }>();

//       const moodData = rows.results.map((r: { entry_date: string; mood: number }) => ({ date: r.entry_date, mood: r.mood }));
//       return this.json({ uid, moodData });
//     } catch (e: unknown) {
//       return this.json({ error: "mood fetch failed", details: String(e) }, 500);
//     }
//   }

//   // -----------------------------------------
//   // 5️⃣ DEBUG DUMP
//   // -----------------------------------------
//   async debugDump(uid: string): Promise<Response> {
//     try {
//       const rows = await this.env.JOURNALDB.prepare(
//         "SELECT id, uid, entry_date, title, content, created_at FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
//       ).bind(uid).all();

//       return this.json({ uid, count: rows.results.length, entries: rows.results });
//     } catch (e: unknown) {
//       return this.json({ error: "debug failed", details: String(e) }, 500);
//     }
//   }

//   // -----------------------------------------
//   // 6️⃣ RESET DATABASE (DEV)
//   // -----------------------------------------
//   async resetDatabase(): Promise<Response> {
//     try {
//       const db = this.env.JOURNALDB;
//       await db.prepare("DROP TABLE IF EXISTS journal_entries").run();
//       await db.prepare("DROP TABLE IF EXISTS user_badges").run();

//       await db.prepare(`
//         CREATE TABLE journal_entries (
//           id TEXT PRIMARY KEY,
//           uid TEXT NOT NULL,
//           entry_date TEXT NOT NULL,
//           title TEXT,
//           content TEXT,
//           mood INTEGER,
//           ai_chat TEXT,
//           created_at TEXT DEFAULT CURRENT_TIMESTAMP
//         )
//       `).run();

//       await db.prepare(`
//         CREATE TABLE user_badges (
//           uid TEXT NOT NULL,
//           badge_id TEXT NOT NULL,
//           earned_at TEXT DEFAULT CURRENT_TIMESTAMP
//         )
//       `).run();

//       return this.json({ status: "Database reset successfully" });
//     } catch (e: unknown) {
//       return this.json({ error: "reset failed", details: String(e) }, 500);
//     }
//   }
// }
// // import { Service } from "@liquidmetal-ai/raindrop-framework";
// // import { Env } from "./raindrop.gen";

// // type Badge = { id: string; streak: number; url: string };

// // export default class extends Service<Env> {
// //   // -----------------------------
// //   // 🎖️ BADGE DEFINITIONS
// //   // -----------------------------
// //   BADGES: Badge[] = [
// //     { id: "badge3", streak: 7, url: "https://blr1.vultrobjects.com/badges/badge3.png" },
// //     { id: "badge4", streak: 14, url: "https://blr1.vultrobjects.com/badges/badge4.png" },
// //     { id: "badge5", streak: 21, url: "https://blr1.vultrobjects.com/badges/badge5.png" },
// //     { id: "badge6", streak: 30, url: "https://blr1.vultrobjects.com/badges/badge6.png" },
// //     { id: "badge7", streak: 60, url: "https://blr1.vultrobjects.com/badges/badge7.png" },
// //     { id: "badge8", streak: 90, url: "https://blr1.vultrobjects.com/badges/badge8.png" },
// //   ];

// //   // -----------------------------
// //   // Router
// //   // -----------------------------
// //   async fetch(request: Request): Promise<Response> {
// //     const url = new URL(request.url);
// //     const path = url.pathname;
// //     const method = request.method;

// //     // CORS headers
// //     const corsHeaders = {
// //       "Access-Control-Allow-Origin": "*",
// //       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// //       "Access-Control-Allow-Headers": "*",
// //       "Access-Control-Max-Age": "86400",
// //     };

// //     // Handle OPTIONS preflight
// //     if (method === "OPTIONS") {
// //       return new Response(null, {
// //         status: 204,
// //         headers: corsHeaders,
// //       });
// //     }

// //     if (path === "/" && method === "GET") {
// //       return new Response("Journal Analytics Running ✔️", {
// //         headers: corsHeaders,
// //       });
// //     }

// //     if (path === "/analytics/init" && method === "POST") {
// //       return this.initSQL();
// //     }

// //     // ✅ Accept both GET and POST to avoid CORS preflight
// //     if (path === "/analytics/sync" && (method === "POST" || method === "GET")) {
// //       return this.syncJournal(request);
// //     }

// //     if (path === "/analytics/streaks" && method === "GET") {
// //       const uid = url.searchParams.get("uid");
// //       if (!uid) return this.json({ error: "uid required" }, 400);
// //       return this.getStreaks(uid);
// //     }

// //     if (path === "/analytics/badges" && method === "GET") {
// //       const uid = url.searchParams.get("uid");
// //       if (!uid) return this.json({ error: "uid required" }, 400);
// //       return this.getUserBadges(uid);
// //     }

// //     if (path === "/analytics/insights" && method === "GET") {
// //       const uid = url.searchParams.get("uid");
// //       if (!uid) return this.json({ error: "uid required" }, 400);
// //       return this.getInsights(uid);
// //     }

// //     if (path === "/analytics/mood" && method === "GET") {
// //       const uid = url.searchParams.get("uid");
// //       if (!uid) return this.json({ error: "uid required" }, 400);
// //       return this.getMoodLast7(uid);
// //     }

// //     if (path === "/analytics/debug" && method === "GET") {
// //       const uid = url.searchParams.get("uid") || "";
// //       return this.debugDump(uid);
// //     }

// //     if (path === "/analytics/reset" && method === "POST") {
// //       return this.resetDatabase();
// //     }

// //     return this.json({ error: "Not Found" }, 404);
// //   }

// //   // helper for JSON responses
// //   json(data: any, status = 200): Response {
// //     return new Response(JSON.stringify(data), {
// //       status,
// //       headers: {
// //         "Content-Type": "application/json",
// //         "Access-Control-Allow-Origin": "*",
// //         "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// //         "Access-Control-Allow-Headers": "*",
// //       },
// //     });
// //   }

// //   // -----------------------------------------
// //   // 0️⃣ INIT SQL DATABASE
// //   // -----------------------------------------
// //   async initSQL(): Promise<Response> {
// //     try {
// //       const db = this.env.JOURNALDB;

// //       await db.prepare(`
// //         CREATE TABLE IF NOT EXISTS journal_entries (
// //           id TEXT PRIMARY KEY,
// //           uid TEXT NOT NULL,
// //           entry_date TEXT NOT NULL,
// //           title TEXT,
// //           content TEXT,
// //           mood INTEGER,
// //           ai_chat TEXT,
// //           created_at TEXT DEFAULT CURRENT_TIMESTAMP
// //         )
// //       `).run();

// //       await db.prepare(`
// //         CREATE TABLE IF NOT EXISTS user_badges (
// //           uid TEXT NOT NULL,
// //           badge_id TEXT NOT NULL,
// //           earned_at TEXT DEFAULT CURRENT_TIMESTAMP
// //         )
// //       `).run();

// //       return this.json({ status: "SQL DB initialized" });
// //     } catch (e: unknown) {
// //       return this.json({ error: "init failed", details: String(e) }, 500);
// //     }
// //   }

// //   // -----------------------------------------
// //   // 1️⃣ INSERT JOURNAL ENTRY (supports GET and POST)
// //   // -----------------------------------------
// //   async syncJournal(request: Request): Promise<Response> {
// //     try {
// //       let data: any;
      
// //       // Support both GET and POST to avoid CORS preflight
// //       if (request.method === "GET") {
// //         const url = new URL(request.url);
// //         data = {
// //           uid: url.searchParams.get("uid"),
// //           date: url.searchParams.get("date"),
// //           title: url.searchParams.get("title"),
// //           content: url.searchParams.get("content"),
// //           mood: url.searchParams.get("mood") ? Number(url.searchParams.get("mood")) : null,
// //           ai_chat: url.searchParams.get("ai_chat")
// //         };
// //       } else {
// //         data = await request.json();
// //       }
      
// //       if (!data?.uid || !data?.date) {
// //         return this.json({ error: "uid and date required" }, 400);
// //       }

// //       const id = crypto.randomUUID();

// //       await this.env.JOURNALDB.prepare(
// //         `INSERT INTO journal_entries (id, uid, entry_date, title, content, mood, ai_chat)
// //          VALUES (?, ?, ?, ?, ?, ?, ?)`
// //       )
// //         .bind(
// //           id,
// //           data.uid,
// //           data.date,
// //           data.title || null,
// //           data.content || null,
// //           data.mood ?? null,
// //           data.ai_chat ?? null
// //         )
// //         .run();

// //       return this.json({ status: "synced", id });
// //     } catch (e: unknown) {
// //       return this.json({ error: "sync failed", details: String(e) }, 500);
// //     }
// //   }

// //   // -----------------------------------------
// //   // 2️⃣ CALCULATE STREAKS + AWARD BADGES
// //   // -----------------------------------------
// //   async getStreaks(uid: string): Promise<Response> {
// //     try {
// //       const stmt = this.env.JOURNALDB.prepare(
// //         "SELECT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
// //       );
// //       const rows = await stmt.bind(uid).all<{ entry_date: string }>();

// //       if (!rows.results.length) {
// //         return this.json({
// //           uid,
// //           currentStreak: 0,
// //           longestStreak: 0,
// //           lastEntryDate: null,
// //         });
// //       }

// //       const dates: string[] = rows.results.map((r: { entry_date: string }) => r.entry_date)
// //         .sort()
// //         .reverse();

// //       const dayDiff = (a: string, b: string) =>
// //         Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 86400000);

// //       let current = 1;
// //       let longest = 1;

// //       for (let i = 1; i < dates.length; i++) {
// //         const prev = dates[i - 1]!;
// //         const curr = dates[i]!;
// //         if (dayDiff(prev, curr) === 1) {
// //           current++;
// //         } else {
// //           longest = Math.max(longest, current);
// //           current = 1;
// //         }
// //       }

// //       longest = Math.max(longest, current);

// //       // award badges (inserts into user_badges if new)
// //       const newlyEarned = await this.awardBadges(uid, current);

// //       return this.json({
// //         uid,
// //         currentStreak: current,
// //         longestStreak: longest,
// //         lastEntryDate: dates[0],
// //         totalEntries: dates.length,
// //         newlyEarned,
// //       });
// //     } catch (e: unknown) {
// //       return this.json({ error: "streaks failed", details: String(e) }, 500);
// //     }
// //   }

// //   // -----------------------------------------
// //   // Award badges helper
// //   // -----------------------------------------
// //   async awardBadges(uid: string, streak: number): Promise<Badge[]> {
// //     try {
// //       const db = this.env.JOURNALDB;
// //       const rows = await db.prepare("SELECT badge_id FROM user_badges WHERE uid = ?").bind(uid).all<{ badge_id: string }>();
// //       const earnedSet = new Set<string>(rows.results.map((r: { badge_id: string }) => r.badge_id));
// //       const newly: Badge[] = [];

// //       for (const badge of this.BADGES) {
// //         if (streak >= badge.streak && !earnedSet.has(badge.id)) {
// //           await db.prepare("INSERT INTO user_badges (uid, badge_id) VALUES (?, ?)").bind(uid, badge.id).run();
// //           newly.push(badge);
// //         }
// //       }

// //       return newly;
// //     } catch (e: unknown) {
// //       console.error("awardBadges error:", String(e));
// //       return [];
// //     }
// //   }

// //   // -----------------------------------------
// //   // GET ALL BADGES EARNED BY A USER
// //   // -----------------------------------------
// //   async getUserBadges(uid: string): Promise<Response> {
// //     try {
// //       const rows = await this.env.JOURNALDB.prepare("SELECT badge_id FROM user_badges WHERE uid = ?").bind(uid).all<{ badge_id: string }>();
// //       const earnedIds: string[] = rows.results.map((r: { badge_id: string }) => r.badge_id);
// //       const earnedBadges: Badge[] = this.BADGES.filter((b: Badge) => earnedIds.includes(b.id));
// //       return this.json({ uid, badges: earnedBadges });
// //     } catch (e: unknown) {
// //       return this.json({ error: "get badges failed", details: String(e) }, 500);
// //     }
// //   }

// //   // -----------------------------------------
// //   // 3️⃣ WEEKLY INSIGHTS (uses AI)
// //   // -----------------------------------------
// //   async getInsights(uid: string): Promise<Response> {
// //     try {
// //       const db = this.env.JOURNALDB;
// //       const rows = await db.prepare(`
// //         SELECT entry_date, mood, title, content, ai_chat
// //         FROM journal_entries
// //         WHERE uid = ?
// //           AND entry_date >= date('now', '-7 days')
// //         ORDER BY entry_date ASC
// //       `).bind(uid).all<{
// //         entry_date: string;
// //         mood: number | null;
// //         title: string | null;
// //         content: string | null;
// //         ai_chat: string | null;
// //       }>();

// //       const entries = rows.results;

// //       const journalCount = entries.length;
// //       const aiChatCount = entries.filter(
// //         (e: { ai_chat: string | null }) =>
// //           e.ai_chat !== null && e.ai_chat.trim() !== ""
// //       ).length;

// //       const moods = entries
// //         .map((e: { mood: number | null }) => e.mood)
// //         .filter((m: number | null): m is number => m !== null);

// //       const avgMood = moods.length ? moods.reduce((a: number, b: number) => a + b, 0) / moods.length : null;

// //       // get streaks (call internal function and parse)
// //       const streakResp = await this.getStreaks(uid);
// //       const streakData = (await streakResp.json()) as { currentStreak?: number; longestStreak?: number } | null;

// //       const textSummary = entries
// //         .map((e: {
// //           entry_date: string;
// //           mood: number | null;
// //           title: string | null;
// //           content: string | null;
// //           ai_chat: string | null;
// //         }) => `
// // Date: ${e.entry_date}
// // Mood: ${e.mood ?? "N/A"}
// // Journal: ${e.title ?? ""} — ${e.content ?? ""}
// // AI Chat: ${e.ai_chat ?? ""}
// // `.trim())
// //         .join("\n\n");

// //       const aiResponse = await this.env.AI.run("llama-3.1-8b-instant", {
// //         model: "llama-3.1-8b-instant",
// //         response_format: { type: "json_object" },
// //         messages: [
// //           {
// //             role: "system",
// //             content: `
// // You are a warm, emotionally intelligent journaling companion.
// // Your tone is soft and kind. Return only JSON: { "insights": ["...","..."] }
// // `
// //           },
// //           {
// //             role: "user",
// //             content: textSummary
// //           }
// //         ]
// //       });

// //       const insights =
// //         (aiResponse as any).insights ||
// //         (aiResponse as any).choices?.[0]?.message?.content ||
// //         [];

// //       return this.json({
// //         uid,
// //         avgMood,
// //         journalCount,
// //         aiChatCount,
// //         currentStreak: streakData?.currentStreak ?? null,
// //         insights
// //       });
// //     } catch (e: unknown) {
// //       return this.json({ error: "insights failed", details: String(e) }, 500);
// //     }
// //   }

// //   // -----------------------------------------
// //   // 4️⃣ GET MOOD LAST 7 DAYS
// //   // -----------------------------------------
// //   async getMoodLast7(uid: string): Promise<Response> {
// //     try {
// //       const rows = await this.env.JOURNALDB.prepare(`
// //         SELECT entry_date, mood
// //         FROM journal_entries
// //         WHERE uid = ?
// //           AND mood IS NOT NULL
// //           AND entry_date >= date('now', '-7 days')
// //         ORDER BY entry_date ASC
// //       `).bind(uid).all<{ entry_date: string; mood: number }>();

// //       const moodData = rows.results.map((r: { entry_date: string; mood: number }) => ({ date: r.entry_date, mood: r.mood }));
// //       return this.json({ uid, moodData });
// //     } catch (e: unknown) {
// //       return this.json({ error: "mood fetch failed", details: String(e) }, 500);
// //     }
// //   }

// //   // -----------------------------------------
// //   // 5️⃣ DEBUG DUMP
// //   // -----------------------------------------
// //   async debugDump(uid: string): Promise<Response> {
// //     try {
// //       const rows = await this.env.JOURNALDB.prepare(
// //         "SELECT id, uid, entry_date, title, content, created_at FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
// //       ).bind(uid).all();

// //       return this.json({ uid, count: rows.results.length, entries: rows.results });
// //     } catch (e: unknown) {
// //       return this.json({ error: "debug failed", details: String(e) }, 500);
// //     }
// //   }

// //   // -----------------------------------------
// //   // 6️⃣ RESET DATABASE (DEV)
// //   // -----------------------------------------
// //   async resetDatabase(): Promise<Response> {
// //     try {
// //       const db = this.env.JOURNALDB;
// //       await db.prepare("DROP TABLE IF EXISTS journal_entries").run();
// //       await db.prepare("DROP TABLE IF EXISTS user_badges").run();

// //       await db.prepare(`
// //         CREATE TABLE journal_entries (
// //           id TEXT PRIMARY KEY,
// //           uid TEXT NOT NULL,
// //           entry_date TEXT NOT NULL,
// //           title TEXT,
// //           content TEXT,
// //           mood INTEGER,
// //           ai_chat TEXT,
// //           created_at TEXT DEFAULT CURRENT_TIMESTAMP
// //         )
// //       `).run();

// //       await db.prepare(`
// //         CREATE TABLE user_badges (
// //           uid TEXT NOT NULL,
// //           badge_id TEXT NOT NULL,
// //           earned_at TEXT DEFAULT CURRENT_TIMESTAMP
// //         )
// //       `).run();

// //       return this.json({ status: "Database reset successfully" });
// //     } catch (e: unknown) {
// //       return this.json({ error: "reset failed", details: String(e) }, 500);
// //     }
// //   }
// // }
import { Service } from "@liquidmetal-ai/raindrop-framework";
import { Env } from "./raindrop.gen";

type Badge = { id: string; streak: number; url: string };

export default class extends Service<Env> {
  // -----------------------------
  // 🎖️ BADGE DEFINITIONS
  // -----------------------------
  BADGES: Badge[] = [
    { id: "badge3", streak: 7, url: "https://blr1.vultrobjects.com/badges/badge3.png" },
    { id: "badge4", streak: 14, url: "https://blr1.vultrobjects.com/badges/badge4.png" },
    { id: "badge5", streak: 21, url: "https://blr1.vultrobjects.com/badges/badge5.png" },
    { id: "badge6", streak: 30, url: "https://blr1.vultrobjects.com/badges/badge6.png" },
    { id: "badge7", streak: 60, url: "https://blr1.vultrobjects.com/badges/badge7.png" },
    { id: "badge8", streak: 90, url: "https://blr1.vultrobjects.com/badges/badge8.png" },
  ];

  // -----------------------------
  // Router
  // -----------------------------
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (path === "/" && method === "GET") {
      return new Response("Journal Analytics Running ✔️", {
        headers: corsHeaders,
      });
    }

    if (path === "/analytics/init" && method === "POST") {
      return this.initSQL();
    }

    if (path === "/analytics/sync" && method === "POST") {
      return this.syncJournal(request);
    }

    if (path === "/analytics/streaks" && method === "GET") {
      const uid = url.searchParams.get("uid");
      if (!uid) return this.json({ error: "uid required" }, 400);
      return this.getStreaks(uid);
    }

    if (path === "/analytics/badges" && method === "GET") {
      const uid = url.searchParams.get("uid");
      if (!uid) return this.json({ error: "uid required" }, 400);
      return this.getUserBadges(uid);
    }

    if (path === "/analytics/insights" && method === "GET") {
      const uid = url.searchParams.get("uid");
      if (!uid) return this.json({ error: "uid required" }, 400);
      return this.getInsights(uid);
    }

    if (path === "/analytics/mood" && method === "GET") {
      const uid = url.searchParams.get("uid");
      if (!uid) return this.json({ error: "uid required" }, 400);
      return this.getMoodLast7(uid);
    }

    if (path === "/analytics/debug" && method === "GET") {
      const uid = url.searchParams.get("uid") || "";
      return this.debugDump(uid);
    }

    if (path === "/analytics/reset" && method === "POST") {
      return this.resetDatabase();
    }
    if (path === "/analytics/mood/extended" && method === "GET") {
  const uid = url.searchParams.get("uid");
  const days = parseInt(url.searchParams.get("days") || "30");
  if (!uid) return this.json({ error: "uid required" }, 400);
  return this.getMoodExtended(uid, days);
}

    return this.json({ error: "Not Found" }, 404);
  }

  json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // -----------------------------------------
  // 0️⃣ INIT SQL DATABASE
  // -----------------------------------------
  async initSQL(): Promise<Response> {
    try {
      const db = this.env.JOURNALDB;

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS journal_entries (
          id TEXT PRIMARY KEY,
          uid TEXT NOT NULL,
          entry_date TEXT NOT NULL,
          title TEXT,
          content TEXT,
          mood INTEGER,
          ai_chat TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(uid, entry_date)
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS user_badges (
          uid TEXT NOT NULL,
          badge_id TEXT NOT NULL,
          earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (uid, badge_id)
        )
      `).run();

      await db.prepare(`
  CREATE TABLE IF NOT EXISTS daily_insights (
    uid TEXT NOT NULL,
    insight_date TEXT NOT NULL,
    insights_json TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid, insight_date)
  )
`).run();

      return this.json({ status: "SQL DB initialized" });
    } catch (e: unknown) {
      return this.json({ error: "init failed", details: String(e) }, 500);
    }
  }

  async getMoodExtended(uid: string, days: number): Promise<Response> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    const rows = await this.env.JOURNALDB.prepare(`
      SELECT entry_date, mood
      FROM journal_entries
      WHERE uid = ?
      AND mood IS NOT NULL
      AND entry_date >= ?
      ORDER BY entry_date ASC
    `).bind(uid, cutoffStr).all<{ entry_date: string; mood: number }>();
    
    const moodData = rows.results.map(r => ({ 
      date: r.entry_date, 
      mood: r.mood 
    }));
    
    // Calculate stats
    const moods = moodData.map(m => m.mood);
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length || 0;
    
    // Calculate variance
    const variance = moods.length > 0 
      ? moods.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moods.length
      : 0;
    
    // Calculate trend
    let trend = "stable";
    if (moods.length >= 3) {
      const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
      const secondHalf = moods.slice(Math.floor(moods.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.3) trend = "improving";
      else if (secondAvg < firstAvg - 0.3) trend = "declining";
    }
    
    const bestDay = moodData.reduce((best, curr) => 
      curr.mood > best.mood ? curr : best, 
      { date: "", mood: 0 }
    );
    const worstDay = moodData.reduce((worst, curr) => 
      curr.mood < worst.mood ? curr : worst,
      { date: "", mood: 5 }
    );
    
    return this.json({
      uid,
      period: `${days} days`,
      moodData,
      stats: {
        averageMood: Math.round(avgMood * 10) / 10,
        moodVariance: Math.round(variance * 10) / 10,
        trend,
        bestDay,
        worstDay,
        daysTracked: moodData.length,
        missedDays: days - moodData.length
      }
    });
  } catch (e: unknown) {
    return this.json({ error: "extended mood fetch failed", details: String(e) }, 500);
  }
}
// -----------------------------------------
// 1️⃣ INSERT JOURNAL ENTRY (overwrite per day + clear insight cache)
// -----------------------------------------
async syncJournal(request: Request): Promise<Response> {
  try {
    // Accept both GET + POST
    let raw: any =
      request.method === "GET"
        ? Object.fromEntries(new URL(request.url).searchParams.entries())
        : await request.json();

    if (!raw?.uid || !raw?.date) {
      return this.json({ error: "uid and date required" }, 400);
    }

    const uid = raw.uid;
    const entryDate = raw.date;

    // Today's date (for insight caching)
    const today = new Date().toISOString().slice(0, 10);

    // 🧹 1) CLEAR TODAY'S CACHED INSIGHTS  
    await this.env.JOURNALDB.prepare(
      "DELETE FROM daily_insights WHERE uid = ? AND insight_date = ?"
    )
      .bind(uid, today)
      .run();

    // 2) UPSERT journal entry (overwrite if same date)
    const id = crypto.randomUUID();

    await this.env.JOURNALDB.prepare(
      `INSERT INTO journal_entries (id, uid, entry_date, title, content, mood, ai_chat)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(uid, entry_date) DO UPDATE SET
         title = excluded.title,
         content = excluded.content,
         mood = excluded.mood,
         ai_chat = excluded.ai_chat,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(
        id,
        uid,
        entryDate,
        raw.title || null,
        raw.content || null,
        raw.mood ?? null,
        raw.ai_chat ?? null
      )
      .run();

    return this.json({ status: "synced", id });
  } catch (e: unknown) {
    return this.json({ error: "sync failed", details: String(e) }, 500);
  }
}

  // -----------------------------------------
  // 2️⃣ CALCULATE STREAKS + AWARD BADGES (FIXED)
  // -----------------------------------------
  async getStreaks(uid: string): Promise<Response> {
    try {
      // Get unique dates only (one entry per date)
      const stmt = this.env.JOURNALDB.prepare(
        "SELECT DISTINCT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
      );
      const rows = await stmt.bind(uid).all<{ entry_date: string }>();

      if (!rows.results.length) {
        return this.json({
          uid,
          currentStreak: 0,
          longestStreak: 0,
          lastEntryDate: null,
          totalEntries: 0,
        });
      }

      // Get unique sorted dates (newest first)
      const uniqueDates: Set<string> = new Set(rows.results.map((r: { entry_date: string }) => r.entry_date));
      const dates = Array.from(uniqueDates).sort().reverse();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if streak is still active (last entry is today or yesterday)
      const lastEntryDate = dates[0]!;
      const isStreakActive = lastEntryDate === todayStr || lastEntryDate === yesterdayStr;

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;

      if (isStreakActive) {
        currentStreak = 1; // Start counting from the most recent entry

        // Calculate current streak from most recent date backwards
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]!);
          const currDate = new Date(dates[i]!);
          const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

          if (diffDays === 1) {
            currentStreak++;
          } else {
            break; // Streak broken
          }
        }
      }

      // Calculate longest streak
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]!);
        const currDate = new Date(dates[i]!);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      // Award badges based on current streak
      const newlyEarned = await this.awardBadges(uid, currentStreak);

      return this.json({
  uid,
  currentStreak,
  longestStreak,
  lastEntryDate,
  totalEntries: dates.length,
  newlyEarned,
  isStreakActive,
  // ADD THESE NEW FIELDS:
  streakBroken: !isStreakActive && dates.length > 0,
  missedDays: !isStreakActive && dates.length > 0 
    ? Math.floor((today.getTime() - new Date(lastEntryDate).getTime()) / 86400000) - 1
    : 0,
  previousStreak: !isStreakActive ? longestStreak : 0
});
    } catch (e: unknown) {
      return this.json({ error: "streaks failed", details: String(e) }, 500);
    }
  }

  // -----------------------------------------
  // Award badges helper
  // -----------------------------------------
  async awardBadges(uid: string, streak: number): Promise<Badge[]> {
    try {
      const db = this.env.JOURNALDB;
      const rows = await db.prepare("SELECT badge_id FROM user_badges WHERE uid = ?").bind(uid).all<{ badge_id: string }>();
      const earnedSet = new Set<string>(rows.results.map((r: { badge_id: string }) => r.badge_id));
      const newly: Badge[] = [];

      for (const badge of this.BADGES) {
        if (streak >= badge.streak && !earnedSet.has(badge.id)) {
          await db.prepare("INSERT OR IGNORE INTO user_badges (uid, badge_id) VALUES (?, ?)").bind(uid, badge.id).run();
          newly.push(badge);
        }
      }

      return newly;
    } catch (e: unknown) {
      console.error("awardBadges error:", String(e));
      return [];
    }
  }

  // -----------------------------------------
  // GET ALL BADGES EARNED BY A USER
  // -----------------------------------------
  async getUserBadges(uid: string): Promise<Response> {
    try {
      const rows = await this.env.JOURNALDB.prepare("SELECT badge_id FROM user_badges WHERE uid = ?").bind(uid).all<{ badge_id: string }>();
      const earnedIds: string[] = rows.results.map((r: { badge_id: string }) => r.badge_id);
      const earnedBadges: Badge[] = this.BADGES.filter((b: Badge) => earnedIds.includes(b.id));
      return this.json({ uid, badges: earnedBadges });
    } catch (e: unknown) {
      return this.json({ error: "get badges failed", details: String(e) }, 500);
    }
  }
// -----------------------------------------
// 3️⃣ WEEKLY INSIGHTS (AI + Daily Cache)
// -----------------------------------------
async getInsights(uid: string): Promise<Response> {
  try {
    const db = this.env.JOURNALDB;
    const today = new Date().toISOString().slice(0, 10);

    // 1️⃣ CHECK CACHE
    const cached = await db
      .prepare(
        "SELECT insights_json FROM daily_insights WHERE uid = ? AND insight_date = ?"
      )
      .bind(uid, today)
      .all<{ insights_json: string }>();

    if (cached.results.length > 0) {
      return this.json({
        uid,
        insights: JSON.parse(cached.results[0]?.insights_json ?? "[]"),
        cached: true
      });
    }

    // 2️⃣ FETCH LAST 7 DAYS ENTRIES
    const rows = await db
      .prepare(
        `SELECT entry_date, mood, title, content, ai_chat
         FROM journal_entries
         WHERE uid = ?
           AND entry_date >= date('now', '-7 days')
         ORDER BY entry_date ASC`
      )
      .bind(uid)
      .all<{
        entry_date: string;
        mood: number | null;
        title: string | null;
        content: string | null;
        ai_chat: string | null;
      }>();

    const entries: {
      entry_date: string;
      mood: number | null;
      title: string | null;
      content: string | null;
      ai_chat: string | null;
    }[] = rows.results;

    // 3️⃣ Create summary for AI
    const textSummary = entries
      .map((e: {
        entry_date: string;
        mood: number | null;
        title: string | null;
        content: string | null;
        ai_chat: string | null;
      }) => `
Date: ${e.entry_date}
Mood: ${e.mood ?? "N/A"}
Journal: ${e.title ?? ""} — ${e.content ?? ""}
AI Chat: ${e.ai_chat ?? ""}
`.trim())
      .join("\n\n");

    // 4️⃣ CALL AI (SHORT OUTPUT)
    const aiResponse: any = await this.env.AI.run("llama-3.1-8b-instant", {
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a gentle, deeply empathetic journaling companion.
Your tone feels warm, human, kind, and softly encouraging—never robotic.

Write only 1–2 short insights that feel comforting, hopeful, or grounding.
Think like a caring friend who notices small emotional patterns with love.

Your insights should be:
• simple and soothing  
• written in natural conversational human language  
• encouraging but never preachy  
• emotionally safe, soft, and validating  
• 1–2 sentences max  

Return JSON only: { "insights": ["..."] }
`
        },
        {
          role: "user",
          content: textSummary
        }
      ]
    });

    let insights: string[] = [];

    // normal output
    if (Array.isArray(aiResponse.insights)) {
      insights = aiResponse.insights;
    } else {
      // fallback for model returning message as string
      try {
        const parsed = JSON.parse(
          aiResponse.choices?.[0]?.message?.content || "{}"
        );
        if (Array.isArray(parsed.insights)) insights = parsed.insights;
      } catch (_err: any) {
        insights = [];
      }
    }

    // 5️⃣ SAVE TO CACHE
    await db
      .prepare(
        `INSERT OR REPLACE INTO daily_insights (uid, insight_date, insights_json)
         VALUES (?, ?, ?)`
      )
      .bind(uid, today, JSON.stringify(insights))
      .run();

    // 6️⃣ RETURN
    return this.json({
      uid,
      insights,
      cached: false
    });
  } catch (e: any) {
    return this.json({ error: "insights failed", details: String(e) }, 500);
  }
}

  // -----------------------------------------
  // 4️⃣ GET MOOD LAST 7 DAYS
  // -----------------------------------------
  async getMoodLast7(uid: string): Promise<Response> {
    try {
      const rows = await this.env.JOURNALDB.prepare(`
        SELECT entry_date, mood
        FROM journal_entries
        WHERE uid = ?
          AND mood IS NOT NULL
          AND entry_date >= date('now', '-7 days')
        ORDER BY entry_date ASC
      `).bind(uid).all<{ entry_date: string; mood: number }>();

      const moodData = rows.results.map((r: { entry_date: string; mood: number }) => ({ date: r.entry_date, mood: r.mood }));
      return this.json({ uid, moodData });
    } catch (e: unknown) {
      return this.json({ error: "mood fetch failed", details: String(e) }, 500);
    }
  }

  // -----------------------------------------
  // 5️⃣ DEBUG DUMP
  // -----------------------------------------
  async debugDump(uid: string): Promise<Response> {
    try {
      const rows = await this.env.JOURNALDB.prepare(
        "SELECT id, uid, entry_date, title, content, created_at, updated_at FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
      ).bind(uid).all();

      return this.json({ uid, count: rows.results.length, entries: rows.results });
    } catch (e: unknown) {
      return this.json({ error: "debug failed", details: String(e) }, 500);
    }
  }

  // -----------------------------------------
  // 6️⃣ RESET DATABASE (DEV)
  // -----------------------------------------
  async resetDatabase(): Promise<Response> {
    try {
      const db = this.env.JOURNALDB;
      await db.prepare("DROP TABLE IF EXISTS journal_entries").run();
      await db.prepare("DROP TABLE IF EXISTS user_badges").run();

      await db.prepare(`
        CREATE TABLE journal_entries (
          id TEXT PRIMARY KEY,
          uid TEXT NOT NULL,
          entry_date TEXT NOT NULL,
          title TEXT,
          content TEXT,
          mood INTEGER,
          ai_chat TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(uid, entry_date)
        )
      `).run();

      await db.prepare(`
        CREATE TABLE user_badges (
          uid TEXT NOT NULL,
          badge_id TEXT NOT NULL,
          earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (uid, badge_id)
        )
      `).run();

      return this.json({ status: "Database reset successfully" });
    } catch (e: unknown) {
      return this.json({ error: "reset failed", details: String(e) }, 500);
    }
  }
}