import { Router } from "express";
import { db } from "../firebase.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get all user profiles—for assignment UI
router.get("/", async (req: AuthRequest, res) => {
  try {
    const snap = await db.collection("users").get();
    const users = snap.docs.map(d => ({
      uid: d.id,
      ...(d.data() as any),
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

export default router;
