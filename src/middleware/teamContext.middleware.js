// middleware/teamContext.middleware.js
import UserRoleTeam from "../models/UserRoleTeam.model.js";

const teamContext = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.teamId;

    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    const membership = await UserRoleTeam.findOne({
      userId: req.user.id,
      teamId,
      status: "ACCEPTED",
      role: { $in: ["ADMIN", "MANAGER"] },
    }).lean();

    if (!membership) {
      return res.status(403).json({ message: "You don't have access to create a team" });
    }

    req.teamContext = {
      teamId,
      role: membership.role,
    };

    next();
  } catch (err) {
    console.error("Team context error", err);
    res.status(500).json({ message: "Failed to resolve team context" });
  }
};

export default teamContext;
