import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./firebase.js";
import authRoutes from "./routes/auth.js";
import journalRoutes from "./routes/journal.js";

import promptRoutes from "./routes/prompts.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/journal", journalRoutes);
app.use("/prompts", promptRoutes);
app.get("/", async (req, res) => {
  const snapshot = await db.collection("test").get();
  res.send(`Connected! Found ${snapshot.size} test docs 🌿`);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
