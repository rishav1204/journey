import User from "../database/models/User.js";
import { generateToken } from "../utils/tokenUtils.js";
import hashUtils from "../utils/hash.js";  // Import the default export as `hashUtils`
import { sendEmail } from "../services/emailServices.js";
const { hashPassword, comparePassword } = hashUtils;  // Destructure the functions from the default export

// Sign up a new user
export const signUpService = async (userData) => {
  const { email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = new User({ ...userData, password: hashedPassword });
  await newUser.save();

  return { message: "Sign-up successful", userId: newUser._id };
};

// Log in a user
export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password"); // Add .select('+password') to include the password field
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password || !password) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({ userId: user._id, role: user.role });
  return { message: "Login successful", token };
};



// Admin Sign-Up
export const adminSignUpService = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("Admin already exists");
  }

  const hashedPassword = await hashPassword(userData.password);
  const adminData = {
    ...userData,
    password: hashedPassword,
    role: "admin", // Automatically set role to admin
  };

  const newAdmin = new User(adminData);
  await newAdmin.save();

  return { message: "Admin sign-up successful", userId: newAdmin._id };
};

// Admin Login
export const adminLoginService = async ({ email, password }) => {
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || user.role !== "admin") {
    throw new Error("Admin not found or invalid credentials");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({ userId: user._id, role: user.role });
  return { message: "Admin login successful", token };
};


// Reset password
export const resetPasswordService = async ({ email }) => {
  const user = await User.findOne({ email: email }); // Extract email from the object
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = generateToken({ userId: user._id }, "1h");
  await sendEmail(
    email,
    "Password Reset",
    `Your reset token is: ${resetToken}`
  );

  return { message: "Password reset email sent" };
};


// Verify email
export const verifyEmailService = async (token) => {
  const { userId } = verifyToken(token);
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Invalid token or user not found");
  }

  user.isVerified = true;
  await user.save();

  return { message: "Email verified successfully" };
};

// Social login
export const socialLoginService = async ({ provider, token }) => {
  const userData = verifySocialToken(provider, token); // Assume verifySocialToken validates and retrieves user info

  let user = await User.findOne({ email: userData.email });
  if (!user) {
    user = new User({
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isVerified: true, // Assume social accounts are verified
    });
    await user.save();
  }

  const authToken = generateToken({ userId: user._id, role: user.role });
  return { message: "Social login successful", token: authToken };
};

export const logoutService = async (user, token) => {
  try {
    if (!user || !token) {
      throw new Error("Invalid request: Missing user or token information.");
    }

    // Invalidate the token by adding it to a blacklist
    await addToTokenBlacklist(token);

    // Log the event
    info(`User with ID: ${user._id} has successfully logged out.`);

    return { message: "Logout successful" };
  } catch (err) {
    error(`Error during logout for user ${user?._id || "unknown"}: ${err}`);
    throw new Error("Logout failed. Please try again.");
  }
};
