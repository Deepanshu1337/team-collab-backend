import Team from "../models/Team.model.js";
import Project from "../models/Project.model.js";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";

// ADMIN Dashboard: all teams, projects, members, tasks
export const getAdminDashboard = async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments({ isActive: true });
    const totalProjects = await Project.countDocuments({ isArchived: false });
    const totalMembers = await User.countDocuments({ globalRole: "USER" });
    const totalAdmins = await User.countDocuments({ globalRole: "ADMIN" });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "DONE" });

    const topTeams = await Team.find({ isActive: true })
      .select("name members projectIds")
      .limit(5)
      .lean();

    res.json({
      totalTeams,
      totalProjects,
      totalMembers,
      totalAdmins,
      totalTasks,
      completedTasks,
      taskCompletionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
      topTeams: topTeams.map((t) => ({
        id: t._id,
        name: t.name,
        memberCount: t.members.length,
        projectCount: t.projectIds.length,
      })),
    });
  } catch (e) {
    console.error("Error fetching admin dashboard", e);
    res.status(500).json({ error: "Failed to fetch admin dashboard" });
  }
};

// MANAGER Dashboard: teams and projects they manage, their tasks
export const getManagerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const teamsAsManager = await Team.find({
      "members.user": userId,
      "members.role": "MANAGER",
      isActive: true,
    })
      .select("name members projectIds")
      .lean();

    const projectsAsManager = await Project.find({
      manager: userId,
      isArchived: false,
    })
      .select("name teamIds members")
      .lean();

    const teamsAsUser = await Team.find({
      "members.user": userId,
      isActive: true,
    }).select("name");

    const totalAssignedTeams = teamsAsManager.length;
    const totalManagedProjects = projectsAsManager.length;

    // Tasks assigned to this manager
    const assignedTasks = await Task.find({ assignedTo: userId }).lean();
    const completedByManager = assignedTasks.filter(
      (t) => t.status === "DONE"
    ).length;

    // Get top team members
    const topMembers = await User.find({
      _id: { $in: teamsAsManager.flatMap((t) => t.members.map((m) => m.user)) },
    })
      .select("name email")
      .limit(3)
      .lean();

    res.json({
      totalAssignedTeams,
      totalManagedProjects,
      totalAssignedTasks: assignedTasks.length,
      completedTasks: completedByManager,
      teamsManaged: teamsAsManager.map((t) => ({
        id: t._id,
        name: t.name,
        memberCount: t.members.length,
      })),
      topMember: topMembers[0] || null,
    });
  } catch (e) {
    console.error("Error fetching manager dashboard", e);
    res.status(500).json({ error: "Failed to fetch manager dashboard" });
  }
};

// MEMBER Dashboard: teams they belong to, their assigned tasks
export const getMemberDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const teams = await Team.find({
      "members.user": userId,
      isActive: true,
    })
      .select("name")
      .lean();

    const assignedTasks = await Task.find({ assignedTo: userId }).lean();
    const completedTasks = assignedTasks.filter((t) => t.status === "DONE");
    const pendingTasks = assignedTasks.filter((t) => t.status === "PENDING");
    const inProgressTasks = assignedTasks.filter((t) => t.status === "IN_PROGRESS");

    const completionRate =
      assignedTasks.length > 0
        ? ((completedTasks.length / assignedTasks.length) * 100).toFixed(2)
        : 0;

    res.json({
      totalTeams: teams.length,
      totalTasks: assignedTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate,
      recentTeams: teams.slice(0, 3),
    });
  } catch (e) {
    console.error("Error fetching member dashboard", e);
    res.status(500).json({ error: "Failed to fetch member dashboard" });
  }
};
