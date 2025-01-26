import jwt from "jsonwebtoken";
import { error } from "../../../user-service/src/utils/errorLogger.js";

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
    console.log("Decoded token:", decoded); // Add debug log

    // Set the user object correctly
    req.user = {
      id: decoded.userId, // Make sure this matches the payload from login service
      role: decoded.role,
    };
    console.log("req.user:", req.user); // Add debug log

    next();
  } catch (err) {
    error(`Authentication Error: ${err.message}`);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Optional middleware for specific roles
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
