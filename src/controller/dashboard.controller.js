import Team from "../models/Team.model.js";
import Project from "../models/Project.model.js";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments({ adminId: req.user.id });
    const projects = await Project.find({ adminId: req.user.id }).lean();
    const totalProjects = projects.length;
    const totalTasks = await Task.countDocuments({ projectId: { $in: projects.map(p => p._id) } });

    res.json({
      totalTeams,
      totalProjects,
      totalTasks,
    });
  } catch (e) {
    console.error("Error fetching admin dashboard", e);
    res.status(500).json({ error: "Failed to fetch admin dashboard" });
  }
};

export const getManagerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const teamId = req.teamContext.teamId;

    // Get team info
    const team = await Team.findById(teamId).select("name").lean();
    
    // Get projects for the team
    const projects = await Project.find({ teamId }).select("_id name").lean();
    
    // Get all tasks for the team
    const tasks = await Task.find({ projectId: { $in: projects.map(p => p._id) } }).lean();
    
    // Get team members
    const members = await User.find({ teamId }).select("_id name email role").lean();
    
    const assignedTasks = await Task.find({ assignedTo: userId }).lean();
    const completedByManager = assignedTasks.filter((t) => t.status === "done").length;

    res.json({
      totalManagedProjects: projects.length,
      totalAssignedTasks: assignedTasks.length,
      completedTasks: completedByManager,
      projects: projects.map((p) => ({ id: p._id, name: p.name })),
      team: {
        name: team?.name,
        members,
        projects,
        tasks,
      }
    });
  } catch (e) {
    console.error("Error fetching manager dashboard", e);
    res.status(500).json({ error: "Failed to fetch manager dashboard" });
  }
};

export const getMemberDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all tasks assigned to the user
    const assignedTasks = await Task.find({ assignedTo: userId }).lean();
    const completedTasks = assignedTasks.filter((t) => t.status === "done");
    const pendingTasks = assignedTasks.filter((t) => t.status === "todo");
    const inProgressTasks = assignedTasks.filter((t) => t.status === "in-progress");
    
    // Get all projects that have tasks assigned to the user
    const projectIds = [...new Set(assignedTasks.map(t => t.projectId))];
    const assignedProjects = await Project.find({ _id: { $in: projectIds } }).lean();
    
    const completionRate =
      assignedTasks.length > 0
        ? parseFloat(((completedTasks.length / assignedTasks.length) * 100).toFixed(2))
        : 0;

    res.json({
      totalTasks: assignedTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate,
      assignedProjects,
      assignedTasks,
    });
  } catch (e) {
    console.error("Error fetching member dashboard", e);
    res.status(500).json({ error: "Failed to fetch member dashboard" });
  }
};
