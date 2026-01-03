import Message from "../models/Message.model.js";

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

  res.status(201).json(message);
};
