import type { Request, Response, NextFunction } from "express";
import { auth } from "../firebase.js";
import { db } from "../firebase.js";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];
  if (typeof token !== "string" || !token) {
    return res.status(401).json({ error: "Token not found" });
  }

  try {
    const decoded = await auth.verifyIdToken(token as string);
    req.userId = decoded.uid ?? "";
    req.userEmail = decoded.email ?? "";

    // Pull name and avatar from Firebase Auth JWT, if present
    const name = decoded.name ?? "";
    const avatarUrl = decoded.picture ?? "";

    // Ensure Firestore profile exists for this user (with info)
    await ensureFirestoreUser(req.userId, req.userEmail, name, avatarUrl);

    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export async function ensureFirestoreUser(
  uid: string,
  email: string,
  name: string,
  avatarUrl: string
) {
  const ref = db.collection("users").doc(uid);
  const doc = await ref.get();
  if (!doc.exists) {
    await ref.set({
      uid,
      email,
      name,
      avatarUrl,
    });
  }
}
