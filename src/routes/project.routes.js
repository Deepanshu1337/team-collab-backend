import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamContext from "../middleware/teamContext.middleware.js";
import requireTeamRole from "../middleware/requireTeamRole.middleware.js";

import {
  getProjects,
  createProject,
  deleteProject,
} from "../controller/project.controller.js";

const router = express.Router();

router.get(
  "/:teamId",
  authMiddleware,
  teamContext,
  getProjects
);

router.post(
  "/:teamId",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN", "MANAGER"]),
  createProject
);

router.delete(
  "/:teamId/:projectId",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  deleteProject
);

export default router;
