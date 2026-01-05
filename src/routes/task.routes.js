import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamContext from "../middleware/teamContext.middleware.js";
import requireTeamRole from "../middleware/requireTeamRole.middleware.js";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTeamTasks,
  getAssignedTasks,
  getProjectsByIds,
} from "../controller/task.controller.js";

const router = express.Router();




router.get(
  "/:teamId/projects/:projectId/tasks",
  authMiddleware,
  teamContext,
  getTasks
);

router.post(
  "/:teamId/projects/:projectId/tasks",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN", "MANAGER"]),
  createTask
);

router.put(
  "/:teamId/tasks/:taskId",
  authMiddleware,
  teamContext,
  updateTask
);

router.delete(
  "/:teamId/tasks/:taskId",
  authMiddleware,
  teamContext,
  requireTeamRole(["ADMIN"]),
  deleteTask
);

// Route to get all tasks for a team
router.get(
  "/:teamId/tasks",
  authMiddleware,
  teamContext,
  getTeamTasks
);

// Route to get tasks assigned to the current user
router.get(
  "/assigned",
  authMiddleware,
  getAssignedTasks
);

// Route to get projects by IDs
router.get(
  "/projects/assigned",
  authMiddleware,
  getProjectsByIds
);

export default router;
