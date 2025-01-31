import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  addMembers,
  getMembers,
  getGroupMessages,
  sendGroupMessage,
    getPolls,
    deleteMessage,
    deleteAllMessages,
    editMessage,
    leaveGroup,
    removeMember,
    createPoll,
    votePoll,
    deletePoll,
    unvotePoll,
    pinMessage,
    unpinMessage
} from "../controllers/groupChatController.js";

const router = Router();

// Create new group chat
router.post("/create-group", authMiddleware, createGroup);

// Update group settings/info
router.patch("/:groupId", authMiddleware, updateGroup);

// Delete entire group
router.delete("/:groupId", authMiddleware, deleteGroup);

// Add new members to group
router.post("/:groupId/members", authMiddleware, addMembers);

// Get all members in group
router.get("/:groupId/members", authMiddleware, getMembers);

// Get all messages in group
router.get("/:groupId/messages", authMiddleware, getGroupMessages);

// Send message to group
router.post("/:groupId/messages", authMiddleware, sendGroupMessage);

// Get all polls in group
router.get("/:groupId/polls", authMiddleware, getPolls);

// Delete a message from group
router.delete("/:groupId/messages/:messageId", authMiddleware, deleteMessage);

// Delete all messages in group
router.delete("/:groupId/messages", authMiddleware, deleteAllMessages);

// Edit message in group
router.patch("/:groupId/messages/:messageId", authMiddleware, editMessage);

// Leave group
router.delete("/:groupId/leave", authMiddleware, leaveGroup);

// Remove member from group
router.delete("/:groupId/members/:memberId", authMiddleware, removeMember);

// Create polls in group
router.post("/:groupId/polls", authMiddleware, createPoll);

// Cast vote on poll
router.post("/:groupId/polls/:pollId/vote", authMiddleware, votePoll);

// Delete poll
router.delete("/:groupId/polls/:pollId", authMiddleware, deletePoll);

// Unvote poll
router.delete("/:groupId/polls/:pollId/vote", authMiddleware, unvotePoll);

// Pin important messages
router.post("/:groupId/pin/:messageId", authMiddleware, pinMessage);

// Unpin messages
router.delete("/:groupId/pin/:messageId", authMiddleware, unpinMessage);

export default router;
