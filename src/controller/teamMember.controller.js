import User from "../models/User.model.js";
import { ROLES } from "../utils/constants.js";
import cache from "../utils/cache.js";

export const getTeamMembers = async (req, res) => {
  const teamId = req.teamContext.teamId;
  
  const cacheKey = `team_members_${teamId}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return res.json(cachedResult);
  }
  
  // Only return users who are actually in the team (have teamId set)
  const users = await User.find({ teamId })
    .select("_id name email role createdAt")
    .lean();
  const members = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    joinedAt: u.createdAt,
  }));
  
  // Cache for 5 minutes
  cache.set(cacheKey, members, 300);
  
  res.json(members);
};

// New function to get pending invitations for a team
export const getPendingInvitations = async (req, res) => {
  const teamId = req.teamContext.teamId;
  
  const cacheKey = `pending_invites_${teamId}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return res.json(cachedResult);
  }
  
  // Find all users who have pending invitations for this team
  const users = await User.find({
    "pendingInvites": {
      $elemMatch: {
        teamId: teamId,
        status: "pending"
      }
    }
  }).select("_id name email pendingInvites").lean();
  
  // Extract invitation details for this team
  const pendingInvites = users.flatMap(user => {
    return user.pendingInvites
      .filter(invite => String(invite.teamId) === String(teamId) && invite.status === 'pending')
      .map(invite => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: invite.role,
        invitedAt: user.createdAt
      }));
  });
  
  // Cache for 5 minutes
  cache.set(cacheKey, pendingInvites, 300);
  
  res.json(pendingInvites);
};

// Function for user to accept team invitation
export const acceptTeamInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.body;
    
    // Find the pending invitation for this user and team
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const inviteIndex = user.pendingInvites.findIndex(invite => 
      String(invite.teamId) === String(teamId) && invite.status === 'pending'
    );
    
    if (inviteIndex === -1) {
      return res.status(404).json({ message: "No pending invitation found for this team" });
    }
    
    // Get the role from the invitation
    const invitation = user.pendingInvites[inviteIndex];
    
    // Update the user: set teamId and role, and update invitation status
    user.teamId = teamId;
    user.role = invitation.role;
    user.pendingInvites[inviteIndex].status = 'accepted';
    
    await user.save();
    
    // Clear related caches
    const teamMembersCacheKey = `team_members_${teamId}`;
    const pendingInvitesCacheKey = `pending_invites_${teamId}`;
    cache.delete(teamMembersCacheKey);
    cache.delete(pendingInvitesCacheKey);
    
    res.json({ message: "Team invitation accepted successfully" });
  } catch (error) {
    console.error("Error accepting team invitation:", error);
    res.status(500).json({ message: "Error accepting team invitation" });
  }
};

// Function for user to reject team invitation
export const rejectTeamInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.body;
    
    // Find the pending invitation for this user and team
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const inviteIndex = user.pendingInvites.findIndex(invite => 
      String(invite.teamId) === String(teamId) && invite.status === 'pending'
    );
    
    if (inviteIndex === -1) {
      return res.status(404).json({ message: "No pending invitation found for this team" });
    }
    
    // Update invitation status to rejected
    user.pendingInvites[inviteIndex].status = 'rejected';
    await user.save();
    
    res.json({ message: "Team invitation rejected successfully" });
  } catch (error) {
    console.error("Error rejecting team invitation:", error);
    res.status(500).json({ message: "Error rejecting team invitation" });
  }
};

export const inviteToTeam = async (req, res) => {
  const teamId = req.teamContext.teamId;
  const { email, role } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }
  // Only MANAGER or MEMBER can be invited; default to MEMBER
  const targetRole = [ROLES.MANAGER, ROLES.MEMBER].includes(role)
    ? role
    : ROLES.MEMBER;

  if (targetRole === ROLES.MANAGER) {
    const existingManager = await User.findOne({ teamId, role: ROLES.MANAGER });
    if (existingManager) {
      return res
        .status(400)
        .json({ message: "Manager already assigned for this team" });
    }
  }

  let user = await User.findOne({ email });
  if (!user) {
    // Create user with a properly formatted temporary firebaseUid to avoid the null unique constraint issue
    // Use a unique temporary identifier for invited users
    const tempFirebaseUid = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    user = await User.create({
      email,
      name: email.split("@")[0],
      firebaseUid: tempFirebaseUid, // Use temporary unique firebaseUid
      role: "MEMBER", // Default role for invited users
      pendingInvites: [{ teamId, role: targetRole, status: 'pending' }]
    });
  } else {
    // Add pending invitation to existing user
    await User.updateOne(
      { _id: user._id },
      { $push: { pendingInvites: { teamId, role: targetRole, status: 'pending' } } }
    );
  }

  // Clear related caches
  const pendingInvitesCacheKey = `pending_invites_${teamId}`;
  cache.delete(pendingInvitesCacheKey);
  
  res.status(201).json({ message: "Invitation sent", userId: user._id });
};

