import Joi from "joi";

export const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Project name is required",
    "string.min": "Project name must be at least 1 character",
    "string.max": "Project name must not exceed 100 characters",
  }),
  description: Joi.string().trim().max(500).allow("", null).optional(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional().messages({
    "string.min": "Project name must be at least 1 character",
    "string.max": "Project name must not exceed 100 characters",
  }),
  description: Joi.string().trim().max(500).allow("", null).optional(),
});

