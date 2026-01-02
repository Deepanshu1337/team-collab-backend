import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    email: { type: String, default: null }, // for invite flow before user joins
    role: { type: String, enum: ["MANAGER", "MEMBER"], default: "MEMBER" },
    status: { type: String, enum: ["INVITED", "ACCEPTED"], default: "INVITED" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // members array: a user can appear in many teams
    members: { type: [teamMemberSchema], default: [] },
    // projects associated with this team (a project can be linked to multiple teams)
    projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);



export default mongoose.model("Team", teamSchema);
