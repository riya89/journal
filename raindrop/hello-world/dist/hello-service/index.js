globalThis.__RAINDROP_GIT_COMMIT_SHA = "c91729fa10b26cf4fe3d2f4d9cd10fdf3e695259"; 

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
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (path === "/" && method === "GET") {
      return new Response("Journal Analytics Running \u2714\uFE0F");
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
    if (path === "/analytics/debug" && method === "GET") {
      const uid = url.searchParams.get("uid") || "";
      return this.debugDump(uid);
    }
    if (path === "/analytics/reset" && method === "POST") {
      return this.resetDatabase();
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
    return this.json({ error: "Not Found" }, 404);
  }
  // -----------------------------------------
  // Helpers
  // -----------------------------------------
  json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  // -----------------------------------------
  // 0️⃣ INIT SQL DATABASE
  // -----------------------------------------
  async initSQL() {
    try {
      const db = this.env.JOURNALDB;
      const stmt = db.prepare(`
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
      `);
      await stmt.run();
      return this.json({ status: "SQL DB initialized" });
    } catch (e) {
      console.error("INIT ERROR:", e);
      return this.json({ error: "init failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 1️⃣ INSERT ENTRY INTO SQL
  // -----------------------------------------
  // async syncJournal(request: Request): Promise<Response> {
  //   try {
  //     const rawBody: unknown = await request.json();
  //     if (
  //       typeof rawBody !== "object" ||
  //       rawBody === null ||
  //       !("uid" in rawBody) ||
  //       !("date" in rawBody)
  //     ) {
  //       return this.json({ error: "uid and date required" }, 400);
  //     }
  //     const body = rawBody as {
  //       uid: string;
  //       date: string;
  //       title?: string;
  //       content?: string;
  //     };
  //     const uid = body.uid;
  //     const date = body.date;
  //     const id = crypto.randomUUID();
  //     const stmt = this.env.JOURNALDB.prepare(
  //       "INSERT INTO journal_entries (id, uid, entry_date, title, content) VALUES (?, ?, ?, ?, ?)"
  //     );
  //     await stmt.bind(id, uid, date, body.title || null, body.content || null).run();
  //     return this.json({ 
  //       status: "synced", 
  //       id, 
  //       uid, 
  //       date,
  //       title: body.title || null,
  //       content: body.content || null
  //     });
  //   } catch (e) {
  //     console.error("SYNC ERROR:", e);
  //     return this.json({ error: "sync failed", details: String(e) }, 500);
  //   }
  // }
  async syncJournal(request) {
    try {
      const rawBody = await request.json();
      if (typeof rawBody !== "object" || rawBody === null || !("uid" in rawBody) || !("date" in rawBody)) {
        return this.json({ error: "uid and date required" }, 400);
      }
      const body = rawBody;
      const uid = body.uid;
      const date = body.date;
      const id = crypto.randomUUID();
      const stmt = this.env.JOURNALDB.prepare(
        `INSERT INTO journal_entries 
        (id, uid, entry_date, title, content, mood, ai_chat) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      await stmt.bind(
        id,
        uid,
        date,
        body.title || null,
        body.content || null,
        body.mood ?? null,
        body.ai_chat ?? null
      ).run();
      return this.json({
        status: "synced",
        id,
        uid,
        date,
        title: body.title || null,
        content: body.content || null,
        mood: body.mood ?? null,
        ai_chat: body.ai_chat ?? null
      });
    } catch (e) {
      console.error("SYNC ERROR:", e);
      return this.json({ error: "sync failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 2️⃣ CALCULATE STREAKS
  // -----------------------------------------
  async getStreaks(uid) {
    try {
      const stmt = this.env.JOURNALDB.prepare(
        "SELECT entry_date FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
      );
      const result = await stmt.bind(uid).all();
      if (!result.results.length) {
        return this.json({
          uid,
          currentStreak: 0,
          longestStreak: 0,
          lastEntryDate: null
        });
      }
      const dates = result.results.map((r) => r.entry_date).sort().reverse();
      const dayDiff = (a, b) => Math.floor(
        (new Date(a).getTime() - new Date(b).getTime()) / 864e5
      );
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
      return this.json({
        uid,
        currentStreak: current,
        longestStreak: longest,
        lastEntryDate: dates[0],
        totalEntries: dates.length
      });
    } catch (e) {
      console.error("STREAKS ERROR:", e);
      return this.json({ error: "streaks failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 6️⃣ WEEKLY INSIGHTS USING AI
  // -----------------------------------------
  async getInsights(uid) {
    try {
      const db = this.env.JOURNALDB;
      const stmt = db.prepare(`
      SELECT entry_date, mood, title, content, ai_chat
      FROM journal_entries
      WHERE uid = ?
        AND entry_date >= date('now', '-7 days')
      ORDER BY entry_date ASC
    `);
      const rows = await stmt.bind(uid).all();
      const entries = rows.results;
      const journalCount = entries.length;
      const aiChatCount = entries.filter(
        (e) => e.ai_chat !== null && e.ai_chat.trim() !== ""
      ).length;
      const moods = entries.map((e) => e.mood).filter((m) => m !== null);
      const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : null;
      const streakResponse = await this.getStreaks(uid);
      const streakData = await streakResponse.json();
      const textSummary = entries.map(
        (e) => `
Date: ${e.entry_date}
Mood: ${e.mood ?? "N/A"}
Journal: ${e.title ?? ""} \u2014 ${e.content ?? ""}
AI Chat: ${e.ai_chat ?? ""}
      `.trim()
      ).join("\n\n");
      const aiResponse = await this.env.AI.run("llama-3.1-8b-instant", {
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are a warm, emotionally intelligent journaling companion.
Your tone is soft, comforting, and non-judgmental \u2014 like a supportive therapist or a kind friend.

Your role: 
Gently notice patterns in the user's moods, journaling behavior, and thoughts from the week.
Offer encouragement, validation, and small meaningful insights.

Stay away from clinical language.  
Avoid giving commands or instructions.
Use phrases like:
- "it seems like..."
- "you might be feeling..."
- "you've been trying your best..."
- "it's okay to..."
- "something I notice is..."

Your entire response MUST be valid JSON in this exact format:

{
  "insights": ["sentence 1", "sentence 2", "sentence 3"]
}

Each insight should be:
- short (1\u20132 sentences)
- kind
- emotionally aware
- uplifting but realistic
- safe and non-directive
`
          },
          {
            role: "user",
            content: `
Here is the past 7 days of journaling and mood data:

${textSummary}

Return only the JSON.
`
          }
        ]
      });
      const insights = aiResponse.insights || aiResponse.choices?.[0]?.message?.content || [];
      return this.json({
        uid,
        avgMood,
        journalCount,
        aiChatCount,
        currentStreak: streakData.currentStreak,
        insights
      });
    } catch (e) {
      console.error("INSIGHTS ERROR:", e);
      return this.json({ error: "insights failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 5️⃣ GET MOOD (LAST 7 DAYS)
  // -----------------------------------------
  async getMoodLast7(uid) {
    try {
      const stmt = this.env.JOURNALDB.prepare(`
      SELECT entry_date, mood
      FROM journal_entries
      WHERE uid = ?
      AND mood IS NOT NULL
      AND entry_date >= date('now', '-7 days')
      ORDER BY entry_date ASC
    `);
      const rows = await stmt.bind(uid).all();
      const moodData = rows.results.map((r) => ({
        date: r.entry_date,
        mood: r.mood
      }));
      return this.json({
        uid,
        moodData
      });
    } catch (e) {
      console.error("MOOD ERROR:", e);
      return this.json({ error: "mood fetch failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 3️⃣ DEBUG DUMP
  // -----------------------------------------
  async debugDump(uid) {
    try {
      const stmt = this.env.JOURNALDB.prepare(
        "SELECT id, uid, entry_date, title, content, created_at FROM journal_entries WHERE uid = ? ORDER BY entry_date DESC"
      );
      const rows = await stmt.bind(uid).all();
      return this.json({
        uid,
        count: rows.results.length,
        entries: rows.results
      });
    } catch (e) {
      console.error("DEBUG ERROR:", e);
      return this.json({ error: "debug failed", details: String(e) }, 500);
    }
  }
  // -----------------------------------------
  // 4️⃣ RESET DATABASE (Development Only)
  // -----------------------------------------
  async resetDatabase() {
    try {
      const db = this.env.JOURNALDB;
      const dropStmt = db.prepare("DROP TABLE IF EXISTS journal_entries");
      await dropStmt.run();
      const createStmt = db.prepare(`
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
      `);
      await createStmt.run();
      return this.json({ status: "Database reset successfully" });
    } catch (e) {
      console.error("RESET ERROR:", e);
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
