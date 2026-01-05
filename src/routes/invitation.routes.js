import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  acceptTeamInvitation,
  rejectTeamInvitation,
  getPendingInvitationsForUser,
} from "../controller/teamMember.controller.js";

const router = express.Router();

/**
 * Invitation Management
 */
router.get("/pending", authMiddleware, getPendingInvitationsForUser);
router.post("/accept", authMiddleware, acceptTeamInvitation);
router.post("/reject", authMiddleware, rejectTeamInvitation);

export default router;