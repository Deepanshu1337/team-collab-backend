import mongoose from "mongoose";

const assistantLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    command: {
      type: String,
      required: true,
    },
    intentType: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AssistantLog", assistantLogSchema);
