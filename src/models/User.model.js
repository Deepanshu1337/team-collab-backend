import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  firebaseUid: {
    type: String,
    unique: true
  },

  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'MEMBER'],
    required: true
  },

  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },

  pendingInvites: [{
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'MEMBER']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
