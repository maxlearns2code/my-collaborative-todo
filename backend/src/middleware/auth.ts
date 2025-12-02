import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { auth } from "../firebase.js";
import { db } from "../firebase.js";

export interface AuthRequest extends Request {
  userId: string;
  userEmail?: string;
}

export const verifyFirebaseToken: RequestHandler = async (
  req,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;

  const authHeader = authReq.headers.authorization;
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token not found" });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token); // Firebase Admin ID token verification [web:18]

    if (!decoded.uid) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }

    authReq.userId = decoded.uid;

    if (typeof decoded.email === "string") {
      authReq.userEmail = decoded.email;
    }

    const name = typeof decoded.name === "string" ? decoded.name : "";
    const avatarUrl =
      typeof decoded.picture === "string" ? decoded.picture : "";

    await ensureFirestoreUser(
      authReq.userId,
      authReq.userEmail ?? "",
      name,
      avatarUrl
    );
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export async function ensureFirestoreUser(
  uid: string,
  email: string,
  name: string,
  avatarUrl: string
): Promise<void> {
  if (!uid) {
    throw new Error("ensureFirestoreUser called without uid");
  }

  const ref = db.collection("users").doc(uid);
  const doc = await ref.get(); // Firestore document existence check [web:84]

  if (!doc.exists) {
    await ref.set({
      uid,
      email,
      name,
      avatarUrl,
    });
  }
}
