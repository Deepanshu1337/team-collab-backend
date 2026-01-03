import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamContext from "../middleware/teamContext.middleware.js";
import requireTeamRole from "../middleware/requireTeamRole.middleware.js";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../controller/team.controller.js";

import {
  inviteToTeam,
  getTeamMembers,
} from "../controller/teamMember.controller.js";

const router = express.Router();

/**
 * Teams
 */
router.get("/", authMiddleware, getTeams);
router.post("/", authMiddleware, createTeam);

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

router.post(
  "/:teamId/invite",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  inviteToTeam
);

export default router;
