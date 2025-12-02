import type { Request, Response, NextFunction } from "express";
import { auth } from "../firebase.js";
import { db } from "../firebase.js";

export interface AuthRequest extends Request {
  userId: string;           // now required
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
  if (!token) {
    return res.status(401).json({ error: "Token not found" });
  }

  try {
    const decoded = await auth.verifyIdToken(token);

    if (!decoded.uid) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.userId = decoded.uid;

    if (typeof decoded.email === "string") {
      req.userEmail = decoded.email;
    }

    const name = typeof decoded.name === "string" ? decoded.name : "";
    const avatarUrl =
      typeof decoded.picture === "string" ? decoded.picture : "";

    await ensureFirestoreUser(req.userId, req.userEmail ?? "", name, avatarUrl);

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export async function ensureFirestoreUser(
  uid: string,
  email: string,
  name: string,
  avatarUrl: string
) {
  if (!uid) {
    throw new Error("ensureFirestoreUser called without uid");
  }

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
