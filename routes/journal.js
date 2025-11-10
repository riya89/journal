import express from "express";
import { db, auth } from "../firebase.js";

const router = express.Router();

// Middleware to verify token
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

// Save journal entry
router.post("/add", verifyToken, async (req, res) => {
  const { title, content, mood } = req.body;
  const entry = { title, content, mood, createdAt: new Date() };
  await db.collection("users").doc(req.uid).collection("journals").add(entry);
  res.json({ message: "Journal saved successfully ✅" });
});

// Fetch user’s journal entries
router.get("/list", verifyToken, async (req, res) => {
  const snapshot = await db.collection("users").doc(req.uid).collection("journals").get();
  const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(entries);
});

export default router;
