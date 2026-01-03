import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamContext from "../middleware/teamContext.middleware.js";

import {
  getMessages,
  sendMessage,
} from "../controller/message.controller.js";

const router = express.Router();

router.get(
  "/:teamId",
  authMiddleware,
  teamContext,
  getMessages
);

router.post(
  "/:teamId",
  authMiddleware,
  teamContext,
  sendMessage
);

export default router;
