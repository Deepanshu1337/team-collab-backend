import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import env from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to service account key
const serviceAccountPath = path.join(__dirname, String(env.firebaseServiceAccountPath));

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export default admin;
