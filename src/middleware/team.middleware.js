const teamMiddleware = (req, res, next) => {
  // Auth middleware must run before this
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthenticated",
    });
  }

  // User must belong to a team
  if (!req.user.teamId) {
    return res.status(403).json({
      message: "User does not belong to any team",
    });
  }

  next();
};

export default teamMiddleware;
