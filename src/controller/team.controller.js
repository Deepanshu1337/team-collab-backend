import Team from "../models/Team.model.js";
import User from "../models/User.model.js";
import Project from "../models/Project.model.js";
import { ROLES } from "../utils/constants.js";
import cache from "../utils/cache.js";
import mongoose from "mongoose";

export const getTeams = async (req, res) => {
  if (!req.user.teamId) {
    return res.json({ total: 0, teams: [] });
  }

  const team = await Team.findById(req.user.teamId)
    .select("name description adminId createdAt")
    .lean();

  if (!team) {
    return res.json({ total: 0, teams: [] });
  }

  const teams = [{ ...team, role: req.user.role }];
  res.json({ total: 1, teams });
};
export const getProjects = async (req, res) => {
  const teamId = req.teamContext.teamId;
  
  const cacheKey = `projects_${teamId}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return res.json(cachedResult);
  }
  
  const projects = await Project.find({
    teamId: req.teamContext.teamId,
  }).lean();
  
  // Cache for 5 minutes
  cache.set(cacheKey, projects, 300);
  
  res.json(projects);
};
export const getTeamById = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    
    const cacheKey = `team_${teamId}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    const team = await Team.findById(teamId)
      .select("name description adminId createdAt")
      .lean();

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const memberCount = await User.countDocuments({ teamId: team._id });
    
    const result = {
      ...team,
      memberCount
    };
    
    // Cache for 5 minutes
    cache.set(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ message: "Error fetching team" });
  }
};

export const getTeamsByAdmin = async (req, res) => {
  try {
    const cacheKey = `teams_admin_${req.user.id}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }
    
    const adminId = new mongoose.Types.ObjectId(req.user.id);

    const teams = await Team.find({ adminId })
      .select("name description createdAt")
      .lean();

    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const memberCount = await User.countDocuments({
          teamId: team._id
        });

        return {
          ...team,
          memberCount
        };
      })
    );
    
    const result = {
      total: teamsWithMemberCount.length,
      teams: teamsWithMemberCount
    };
    
    // Cache for 5 minutes
    cache.set(cacheKey, result, 300);

    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({
      message: "Failed to fetch teams"
    });
  }
};

export const createTeam = async (req, res) => {
  const { name, title, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Team name required" });
  }

  await User.findByIdAndUpdate(
    req.user.id,
    { teamId: null, role: null },
    { new: true }
  );

  const team = await Team.create({
    name: name.trim(),
    title,
    description,
    adminId: req.user.id,
  });

  await User.findByIdAndUpdate(
    req.user.id,
    { teamId: null, role: ROLES.ADMIN },
    { new: true }
  );
  
  // Clear related caches
  const cacheKey = `teams_admin_${req.user.id}`;
  cache.delete(cacheKey);

  res.status(201).json(team);
};

export const updateTeam = async (req, res) => {
  const { name, title, description } = req.body;

  const team = await Team.findByIdAndUpdate(
    req.teamContext.teamId,
    { name, title, description },
    { new: true }
  );
  
  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }
  
  // Clear related caches
  const teamCacheKey = `team_${req.teamContext.teamId}`;
  const adminCacheKey = `teams_admin_${team.adminId}`; // Use the team's adminId
  
  cache.delete(teamCacheKey);
  cache.delete(adminCacheKey);
  
  res.json({ message: "Team updated", team });
};

export const deleteTeam = async (req, res) => {
  const teamId = req.teamContext.teamId;

  // Get the team to find adminId before deletion
  const team = await Team.findById(teamId);
  
  await Team.findByIdAndDelete(teamId);
  await User.updateMany({ teamId }, { $set: { teamId: null } });
  
  // Clear related caches
  const teamCacheKey = `team_${teamId}`;
  const adminCacheKey = `teams_admin_${team.adminId}`;
  
  cache.delete(teamCacheKey);
  cache.delete(adminCacheKey);

  res.json({ message: "Team deleted" });
};
