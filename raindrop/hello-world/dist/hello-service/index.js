globalThis.__RAINDROP_GIT_COMMIT_SHA = "d729a756d5ae214dde3ff06a3a7117b4dcc01013"; 

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
  // ✅ Updated json helper
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
  // async fetch(request: Request): Promise<Response> {
  //   const url = new URL(request.url);
  //   const path = url.pathname;
  //   const method = request.method;
  //   // CORS preflight
  //   if (method === "OPTIONS") {
  //     return new Response(null, {
  //       status: 204,
  //       headers: {
  //         "Access-Control-Allow-Origin": "*",
  //         "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  //         "Access-Control-Allow-Headers": "Content-Type",
  //       },
  //     });
  //   }
  //   if (path === "/" && method === "GET") {
  //     return new Response("Journal Analytics Running ✔️");
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
  // // helper for JSON responses
  // json(data: any, status = 200): Response {
  //   return new Response(JSON.stringify(data), {
  //     status,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Access-Control-Allow-Origin": "*",
  //     },
  //   });
  // }
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
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS user_badges (
          uid TEXT NOT NULL,
          badge_id TEXT NOT NULL,
          earned_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      return this.json({ status: "SQL DB initialized" });
    } catch (e) {
      return this.json({ error: "init failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 1️⃣ INSERT JOURNAL ENTRY
  // -----------------------------------------
  async syncJournal(request) {
    try {
      const raw = await request.json();
      if (!raw?.uid || !raw?.date) return this.json({ error: "uid and date required" }, 400);
      const id = crypto.randomUUID();
      await this.env.JOURNALDB.prepare(
        `INSERT INTO journal_entries (id, uid, entry_date, title, content, mood, ai_chat)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        raw.uid,
        raw.date,
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
  // 2️⃣ CALCULATE STREAKS + AWARD BADGES
  // -----------------------------------------
  async getStreaks(uid) {
    try {
      const stmt = this.env.JOURNALDB.prepare(
        "SELECT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
      );
      const rows = await stmt.bind(uid).all();
      if (!rows.results.length) {
        return this.json({
          uid,
          currentStreak: 0,
          longestStreak: 0,
          lastEntryDate: null
        });
      }
      const dates = rows.results.map((r) => r.entry_date).sort().reverse();
      const dayDiff = (a, b) => Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 864e5);
      let current = 1;
      let longest = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = dates[i - 1];
        const curr = dates[i];
        if (dayDiff(prev, curr) === 1) {
          current++;
        } else {
          longest = Math.max(longest, current);
          current = 1;
        }
      }
      longest = Math.max(longest, current);
      const newlyEarned = await this.awardBadges(uid, current);
      return this.json({
        uid,
        currentStreak: current,
        longestStreak: longest,
        lastEntryDate: dates[0],
        totalEntries: dates.length,
        newlyEarned
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
          await db.prepare("INSERT INTO user_badges (uid, badge_id) VALUES (?, ?)").bind(uid, badge.id).run();
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
  // -----------------------------------------
  // 3️⃣ WEEKLY INSIGHTS (uses AI)
  // -----------------------------------------
  async getInsights(uid) {
    try {
      const db = this.env.JOURNALDB;
      const rows = await db.prepare(`
        SELECT entry_date, mood, title, content, ai_chat
        FROM journal_entries
        WHERE uid = ?
          AND entry_date >= date('now', '-7 days')
        ORDER BY entry_date ASC
      `).bind(uid).all();
      const entries = rows.results;
      const journalCount = entries.length;
      const aiChatCount = entries.filter(
        (e) => e.ai_chat !== null && e.ai_chat.trim() !== ""
      ).length;
      const moods = entries.map((e) => e.mood).filter((m) => m !== null);
      const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null;
      const streakResp = await this.getStreaks(uid);
      const streakData = await streakResp.json();
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
You are a warm, emotionally intelligent journaling companion.
Your tone is soft and kind. Return only JSON: { "insights": ["...","..."] }
`
          },
          {
            role: "user",
            content: textSummary
          }
        ]
      });
      const insights = aiResponse.insights || aiResponse.choices?.[0]?.message?.content || [];
      return this.json({
        uid,
        avgMood,
        journalCount,
        aiChatCount,
        currentStreak: streakData?.currentStreak ?? null,
        insights
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
        "SELECT id, uid, entry_date, title, content, created_at FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
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
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      await db.prepare(`
        CREATE TABLE user_badges (
          uid TEXT NOT NULL,
          badge_id TEXT NOT NULL,
          earned_at TEXT DEFAULT CURRENT_TIMESTAMP
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
