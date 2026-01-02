import express from "express";
import  authMiddleware from "../middleware/auth.middleware.js";
import {
  getAdminDashboard,
  getManagerDashboard,
  getMemberDashboard,
} from "../controller/dashboard.controller.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get dashboard stats based on user role
router.get("/admin", getAdminDashboard);
router.get("/manager", getManagerDashboard);
router.get("/member", getMemberDashboard);


export default router;
