import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Block user from sending messages/viewing status
router.post("/block/:userId", authMiddleware, blockUser);

// Unblock user 
router.post("/block/:userId", authMiddleware, unblockUser);

// Report abusive/spam users
router.post("/report/:userId", authMiddleware, reportUser);

// Update last seen privacy (everyone/contacts/nobody)
router.patch("/last-seen", authMiddleware, updateLastSeenSettings);

// Archive/hide chats from main list
router.patch("/chat/:chatId/archive", authMiddleware, archiveChat);

// Unarchive chats
router.patch("/chat/:chatId/unarchive", authMiddleware, unarchiveChat);

// Mute/unmute chats
router.patch("/chat/:chatId/mute", authMiddleware, muteChat);

// Toggle end-to-end encryption for chats
router.patch("/encryption/status", authMiddleware, toggleEncryption);

// Update typing indicator status
router.post("/typing/:conversationId", authMiddleware, updateTypingStatus);

// Get user's online/offline status
router.get("/online/status", authMiddleware, getOnlineStatus);

// Update user's status message
router.patch("/status/update", authMiddleware, updateUserStatus);

export default router;
