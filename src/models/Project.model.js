import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // role inside the project context — e.g., manager or member
    role: { type: String, enum: ["MANAGER", "MEMBER"], default: "MEMBER" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // manager field: single user ID for project manager
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // teams this project belongs to (projects can be associated with multiple teams)
    teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    members: { type: [projectMemberSchema], default: [] },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export default mongoose.model("Project", projectSchema);

