import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Create one-way broadcast channel
router.post("/create-channel", authMiddleware, createChannel);

// Get channel details
router.get("/:channelId", authMiddleware, getChannel);

// Update channel details
router.put("/:channelId", authMiddleware, updateChannel);

// Delete channel
router.delete("/:channelId", authMiddleware, deleteChannel);

// Get available channels
router.get("/list-channels", authMiddleware, listChannels);

// Get channel messages
router.get("/:channelId/messages", authMiddleware, getChannelMessages);

// Send message to channel
router.post("/:channelId/messages", authMiddleware, sendMessage);

// Get channel members
router.get("/:channelId/members", authMiddleware, getChannelMembers);

// Add member to channel
router.post("/:channelId/members", authMiddleware, addMember);

// Remove member from channel
router.delete("/:channelId/members", authMiddleware, removeMember);

// Leave channel
router.delete("/:channelId/leave", authMiddleware, leaveChannel);

// Subscribe to channel updates
router.post("/:channelId/subscribe", authMiddleware, subscribeToChannel);

// Send broadcast message to channel
router.post("/:channelId/broadcast", authMiddleware, broadcastMessage);

// Create status note (like Instagram)
router.post("/notes/create", authMiddleware, createNote);

// Get all visible notes
router.get("/notes", authMiddleware, getNotes);

// Remove posted note
router.delete("/notes/:noteId", authMiddleware, deleteNote);

export default router;
