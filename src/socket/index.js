// src/socket/index.js

import { Server } from "socket.io";
import admin from "../config/firebase.js";
import { User } from "../models/index.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // later restrict in production
    },
  });

  // 🔐 Authenticate every socket connection
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = await admin.auth().verifyIdToken(token);

      const user = await User.findOne({
        firebaseUid: decoded.uid,
      });

      if (!user || !user.teamId) {
        return next(new Error("User not authorized for realtime"));
      }

      // Attach trusted context to socket
      socket.user = {
        id: user._id.toString(),
        teamId: user.teamId.toString(),
        role: user.role,
      };

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // 🔌 Connection lifecycle
  io.on("connection", (socket) => {
    const { id, teamId } = socket.user;

    // Join team-scoped room
    socket.join(`team:${teamId}`);

    console.log(`🔌 Socket connected | user=${id}`);

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected | user=${id}`);
    });
  });

  return io;
};

// Used later by REST controllers
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
