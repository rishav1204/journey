import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  updatePreferences,
  uploadProfilePic,
  updatePrivacySettings,
  getFollowers,
  getFollowing,
  deactivateAccount,
  deleteAccount,
} from "../controllers/userController.js";
import { authenticate, authorizeUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user profile
router.get("/profile", authenticate, getUserProfile); // View user profile

// Update user profile (including bio, location, etc.)
router.put("/profile", authenticate, updateUserProfile); // Update profile info

// Update user preferences (e.g., travel style, budget, etc.)
router.put("/preferences", authenticate, updatePreferences); // Update preferences

// Upload profile picture
router.put("/profile/picture", authenticate, uploadProfilePic); // Upload new profile picture

// Update privacy settings (e.g., make profile public/private)
router.put("/profile/privacy", authenticate, updatePrivacySettings); // Update privacy settings

// Get followers and following lists
router.get("/followers", authenticate, getFollowers); // View list of followers
router.get("/following", authenticate, getFollowing); // View list of following

// Account deactivation (User only)
router.post("/deactivate", authenticate, deactivateAccount); // Deactivate user account

// Account deletion (User only)
router.delete("/delete", authenticate, deleteAccount); // Delete user account

export default router;
