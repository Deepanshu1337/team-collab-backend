import Project from "../models/Project.model.js";
import UserRoleTeam from "../models/UserRoleTeam.model.js";

/**
 * GET projects of a team
 */
export const getProjects = async (req, res) => {
  const projects = await Project.find({
    teamId: req.teamContext.teamId,
  }).lean();

  res.json(projects);
};

/**
 * CREATE project (ADMIN or MANAGER)
 */
export const createProject = async (req, res) => {
  const { name, description } = req.body;
  const teamId = await req.teamContext.teamId;

  const adminMapping = await UserRoleTeam.findOne({
    teamId: teamId, // ObjectId or string
    role: "ADMIN",
    status: "ACCEPTED",
  })
    .select("userId")
    .lean();

  const adminUserId = adminMapping?.userId || null;

  const project = await Project.create({
    name,
    description,
    teamId: req.teamContext.teamId,
    adminId: adminUserId,
  });

  res.status(201).json(project);
};

/**
 * DELETE project (ADMIN)
 */
export const deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.projectId);
  res.json({ message: "Project deleted" });
};
