import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      default: null,
    },
    // globalRole applies across the app; team/project roles are stored on Team/Project documents
    globalRole: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
      index: true,
    },
    // optional profile metadata
    avatarUrl: { type: String, default: null },
    // denormalized quick-lookup (optional)
    teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
