import Team from "../models/Team.model.js";
import UserRoleTeam from "../models/UserRoleTeam.model.js";
import { ROLES } from "../utils/constants.js";

/**
 * GET teams for logged-in user
 */
export const getTeams = async (req, res) => {
  const mappings = await UserRoleTeam.find({
    userId: req.user.id,
    status: "ACCEPTED",
  })
    .populate("teamId", "name title description createdAt")
    .lean();

  const teams = mappings.map((m) => ({
    ...m.teamId,
    role: m.role,
  }));

  res.json({ total: teams.length, teams });
};

/**
 * CREATE team (creator becomes ADMIN)
 */
export const createTeam = async (req, res) => {
  const { name, title, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Team name required" });
  }

  const team = await Team.create({
    name: name.trim(),
    title,
    description,
    adminId: req.user.id,
  });

  await UserRoleTeam.create({
    userId: req.user.id,
    teamId: team._id,
    role: ROLES.ADMIN,
    status: "ACCEPTED",
  });

  res.status(201).json(team);
};

/**
 * UPDATE team (ADMIN or MANAGER)
 * middleware: auth → teamContext → requireTeamRole([ADMIN, MANAGER])
 */
export const updateTeam = async (req, res) => {
  const { name, title, description } = req.body;

  const team = await Team.findByIdAndUpdate(
    req.teamContext.teamId,
    { name, title, description },
    { new: true }
  );

  res.json({ message: "Team updated", team });
};

/**
 * DELETE team (ADMIN only)
 */
export const deleteTeam = async (req, res) => {
  const teamId = req.teamContext.teamId;

  await Promise.all([
    Team.findByIdAndDelete(teamId),
    UserRoleTeam.deleteMany({ teamId }),
  ]);

  res.json({ message: "Team deleted" });
};
