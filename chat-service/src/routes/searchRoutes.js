import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Search through message history
router.get("/messages", authMiddleware, searchMessages);

// Search shared media files
router.get("/media", authMiddleware, searchMedia);

// Search messages in a specific chat
router.get("/chat", authMiddleware, searchChat);

// Search messages in a specific group
router.get("/group", authMiddleware, searchGroup);

// Search messages in a specific channel
router.get("/channel", authMiddleware, searchChannel);

// Search users in contact list
router.get("/users", authMiddleware, searchUsers);

// Get all starred messages
router.get("/starred", authMiddleware, getStarredMessages);

// Filter messages (unread/starred/media)
router.get("/filter", authMiddleware, filterMessages);

export default router;
