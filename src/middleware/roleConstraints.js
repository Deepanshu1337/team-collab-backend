// utils/roleConstraints.js
import UserRoleTeam from "../models/UserRoleTeam.model.js";

export const assertSingleRolePerTeam = async (teamId, role) => {
  if (!["ADMIN", "MANAGER"].includes(role)) return;

  const exists = await UserRoleTeam.findOne({
    teamId,
    role,
    status: "ACCEPTED",
  });

  if (exists) {
    throw Object.assign(
      new Error(`Team already has a ${role}`),
      { statusCode: 400 }
    );
  }
};
