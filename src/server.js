import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";

// -------------------- Create HTTP Server --------------------
const server = http.createServer(app);

// -------------------- Bootstrap --------------------
const startServer = async () => {
  try {
    await connectDB();

    server.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
      console.log(`🌱 Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
