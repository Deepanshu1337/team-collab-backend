import Task from "../models/Task.model.js";
import Project from "../models/Project.model.js";
import { ROLES } from "../utils/constants.js";

/**
 * GET tasks by project
 */
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      teamId: req.teamContext.teamId,
    }).lean();
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await Task.find({ projectId: project._id })
      .populate("assignedTo", "name email") // 👈 THIS IS THE KEY
      .lean();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};


/**
 * CREATE task (ADMIN / MANAGER)
 */
export const createTask = async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findOne({
    _id: projectId,
    teamId: req.teamContext.teamId,
  }).lean();
  if (!project) return res.status(404).json({ message: "Project not found" });

  // Only ADMIN or MANAGER can create tasks
  if (![ROLES.ADMIN, ROLES.MANAGER].includes(req.teamContext.role)) {
    return res.status(403).json({ message: "Only ADMIN and MANAGER can create tasks" });
  }

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description,
    projectId,
    assignedTo: req.body.assignedTo || null,
    createdBy: req.user.id,
  });

  // Populate the assignedTo field to return user details
  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .lean();

  res.status(201).json(populatedTask);
};

/**
 * UPDATE task
 * Only task creator can edit task details
 * ADMIN and MEMBER can assign tasks to users
 * Only status updates allowed for assigned users
 */
export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  // Check what fields are being updated
  const isAssigningTask = req.body.assignedTo !== undefined;
  const isUpdatingStatus = req.body.status !== undefined;
  
  if (isAssigningTask) {
    // Only ADMIN and MEMBER can assign tasks
    if (![ROLES.ADMIN, ROLES.MEMBER].includes(req.teamContext.role)) {
      return res.status(403).json({ message: "Only ADMIN and MEMBER can assign tasks" });
    }
  } else if (isUpdatingStatus && task.assignedTo && String(task.assignedTo) === req.user.id) {
    // Allow assigned user to update status
    // No additional checks needed
  } else {
    // Only task creator can edit other task details
    if (String(task.createdBy) !== req.user.id) {
      return res.status(403).json({ message: "Only task creator can edit task details" });
    }
  }

  Object.assign(task, req.body);
  await task.save();

  // Populate the assignedTo field to return user details
  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .lean();

  res.json(populatedTask);
};

/**
 * DELETE task (only task creator)
 */
export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  // Only task creator can delete the task
  if (String(task.createdBy) !== req.user.id) {
    return res.status(403).json({ message: "Only task creator can delete this task" });
  }
  
  await Task.findByIdAndDelete(req.params.taskId);
  res.json({ message: "Task deleted" });
};

/**
 * GET all tasks for a team
 */
export const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Verify the user has access to this team
    if (req.teamContext.teamId !== teamId) {
      return res.status(403).json({ message: "Forbidden: not authorized to access this team" });
    }
    
    // Get all projects for the team
    const projects = await Project.find({ teamId }).select("_id").lean();
    const projectIds = projects.map(p => p._id);
    
    // Get all tasks for these projects
    const tasks = await Task.find({ projectId: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();
    
    // Count tasks by status
    const todoCount = tasks.filter(task => task.status === 'todo').length;
    const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
    const doneCount = tasks.filter(task => task.status === 'done').length;
    
    res.status(200).json({
      tasks,
      counts: {
        todo: todoCount,
        'in-progress': inProgressCount,
        done: doneCount,
        total: tasks.length
      }
    });
  } catch (error) {
    console.error("Error fetching team tasks:", error);
    res.status(500).json({ message: "Failed to fetch team tasks" });
  }
};

/**
 * GET tasks assigned to the current user
 */
export const getAssignedTasks = async (req, res) => {
  try {
    const assignedTasks = await Task.find({ assignedTo: req.user.id })
      .populate('projectId', 'name teamId')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ assignedTasks });
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    res.status(500).json({ message: 'Failed to fetch assigned tasks' });
  }
};

/**
 * GET projects by IDs
 */
export const getProjectsByIds = async (req, res) => {
  try {
    const projectIds = req.query.projectIds?.split(',');
    
    if (!projectIds || projectIds.length === 0) {
      return res.status(200).json({ projects: [] });
    }
    
    // Validate that projectIds are valid ObjectIds
    const validProjectIds = projectIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    
    const projects = await Project.find({ _id: { $in: validProjectIds } })
      .populate('teamId', 'name')
      .lean();
    
    // Also get the team names for each project
    const projectsWithTeamNames = projects.map(project => ({
      ...project,
      teamName: project.teamId?.name || 'Unknown',
    }));

    res.status(200).json({ projects: projectsWithTeamNames });
  } catch (error) {
    console.error('Error fetching projects by IDs:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};
