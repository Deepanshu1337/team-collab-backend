import { processAssistantCommand } from "./assistant.service.js";

export const handleAssistantCommand = async (req, res, next) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ message: "Command is required" });
    }

    const result = await processAssistantCommand({
      command,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};
