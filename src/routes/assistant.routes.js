import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamMiddleware from "../middleware/team.middleware.js";
import { handleAssistantCommand } from "../assistant/assistant.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  teamMiddleware,
  handleAssistantCommand
);

export default router;
