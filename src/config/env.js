import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();
// -------------------- Required Environment Variables --------------------
const requiredEnvVars = ["PORT", "MONGO_URI"];

// -------------------- Validation --------------------
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    logger.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// -------------------- Export Typed Config --------------------
const env = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "../credentials/firebase-service-account.json",
  rateLimitWindowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15,
  rateLimitMaxReq: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  geminiKey: process.env.GEMINI_API_KEY,
};

export default env;
