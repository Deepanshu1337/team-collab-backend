import { ROLES } from "../utils/constants.js";
import User from "../models/User.model.js";
const roleMiddleware = (allowedRoles = []) => {
  return  async (req, res, next) => {
    // Safety check (auth middleware should have run)
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthenticated",
      });
    }

 const user = await User.findById(req.user.id).lean();
    if (!allowedRoles.includes(userRole.role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient role",
      });
    }

    next();
  };
};

export default roleMiddleware;
