import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamMiddleware from "../middleware/team.middleware.js";
import {
  getMessages,
  sendMessage,
} from "../controller/message.controller.js";

const router = express.Router();

router.get("/", authMiddleware, teamMiddleware, getMessages);
router.post("/", authMiddleware, teamMiddleware, sendMessage);

export default router;
