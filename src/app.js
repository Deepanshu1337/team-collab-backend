import express from "express";
import apiLimiter from "./middleware/rateLimit.middleware.js";
import cors from "cors";
import { ROLES } from "./utils/constants.js";
import helmet from "helmet";


import authMiddleware from "./middleware/auth.middleware.js";
import roleMiddleware from "./middleware/role.middleware.js";
import teamMiddleware from "./middleware/team.middleware.js";

import teamRoutes from "./routes/team.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import messageRoutes from "./routes/message.routes.js";
// import assistantRoutes from "./routes/assistant.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import errorHandler from "./middleware/error.middleware.js";

const app = express();

// -------------------- Core Middleware --------------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);


// Protected route - returns current user info
app.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user,
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
// app.use("/api/assistant", assistantRoutes);

// -------------------- 404 Handler --------------------
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
