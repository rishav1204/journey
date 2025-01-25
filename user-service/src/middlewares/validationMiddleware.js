import Joi from "joi";
import { body, validationResult } from "express-validator";

// 1. Sign-up validation
export const validateSignUp = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .max(30)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/) // Regex for strong password
      .required(),
    confirmPassword: Joi.ref("password"), // Ensures confirmPassword matches password
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    error(error.message);
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

// 2. Login validation
export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    error(error.message);
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

// 3. Admin Sign-up validation
export const validateAdminSignUp = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .max(30)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      .required(),
    confirmPassword: Joi.ref("password"),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    // Remove the role validation since it will be set automatically
  });

  const { error } = schema.validate(req.body);

  if (error) {
    error(error.message);
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};


// 4. Admin Login validation
export const validateAdminLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    error(error.message);
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

// 5. Reset Password validation
// 5. Reset Password validation
export const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string()
      .min(8)
      .max(30)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    error(error.message);
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};


// 6. Social Login validation
export const validateSocialLogin = [
  body("provider")
    .notEmpty()
    .withMessage("Provider is required")
    .isIn(["google", "facebook"])
    .withMessage("Invalid provider"),

  body("token").notEmpty().withMessage("Token is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];


export const validateEmail = (req, res, next) => {
  const { email } = req.body;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Simple email regex
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  next();
};

export const validatePreferences = (req, res, next) => {
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== "object") {
    error(error.message);
    return res.status(400).json({
      success: false,
      message: "Preferences object is required",
    });
  }

  const requiredFields = [
    "transportation",
    "budget",
    "accommodation",
    "activityType",
  ];
  const missingFields = requiredFields.filter((field) => !preferences[field]);

  if (missingFields.length > 0) {
    error(error.message);
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  next();
};