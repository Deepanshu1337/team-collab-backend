import { Message } from "../models/index.js";
import { getIO } from "../socket/index.js";

// GET /api/messages
export const getMessages = async (req, res) => {
  const messages = await Message.find({
    teamId: req.user.teamId,
  })
    .populate("senderId", "name email")
    .sort({ createdAt: 1 });

  res.status(200).json(messages);
};

// POST /api/messages
export const sendMessage = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Message content is required" });
  }

  const message = await Message.create({
    content,
    senderId: req.user.id,
    teamId: req.user.teamId,
  });

  // 🔴 Emit AFTER DB success
  const io = getIO();
  io.to(`team:${req.user.teamId}`).emit("chat:new-message", {
    message,
  });

  res.status(201).json({
    message: "Message sent",
    data: message,
  });
};
