import { Router } from "express";
import type { Response, RequestHandler } from "express";
import { db } from "../firebase.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get all user profiles—for assignment UI (no emails)
const getUsers: RequestHandler = async (req, res: Response): Promise<void> => {
  // Ensure this route is behind verifyFirebaseToken middleware
  const _authReq = req as AuthRequest;

  try {
    const snap = await db.collection("users").get();
    const users = snap.docs.map(d => {
      const data = d.data() as any;
      return {
        uid: d.id,
        name: data.name ?? "",
        avatarUrl: data.avatarUrl ?? "",
      };
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

router.get("/", getUsers);

export default router;
