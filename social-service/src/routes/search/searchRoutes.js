import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { validateSearch } from "../../middlewares/validationMiddleware.js";
import {
  searchUsers,
  searchPosts,
  searchReels,
  searchByLocation,
  searchByTags,
} from "../../controllers/search/searchController.js";

const router = express.Router();

// Search users
router.get("/users", authMiddleware, validateSearch, searchUsers);

// Search posts
router.get("/posts", authMiddleware, validateSearch, searchPosts);

// Search reels
router.get("/reels", authMiddleware, validateSearch, searchReels);

// Search by location
router.get("/location", authMiddleware, validateSearch, searchByLocation);

// Search by tags
router.get("/tags", authMiddleware, validateSearch, searchByTags);

export default router;
