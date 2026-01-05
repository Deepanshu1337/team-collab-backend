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

   
      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach trusted context to socket (teamId can be null for new users)
      socket.user = {
        id: user._id.toString(),
        teamId: user.teamId ? user.teamId.toString() : null,
        role: user.role,
      };

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // 🔌 Connection lifecycle
  io.on("connection", (socket) => {
    const { id, teamId, role } = socket.user;

    // Join user's default team room if they have one
    if (teamId) {
      socket.join(`team:${teamId}`);
      console.log(`🔌 Socket connected | user=${id} | team=${teamId}`);
    } else {
      console.log(`🔌 Socket connected | user=${id} | no team`);
    }

    // Handle joining a specific team room (for admins)
    socket.on("join-team-room", (payload) => {
      const { teamId: targetTeamId } = payload || {};
      
      // Admins can join any team room, others can only join their own team
      if (role === 'ADMIN' || targetTeamId === teamId) {
        socket.join(`team:${targetTeamId}`);
        console.log(`👤 User ${id} joined team room: team:${targetTeamId}`);
      }
    });
    
    // Handle leaving a specific team room
    socket.on("leave-team-room", (payload) => {
      const { teamId: targetTeamId } = payload || {};
      
      socket.leave(`team:${targetTeamId}`);
      console.log(`👤 User ${id} left team room: team:${targetTeamId}`);
    });

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
