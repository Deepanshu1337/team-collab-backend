import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import teamContext from "../middleware/teamContext.middleware.js";
import requireTeamRole from "../middleware/requireTeamRole.middleware.js";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
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

export default router;
