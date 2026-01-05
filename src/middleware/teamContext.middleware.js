// middleware/teamContext.middleware.js
import Team from "../models/Team.model.js";

const teamContext = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.teamId;
    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    let role = req.user.role;

    if (req.user.teamId && req.user.teamId === String(teamId)) {
      req.teamContext = { teamId, role };
      return next();
    }

    const team = await Team.findById(teamId).lean();
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (String(team.adminId) === req.user.id) {
      role = "ADMIN";
      req.teamContext = { teamId, role };
      return next();
    }

    return res.status(403).json({ message: "Forbidden: not a member of this team" });
  } catch (err) {
    console.error("Team context error", err);
    res.status(500).json({ message: "Failed to resolve team context" });
  }
};

export default teamContext;
