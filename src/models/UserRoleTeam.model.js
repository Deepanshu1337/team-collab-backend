// models/UserRoleTeam.model.js
import mongoose from "mongoose";
import { ROLES } from "../utils/constants.js";

const userRoleTeamSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["INVITED", "ACCEPTED"],
      default: "INVITED",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// 🔒 Prevent duplicate membership
userRoleTeamSchema.index({ userId: 1, teamId: 1 }, { unique: true });

export default mongoose.model("UserRoleTeam", userRoleTeamSchema);
