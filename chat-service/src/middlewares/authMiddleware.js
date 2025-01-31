// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../database/models/User.js";
import logger from "../utils/logger.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Set the user object with consistent property names
    req.user = {
      _id: user._id, // MongoDB ID
      id: user._id.toString(), // String ID for consistency
      role: decoded.role,
      username: user.username,
      email: user.email,
    };

    logger.debug("Authenticated user:", {
      userId: req.user.id,
      role: req.user.role,
    });

    next();
  } catch (err) {
    logger.error("Authentication Error:", err);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Role-based authorization middleware
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
