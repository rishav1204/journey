import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    updateTheme,
    updateNickname,
    updateBio,
    updateProfilePicture,
    setAutoReply,
    toggleNotifications,
    syncDevice,
    toggleAIReplies
} from "../controllers/userSettingsController.js";

const router = Router();

// Update chat theme/colors
router.patch("/update-theme", authMiddleware, updateTheme);

// Set custom nickname for users
router.patch("/update-nickname", authMiddleware, updateNickname);

// Update user bio/about
router.patch("/update-bio", authMiddleware, updateBio);

// Update user profile picture
router.patch("/update-profile-picture", authMiddleware, updateProfilePicture);

// Configure automatic replies
router.patch("/update-auto-reply", authMiddleware, setAutoReply);

// Enable/disable notifications
router.patch("/notifications/toggle", authMiddleware, toggleNotifications);

// Sync chat across devices
router.post("/device/sync", authMiddleware, syncDevice);

// Enable/disable AI-powered smart replies
router.post("/ai-replies/toggle", authMiddleware, toggleAIReplies);

export default router;
