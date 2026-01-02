import express from "express";
import cors from "cors";
import authMiddleware from "./middleware/auth.middleware.js";
import roleMiddleware from "./middleware/role.middleware.js";
import { ROLES } from "./utils/constants.js";
import teamRoutes from "./routes/team.routes.js";
import teamMiddleware from "./middleware/team.middleware.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";






const app = express();

// -------------------- Core Middleware --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- Health Check --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "team-collab-api",
    message: "API is running",
  });
});

// Temporary protected route (for testing only)
app.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user,
  });
});

// Temporary role-protected route (ADMIN only)
app.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  (req, res) => {
    res.status(200).json({
      message: "Admin access granted",
      user: req.user,
    });
  }
);
// Temporary team-scoped route
app.get(
  "/team-scope-test",
  authMiddleware,
  teamMiddleware,
  (req, res) => {
    res.status(200).json({
      message: "Team scope verified",
      teamId: req.user.teamId,
    });
  }
);

app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// -------------------- 404 Handler --------------------
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;
