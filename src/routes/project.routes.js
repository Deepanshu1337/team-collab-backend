import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamContext from "../middleware/teamContext.middleware.js";
import requireTeamRole from "../middleware/requireTeamRole.middleware.js";

import {
  createProject,
  updateProject,
  deleteProject,
  getAllProjectsForAdmin,
  getProjectsForTeam,
  getProjectById,
  populateAdminIdForExistingProjects,
  getMemberProjects,
} from "../controller/project.controller.js";

const router = express.Router();

// Admin route to get all projects with team info
router.get(
  "/admin/all",
  authMiddleware,
  getAllProjectsForAdmin
);

// Migration route to populate adminId for existing projects
router.post(
  "/admin/populate-admin-id",
  authMiddleware,
  (req, res, next) => {
    // Only allow admin users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: admin access required' });
    }
    next();
  },
  populateAdminIdForExistingProjects
);

// Route for manager/member to get projects for their team
router.get(
  "/team",
  authMiddleware,
  getProjectsForTeam
);

// Route to get projects assigned to member
router.get(
  "/member",
  authMiddleware,
  getMemberProjects
);

// Route to get a project by ID
router.get(
  "/:projectId",
  authMiddleware,
  getProjectById
);

router.post(
  "/:teamId",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN", "MANAGER"]),
  createProject
);

router.put(
  "/:teamId/:projectId",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN", "MANAGER"]),
  updateProject
);

router.delete(
  "/:teamId/:projectId",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  deleteProject
);

export default router;
