import logger from "./config/logger.js";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import { initSocket } from "./socket/index.js";

// -------------------- Create HTTP Server --------------------
const server = http.createServer(app);

// -------------------- Bootstrap --------------------
const startServer = async () => {
  try {
    await connectDB();

    server.listen(env.port, () => {
      logger.info(`🚀 Server running on port ${env.port}`);
      logger.info(`🌱 Environment: ${env.nodeEnv}`);

      initSocket(server);
    });
  } catch (error) {
    logger.error(error, "❌ Server startup failed");

    process.exit(1);
  }
};
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
