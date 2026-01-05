import Message from "../models/Message.model.js";
import { getIO } from "../socket/index.js";

export const getMessages = async (req, res) => {
  const messages = await Message.find({
    teamId: req.teamContext.teamId,
  })
    .populate("senderId", "name email")
    .sort({ createdAt: 1 });

  res.json(messages);
};

export const sendMessage = async (req, res) => {
  const message = await Message.create({
    content: req.body.content,
    senderId: req.user.id,
    teamId: req.teamContext.teamId,
  });

  // Populate the message with sender information including role
  const populatedMessage = await Message.findById(message._id)
    .populate({
      path: 'senderId',
      select: 'name email role'
    })
    .lean();
  
  try {
    const io = getIO();
    io.to(`team:${req.teamContext.teamId}`).emit("chat:new-message", populatedMessage);
  } catch (e) {
    // ignore socket errors
  }

  res.status(201).json(message);
};
