import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/index.js";

// ---------- Load Environment ----------
dotenv.config();

const PORT = process.env.PORT || 5000;

// ---------- Create HTTP Server ----------
const server = http.createServer(app);

// ---------- Bootstrap ----------
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Initialize Socket.IO and attach to the HTTP server
    try {
      initSocket(server);
      console.log("🔌 Socket.IO initialized");
    } catch (err) {
      console.error("❌ Failed to initialize Socket.IO:", err.message);
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