export const assignManager = async (req, res) => {
  const teamId = req.teamContext.teamId;
  const { memberId } = req.params;
  const { role } = req.body; // 'MANAGER' or 'MEMBER'

  if (role === ROLES.MANAGER) {
    const existingManager = await User.findOne({ teamId, role: ROLES.MANAGER });
    if (existingManager && String(existingManager._id) !== String(memberId)) {
      return res
        .status(400)
        .json({ message: "Manager already assigned for this team" });
    }
  }

  const user = await User.findOne({ _id: memberId, teamId });
  if (!user) {
    return res.status(404).json({ message: "User not found in this team" });
  }

  user.role = role === ROLES.MANAGER ? ROLES.MANAGER : ROLES.MEMBER;
  await user.save();
  
  // Clear related caches
  const teamMembersCacheKey = `team_members_${teamId}`;
  cache.delete(teamMembersCacheKey);
  
  res.json({ message: "Role updated", userId: user._id, role: user.role });
};

// Function to get all available users (not in the current team)
export const getAvailableUsers = async (req, res) => {
  const teamId = req.teamContext.teamId;
  
  try {
    // Get all users that are not in the current team and don't have a pending invitation to this team
    const availableUsers = await User.find({
      $and: [
        { teamId: { $ne: teamId } }, // Not in this team
        { teamId: { $ne: null } }, // But already have a team (existing users)
        {
          pendingInvites: {
            $not: {
              $elemMatch: {
                teamId: teamId,
                status: "pending"
              }
            }
          }
        }
      ]
    }).select("_id name email role teamId").lean();
    
    // Get users that are not in any team (existing users)
    const usersWithoutTeam = await User.find({
      $and: [
        { teamId: null }, // No team assigned
        {
          pendingInvites: {
            $not: {
              $elemMatch: {
                teamId: teamId,
                status: "pending"
              }
            }
          }
        }
      ]
    }).select("_id name email role teamId").lean();
    
    // Combine both results
    const allAvailableUsers = [...availableUsers, ...usersWithoutTeam];
    
    res.json(allAvailableUsers);
  } catch (error) {
    console.error("Error fetching available users:", error);
    res.status(500).json({ message: "Error fetching available users" });
  }
};

// Function to get pending invitations for the current user
export const removeMemberFromTeam = async (req, res) => {
  try {
    const teamId = req.teamContext.teamId;
    const { memberId } = req.params;
    
    // Find the user to remove
    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if trying to remove admin (should not be allowed)
    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: "Cannot remove admin from team" });
    }
    
    // Check if trying to remove the only manager
    if (user.role === 'MANAGER') {
      const teamMembers = await User.find({ teamId });
      const managerCount = teamMembers.filter(m => m.role === 'MANAGER').length;
      
      if (managerCount <= 1) {
        return res.status(400).json({ message: "Cannot remove the only manager. Assign a new manager first." });
      }
    }
    
    // Remove the teamId from the user, effectively removing them from the team
    user.teamId = null;
    await user.save();
    
    // Clear related caches
    const teamMembersCacheKey = `team_members_${teamId}`;
    cache.delete(teamMembersCacheKey);
    
    res.json({ message: "Member removed from team successfully" });
  } catch (error) {
    console.error("Error removing member from team:", error);
    res.status(500).json({ message: "Error removing member from team" });
  }
};

export const getPendingInvitationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user with pending invitations
    const user = await User.findById(userId).populate('pendingInvites.teamId', 'name adminId').lean();
    
    if (!user || !user.pendingInvites || user.pendingInvites.length === 0) {
      return res.json([]);
    }
    
    // Filter only pending invitations
    const pendingInvites = user.pendingInvites.filter(invite => invite.status === 'pending');
    
    // Get admin information for each team
    const result = [];
    for (const invite of pendingInvites) {
      if (invite.teamId) { // Make sure team exists
        // Find the admin user for this team
        const adminUser = await User.findById(invite.teamId.adminId).select('name email').lean();
        
        result.push({
          teamId: invite.teamId._id,
          teamName: invite.teamId.name,
          adminName: adminUser ? adminUser.name : 'Unknown Admin',
          adminEmail: adminUser ? adminUser.email : 'Unknown',
          role: invite.role,
          invitedAt: invite.createdAt || Date.now()
        });
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching pending invitations for user:", error);
    res.status(500).json({ message: "Error fetching pending invitations" });
  }
};
