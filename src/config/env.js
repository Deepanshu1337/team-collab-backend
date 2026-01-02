import dotenv from "dotenv";

dotenv.config();

// -------------------- Required Environment Variables --------------------
const requiredEnvVars = [
  "PORT",
  "MONGO_URI"
];

// -------------------- Validation --------------------
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// -------------------- Export Typed Config --------------------
const env = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development"
};

export default env;
