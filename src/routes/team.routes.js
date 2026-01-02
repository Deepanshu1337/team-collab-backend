import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createTeam,
  inviteTeamMember,
  getTeamMembers,
  changeTeamMemberRole,
} from "../controller/team.controller.js";

const router = express.Router();


// Create team (authenticated users only)
router.post("/", authMiddleware, createTeam);

// Invite team member (admin only)
router.post("/invite", authMiddleware, inviteTeamMember);

// Change team member role (admin only)
router.patch("/:teamId/members/:memberId/assign-manager", authMiddleware, changeTeamMemberRole);

// Get all team members
router.get("/:teamId/members", authMiddleware, getTeamMembers);

export default router;
