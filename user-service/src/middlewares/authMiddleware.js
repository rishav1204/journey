import jwt from "jsonwebtoken";
import { error } from "../utils/errorLogger.js"; // For logging errors
import User from "../database/models/User.js"; // Assuming you have a User model

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from the authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // If there's no token
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure your secret key is stored securely

    // Find user based on decoded token's user ID
    const user = await User.findById(decoded.userId);

    // If user doesn't exist or token is invalid
    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Attach user to the request object (for access in route handlers)
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    error(err); // Log the error using your error logger
    return res.status(401).json({ message: "Authentication failed." });
  }
};
