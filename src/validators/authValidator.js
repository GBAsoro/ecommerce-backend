const Joi = require("joi");

// Register validation schema
exports.registerSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
    }),
    email: Joi.string().email().lowercase().trim().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "string.empty": "Please confirm your password",
      }),
    phone: Joi.string().trim().optional(),
    role: Joi.string().valid("user", "admin").default("user"),
  }),
};

// Login validation schema
exports.loginSchema = {
  body: Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  }),
};

// Forgot password validation schema
exports.forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email",
    }),
  }),
};

// Reset password validation schema
exports.resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "string.empty": "Please confirm your password",
      }),
  }),
  params: Joi.object({
    token: Joi.string().required(),
  }),
};

// Change password validation schema
exports.changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": "Current password is required",
    }),
    newPassword: Joi.string().min(6).required().messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "string.empty": "Please confirm your new password",
      }),
  }),
};
