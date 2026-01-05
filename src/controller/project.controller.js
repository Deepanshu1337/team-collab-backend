import Project from "../models/Project.model.js";
import Team from "../models/Team.model.js";
import User from "../models/User.model.js";
import cache from "../utils/cache.js";


/**
 * GET all projects for admin with team info
 */
export const getAllProjectsForAdmin = async (req, res) => {
  try {
    const cacheKey = `all_projects_admin_${req.user.id}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    // Find all projects where the user is the admin (using adminId field)
    const projects = await Project.find({
      adminId: req.user.id
    }).populate('teamId', 'name description adminId').lean();
    
    // For each project, get the manager information
    const formattedProjects = [];
    for (const project of projects) {
      // Find the manager for the team
      const manager = await User.findOne({
        teamId: project.teamId._id,
        role: 'MANAGER'
      }).select('name email').lean();
      
      formattedProjects.push({
        _id: project._id,
        name: project.name,
        description: project.description,
        teamId: project.teamId._id,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        teamName: project.teamId.name,
        teamDescription: project.teamId.description,
        manager: manager ? {
          name: manager.name,
          email: manager.email
        } : null
      });
    }
    
    // Cache for 5 minutes
    cache.set(cacheKey, formattedProjects, 300);
    
    res.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching all projects for admin:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

/**
 * GET projects for manager and member (assigned to user's team)
 */
export const getProjectsForTeam = async (req, res) => {
  try {
    const teamId = req.user.teamId;
    
    if (!teamId) {
      return res.json([]);
    }
    
    const cacheKey = `projects_team_${teamId}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    const projects = await Project.find({
      teamId: teamId,
    }).lean();
    
    // Cache for 5 minutes
    cache.set(cacheKey, projects, 300);
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects for team:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

/**
 * CREATE project (ADMIN or MANAGER)
 */
export const createProject = async (req, res) => {
  const { name, description } = req.body;
  const teamId = req.teamContext.teamId;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Project name is required" });
  }
  
  // Find the team to get the adminId
  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }
  
  const project = await Project.create({
    name: name.trim(),
    description,
    teamId: req.teamContext.teamId,
    createdBy: req.user.id,
    adminId: team.adminId, // Set the adminId to the team's admin
  });
  
  // Clear related caches
  const cacheKey = `projects_${teamId}`;
  cache.delete(cacheKey);

  res.status(201).json(project);
};

/**
 * GET project by ID
 */
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1️⃣ Get project
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }



    // 3️⃣ Get team info
    const team = await Team.findById(project.teamId)
      .select("name description adminId createdAt")
      .lean();

    // 4️⃣ Get all team members
    const members = await User.find({ teamId: project.teamId })
      .select("name email role createdAt")
      .lean();

    // 5️⃣ Find manager
    const manager = members.find((m) => m.role === "MANAGER") || null;

    // 6️⃣ Send combined response
    res.status(200).json({
      project,
      team,
      manager,
      members,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      message: "Failed to fetch project",
    });
  }
};


/**
 * MIGRATION: Populate adminId for existing projects
 */
export const populateAdminIdForExistingProjects = async (req, res) => {
  try {
    // Find all projects that don't have adminId set
    const projectsWithoutAdminId = await Project.find({ adminId: { $exists: false } });
    
    for (const project of projectsWithoutAdminId) {
      // Find the team associated with the project to get the adminId
      const team = await Team.findById(project.teamId);
      if (team) {
        // Update the project with the team's adminId
        await Project.updateOne(
          { _id: project._id },
          { $set: { adminId: team.adminId } }
        );
      }
    }
    
    res.json({ message: `Updated ${projectsWithoutAdminId.length} projects with adminId` });
  } catch (error) {
    console.error('Error populating adminId for existing projects:', error);
    res.status(500).json({ message: 'Failed to populate adminId for existing projects' });
  }
};

/**
 * DELETE project (ADMIN)
 */
export const deleteProject = async (req, res) => {
  const teamId = req.teamContext.teamId;
  
  await Project.findByIdAndDelete(req.params.projectId);
  
  // Clear related caches
  const cacheKey = `projects_${teamId}`;
  cache.delete(cacheKey);
  
  res.json({ message: "Project deleted" });
};

/**
 * UPDATE project (ADMIN or MANAGER)
 */
export const updateProject = async (req, res) => {
  const teamId = req.teamContext.teamId;
  const projectId = req.params.projectId;
  const { name, description } = req.body;
  
  if (name && !name.trim()) {
    return res.status(400).json({ message: "Project name cannot be empty" });
  }
  
  const project = await Project.findOneAndUpdate(
    { _id: projectId, teamId },
    { ...(name && { name: name.trim() }), ...(description && { description }) },
    { new: true }
  );
  
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  // Clear related caches
  const cacheKey = `projects_${teamId}`;
  cache.delete(cacheKey);
  
  res.json(project);
};

/**
 * GET projects assigned to member (projects with tasks assigned to the member)
 */
export const getMemberProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all tasks assigned to the user
    const Task = (await import('../models/Task.model.js')).default;
    const tasks = await Task.find({ assignedTo: userId }).lean();
    
    // Extract unique project IDs from assigned tasks
    const projectIds = [...new Set(tasks.map(task => task.projectId))];
    
    if (projectIds.length === 0) {
      return res.json([]);
    }
    
    // Find projects associated with those task IDs
    const projects = await Project.find({ _id: { $in: projectIds } })
      .populate('teamId', 'name')
      .lean();
    
    // Format the projects with team information
    const formattedProjects = projects.map(project => ({
      _id: project._id,
      name: project.name,
      description: project.description,
      teamId: project.teamId._id,
      teamName: project.teamId.name,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
    
    res.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching member projects:', error);
    res.status(500).json({ message: 'Failed to fetch member projects' });
  }
};
