import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import teamMiddleware from "../middleware/team.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { ROLES } from "../utils/constants.js";

import { getTasksByProject, createTask, updateTask, deleteTask, moveTask } from "../controller/task.controller.js";

const router = express.Router();

// Get tasks for a project (any team member)
router.get("/", authMiddleware, teamMiddleware, getTasksByProject);

// Create task (ADMIN / MANAGER)
router.post("/", authMiddleware, teamMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.MANAGER]), createTask);

// Update task (status, assignment, details)
router.put("/:id", authMiddleware, teamMiddleware, updateTask);

// Delete task (ADMIN only)
router.delete("/:id", authMiddleware, teamMiddleware, deleteTask);

// Move task (Kanban drag & drop)
router.put("/:id/move", authMiddleware, teamMiddleware, moveTask);

export default router;
