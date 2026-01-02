import Team from "../models/Team.model.js";
import User from "../models/User.model.js";

// GET teams: admin sees all, users see only theirs
export const getTeams = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.globalRole === "ADMIN";

    let query = { isActive: true };

    if (!isAdmin) {
      // Non-admin users see only teams they're members of
      query["members.user"] = userId;
    }

    const teams = await Team.find(query)
      .select("name description createdBy members projectIds isActive")
      .populate("members.user", "name email")
      .populate("createdBy", "name email")
      .lean();

    res.json(teams);
  } catch (e) {
    console.error("Error fetching teams", e);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

// GET specific team by ID
export const getTeamById = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.globalRole === "ADMIN";
    const teamId = req.params.id;

    const team = await Team.findById(teamId)
      .populate("members.user", "name email _id")
      .populate("createdBy", "name email")
      .populate("projectIds", "name");

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check access: admin can see all, others can see only if they're members
    if (!isAdmin) {
      const isMember = team.members.some((m) => m.user && m.user._id.equals(userId));
      if (!isMember) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    res.json(team);
  } catch (e) {
    console.error("Error fetching team", e);
    res.status(500).json({ error: "Failed to fetch team" });
  }
};

// GET all members for a team
export const getTeamMembers = async (req, res) => {
  try {
    const teamId = req.params.teamId || req.params.id;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const team = await Team.findById(teamId).populate('members.user', 'name email _id').lean();
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const isAdmin = req.user && req.user.globalRole === 'ADMIN';

    // Non-admins can only fetch members for teams they belong to
    if (!isAdmin) {
      const isMember = team.members.some((m) => {
        if (m.user && m.user._id) {
          return String(m.user._id) === String(req.user._id);
        }
        // allow invited email to match current user's email if available
        return m.email && req.user.email && m.email.toLowerCase() === req.user.email.toLowerCase();
      });

      if (!isMember) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const members = team.members.map((m) => ({
      id: m.user ? m.user._id : null,
      name: m.user ? m.user.name : null,
      email: m.email || (m.user ? m.user.email : null),
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
    }));

    return res.json({ teamId: team._id, name: team.name, members });
  } catch (e) {
    console.error('Error fetching team members', e);
    return res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

// CREATE team (admin only)
export const createTeam = async (req, res) => {
  try {
    if (req.user.globalRole !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can create teams" });
    }

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const newTeam = new Team({
      name: name.trim(),
      description: description || null,
      createdBy: req.user._id,
      members: [],
      projectIds: [],
      isActive: true,
    });

    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (e) {
    console.error("Error creating team", e);
    res.status(500).json({ error: "Failed to create team" });
  }
};

// INVITE team member by email (admin only)
export const inviteTeamMember = async (req, res) => {
  try {
    if (req.user.globalRole !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can invite members" });
    }

    const { teamId } = req.params;
    const { email, role } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if already invited/member
    const existingMember = team.members.find(
      (m) => m.email === email.toLowerCase() || (m.user && m.user.equals(email))
    );

    if (existingMember) {
      return res.status(400).json({ error: "User already in team" });
    }

    // Check if user exists in system
    const user = await User.findOne({ email: email.toLowerCase() });

    const newMember = {
      user: user ? user._id : null,
      email: email.toLowerCase(),
      role: role || "MEMBER",
      status: user ? "ACCEPTED" : "INVITED",
    };

    team.members.push(newMember);
    await team.save();

    res.status(201).json({
      message: "Member invited successfully",
      team: await team.populate("members.user", "name email"),
    });
  } catch (e) {
    console.error("Error inviting team member", e);
    res.status(500).json({ error: "Failed to invite member" });
  }
};

// ASSIGN role to team member (admin only)
export const changeTeamMemberRole = async (req, res) => {
  try {
    if (req.user.globalRole !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can assign managers" });
    }

    const { teamId, memberId } = req.params;
    const { role } = req.body; // "MANAGER" or "MEMBER"

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const member = team.members.find((m) => m.user && m.user.equals(memberId));
    if (!member) {
      return res.status(404).json({ error: "Member not found in team" });
    }

    // Update role
    member.role = role || "MEMBER";
    member.status = "ACCEPTED"; // Mark as accepted when assigning role

    await team.save();

    res.json({
      message: "Manager assigned successfully",
      team: await team.populate("members.user", "name email"),
    });
  } catch (e) {
    console.error("Error assigning manager", e);
    res.status(500).json({ error: "Failed to assign manager" });
  }
};





