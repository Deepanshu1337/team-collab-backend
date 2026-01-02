import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createTeam } from "../controller/team.controller.js";

const router = express.Router();

// Create team (authenticated users only)
router.post("/", authMiddleware, createTeam);

export default router;
