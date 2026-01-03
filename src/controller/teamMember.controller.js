import User from "../models/User.model.js";
import admin from "../config/firebase.js";
import UserRoleTeam from "../models/UserRoleTeam.model.js";
import { ROLES } from "../utils/constants.js";


const DEFAULT_PASSWORD = "Welcome@123";

/**
 * INVITE user to team
 * ADMIN only
 */
export const inviteToTeam = async (req, res) => {
  try {
    const { email, role = ROLES.MEMBER } = req.body;
    const teamId = req.teamContext.teamId;

    if (![ROLES.MEMBER, ROLES.MANAGER].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Enforce single MANAGER per team
    if (role === ROLES.MANAGER) {
      const exists = await UserRoleTeam.findOne({
        teamId,
        role: ROLES.MANAGER,
        status: "ACCEPTED",
      });

      if (exists) {
        return res.status(400).json({
          message: "Team already has a MANAGER",
        });
      }
    }

    // Check MongoDB user
    let user = await User.findOne({ email });

    // If user does NOT exist → create Firebase + DB user
    if (!user) {
      const firebaseUser = await admin.auth().createUser({
        email,
        password: DEFAULT_PASSWORD, // 🔐 demo password
        emailVerified: true,         // demo shortcut
      });

      user = await User.create({
        firebaseUid: firebaseUser.uid,
        email,
        name: email.split("@")[0],
        role: ROLES.MEMBER,
      });
    }

    // Prevent duplicate mapping
    const existsMapping = await UserRoleTeam.findOne({
      userId: user._id,
      teamId,
    });

    if (existsMapping) {
      return res.status(400).json({
        message: "User already part of this team",
      });
    }

    // Create mapping with ACCEPTED status
    await UserRoleTeam.create({
      userId: user._id,
      teamId,
      role,
      status: "ACCEPTED", // ✅ auto-accepted
      invitedBy: req.user.id,
    });

    res.status(201).json({
      message: "User added to team (demo mode)",
      credentials: {
        email,
        password: DEFAULT_PASSWORD, // 👈 demo convenience
      },
      role,
    });
  } catch (error) {
    console.error("Invite error", error);
    res.status(500).json({ message: "Failed to invite user" });
  }
};

/**
 * GET team members
 */
export const getTeamMembers = async (req, res) => {
  const members = await UserRoleTeam.find({
    teamId: req.teamContext.teamId,
  })
    .populate("userId", "name email")
    .lean();

  res.json(
    members.map((m) => ({
      id: m.userId?._id,
      name: m.userId?.name,
      email: m.userId?.email,
      role: m.role,
      status: m.status,
    }))
  );
};
