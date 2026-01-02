import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow("", null),
  projectId: Joi.string().required(),
  assignedTo: Joi.string().allow(null),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3),
  description: Joi.string().allow("", null),
  status: Joi.string().valid("todo", "in-progress", "done"),
  assignedTo: Joi.string().allow(null),
});
