import pino from "pino";

const nodeEnv = process.env.NODE_ENV || "development";

const logger = pino({
  level: nodeEnv === "production" ? "info" : "debug",
  transport:
    nodeEnv !== "production"
      ? { target: "pino-pretty" }
      : undefined,
});

export default logger;