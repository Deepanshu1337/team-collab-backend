import Task from "../models/Task.model.js";
import Project from "../models/Project.model.js";
import { ROLES } from "../utils/constants.js";

/**
 * GET tasks by project
 */
export const getTasks = async (req, res) => {
  const project = await Project.findOne({
    _id: req.query.projectId,
    teamId: req.teamContext.teamId,
  });

  if (!project) return res.status(404).json({ message: "Project not found" });

  const tasks = await Task.find({ projectId: project._id }).lean();
  res.json(tasks);
};

/**
 * CREATE task (ADMIN / MANAGER)
 */
export const createTask = async (req, res) => {
  const task = await Task.create({
    ...req.body,
    projectId: req.body.projectId,
  });

  res.status(201).json(task);
};

/**
 * UPDATE task
 * MEMBER: only own assigned task (status)
 * ADMIN / MANAGER: full access
 */
export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (
    req.teamContext.role === ROLES.MEMBER &&
    String(task.assignedTo) !== req.user.id
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  Object.assign(task, req.body);
  await task.save();

  res.json(task);
};

/**
 * DELETE task (ADMIN)
 */
export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.taskId);
  res.json({ message: "Task deleted" });
};
