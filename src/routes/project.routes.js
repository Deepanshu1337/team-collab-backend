import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import teamMiddleware from "../middleware/team.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { ROLES } from "../utils/constants.js";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controller/project.controller.js";


const router = express.Router();

// Get all projects (any team member)
router.get(
  "/",
  authMiddleware,
  teamMiddleware,
  getProjects
);

// Create project (ADMIN / MANAGER only)
router.post(
  "/",
  authMiddleware,
  teamMiddleware,
  roleMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
  createProject
);
// Update project (ADMIN / MANAGER)
router.put(
  "/:id",
  authMiddleware,
  teamMiddleware,
  roleMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
  updateProject
);

// Delete project (ADMIN only)
router.delete(
  "/:id",
  authMiddleware,
  teamMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  deleteProject
);

export default router;
