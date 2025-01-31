import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  searchMessages,
  searchMedia,
  searchChat,
  searchGroup,
  searchChannel,
  searchUsers,
  getRecentSearchesController,
  getPopularSearchesController,
  deleteSearchHistory,
  filterMessages,
} from "../controllers/searchController.js";

const router = Router();

// Search through message history
router.get("/search-messages", authMiddleware, searchMessages);

// Search shared media files
router.get("/search-media", authMiddleware, searchMedia);

// Search messages in a specific chat
router.get("/search-chat", authMiddleware, searchChat);

// Search messages in a specific group
router.get("/search-group", authMiddleware, searchGroup);

// Search messages in a specific channel
router.get("/search-channel", authMiddleware, searchChannel);

// Search users in contact list
router.get("/seach-users", authMiddleware, searchUsers);

// Track and retrieve search history
router.get("/search-history/recent", authMiddleware, getRecentSearchesController);
router.get("/search-history/popular", authMiddleware, getPopularSearchesController);
router.delete("/search-history/:searchId", authMiddleware, deleteSearchHistory);

// Filter messages (unread/starred/media)
router.get("/filter-message", authMiddleware, filterMessages);

export default router;
