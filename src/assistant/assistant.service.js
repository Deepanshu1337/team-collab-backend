import { parseCommand } from "./assistant.parser.js";
import { Task } from "../models/index.js";
import { AssistantLog } from "../models/index.js";

const assertPermission = (intentType, userRole) => {
  const permissionMap = {
    MOVE_TASK: [ROLES.ADMIN, ROLES.MANAGER],
    ASSIGN_TASK: [ROLES.ADMIN, ROLES.MANAGER],
    CREATE_TASK: [ROLES.ADMIN, ROLES.MANAGER],
  };

  const allowedRoles = permissionMap[intentType];

  if (!allowedRoles) {
    return; // Unknown intent handled elsewhere
  }

  if (!allowedRoles.includes(userRole)) {
    const error = new Error("You are not allowed to perform this action");
    error.statusCode = 403;
    throw error;
  }
};

export const processAssistantCommand = async ({ command, user }) => {
  const intent = parseCommand(command);

  try {
    // 🔒 Permission check
    assertPermission(intent.type, user.role);

    let result;

    switch (intent.type) {
      case "MOVE_TASK":
        result = await moveTask(intent, user);
        break;

      case "ASSIGN_TASK":
        result = await assignTask(intent, user);
        break;

      default:
        result = {
          message: "Sorry, I couldn't understand that command yet.",
        };
    }

    // ✅ Log success (non-blocking)
    AssistantLog.create({
      userId: user.id,
      teamId: user.teamId,
      command,
      intentType: intent.type,
      success: true,
    }).catch(() => {});

    return result;
  } catch (error) {
    // ❌ Log failure (non-blocking)
    AssistantLog.create({
      userId: user.id,
      teamId: user.teamId,
      command,
      intentType: intent.type || "UNKNOWN",
      success: false,
      errorMessage: error.message,
    }).catch(() => {});

    throw error;
  }
};




// -------- Actions --------

const moveTask = async (intent, user) => {
  const { taskTitle, status } = intent;

  const task = await Task.findOne({
    title: new RegExp(`^${taskTitle}$`, "i"),
    teamId: user.teamId,
  });

  if (!task) {
    throw new Error(`Task "${taskTitle}" not found`);
  }

  task.status = status;
  await task.save();

  return {
    message: `Task "${taskTitle}" moved to ${status}`,
  };
};

const assignTask = async (intent, user) => {
  return {
    message: "Assign task intent detected (implementation next)",
  };
};
