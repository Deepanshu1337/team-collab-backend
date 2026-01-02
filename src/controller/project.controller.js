import { Project } from "../models/index.js";
import mongoose from "mongoose";

// GET /api/projects → get all projects for current team
export const getProjects = async (req, res) => {
  const projects = await Project.find({
    teamId: req.user.teamId,
  }).sort({ createdAt: -1 });

  res.status(200).json(projects);
};

// POST /api/projects → create project (ADMIN / MANAGER)
export const createProject = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Project name is required",
    });
  }

  const project = await Project.create({
    name,
    description,
    teamId: req.user.teamId,
  });

  res.status(201).json({
    message: "Project created successfully",
    project,
  });
};
// PUT /api/projects/:id → update project (ADMIN / MANAGER)
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const project = await Project.findOne({
    _id: id,
    teamId: req.user.teamId, // team ownership check
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;

  await project.save();

  return res.status(200).json({
    message: "Project updated successfully",
    project,
  });
};

// DELETE /api/projects/:id → delete project (ADMIN only)
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const project = await Project.findOne({
    _id: id,
    teamId: req.user.teamId, // team ownership check
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  await project.deleteOne();

  return res.status(200).json({
    message: "Project deleted successfully",
  });
};