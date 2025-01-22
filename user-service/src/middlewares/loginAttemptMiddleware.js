import User from "../database/models/User.js";

export const checkLoginAttempts = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const maxAttempts = 3;
  const lockTime = 1 * 60 * 1000; // 1 minute lock after failed attempts

  // If user is locked out, check the lockUntil field
  if (user.lockUntil && user.lockUntil > Date.now()) {
    throw new Error("Account locked. Try again later");
  }

  if (user.failedLoginAttempts >= maxAttempts) {
    // Lock user for the specified duration
    user.lockUntil = Date.now() + lockTime;
    await user.save();
    throw new Error("Account locked due to too many failed attempts");
  }

  return user;
};
