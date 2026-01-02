import express from "express";
import cors from "cors";

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
    message: "API is running"
  });
});

// -------------------- 404 Handler --------------------
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

export default app;
