import express from "express";
import { auth, db } from "../firebase.js";

const router = express.Router();

// Verify Firebase ID Token
router.post("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("Missing token");

    const decoded = await auth.verifyIdToken(token);
    res.json({ uid: decoded.uid, email: decoded.email });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});
router.post("/saveUser", async (req, res) => {
  try {
    console.log("🟢 SaveUser route hit");
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("Missing token");

    const decoded = await auth.verifyIdToken(token);
    console.log("✅ Token verified for UID:", decoded.uid);

    const { uid, email, name, photo } = req.body;
    console.log("📩 Data received:", { uid, email, name });

    const userRef = db.collection("users").doc(uid);
    await userRef.set(
      {
        uid,
        email,
        name,
        photo,
        lastLogin: new Date(),
      },
      { merge: true }
    );

    res.json({ message: "User saved to Firestore ✅" });
  } catch (err) {
    console.error("❌ Error saving user:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
