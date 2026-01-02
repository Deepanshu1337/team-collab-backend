import { ROLES } from "../utils/constants.js";

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    // Safety check (auth middleware should have run)
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthenticated",
      });
    }

    // Role check
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};

export default roleMiddleware;
