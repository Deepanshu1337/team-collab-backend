// middleware/requireTeamRole.middleware.js
const requireTeamRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.teamContext) {
      return res.status(500).json({
        message: "Team context not initialized",
      });
    }

    if (!allowedRoles.includes(req.teamContext.role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient team permissions",
      });
    }

    next();
  };
};

export default requireTeamRole;
