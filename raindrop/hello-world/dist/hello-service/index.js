globalThis.__RAINDROP_GIT_COMMIT_SHA = "23aeba134009adec50c43f93eac5674ad326e3ac"; 

// node_modules/@liquidmetal-ai/raindrop-framework/dist/core/cors.js
var matchOrigin = (request, env, config) => {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin) {
    return null;
  }
  const { origin } = config;
  if (origin === "*") {
    return "*";
  }
  if (typeof origin === "function") {
    return origin(request, env);
  }
  if (typeof origin === "string") {
    return requestOrigin === origin ? origin : null;
  }
  if (Array.isArray(origin)) {
    return origin.includes(requestOrigin) ? requestOrigin : null;
  }
  return null;
};
var addCorsHeaders = (response, request, env, config) => {
  const allowedOrigin = matchOrigin(request, env, config);
  if (!allowedOrigin) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  if (config.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  if (config.exposeHeaders && config.exposeHeaders.length > 0) {
    headers.set("Access-Control-Expose-Headers", config.exposeHeaders.join(", "));
  }
  const vary = headers.get("Vary");
  if (vary) {
    if (!vary.includes("Origin")) {
      headers.set("Vary", `${vary}, Origin`);
    }
  } else {
    headers.set("Vary", "Origin");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
var handlePreflight = (request, env, config) => {
  const allowedOrigin = matchOrigin(request, env, config);
  if (!allowedOrigin) {
    return new Response(null, { status: 403 });
  }
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  if (config.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  const allowMethods = config.allowMethods || ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
  headers.set("Access-Control-Allow-Methods", allowMethods.join(", "));
  const allowHeaders = config.allowHeaders || ["Content-Type", "Authorization"];
  headers.set("Access-Control-Allow-Headers", allowHeaders.join(", "));
  const maxAge = config.maxAge ?? 86400;
  headers.set("Access-Control-Max-Age", maxAge.toString());
  headers.set("Vary", "Origin");
  return new Response(null, {
    status: 204,
    headers
  });
};
var createCorsHandler = (config) => {
  return (request, env, response) => {
    if (!response) {
      return handlePreflight(request, env, config);
    }
    return addCorsHeaders(response, request, env, config);
  };
};
var corsAllowAll = createCorsHandler({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false
});
var corsDisabled = (request, _env, response) => {
  if (!response && request.method === "OPTIONS") {
    return new Response(null, { status: 403 });
  }
  if (!response) {
    throw new Error("corsDisabled called without response for non-OPTIONS request");
  }
  return response;
};

// src/_app/cors.ts
var cors = corsDisabled;

// src/hello-service/index.ts
import { Service } from "./runtime.js";
var hello_service_default = class extends Service {
  // -----------------------------
  // 🎖️ BADGE DEFINITIONS
  // -----------------------------
  BADGES = [
    { id: "badge3", streak: 7, url: "https://blr1.vultrobjects.com/badges/badge3.png" },
    { id: "badge4", streak: 14, url: "https://blr1.vultrobjects.com/badges/badge4.png" },
    { id: "badge5", streak: 21, url: "https://blr1.vultrobjects.com/badges/badge5.png" },
    { id: "badge6", streak: 30, url: "https://blr1.vultrobjects.com/badges/badge6.png" },
    { id: "badge7", streak: 60, url: "https://blr1.vultrobjects.com/badges/badge7.png" },
    { id: "badge8", streak: 90, url: "https://blr1.vultrobjects.com/badges/badge8.png" }
  ];
  // -----------------------------
  // Router
  // -----------------------------
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    if (path === "/" && method === "GET") {
      return new Response("Journal Analytics Running \u2714\uFE0F", {
        headers: corsHeaders
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
    return this.json({ error: "Not Found" }, 404);
  }
  json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }
  // -----------------------------------------
  // 0️⃣ INIT SQL DATABASE
  // -----------------------------------------
  async initSQL() {
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
    } catch (e) {
      return this.json({ error: "init failed", details: String(e) }, 500);
    }
  }
  // // -----------------------------------------
  // // 1️⃣ UPSERT JOURNAL ENTRY (Insert or Update)
  // // -----------------------------------------
  // async syncJournal(request: Request): Promise<Response> {
  //   try {
  //     const raw: any = await request.json();
  //     if (!raw?.uid || !raw?.date) return this.json({ error: "uid and date required" }, 400);
  //     // Check if entry exists for this uid + date
  //     const existing = await this.env.JOURNALDB.prepare(
  //       `SELECT id FROM journal_entries WHERE uid = ? AND entry_date = ?`
  //     ).bind(raw.uid, raw.date).first<{ id: string }>();
  //     if (existing) {
  //       // UPDATE existing entry
  //       await this.env.JOURNALDB.prepare(
  //         `UPDATE journal_entries 
  //          SET title = ?, content = ?, mood = ?, ai_chat = ?, updated_at = CURRENT_TIMESTAMP
  //          WHERE uid = ? AND entry_date = ?`
  //       )
  //         .bind(
  //           raw.title || null,
  //           raw.content || null,
  //           raw.mood ?? null,
  //           raw.ai_chat ?? null,
  //           raw.uid,
  //           raw.date
  //         )
  //         .run();
  //       return this.json({ status: "updated", id: existing.id });
  //     } else {
  //       // INSERT new entry
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
  //       return this.json({ status: "created", id });
  //     }
  //   } catch (e: unknown) {
  //     return this.json({ error: "sync failed", details: String(e) }, 500);
  //   }
  // }
  // -----------------------------------------
  // 1️⃣ INSERT JOURNAL ENTRY (overwrite per day + clear insight cache)
  // -----------------------------------------
  async syncJournal(request) {
    try {
      let raw = request.method === "GET" ? Object.fromEntries(new URL(request.url).searchParams.entries()) : await request.json();
      if (!raw?.uid || !raw?.date) {
        return this.json({ error: "uid and date required" }, 400);
      }
      const uid = raw.uid;
      const entryDate = raw.date;
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      await this.env.JOURNALDB.prepare(
        "DELETE FROM daily_insights WHERE uid = ? AND insight_date = ?"
      ).bind(uid, today).run();
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
      ).bind(
        id,
        uid,
        entryDate,
        raw.title || null,
        raw.content || null,
        raw.mood ?? null,
        raw.ai_chat ?? null
      ).run();
      return this.json({ status: "synced", id });
    } catch (e) {
      return this.json({ error: "sync failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 2️⃣ CALCULATE STREAKS + AWARD BADGES (FIXED)
  // -----------------------------------------
  async getStreaks(uid) {
    try {
      const stmt = this.env.JOURNALDB.prepare(
        "SELECT DISTINCT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
      );
      const rows = await stmt.bind(uid).all();
      if (!rows.results.length) {
        return this.json({
          uid,
          currentStreak: 0,
          longestStreak: 0,
          lastEntryDate: null,
          totalEntries: 0
        });
      }
      const uniqueDates = new Set(rows.results.map((r) => r.entry_date));
      const dates = Array.from(uniqueDates).sort().reverse();
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const lastEntryDate = dates[0];
      const isStreakActive = lastEntryDate === todayStr || lastEntryDate === yesterdayStr;
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;
      if (isStreakActive) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 864e5);
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 864e5);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
      const newlyEarned = await this.awardBadges(uid, currentStreak);
      return this.json({
        uid,
        currentStreak,
        longestStreak,
        lastEntryDate,
        totalEntries: dates.length,
        newlyEarned,
        isStreakActive
      });
    } catch (e) {
      return this.json({ error: "streaks failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // Award badges helper
  // -----------------------------------------
  async awardBadges(uid, streak) {
    try {
      const db = this.env.JOURNALDB;
      const rows = await db.prepare("SELECT badge_id FROM user_badges WHERE uid = ?").bind(uid).all();
      const earnedSet = new Set(rows.results.map((r) => r.badge_id));
      const newly = [];
      for (const badge of this.BADGES) {
        if (streak >= badge.streak && !earnedSet.has(badge.id)) {
          await db.prepare("INSERT OR IGNORE INTO user_badges (uid, badge_id) VALUES (?, ?)").bind(uid, badge.id).run();
          newly.push(badge);
        }
      }
      return newly;
    } catch (e) {
      console.error("awardBadges error:", String(e));
      return [];
    }
  }
  // -----------------------------------------
  // GET ALL BADGES EARNED BY A USER
  // -----------------------------------------
  async getUserBadges(uid) {
    try {
      const rows = await this.env.JOURNALDB.prepare("SELECT badge_id FROM user_badges WHERE uid = ?").bind(uid).all();
      const earnedIds = rows.results.map((r) => r.badge_id);
      const earnedBadges = this.BADGES.filter((b) => earnedIds.includes(b.id));
      return this.json({ uid, badges: earnedBadges });
    } catch (e) {
      return this.json({ error: "get badges failed", details: String(e) }, 500);
    }
  }
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
  //         (e: { ai_chat: string | null }) => e.ai_chat !== null && e.ai_chat.trim() !== ""
  //       ).length;
  //       const moods = entries
  //         .map((e: { mood: number | null }) => e.mood)
  //         .filter((m: number | null): m is number => m !== null);
  //       const avgMood = moods.length ? moods.reduce((a: number, b: number) => a + b, 0) / moods.length : null;
  //       const streakResp = await this.getStreaks(uid);
  //       const streakData = (await streakResp.json()) as { currentStreak?: number; longestStreak?: number } | null;
  //       const textSummary = entries
  //         .map((e: {
  //           entry_date: string;
  //           mood: number | null;
  //           title: string | null;
  //           content: string | null;
  //           ai_chat: string | null;
  //         }) => `
  // Date: ${e.entry_date}
  // Mood: ${e.mood ?? "N/A"}
  // Journal: ${e.title ?? ""} — ${e.content ?? ""}
  // AI Chat: ${e.ai_chat ?? ""}
  // `.trim())
  //         .join("\n\n");
  //       const aiResponse = await this.env.AI.run("llama-3.1-8b-instant", {
  //         model: "llama-3.1-8b-instant",
  //         response_format: { type: "json_object" },
  //         messages: [
  //           {
  //             role: "system",
  //             content: `You are a warm, emotionally intelligent journaling companion. Your tone is soft and kind. Give 1-2 lines only. Return only JSON: { "insights": ["...","..."] }`
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
  // async getInsights(uid: string): Promise<Response> {
  //   try {
  //     const db = this.env.JOURNALDB;
  //     // Today (YYYY-MM-DD)
  //     const today = new Date().toISOString().slice(0, 10);
  //     // 1️⃣ CHECK CACHED INSIGHTS
  //     const cached = await db.prepare(
  //       `SELECT insights_json FROM daily_insights WHERE uid = ? AND insight_date = ?`
  //     )
  //       .bind(uid, today)
  //       .all<{ insights_json: string }>();
  //   if (cached.results.length > 0) {
  //   const row = cached.results[0]!; // <- non-null assertion
  //   const insights = JSON.parse(row.insights_json || "[]");
  //   return this.json({
  //     uid,
  //     insights,
  //   });
  // }
  //     // 2️⃣ FETCH LAST 7 DAYS
  //     const rows = await db.prepare(`
  //       SELECT entry_date, mood, title, content, ai_chat
  //       FROM journal_entries
  //       WHERE uid = ?
  //         AND entry_date >= date('now', '-7 days')
  //       ORDER BY entry_date ASC
  //     `)
  //       .bind(uid)
  //       .all<{
  //         entry_date: string;
  //         mood: number | null;
  //         title: string | null;
  //         content: string | null;
  //         ai_chat: string | null;
  //       }>();
  //     const entries = rows.results;
  //     // 3️⃣ Build summary for AI (with typed e)
  //     const textSummary = entries
  //       .map(
  //         (e: {
  //           entry_date: string;
  //           mood: number | null;
  //           title: string | null;
  //           content: string | null;
  //           ai_chat: string | null;
  //         }) => `
  // Date: ${e.entry_date}
  // Mood: ${e.mood ?? "N/A"}
  // Journal: ${e.title ?? ""} — ${e.content ?? ""}
  // AI Chat: ${e.ai_chat ?? ""}
  //       `.trim()
  //       )
  //       .join("\n\n");
  //     // 4️⃣ RUN AI
  //     const aiResponse = await this.env.AI.run("llama-3.1-8b-instant", {
  //       model: "llama-3.1-8b-instant",
  //       response_format: { type: "json_object" },
  //       messages: [
  //         {
  //           role: "system",
  //           content: `
  // You are a warm journaling companion.
  // Write only 1–2 short, uplifting reflections.
  // Return only JSON: { "insights": ["...","..."] }
  //           `,
  //         },
  //         {
  //           role: "user",
  //           content: textSummary,
  //         },
  //       ],
  //     });
  //     let insightsRaw: any =
  //       (aiResponse as any).insights ||
  //       (aiResponse as any).choices?.[0]?.message?.content ||
  //       [];
  //     // 5️⃣ SAFELY PARSE INSIGHTS WITH TS CHECKS
  //     let insightsList: string[] = [];
  //     if (Array.isArray(insightsRaw)) {
  //       insightsList = insightsRaw as string[];
  //     } else if (typeof insightsRaw === "string") {
  //       try {
  //         const parsed = JSON.parse(insightsRaw);
  //         insightsList = Array.isArray(parsed.insights)
  //           ? (parsed.insights as string[])
  //           : [];
  //       } catch {
  //         insightsList = [];
  //       }
  //     }
  //     // 6️⃣ CACHE INSIGHTS
  //     await db
  //       .prepare(
  //         `
  //       INSERT OR REPLACE INTO daily_insights (uid, insight_date, insights_json)
  //       VALUES (?, ?, ?)
  //     `
  //       )
  //       .bind(uid, today, JSON.stringify(insightsList))
  //       .run();
  //     return this.json({
  //       uid,
  //       insights: insightsList,
  //     });
  //   } catch (e: unknown) {
  //     return this.json({
  //       error: "insights failed",
  //       details: String(e),
  //     }, 500);
  //   }
  // }
  // -----------------------------------------
  // 3️⃣ WEEKLY INSIGHTS (AI + Daily Cache)
  // -----------------------------------------
  async getInsights(uid) {
    try {
      const db = this.env.JOURNALDB;
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const cached = await db.prepare(
        "SELECT insights_json FROM daily_insights WHERE uid = ? AND insight_date = ?"
      ).bind(uid, today).all();
      if (cached.results.length > 0) {
        return this.json({
          uid,
          insights: JSON.parse(cached.results[0]?.insights_json ?? "[]"),
          cached: true
        });
      }
      const rows = await db.prepare(
        `SELECT entry_date, mood, title, content, ai_chat
         FROM journal_entries
         WHERE uid = ?
           AND entry_date >= date('now', '-7 days')
         ORDER BY entry_date ASC`
      ).bind(uid).all();
      const entries = rows.results;
      const textSummary = entries.map((e) => `
Date: ${e.entry_date}
Mood: ${e.mood ?? "N/A"}
Journal: ${e.title ?? ""} \u2014 ${e.content ?? ""}
AI Chat: ${e.ai_chat ?? ""}
`.trim()).join("\n\n");
      const aiResponse = await this.env.AI.run("llama-3.1-8b-instant", {
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are a gentle, deeply empathetic journaling companion.
Your tone feels warm, human, kind, and softly encouraging\u2014never robotic.

Write only 1\u20132 short insights that feel comforting, hopeful, or grounding.
Think like a caring friend who notices small emotional patterns with love.

Your insights should be:
\u2022 simple and soothing  
\u2022 written in natural conversational human language  
\u2022 encouraging but never preachy  
\u2022 emotionally safe, soft, and validating  
\u2022 1\u20132 sentences max  

Return JSON only: { "insights": ["..."] }
`
          },
          {
            role: "user",
            content: textSummary
          }
        ]
      });
      let insights = [];
      if (Array.isArray(aiResponse.insights)) {
        insights = aiResponse.insights;
      } else {
        try {
          const parsed = JSON.parse(
            aiResponse.choices?.[0]?.message?.content || "{}"
          );
          if (Array.isArray(parsed.insights)) insights = parsed.insights;
        } catch (_err) {
          insights = [];
        }
      }
      await db.prepare(
        `INSERT OR REPLACE INTO daily_insights (uid, insight_date, insights_json)
         VALUES (?, ?, ?)`
      ).bind(uid, today, JSON.stringify(insights)).run();
      return this.json({
        uid,
        insights,
        cached: false
      });
    } catch (e) {
      return this.json({ error: "insights failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 4️⃣ GET MOOD LAST 7 DAYS
  // -----------------------------------------
  async getMoodLast7(uid) {
    try {
      const rows = await this.env.JOURNALDB.prepare(`
        SELECT entry_date, mood
        FROM journal_entries
        WHERE uid = ?
          AND mood IS NOT NULL
          AND entry_date >= date('now', '-7 days')
        ORDER BY entry_date ASC
      `).bind(uid).all();
      const moodData = rows.results.map((r) => ({ date: r.entry_date, mood: r.mood }));
      return this.json({ uid, moodData });
    } catch (e) {
      return this.json({ error: "mood fetch failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 5️⃣ DEBUG DUMP
  // -----------------------------------------
  async debugDump(uid) {
    try {
      const rows = await this.env.JOURNALDB.prepare(
        "SELECT id, uid, entry_date, title, content, created_at, updated_at FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
      ).bind(uid).all();
      return this.json({ uid, count: rows.results.length, entries: rows.results });
    } catch (e) {
      return this.json({ error: "debug failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 6️⃣ RESET DATABASE (DEV)
  // -----------------------------------------
  async resetDatabase() {
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
    } catch (e) {
      return this.json({ error: "reset failed", details: String(e) }, 500);
    }
  }
};

// <stdin>
var stdin_default = hello_service_default;
export {
  cors,
  stdin_default as default
};
