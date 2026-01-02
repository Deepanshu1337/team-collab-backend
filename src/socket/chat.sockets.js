// src/socket/chat.sockets.js

/**
 * Registers chat-related socket handlers.
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 */
export const registerChatHandlers = (io, socket) => {
  /**
   * Client emits:
   * socket.emit("chat:send", { content })
   */
  socket.on("chat:send", (payload) => {
    const { content } = payload || {};

    if (!content || typeof content !== "string") {
      return; // silently ignore invalid payloads
    }

    const message = {
      content,
      senderId: socket.user.id,
      teamId: socket.user.teamId,
      timestamp: new Date(),
    };

    // Broadcast to entire team
    io.to(`team:${socket.user.teamId}`).emit(
      "chat:new-message",
      message
    );
  });
};
