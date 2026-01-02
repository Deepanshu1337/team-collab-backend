import mongoose from "mongoose";
import { Task, Project, User } from "../models/index.js";
import { ROLES } from "../utils/constants.js";

// GET /api/tasks?projectId=xxx
export const getTasksByProject = async (req, res) => {
  const { projectId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  // Ensure project belongs to user's team
  const project = await Project.findOne({
    _id: projectId,
    teamId: req.user.teamId,
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const tasks = await Task.find({ projectId })
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(tasks);
};

// POST /api/tasks
export const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo } = req.body;

  if (!title || !projectId) {
    return res.status(400).json({
      message: "Title and projectId are required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  // Ensure project belongs to user's team
  const project = await Project.findOne({
    _id: projectId,
    teamId: req.user.teamId,
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // 🔹 Get last task in TODO column
  const lastTask = await Task.findOne({
    projectId,
    status: "todo",
  }).sort({ position: -1 });

  const newPosition = lastTask ? lastTask.position + 1000 : 1000;

  const task = await Task.create({
    title,
    description,
    projectId,
    status: "todo",
    position: newPosition,
    assignedTo: assignedTo || null,
  });

  res.status(201).json({
    message: "Task created successfully",
    task,
  });
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, title, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  // Find task
  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Ensure task belongs to user's team via project
  const project = await Project.findOne({
    _id: task.projectId,
    teamId: req.user.teamId,
  });

  if (!project) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const isAdminOrManager =
    req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER;

  // ---- STATUS UPDATE ----
  if (status) {
    const allowedStatus = ["todo", "in-progress", "done"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // MEMBER can update status only if task assigned to self
    if (!isAdminOrManager) {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Cannot update status of unassigned task" });
      }
    }

    task.status = status;
  }

  // ---- ASSIGNMENT ----
  if (assignedTo !== undefined) {
    if (!isAdminOrManager) {
      return res
        .status(403)
        .json({ message: "Only ADMIN or MANAGER can assign tasks" });
    }

    if (assignedTo !== null) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: "Invalid assignee id" });
      }

      // Ensure assignee exists and is in same team
      const assignee = await User.findOne({
        _id: assignedTo,
        teamId: req.user.teamId,
      });

      if (!assignee) {
        return res.status(400).json({
          message: "Assignee must belong to the same team",
        });
      }

      task.assignedTo = assignedTo;
    } else {
      task.assignedTo = null; // unassign
    }
  }

  // ---- TITLE / DESCRIPTION ----
  if (title !== undefined || description !== undefined) {
    if (!isAdminOrManager) {
      return res
        .status(403)
        .json({ message: "Only ADMIN or MANAGER can edit task details" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
  }

  await task.save();

  res.status(200).json({
    message: "Task updated successfully",
    task,
  });
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  // Only ADMIN can delete tasks
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      message: "Only ADMIN can delete tasks",
    });
  }

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Ensure task belongs to user's team via project
  const project = await Project.findOne({
    _id: task.projectId,
    teamId: req.user.teamId,
  });

  if (!project) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await task.deleteOne();

  res.status(200).json({
    message: "Task deleted successfully",
  });
};

// PUT /api/tasks/:id/move
export const moveTask = async (req, res) => {
  const { id } = req.params;
  const { status, prevPosition, nextPosition } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Ensure task belongs to user's team via project
  const project = await Project.findOne({
    _id: task.projectId,
    teamId: req.user.teamId,
  });

  if (!project) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Permission: MEMBER can move only own task
  const isAdminOrManager =
    req.user.role === "ADMIN" || req.user.role === "MANAGER";

  if (!isAdminOrManager) {
    if (!task.assignedTo || task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only move your assigned tasks",
      });
    }
  }

  // Calculate new position
  let newPosition;

  if (prevPosition !== null && nextPosition !== null) {
    newPosition = (prevPosition + nextPosition) / 2;
  } else if (prevPosition === null && nextPosition !== null) {
    newPosition = nextPosition - 1000;
  } else if (prevPosition !== null && nextPosition === null) {
    newPosition = prevPosition + 1000;
  } else {
    newPosition = 1000;
  }

  task.status = status;
  task.position = newPosition;

  await task.save();

  res.status(200).json({
    message: "Task moved successfully",
    task,
  });
};
