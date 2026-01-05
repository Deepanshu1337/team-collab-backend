import rateLimit from "express-rate-limit";
import env from "../config/env.js";

// Fallback defaults (safe)
const WINDOW_MINUTES = Number(env.rateLimitWindowMinutes) || 15;
const MAX_REQUESTS = Number(env.rateLimitMaxReq) || 500;

const apiLimiter = rateLimit({
  windowMs: WINDOW_MINUTES * 60 * 1000, // minutes → ms
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;
