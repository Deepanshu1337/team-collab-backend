import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamContext from "../middleware/teamContext.middleware.js";
import requireTeamRole from "../middleware/requireTeamRole.middleware.js";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamsByAdmin,
  getProjects,
  getTeamById,
} from "../controller/team.controller.js";

import {
  inviteToTeam,
  
  getTeamMembers,
  assignManager,
  getPendingInvitations,
  getAvailableUsers,
  getPendingInvitationsForUser,
  removeMemberFromTeam,
} from "../controller/teamMember.controller.js";
const router = express.Router();

/**
 * Teams
 */
router.get("/", authMiddleware, getTeamsByAdmin);
router.get("/:teamId", authMiddleware, getTeamById);
router.post("/", authMiddleware, createTeam);
router.get(
  "/project/:teamId",
  authMiddleware,
  teamContext,
  getProjects
);

router.put(
  "/:teamId",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN", "MANAGER"]),
  updateTeam
);

router.delete(
  "/:teamId",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  deleteTeam
);

/**
 * Team Members & Roles
 */
router.get(
  "/:teamId/members",
  authMiddleware,
  teamContext,
  getTeamMembers
);

router.get(
  "/:teamId/pending-invitations",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  getPendingInvitations
);

router.post(
  "/:teamId/invite",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  inviteToTeam
);

router.get(
  "/:teamId/available-users",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  getAvailableUsers
);

// Route to get pending invitations for the current user
router.get(
  "/pending-invitations-for-user",
  authMiddleware,
  getPendingInvitationsForUser
);

router.patch(
  "/:teamId/members/:memberId/assign-manager",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  assignManager
);

export default router;
