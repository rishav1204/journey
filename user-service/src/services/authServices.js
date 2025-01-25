import dotenv from "dotenv";
import User from "../database/models/User.js";
import OTP from "../database/models/Otp.js";
import { generateToken } from "../utils/tokenUtils.js";
import hashUtils from "../utils/hash.js";  // Import the default export as `hashUtils`
import { sendOTPPasswordReset } from "./otpServices.js";
import { error } from "../utils/errorLogger.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
const { hashPassword, comparePassword } = hashUtils;// Destructure the functions from the default export
dotenv.config();

// Sign up a new user
export const signUpService = async (userData) => {
  const { email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = new User({ ...userData, password: hashedPassword });
  await newUser.save();

  return { message: "Sign-up successful", userId: newUser._id };
};

// Log in a user
export const loginService = async ({ email, password, deviceInfo }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Please sign up first");
  }

  if (!user.password || !password) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (isPasswordValid) {
    // Create device entry
    const deviceEntry = {
      deviceId: deviceInfo.deviceId || `${Date.now()}-${Math.random()}`,
      deviceType: deviceInfo.deviceType || "Web",
      lastUsed: new Date(),
    };

    // Update user with login info and new device
    await User.findByIdAndUpdate(user._id, {
      $inc: { loginAttempts: 1 },
      $set: {
        lastActive: new Date(),
      },
      $addToSet: { devices: deviceEntry }, // Uses $addToSet to avoid duplicates
    });

    const token = generateToken({ userId: user._id, role: user.role });
    return { message: "Login successful", token };
  } else {
    await User.findByIdAndUpdate(user._id, {
      $inc: { failedLoginAttempts: 1 },
      $set: { lastFailedLogin: new Date() },
    });

    throw new Error("Invalid credentials");
  }
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


export const resetPasswordService = async ({ email, otp, newPassword }) => {
  // Verify OTP
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    throw new Error("Invalid OTP");
  }

  if (otpRecord.expiresAt < Date.now()) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error("OTP expired");
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user's password
  await User.findOneAndUpdate({ email }, { password: hashedPassword });

  // Delete used OTP
  await OTP.deleteOne({ _id: otpRecord._id });

  return { message: "Password reset successful" };
};

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

const generateSecurePassword = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: clientId,
      maxExpiry: 3600, // 1 hour
    });

    const payload = ticket.getPayload();
    console.log("Token payload:", payload); // Add this for debugging

    return payload;
  } catch (error) {
    console.log("Token verification error:", error); // Add this for debugging
    throw new Error("Invalid Google token");
  }
};

// Social login
export const socialLoginService = async ({ provider, token }) => {
  const socialProfile = await verifyGoogleToken(token);

  let user = await User.findOne({ email: socialProfile.email });

  if (!user) {
    user = new User({
      email: socialProfile.email,
      username: generateUsername(socialProfile.email),
      firstName: socialProfile.email.split("@")[0],
      lastName: "",
      password: generateSecurePassword(),
      isVerified: true,
      accountStatus: "Active", // Using correct enum value
      authProvider: [
        {
          provider: "google", // Using correct enum value
          isConnected: true,
          lastLogin: new Date(),
        },
      ],
      role: "user",
      socialAuth: {
        google: {
          id: socialProfile.sub,
          email: socialProfile.email,
        },
      },
      privacySettings: {
        isProfilePublic: true,
        showEmail: false,
        showPhoneNumber: false,
      },
    });
  } else {
    // Update existing user
    user.lastActive = new Date();
    user.authProvider = [
      {
        provider: "google",
        isConnected: true,
        lastLogin: new Date(),
      },
    ];
  }

  const savedUser = await user.save();

  const authToken = generateToken({
    userId: savedUser._id,
    role: savedUser.role,
    provider: "google",
  });

  return {
    success: true,
    message: "Google login successful",
    token: authToken,
    user: {
      id: savedUser._id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      isVerified: savedUser.isVerified,
    },
  };
};



// Helper function to generate username from email
const generateUsername = (email) => {
  return email.split("@")[0] + Math.random().toString(36).substring(2, 5);
};

export const logoutService = async (user, token) => {
  try {
    if (!user || !token) {
      throw new Error("Invalid request: Missing user or token information.");
    }

    // Invalidate the token by adding it to a blacklist
    await addToTokenBlacklist(token);
    await User.findByIdAndUpdate(user._id, {
      "socialAuth.google.accessToken": null,
      "socialAuth.facebook.accessToken": null,
    });

    return { message: "Logout successful" };
  } catch (err) {
    error(`Error during logout for user ${user?._id || "unknown"}: ${err}`);
    throw new Error("Logout failed. Please try again.");
  }
};

export const forgotPasswordService = async ({ email }) => {
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Send OTP for password reset
  await sendOTPPasswordReset(email);

  return {
    message: "Password reset OTP sent successfully",
    email: email,
  };
};
