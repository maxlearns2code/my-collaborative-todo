import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Select the service account key file path based on environment
let serviceAccountPath: string;

// Use environment detection: Cloud Run or Render, vs local
if (process.env.RENDER || process.env.NODE_ENV === "production") {
  // On Render or Cloud Run/other cloud production, use mounted secret path
  serviceAccountPath = "/usr/src/app/firebase-key.json";
} else {
  // Local development: use backend/firebase-key.json (relative to this file in backend/src/routes/)
  serviceAccountPath = path.resolve(__dirname, "../firebase-key.json");
}

let serviceAccount: ServiceAccount;

try {
  // Read and parse the service account key JSON
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} catch (e) {
  console.error("ERROR: Could not load Firebase service account key file from", serviceAccountPath);
  throw e;
}

// Only initialize if not already initialized (required for hot reloads)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // Add databaseURL: "..." here if using Realtime DB, optional for Firestore
  });
}

// Export Firestore and Auth handles for use elsewhere in your app
export const db = admin.firestore();
export const auth: admin.auth.Auth = admin.auth();
