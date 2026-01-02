import Project from "../models/Project.model.js";
import User from "../models/User.model.js";

// GET projects: admin sees all, users see only theirs
export const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.globalRole === "ADMIN";

    let query = { isArchived: false };

    if (!isAdmin) {
      // Non-admin users see only projects they're members of or manage
      query.$or = [
        { "members.user": userId },
        { manager: userId },
        { createdBy: userId },
      ];
    }

    const projects = await Project.find(query)
      .select("name description manager members createdBy teamIds isArchived")
      .populate("manager", "name email")
      .populate("members.user", "name email")
      .populate("createdBy", "name email")
      .lean();

    res.json(projects);
  } catch (e) {
    console.error("Error fetching projects", e);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// GET specific project by ID
export const getProjectById = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.globalRole === "ADMIN";
    const projectId = req.params.id;

    const project = await Project.findById(projectId)
      .populate("manager", "name email _id")
      .populate("members.user", "name email _id")
      .populate("createdBy", "name email")
      .populate("teamIds", "name");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check access: admin can see all, others can see only if they're members/manager
    if (!isAdmin) {
      const isMember =
        project.manager?._id.equals(userId) ||
        project.members.some((m) => m.user && m.user._id.equals(userId)) ||
        project.createdBy._id.equals(userId);

      if (!isMember) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    res.json(project);
  } catch (e) {
    console.error("Error fetching project", e);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// CREATE project (admin or manager in team)
export const createProject = async (req, res) => {
  try {
    const isAdmin = req.user.globalRole === "ADMIN";
    const canCreate = isAdmin; // Adjust if managers can also create

    if (!canCreate) {
      return res.status(403).json({ error: "Only admins can create projects" });
    }

    const { name, description, teamIds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const newProject = new Project({
      name: name.trim(),
      description: description || null,
      createdBy: req.user._id,
      manager: null,
      teamIds: teamIds || [],
      members: [],
      isArchived: false,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (e) {
    console.error("Error creating project", e);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// ASSIGN manager to project (admin only)
export const assignProjectManager = async (req, res) => {
  try {
    if (req.user.globalRole !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can assign managers" });
    }

    const { projectId } = req.params;
    const { managerId } = req.body; // User ID to assign as manager

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({ error: "User not found" });
    }

    project.manager = managerId;
    await project.save();

    res.json({
      message: "Project manager assigned successfully",
      project: await project.populate("manager", "name email"),
    });
  } catch (e) {
    console.error("Error assigning project manager", e);
    res.status(500).json({ error: "Failed to assign manager" });
  }
};

// DELETE project (admin only)
export const deleteProject = async (req, res) => {
  try {
    if (req.user.globalRole !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can delete projects" });
    }

    const projectId = req.params.id;

    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({
      message: "Project deleted successfully",
      project,
    });
  } catch (e) {
    console.error("Error deleting project", e);
    res.status(500).json({ error: "Failed to delete project" });
  }
};