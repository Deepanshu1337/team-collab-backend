import express from "express";
import  authMiddleware  from "../middleware/auth.middleware.js";
import {
  getProjects,
  getProjectById,
  createProject,
  assignProjectManager,
  deleteProject,
} from "../controller/project.controller.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET projects: if admin, get all; else get only user's projects
router.get("/", getProjects);

// GET specific project by ID
router.get("/:id", getProjectById);

// CREATE project (admin or manager)
router.post("/", createProject);

// ASSIGN manager to project (admin only)
router.patch("/:projectId/manager", assignProjectManager);


// DELETE project (admin only)
router.delete("/:id", deleteProject);

export default router;