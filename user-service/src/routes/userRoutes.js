import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  createPreferences,
  updatePreferences,
  uploadOrEditProfilePic,
  deleteProfilePic,
  updatePrivacySettings,
  getFollowers,
  getFollowing,
  deactivateAccount,
  deleteAccount,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { uploadProfilePic, handleMulterError } from "../middlewares/upload.js";
import { validatePreferences } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Get user profile
router.get("/profile", authenticate, getUserProfile); // View user profile

// Update user profile (including bio, location, etc.)
router.put("/profile", authenticate, updateUserProfile); // Update profile info

router.post(
  "/preferences",
  authenticate,
  validatePreferences,
  createPreferences
);

// Update user preferences (e.g., travel style, budget, etc.)
router.put("/preferences", authenticate, updatePreferences); // Update preferences

// Upload or edit profile picture
router.post(
  "/profile-pic",
  authenticate, // Add authentication middleware first
  uploadProfilePic,
  handleMulterError,
  uploadOrEditProfilePic
);

// Delete profile picture
router.delete('/profile-pic', authenticate, deleteProfilePic);

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
