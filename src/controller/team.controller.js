import { Team, User } from "../models/index.js";
import { ROLES } from "../utils/constants.js";

export const createTeam = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Team name is required",
    });
  }

  // Prevent user from creating multiple teams (for now)
  if (req.user.teamId) {
    return res.status(400).json({
      message: "User already belongs to a team",
    });
  }

  // 1. Create team
  const team = await Team.create({
    name,
    description,
    adminId: req.user.id,
  });

  // 2. Update user → assign team & ADMIN role
  await User.findByIdAndUpdate(req.user.id, {
    teamId: team._id,
    role: ROLES.ADMIN,
  });

  return res.status(201).json({
    message: "Team created successfully",
    team,
  });
};
