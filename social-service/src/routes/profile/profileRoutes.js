import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { validatePagination } from "../../middlewares/validationMiddleware.js";
import {
  getUserProfile,
  getUserPosts,
  getUserReels,
  getUserSavedPosts,
  getUserSavedReels,
  getUserStats,
} from "../../controllers/profile/profileController.js";

const router = express.Router();

// Get user profile details
router.get("/:userId", authMiddleware, getUserProfile);

// Get user's posts with pagination
router.get("/:userId/posts", authMiddleware, validatePagination, getUserPosts);

// Get user's reels with pagination
router.get("/:userId/reels", authMiddleware, validatePagination, getUserReels);

// Get user's saved posts with pagination
router.get(
  "/:userId/saved/posts",
  authMiddleware,
  validatePagination,
  getUserSavedPosts
);

// Get user's saved reels with pagination
router.get(
  "/:userId/saved/reels",
  authMiddleware,
  validatePagination,
  getUserSavedReels
);

// Get user stats (post count, followers count, etc.)
router.get("/:userId/stats", authMiddleware, getUserStats);

export default router;
