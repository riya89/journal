// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { db } from "./firebase.js";
// import authRoutes from "./routes/auth.js";
// import journalRoutes from "./routes/journal.js";

// import promptRoutes from "./routes/prompts.js";

// dotenv.config();
// const app = express();
// app.use(cors());
// // app.use(express.json());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// app.use("/auth", authRoutes);
// app.use("/journal", journalRoutes);
// app.use("/prompts", promptRoutes);
// app.get("/", async (req, res) => {
//   const snapshot = await db.collection("test").get();
//   res.send(`Connected! Found ${snapshot.size} test docs 🌿`);
// });

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./firebase.js";
import authRoutes from "./routes/auth.js";
import journalRoutes from "./routes/journal.js";
import fetch from "node-fetch";
import promptRoutes from "./routes/prompts.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/auth", authRoutes);
app.use("/journal", journalRoutes);
app.use("/prompts", promptRoutes);

// 🌿 Test route
app.get("/", async (req, res) => {
  const snapshot = await db.collection("test").get();
  res.send(`Connected! Found ${snapshot.size} test docs 🌿`);
});

// 🌧️ RAINDROP SYNC PROXY (fixes CORS)
app.post("/raindrop/sync", async (req, res) => {
  try {
    const response = await fetch(
      "https://hello-service.01k9ppzcfjfvyc4cwm4p0ccypp.lmapp.run/analytics/sync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

// ---- Proxy: Streaks ----
app.get("/raindrop/streaks", async (req, res) => {
  const uid = req.query.uid;
  const response = await fetch(
    `https://hello-service.01k9ppzcfjfvyc4cwm4p0ccypp.lmapp.run/analytics/streaks?uid=${uid}`
  );
  const data = await response.json();
  res.json(data);
});

// ---- Proxy: Badges ----
app.get("/raindrop/badges", async (req, res) => {
  const uid = req.query.uid;
  const response = await fetch(
    `https://hello-service.01k9ppzcfjfvyc4cwm4p0ccypp.lmapp.run/analytics/badges?uid=${uid}`
  );
  const data = await response.json();
  res.json(data);
});

// ---- Proxy: Insights ----
app.get("/raindrop/insights", async (req, res) => {
  const uid = req.query.uid;
  const response = await fetch(
    `https://hello-service.01k9ppzcfjfvyc4cwm4p0ccypp.lmapp.run/analytics/insights?uid=${uid}`
  );
  const data = await response.json();
  res.json(data);
});

// ---- Proxy: Mood Last 7 Days ----
app.get("/raindrop/mood", async (req, res) => {
  const uid = req.query.uid;
  const response = await fetch(
    `https://hello-service.01k9ppzcfjfvyc4cwm4p0ccypp.lmapp.run/analytics/mood?uid=${uid}`
  );
  const data = await response.json();
  res.json(data);
});
// 🚀 Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
