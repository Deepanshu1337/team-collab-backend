import mongoose from "mongoose";
import logger from "./logger.js";
import env from "./env.js";


const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info("✅ MongoDB connected");
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
