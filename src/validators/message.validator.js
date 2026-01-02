import Joi from "joi";

export const createMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Message content is required",
    "string.min": "Message cannot be empty",
    "string.max": "Message must not exceed 1000 characters",
  }),
});

