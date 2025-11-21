import type { Request, Response, NextFunction } from "express";
import { auth } from "../firebase.js";

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
  // Only proceed if authHeader exists and starts with Bearer
  if (typeof authHeader !== 'string' || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];
  if (typeof token !== 'string' || !token) {
    return res.status(401).json({ error: "Token not found" });
  }

  try {
    const decoded = await auth.verifyIdToken(token as string);
    req.userId = decoded.uid ?? "";
    req.userEmail = decoded.email ?? "";
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
