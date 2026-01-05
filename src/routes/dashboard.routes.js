import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamContext from "../middleware/teamContext.middleware.js";
import requireTeamRole from "../middleware/requireTeamRole.middleware.js";
import { getAdminDashboard, getManagerDashboard, getMemberDashboard } from "../controller/dashboard.controller.js";

const router = express.Router();
router.get(
  "/admin",
  authMiddleware,
  getAdminDashboard
);

router.get("/:teamId/manager", authMiddleware, teamContext, requireTeamRole(["MANAGER"]), getManagerDashboard);

router.get("/:teamId/member", authMiddleware, teamContext, getMemberDashboard);

export default router;
