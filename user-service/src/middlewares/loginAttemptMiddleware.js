import User from "../database/models/User.js";
import { error } from "../utils/errorLogger.js";

export const checkLoginAttempts = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    error("User not found");
    throw new Error("User not found");
  }

  const maxAttempts = 3;
  const lockTime = 1 * 60 * 1000; // 1 minute lock after failed attempts

  // If user is locked out, check the lockUntil field
  if (user.lockUntil && user.lockUntil > Date.now()) {
    error("Account is locked out, try again after 1 minute");
    throw new Error("Account locked. Try again later");
  }

  if (user.failedLoginAttempts >= maxAttempts) {
    // Lock user for the specified duration
    user.lockUntil = Date.now() + lockTime;
    await user.save();
    error("Account locked due to too many failed attempts");
    throw new Error("Account locked due to too many failed attempts");
  }

  return user;
};
