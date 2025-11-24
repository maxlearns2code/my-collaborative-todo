import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.resolve(process.cwd(), "firebase-key.json");

console.log("process.cwd():", process.cwd());
console.log("firebase-key.json resolved path:", serviceAccountPath);
try {
  const files = fs.readdirSync(process.cwd());
  console.log("Files in working directory:", files);
} catch (err) {
  console.error("readdirSync error:", err);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8")) as ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
export const auth: admin.auth.Auth = admin.auth();
