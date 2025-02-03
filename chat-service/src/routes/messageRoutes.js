import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  sendDirectMessage,
  getDirectMessages,
  getConversations,
  reactToMessage,
  removeReaction,
  getMessageReactions,
  replyToThread,
  starMessage,
  getStarredMessages,
  updateMessageStatus,
  sendDisappearingMessage,
  mentionUser,
  editMessage,
  deleteMessage,
  deleteConversation,
  sendMessageRequest,
  getMessageRequests,
  acceptMessageRequest,
  rejectMessageRequest,
  scheduleMessage,
  getScheduledMessages,
  cancelScheduledMessage,
  updateScheduledMessage
} from "../controllers/messageController.js";

const router = Router();

// Direct messaging between two users
router.post("/direct/:userId", authMiddleware, sendDirectMessage);

// Get all messages between two users
router.get("/direct/:userId", authMiddleware, getDirectMessages);

// Get all conversations for logged-in user
router.get("/conversations", authMiddleware, getConversations);

// React to a message with emoji
router.post("/:messageId/react", authMiddleware, reactToMessage);

// Remove reaction from a message
router.delete("/:messageId/react", authMiddleware, removeReaction);

// Get all reactions to a message
router.get("/:messageId/reactions", authMiddleware, getMessageReactions);

// Create a thread/reply to specific message
router.post("/:messageId/reply", authMiddleware, replyToThread);

// Star/unstar important messages
router.post("/:messageId/star", authMiddleware, starMessage);

// Get all starred messages
router.get("/starred", authMiddleware, getStarredMessages);

// Update message status (sent, delivered, read)
router.patch("/:messageId/status", authMiddleware, updateMessageStatus);

// Send messages that disappear after viewing/time
router.post("/disappearing", authMiddleware, sendDisappearingMessage);

// Mention/tag users in messages
router.post("/mentions", authMiddleware, mentionUser);

// Edit message content
router.put("/:messageId", authMiddleware, editMessage);

// Delete message
router.delete("/:messageId", authMiddleware, deleteMessage);

// Delete all messages in a conversation
router.delete("/conversations/:userId", authMiddleware, deleteConversation);

// Message request system for non-followers
router.post("/requests/send", authMiddleware, sendMessageRequest);
router.get("/message-requests", authMiddleware, getMessageRequests);
router.patch(
  "/requests/:requestId/accept",
  authMiddleware,
  acceptMessageRequest
);
router.patch(
  "/requests/:requestId/reject",
  authMiddleware,
  rejectMessageRequest
);

// Schedule messages for future delivery
router.post("/schedule-message", authMiddleware, scheduleMessage);
router.get("/get-scheduled-messages", authMiddleware, getScheduledMessages);
router.patch("/scheduled/:messageId", authMiddleware, updateScheduledMessage);
router.delete("/scheduled/:messageId", authMiddleware, cancelScheduledMessage);

export default router;
