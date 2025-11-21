import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.resolve(process.cwd(), "firebase-key.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8")) as ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
export const auth: admin.auth.Auth = admin.auth();
